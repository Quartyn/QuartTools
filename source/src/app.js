// #region Functions & Variables
let loadedApps = [];
let colors = {
    "blurple": "131 110 254",
    "purple": "159 107 255",
    "pink": "245 107 255",
    "blue": "107 117 255",
    "aqua": "107 255 253",
    "lime": "107 225 156",
    "green": "132 225 107",
    "yellow": "253 255 107",
    "orange": "255 151 107",
    "red": "255 107 107",
    "custom": ""
}
let services = [
    {
        "name": "YouTube",
        "description": "Ad skiper, background image, etc.",
        "image": "alexander-shatov-niUkImZcSP8-unsplash.webp",
        "options": [
            {
                "id": "adSkip",
                "name": "Ad skip",
                "description": "No blocking ads, this feature only skipping ad when it is available"
            },
            {
                "id": "muteAd",
                "name": "Auto mute ads",
                "description": "Automatically mutes ads when are shown and unmutes when are gone"
            },
            {
                "id": "customBg",
                "name": "Background",
                "description": "This image will be showing when ad is showing.. (Turn ON for more options)",
                "controls": [
                    {
                        "imageID": "vaporwave_traveller.jpg",
                        "imageName": "Vaporwave traveler in galaxy"
                    },
                    {
                        "imageID": "retrowave_city.jpg",
                        "imageName": "Retrowave city"
                    },
                    {
                        "imageID": "night_vibes.jpg",
                        "imageName": "Night vibes"
                    },
                    {
                        "imageID": "darkness_monster.jpg",
                        "imageName": "Darkness monster"
                    },
                    {
                        "imageID": "aesthetic_book.jpg",
                        "imageName": "Aesthetic book"
                    }

                    
                ]
            },
            {
                "id": "closeAd",
                "name": "Small ads close",
                "description": "Automatically closes small ads showing in video"
            }
        ]
    },
    {
        "name": "Twitch",
        "description": "Twitch points autocollect, chat+, etc.",
        "image": "caspar-camille-rubin-DrL-cwqD6tM-unsplash.webp",
        "options": [
            {
                "id": "twChClaim",
                "name": "AutoClaim bonus points chest",
                "description": "Automatically collects bonus points chests"
            },
        ]
    },
    {
        "name": "Instagram",
        "description": "Video volume changer, etc.",
        "image": "alexander-shatov-71Qk8ODIBko-unsplash.webp",
        "options": [
            {
                "id": "igVolume",
                "name": "Video volume",
                "description": "Allows you to control volume of all video sources"
            }
        ]
    }
];

function overlaySelect(selector) {
    return document.querySelector(`[qua-overlay-action="${selector}"]`);
}
Element.prototype.overlaySelect = function(selector, remove) {
    return this.querySelector(`[qua-overlay-action="${selector}"]`);
}
function overlaySelectAll(selector) {
    return document.querySelectorAll(`[qua-overlay-action="${selector}"]`);
}
Element.prototype.overlaySelectAll = function(selector, remove) {
    return this.querySelectorAll(`[qua-overlay-action="${selector}"]`);
}
// #endregion Functions & Variables

// #region Config DO NOT TOUCH!:D
let overlay_options = {};
let overlay_theme_customization = {};
// #endregion

// FUNCTION - Message Centre
BrowserApi.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.id == 'logoutUser') return logoutUser();
        if (message.id == 'clearSettings') return clearSettings();

        if (message.id == 'user://reset') {
            return resetListener();
        }
        if (message.id == 'userAuthenticated') {
            return authenticationListener(message.body);
        }

        console.log(message);
    }
);

initializeApp();
function initializeApp() {
    if (!settings) return setTimeout(initializeApp, 10);
    importOverlay();
    checkVersion();
}

function importOverlay(mode = "full") {
    quartyn.log(`Adding Overlay on ${window.location.href}`);

    // #region Import overlay ui to the website
    fetch(BrowserApi.runtime.getURL('/ui/overlay.html'))
    .then(response => response.text())
    .then(data => {
        document.documentElement.setAttribute('quartyn-tools', '');
        loadedApps = []; // Reset loaded apps
        if (mode == "part") {
            const overlay = document.querySelector('.q-overlay');
            let fullHTML = document.createElement('div');
            fullHTML.innerHTML = data;
            let partHTML = fullHTML.querySelector('.q-overlay').innerHTML;
            overlay.innerHTML = partHTML;
            return true;
        }

        const overlay = document.createElement('div');
        overlay.setAttribute('author', 'Quartyn');
        overlay.setAttribute('app', 'QuartTools');
        overlay.innerHTML = data;
        document.body.appendChild(overlay);

        return true;
    }).then(() => {
        translateAll();
        setNavigation();

        runApplication('services');
        updateOverlaySettings();

        setUserData();

        // Image manager
        document.querySelectorAll('[qua-image\\:id]').forEach(element => {
            element.src = BrowserApi.runtime.getURL(`/images/icons/${element.getAttribute('qua-image:id')}`);
        });
    })
    .catch(err => {
        console.log(err);
        quartyn.error(err);
    });
    // #endregion

    // #region Loading & hash events
    // let loadingCounter = 0;
    // function move() {
    //     if (loadingCounter == 0) {
    //         loadingCounter = 1;
    //         var elem = document.querySelector('.qloading-bar .qstatus');
    //         var width = 1;
    //         var id = setInterval(frame, 20);
    //         function frame() {
    //             if (width >= 100) {
    //                 clearInterval(id);
    //                 loadingCounter = 0;
    //                 if (!document.querySelector('.q-loading')) return;
    //                 document.querySelector('.q-loading').style.opacity = '0';
    //                 elem.parentElement.remove();
    //                 setTimeout(() => {
    //                     document.querySelector('.q-loading').remove();
    //                     document.querySelector('.q-overlay').removeAttribute('q');
    //                 }, 1000);
    //             } else {
    //                 width++;
    //                 if (elem) {
    //                     elem.style.width = width + "%";
    //                 }
    //             }
    //         }
    //     }
    // }
    // var qstatus = setInterval(() => {
    //     let overlay = document.querySelector('.qua-overlay');
    //     if (overlay) {
    //         overlay.setAttribute('qstatus', document.readyState);
    //         if (document.readyState === 'complete') {
    //             clearInterval(qstatus);
    //             move();
    //         }
    //     }
    // }, 10);
    // function qaction() {
    //     if (window.location.hash.includes('#qopen')) {
    //         let linkHash = window.location.hash;
    //         let qopener = '#qopen';
    //         let qcategor = linkHash.indexOf(qopener) + qopener.length;
    //         let qaction = linkHash.substring(qcategor).toLowerCase();
    //         let qcateCat = qaction.split('/');
    //         let goTo = qcateCat[1];
    //         let goToSection = qcateCat[2];
    //         function doaction() {
    //             let overlay = document.querySelector('.qua-overlay');
    //             if (overlay) {
    //                 overlay.setAttribute('qaction', 'active');
    //                 overlay.classList.add('qactive');
    //                 document.documentElement.setAttribute('qua-overlay', 'open');
    //                 openPage(goTo);
    //             } else {
    //                 setTimeout(() => {
    //                     doaction();
    //                 }, 1000);
    //             }
    //         }
            
    //         if (settings.account.isLogged) {
    //             doaction();
    //         }
    //     }
    // }
    // var qloadingcheck = setInterval(function () {
    //     if (document.readyState !== 'loading') {
    //         clearInterval(qloadingcheck);
    //         qaction();
    //     }
    // }, 10);
    // window.addEventListener('hashchange', () => {
    //     qaction();
    // });
    // #endregion
}

function setLoading({
    duration = 5000,
    _interval = 100,
    bar = "",
    then = () => {}
} = {}) {
    if (!bar) return false;
    
    const steps = duration / _interval;
    const increment = 100 / steps;
    let width = 0;
    let id = setInterval(function() {
        if (width >= 100) {
            clearInterval(id);
            then();
            return true;
        }
        width += increment;
        bar.style.width = width + "%";
    }, _interval);

    return {
        remove: function() {
            clearInterval(id);
        }
    }
}

function userLogin() {
    document.querySelector('.q-overlay').removeAttribute('q');
    if (!settings.account.isLogged) {
        let overlayBody = document.querySelectorAll('.q-overlay *');
        overlayBody.forEach(a => a.remove());

        setupLoginScreen();
        
        let notification = new ScreenNotification({
            title: "Exciting Update: QuartTools Rebuilt!",
            description: `Hey there! 🎉 QuartTools just got a fresh makeover, and with it came some exciting changes! We had to tidy up our storage to make room for all the awesome new features. Don't worry, it's all for the better! 😄

            Please take a moment to log in again and explore the snazzy new version. You'll love what we've done! Happy tooling! 🛠️💫.`,
            main: {
                text: "Login & Discover",
                action: function() {
                    notification.close();
                    openOverlay();
                }
            }
        });
        notification.send();
        return;
    }
    if (!settings.account.hideTutorial) {
        // showTutorial();
    }
}

