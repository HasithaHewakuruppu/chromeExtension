require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');

// Define the predictWebcam function based on the provided code
function predictWebcam(model, liveView, video, children) {
  // Now let's start classifying a frame in the video.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did from the previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);

    // Now let's loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class + ' - with ' +
          Math.round(parseFloat(predictions[n].score) * 100) +
          '% confidence.';
        p.style =
          'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: ' +
          (predictions[n].bbox[1] - 10) + 'px; width: ' +
          (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style =
          'left: ' + predictions[n].bbox[0] + 'px; top: ' +
          predictions[n].bbox[1] + 'px; width: ' +
          predictions[n].bbox[2] + 'px; height: ' +
          predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(() => predictWebcam(model, liveView, video, children));
  });
}

// Function to set up object detection on the webcam feed
async function setupWebcamObjectDetection() {
  try {
    // const videoElement = document.getElementById('webcam');
    const videoElement = document.querySelector(".video-stream.html5-main-video");

    // Load the pre-trained model. You need to replace 'path/to/model' with the actual model path or URL.
    const model = await cocoSsd.load();

    // Call the predictWebcam function to start object detection on each frame.
    // const liveView = document.getElementById('liveView');
    const liveView = document.querySelector(".html5-video-container");
    liveView.classList.add("camView");
    const children = [];
    predictWebcam(model, liveView, videoElement, children);
  } catch (err) {
    console.error('Error loading the model:', err);
  }
}

// Call the setupWebcamObjectDetection function when the content script is injected.
setupWebcamObjectDetection();


