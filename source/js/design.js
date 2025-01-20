(function(window) {

    let developerURL = `http://127.0.0.1:5500/design/themes/`;
    let catalogue = {
        default: "http://localhost:5559/catalogue.json",
        others: []
    }

    function checkHeaders() {
        return new Promise((resolve, reject) => {
            let checker = setInterval(() => {
                if (document.head && document.head.querySelector('quartyn')) {
                    clearInterval(checker);
                    resolve("OK");
                }
                if (document.head && !document.head.querySelector('quartyn')) {
                    clearInterval(checker);
                    let header = document.createElement('quartyn');
                    header.setAttribute('qua-design.js', '')
                    header.innerHTML = `<qua-design type="quartyn/design"></qua-design><qua-scripts type="quartyn/scripts"></qua-scripts>`;
                    document.head.appendChild(header);
                    resolve("OK");
                }
            }, 10);
        });
    }
    function isThisPage(url) {
        return window.location.host == url || window.location.host.includes(url);
    }

    function showThemesError(elem, text = "Store is currently unavailable.") {
        if (!elem) return;

        let isOnline = navigator.onLine;
        if (!isOnline) text += ` You are offline.`;

        elem.innerHTML = `<div class="qua-loading-screen"><div class="qua-loading-screen-icon"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="var(--qua-overlay-theme)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M24 15c0-2.64-2.05-4.78-4.65-4.96C18.67 6.59 15.64 4 12 4c-1.33 0-2.57.36-3.65.97l1.49 1.49C10.51 6.17 11.23 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 .99-.48 1.85-1.21 2.4l1.41 1.41c1.09-.92 1.8-2.27 1.8-3.81zM3.71 4.56c-.39.39-.39 1.02 0 1.41l2.06 2.06h-.42c-3.28.35-5.76 3.34-5.29 6.79C.46 17.84 3.19 20 6.22 20h11.51l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.12 4.56c-.39-.39-1.02-.39-1.41 0zM6 18c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73l8 8H6z"/></svg></div><p class="qua-loading-screen__title">${text}</p></div>`;
    }

    // #region Themes catalog
    let themeDataHTML = '';
    let themeDataContent = {
        status: 'waiting',
        body: ``,
        cards: []
    }
    let themeCards = [];
    fetch('https://raw.githubusercontent.com/Quartyn/QuartTools/main/design/qua_themes.json')
    .then(response => response.json())
    .then(data => {
        let qua_themes = data['qthemes'];
        themeDataContent.status = 'ok';
        for (let i = 0; i < qua_themes.length; i++) {
            let themeInDevelopment = '';
            let theme = {
                name: qua_themes[i]['name'],
                identifier: qua_themes[i]['identifier'] ?? theme.name,
                url: qua_themes[i]['url'],
                requested_by: qua_themes[i]['reqby'],
                author: qua_themes[i]['author'] ?? 'Quartyn',
                status: qua_themes[i]['status'] ?? '',
                image: qua_themes[i]['image'],
                id: qua_themes[i]['qname'],
                website: qua_themes[i]['website'] ?? '#',
                corporation: qua_themes[i]['by'],
                version: qua_themes[i]['version'] ?? 'Beta'
            };

            if (theme.status == 'In Development') {
                themeInDevelopment = `<div class="qua-theme-overlay" title="In Development"><svg xmlns="http://www.w3.org/2000/svg" height="60px" viewBox="0 0 24 24" width="60px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/></svg></div>`;
            } else {
                if (isThisPage(theme.url)) theme.status = 'Recommended';
            }

            if (window.location.host == theme.url || window.location.host.includes(theme.url)) {
                document.documentElement.setAttribute('qua-theme:mode', 'dark');
                document.documentElement.setAttribute('qua-theme:id', theme.url);
                document.documentElement.setAttribute('qua-theme:path', window.location.pathname);
                document.documentElement.setAttribute('qua-theme:domain', window.location.hostname);
            }

            themeDataHTML += `<qua-button role="button" tabindex="0" class="qua-theme-card quartyn-pretty-click" qua-theme:id="${theme.url}" qua-theme:website="${theme.website}" qua-theme:image="${theme.image}" qua-theme:name="${theme.identifier}" qua-theme:status="${theme.status}" ${quartynThemes[theme.url] == 'enabled' ? 'qua-theme\:active="true"' : 'qua-theme\:active="false"'}>
                            ${themeInDevelopment}
                            <div class="qua-theme-header">
                                <p class="qua-theme-status-label">${theme.status}</p>
                                <div class="qua-overlay-theme-card__header-controls">
                                    <a class="qua-overlay-theme-card__header-controls-button" href='https://quartyn.com/tools/themes/${theme.url}/report' target="_blank" title="Report bug in ${theme.identifier} theme" aria-label="Report bug in ${theme.identifier} theme">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.4 6l-.24-1.2c-.09-.46-.5-.8-.98-.8H6c-.55 0-1 .45-1 1v15c0 .55.45 1 1 1s1-.45 1-1v-6h5.6l.24 1.2c.09.47.5.8.98.8H19c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1h-4.6z"/></svg>
                                    </a>
                                    <a class="qua-overlay-theme-card__header-controls-button" href='${theme.website}' target='_blank' title="Visit official website • ${theme.website}" aria-label="Visit official website • ${theme.website}">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z"/></svg>
                                    </a>
                                    <qua-button class="qua-overlay-theme-card__header-controls-button" tabindex="0" role="button" title="Customize theme." aria-label="Customize theme." qua-action="customize">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 18c0 .55.45 1 1 1h5v-2H4c-.55 0-1 .45-1 1zM3 6c0 .55.45 1 1 1h9V5H4c-.55 0-1 .45-1 1zm10 14v-1h7c.55 0 1-.45 1-1s-.45-1-1-1h-7v-1c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1zM7 10v1H4c-.55 0-1 .45-1 1s.45 1 1 1h3v1c0 .55.45 1 1 1s1-.45 1-1v-4c0-.55-.45-1-1-1s-1 .45-1 1zm14 2c0-.55-.45-1-1-1h-9v2h9c.55 0 1-.45 1-1zm-5-3c.55 0 1-.45 1-1V7h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1z"/></svg>
                                    </qua-button>
                                </div>
                            </div>
                            <div class="qua-theme-icon">
                                <img src="" alt="${theme.name} Logo">
                            </div>
                            <div class="qua-theme-info">
                                <div class="qua-theme-status-enabled">
                                    <p class="theme--active" title="This theme is Enabled">Enabled</p>
                                    <p class="theme--unactive" title="This theme is disabled">Disabled</p>
                                </div>
                                <div class="qua-theme-card__name">${theme.name}</div>
                                <div class="qua-theme-card__corporation">${theme.corporation}</div>
                            </div>
                            <div class="qua-theme-speci ${settings.overlaySettings['showThemeDetails'] == "on" ? 'qua-developer-mode' : ''}">
                                <p class="qua-theme-version">${theme.version}</p>
                                <p class="qua-theme-requester">Made by ${theme.author}</p>
                            </div>
                        </qua-button>`;
            // themeDataHTML += `
            // <qua-button role="button" tabindex="0" class="qua-theme-card quartyn-pretty-click" qua-theme:id="${theme.url}" qua-theme:website="${theme.website}" qua-theme:image="${theme.image}" qua-theme:name="${theme.identifier}" qua-theme:status="${theme.status}" ${quartynThemes[theme.url] == 'enabled' ? 'qua-theme\:active="true"' : 'qua-theme\:active="false"'}>
            //     ${themeInDevelopment}
            //     <div class="qua-theme-header">
            //         <div class="qua-overlay-theme-card__header-controls">
            //             <a class="qua-overlay-theme-card__header-controls-button" href='https://quartyn.com/tools/themes/${theme.url}/report' target="_blank" title="Report bug in ${theme.identifier} theme" aria-label="Report bug in ${theme.identifier} theme">
            //                 <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.4 6l-.24-1.2c-.09-.46-.5-.8-.98-.8H6c-.55 0-1 .45-1 1v15c0 .55.45 1 1 1s1-.45 1-1v-6h5.6l.24 1.2c.09.47.5.8.98.8H19c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1h-4.6z"/></svg>
            //             </a>
            //             <a class="qua-overlay-theme-card__header-controls-button" href='${theme.website}' target='_blank' title="Visit official website • ${theme.website}" aria-label="Visit official website • ${theme.website}">
            //                 <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z"/></svg>
            //             </a>
            //             <qua-button class="qua-overlay-theme-card__header-controls-button" tabindex="0" role="button" title="Customize theme." aria-label="Customize theme." qua-action="customize">
            //                 <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 18c0 .55.45 1 1 1h5v-2H4c-.55 0-1 .45-1 1zM3 6c0 .55.45 1 1 1h9V5H4c-.55 0-1 .45-1 1zm10 14v-1h7c.55 0 1-.45 1-1s-.45-1-1-1h-7v-1c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1zM7 10v1H4c-.55 0-1 .45-1 1s.45 1 1 1h3v1c0 .55.45 1 1 1s1-.45 1-1v-4c0-.55-.45-1-1-1s-1 .45-1 1zm14 2c0-.55-.45-1-1-1h-9v2h9c.55 0 1-.45 1-1zm-5-3c.55 0 1-.45 1-1V7h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1z"/></svg>
            //             </qua-button>
            //         </div>
            //     </div>
            //     <div class="qua-overlay__theme-card--body">
            //         <div class="qua-theme-info">
            //             <div class="qua-theme-status-enabled" style="display: none;">
            //                 <p class="theme--active" title="This theme is Enabled">Enabled</p>
            //                 <p class="theme--unactive" title="This theme is disabled">Disabled</p>
            //             </div>
            //             <div class="qua-theme-card__name">${theme.name} <p class="qua-theme-status-label">${theme.status}</p></div>
            //             <div class="qua-theme-card__corporation">${theme.corporation}</div>
            //         </div>
            //         <div class="qua-theme-icon">
            //             <img src="" alt="${theme.name} Logo">
            //         </div>
            //     </div>
            //     <div class="qua-theme-speci ${settings.overlaySettings['showThemeDetails'] == "on" ? 'qua-developer-mode' : ''}">
            //         <p class="qua-theme-version">${theme.version}</p>
            //         <p class="qua-theme-requester">Made by ${theme.author}</p>
            //     </div>
            // </qua-button>`;
        }
    }).catch(err => {
        console.error('QuartTools: App was unable to communicate with Quartyn servers. If you have internet connection and this problem still shows, please contact me on instagram @Quartyn_. app::SERVER_ERROR');
        themeDataContent.status = "error";
        quartyn.error(err);
    });
    function setImages() {
        let buttons = document.querySelectorAll('.qua-theme-card');
        buttons.forEach(button => {
            button.querySelector('img').onload = function() {
                this.classList.add('qua-theme-icon--loaded');
            }
        })
        function setDefaultImage(i) {
            buttons[i].querySelector('.qua-theme-icon img').src = chrome.runtime.getURL('/img/app/logo48.solid.png');
        }
        for (let i = 0; i < buttons.length; i++) {
            let imageID = buttons[i].getAttribute('qua-theme:image');
            if (imageID === 'undefined') {
                setDefaultImage(i);
            } else
            if (imageID.includes('https://')) {
                fetch(imageID)
                .then(response => response.blob())
                .then(data => {
                    console.log(data.type);
                    if (data.type === 'text/plain') {
                        setDefaultImage(i);
                    }
                    if (data.type === 'image/png') {
                        let imageURL = URL.createObjectURL(data);
                        buttons[i].querySelector('.qua-theme-icon img').src = imageURL;
                    }
                })
            } else {
                fetch(`https://raw.githubusercontent.com/Quartyn/QuartTools/main/design/images/${imageID}.png`)
                .then(response => response.blob())
                .then(data => {
                    if (data.type === 'text/plain') {
                        setDefaultImage(i);
                    }
                    if (data.type === 'image/png') {
                        let imageURL = URL.createObjectURL(data);
                        buttons[i].querySelector('.qua-theme-icon img').src = imageURL;
                    }
                })
            }
            buttons[i].removeAttribute('qua-theme:image');
        }
    }

    // #endregion of Themes Catalog

    // #region Local development studio
        function ImportFile(file) {
            console.log(file);
            let themeURL = developerURL + file;
            let CSS = document.createElement('link');
            CSS.rel = 'stylesheet';
            CSS.type = 'text/css';
            CSS.addEventListener('error', (e) => {
                quartyn.error(`We have an error with local developer theme!`);
                if (document.querySelector(`[qua-class="quartyn/theme-design"]`)) {
                    document.querySelector(`[qua-class="quartyn/theme-design"]`).setAttribute('online-version', 'true');
                    document.querySelector(`[qua-class="quartyn/theme-design"]`).removeAttribute('media');
                }
                throw Error('Error bro');
            });
            // writing my extreme code
            CSS.crossOrigin = 'anonymous';
            fetch(themeURL, {
                headers: {
                    "Accept": "text/css"
                }
            })
            .then(res => res.text())
            .then(() => {
                quartyn.success('Local theme was loaded!');
                checkHeaders().then(() => {
                    let clearer = setInterval(() => {
                        if (document.querySelector('qua-design style[qua-class="quartyn/theme-design"]:not([online-version="true"])')) {
                            clearInterval(clearer);
                            document.querySelector('qua-design style[qua-class="quartyn/theme-design"]').setAttribute('media', 'clear');
                            quartyn.success(`Online theme was disabled! Local theme is now actived!`);
                        }
                    }, 1000);
                    document.head.querySelector('quartyn qua-design').appendChild(CSS);
                }).catch(err => {
                    console.log('Some error with loader', err);
                })
            })
            .catch(err => {
                console.log(err);
            });

            CSS.href = themeURL;
            file = file.split('/').pop();
            document.documentElement.setAttribute('qua-theme:mode', 'dark');
            document.documentElement.setAttribute('qua-theme:id', file);
            document.documentElement.setAttribute('qua-theme:path', window.location.pathname);
            document.documentElement.setAttribute('qua-theme:domain', window.location.hostname);
        }
        function importTheme(file) {
            let themeURL = chrome.runtime.getURL(`/dev/themes/${file}`);
            let CSS = document.createElement('link');
            CSS.rel = 'stylesheet';
            CSS.type = 'text/css';
            CSS.addEventListener('error', (e) => {
                quartyn.error(`We have an error with local developer theme!`);
                if (document.querySelector(`[qua-class="quartyn/theme-design"]`)) {
                    document.querySelector(`[qua-class="quartyn/theme-design"]`).setAttribute('online-version', 'true');
                    document.querySelector(`[qua-class="quartyn/theme-design"]`).removeAttribute('media');
                }
                throw Error('Error bro');
            });
            // writing my extreme code
            CSS.crossOrigin = 'anonymous';
            fetch(themeURL, { headers: { "Accept": "text/css" } })
            .then(res => res.text())
            .then(() => {
                quartyn.success('Local theme was loaded!');
                checkHeaders().then(() => {
                    let clearer = setInterval(() => {
                        if (document.querySelector('qua-design style[qua-class="quartyn/theme-design"]:not([online-version="true"])')) {
                            clearInterval(clearer);
                            document.querySelector('qua-design style[qua-class="quartyn/theme-design"]').setAttribute('media', 'clear');
                            quartyn.success(`Online theme was disabled! Local theme is now actived!`);
                        }
                    }, 1000);
                    document.head.querySelector('quartyn qua-design').appendChild(CSS);
                }).catch(err => {
                    console.log('Some error with loader', err);
                })
            })
            .catch(err => {
                console.log(err);
            });

            CSS.href = themeURL;
            file = file.split('/').pop();
            document.documentElement.setAttribute('qua-theme:mode', 'dark');
            document.documentElement.setAttribute('qua-theme:id', file);
            document.documentElement.setAttribute('qua-theme:path', window.location.pathname);
            document.documentElement.setAttribute('qua-theme:domain', window.location.hostname);
        }

        function codingTheme(url) {
            let regex = url;
            regex = regex.replaceAll('.*', '\..*?');
            regex = regex.replaceAll('*.', '.*\.?');
            regex = regex.replaceAll('/', '\/');
            regex = regex.replaceAll('/*', '/.*?');
            // regex = regex.replaceAll('*', '.*');

            let isItThisWeb = false;
            if (url.includes('/')) {
                // console.log(`Reg result for ${window.location.href}:`, regResult, ` Pattern: ${regex}`);
                isItThisWeb = new RegExp(regex).test(window.location.href);
                if (isItThisWeb) {
                    quartyn.success('Special link!');
                }
            } else {
                // console.log(`Reg result for ${window.location.host}:`, regResult, ` Pattern: ${regex}`);
                isItThisWeb = new RegExp(regex).test(window.location.host);
            }

            // if (window.location.host === url || window.location.host.includes(url)) {
            if (!isItThisWeb) return;

            url = url.replaceAll('*', 'xxx');
            url = url.split('/').shift();

            console.log(`%cWe are setupping local theme Coding Workspace\n%cFor website: ${location.href}`, 'font-size: 40px; color: rgb(141 135 253); font-family: "Outfit", sans-serif;', 'font-size: .8rem; margin-left: 5px; color: rgb(141 135 253); font-family: "Outfit", sans-serif;');
            if (window.location.href.includes('?light')) return;
            // ImportFile(`/css/developer/${url}.qtheme.css`, 'dark');
            ImportFile(`${url}.qtheme.css`, 'dark');
            // }
        }

        function devTheme(url) {
            let regex = url;
            regex = regex.replaceAll('.*', '\..*?');
            regex = regex.replaceAll('*.', '.*\.?');
            regex = regex.replaceAll('/', '\/');
            regex = regex.replaceAll('/*', '/.*?');

            let isItThisWeb = false;
            if (url.includes('/')) {
                // console.log(`Reg result for ${window.location.href}:`, regResult, ` Pattern: ${regex}`);
                isItThisWeb = new RegExp(regex).test(window.location.href);
                if (isItThisWeb) {
                    quartyn.success('Special link!');
                }
            } else {
                // console.log(`Reg result for ${window.location.host}:`, regResult, ` Pattern: ${regex}`);
                isItThisWeb = new RegExp(regex).test(window.location.host);
            }

            // if (window.location.host === url || window.location.host.includes(url)) {
            if (!isItThisWeb) return;

            url = url.replaceAll('*', 'xxx');
            url = url.split('/').shift();

            console.log(`%cWe are setupping local theme Coding Workspace\n%cFor website: ${location.href}`, 'font-size: 40px; color: rgb(141 135 253); font-family: "Outfit", sans-serif;', 'font-size: .8rem; margin-left: 5px; color: rgb(141 135 253); font-family: "Outfit", sans-serif;');
            if (window.location.href.includes('?light')) return;
            importTheme(`${url}.css`);
        }
    // #endregion

    // #region Developer themes
    checkHeaders().then(() => {
        // codingTheme('translate.google.*');
        // codingTheme(`*.pinterest.*`); // Template for pattern domain themes.
    });

    let debuggerKeys = {};
    document.addEventListener('keydown', (e) => {
        debuggerKeys[e.code] = true;
        if (debuggerKeys['AltRight'] && e.code == 'KeyQ') {
            debugger;
        }
        document.addEventListener('keyup', (e) => {
            debuggerKeys[e.code] = undefined;
        })
    });

    //#endregion

    // #region Storage
    let quartynThemes = {};
    themeData();

    function themeData() {
        chrome.storage.sync.get('settings', function(result) {
            let currentSettings = result.settings || {};
            quartynThemes = currentSettings.themes || {}
            for (let quaThemeID in quartynThemes) {
                if (window.location.host == quaThemeID || window.location.host.includes(quaThemeID)) {
                    enableTheme(quaThemeID);
                }
            }

        });
    }
    // #endregion

    // #region Themes API
    window.setAllThemes = function() {
        if (themeDataContent.status == 'waiting') return setTimeout(window.setAllThemes, 1000);
        if (themeDataContent.status == 'error') return showThemesError(document.querySelector(`[qua-overlay-page="themes"] .data-content`));

        let themesList = document.createElement('div');
        themesList.className = 'qua-themes-list';
        themesList.innerHTML = themeDataHTML;
        themesList.querySelectorAll('.qua-theme-card').forEach(themeCard => {
            let theme = {
                id: themeCard.getAttribute('qua-theme:id'),
                name: themeCard.getAttribute('qua-theme:name'),
                status: themeCard.getAttribute('qua-theme:status'),
                website: themeCard.getAttribute('qua-theme:website')
            }
            if (theme.status == 'In Development') return;

            // insertHeaders();
            let cardID = themeCard.getAttribute('qua-theme:id');
            let themeName = themeCard.getAttribute('qua-theme:name');
            themeCard.removeAttribute('qua-theme:name');
            themeCard.removeAttribute('qua-theme:website');
            let blacklist_items = ["qua-overlay-theme-card__header-controls-button"];
            themeCard.addEventListener('click', function(e) {
                if (blacklist_items.includes(e.target.className)) return;

                if (themeCard.getAttribute('qua-theme:active') == "true") {
                    disableTheme(cardID);
                    new overlayNotification({
                        title: "Theme was Disabled",
                        message: `<qua-label style='color: var(--qua-overlay-theme); font-weight: 600;'>${themeName}</qua-label> theme was <qua-label style='font-weight: 600; color: var(--qua-overlay-error-color);'>Disabled</qua-label>!`,
                        duration: 2000,
                        allowHTML: true
                    });
                    requestSave({
                        themes: {
                            [cardID]: null
                        }
                    });
                    themeCard.setAttribute('qua-theme:active', 'false');

                    return prettyClick(e, {
                        color: 'rgb(255, 64, 64)',
                        opacity: '.3',
                        duration: '1s'
                    });
                }

                enableTheme(cardID);
                new overlayNotification({
                    title: "Theme was Enabled",
                    message: `<qua-label style='color: var(--qua-overlay-theme); font-weight: 600;'>${themeName}</qua-label> theme was <qua-label style='font-weight: 600; color: var(--qua-overlay-success-color);'>Enabled</qua-label>!`,
                    duration: 2000,
                    allowHTML: true
                });
                requestSave({
                    themes: {
                        [cardID]: 'enabled'
                    }
                });
                themeCard.setAttribute('qua-theme:active', 'true');

                prettyClick(e, {
                    color: 'rgb(74, 255, 170)',
                    opacity: '.3',
                    duration: '1s'
                });
            });

            themeCard.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                quartyn.log('Pressed right click!');
            });

            let customizeButton = themeCard.querySelector('[qua-action="customize"]');
            customizeButton.removeAttribute('qua-action');
            customizeButton.addEventListener('click', async function(e) {
                if (!isThisPage(cardID)) {
                    let themeWeb = theme.website.split('https://')[1];
                    return new OverlayPopup({
                        title: themeName,
                        messages: [
                            "If you wish to modify the appearance of this theme, please visit the theme's website and try again."
                        ],
                        buttons: [{
                            title: `Visit ${themeWeb}`,
                            type: "main",
                            action: function() {
                                window.open(theme.website, '_blank');
                            }
                        }]
                    });
                }
                if (themeCard.getAttribute('qua-theme:active') != "true") {
                    return new OverlayPopup({
                        title: themeName,
                        messages: [
                            "To be able to edit this theme, you must first enable it 🙃."
                        ],
                        buttons: [{
                            title: "Oh, Okay",
                            type: "main",
                            action: "close"
                        }]
                    });
                }

                if (!online_theme_customization) {
                    new OverlayPopup({
                        title: themeName,
                        messages: [
                            "Customization for this theme is currently unsupported.",
                            "If you show your love for this theme through feedback, there's a chance I'll finish this theme for you sooner :)."
                        ],
                        buttons: [{
                            title: "Ok, I understand",
                            type: "secondary",
                            action: function() {alert('Action:!!!!::')}
                        }, {
                            title: "Submit feedback",
                            type: "main",
                            action: function() {alert('HElloooo')}
                        }]
                    });
                    return;
                }

                let theme_customization_screen = document.createElement('div');
                theme_customization_screen.className = 'qua-overlay-theme-customization';
                theme_customization_screen.innerHTML = `
                <div class="qua-overlay-theme-customization-container">
                    <div class="qua-overlay-theme-customization_header">
                        <p class="qua-overlay-theme-customization_title">${themeName}</p>
                        <div class="qua-overlay__theme-customization--header__controls">
                            <button class="qua-overlay__theme-customization--header__controls-button" title="Change opacity of customization window" qua-overlay-action="theme-customization.opacity">
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M480-120q-133 0-226.5-90.5T160-434q0-66 25.5-123T255-658l225-222 225 222q44 44 69.5 101T800-434q0 133-93.5 223.5T480-120ZM223-400h514q13-69-15-127t-56-85L480-795 294-612q-28 27-56 85t-15 127Z"/></svg>
                            </button>
                            <button class="qua-overlay__theme-customization--header__controls-button" title="Minimize theme customization panel" qua-overlay-action="theme-customization.minimalize">
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m162-120-42-42 214-214H216v-60h220v220h-60v-118L162-120Zm363-405v-220h60v118l213-213 42 42-213 213h118v60H525Z"/></svg>
                            </button>
                            <button class="qua-overlay__theme-customization--header__controls-button" title="Close theme customization panel" qua-overlay-action="theme-customization.close">
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="qua-overlay-theme-customization_theme">

                    </div>
                    <div class="qua-overlay-theme-customization_list"></div>
                    <div class="qua-overlay-theme-customization_controls">
                        <button class="qua-overlay-button-secondary">Defaults</button>
                        <button class="qua-overlay-button">Save</button>
                    </div>
                </div>
                `;

                theme_customization_screen.querySelector('[qua-overlay-action="theme-customization.opacity"]').addEventListener('click', function() {
                    alert('Clicked');
                });
                theme_customization_screen.querySelector('[qua-overlay-action="theme-customization.minimalize"]').addEventListener('click', function() {
                    theme_customization_screen.querySelector('.qua-overlay-theme-customization-container').classList.add('qua-overlay__theme-customization--minimalized');
                });
                theme_customization_screen.querySelector('[qua-overlay-action="theme-customization.close"]').addEventListener('click', function() {
                    document.querySelector('.qua-overlay').classList.remove('qua-theme:customizing');
                    document.documentElement.setAttribute('qua-overlay', 'open');
                    theme_customization_screen.remove();
                });


                addDraggable(theme_customization_screen.querySelector('.qua-overlay-theme-customization_header'));

                online_theme_customization.forEach(customizeItem => {
                    let id = customizeItem.id.split('-rgb').shift();
                    id = id.split('--qua-themes-').pop();
                    let hexValue = ConvertRGBtoHex(customizeItem.value);
                    let customizationItem = document.createElement('div');
                    customizationItem.className = 'qua-overlay-settings-option';
                    customizationItem.innerHTML = `
                    <div class="qua-overlay-settings-option__details">
                        <label for="qua://themes/${id}" class="qua-overlay-settings-option__title">${customizeItem.title}</label>
                    </div>
                    <div class="qua-overlay-settings-option__controls" style="width: 100% !important;">
                        <label for="qua://themes/${id}" class="qua-overlay-settings-option__label">${hexValue}</label>
                        <input type="color" id="qua://themes/${id}" value="${hexValue}">
                    </div>`;
                    customizationItem.querySelector('input').addEventListener('input', function() {
                        let colorID = this.getAttribute('id');
                        colorID = colorID.split('qua://themes/').pop();

                        let color = this.value;
                        let r = parseInt(color.substr(1, 2), 16);
                        let g = parseInt(color.substr(3, 2), 16);
                        let b = parseInt(color.substr(5, 2), 16);
                        let RGB = `${r} ${g} ${b}`;
                        document.documentElement.style.setProperty(`--qua-themes-${colorID}-rgb-custom`, RGB);
                        console.log(`User's wanted value for customizaton '${colorID} is ${RGB}'`);
                        this.closest('div').querySelector('label').textContent = `${color}`;
                    });
                    theme_customization_screen.querySelector('.qua-overlay-theme-customization_list').appendChild(customizationItem);
                });
                document.querySelector('.qua-overlay').classList.add('qua-theme:customizing');
                document.documentElement.removeAttribute('qua-overlay');
                document.body.appendChild(theme_customization_screen);

            });
        });
        document.querySelector('[qua-overlay-page="themes"] .data-content').innerHTML = '';
        document.querySelector('[qua-overlay-page="themes"] .data-content').appendChild(themesList);
        setImages();
    }
    // #endregion

    function prettyClick(e, options = {
        color: '#fff',
        opacity: '.2',
        duration: '1s'
    }) {
        let x = e.layerX;
        let y = e.layerY;

        let ripples = document.createElement('span');
        ripples.className = `quartyn-pretty-ripples`;
        ripples.style.backgroundColor = options.color;
        ripples.style.setProperty('--opacity', options.opacity);
        // ripples.style.setProperty('--opacity-end', options.opacity.end);
        ripples.style.setProperty('--duration', options.duration);
        ripples.style.left = x + 'px';
        ripples.style.top = y + 'px';
        e.target.appendChild(ripples);

        setTimeout(() => {
            ripples.remove();
        }, 1000);
    }

    let online_theme_customization;

    // #region Enable & Disable theme
    window.enableTheme = function(id) {
        if (!isThisPage(id)) return;
        let theme_tag = document.querySelector('[qua-class="quartyn/theme-design"]');
        if (theme_tag) {
            theme_tag.removeAttribute('media');
            return document.documentElement.setAttribute('qua-theme:mode', 'dark');
        };
        fetch(`https://raw.githubusercontent.com/Quartyn/QuartTools/main/design/themes/${id}.qtheme.css`)
        .then(response => response.text())
        .then(async data => {
            let userCustomization = await getCustomization({
                id: id
            });

            if (userCustomization) {
                for (let themeCustomizationID in userCustomization) {
                    console.log(userCustomization[themeCustomizationID]);
                }
            }

            // #region Get details from code
            let themeLibraryVersion = 'Oh no! I don\'t know.'
            if (data.split('/*')[1].split('*/')[0].includes('•')) {
                themeLibraryVersion = data.split('Version ')[1].split(' • Updated')[0];
            } else {
                themeLibraryVersion = data.split('Version ')[1].split(' Updated')[0];
            }
            let themeLibraryDate = data.split('Updated: ')[1].split(' */')[0];
            let themeLibraryAuthor = data.split('Author: ')[1].split(' */')[0];
            let themeLibraryName = data.split('Theme: ')[1].split(' */')[0];
            // #endregion

            // #region Pretty print of details
            console.group(`%cQuartTools%c Custom theme by Quartyn! (${window.location.href})`, 'color: #fff; font-weight: 500; font-family: "Outfit", sans-serif; padding: 2px 7px; margin-right: 5px; background-color: #8d87fd; border-radius: 4px;', 'font-family: Outfit, sans-serif; color: #fff; font-weight: 400;');
            console.log(`%cVersion:%c ${themeLibraryVersion} • %cUpdated:%c ${themeLibraryDate}`, 'color: #8d87fd; font-family: "Outfit", sans-serif;', 'color: #fff; font-family: "Outfit", sans-serif;', 'color: #8d87fd; font-family: "Outfit", sans-serif;', 'color: #fff; font-family: "Outfit", sans-serif;');
            console.log('%cAuthor:%c ' + themeLibraryAuthor, 'color: #8d87fd; font-family: "Outfit", sans-serif;', 'color: #fff; font-family: "Outfit", sans-serif;');
            console.log('%cTheme:%c ' + themeLibraryName, 'color: #8d87fd; font-family: "Outfit", sans-serif;', 'color: #fff; font-family: "Outfit", sans-serif;');
            console.log(`%cCSS Code:%c If you want to see css code, go to check out my Github. https://github.com/Quartyn/QuartTools`, 'color: #8d87fd; font-family: "Outfit", sans-serif;', 'color: #fff; font-family: "Outfit", sans-serif;');
            console.groupEnd();
            // #endregion

            // #region Error when theme is down.
            if (data == '404: Not Found') {
                quartyn.error('We are unable to find this theme on our servers. If you think this is an issue, please, send me a feedback.');
                return;
            }
            // #endregion

            // #region Customization
            if (data.includes('customization: supported')) {
                let customization = data.split(':root').pop();
                customization = customization.split('{')[1].split('}')[0];
                let all_customization = [];
                customization.split('\n').forEach(line => {
                    line = line.trim();
                    if (line == "") return;
                    if (!line.includes('/*')) return;

                    let customizationDetails = line.split('/*').pop().split('*/').shift().trim();
                    let title = customizationDetails.split('title:').pop().split(';').shift().trim();
                    let id = '--' + line.split('--').pop().split(':').shift();
                    let value = line.split(':')[1].split(';').shift().trim();

                    // let type = customizationDetails.split('type: ').pop().split(';').shift().trim();
                    all_customization.push({
                        id: id,
                        title: title,
                        value: value
                    });
                    // console.log(`Customization line with ID: ${id} ; TITLE: ${title}; VALUE: ${value}`);

                    // if (type == "rgb") {
                    //     id = id.split('-rgb').shift();
                    // }
                    if (userCustomization && userCustomization[id]) {
                        document.documentElement.style.setProperty(`${id}-rgb`, userCustomization[id]);
                        console.log(`Value ${id} with ${userCustomization[id]} was setted!`);
                    }
                });
                online_theme_customization = all_customization;
            }
            // #endregion

            // #region Insert to site
            checkHeaders().then(() => {
                let el = document.querySelector('quartyn > qua-design');
                let style = document.createElement('style');
                style.setAttribute('qua-class', 'quartyn/theme-design');
                style.innerHTML = data;
                el.appendChild(style);
            })
            // #endregion

        })
        .catch((error) => {
            quartyn.error('[429:enableTheme] Unable to find wanted theme. Reason: ', error);
        });
    }
    window.disableTheme = function(id) {
        if (!isThisPage(id)) return;

        let theme_tag = document.querySelector('[qua-class="quartyn/theme-design"]');
        if (!theme_tag) return;

        theme_tag.setAttribute('media', 'clear');
        document.documentElement.setAttribute('qua-theme:mode', 'off')
    }
    // #endregion

    async function getCustomization({id} = {}) {
        if (!id) return quartyn.error(`ID is missing for getCustomization.`);

        let response = await chrome.storage.sync.get('theme_customization');
        let data = response.theme_customization ?? {};

        return data[id];
    }

})(window);