// #region Auth
function continueWithoutAccount() {
    requestSave({
        account: {
            isLogged: true,
            id: "anonymous",
            username: "Guest",
            name: "Guest"
        }
    });
    setTimeout(() => {
        importOverlay('part');
    }, 100);
}
async function setupLoginScreen() {
    let response = await fetch(BrowserApi.runtime.getURL('/ui/login.html'));
    document.querySelector('[qua-overlay-page="account"]').innerHTML = await response.text();
    let setupScreen = document.querySelector('.q-overlay .qua-overlay_auth-screen');

    updateOverlaySettings();
    
    let authRegister = setupScreen.overlaySelect('auth.register-container');
    let authLogin = setupScreen.overlaySelect('auth.login-container');
    setupScreen.overlaySelect('auth.toLogin').addEventListener('click', function() {
        authRegister.setAttribute('hidden', '');
        authRegister.setAttribute('aria-hidden', 'true');
        authLogin.removeAttribute('hidden', '');
        authLogin.removeAttribute('aria-hidden');
    });
    setupScreen.overlaySelect('auth.toRegister').addEventListener('click', function() {
        authLogin.setAttribute('hidden', '');
        authLogin.setAttribute('aria-hidden', 'true');
        authRegister.removeAttribute('aria-hidden');
        authRegister.removeAttribute('hidden', '');
    });

    // Auth Config
    let config = {
        usernameLength: 3,
        usernamePattern: /^[a-zA-Z_0-9.\-]{3,30}$/,
        passwordLength: 8,
    }
    
    // #region Auth Register
    let register = {
        isUsing: true,
        username: setupScreen.querySelector('[name="qua-overlay://auth/register/username"]'),
        password: setupScreen.querySelector('[name="qua-overlay://auth/register/password"]'),
        passwordAgain: setupScreen.querySelector('[name="qua-overlay://auth/register/password-again"]'),
        submit: authRegister.querySelector('[name="submit"]')
    };
    
    authRegister.addEventListener('submit', function(e) {
        e.preventDefault();
        if (register.isUsing) return;
        
        register.isUsing = true;
        register.submit.disabled = true;
        register.submit.classList.add('qua-overlay__loading');

        BrowserApi.runtime.sendMessage({ id: "createUser", body: new URLSearchParams(new FormData(authRegister)).toString() })
        .then(res => {
            console.log(res);
            register.submit.classList.remove('qua-overlay__loading');
            if (res.status !== 200) {
                return new overlayNotification({
                    title: "Unable to create an account",
                    message: response.message ?? "Bad request",
                    duration: 6000
                });
            }

            let user = response.user;
            requestSave({
                account: {
                    isLogged: true,
                    id: user.id,
                    name: user.fullname,
                    username: user.username,
                    avatar: user.avatar
                }
            });

            return welcomeScreen(user);
        }).catch(err => {

        });
    });
    register.username.addEventListener('input', function(e) {
        let usernameValue = this.value;
        this.closest('.qua-overlay-modern-input').removeAttribute('qua-overlay-input');
        this.closest('.qua-overlay-modern-input').removeAttribute('qua-overlay-input-message');
        if (!config.usernamePattern.test(usernameValue)) {
            this.closest('.qua-overlay-modern-input').setAttribute('qua-overlay-input', 'error');
            this.value = usernameValue.replace(/[^a-zA-Z_0-9.\-]/g, '');
        }
        if (usernameValue.length < 3) return this.closest('.qua-overlay-modern-input').setAttribute('qua-overlay-input-message', `Minimum length is 3 letters.`);
        if (usernameValue.length > 30) return this.closest('.qua-overlay-modern-input').setAttribute('qua-overlay-input-message', `Maximum length is 30 letters.`);
    })
    register.username.addEventListener('change', function() {
        if (!config.usernamePattern.test(this.value)) return this.closest('.qua-overlay-modern-input').setAttribute('qua-overlay-input', 'error');
        let data = new URLSearchParams();
        data.append('q', this.value);
        BrowserApi.runtime.sendMessage({ id: "checkName", body: data.toString() })
        .then(res => {
            console.log(res);
            if (res.status !== 200) {
                return new overlayNotification({
                    title: "Unable to verify username",
                    message: res.message,
                    duration: 5000
                });
            }
            if (res.isUsed) {
                register.username.closest('.qua-overlay-modern-input').setAttribute('qua-overlay-input-message', res.message);
                return register.username.closest('.qua-overlay-modern-input').setAttribute('qua-overlay-input', 'error');
            }
            register.username.closest('.qua-overlay-modern-input').removeAttribute('qua-overlay-input-message');
            return register.username.closest('.qua-overlay-modern-input').setAttribute('qua-overlay-input', 'success');
        }).catch(err => {
            console.error("QuartTools: Worker was unable to communicate with backend. You can reload your tabs and error will be fixed.", err);
        });
    });
    register.passwordAgain.addEventListener('input', function() {
        this.closest('.qua-overlay-modern-input').removeAttribute('qua-overlay-input-message');
        this.closest('.qua-overlay-modern-input').removeAttribute('qua-overlay-input');
    })
    register.passwordAgain.addEventListener('change', function() {
        if (register.password.value === register.passwordAgain.value) return;

        this.closest('.qua-overlay-modern-input').setAttribute('qua-overlay-input-message', "Passwords are not the same");
        this.closest('.qua-overlay-modern-input').setAttribute('qua-overlay-input', 'error');
    });
    authRegister.addEventListener('input', function() {
        register.isUsing = true;
        if (register.username.value.length < config.usernameLength) return register.submit.disabled = true;
        if (register.password.value.length < config.passwordLength || register.password.value != register.passwordAgain.value) return register.submit.disabled = true;

        register.isUsing = false;
        register.submit.disabled = false;
    });
    // #endregion of Auth Register

    // #region Auth Login
    let login = {
        isUsing: true,
        username: authLogin.querySelector('[name="qua-overlay://auth/login/username"]'),
        password: authLogin.querySelector('[name="qua-overlay://auth/login/password"]'),
        submit: authLogin.querySelector('[type="submit"]')
    }
    authLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        if (login.isUsing) return;

        login.isUsing = true;
        login.submit.disabled = true;
        login.submit.classList.add('qua-overlay__loading');

        BrowserApi.runtime.sendMessage({ id: "loginUser", body: new URLSearchParams(new FormData(this)).toString() })
        .then(response => {
            login.submit.classList.remove('qua-overlay__loading');
            if (response.status !== 200) {
                return new overlayNotification({
                    title: `Oops! Unable to Log In`,
                    message: response.message,
                    duration: 6000
                });
            }

            let user = response.user;

            requestSave({
                account: {
                    isLogged: true,
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    avatar: user.avatar,
                    token: user.token
                }
            });
            settings.account = user;

            return welcomeScreen(user);
        }).catch(err => {
            console.error('QuartTools: Worker was unable to communicate with backend. Refresh your tabs and this should be fixed.', err);
        });
    });
    authLogin.addEventListener('input', function(e) {
        login.isUsing = false;
        login.submit.disabled = false;
    });
    // #endregion of Auth Login

    translateAll();
}
// #endregion Auth

