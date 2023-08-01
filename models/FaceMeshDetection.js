import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import '@mediapipe/face_mesh';
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import FaceMeshThreeJS from "../utils/FaceMeshThreeJS";

class FaceMeshDetection {

  constructor() {
    this.isDetecting = false;
    this.stopVideoFaceMeshDetection = false;
    this.model = null;
    this.videoElement = null;
    this.videoParentElement = null;
    this.faceMeshThreeJS = null;
  }

  async startFaceMeshDetection(videoElement, videoParentElement) {
    if (this.isDetecting) return;

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    videoElement.width = videoWidth;
    videoElement.height = videoHeight;

    this.videoElement = videoElement;
    this.videoParentElement = videoParentElement;

    this.faceMeshThreeJS = new FaceMeshThreeJS(this.videoElement, this.videoParentElement);
 
    this.isDetecting = true;
    this.stopVideoFaceMeshDetection = false;
    console.log("Start FaceMesh Detection clicked");

    this.model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);

    this.videoParentElement.classList.add("videoView");
    this.predictFaceMeshDetection();
  }

  stopFaceMeshDetection() {
    if (!this.isDetecting) return;
    this.isDetecting = false;
    this.stopVideoFaceMeshDetection = true;
    console.log("Stop FaceMesh Detection clicked");
    this.faceMeshThreeJS.dispose();
  }

  async predictFaceMeshDetection() {

    if (this.stopVideoFaceMeshDetection) {
      this.isDetecting = false;
      this.stopVideoFaceMeshDetection = false;
      return;
    }

    const faces = await this.model.estimateFaces({input:this.videoElement});
    // console.log(faces);

    this.faceMeshThreeJS.drawMesh(faces);
   
    if (this.isDetecting) {
      window.requestAnimationFrame(() => this.predictFaceMeshDetection());
    }

  }
}

module.exports = FaceMeshDetection;
