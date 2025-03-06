// Global variables for all files
let settings;
let translations;
let isSaving = false;
let saveQueue = [];

const BrowserApi = detectBrowser();
const extensionURL = BrowserApi.runtime.getURL('/');
const api = "http://localhost:5555";

let placeholders = {
    "website": '<a href="https://quartyn.com">quartyn.com</a>',
    "website.translations": '<a href="https://translate.quartyn.com">https://translate.quartyn.com</a>'
}

function init() {
    BrowserApi.storage.sync.get('settings')
    .then(res => {
        settings = res.settings;
    });
    fetch(`${extensionURL}src/translations.json`)
    .then(res => res.json())
    .then(data => {
        translations = data;
    });
}
init();

function isLoaded(selector) {
    return new Promise(resolve => {
        const observe = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (!(node.matches && node.matches(selector))) return false;
                    resolve(node);
                    observe.disconnect()
                })
            })
        });

        observe.observe(document, {
            childList: true,
            subtree: true
        });

        const existingNode = document.querySelector(selector);
        if (existingNode) {
            resolve(existingNode);
            observe.disconnect();
        }
    });
}

// #region Detect a browser api
function detectBrowser() {
    if (typeof browser !== "undefined") return browser;
    if (typeof msBrowser !== "undefined") return msBrowser;
    if (typeof chrome !== "undefined") return chrome;
    if (typeof webextension !== "undefined") return webextension;

    return null;
}
// #endregion

// #region Debug Controller
const quartyn = {
    getCallerInfo: function() {
        const err = new Error();
        const stack = err.stack.split('\n');

        const callerLine = stack[2].trim();
        const callerLink = callerLine.split('@').pop();

        return {
            link: callerLink,
            line: callerLine,
        };
    },
    log: (message, tag = 'system') => {
        console.log(`%cQuartTools %c[%c${tag}%c] %c${message}`,
            'color: rgb(124, 101, 255); font-weight: bold;',
            'color: rgb(124, 101, 255);', '',
            'color: rgb(131, 110, 254);', '');
    },
    info: (message, tag = 'system') => {
        console.info(`%cQuartTools %c[%c${tag}%c] %c[INFO] %c${message}`,
            'color: rgb(124, 101, 255); font-weight: bold;',
            'color: rgb(124, 101, 255);', '',
            'color: rgb(131, 110, 254);', 'color: rgb(124, 101, 255);', '');
    },
    warn: (message, tag = 'system') => {
        console.log(`%cQuartTools %c[%c${tag}%c] %c[WARNING] %c${message}`,
            'color: rgb(124, 101, 255); font-weight: bold;',
            'color: rgb(124, 101, 255);', '',
            'color: rgb(131, 110, 254);', 'color: #ffd151', '');
    },
    error: (message, tag = 'system', error) => {
        const caller = quartyn.getCallerInfo();
        console.groupCollapsed(`%cQuartTools %c[%c${tag}%c] %c[ERROR] %c${message}`,
            'color: rgb(124, 101, 255); font-weight: bold;',
            'color: rgb(124, 101, 255);', '',
            'color: rgb(131 110 254);', 'color: #ff5555;', '');
        console.error(caller.link);
        if (error) console.error(error);
        console.groupEnd();
    },
    success: (message, tag = 'system') => {
        console.info(`%cQuartTools %c[%c${tag}%c] %c[SUCCESS] %c${message}`,
            'color: rgb(124, 101, 255); font-weight: bold;',
            'color: rgb(124, 101, 255);', '',
            'color: rgb(131 110 254);', 'color: #41ff6a;', '');
    }
}
// #endregion