// TODO - Tutorial Page
function showTutorial() {
    if (settings.account.educated == "true") return;
    if (quserDatas['viewed_tutorial'] !== undefined) return;
    // let body = document.createElement('div');
    // body.className = 'qua-tutorial';
    // body.innerHTML = `<div>
    //                     <div class="qpreview-div" translate="no">
    //                         <div class="qupper-bar">
    //                             <div class="qshow-input"></div>
    //                             <div class="qshow-icons">
    //                                 <span class="material-icons">extension</span>
    //                                 <span class="material-icons">queue_music</span>
    //                                 <span class="material-icons">account_circle</span>
    //                                 <span class="material-icons">more_vert</span>
    //                             </div>
    //                         </div>
    //                         <div class="qdown-bar">
    //                             <div class="qbookmark">
    //                                 <span class="material-icons">music_note</span>
    //                                 <span class="qbo-text"></span>
    //                             </div>
    //                             <div class="qbookmark">
    //                                 <span class="material-icons">album</span>
    //                                 <span class="qbo-text"></span>
    //                             </div>
    //                         </div>
    //                     </div>
    //                     <div class="qpreview-div" translate="no">
    //                         <div class="qextensions">
    //                             <div class="qtop-bar">
    //                                 <span></span>
    //                                 <span class="material-icons">close</span>
    //                             </div>
    //                             <div class="qextens">
    //                                 <p>QuartTools</p>
    //                                 <div>
    //                                     <span class="material-icons-outlined">push_pin</span>
    //                                     <span class="material-icons">more_vert</span>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </div>
    //                     <div class="qinfo-text">Click this <span class="material-icons" translate="no">extension</span> icon in top right corner and <span class="material-icons" translate="no">push_pin</span>pin QuartTools to your bar!</div>
    //                     </div>
    //                     <qbutton>Next</qbutton>
    //                     `;
    let tutorial = document.createElement('div');
    tutorial.className = 'qua-overlay-tutorial-screen';
    tutorial.innerHTML = `
    <div class="qua-overlay-tutorial-screen_container">
        <div class="qua-overlay-tutorial-screen_container_view">
            <div class="qupper-bar">
                <div class="qshow-input"></div>
                <div class="qshow-icons">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M14 6H4c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1zm0 4H4c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1zM4 16h6c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM19 6c-1.1 0-2 .9-2 2v6.18c-.31-.11-.65-.18-1-.18-1.84 0-3.28 1.64-2.95 3.54.21 1.21 1.2 2.2 2.41 2.41 1.9.33 3.54-1.11 3.54-2.95V8h2c.55 0 1-.45 1-1s-.45-1-1-1h-2z"/></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/></g><g><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"/></g></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                </div>
            </div>
            <div class="qdown-bar">
                <div class="qbookmark">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 5h-2v5.37c0 1.27-.9 2.44-2.16 2.6-1.69.23-3.11-1.25-2.8-2.95.2-1.1 1.18-1.95 2.3-2.02.63-.04 1.2.16 1.66.51V6c0-.55.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zM3 6c-.55 0-1 .45-1 1v13c0 1.1.9 2 2 2h13c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1-.45-1-1V7c0-.55-.45-1-1-1z"/></svg>
                    <span class="qbo-text"></span>
                </div>
                <div class="qbookmark">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
                    <span class="qbo-text"></span>
                </div>
            </div>
        </div>
        <div class="qua-overlay-tutorial-screen_container_view">
            <div class="qua-overlay-tutorial-screen_container__extensions">
                <div class="qtop-bar">
                    <span></span>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>
                </div>
                <div class="qua-overlay-tutorial-screen_container__extension">
                    <img class="qua-overlay-tutorial-screen_container__extension-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAP/SURBVFhH7ZZdaFxVEMdn5u5mN7RdWxFB/C71A+yLQtRoUR/6osVCoPZFsULfCmKzm9TcfhBCPzZxk41C8VV9qVqpWEu1SKGlFYqUgqCCFj8oSluoRhOp65q9Z5x7zmR3Tze72c2DIviD3TvzP/eemfM198K/Deq1Y4aHOZHJcCa2Z2ZwZmQEK7ahQ9pOoFAwS6hi+hhwHTA8CMi3I2DgWjlixguI5qxhPApJen9wkK66ttYsmMAbw5yeSkcDEjQLiCtUbgkz/yaXIqZoPJejklPnp2UChb3l1UTBe3LbvSp1yteBwWe27qAv1W+gaQKv7PurNwD6WEZ9nUp1sJG/88D4k3WRb5H/u8Ug69fDME2AT/ZvpzOqeMybQDFfWmk4eRYRr1fJwsCXkGmUu/DAwAD+rLJlfJxvgNnoWTFflr1xk1MdsiRThLM92bD7e5WqNCQgN2MxH52Ska9RySL64QoFm4aGcFqleZkc5uUmbd4Sc71THAxwOjdEj8ugxKzRkEBx1GyQYLLuNZjhyG2rqG/jRoxUakl8RJelog8k2DqVFLMhFyYPqWNpWDMJvlVNi0z7FSzjC+0Gj4lrQgpok5jeMkm4l9So4iUwscfcLCEfUdciEzaZG6Epddvmxe30i/T1mroWGdya4h7j7Q8vASaQdUdvWUySDqjZMVFl9m01LbIkGGH0qLoWLwGpZPeo6WC+LBXtgnods21X93fSh7cMAaEc1xr+DEBDpbuk18WDeFEtB/tH20uAGLyNJucloeaiiY+1mpa4gtVzzQzwFTUt8qRUOL+DzrDP3upsBzbGqFHMm6cliQ/Vtci+WZ0doq/Utcg5p6XpymPqWgbD5Ek1qxT2GnmX8BfqWgyY9XLvEXX9GSgDfipZe+91Yzg+zx6ZzI8pAjpR/9MmjwD5eTUtMrjZClyVGDW8BMIQf5XLMec5ZMq25POlO9Rtm0l5RgJuUdfBcCwMl8cxqngJxMhoCmo6EJd0QdfBsTGzTJUF2b+flxpIHoyfVclCfE3fQkMC/SGdksu7zqvSkzB88tUxc5f6TZnYV1pV/j2S/YA9KlmYzTvZHXRa3Srz7vDX87yiBOYzMb2AcqRkm+CbgOaQvJY/UdmB2Ct3PCc3bRYnrarC5ykdPNTfj/GXkkfTI1bYXboTg+RxOQUrVVoUUku+5QSubVZRG5ZgjsFd3T+U+Y+HpYejKnWOvMbhT+ptVc7bKjITedMnve0U8wGnLASfQ6Dd2ZAOq9CUthKYYzxfvh84eEoee0LemWtVtsj+OE4IJypR9NG2nanPVV6QjhKYozhavo854X3pIlakYqa8itkOTffAP8X/CSwqgelS1zcJgzfW/2JNm/9LAPwNBOZhSF02vnkAAAAASUVORK5CYII=">
                    <p class="qua-overlay-tutorial-screen_container__extension-name">QuartTools</p>
                    <div class="qua-overlay-tutorial-screen_container__extension-controls">
                        <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/></g><g><path d="M19,12.87c0-0.47-0.34-0.85-0.8-0.98C16.93,11.54,16,10.38,16,9V4l1,0 c0.55,0,1-0.45,1-1c0-0.55-0.45-1-1-1H7C6.45,2,6,2.45,6,3c0,0.55,0.45,1,1,1l1,0v5c0,1.38-0.93,2.54-2.2,2.89 C5.34,12.02,5,12.4,5,12.87V13c0,0.55,0.45,1,1,1h4.98L11,21c0,0.55,0.45,1,1,1c0.55,0,1-0.45,1-1l-0.02-7H18c0.55,0,1-0.45,1-1 V12.87z" fill-rule="evenodd"/></g></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </div>
                </div>
            </div>
        </div>
        <p class="qua-overlay-tutorial-screen_text">Click <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/></svg> icon in top right corner and <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/></g><g><path d="M19,12.87c0-0.47-0.34-0.85-0.8-0.98C16.93,11.54,16,10.38,16,9V4l1,0 c0.55,0,1-0.45,1-1c0-0.55-0.45-1-1-1H7C6.45,2,6,2.45,6,3c0,0.55,0.45,1,1,1l1,0v5c0,1.38-0.93,2.54-2.2,2.89 C5.34,12.02,5,12.4,5,12.87V13c0,0.55,0.45,1,1,1h4.98L11,21c0,0.55,0.45,1,1,1c0.55,0,1-0.45,1-1l-0.02-7H18c0.55,0,1-0.45,1-1 V12.87z" fill-rule="evenodd"/></g></svg> to pin QuartTools to your bar!</p>
        <button class="qua-overlay-button qua-overlay-tutorial-screen_container-button">Next Step</button>
    </div>
    `;
    document.body.appendChild(tutorial);
    // if (!document.querySelector('.qua-tutorial')) {
    //     document.body.appendChild(body);
    //     document.querySelector('.qua-tutorial qbutton').addEventListener('click', () => {
    //         let innbody = `<div>
    //                             <div class="qpreview-div" translate="no">
    //                                 <div class="qupper-bar">
    //                                     <div class="qshow-input qxet"></div>
    //                                     <div class="qshow-icons qxet">
    //                                         <span class="material-icons"></span>
    //                                         <span class="material-icons">extension</span>
    //                                         <span class="material-icons">queue_music</span>
    //                                         <span class="material-icons">account_circle</span>
    //                                         <span class="material-icons">more_vert</span>
    //                                     </div>
    //                                 </div>
    //                                 <div class="qdown-bar">
    //                                     <div class="qbookmark">
    //                                         <span class="material-icons">music_note</span>
    //                                         <span class="qbo-text"></span>
    //                                     </div>
    //                                     <div class="qbookmark">
    //                                         <span class="material-icons">album</span>
    //                                         <span class="qbo-text"></span>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                             <div class="qpreview-div" translate="no">
    //                                 <div class="qupper-bar qyep">
    //                                     <div class="qshow-input">
    //                                         <p>${window.location.host}<span>#qopen</span></p>
    //                                     </div>
    //                                 </div>
    //                                 <div class="qdown-bar">
    //                                     <div class="qbookmark">
    //                                         <span class="material-icons">music_note</span>
    //                                         <span class="qbo-text"></span>
    //                                     </div>
    //                                     <div class="qbookmark">
    //                                         <span class="material-icons">album</span>
    //                                         <span class="qbo-text"></span>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                             <div class="qinfo-text">To open QuartTools <br>Click Logo in right top corner<br>or<br>Type <sfu style="text-shadow: 0 0 15px white;">#qopen</sfu> after URL<br>Enjoy QuartTools :D</div>
    //                         </div>
    //                         <qbutton>I Understand</qbutton>
    //                         `;
    //         document.querySelector('.qua-tutorial').innerHTML = innbody;
    //         document.querySelector('.qua-tutorial qbutton').addEventListener('click', () => {
    //             document.querySelector('.qua-tutorial').remove();
    //         })
    //     })
    // }
}

