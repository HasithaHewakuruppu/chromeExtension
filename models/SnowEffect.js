import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class SnowEffect {
  constructor() {
    this.isSnowing = false;
    this.videoElement = null;
    this.videoParentElement = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.orbitControls = null;
    this.points = null;
    this.clock = null;
    this.geometry = null;
    this.particleTexture = null;
    this.canvas = null;
    this.aspect = {
      width: null,
      height: null,
    };     
  }

  startSnowing(videoElement, videoParentElement) {
    if (this.isSnowing) return;

    this.videoElement = videoElement;
    this.videoParentElement = videoParentElement;
    this.aspect = {
      width: this.videoElement.offsetWidth,
      height: this.videoElement.offsetHeight,
    };   

    this.isSnowing = true;
    console.log("Start snowing");

    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "9999";
    canvas.width = this.videoElement.width;
    canvas.height = this.videoElement.height;

    this.canvas = canvas;
    this.canvas.className = 'snow-effect-canvas';
    // Append the canvas to the same parent element as the video
    this.videoParentElement.appendChild(this.canvas);

    this.initializeScene();
    this.initializeParticles();
    this.initializeCamera();
    this.initializeRenderer();
    this.initializeOrbitControls();
    this.initializeClock();
    this.animate();
  }

  stopSnowing() {
    if (!this.isSnowing) return;

    this.isSnowing = false;
    console.log("Stop snowing");
    
    // Remove the canvas from the DOM and reset state
    if (this.canvas) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
  }

  initializeScene() {
    this.scene = new THREE.Scene();
  }

  initializeParticles() {
    const textureLoader = new THREE.TextureLoader();
    this.particleTexture = textureLoader.load(chrome.runtime.getURL("images/alphaSnow.jpg"));


    this.geometry = new THREE.BufferGeometry();
    const verticesAmount = 10000;
    const positionArray = new Float32Array(verticesAmount * 3); //We Need 3000 slots
    for (let i = 0; i < verticesAmount * 3; i++) {
      positionArray[i] = (Math.random() - 0.5) * 4;
    }
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));
    const material = new THREE.PointsMaterial();
    material.size = 0.02;
    material.transparent = true;
    material.alphaMap = this.particleTexture;
    material.depthTest = false;
    this.points = new THREE.Points(this.geometry, material);
    this.scene.add(this.points);
  }

  initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.aspect.width / this.aspect.height,
      0.01,
      100
    );
    this.camera.position.z = 2;
    this.scene.add(this.camera);
  }

  initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.renderer.setSize(this.aspect.width, this.aspect.height);
  }

  initializeOrbitControls() {
    this.orbitControls = new OrbitControls(this.camera, this.canvas);
    this.orbitControls.enableDamping = true;
    this.orbitControls.enableZoom = false;
    this.orbitControls.enableRotate = false;
    this.orbitControls.autoRotate = true;
    this.orbitControls.autoRotateSpeed = 0.2;
  }

  initializeClock() {
    this.clock = new THREE.Clock();
  }

  animate() {
    const elapsedTime = this.clock.getElapsedTime();
  
    // Update snow particles position here
    const positions = this.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      // adjust this to control speed of fall
      positions[i + 1] -= 0.0015; 
  
      // create a slight horizontal drift 
      positions[i] += Math.sin(elapsedTime + positions[i]) * 0.001;
  
      // if particle is below the view frame, move it back to the top
      if (positions[i + 1] < -2) {
        positions[i + 1] = 2;
        positions[i] = (Math.random() - 0.5) * 4; // Reset horizontal position
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
  
    // Update Controls
    this.orbitControls.update();
  
    // Render
    this.renderer.render(this.scene, this.camera);
  
    // If snowing, continue to animate
    if (this.isSnowing) {
      window.requestAnimationFrame(this.animate.bind(this));
    }
  }
  
}

module.exports = SnowEffect;
