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

})


chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "startDetection") {
        chrome.tabs.sendMessage(tab.id, { action: "startDetection" });
    } else if (info.menuItemId === "stopDetection") {
        chrome.tabs.sendMessage(tab.id, { action: "stopDetection" });
    }
});