// Function -- done --
function setUserData() {
    const navigationLink = document.querySelector('[qlinkid="account"]');
    
    // User not logged in
    if (!settings?.account?.id) {
        navigationLink.innerHTML = `
            <svg qua-source:google-material-icons xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-240v-32q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v32q0 33-23.5 56.5T720-160H240q-33 0-56.5-23.5T160-240Z"/></svg>
            <qua-label class="qua-navigation-link-title" qua-overlay-translate="auth.login_button">Log In</qua-label>
        `;
        navigationLink.ariaLabel = 'Log In';
        navigationLink.setAttribute('aria-label', 'Log In');
        navigationLink.className = 'qua-navigation-link';
        return true;
    }
    // When is logged in
    navigationLink.innerHTML = `
    <div class="qua-overlay-user__image">
        <qua-button class="qua-overlay-account-picture qua-overlay-navigation-profile-picture">
            <div class="qua-overlay-account-picture_image" qua-data-id="user://image -default"></div>
            <div class="qua-overlay-account-picture_image" qua-data-id="user://image"></div>
        </qua-button>
    </div>
    <div class="qua-overlay-user__data">
        <qua-label class="qua-overlay-user__data-container">
            <span class="qua-overlay-user__data-name" qua-overlay-action="user.fullname">Loading..</span>
        </qua-label>
    </div>
    `;
    navigationLink.ariaLabel = "My account";
    navigationLink.setAttribute('aria-label', 'My account');
    navigationLink.className = "qua-overlay-user";
    let fullName = overlaySelectAll('user.fullname');
    let userName = overlaySelectAll('user.username');
    fullName.forEach(element => {
        element.textContent = settings?.account?.name;
    });
    userName.forEach(element => {
        element.textContent = "@" + settings.account.username;
    });
    return true;
}
function ColorToHex(color) {
    var hexadecimal = color.toString(16);
    return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
}
function ConvertRGBtoHex(rgb) {
    rgb = rgb.trim();
    let colors = rgb.split(' ');
    let red = parseInt(colors[0]);
    let green = parseInt(colors[1]);
    let blue = parseInt(colors[2]);
    return "#" + ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
}

function updateOverlaySettings() {
    translateAll();
    let themeColors = settings.overlaySettings['layout.colors'];
    let themeColour = settings.overlaySettings['layout.theme'] ?? 'dark';
    let allowedThemes = ["dark", "amoled"];
    if (!allowedThemes.includes(themeColour)) themeColour = 'dark';
    
    document.documentElement.setAttribute('qua-overlay-theme', themeColour);

    let overlay = document.querySelector('.q-overlay');

    if (settings.overlaySettings['layout.navigation_type'] == "modern") {
        overlay?.classList.add('qua-overlay__navigation--modern');
    } else {
        overlay?.classList.remove('qua-overlay__navigation--modern');
    }

    if (themeColors && themeColors !== "custom" && colors[themeColors]) {
        document.documentElement.style.setProperty('--qua-overlay-theme-rgb-custom', colors[themeColors]);
    }
}

function setNavigation() {
    let overlay_closers = overlaySelectAll('overlay.close');
    let navigation_tabs = overlaySelectAll('navigation-tab');
    navigation_tabs?.forEach(tab => {
        setNavigationLink(tab);
    });
    overlay_closers?.forEach(closer => {
        closer.addEventListener('click', function() {
            document.querySelector('.qua-overlay').classList.remove('qactive');
            document.documentElement.removeAttribute('qua-overlay');
        });
    });
}

function setNavigationLink(element) {
    element.addEventListener('click', function() {
        openPage(element.getAttribute('qlinkid'));
    });
}

