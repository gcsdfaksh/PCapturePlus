let elms = [];
let target = null;
let targetData = null;
let followTime = null;

function createElement(tag, className) {
    const elm = document.createElement(tag);
    elm.setAttribute('x-ignore', true);
    elm.className = className || '';
    return elm;
}

const followDiv = createElement('div', 'follow-div');
// 当前元素
const span1 = createElement('span', 'follow-current-text');
// 复制当前元素
const a1 = createElement('a');
a1.innerText = '[复制]';
a1.addEventListener('click', copyCurrentText);
// 加入
let div1 = createElement('div');
div1.appendChild(span1);
div1.appendChild(a1);
followDiv.appendChild(div1);
// 复制相邻元素
const span2 = createElement('span', 'follow-siblings-text');
// 复制相邻元素
const a3 = createElement('a');
a3.innerText = '[复制]';
a3.addEventListener('click', copyAllText);
// 显示相邻元素
const a2 = createElement('a');
a2.innerText = '[显示]';
a2.addEventListener('click', showSiblings);
// 加入
let div2 = createElement('div');
div2.appendChild(span2);
div2.appendChild(a2);
div2.appendChild(a3);
followDiv.appendChild(div2);
// 显示相邻列表
const ul1 = createElement('ul', 'follow-siblings-list');
followDiv.appendChild(ul1);
// 加入
document.body.appendChild(followDiv);

function debbounce(fn, delay) {
    let time = null;
    return function (e) {
        if (time !== null) {
            clearTimeout(time);
        }
        time = setTimeout(() => {
            fn.call(this, e);
        }, delay || 200);
    }
}

function copyText(text) {
    var textareaC = document.createElement('textarea');
    textareaC.setAttribute('readonly', 'readonly'); //设置只读属性防止手机上弹出软键盘
    textareaC.value = text;
    document.body.appendChild(textareaC); //将textarea添加为body子元素
    textareaC.select();
    var res = document.execCommand('copy');
    document.body.removeChild(textareaC);//移除DOM元素
    console.log("复制结果" + res);
}

function copyCurrentText() {
    copyText(targetData['text']);
    a1.innerText = '[复制成功]';
}

function copyAllText() {
    var text = targetData['text'];
    targetData['siblings'].forEach(item => {
        text += "\r\n" + item['text'];
    });
    copyText(text);
    a3.innerText = '[复制成功]';
}

function showSiblings() {
    if (a2.innerText == '[展开]') {
        let html = '';
        targetData.siblings.forEach(item => {
            html += '<li x-ignore>' + item.text + '</li>';
        });
        ul1.innerHTML = html;
        ul1.style.display = 'block';
        a2.innerText = '[隐藏]';
        if (followTime !== null) {
            clearTimeout(followTime);
        }
        followTime = setTimeout(closeFollow, 10000);
    } else {
        ul1.style.display = 'none';
        a2.innerText = '[展开]';
    }
}

function closeFollow() {
    followDiv.style.display = 'none';
    div2.style.display = 'none';
    ul1.style.display = 'none';
}

function showFollow(data, x, y) {
    span1.innerText = '当前元素：' + data.text;
    a1.innerText = '[复制]';
    if (data.siblings.length > 0) {
        span2.innerText = '相邻数量：' + data.siblings.length;
        a2.innerText = '[展开]';
        a3.innerText = '[复制]';
        div2.style.display = 'block';
    } else {
        div2.style.display = 'none';
        ul1.style.display = 'none'
    }
    followDiv.style.display = 'block';
    followDiv.style.top = (y + 10) + 'px';
    followDiv.style.left = (x + 10) + 'px';
    if (followTime !== null) {
        clearTimeout(followTime);
    }
    followTime = setTimeout(closeFollow, 5000);
}

function getData(elm) {
    let ns = elm.childNodes;
    while (ns.length == 1) {
        switch (ns[0].nodeType) {
            case 1:
                ns = ns[0];
                break;
            case 3:
                let data = {
                    'text': ns[0].nodeValue.trim(),
                    'xpath': ElementToXPath(ns[0].parentNode)
                }
                enumerateSiblings(data);
                ns = [];
                return data;
            default:
                ns = [];
                break;
        }
    }
    return null;
}

