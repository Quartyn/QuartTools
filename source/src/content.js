// #region Listen to browser action click
BrowserApi.runtime.onMessage.addListener(gotMessage);
// #endregion

//#region GotMessage
function gotMessage(message, sender, sendResponse) {
    if (message.txt !== "qua?Open") return false;
    console.log('got message qua?opn')

    const overlay = document.querySelector('.qua-overlay');
    if (!overlay) return false;
    
    if (overlay.getAttribute('qaction') === 'active' && overlay.classList.contains('qactive')) {
        overlay.classList.remove('qactive');
        overlay.removeAttribute('qaction');
        document.documentElement.removeAttribute('qua-overlay');
    } else {
        overlay.setAttribute('qaction', 'active');
        overlay.classList.add('qactive');
        document.documentElement.setAttribute('qua-overlay', 'open');
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