function runApplication(app) {
    if (app == undefined || app == null) return;
    if (loadedApps.includes(app)) return;
    loadedApps.push(app);

    if (app == 'services') return initServices();

    if (app == 'themes') {
        return initThemes();
    }
    if (app == 'account') return initAccount();
    
    if (app == 'settings') {
        return initSettings();
    }
    if (app == 'music') {
        return initMusic();
    }
    if (app == 'feedback') {
        feedbackInit();
        return;
    }
} 
function openPage(id) {
    let overlayPages = ['account', 'services', 'themes', 'music', 'feedback', 'settings'];
    let tabsContents = document.querySelectorAll('[qua-overlay-page]');
    let navigation_tabs = overlaySelectAll('navigation-tab');

    if (!overlayPages.includes(id)) return;

    let page = document.querySelector(`[qua-overlay-page="${id}"]`);
    let link = document.querySelector(`[qlinkid="${id}"]`);
    if (!page && link) {
        link.classList.add('is-disabled-now');
        link.title = 'Content of this tab is missing. Please try to refresh your tab or report this bug to our team.';
        link.setAttribute('disabled', '');
        link.setAttribute('tabindex', '-1');
        return;
    }
    tabsContents.forEach(tabs => {
        tabs.ariaCurrent = 'false';
        tabs.setAttribute('aria-current', 'false');
    });
    navigation_tabs.forEach(tab => { 
        tab.ariaCurrent = 'false';
        tab.setAttribute('aria-current', 'false');
    });
    
    link.ariaCurrent = 'true';
    page.ariaCurrent = 'page';
    link.setAttribute('aria-current', 'true');
    page.setAttribute('aria-current', 'page');

    runApplication(id);
}
function initServices() {
    let appList = document.querySelector('.qua-services-list');
    for (let i in services) {
        let service = services[i];
        let element = document.createElement('qua-button');
        element.className = 'qua-services-card';
        element.role = 'button';
        element.tabIndex = 0;
        element.ariaLabel = 'Services for YouTube';
        element.setAttribute('qua-service-id', i)
        element.innerHTML = `<div class="qua-services-card__image"><img qua-image:id="${service.image}" alt="${service.name} logo"></div><div class="qua-services-card__content"><p class="qua-services-card__title">${service.name}</p><p class="qua-services-card__description">${service.description}</p><p class="qua-services-card__button">Open Settings</p></div>`;
        element.addEventListener('click', function() {
            appList.querySelectorAll('.qua-services-page').forEach(a => a.removeAttribute('qua-active'));
            document.querySelector(`.qua-services-page[qua-service-id="${i}"]`).setAttribute('qua-active', 'true');
            document.querySelector(`.qua-services-page[qua-service-id="${i}"] .qua-services-page__navigation_close`).focus();
        });
        let options = document.createElement('div');
        options.className = 'qua-services-page';
        options.setAttribute('qua-service-id', i);
        options.innerHTML = `<div class="qua-services-page__header qua-content-header"><div class="qua-services-page__navigation qdata-nav"><qua-button qua-selector="service-page/close" role="button" tabindex="0" aria-label="Back to services page" class="qua-services-page__navigation_close"><svg qua-source:google-material-icons xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"></path><path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"></path></svg></qua-button></div><p class="qua-section-name">${service.name}</p></div><div class="qua-services-page__options qservice-option qoptions-list"></div>`;
        options.querySelector('[qua-selector="service-page/close"]').addEventListener('click', function() {
            document.querySelectorAll('.qua-services-page').forEach(a => a.removeAttribute('qua-active'));
            document.querySelector(`.qua-services-card[qua-service-id="${i}"]`).focus();
        });
        service.options.forEach(option => {
            let optionItem = document.createElement('div');
            optionItem.className = 'qua-services-page__option';
            optionItem.setAttribute('qdata-option', option.id);
            optionItem.innerHTML = `
            <div class="qua-services-page__option-carde qua-overlay-settings-option-switch"><div class="qua-overlay-settings-option-switch__details"><p class=" qua-overlay-settings-option-switch__title ${option.status == "development" ? 'qua-overlay-working-on' : ''}">${option.name}</p><p class="qua-overlay-settings-option-switch__description">${option.description}</p></div>
                <div class="qua-services-page__option-card_controls">
                    <label class="qua-overlay-switch" tabindex="0" role="button" aria-label="Turn on/off ${option.name} option.">
                        <input class="qua-overlay-switch_input" type="checkbox" ${settings.options[option.id] === 'on' ? 'checked' : ''}>
                        <span class="qua-overlay-switch_slider">
                            <span class="qua-overlay-switch_dot"></span>
                        </span>
                    </label>
                </div>
            </div>`;
            if (option.id == "customBg") {
                let customizerContainer = document.createElement('div');
                customizerContainer.className = 'qua-services-page__special';
                option.controls.forEach(customBackgroundOption => {
                    let customCard = document.createElement('qua-button');
                    customCard.setAttribute('qua-background-id', customBackgroundOption.imageID);
                    customCard.setAttribute('qua-selector', 'custom_background-changer');
                    if (settings?.options['custom_background'] == undefined && customBackgroundOption.imageID == 'vaporwave_traveller.jpg') {
                        customCard.setAttribute('qua-active', 'true');
                    }
                    if (settings?.options['custom_background'] && customBackgroundOption.imageID == settings?.options['custom_background']) {
                        customCard.setAttribute('qua-active', 'true');
                    }
                    if (typeof controls !== 'undefined') {
                        controls.setBackground(customBackgroundOption.optionID);
                    }
                    
                    customCard.addEventListener('click', function() {
                        // console.log(customBackgroundOption.imageID);
                        // console.log(player);
                        if (typeof controls !== 'undefined') {
                            controls.setBackground(customBackgroundOption.imageID);
                        }
                        customizerContainer.querySelectorAll('qua-button').forEach(btn => btn.removeAttribute('qua-active'));
                        this.setAttribute('qua-active', 'true');
                        requestSave({
                            options: {
                                'custom_background': customBackgroundOption.imageID
                            }
                        });
                        return new overlayNotification({
                            title: "Video background was updated",
                            message: `Background "${customBackgroundOption.imageName}" was enabled.`,
                            duration: 3000
                        });
                    });
                    customCard.innerHTML = `<img src="${extensionURL}images/backgrounds/${customBackgroundOption.imageID}">`;
                    customizerContainer.appendChild(customCard);
                });
                optionItem.appendChild(customizerContainer);
            }
            optionItem.querySelector('input[type="checkbox"]').addEventListener('change', function() {
                if (this.checked) return requestSave({
                    options: {
                        [option.id]: "on"
                    }
                });
                
                return requestSave({
                    options: {
                        [option.id]: null
                    }
                });
            });
            options.querySelector('.qua-services-page__options').appendChild(optionItem);
        })
        appList.appendChild(element);
        document.querySelector('[qua-overlay-page="services"] .data-content').appendChild(options);
    }
}
function initAccount() {
    if (!settings?.account?.id) {
        setupLoginScreen();
        return true;
    }
    // When user is logged in
    let logoutButton = document.querySelector('[qua-action="qua\\:overlay\\://logout"]');
    logoutButton?.addEventListener('click', function() {
        BrowserApi.runtime.sendMessage({ id: "logoutUser" })
        .then(response => {
            console.log(response);
        }).catch(err => {
            console.error(err);
        });
        requestSave({ account: null });
    });
    let resetButton = document.querySelector('[qua-action="qua\\:overlay\\://reset"]');
    // resetButton?.addEventListener('click', resetSender);
    resetButton?.addEventListener('click', function() {
        console.log('Sending clear settings request.')
        BrowserApi.runtime.sendMessage({ id: "clearSettings" })
        .then(data => {
            console.log(data);
        }).catch(err => {
            console.error("QuartTools: Worker was unable to communicate with backend. You can reload your tabs and error will be fixed.");
        })
        clearStorage();
    });
    return true;
}
function initThemes() {
    let closers = overlaySelectAll('theme-manager.close');
    let opener = overlaySelect('theme-manager.open');
    let manager = overlaySelect('theme-manager');
    let requestButton = overlaySelect('theme-manager.request-button');
    let requestForm = overlaySelect('theme-manager.request-form');
    let themeList = overlaySelect('theme-manager.theme-list');
    let search = overlaySelect('themes.search');
    let isRequestDisabled = false;

    requestButton?.addEventListener('click', function() {
        if (!requestForm) return alert('Well... Housten we have got problem!');

        if (this.ariaExpanded == 'true') {
            this.ariaExpanded = 'false';
            requestForm.ariaExpanded = 'false';
        } else {
            this.ariaExpanded = 'true';
            requestForm.ariaExpanded = 'true';
        }
    });
    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (isRequestDisabled) return;
        if (settings.account.id == "anonymous") {
            return alert('You are not logged in. If you want to be able to request a new theme, please log in or create an account.')
        }

        let website = this.querySelector('[name="qua://theme/request/url"]');
        let message = this.querySelector('[name="qua://theme/request/message"]');
        let button = this.querySelector('[type="submit"]');

        if ((website.value.includes('https://') || website.value.includes('http://')) && website.value.includes('.')) { } else {
            website.classList.add('qua-overlay-input-incorrect');
            new OverlayNotification({
                title: 'Incorrect URL format!'
            }).send();
            return;
        }

        button.textContent = 'Submitting request..';
        button.disabled = true;
        website.disabled = true;
        message.disabled = true;
        isRequestDisabled = true;

        BrowserApi.runtime.sendMessage({id: "requestTheme", body: new URLSearchParams(new FormData(this)).toString()})
        .then(res => {
            console.log(res);
            if (res.status !== 200) {

                button.textContent = 'Submit request';
                button.disabled = false;
                website.disabled = false;
                message.disabled = false;
                isRequestDisabled = false;
                return;
            }
        }).catch(err => {
            alert(err);
        });
    });
    requestForm.addEventListener('input', function(e) {
        let website = this.querySelector('[name="qua://theme/request/url"]');
        website.classList.remove('qua-overlay-input-incorrect');
    });
    closers.forEach(element => element.addEventListener('click', () => {
        manager.classList.remove('active');
        opener.ariaPressed = false;
    }));
    opener.addEventListener('click', function() {
        if (manager.classList.contains('active')) {
            manager.classList.remove('active');
            return opener.ariaPressed = false;
        }

        manager.classList.add('active');
        opener.ariaPressed = true;

        fetch('https://api.quartyn.com/v2/themes/get?app=QuartTools&format=pretty')
        .then(res => res.json())
        .then(data => {
            if (data.status !== 200) {
                if (!themeList) return;
                themeList.innerHTML = `<div class="qua-loading-screen"><div class="qua-loading-screen-icon"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="var(--qua-overlay-theme)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M24 15c0-2.64-2.05-4.78-4.65-4.96C18.67 6.59 15.64 4 12 4c-1.33 0-2.57.36-3.65.97l1.49 1.49C10.51 6.17 11.23 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 .99-.48 1.85-1.21 2.4l1.41 1.41c1.09-.92 1.8-2.27 1.8-3.81zM3.71 4.56c-.39.39-.39 1.02 0 1.41l2.06 2.06h-.42c-3.28.35-5.76 3.34-5.29 6.79C.46 17.84 3.19 20 6.22 20h11.51l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.12 4.56c-.39-.39-1.02-.39-1.41 0zM6 18c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73l8 8H6z"/></svg></div><p class="qua-loading-screen__title">Community requests are now unavailable.</p></div>`;
                return;
            }

            let themesList = '';
            let receivedThemes = data['data'] ?? [];
            receivedThemes.forEach(request => {
                let themeLink = request['url'];
                themeLink = themeLink.split('://').pop();
                if (themeLink.startsWith('www.')) themeLink = themeLink.split('www.').pop();
                if (themeLink.endsWith("/")) themeLink = themeLink.slice(0, -1);

                let themeStatus = request['status'];
                let themeIcon = `<div aria-label="This theme is waiting in development queue." class="qua-requested-theme-card-icon"><svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="var(--qua-overlay-theme)"><g><rect fill="none" height="24" width="24"/><path d="M18,3h-3.18C14.4,1.84,13.3,1,12,1S9.6,1.84,9.18,3H6C4.9,3,4,3.9,4,5v15c0,1.1,0.9,2,2,2h6.11 c-0.59-0.57-1.07-1.25-1.42-2H6V5h2v1c0,1.1,0.9,2,2,2h4c1.1,0,2-0.9,2-2V5h2v5.08c0.71,0.1,1.38,0.31,2,0.6V5C20,3.9,19.1,3,18,3z M12,5c-0.55,0-1-0.45-1-1c0-0.55,0.45-1,1-1c0.55,0,1,0.45,1,1C13,4.55,12.55,5,12,5z M17,12c-2.76,0-5,2.24-5,5s2.24,5,5,5 c2.76,0,5-2.24,5-5S19.76,12,17,12z M18.29,19l-1.65-1.65c-0.09-0.09-0.15-0.22-0.15-0.35l0-2.49c0-0.28,0.22-0.5,0.5-0.5h0 c0.28,0,0.5,0.22,0.5,0.5l0,2.29l1.5,1.5c0.2,0.2,0.2,0.51,0,0.71v0C18.8,19.2,18.49,19.2,18.29,19z"/></g></svg></div>`;

                switch (themeStatus) {
                    case "Done":
                        themeIcon = `<div aria-label="This theme is finished and added to the catalog." class="qua-requested-theme-card-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="var(--qua-overlay-theme)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.88-11.71L10 14.17l-1.88-1.88c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l2.59 2.59c.39.39 1.02.39 1.41 0L17.3 9.7c.39-.39.39-1.02 0-1.41-.39-.39-1.03-.39-1.42 0z"/></svg></div>`;
                        break;
                    case "Already exists":
                        themeIcon = `<div aria-label="Official theme does already exists." class="qua-requested-theme-card-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="var(--qua-overlay-theme)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zm-8.64 6.25c-.39.39-1.02.39-1.41 0L7.2 14.2c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L10 14.18l4.48-4.48c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-5.18 5.18z"/></svg></div>`;
                        break;
                    case "In Development":
                        themeIcon = `<div aria-label="I am working on this theme." class="qua-requested-theme-card-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="var(--qua-overlay-theme)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.7 15.9L4.8 12l3.9-3.9c.39-.39.39-1.01 0-1.4-.39-.39-1.01-.39-1.4 0l-4.59 4.59c-.39.39-.39 1.02 0 1.41l4.59 4.6c.39.39 1.01.39 1.4 0 .39-.39.39-1.01 0-1.4zm6.6 0l3.9-3.9-3.9-3.9c-.39-.39-.39-1.01 0-1.4.39-.39 1.01-.39 1.4 0l4.59 4.59c.39.39.39 1.02 0 1.41l-4.59 4.6c-.39.39-1.01.39-1.4 0-.39-.39-.39-1.01 0-1.4z"/></svg></div>`;
                        break;
                }
                let requestItem = `
                    <div class="qua-requested-theme-card">
                        <div class="qua-requested-theme-card-data">
                            ${themeIcon}
                            <p class="qua-requested-theme-card-link">${themeLink}</p>
                        </div>
                    </div>`;
                themesList += requestItem;
            });
            themeList.innerHTML = themesList;
            document.querySelectorAll('.qua-requested-theme-card-icon').forEach(icon => {
                icon.addEventListener('mouseenter', function(e) {
                    let iconDetails = icon.getBoundingClientRect();
                    if (!document.querySelector('.qua-overlay-theme-tooltip')) {
                        let tooltipNew = document.createElement('div');
                        tooltipNew.className = 'qua-overlay-theme-tooltip';
                        tooltipNew.role = 'tooltip';
                        document.body.appendChild(tooltipNew);
                    }
                    document.querySelector('.qua-overlay-theme-tooltip').textContent = icon.ariaLabel;
                    let tooltipDetails = document.querySelector('.qua-overlay-theme-tooltip').getBoundingClientRect();
                    let tooltipWidth = tooltipDetails.width;
                    document.querySelector('.qua-overlay-theme-tooltip').style.top = iconDetails.y - 55 + 'px';
                    document.querySelector('.qua-overlay-theme-tooltip').style.left = iconDetails.x - (tooltipWidth / 2) + 12 + 'px';
                    document.querySelector('.qua-overlay-theme-tooltip').classList.add('showing');
                });
                icon.addEventListener('mouseleave', function() {
                    document.querySelector('.qua-overlay-theme-tooltip').classList.remove('showing');
                });
            })
        })
        .catch(err => {
            if (!themeList) return;
            themeList.innerHTML = `<div class="qua-loading-screen"><div class="qua-loading-screen-icon"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="var(--qua-overlay-theme)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M24 15c0-2.64-2.05-4.78-4.65-4.96C18.67 6.59 15.64 4 12 4c-1.33 0-2.57.36-3.65.97l1.49 1.49C10.51 6.17 11.23 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 .99-.48 1.85-1.21 2.4l1.41 1.41c1.09-.92 1.8-2.27 1.8-3.81zM3.71 4.56c-.39.39-.39 1.02 0 1.41l2.06 2.06h-.42c-3.28.35-5.76 3.34-5.29 6.79C.46 17.84 3.19 20 6.22 20h11.51l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.12 4.56c-.39-.39-1.02-.39-1.41 0zM6 18c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73l8 8H6z"/></svg></div><p class="qua-loading-screen__title">Community requests are now unavailable.</p></div>`;
        })
    });

    search?.addEventListener('keyup', searchTheme);

    function searchTheme() {
        let input = search,
        filter = input.value.toUpperCase(),
        cards = document.querySelectorAll('.qua-theme-card');

        for (let i = 0; i < cards.length; i++) {
            let searchLabel = cards[i].querySelector('.qua-theme-card__name').textContent;
            let searchLabel2 = cards[i].querySelector('.qua-theme-card__corporation').textContent;
            let searchLabel3 = cards[i].querySelector('.qua-theme-status-label').textContent;
            if (searchLabel.toUpperCase().indexOf(filter) > -1 || searchLabel2.toUpperCase().indexOf(filter) > -1 || searchLabel3.toUpperCase().indexOf(filter) > -1) {
                cards[i].style.display = "";
            } else {
                cards[i].style.display = "none";
            }
        }
    }

    setAllThemes();

    if (typeof settings.account.id != "number" || settings.account.id == "anonymous") {
        requestForm.outerHTML = `<div class="qua-loading-screen"><div class="qua-loading-screen-icon"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="var(--qua-overlay-theme)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M24 15c0-2.64-2.05-4.78-4.65-4.96C18.67 6.59 15.64 4 12 4c-1.33 0-2.57.36-3.65.97l1.49 1.49C10.51 6.17 11.23 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 .99-.48 1.85-1.21 2.4l1.41 1.41c1.09-.92 1.8-2.27 1.8-3.81zM3.71 4.56c-.39.39-.39 1.02 0 1.41l2.06 2.06h-.42c-3.28.35-5.76 3.34-5.29 6.79C.46 17.84 3.19 20 6.22 20h11.51l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.12 4.56c-.39-.39-1.02-.39-1.41 0zM6 18c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73l8 8H6z"/></svg></div><p class="qua-loading-screen__title">You are not logged in. If you want to request a new theme, please login or create a new account and try again. :)</p></div>`;
    }

}

