// #region Listeners
chrome.action.onClicked.addListener(buttonClicked);
chrome.runtime.onMessage.addListener(gotMessage);

// const api = "https://extension-api.quartyn.com";
const api = "http://localhost:5555";

// NEW Storage Migration
try {
  chrome.storage.sync.get('settings')
  .then(async function(data) {
    if (Object.keys(data).length !== 0) return;
    
    chrome.storage.sync.clear();

    let newSettings = {
      account: {
        isLogged: false
      },
      themes: {},
      options: {},
      overlaySettings: {},
      webCustomizations: {}
    }

    chrome.storage.sync.set({ settings: newSettings }, () => {
      console.log("Data migration complete!");
    })
  })
  .catch(error => {
    console.log(error);
  })
} catch (error) {
  console.error("Error during data migration:", error)
}
// #endregion

// #region Action Event
function buttonClicked(tab) {
    chrome.tabs.sendMessage(tab.id, { txt: "qua?Open" })
    .catch(err => {
        console.error('Unable to communicate with tab. Skipping..', err);
    });
    console.log('%cQuartTools [%cworker%c] %cOverlay has been opened!', 'color:cyan;','color:white;','color:cyan;','color:white;',);
    return true;
}
//#endregion

// #region Message Listener
function gotMessage(message, sender, sendResponse) {
    if (message.id == "createUser") {
        fetch(api + `/v1/users/register.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: message.body
        }).then(res => res.json()).then(data => { 
            sendResponse(data);
        }).catch(err => {
            sendResponse({ status: 503, message: "An error happened while contacting Quartyn servers. If this error persist, please contact me on instagram @Quartyn_" })
        });
    }
    if (message.id == "loginUser") {
        fetch(`https://api.quartyn.com/v2/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: message.body
        }).then(res => res.json())
        .then(data => { 
            sendResponse(data);
        }).catch(err => {
            sendResponse({ status: 503, message: "An error happened while contacting Quartyn servers. If this error persist, please contact me on instagram @Quartyn_" })
        });
    }
    if (message.id == "logoutUser") {
        chrome.tabs.query({})
        .then(tabs => {
            for (let i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, { id: "logoutUser" });
            }
            sendResponse('Request to logout user was accepted.');
        }).catch(err => {
            sendResponse('Worker was unable to send message to tabs.');
        })
    }
    if (message.id == "checkName") {
        fetch(`https://api.quartyn.com/v2/users/check`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: message.body
        }).then(res => res.json())
        .then(data => {
            sendResponse(data);
        }).catch(err => {
            sendResponse({ status: 503, message: "An error happened while contacting Quartyn servers. If this error persist, please contact me on instagram @Quartyn_" })
        });
    }
    if (message.id == "sendFeedback") {
        fetch(`https://api.quartyn.com/v2/users/feedback/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: message.body
        }).then(res => res.json())
        .then(data => sendResponse(data))
        .catch(err => {
            sendResponse({ status: 503, message: "An error happened while contacting Quartyn servers. If this error persist, please contact me on instagram @Quartyn_" })
        });
    }
    if (message.id == "getImage") {
        if (message.link.includes('https://') || message.link.includes('http://')) {
            console.log(message.link);
            fetch(message.link)
            .then(response => response.blob())
            .then(blob => {
                if (!blob.type.includes('image/')) {
                    sendResponse({status: 400, message: "Requested avatar has incorrect format."})
                }
                const reader = new FileReader();
                reader.onload = () => {
                    const dataURI = reader.result;
                    sendResponse({status: 200, uri: dataURI});
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('Error fetching the image:', error);
                sendResponse({status: 400, message: `Error with image: ${error}`});
            });
        } else {
            console.log(message.link);
        }
    }
    if (message.id == "requestTheme") {
        fetch(`https://api.quartyn.com/v2/themes/request`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: message.body
        }).then(res => res.json())
        .then(data => {
            sendResponse(data);
        }).catch(err => {
            sendResponse({ status: 503, message: "Theme requests are currently unavailable. If this error persist, please contact me on instagram @Quartyn_" })
        });
    }
    if (message.id == "sendStats") { // You can see public Anonymous stats -- https://quartyn.com/stats/
        fetch(`https://api.quartyn.com/v2/users/stats/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: message.body
        }).then(res => res.json())
        .then(data => sendResponse(data))
        .catch(err => {
            sendResponse({ status: 503, message: "An error happened while contacting Quartyn servers. If this error persist, please contact me on instagram @Quartyn_" })
        });
    }
    if (message.id == "clearSettings") {
        chrome.tabs.query({}).then(tabs => {
            for (let i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, {
                    id: "clearSettings",
                    message: "All your settings was cleared."
                });
            }
            sendResponse('Request to clear settings was accepted.');
        }).catch(err => {
            sendResponse('Worker was unable to send message to tabs.');
        });
    }
    return true;
}
// #endregion