// #region Save Centre
function saveSettings(newData) {
    isSaving = true;

    BrowserApi.storage.sync.get('settings')
    .then(res => {
        let existingSettings = res.settings || {};
        deepMerge(existingSettings, newData);

        BrowserApi.storage.sync.set({ settings: existingSettings })
        .then(() => {
            isSaving = false;
            settings = existingSettings;
            updateOverlaySettings();

            if (saveQueue.length > 0) {
                let nextSaveRequest = saveQueue.shift();
                saveSettings(nextSaveRequest);
            }
        }).catch(err => {
            isSaving = false
            if (err.message.includes('MAX_WRITE_OPERATIONS_PER_MINUTE')) {
                new overlayNotification({
                    title: "Max Storage QUOTA exceeded",
                    message: "This browser has storage quota per minute. You are limited to change settings per minute. Please wait a moment and try again."
                });
            }
        });
    })
    // .catch(err => {
    //     if (err.includes('MAX_WRITE_OPERATIONS_PER_MINUTE')) {
    //         new overlayNotification({
    //             title: "Max Storage QUOTA exceeded",
    //             message: "This browser has storage quota per minute. You are limited to change settings per minute. Please wait a moment and try again."
    //         });
    //     }
    // });
}
function requestSave(data) {
    if (isSaving) return saveQueue.push(data);
    saveSettings(data);
}
function deepMerge(target, source) {
    for (const key in source) {
        if (typeof source[key] === "object" && source[key] !== null) {
            target[key] = target[key] || {};
            deepMerge(target[key], source[key]);
        } else if (source[key] === null) {
            if (typeof target[key] === "object" && target[key] !== null) {
                target[key] = {};
            } else {
                delete target[key];
            }
        } else {
            target[key] = source[key];
        }
    }
}
function getSettings(what) {
    return BrowserApi.storage.sync.get('settings')
    .then(res => {
        const keys = what.split('.');
        let value = res.settings;

        for (let i = 0; i < keys.length; i++) {
            value = value[keys[i]];
            if (value === undefined) return null;
        }
        return value;
    }).catch(err => {
        console.error(err);
        return null;
    });
}
//#endregion

// #region Translation
// FUNCTION - Translations Centre
function translate(translationKey, fallback) {
    let translation = translations[settings?.account?.lang ?? 'en'][translationKey];
    let defaultTranslation = translations['en'][translationKey];

    if (!translation) translation = defaultTranslation;
    if (!fallback) fallback = translationKey;

    return translation ?? fallback;
}
function translateAll() {
    let elements = document.querySelectorAll('[qua-overlay-translate]');
    elements?.forEach(element => {
        let translationKey = element.getAttribute('qua-overlay-translate');
        if (translationKey === "") {
            return translateAttributes(element);
        }
        let translatedText = translate(translationKey);
        // console.log(`Translating ${translationKey} to ${translatedText}`);
        if (!translatedText) return;

        translateAttributes(element);
        
        if (translatedText.includes('{{') && translatedText.includes('}}')) {
            translatedText = translatedText.replace(/{{(.*?)}}/g, (match, key) => placeholders[key.trim()] || match);
            return element.innerHTML = translatedText;
        }

        element.textContent = translatedText;
    });
}

function replacePlaceholder(string, dataset) {
    if (!string.includes('{{') && !string.includes('}}')) return string;

    return string.replace(/{{(.*?)}}/g, (match, key) => dataset[key.trim()] || match);
}

function translateAttributes(element) {
    if (!element.hasAttributes()) return;
    
    let attributes = element.attributes;
    for (let i = 0; i < attributes.length; i++) {
        let attribute = attributes[i];
        let attributeValue = attribute.value;
        let attributeRegex = /{{(.*?)}}/g;
        let translatedValue = attributeValue.replace(attributeRegex, (_, key) => {
            return translate(key.trim())
        });
        element.setAttribute(attribute.name, translatedValue);
    }
}
//#endregion

// #region Classes
class InputChecker {
    value;
    error;
    constructor(value) {
        this.value = value;
    }
    required() {
        if (!this.value || this.value == '' || this.value == undefined || this.value || null) this.error = "Value is required";
        return this;
    }
    maxLength(length) {
        if (this.value.length > length && !this.error) this.error = `Max length of value must be ${length} characters`;
        return this;
    }
    minLength(length) {
        if (this.value.length < length && !this.error) this.error = `Min length of value must be ${length} characters`;
        return this;
    }
    pattern(pattern) {
        if (!pattern.test(this.value) && !this.error) this.error = "Incorrect pattern";
        return this;
    }
    validate() {
        if (!this.error) return true;
        return false;
    }
}
// class InputChecker {
//     public $value;
//     public $error;
//     public function __construct($value) {
//         $this->value = $value;
//     }
//     public function required() {
//         if (!isset($this->value) || empty($this->value) || $this->value === null) $this->error = "Value is required."; 
//         return $this;
//     }
//     public function maxLength(int $length) {
//         if (strlen($this->value) > $length && !$this->error) $this->error = "Max length of string must be $length characters.";
//         return $this;
//     }
//     public function minLength(int $length) {
//         if (strlen($this->value) < $length && !$this->error) $this->error = "Min length of string must be $length characters.";
//         return $this;
//     }
//     public function pattern(string $pattern) {
//         if (!preg_match($pattern, $this->value) && !$this->error) $this->error = "Incorrect pattern.";
//         return $this;
//     }
//     public function inArray(array $array) {
//         if (!in_array($this->value, $array) && !$this->error) $this->error = "Selected language do not exist. Setting default value 'en'.";
//         return $this;
//     }
//     public function validate() {
//         if (!$this->error) return true;
//         return false;
//     }
// }
// #endregion