function setLanguageSelector(elem) {
    if (!elem) return;
    let allowedLangs = ["en", "sk"];
    let currentLang = settings.account?.lang ?? "en";
    console.log(currentLang);

    elem.querySelectorAll('option').forEach(option => {
        if (option.value != currentLang) return;

        option.selected = true;
    });

    elem.addEventListener('change', function() {
        let wantedLang = this.value.toLowerCase().trim();
        if (!allowedLangs.includes(wantedLang)) {
            requestSave({
                account: {
                    lang: "en"
                }
            });
            return translateAll();
        }

        requestSave({
            account: {
                lang: wantedLang
            }
        })
        return translateAll();
    });
}

function initSettings() {
    let page = document.querySelector('[qua-overlay-page="settings"]');
    let options = page.querySelectorAll('[qua-overlay-option]');
    let langSelector = page.querySelector('[name="qua-overlay__language"]');
    let cards = page.querySelectorAll('[qua-overlay-option] input[type="radio"]');
    setLanguageSelector(langSelector);

    page.querySelectorAll('input[type="color"]').forEach(input => {
        let inputID = input.getAttribute('id').split('settings/').pop();
        if (settings.overlaySettings[inputID]) {
            let colorValue = ConvertRGBtoHex(settings.overlaySettings[inputID]);
            input.value = colorValue;
            let label = input.parentElement.querySelector('.qua-overlay-settings-option__label')
            if (label) label.textContent = colorValue;
            document.querySelector('.qua-overlay').style.setProperty(`--qua-overlay-${inputID}-rgb-custom`, settings.overlaySettings[inputID]);
        }
        input.addEventListener('input', function() {
            let color = this.value;
            const r = parseInt(color.substr(1, 2), 16);
            const g = parseInt(color.substr(3, 2), 16);
            const b = parseInt(color.substr(5, 2), 16);
            let RGB = `${r} ${g} ${b}`;
            let label = this.parentElement.querySelector('.qua-overlay-settings-option__label');
            if (label) {
                label.textContent = this.value;
            }
            document.documentElement.style.setProperty(`--qua-overlay-${inputID}-rgb-custom`, RGB);
        });
        input.addEventListener('change', function() {
            let color = this.value;
            const r = parseInt(color.substr(1, 2), 16);
            const g = parseInt(color.substr(3, 2), 16);
            const b = parseInt(color.substr(5, 2), 16);
            let RGB = `${r} ${g} ${b}`;
            requestSave({
                overlaySettings: {
                    [inputID]: RGB
                }
            })
        });
    });
    page.querySelector('[qua-action="overlay://settings/clear"]').addEventListener('click', function() {
        requestSave({
            overlaySettings: null
        });
        page.querySelectorAll('input[type="color"]').forEach(input => {
            let inputID = input.getAttribute('id').split('settings/').pop();
            document.documentElement.style.removeProperty(`--qua-overlay-${inputID}-rgb-custom`);
            let defaultValue = getComputedStyle(document.documentElement).getPropertyValue(`--qua-overlay-${inputID}-rgb-default`);
            defaultValue = ConvertRGBtoHex(defaultValue);
            input.value = defaultValue;
            let label = input.parentElement.querySelector('.qua-overlay-settings-option__label')
            if (label) label.textContent = defaultValue;
        });
    });

    // TODO - Overlay settings
    options?.forEach(option => {
        let input = option.querySelector('.qua-overlay-switch_input');
        let optionID = option.getAttribute('qua-overlay-option');

        if (settings.overlaySettings[optionID] == "on") {
            input.checked = true;
        }

        input?.addEventListener('change', function() {
            if (this.checked) {
                return requestSave({
                    overlaySettings: {
                        [optionID]: "on"
                    }
                });
            }
            requestSave({
                overlaySettings: {
                    [optionID]: null
                }
            });
        });
    });
    cards?.forEach(option => {
        let parent = option.closest('[qua-overlay-option]');
        let optionID = parent.getAttribute('qua-overlay-option');
        let label = option.closest('label');

        let savedSetting = settings.overlaySettings[optionID];

        // console.log(`Saved setting: ${savedSetting}; This value: ${option.value}`);
        if (option.value == savedSetting) {
            option.checked = true;
            label.setAttribute('qua-overlay-setting-status', 'checked');
        }

        option?.addEventListener('change', function(e) {
            console.log(`Setting for ${optionID} was changed to ${this.value}`);

            requestSave({
                overlaySettings: {
                    [optionID]: this.value
                }
            });
        });
    });
}
function feedbackInit() {
    const form = overlaySelect('feedback.form-container');
    const clear_button = overlaySelect('feedback.clear_button');
    const config = {
        required: [
            "qua-overlay@feedback_rating",
            "qua-overlay@feedback_category",
            "qua-overlay@feedback_type",
            "qua-overlay@feedback_message"
        ],
        rules: {
            "qua-overlay@feedback_message": {
                minLength: 2,
                maxLength: 200
            }
        }
    };
    
    if (typeof settings.account.id != "number" || settings.account.id == "anonymous") {
        return form.outerHTML = `<div class="qua-loading-screen"><div class="qua-loading-screen-icon"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="var(--qua-overlay-theme)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M24 15c0-2.64-2.05-4.78-4.65-4.96C18.67 6.59 15.64 4 12 4c-1.33 0-2.57.36-3.65.97l1.49 1.49C10.51 6.17 11.23 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 .99-.48 1.85-1.21 2.4l1.41 1.41c1.09-.92 1.8-2.27 1.8-3.81zM3.71 4.56c-.39.39-.39 1.02 0 1.41l2.06 2.06h-.42c-3.28.35-5.76 3.34-5.29 6.79C.46 17.84 3.19 20 6.22 20h11.51l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.12 4.56c-.39-.39-1.02-.39-1.41 0zM6 18c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73l8 8H6z"/></svg></div><p class="qua-loading-screen__title">You are not logged in. To leave feedback, please login or create a new account and try again. :)</p></div>`;
    }
    
    let allInputs = form.querySelectorAll('input, textarea, select');

    
    clear_button.addEventListener('click', function() {
        allInputs.forEach(input => {
            if (input.type == "checkbox" || input.type == "radio") {
                return input.checked = false;
            }
            return input.value = '';
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        let formData = new FormData(form);

        for (const field of config.required) {
            const value = formData.get(field);
            if (!value) {
                return quartyn.error(`Input ${field} dont have any value.`);
            }

            const rules = config.rules[field];

            if (rules) {
                if (rules.minLength && value.length < rules.minLength) {
                    console.log(`${field} must be at least ${rules.minLength} characters`);
                    return;
                }
        
                if (rules.maxLength && value.length > rules.maxLength) {
                    console.log(`${field} must be at most ${rules.maxLength} characters`);
                    return;
                }
        
                if (rules.pattern && !rules.pattern.test(value)) {
                    console.log(`${field} does not match the pattern`);
                    return;
                }
            }
        }


        // allInputs.forEach(input => {
        //     let key = input.name;
        //     let value = input.value;

        //     console.log(`Input ${key} has value ${value}`);

        //     if (input.type == "radio" && input.checked == false) return;

        //     if (value === "") {
        //         value = "__EMPTY__";
        //     }

        //     formData.set(key, value);
        // });

        // console.log(formData);
        // for (const [key, value] of formData) {
        //     console.log(`${key}: ${value}`);
        // }

        return;

        let feedbackRating = qs('input[name="qua-rating"]:checked');
        let feedbackCategory = qs('input[name="qua-feedback-category"]:checked');
        let feedbackType = qs('input[name="qua-feedback-type"]:checked');
        let feedbackMessage = qs('textarea[name="qua-fb-message"]');

        let data = new URLSearchParams(new FormData(this)).toString();
    
        if (feedbackRating === null || feedbackCategory === null || feedbackType === null || feedbackMessage === null) {
            new OverlayNotification({
                title: "Please fill all options in this form. Thanks:)"
            }).send();
            return false;
        }
    
        let parentIs = feedbackForm.closest('.data-content');
        parentIs.innerHTML = `<div class="qua-loading-screen"><div class="qua-loading-screen-icon"><svg class="qua-circular-loading" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="19" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div><p class="qua-loading-screen__title">Your feedback is on the way..</p></div>`;
    
        let feedbackData = {
            qua: "feedback",
            userid: quserDatas['id'],
            rating: feedbackRating.value,
            category: feedbackCategory.value,
            type: feedbackType.value,
            message: feedbackMessage.value
        }

        BrowserApi.runtime.sendMessage({ id: "sendFeedback", body: data }, function(response) {

        })
        .catch(err => {
            
        })
        try {
            BrowserApi.runtime.sendMessage(feedbackData, function(response) {
                if (response.status !== 202) {
                    parentIs.innerHTML = `<div class="qua-loading-screen"><div class="qua-loading-screen-icon"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="var(--qua-overlay-theme)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M24 15c0-2.64-2.05-4.78-4.65-4.96C18.67 6.59 15.64 4 12 4c-1.33 0-2.57.36-3.65.97l1.49 1.49C10.51 6.17 11.23 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 .99-.48 1.85-1.21 2.4l1.41 1.41c1.09-.92 1.8-2.27 1.8-3.81zM3.71 4.56c-.39.39-.39 1.02 0 1.41l2.06 2.06h-.42c-3.28.35-5.76 3.34-5.29 6.79C.46 17.84 3.19 20 6.22 20h11.51l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.12 4.56c-.39-.39-1.02-.39-1.41 0zM6 18c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73l8 8H6z"/></svg></div><p class="qua-loading-screen__title">Feedback is currently unavailable. :(</p></div>`;
                    new OverlayNotification({
                        title: "Unable to send feedback."
                    }).send();
                    return;
                }
                parentIs.innerHTML = `<div class="qua-loading-screen"><div class="qua-loading-screen-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zm-8.64 6.25c-.39.39-1.02.39-1.41 0L7.2 14.2c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L10 14.18l4.48-4.48c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-5.18 5.18z"/></svg></div><p class="qua-loading-screen__title">Your feedback was successfully sent. Thank youuu ❤️</p></div>`;
                new OverlayNotification({
                    title: "Thanks for you feedback 🙃'"
                }).send();
            });
        } catch(error) {
            parentIs.innerHTML = `<div class="qua-loading-screen"><div class="qua-loading-screen-icon"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="var(--qua-overlay-theme)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M24 15c0-2.64-2.05-4.78-4.65-4.96C18.67 6.59 15.64 4 12 4c-1.33 0-2.57.36-3.65.97l1.49 1.49C10.51 6.17 11.23 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 .99-.48 1.85-1.21 2.4l1.41 1.41c1.09-.92 1.8-2.27 1.8-3.81zM3.71 4.56c-.39.39-.39 1.02 0 1.41l2.06 2.06h-.42c-3.28.35-5.76 3.34-5.29 6.79C.46 17.84 3.19 20 6.22 20h11.51l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.12 4.56c-.39-.39-1.02-.39-1.41 0zM6 18c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73l8 8H6z"/></svg></div><p class="qua-loading-screen__title">Feedback is currently unavailable. :(</p></div>`;
            new OverlayNotification({
                title: "There was an error while submitting feedback, please refresh tab & try again later."
            }).send();
            quartyn.error(error);
        }
    });
}
function initMusic() {
    const playlists = [
        "https://open.spotify.com/embed/playlist/2VixhP22MboCYtZWcgrtjX?utm_source=QuartTools",
        "https://open.spotify.com/embed/playlist/0EUNsRP0esKrnbn13yXheR?utm_source=QuartTools",
        "https://open.spotify.com/embed/playlist/7sqizqKubPlO8xSTn6znrA?utm_source=QuartTools"    
    ]
    let load_button = overlaySelect('music.load-button');
    let load_screen = overlaySelect('music.load-screen');
    let playlist_list = overlaySelect('music.list');

    load_button.addEventListener('click', function() {        
        playlists.forEach(playlist => {
            const playlist_container = document.createElement('div');
            playlist_container.innerHTML = `
            <iframe qtag="quartyn-music" style="visibility:hidden;" loading="lazy" src="" width="100%" height="380" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
            <div class="qua-loading">
                <qloader></qloader>
            </div>`
            const iframe = playlist_container.querySelector('iframe');
            iframe.addEventListener('load', function() {
                this.style.visibility = 'visible';
            });
            iframe.src = playlist;
            playlist_list.appendChild(playlist_container);
        });
        load_screen.remove();
    });   
}

function welcomeScreen(userData = {
    id: 0,
    name: "",
    username: "",
    avatar: ""
}) {
    let auth_screen = document.querySelector('.qua-overlay_auth-screen');

    auth_screen.innerHTML = `
    <div class="qua-overlay_welcome-screen qua-overlay__welcome-screen">
        <img class="qua-overlay__welcome-screen--image">
        <p class="qua-overlay__welcome-screen--title">Welcome back</p>
        <p class="qua-overlay__welcome-screen--name">Loading..</p>
        <p class="qua-overlay__welcome-screen--username">@Loading..</p>
        <button class="qua-overlay__welcome-screen--button qua-overlay-button">Continue to the app! 🙃</button>
        <div class="qua-overlay_loading-bar qua-overlay_auth-loading">
            <div class="qua-overlay_loading-status"></div>
        </div>
    </div>
    `;
    auth_screen.querySelector('.qua-overlay__welcome-screen--name').textContent = userData.name;
    auth_screen.querySelector('.qua-overlay__welcome-screen--username').textContent = `@${userData.username}`;

    let letterAvatar = createAvatarLetter(userData.name ?? userData.username);
    auth_screen.querySelector('.qua-overlay__welcome-screen--image').src = letterAvatar;
    
    if (userData.avatar) {
        BrowserApi.runtime.sendMessage({id: "getImage", link: userData.avatar}, function(response) {
            if (response?.status !== 200) {
                return new OverlayNotification({
                    title: response?.message
                }).send();
            }
    
            auth_screen.querySelector('.qua-overlay__welcome-screen--image').src = response.uri;
        })
    }
    let hi = setLoading({
        duration: 5000,
        bar: auth_screen.querySelector('.qua-overlay_loading-status'),
        then: loadAccountPage
    });
    auth_screen.querySelector('.qua-overlay-button').addEventListener('click', function() {
        hi.remove();
        loadAccountPage();
    });
    setUserData();
}
function loadAccountPage() {
    fetch(BrowserApi.runtime.getURL('/ui/overlay.html'))
    .then(html => html.text())
    .then(html => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const accountPage = temp.querySelector('[qua-overlay-page="account"]');

        document.querySelector('[qua-overlay-page="account"]').innerHTML = accountPage.innerHTML;
        setUserData();
        initAccount();
    });
}
function authenticationListener(message = "welcome") {
    let root = document.querySelector('.qua-overlay');
    let overlay = document.querySelector('.q-overlay');

    init();
    
    if (message == "welcome") {
        
    }
    
    if (message == "loggedIn") {
        
    }
}
function resetListener() {
    document.querySelectorAll('.q-overlay input[type="checkbox"]').forEach(input => {
        input.checked = false;
    });
}

function logoutUser() {
    const auth_screen = document.querySelector('[qua-overlay-page="account"]');
    settings.account = null; // Delete loaded variables
    
    quartyn.success('You have been logged out successfully.');

    auth_screen.innerHTML = `
    <div class="qua-overlay_logout-screen">
        <div class="qua-overlay_auth-screen_spacer"></div>
        <p class="qua-overlay_logout-screen_title">You have been <span class="qua-overlay_pretty-color">logged out</span>.</p>
        <p class="qua-overlay_logout-screen_message">You have been logged out from this account. If you want to log back in, you can use the button bellow.</p>
        <button class="qua-overlay_logout-screen_btn qua-overlay-button">Go to login screen</button>
        <div class="qua-overlay_loading-bar qua-overlay_auth-loading">
            <div class="qua-overlay_loading-status"></div>
        </div>
        <div class="qua-overlay_auth-screen_spacer"></div>
    </div>`;
    let loading = auth_screen.querySelector('.qua-overlay_loading-status');
    let bye = setLoading({
        duration: 5000,
        bar: loading,
        then: setupLoginScreen
    });
    auth_screen.querySelector('.qua-overlay_logout-screen .qua-overlay_logout-screen_btn').addEventListener('click', function() {
        bye.remove();
        setupLoginScreen();
    });
    new overlayNotification({
        title: "You have been logged out",
        message: "You have been successfully logged out. You can log back in anytime you want.",
        duration: 6000
    });
    setUserData();
}
function clearSettings() {
    console.log("Overlay on this page was requested to clear user's settings. Accepting..")
}

// #region Avatar Handler
function createAvatarLetter(name) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const size = 100; // Size of the canvas and the resulting image
    const backgroundColor = 'rgba(255, 255, 255, .03)'; // The background color for the letter
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--qua-overlay-theme').trim(); // Text color of the letter (Get color of selected theme)
    const fontSize = size * 0.45; // Set the font size relative to the canvas size
  
    canvas.width = size;
    canvas.height = size;
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, size, size);
  
    context.font = `${fontSize}px 'Outfit', sans-serif`;
    context.fillStyle = textColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name[0].toUpperCase(), size / 2, size / 2);
  
    const dataURI = canvas.toDataURL();
    return dataURI;
}
// #endregion

