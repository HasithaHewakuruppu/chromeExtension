import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import * as posenet from '@tensorflow-models/posenet';

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
      scale: 0.8
    });
    this.videoParentElement.classList.add("videoView");
    this.predictPoseDetection();
  }

  stopPoseDetection() {
    if (!this.isDetecting) return;
    this.isDetecting = false;
    this.stopVideoPoseDetection = true;
    console.log("Stop Pose Detection clicked");
    this.removeKeypoints();
  }

  async predictPoseDetection() {
    if (this.stopVideoPoseDetection) {
      this.isDetecting = false;
      this.stopVideoPoseDetection = false;
      return;
    }

    // Estimate poses from the video element.
    const poses = await this.model.estimateMultiplePoses(this.videoElement);
    this.removeKeypoints();

    for (const pose of poses) {
      for (const keypoint of pose.keypoints) {
        if (keypoint.score > 0.2) {
          const keypointEl = document.createElement("div");
          keypointEl.setAttribute("class", "keypoint");
          keypointEl.style = `left: ${keypoint.position.x}px; top: ${keypoint.position.y}px;`;

          this.videoParentElement.appendChild(keypointEl);
          this.keypoints.push(keypointEl);
        }
      }
    }

    if (this.isDetecting) {
      window.requestAnimationFrame(() => this.predictPoseDetection());
    }
  }

  removeKeypoints() {
    for (const keypointEl of this.keypoints) {
      this.videoParentElement.removeChild(keypointEl);
    }
    this.keypoints = [];
  }
}

module.exports = PoseDetection;
