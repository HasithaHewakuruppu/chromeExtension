chrome.runtime.onInstalled.addListener(function() {

    chrome.contextMenus.create({
        title: "Object Detection on Video",
        id: "objectDetection",
        contexts: ["video","page"]
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
        contexts: ["video","page"],
        parentId: "objectDetection"
    });

    chrome.contextMenus.create({
        title: "Pose Detection on Video",
        id: "poseDetection",
        contexts: ["video","page"]
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
        contexts: ["video","page"],
        parentId: "poseDetection"
    });

    chrome.contextMenus.create({
        title: "FaceMesh Detection on Video",
        id: "faceMeshDetection",
        contexts: ["video","page"]
    });

    chrome.contextMenus.create({
        title: "Start FaceMesh Detection",
        id: "startFaceMeshDetection",
        contexts: ["video"],
        parentId: "faceMeshDetection"
    });

    chrome.contextMenus.create({
        title: "Stop FaceMesh Detection",
        id: "stopFaceMeshDetection",
        contexts: ["video","page"],
        parentId: "faceMeshDetection"
    });

    chrome.contextMenus.create({
        title: "Make it Snow",
        id: "makeItSnow",
        contexts: ["video","page"]
    });
    
    chrome.contextMenus.create({
        title: "Start Snowing",
        id: "startSnowing",
        contexts: ["video"],
        parentId: "makeItSnow"
    });
    
    chrome.contextMenus.create({
        title: "Stop Snowing",
        id: "stopSnowing",
        contexts: ["video","page"],
        parentId: "makeItSnow"
    });

    chrome.contextMenus.create({
        title: "Make Ball Pit",
        id: "makeBallPit",
        contexts: ["video","page"]
    });
    
    chrome.contextMenus.create({
        title: "Start Ball Pit",
        id: "startBallPit",
        contexts: ["video"],
        parentId: "makeBallPit"
    });
    
    chrome.contextMenus.create({
        title: "Stop Ball Pit",
        id: "stopBallPit",
        contexts: ["video","page"],
        parentId: "makeBallPit"
    });

    chrome.contextMenus.create({
        title: "Human Segmentation on Video",
        id: "humanSegmentation",
        contexts: ["video","page"]
    });

    chrome.contextMenus.create({
        title: "Start Human Segmentation",
        id: "startHumanSegmentation",
        contexts: ["video"],
        parentId: "humanSegmentation"
    });

    chrome.contextMenus.create({
        title: "Stop Human Segmentation",
        id: "stopHumanSegmentation",
        contexts: ["video","page"],
        parentId: "humanSegmentation"
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

    if (info.menuItemId === "startPoseDetection") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "startPoseDetection",
            srcUrl: info.srcUrl
        });
    } else if (info.menuItemId === "stopPoseDetection") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "stopPoseDetection",
            srcUrl: info.srcUrl
        });
    }

    if (info.menuItemId === "startFaceMeshDetection") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "startFaceMeshDetection",
            srcUrl: info.srcUrl
        });
    } else if (info.menuItemId === "stopFaceMeshDetection") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "stopFaceMeshDetection",
            srcUrl: info.srcUrl
        });
    }

    if (info.menuItemId === "startSnowing") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "startSnowing",
            srcUrl: info.srcUrl
        });
    } else if (info.menuItemId === "stopSnowing") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "stopSnowing",
            srcUrl: info.srcUrl
        });
    }

    if (info.menuItemId === "startBallPit") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "startBallPit",
            srcUrl: info.srcUrl
        });
    } else if (info.menuItemId === "stopBallPit") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "stopBallPit",
            srcUrl: info.srcUrl
        });
    }

    if (info.menuItemId === "startHumanSegmentation") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "startHumanSegmentation",
            srcUrl: info.srcUrl
        });
    } else if (info.menuItemId === "stopHumanSegmentation") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "stopHumanSegmentation",
            srcUrl: info.srcUrl
        });
    }

});