// #region Some Functions
function qs(selector) {
    return document.querySelector(selector);
}
function openOverlay(tab) {
    let overlay = document.querySelector('.qua-overlay');
    if (!overlay) return;
    if (overlay.getAttribute('qaction') === 'active' && overlay.classList.contains('qactive')) {
        overlay.classList.remove('qactive');
        overlay.removeAttribute('qaction');
        document.documentElement.removeAttribute('qua-overlay');
    } else {
        overlay.setAttribute('qaction', 'active');
        overlay.classList.add('qactive');
        document.documentElement.setAttribute('qua-overlay', 'open');
    }

    openPage(tab);
}
// #endregion

// #region Version
function checkVersion() {
    const version = "2.7.9";
    const title = "New theme system has been released!";
    const message = "Hi there, new system for themes has been released. Faster & easier to use. Enjoy <3";

    let currentVersion = settings?.client?.version;
    if (currentVersion === version) return false;
    if (currentVersion == null || currentVersion == undefined) {
        return requestSave({
            client: {
                version: version
            }
        });
    }

    if (!settings?.overlaySettings?.update_notifications) {
        // Update the version even while notifications aren't enabled.
        requestSave({
            client: {
                version: version
            }
        });
        return false;
    };

    let updateNotification = new ScreenNotification({
        title: title,
        description: message,
        main: {
            text: "I understand.",
            action: function() {
                requestSave({
                    client: {
                        version: version
                    }
                });
                updateNotification.close();
            }
        }
    });
    updateNotification.send();
}
// #endregion

