const ObjectDetection = require('./models/ObjectDetection.js'); 
const PoseDetection = require('./models/PoseDetection.js');
const FaceMeshDetection = require('./models/FaceMeshDetection.js');
const SnowEffect = require('./models/SnowEffect.js');

let objectDetection = null;
let poseDetection = null;
let faceMeshDetection = null;
let snowEffect = null;

chrome.runtime.onMessage.addListener(message => {
  const [videoElement, videoParentElement] = getVideoElementAndParent(message.srcUrl);
  
  if (message.action === "startObjectDetection") {
    if (!objectDetection) {
      objectDetection = new ObjectDetection();
    }
    if (videoElement && videoParentElement) {
      objectDetection.startObjectDetection(videoElement, videoParentElement);
    }
  } else if (message.action === "stopObjectDetection" && objectDetection) {
    objectDetection.stopObjectDetection();
  }

  if (message.action === "startPoseDetection") {
    if (!poseDetection) {
      poseDetection = new PoseDetection();
    }
    if (videoElement && videoParentElement) {
      poseDetection.startPoseDetection(videoElement, videoParentElement.parentElement);
    }
  } else if (message.action === "stopPoseDetection" && poseDetection) {
    poseDetection.stopPoseDetection();
  }

  if (message.action === "startFaceMeshDetection") {
    if (!faceMeshDetection) {
      faceMeshDetection = new FaceMeshDetection();
    }
    if (videoElement && videoParentElement) {
      faceMeshDetection.startFaceMeshDetection(videoElement, videoParentElement);
    }
  } else if (message.action === "stopFaceMeshDetection" && faceMeshDetection) {
    faceMeshDetection.stopFaceMeshDetection();
  }

  if (message.action === "startSnowing") {
    if (!snowEffect) {
      snowEffect = new SnowEffect();
    }
    if (videoElement && videoParentElement) {
      snowEffect.startSnowing(videoElement, videoParentElement);
    }
  } else if (message.action === "stopSnowing" && snowEffect) {
    snowEffect.stopSnowing();
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
