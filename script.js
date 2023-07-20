const ObjectDetection = require('./ObjectDetection.js'); 

let objectDetection = null;

chrome.runtime.onMessage.addListener(message => {
  if (message.action === "startObjectDetection") {
    if (!objectDetection) {
      objectDetection = new ObjectDetection();
    }
    const [videoElement, videoParentElement] = getVideoElementAndParent(message.srcUrl);
    if (videoElement && videoParentElement) {
      objectDetection.startObjectDetection(videoElement, videoParentElement);
    }
  } else if (message.action === "stopObjectDetection" && objectDetection) {
    objectDetection.stopObjectDetection();
  }
});

function getVideoElementAndParent(videoSrcUrl) {
  if (!videoSrcUrl) {
    console.log("Error: No video URL found.");
    return [];
  }

  const videoElement = document.querySelector(`video[src="${videoSrcUrl}"]`);
  if (!videoElement) {
    console.log("Error: Video element not found.");
    return [];
  }

  const videoParentElement = videoElement.parentElement;
  console.log("Parent element: ", videoParentElement);
  console.log("Video element: ", videoElement);
  return [videoElement, videoParentElement];
}