// #endregion

// #endregion

// #region QuartTools Theme Storage System && Overlay Storage

function clearStorage() {
    return requestSave({
        account: { isLogged: false },
        themes: {},
        options: {},
        overlaySettings: {},
        webCustomization: {}
    })
}

// saveCustomization({
//     id: "quartyn.com",
//     'qua-themes-text-color': '#cyan-test',
//     'qua-themes-theme-rgb': 'another'
// });

// saveCustomization({
//     id: "photos.google.com",
//     '--qua-themes-text-color': '221 66 245'
// });

async function saveCustomization({index} = {}) {
    if (arguments.length < 1) {
        quartyn.error(`Function saveCustomization is not allowed to run without arguments. Minimum argument is 1.`);
        return;
    }
    
    let response = await BrowserApi.storage.sync.get();
    let customization = response['theme_customization'];
    console.log(customization);
    !customization ? customization = {} : customization;
    console.log(customization);
    
    for (let i = 0; i < arguments.length; i++) {
        let themeCustomization = arguments[i];
        let themeID = themeCustomization['id'];
        if (!themeID) continue;

        delete themeCustomization['id'];

        customization[themeID] == undefined ? customization[themeID] = {} : customization[themeID];
        console.log(customization[themeID]);
        for (let [key, value] of Object.entries(themeCustomization)) {
            customization[themeID][key] = value;
            console.log(`I am storing key ${key} as ${value} inside of database with id ${themeID}`)
        }
    }
    BrowserApi.storage.sync.set({'theme_customization': customization })
    .then(() => {
        quartyn.success(`Customization was saved!`);
        console.table(customization);
    })
    .catch(error => {
        console.log(error);
    })
}

async function getCustomization({id} = {}) {
    if (!id) {quartyn.error(`ID is missing for getCustomization.`); return;};

    let response = await BrowserApi.storage.sync.get('theme_customization');
    let data = response.theme_customization;

    return data[id];
}

function addDraggable(element, limit = {x: 0}) {
    let offsetX, offsetY, isDragging = false;
  
    element.addEventListener('mousedown', (event) => {
      isDragging = true;
      offsetX = event.clientX - element.getBoundingClientRect().left;
      offsetY = event.clientY - element.getBoundingClientRect().top;
    });
  
    document.addEventListener('mousemove', (event) => {
      if (isDragging) {
        element.parentElement.style.left = (event.clientX - offsetX) + 'px';
        if (event.clientY > offsetY) {
            element.parentElement.style.top = (event.clientY - offsetY) + 'px';
        }
      }
    });
  
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
}

// getCustomization();

// function qStats(t) {
//     let qmsg = {
//         qua: "stats",
//         type: t
//     }
//     try {
//         BrowserApi.runtime.sendMessage(qmsg);
//     } catch (err) {
//         quartyn.error('It Seems, that Extension was Updated in the Background... Refresh Tab to apply New Version.');
//     }
// }

// #region Listeners
let quartyn_elements = [
    "qua-button"
];
document.addEventListener('keydown', function(e) {
    if (!quartyn_elements.includes(document.activeElement.tagName.toLowerCase())) return;
    if (e.key !== "Enter" && e.code !== "Space") return;
    e.preventDefault();
    document.activeElement.click();
});
// #endregion