document.addEventListener('mousemove', debbounce((e) => {
    target = document.elementFromPoint(e.clientX, e.clientY);
    if (target != null && !target.hasAttribute('x-ignore')) {
        targetData = getData(target);
        if (targetData != null && targetData.text.length > 0) {
            console.log(targetData);
            showFollow(targetData, e.clientX, e.clientY);
        }
    }
}));
document.addEventListener('contextmenu', (e) => {
    target = document.elementFromPoint(e.clientX, e.clientY);
    if (target != null && !target.hasAttribute('x-ignore')) {
        targetData = getData(target);
        if (targetData != null && targetData.text.length > 0) {
            chrome.runtime.sendMessage({type: "CaptureRight", message:targetData, url:target.href});
            showFollow(targetData, e.clientX, e.clientY);
        }
    }
})
document.addEventListener('mouseup', (e) => {

    if (e.button === 0) {
        target = document.elementFromPoint(e.clientX, e.clientY);
        if (target != null && !target.hasAttribute('x-ignore')) {
            targetData = getData(target);
            if (targetData != null && targetData.text.length > 0) {
                chrome.runtime.sendMessage({type: "Capture",message:targetData});
                showFollow(targetData, e.clientX, e.clientY);
            }
        }
    }
})

function ElementToXPath(element) {
    //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
    if (element == document.body) {//递归到body处，结束递归
        return '/html/' + element.tagName.toLowerCase();
    }
    let siblings = [], childNodes = element.parentNode.childNodes;
    for (var i = 0, l = childNodes.length; i < l; i++) {
        if (childNodes[i].tagName == element.tagName) {
            siblings.push(childNodes[i]);
        }
    }
    if (siblings.length == 1) {
        return arguments.callee(element.parentNode) + '/' + element.tagName.toLowerCase();
    } else {
        for (var i = 0, l = siblings.length; i < l; i++) {
            if (siblings[i] == element) {
                return arguments.callee(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (i + 1) + ']';
            }
        }
    }
}


function XPathToElement(xpath) {
    try {
        var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
        return result.iterateNext()
    } catch (error) {
        return null;
    }
}

function enumerateSiblings(data) {
    let parts = data.xpath.split(/\[\d+\]/);
    let ixs = data.xpath.match(/\[(\d+)\]/g).map(v => parseInt(v.substring(1, v.length - 1)));
    let siblings = [];
    for (let i = ixs.length - 1; i > 0 && siblings.length == 0; i--) {
        let prefixXPath = '', suffixXPath = '';
        // 构造前后XPath
        for (let ii = 0; ii < i; ii++) {
            prefixXPath += parts[ii] + '[' + ixs[ii].toString() + ']';
        }
        prefixXPath += parts[i];
        for (let ii = i + 1; ii < parts.length - 1; ii++) {
            suffixXPath += parts[ii] + '[' + ixs[ii].toString() + ']';
        }
        suffixXPath += parts[parts.length - 1];
        // 尝试遍历前面的同级XPath，报错会忽略
        for (let ix = 1; ix < ixs[i]; ix++) {
            if (element = XPathToElement(prefixXPath + '[' + ix.toString() + ']' + suffixXPath)) {
                let text = element.innerText.trim();
                if (text.length > 0 && text != data.text) {
                    siblings.push({
                        text: text,
                        xpath: ElementToXPath(element)
                    });
                }
            }
        }
        //  尝试遍历后面的同级XPath，报错会退出
        let ix = ixs[i];
        while ((element = XPathToElement(prefixXPath + '[' + ix.toString() + ']' + suffixXPath))) {
            let text = element.innerText.trim();
            if (text.length > 0 && text != data.text) {
                siblings.push({
                    text: text,
                    xpath: ElementToXPath(element)
                });
            }
            ix++;
        }

    }
    data.siblings = siblings;
    return data;
}