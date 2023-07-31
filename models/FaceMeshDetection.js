import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import '@mediapipe/face_mesh';
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { drawMesh } from "../utilities";

class FaceMeshDetection {
  constructor() {
    this.isDetecting = false;
    this.stopVideoFaceMeshDetection = false;
    this.model = null;
    this.videoElement = null;
    this.videoParentElement = null;
  }

  async startFaceMeshDetection(videoElement, videoParentElement) {
    if (this.isDetecting) return;

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    videoElement.width = videoWidth;
    videoElement.height = videoHeight;

    this.videoElement = videoElement;
    this.videoParentElement = videoParentElement;

    this.isDetecting = true;
    this.stopVideoFaceMeshDetection = false;
    console.log("Start FaceMesh Detection clicked");

    // Load the FaceMesh model
    this.model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);

    this.videoParentElement.classList.add("videoView");
    this.predictFaceMeshDetection();
  }

  stopFaceMeshDetection() {
    if (!this.isDetecting) return;
    this.isDetecting = false;
    this.stopVideoFaceMeshDetection = true;
    console.log("Stop FaceMesh Detection clicked");
  }

  async predictFaceMeshDetection() {
    if (this.stopVideoFaceMeshDetection) {
      this.isDetecting = false;
      this.stopVideoFaceMeshDetection = false;
      return;
    }

    // console.log(faceLandmarksDetection);
    const faces = await this.model.estimateFaces({input:this.videoElement});
    // console.log(faces);

    // const model = faceLandmarksDetection.SupportedPackages.mediapipeFacemesh;
    // const detectorConfig = {
    //  runtime: 'mediapipe',
    //  solutionPath: sol,
    // };
    // console.log(detectorConfig.solutionPath);
    // const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    // const estimationConfig = {flipHorizontal: false};
    // const faces = await detector.estimateFaces(image, estimationConfig);

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
    
    drawMesh(faces, ctx)
   
    const existingCanvas = this.videoParentElement.querySelector('.canvas-overlay');
    if (existingCanvas) {
      this.videoParentElement.removeChild(existingCanvas);
    }

    canvas.classList.add('canvas-overlay');
    this.videoParentElement.appendChild(canvas);

    if (this.isDetecting) {
      window.requestAnimationFrame(() => this.predictFaceMeshDetection());
    }
  }
}

module.exports = FaceMeshDetection;
