$(document).ready(function() {
    // chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    //     if (tabs.length > 0) {
    //         var tabUrl = tabs[0].url;
    //         var tabHost = new URL(tabUrl).hostname;
    //         chrome.storage.sync.get({listenHost:tabHost}, function (value) {
    //             $('#listenHostInput').val(value.listenHost);
    //         });
    //     }
    // });
    chrome.storage.sync.get({listenHost:""}, function (items) {
        $('#listenHostInput').val(items.listenHost);
    });
    chrome.storage.sync.get({listenTab: true}, function (items) {
        $('#listenTab').prop('checked', items.listenTab);
    });
    chrome.storage.sync.get({hostDetermine: true}, function (items) {
        $('#hostDetermine').prop('checked', items.hostDetermine)
    });
    chrome.storage.sync.get({RegexInput: "/[^\\.]*$"}, function (items) {
        $('#RegexInput').val(items.RegexInput);
    });
    $('#getHostnameButton').click(function (e) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (tabs.length > 0) {
                var tabUrl = tabs[0].url;
                var tabHost = new URL(tabUrl).hostname;
                $('#listenHostInput').val(tabHost);
                chrome.storage.sync.set({'listenHost': tabHost}, function () {
                    // 处理保存成功的情况
                });
            }
        });
    });

    $('#listenHostInput').change(function () {
        var value = $(this).val();

        chrome.storage.sync.set({'listenHost': value}, function () {
            // 处理保存成功的情况
        });
    });
    $('#listenTab').change(function () {
        var value = $(this).is(':checked');
        chrome.storage.sync.set({'listenTab': value}, function () {
            // 处理保存成功的情况

        });
    });
    $('#RegexInput').change(function () {
        var value = $(this).val();

        chrome.storage.sync.set({'RegexInput': value}, function () {
            // 处理保存成功的情况
        });
    });
    $('#hostDetermine').change(function () {
        var value = $(this).is(':checked');
        chrome.storage.sync.set({'hostDetermine': value}, function () {
            // 处理保存成功的情况
        });
    });
});
document.getElementById('showoptions').addEventListener('click', function(e){
    function closePopup() {
        window.close();
        document.body.style.opacity = 0;
        setTimeout(function() { history.go(0); }, 300);
    }
    closePopup()
    // chrome.tabs.create({
    //     url: chrome.runtime.getURL('https://yeyu1024.xyz/gpt.html')
    // });
})
