const Matter = require('matter-js');

class BallPitEffect {
  constructor() {
    this.isBallPit = false;
    this.videoElement = null;
    this.videoParentElement = null;
    this.canvas = null;
    this.aspect = {
      width: null,
      height: null,
    };
    this.engine = null;
    this.world = null;
    this.mouseConstraint = null;
    this.boundaries = [];
    this.balls = [];
    this.renderer = null;
  }

  startBallPit(videoElement, videoParentElement) {
    if (this.isBallPit) return;

    this.videoElement = videoElement;
    this.videoParentElement = videoParentElement;
    this.aspect = {
      width: this.videoElement.offsetWidth,
      height: this.videoElement.offsetHeight,
    };

    this.isBallPit = true;
    console.log("Start Ball Pit");

    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "9998";
    canvas.width = this.videoElement.offsetWidth;
    canvas.height = this.videoElement.offsetHeight;

    this.canvas = canvas;
    this.canvas.className = 'ball-pit-canvas';
    // Append the canvas to the same parent element as the video
    this.videoParentElement.appendChild(this.canvas);

    // Initialize physics engine, world, and components
    this.initializeEngine();
    this.initializeWorld();
    this.initializeMouseConstraint();
    this.initializeBoundaries();
    this.initializeBalls();
    this.initializeRenderer();

    // Run the engine
    this.runEngine();
  }

  stopBallPit() {
    if (!this.isBallPit) return;

    this.isBallPit = false;
    console.log("Stop Ball Pit");
    
    // Remove the canvas from the DOM and reset state
    if (this.canvas) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }

    // Cleanup matter.js related objects
    Matter.World.clear(this.engine.world);
    Matter.Engine.clear(this.engine);
  }

  initializeEngine() {
    this.engine = Matter.Engine.create();
  }

  initializeWorld() {
    this.world = this.engine.world;
  }

  initializeMouseConstraint() {
    this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
      mouse: Matter.Mouse.create(this.canvas)
    });
    Matter.World.add(this.world, this.mouseConstraint);
  }

  initializeBoundaries() {
    this.boundaries.push(
      Matter.Bodies.rectangle(this.aspect.width / 2, -50, this.aspect.width, 100, { isStatic: true }),
      Matter.Bodies.rectangle(this.aspect.width / 2, this.aspect.height + 50, this.aspect.width, 100, { isStatic: true }),
      Matter.Bodies.rectangle(-50, this.aspect.height / 2, 100, this.aspect.height, { isStatic: true }),
      Matter.Bodies.rectangle(this.aspect.width + 50, this.aspect.height / 2, 100, this.aspect.height, { isStatic: true })
    );
    Matter.World.add(this.world, this.boundaries);
  }

  initializeBalls() {
    for(let i=0; i<50; i++) {
      let radius = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
      let x = Math.floor(Math.random() * ((this.aspect.width - radius) - radius + 1)) + radius;
      let y = Math.floor(Math.random() * ((this.aspect.height - radius) - radius + 1)) + radius;
      let ball = Matter.Bodies.circle(x, y, radius);
      this.balls.push(ball);
    }
    Matter.World.add(this.world, this.balls);
  }

  initializeRenderer() {
    this.renderer = Matter.Render.create({
      element: this.videoParentElement,
      engine: this.engine,
      options: {
        width: this.aspect.width,
        height: this.aspect.height,
        background: 'transparent',
        wireframes: false
      }
    });
    this.renderer.canvas.style.position = 'absolute';
    this.renderer.canvas.style.top = '0';
    this.renderer.canvas.style.left = '0';
    this.renderer.canvas.style.zIndex = '9999';
  }

  runEngine() {
    Matter.Runner.run(this.engine);
    Matter.Render.run(this.renderer);
  }
}

module.exports = BallPitEffect;
