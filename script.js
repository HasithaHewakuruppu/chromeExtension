require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');

let isDetecting = false; // Check whether the object detection is running
let stopVideoObjectDetection = false; // Flag to stop the object detection loop
let children = []; // Store references to the highlighted elements

chrome.runtime.onMessage.addListener(async function(message) {

  const [videoElement, videoParentElement] = getVideoElementAndParent(message.srcUrl)
  if (message.action === "startObjectDetection") {
      if (!isDetecting) {
          isDetecting = true;
          stopVideoObjectDetection = false; // Reset the stop flag
          console.log("Start Detection clicked");
          await setupVideoObjectDetection(videoElement,videoParentElement); // Start object detection
      }
  } else if (message.action === "stopObjectDetection") {
      if (isDetecting) {
          isDetecting = false;
          stopVideoObjectDetection = true; // Set the stop flag
          console.log("Stop Detection clicked");
          removeHighlightedElements(videoParentElement); // Remove highlighted elements when stopping
      }
  }
});

async function setupVideoObjectDetection(videoElement,videoParentElement) {
    try {
        const model = await cocoSsd.load();
        videoParentElement.classList.add("videoView");
        predictObjectDetection(model, videoParentElement, videoElement);

    } catch (err) {
        console.error('Error loading the model:', err);
    }
}

function predictObjectDetection(model, videoContainer, video) {
    if (stopVideoObjectDetection) {
        // If stopVideoObjectDetection is true, exit the loop and stop object detection
        isDetecting = false;
        stopVideoObjectDetection = false;
        return;
    }

    //Start classifying a frame in the video.
    model.detect(video).then(function(predictions) {
        removeHighlightedElements(videoContainer); // Remove the previous highlighted elements
        children = [];

        // Loop through predictions and draw them to the live view if
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
            window.requestAnimationFrame(() => predictObjectDetection(model, videoContainer, video));
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

function getVideoElementAndParent(videoSrcUrl) {
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
    return [videoElement,videoParentElement];
}
