require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');

// Content script

let isDetecting = false; // Track whether the object detection is running
let stopWebcamObjectDetection = false; // Flag to stop the object detection loop
let children = []; // Store references to the highlighted elements

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    if (message.action === "startDetection") {
        if (!isDetecting) {
            isDetecting = true;
            stopWebcamObjectDetection = false; // Reset the stop flag
            console.log("Start Detection clicked");
            // console.log(message.videoElement);
            // console.log(message.parentElement); 
            await setupWebcamObjectDetection(); // Start object detection
        }
    } else if (message.action === "stopDetection") {
        if (isDetecting) {
            isDetecting = false;
            stopWebcamObjectDetection = true; // Set the stop flag
            console.log("Stop Detection clicked");
            removeHighlightedElements(); // Remove highlighted elements when stopping
        }
    }
});

async function setupWebcamObjectDetection() {
    try {
        const videoElement = document.querySelector(".video-stream.html5-main-video");

        // Load the pre-trained model. You need to replace 'path/to/model' with the actual model path or URL.
        const model = await cocoSsd.load();

        // Call the predictWebcam function to start object detection on each frame.
        const liveView = document.querySelector(".html5-video-container");
        liveView.classList.add("camView");
        predictWebcam(model, liveView, videoElement);

    } catch (err) {
        console.error('Error loading the model:', err);
    }
}

function predictWebcam(model, liveView, video) {
    if (stopWebcamObjectDetection) {
        // If stopWebcamObjectDetection is true, exit the loop and stop object detection
        isDetecting = false;
        stopWebcamObjectDetection = false;
        return;
    }

    // Now let's start classifying a frame in the video.
    model.detect(video).then(function(predictions) {
        removeHighlightedElements(); // Remove the previous highlighted elements
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

                liveView.appendChild(highlighter);
                liveView.appendChild(p);
                children.push(highlighter);
                children.push(p);
            }
        }

        // Check if object detection is still running
        if (isDetecting) {
            // Call this function again to keep predicting when the browser is ready.
            window.requestAnimationFrame(() => predictWebcam(model, liveView, video));
        }
    });
}

function removeHighlightedElements() {
    // Remove the highlighted bounding boxes and text elements
    const liveView = document.querySelector(".html5-video-container");
    for (let i = 0; i < children.length; i++) {
        liveView.removeChild(children[i]);
    }
    children = [];
}
