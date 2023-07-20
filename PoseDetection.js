require('@tensorflow/tfjs-core');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
require('@tensorflow/tfjs-converter');
const posenet = require('@tensorflow-models/posenet');

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

    this.videoElement = videoElement;
    this.videoParentElement = videoParentElement;

    this.isDetecting = true;
    this.stopVideoPoseDetection = false;
    console.log("Start Pose Detection clicked");

    this.model = await posenet.load();
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
    console.log(poses); 
    this.removeKeypoints();

    for (const pose of poses) {
      for (const keypoint of pose.keypoints) {
        if (keypoint.score > 0.2) {
          const keypointEl = document.createElement('div');
          keypointEl.setAttribute('class', 'keypoint');
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
