require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');

class ObjectDetection {
    constructor() {
      this.isDetecting = false;
      this.stopVideoObjectDetection = false;
      this.children = [];
      this.model = null;
      this.videoElement = null;
      this.videoParentElement = null;
    }
  
    async startObjectDetection(videoElement, videoParentElement) {
      if (this.isDetecting) return;
  
      this.videoElement = videoElement;
      this.videoParentElement = videoParentElement;
  
      this.isDetecting = true;
      this.stopVideoObjectDetection = false;
      console.log("Start Detection clicked");
  
      this.model = await cocoSsd.load();
      this.videoParentElement.classList.add("videoView");
      this.predictObjectDetection();
    }
  
    stopObjectDetection() {
      if (!this.isDetecting) return;
      this.isDetecting = false;
      this.stopVideoObjectDetection = true;
      console.log("Stop Detection clicked");
      this.removeHighlightedElements();
    }
  
    async predictObjectDetection() {
      if (this.stopVideoObjectDetection) {
        this.isDetecting = false;
        this.stopVideoObjectDetection = false;
        return;
      }
  
      // Start classifying a frame in the video.
      this.model.detect(this.videoElement).then(predictions => {
        this.removeHighlightedElements();
  
        for (const prediction of predictions) {
          if (prediction.class === 'person' && prediction.score > 0.01) {
            const p = document.createElement('p');
            p.innerText = prediction.class + ' - with ' +
              Math.round(parseFloat(prediction.score) * 100) +
              '% confidence.';
            p.style = `margin-left: ${prediction.bbox[0]}px; margin-top: ${prediction.bbox[1] - 10}px; width: ${prediction.bbox[2] - 10}px; top: 0; left: 0;`;
  
            const highlighter = document.createElement('div');
            highlighter.setAttribute('class', 'highlighter');
            highlighter.style = `left: ${prediction.bbox[0]}px; top: ${prediction.bbox[1]}px; width: ${prediction.bbox[2]}px; height: ${prediction.bbox[3]}px;`;
  
            this.videoParentElement.appendChild(highlighter);
            this.videoParentElement.appendChild(p);
            this.children.push(highlighter);
            this.children.push(p);
          }
        }
  
        if (this.isDetecting) {
          window.requestAnimationFrame(() => this.predictObjectDetection());
        }
      });
    }
  
    removeHighlightedElements() {
      for (const child of this.children) {
        this.videoParentElement.removeChild(child);
      }
      this.children = [];
    }
  }

  module.exports = ObjectDetection;