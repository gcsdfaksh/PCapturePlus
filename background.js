chrome.runtime.onMessage.addListener((message, callback) => {
    switch(message.type) {
        case "Capture":
// web请求监听，最后一个参数表示阻塞式，需单独声明权限：webRequestBlocking
            chrome.webRequest.onBeforeRequest.addListener(function PListen(details){
                // cancel 表示取消本次请求
                if( details.type != 'xmlhttprequest') return {cancel: false};
                targetData = message.message
                console.log(message,details)
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
                // }, 2000); //
            }, {urls: ["<all_urls>"]}, ["blocking"]);
    }
    // if (message.data === "setAlarm") {
    //   chrome.alarms.create({delayInMinutes: 5})
    // } else if (message.data === "runLogic") {
    //   chrome.scripting.executeScript({file: 'logic.js', tabId});
    // } else if (message.data === "changeColor") {
    //   chrome.scripting.executeScript(
    //       {func: () => document.body.style.backgroundColor="orange", tabId});
    // };

});
//-------------------- 右键菜单演示 ------------------------//
chrome.contextMenus.create({
    title: "一款能自动记录点击请求截图的终极插件",
    onclick: function(){
        chrome.notifications.create(null, {
            type: 'basic',
            iconUrl: 'img/icon.png',
            title: '这是标题',
            message: '您刚才点击了自定义右键菜单！'
        });
    }
});
chrome.contextMenus.create({
    title: '使用度娘搜索：%s', // %s表示选中的文字
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function(params)
    {
        // 注意不能使用location.href，因为location是属于background的window对象
        chrome.tabs.create({url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)});
    }
});

