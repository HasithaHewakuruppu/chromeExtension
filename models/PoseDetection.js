import * as posenet from '@tensorflow-models/posenet';
import { drawKeypoints, drawSkeleton, drawBoundingBox } from '../utils/utilities';
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

    this.predictPoseDetection();
  }

  stopPoseDetection() {
    if (!this.isDetecting) return;
    this.isDetecting = false;
    // Cleanup matter.js related objects
    Matter.World.clear(this.engine.world);
    Matter.Engine.clear(this.engine);
    Matter.Runner.stop(this.runner);
  }

  async predictPoseDetection() {
    // Clear the world
    Matter.World.clear(this.engine.world, false);

    if (!this.isDetecting) return;

    const poses = await this.model.estimateMultiplePoses(this.videoElement);
    
    for (const pose of poses) {
      drawKeypoints(pose.keypoints, 0.2, this.renderer.context);
      drawSkeleton(pose.keypoints, 0.2, this.renderer.context);
      drawBoundingBox(pose.keypoints, this.renderer.context);
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
          fillStyle: 'red'
        }
      });
  
      Matter.World.add(this.engine.world, body);
    }
  }
  
}

module.exports = PoseDetection;
