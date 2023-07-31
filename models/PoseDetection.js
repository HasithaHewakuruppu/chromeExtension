import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import * as posenet from '@tensorflow-models/posenet';
import {
  drawKeypoints,
  drawSkeleton,
  drawBoundingBox,
} from '../utilities'; // Importing the drawing utility functions

class PoseDetection {
  constructor() {
    this.isDetecting = false;
    this.stopVideoPoseDetection = false;
    this.keypoints = [];
    this.model = null;
    this.videoElement = null;
    this.videoParentElement = null;
  }

  async startPoseDetection(videoElement, videoParentElement) {
    if (this.isDetecting) return;

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    videoElement.width = videoWidth;  
    videoElement.height = videoHeight;

    this.videoElement = videoElement;
    this.videoParentElement = videoParentElement;

    this.isDetecting = true;
    this.stopVideoPoseDetection = false;
    console.log("Start Pose Detection clicked");

    // Get the resolution of the video element

    this.model = await posenet.load({
      inputResolution: { width: videoWidth, height: videoHeight },
      scale: 1
    });
    this.videoParentElement.classList.add("videoView");
    this.predictPoseDetection();
  }

  stopPoseDetection() {
    if (!this.isDetecting) return;
    this.isDetecting = false;
    this.stopVideoPoseDetection = true;
    console.log("Stop Pose Detection clicked");

  }

  async predictPoseDetection() {
    if (this.stopVideoPoseDetection) {
      this.isDetecting = false;
      this.stopVideoPoseDetection = false;
      return;
    }
  
    // Estimate poses from the video element.
    const poses = await this.model.estimateMultiplePoses(this.videoElement);
  
    const canvas = document.createElement('canvas');
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "9999";
    canvas.width = this.videoElement.width;
    canvas.height = this.videoElement.height;
    const ctx = canvas.getContext('2d');
  
    // Draw the pose on the transparent canvas
    for (const pose of poses) {
      drawKeypoints(pose.keypoints, 0.2, ctx); // Draw keypoints on the canvas
      drawSkeleton(pose.keypoints, 0.2, ctx); // Draw skeleton on the canvas
      drawBoundingBox(pose.keypoints, ctx); // Draw bounding box on the canvas
    }
  
    const existingCanvas = this.videoParentElement.querySelector('.canvas-overlay');
     if (existingCanvas) {
      this.videoParentElement.removeChild(existingCanvas);
     }

     canvas.classList.add('canvas-overlay');
     this.videoParentElement.appendChild(canvas);
   
    if (this.isDetecting) {
      window.requestAnimationFrame(() => this.predictPoseDetection());
    }
  }
  
}

module.exports = PoseDetection;
