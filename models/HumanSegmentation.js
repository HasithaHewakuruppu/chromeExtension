require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const bodyPix = require('@tensorflow-models/body-pix');

class HumanSegmentation {
  constructor() {
    this.isSegmenting = false;
    this.stopSegmentation = false;
    this.model = null;
    this.videoElement = null;
    this.videoParentElement = null;
    this.canvasElement = null;
  }

  async startHumanSegmentation(videoElement, videoParentElement) {
    if (this.isSegmenting) return;

    this.videoElement = videoElement;
    this.videoParentElement = videoParentElement;

    this.isSegmenting = true;
    this.stopSegmentation = false;
    console.log("Start Segmentation clicked");

    this.model = await bodyPix.load();

    // Create a new canvas and append it to the parent element
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;
    this.canvasElement.style.position = "absolute"; // Make sure the position is set to absolute
    this.canvasElement.style.zIndex = "999"; // Set zIndex to be above the video
    this.videoParentElement.appendChild(this.canvasElement);

    this.predictSegmentation();
  }

  stopHumanSegmentation() {
    if (!this.isSegmenting) return;
    this.isSegmenting = false;
    this.stopSegmentation = true;
    console.log("Stop Segmentation clicked");
    if (this.canvasElement) {
      this.videoParentElement.removeChild(this.canvasElement);
      this.canvasElement = null;
    }
  }

  async predictSegmentation() {
    if (this.stopSegmentation) {
      this.isSegmenting = false;
      this.stopSegmentation = false;
      return;
    }

    // Start segmenting the frame in the video.
    const segmentation = await this.model.segmentPerson(this.videoElement);
    const maskBackground = true;
    const backgroundDarkeningMask = bodyPix.toMask(segmentation, maskBackground);

    // Clear the previous frame's mask from the canvas
    const ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // Draw the segmentation mask on top of the video.
    bodyPix.drawMask(
      this.canvasElement,  // The canvas element to draw on
      this.videoElement,   // The original video element
      backgroundDarkeningMask,  // The mask
      0.7,  // An opacity from 0 to 1
      0,    // Mask blur radius
      maskBackground  // Whether to mask the background or the foreground
    );

    if (this.isSegmenting) {
      window.requestAnimationFrame(() => this.predictSegmentation());
    }
  }
}

module.exports = HumanSegmentation;
