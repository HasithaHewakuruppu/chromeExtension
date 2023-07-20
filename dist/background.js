chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        title: "Object Detection on Video",
        id: "objectDetection",
        contexts: ["video"]
    });

    chrome.contextMenus.create({
        title: "Start Detection",
        id: "startDetection",
        contexts: ["video"],
        parentId: "objectDetection"
    });

    chrome.contextMenus.create({
        title: "Stop Detection",
        id: "stopDetection",
        contexts: ["video"],
        parentId: "objectDetection"
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "startDetection") {
        // Send a message to the content script with the video element details
        chrome.tabs.sendMessage(tab.id, { 
            action: "startDetection",
            srcUrl: info.srcUrl
        });
    } else if (info.menuItemId === "stopDetection") {
        chrome.tabs.sendMessage(tab.id, { 
            action: "stopDetection",
            srcUrl: info.srcUrl
        });
    }
});
