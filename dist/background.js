chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        title: "Object Detection on Video",
        id: "objectDetection",
        contexts: ["video"]
    });

    chrome.contextMenus.create({
        title: "Start Object Detection",
        id: "startObjectDetection",
        contexts: ["video"],
        parentId: "objectDetection"
    });

    chrome.contextMenus.create({
        title: "Stop Object Detection",
        id: "stopObjectDetection",
        contexts: ["video"],
        parentId: "objectDetection"
    });

    chrome.contextMenus.create({
        title: "Pose Detection on Video",
        id: "poseDetection",
        contexts: ["video"]
    });

    chrome.contextMenus.create({
        title: "Start Pose Detection",
        id: "startPoseDetection",
        contexts: ["video"],
        parentId: "poseDetection"
    });

    chrome.contextMenus.create({
        title: "Stop Pose Detection",
        id: "stopPoseDetection",
        contexts: ["video"],
        parentId: "poseDetection"
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "startObjectDetection") {
        // Send a message to the content script with the video element details
        chrome.tabs.sendMessage(tab.id, { 
            action: "startObjectDetection",
            srcUrl: info.srcUrl
        });
    } else if (info.menuItemId === "stopObjectDetection") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "stopObjectDetection",
            srcUrl: info.srcUrl
        });
    }
});
