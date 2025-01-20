//#region RunTime
chrome.runtime.onMessage.addListener(gotMessage);
//#endregion

//#region GotMessage
function gotMessage(message, sender, sendResponse) {
    if(message.txt == "qua?Open") {
        var qoverlay = document.querySelector('.qua-overlay');
        if (qoverlay) {
            if (qoverlay.getAttribute('qaction') === 'active' && qoverlay.classList.contains('qactive')) {
                qoverlay.classList.remove('qactive');
                qoverlay.removeAttribute('qaction');
                document.documentElement.removeAttribute('qua-overlay');
            } else {
                qoverlay.setAttribute('qaction', 'active');
                qoverlay.classList.add('qactive');
                document.documentElement.setAttribute('qua-overlay', 'open');
            }
        }
    }
}
let keysPressed = {};
document.addEventListener('keydown', (e) => {
    keysPressed[e.code] = true;
    if (keysPressed['ControlRight'] && e.code == 'KeyQ') {
        if (!isLogged()) return;
        let qoverlay = document.querySelector('.qua-overlay');
        if (qoverlay) {
            if (!qoverlay.classList.contains('qactive')) {
                qoverlay.setAttribute('qaction', 'active');
                qoverlay.classList.add('qactive');
                document.documentElement.setAttribute('qua-overlay', 'open');
            } else {
                qoverlay.classList.remove('qactive');
                document.documentElement.removeAttribute('qua-overlay');
            }
        }
    }
    document.addEventListener('keyup', (e) => {
        keysPressed[e.code] = undefined;
    })
})
//#endregion
