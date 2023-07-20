require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');

// Content script

let isDetecting = false; // Track whether the object detection is running
let stopWebcamObjectDetection = false; // Flag to stop the object detection loop
let children = []; // Store references to the highlighted elements

chrome.runtime.onMessage.addListener(async function(message) {

  const videoSrcUrl = message.srcUrl;
  if (!videoSrcUrl) {
    console.log("Error: No video URL found.");
    return;
  }
  
  // Access the video element directly using the Blob URL
  const videoElement = document.querySelector(`video[src="${videoSrcUrl}"]`);
  if (!videoElement) {
    console.log("Error: Video element not found.");
    return;
  }
  
  // Access the parent element of the video
  const videoParentElement = videoElement.parentElement;
  console.log("Parent element: ", videoParentElement);
  console.log("Video element: ", videoElement);

  if (message.action === "startDetection") {
      if (!isDetecting) {
          isDetecting = true;
          stopWebcamObjectDetection = false; // Reset the stop flag
          console.log("Start Detection clicked");
          await setupWebcamObjectDetection(videoElement,videoParentElement); // Start object detection
      }
  } else if (message.action === "stopDetection") {
      if (isDetecting) {
          isDetecting = false;
          stopWebcamObjectDetection = true; // Set the stop flag
          console.log("Stop Detection clicked");
          removeHighlightedElements(videoParentElement); // Remove highlighted elements when stopping
      }
  }

});

async function setupWebcamObjectDetection(videoElement,videoParentElement) {
    try {
        const model = await cocoSsd.load();
        videoParentElement.classList.add("camView");
        predictWebcam(model, videoParentElement, videoElement);

    } catch (err) {
        console.error('Error loading the model:', err);
    }
}

function predictWebcam(model, videoContainer, video) {
    if (stopWebcamObjectDetection) {
        // If stopWebcamObjectDetection is true, exit the loop and stop object detection
        isDetecting = false;
        stopWebcamObjectDetection = false;
        return;
    }

    // Now let's start classifying a frame in the video.
    model.detect(video).then(function(predictions) {
        removeHighlightedElements(videoContainer); // Remove the previous highlighted elements
        children = [];

        // Now let's loop through predictions and draw them to the live view if
        // they have a high confidence score and are classified as "person".
        for (let n = 0; n < predictions.length; n++) {
            if (predictions[n].class === 'person' && predictions[n].score > 0.01) {
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

                videoContainer.appendChild(highlighter);
                videoContainer.appendChild(p);
                children.push(highlighter);
                children.push(p);
            }
        }

        // Check if object detection is still running
        if (isDetecting) {
            // Call this function again to keep predicting when the browser is ready.
            window.requestAnimationFrame(() => predictWebcam(model, videoContainer, video));
        }
    });
}

function removeHighlightedElements(videoContainer) {
    // Remove the highlighted bounding boxes and text elements
    for (let i = 0; i < children.length; i++) {
        videoContainer.removeChild(children[i]);
    }
    children = [];
}