// #region Notifications
// FUNCTION - Notifications
// function randomNumber() {
//     return Math.floor(100000 + Math.random() * 99999);
// }
// class ScreenNotification {
//     constructor(params = {
//         title: "",
//         description: "",
//         main: {
//             text: "",
//             action
//         },
//         second: undefined || {
//             text: "",
//             action
//         }
//     }) {
//         this.title = params.title;
//         this.description = params.description;
//         this.id = randomNumber();

//         this.main_text = params.main.text;
//         this.main_action = params.main.action;
//         this.isSecond = params.second !== undefined;
        
//         if (this.isSecond) {
//             this.second_text = params.second.text;
//             this.second_action = params.second.action;
//         }

//         this.#build();
//     }
//     #build() {
//         let notification = document.createElement('div');
//         notification.className = 'quartyn-notification';
//         notification.innerHTML = `
//             <div class="qua-notification-header">
//                 <p>QuartTools</p>
//                 <button title="Close notification" aria-label="Close notification" qua-test-id="close-notification">
//                     <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>
//                 </button>
//             </div>
//             <div class="qua-notification-body">
//                 <p class="qua-notification-title">${this.title}</p>
//                 <p class="qua-notification-description">${this.description}</p>
//                 <div class="qua-buttons">
//                     <button class="qua-main-button" qua-test-id="main_action">${this.main_text}</button>
//                     ${this.isSecond ? `<button class="qua-second-button" qua-test-id="second_action">${this.second_text}</button>` : ''}
//                 </div>
//             </div>
//                                     `;
//         notification.setAttribute('qua-id', this.id);
//         notification.querySelector('[qua-test-id="close-notification"]').addEventListener('click', () => {this.close();});
//         notification.querySelector('[qua-test-id="main_action"]').addEventListener('click', this.main_action);
//         if (this.isSecond) {
//             notification.querySelector('[qua-test-id="second_action"]').addEventListener('click', this.second_action);
//         }
//         this.notification = notification;
//     }
//     send() {
//         document.body.appendChild(this.notification);
//     }

//     // set Title(title) {
//     //     this.title = title;
//     // }
//     // get Title() {
//     //     return this.title;
//     // }
//     // set Description(description) {
//     //     this.description = description;
//     // }
//     // get Description() {
//     //     return this.description;
//     // }

//     close() {
//         this.notification.setAttribute('qremoving', '');
//         setTimeout(() => {
//             this.notification.remove();
//         }, 2000);
//     }

//     // main_action(title, func) {
//     //     this.mainButton = title;
//     //     this.mainAction = func;
//     // }

