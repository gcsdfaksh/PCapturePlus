ListenSwitch = false

chrome.tabs.onActivated.addListener(function (activeInfo) {
    // 当标签页切换时触发的代码
    chrome.storage.sync.get({listenTab: true}, function (items) {
        if (items.listenTab == true) {
            if(activeInfo.tabId) {
                chrome.tabs.get(activeInfo.tabId, function (tab) {
                    if(tab.url){
                        if (!tab.url.startsWith("edge://") && !tab.url.startsWith("chrome://")) {
                            chrome.storage.sync.set({listenHost: new URL(tab.url).hostname}, function () {
                            })
                        }
                    }
                });
            }
        }
        ;
    });
});

async function nopasshost(hostname) {
    return await new Promise((resolve, reject) => {
        chrome.storage.sync.get({hostDetermine: true}, function (items) {
            if (items.hostDetermine) {
                chrome.storage.sync.get({listenHost: ""}, function (items) {
                    console.log(items.listenHost, "now:", hostname)
                    if (items.listenHost && hostname !== items.listenHost) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            } else {
                chrome.storage.sync.get({listenHost: ""}, function (items) {
                    console.log(items.listenHost, "now:", hostname)
                    resolve(false);
                });
            }
        })
    });
}
chrome.runtime.onMessage.addListener((message, callback) => {
    if (message.type == "Capture") {
        setTimeout(() => {
            ListenSwitch = false
        }, 2000)
        if (ListenSwitch == false) {
            ListenSwitch = true
            // web请求监听，最后一个参数表示阻塞式，需单独声明权限：webRequestBlocking
            chrome.webRequest.onBeforeRequest.addListener(function PListen(details) {
                // cancel 表示取消本次请求c
                if (details.type !== 'xmlhttprequest') return {cancel: false};
                var hostname = new URL(details.url).hostname;
                nopasshost(hostname).then((res) => {
                    console.log("判断是否不通过：",res);
                    if(res == true){
                        return {cancel: false}
                    }
                    targetData = message.message
                    console.log(message, details)
                    // console.log(details.type)
                    targetData.url = details.url
                    fetch('http://127.0.0.1:8091/AutoPenetrationTesting/ClickData', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(targetData)
                    });
                    // setTimeout(function() {
                    chrome.webRequest.onBeforeRequest.removeListener(PListen)
                    ListenSwitch = false
                });
                // }, 2000); //
            }, {urls: ["<all_urls>"]}, ["blocking"]);
        }
    } else if (message.type == "CaptureRight") {
        // let hostname = new URL(details.url).hostname;
        if (message.url) {
            var hostclick = new URL(message.url).hostname;
        } else {
            var hostclick = "无右键预触发链接";
        }
        // chrome.storage.sync.get({hostDetermine: true}, function (items) {
        //     if (items.hostDetermine) {
        chrome.storage.sync.get({listenHost: ""}, function (items) {
            console.log(items.listenHost, "now:", hostclick)
        });
        //     }
        // })
        targetData = message.message
        console.log(message, hostclick)
        // console.log(details.type)
        if (message.url) {
            targetData.url = message.url
        } else {
            targetData.url = "无右键预触发链接"
        }
        fetch('http://127.0.0.1:8091/AutoPenetrationTesting/ClickData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(targetData)
        });
    }
})
//-------------------- 右键菜单演示 ------------------------//
chrome.contextMenus.create({
    title: "一款能自动记录点击请求截图的插件",
    onclick: function () {
        chrome.notifications.create(null, {
            type: 'basic',
            iconUrl: 'icon.png',
            title: '一款能自动记录点击请求截图的插件',
            message: '您刚才点击了自定义右键'
        });
    }
});
chrome.contextMenus.create({
    title: '使用度娘搜索：%s', // %s表示选中的文字
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function (params) {
        // 注意不能使用location.href，因为location是属于background的window对象
        chrome.tabs.create({url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)});
    }
});
