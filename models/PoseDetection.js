import * as posenet from '@tensorflow-models/posenet';
import * as Matter from 'matter-js';

class PoseDetection {
  constructor() {
    this.isDetecting = false;
    this.model = null;
    this.videoElement = null;
    this.videoParentElement = null;
    this.engine = null;
    this.world = null;
    this.runner = null;
    this.renderer = null;
    this.balls = []; // Array to hold the balls
    this.ballsCategory = 0x0002;
    this.skeletonCategory = 0x0004;
    this.wallCategory = 0x0008;
  }

  async startPoseDetection(videoElement, videoParentElement) {
    if (this.isDetecting) return;
    this.isDetecting = true;

    this.videoElement = videoElement;
    this.videoParentElement = videoParentElement;

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    this.videoElement.width = videoWidth;
    this.videoElement.height = videoHeight;

    this.model = await posenet.load({
      inputResolution: { width: videoWidth, height: videoHeight },
      scale: 1
    });

    // Initialize physics engine
    this.engine = Matter.Engine.create();

    // Create world
    this.world = this.engine.world;

    // Create runner
    this.runner = Matter.Runner.create();

    // Create renderer
    this.renderer = Matter.Render.create({
      element: this.videoParentElement,
      engine: this.engine,
      options: {
        width: videoWidth,
        height: videoHeight,
        background: 'transparent',
        wireframes: false
      }
    });

    // Position and style the canvas
    this.renderer.canvas.style.position = "absolute";
    this.renderer.canvas.style.top = "0";
    this.renderer.canvas.style.left = "0";
    this.renderer.canvas.style.width = "100%";
    this.renderer.canvas.style.height = "100%";
    this.renderer.canvas.style.zIndex = "9999";

    // Run engine and renderer
    Matter.Runner.run(this.runner, this.engine);
    Matter.Render.run(this.renderer);

    // Create the balls
    for (let i = 0; i < 200; i++) {
      let ball = Matter.Bodies.circle(
        Math.random() * videoWidth, 
        Math.random() * videoHeight, 
        7, 
        {
          collisionFilter: {
            category: this.ballsCategory,
            mask: this.skeletonCategory | this.wallCategory | this.ballsCategory // Collide with skeleton and walls
          }
        }
      );
      this.balls.push(ball);
      Matter.World.add(this.engine.world, ball);
    }

    // Create the walls
    let floor = Matter.Bodies.rectangle(videoWidth / 2, videoHeight, videoWidth, 10, { 
      isStatic: true,
      render: { visible: false },
      collisionFilter: {
        category: this.wallCategory,
        mask: this.ballsCategory  // Only collide with balls
      },
    });
    let ceiling = Matter.Bodies.rectangle(videoWidth / 2, 0, videoWidth, 10, { 
      isStatic: true, 
      render: { visible: false },
      collisionFilter: {
        category: this.wallCategory,
        mask: this.ballsCategory  // Only collide with balls
      },
    });
    let leftWall = Matter.Bodies.rectangle(0, videoHeight / 2, 10, videoHeight, { 
      isStatic: true, 
      render: { visible: false },
      collisionFilter: {
        category: this.wallCategory,
        mask: this.ballsCategory  // Only collide with balls
      },
    });
    let rightWall = Matter.Bodies.rectangle(videoWidth, videoHeight / 2, 10, videoHeight, { 
      isStatic: true, 
      render: { visible: false },
      collisionFilter: {
        category: this.wallCategory,
        mask: this.ballsCategory  // Only collide with balls
      },
    });

    // Add the walls to the world
    Matter.World.add(this.engine.world, [floor, ceiling, leftWall, rightWall]);

    this.predictPoseDetection();
  }

  stopPoseDetection() {
    if (!this.isDetecting) return;
    this.isDetecting = false;
    // Cleanup matter.js related objects
    Matter.World.clear(this.engine.world, false); // Don't clear constraints and composites
    Matter.Engine.clear(this.engine);
    Matter.Runner.stop(this.runner);
  }

  async predictPoseDetection() {
    if (!this.isDetecting) return;

    const poses = await this.model.estimateMultiplePoses(this.videoElement);

    // Clear all bodies except for the balls and walls
    let bodiesToRemove = [];
    for (let body of this.engine.world.bodies) {
      if (!this.balls.includes(body) && body.collisionFilter.category !== this.wallCategory) {
        bodiesToRemove.push(body);
      }
    }
    Matter.World.remove(this.engine.world, bodiesToRemove);

    for (const pose of poses) {
      this.createBodies(pose);
    }

    if (this.isDetecting) {
      window.requestAnimationFrame(() => this.predictPoseDetection());
    }
  }

  createBodies(pose) {
    // Define pairs of keypoints that make up the limbs
    const limbs = [[5, 6], [6, 8], [8, 10], [5, 7], [7, 9], [5, 11], [11, 12], [12, 6], [12, 14], [14, 16], [11, 13], [13, 15]];
    for (const limb of limbs) {
        // Get keypoints
        const kp1 = pose.keypoints[limb[0]].position;
        const kp2 = pose.keypoints[limb[1]].position;

        // Calculate center, width (length of the limb), height (thickness of the limb), and angle
        const centerX = (kp1.x + kp2.x) / 2;
        const centerY = (kp1.y + kp2.y) / 2;
        const width = Math.sqrt((kp2.x - kp1.x) ** 2 + (kp2.y - kp1.y) ** 2);
        const height = 10;
        const angle = Math.atan2(kp2.y - kp1.y, kp2.x - kp1.x);

        let body = Matter.Bodies.rectangle(centerX, centerY, width, height, {
            angle: angle,
            render: {
                fillStyle: 'red',
                opacity: 0 
            },
            collisionFilter: {
              category: this.skeletonCategory,
              mask: this.ballsCategory // Only collide with balls
            }
        });
        Matter.World.add(this.engine.world, body);
    }
  }
}

module.exports = PoseDetection;