// }
// class OverlayNotification {
//     constructor({
//         title = "",
//         duration = 3000
//     }) {
//         this.title = title;
//         this.duration = duration;
//         this.create();
//     }
//     create() {
//         let notification = document.createElement('div');
//         notification.className = 'qua-overlay-notification';
//         notification.innerHTML = `
//             <p class='qua-overlay-notification-message'>${this.title}</p>
//         `;
//         this.notification = notification;
//     }
//     send() {
//         let notificationPanel = document.querySelector('.q-overlay .qua-notifications');
//         if (!notificationPanel) {
//             let panel = document.createElement('div');
//             panel.className = 'qua-notifications';
//             document.querySelector('.q-overlay').appendChild(panel);
//             notificationPanel = document.querySelector('.q-overlay .qua-notifications');
//         };
//         notificationPanel.appendChild(this.notification);
//         setTimeout(() => {
//             this.notification.setAttribute('qshowing', '');
//         }, 300);
//         setTimeout(() => {
//             this.notification.removeAttribute('qshowing');
//             setTimeout(() => {
//                 this.notification.remove();
//             }, 500);
//         }, this.duration);
//     }
// }
// class overlayNotification {
//     constructor({
//         title = "",
//         message = "",
//         duration = 3000,
//         allowHTML = false
//     }) {
//         this.title = title;
//         this.message = message; 
//         this.duration = duration;
//         this.allowHTML = allowHTML;
//         this.#create();
//     }
//     #create() {
//         let notification = document.createElement('div');
//         notification.className = 'qua-overlay-notification';
//         notification.innerHTML = `
//             <div class="qua-overlay_overlay-notification_header">
//                 <p class='qua-overlay-notification-title'></p>
//                 <button qua-quick-action="notification.close">
//                     <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M480-438 270-228q-9 9-21 9t-21-9q-9-9-9-21t9-21l210-210-210-210q-9-9-9-21t9-21q9-9 21-9t21 9l210 210 210-210q9-9 21-9t21 9q9 9 9 21t-9 21L522-480l210 210q9 9 9 21t-9 21q-9 9-21 9t-21-9L480-438Z"/></svg>
//                 </button>
//             </div>
//             <p class='qua-overlay-notification-message'></p>
//         `;
//         if (this.allowHTML) {
//             notification.querySelector('.qua-overlay-notification-title').innerHTML = this.title;
//             notification.querySelector('.qua-overlay-notification-message').innerHTML = this.message;
//         } else {
//             notification.querySelector('.qua-overlay-notification-title').textContent = this.title;
//             notification.querySelector('.qua-overlay-notification-message').textContent = this.message;
//         }
//         notification.querySelector('[qua-quick-action="notification.close"]').addEventListener('click', () => {
//             this.#close();
//         });
//         this.notification = notification;
//         this.#send();
//     }
//     #send() {
//         let notificationPanel = document.querySelector('.q-overlay .qua-notifications');
//         if (!notificationPanel) {
//             console.log('THere is not notification panel');
//             let panel = document.createElement('div');
//             panel.className = 'qua-notifications';
//             document.querySelector('.q-overlay').appendChild(panel);
//             notificationPanel = document.querySelector('.q-overlay .qua-notifications');
//         };
//         notificationPanel.appendChild(this.notification);
//         console.log('Notification was sent!');
//         setTimeout(() => {
//             console.log('Notification is showed');
//             this.notification.setAttribute('qshowing', '');
//         }, 300);

//         setTimeout(() => {
//             this.#close();
//         }, this.duration);
//     }
//     #close() {
//         console.log('Notification was closed.');
//         this.notification.removeAttribute('qshowing');
//         setTimeout(() => {
//             this.notification.remove();
//         }, 500);
//     }
// }
// class OverlayPopup {
//     constructor({
//         title = "",
//         messages = [],
//         buttons = [{
//             title,
//             type: "main",
//             action
//         }],
//     }) {
//         this.title = title;
//         this.messages = messages;
//         this.buttons = buttons;
//         this.#build();
//     }
//     #build() {
//         let popup = document.createElement('div');
//         popup.className = 'qua-overlay-popup';
//         popup.innerHTML = `
//             <div class="qua-overlay-popup-outerlay"></div>
//             <div class="qua-overlay-popup-container"></div>
//         `;
//         let titleElement = document.createElement('p');
//         titleElement.className = 'qua-overlay-popup-title';
//         titleElement.textContent = this.title;
//         popup.querySelector('.qua-overlay-popup-container').appendChild(titleElement);
//         this.messages.forEach(message => {
//             let messageElement = document.createElement('p');
//             messageElement.className = 'qua-overlay-popup-message';
//             messageElement.textContent = message;
//             popup.querySelector('.qua-overlay-popup-container').appendChild(messageElement);
//         });
//         let popup_controls = document.createElement('div');
//         popup_controls.className = 'qua-overlay-popup-controls';
//         this.buttons.forEach(button => {
//             let buttonElement = document.createElement('button');
//             if (button.type == "main") {
//                 buttonElement.className = 'qua-overlay-button';
//             } else {
//                 buttonElement.className = 'qua-overlay-button-secondary';
//             }
//             buttonElement.textContent = button.title;
//             if (button.action == "close") {
//                 buttonElement.addEventListener('click', () => this.#close())
//             } else {
//                 buttonElement.addEventListener('click', button.action);
//             }
//             popup_controls.appendChild(buttonElement);
//         });
//         popup.querySelector('.qua-overlay-popup-container').appendChild(popup_controls);
//         popup.querySelector('.qua-overlay-popup-outerlay').addEventListener('click', () => {
//             this.#close();
//         });

//         this.element = popup;
//         document.querySelector('.q-overlay').appendChild(popup);
//         setTimeout(() => {
//             popup.classList.add('is-active');
//         }, 10);
//     }
//     #close() {
//         this.element.classList.remove('is-active');
//         setTimeout(() => {
//             this.element.remove();
//         }, 400);
//     }
// }
// #endregion