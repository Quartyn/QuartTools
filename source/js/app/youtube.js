(async function() {

  let quartyn = {
    log: message => {
        console.log(`%cQuartTools%c ${message}`, 'color: #fff; font-family: "Outfit", sans-serif; padding: 2px 7px; margin-right: 5px; background-color: #8d87fd; border-radius: 4px;', 'font-family: Outfit, sans-serif; color: #fff;');
    },
    warn: message => {
        console.log(`%cQuartTools%c ${message}`, 'color: #fff; font-family: "Outfit", sans-serif; padding: 2px 7px; margin-right: 5px; background-color: #8d87fd; border-radius: 4px;', 'font-family: Outfit, sans-serif; color: #ffd151;');
    },
    error: message => {
        console.log(`%cQuartTools%c ${message}`, 'color: #fff; font-family: "Outfit", sans-serif; padding: 2px 7px; margin-right: 5px; background-color: #8d87fd; border-radius: 4px;', 'font-family: Outfit, sans-serif; color: #ff5555;');
    },
    success: message => {
        console.log(`%cQuartTools%c ${message}`, 'color: #fff; font-family: "Outfit", sans-serif; padding: 2px 7px; margin-right: 5px; background-color: #8d87fd; border-radius: 4px;', 'font-family: Outfit, sans-serif; color: #41ff6a;');
    }
  }
  let settings;

  function init() {
    chrome.storage.sync.get('settings')
    .then(res => {
        settings = res.settings;
    });
  }
  init();


  let chromePath = chrome.runtime.getURL('/');

  // #region YouTube
  if (window.location.host === 'www.youtube.com') {
    let pageStatus = setInterval(() => {
      if (document.readyState == "complete") {
        videoControlsInit();
        clearInterval(pageStatus);
      }
    }, 100);

    // #region qAdManager --- DONE
    let AdNo = false, AdYes = true, Ads1 = true, qSkip = false;
    setInterval(() => {
      const YouTubeAdManager = document.querySelector('#movie_player.ad-showing');
      const VideoAdClose = document.querySelector('.ytp-ad-skip-button');
      const MuteBtn = document.querySelector('.ytp-volume-area');
      const Video = document.querySelector('#movie_player > .html5-video-container > video');
      const CloseAd = document.querySelector('.ytp-ad-overlay-close-container .ytp-ad-overlay-close-button');
      
      function muteFunction() {
        if (settings.options['muteAd'] === 'on') { // muteAd
          if (YouTubeAdManager) {
            if (Video.muted) return;
            Video.muted = true;
            MuteBtn.classList.add('qmanager');
          } else {
            MuteBtn.classList.remove('qmanager');
            Video.muted = false;
          }
        }
      }
      function skipAd() {
        setTimeout(() => {
          let skipButton = document.querySelector('.ytp-ad-skip-button');
          if (skipButton) {
            quartyn.success('Skipping Ad..');
            skipButton.click();
            qSkip = true;
          } else {
            quartyn.error('We cannot skip this ad for you');
          }
        }, 5000);
      }
      
      if (CloseAd) { // Small ads Closer -- Done
        if (settings.options['closeAd'] === 'on') {
          if (Ads1) {
            Ads1 = false;
            setTimeout(() => {
              CloseAd.click();
              // smallNotification('Ad was closed');
              videoNotification();
              quartyn.log('ImageAd was closed.');
              qStats('image');
              Ads1 = true;
            }, 2000);
          }
        }
      }

      if (YouTubeAdManager) { // Video ad Detector
        if (AdYes) {
          AdYes = false;
          AdNo = true;
          if (settings.options['adSkip'] === 'on') {
            let value = Video.src;
            let checkAd = setInterval(() => {
              if (Video.src !== value) {
                if (YouTubeAdManager) {
                  if (AdNo === true) {
                    clearInterval(checkAd);
                    muteFunction();
                    skipAd();
                    qStats('ads');
                  }
                }
              }
            }, 500);
            quartyn.log('Ad Overlay Found!');
            skipAd();
            qStats('ads');
          }
          muteFunction();
        }
      } else {
        if (AdNo) {
          AdNo = false;
          AdYes = true;
          muteFunction();
          if (qSkip) {
            qSkip = false;
            qStats('video');
            quartyn.success('I skipped and ad for you.');
          }
        }
      }
    }, 100);
    // #endregion

    // #region DOM --- WORKING
    let pathname = window.location.pathname;
    let last_search = window.location.search;

    document.addEventListener("DOMSubtreeModified", (e) => {
      if (window.location.search == last_search) return;

      last_search = window.location.search;
      pathname = window.location.pathname;

      if (pathname == '/watch') {
        videoControlsInit();
      }
    })
    //#endregion

    // #region Live chat
    let messageTag = 'yt-live-chat-text-message-renderer';
    let username = 'Quartyn';
    let audio = new Audio(`${chromePath}audio/ping.mp3`);
    let observer = new MutationObserver(function(mutations_list) {
      mutations_list.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(messageElement) {
          if (messageElement.tagName.toLowerCase() !== messageTag) return;
          if (messageElement.className.includes('qua-youtube:pinged')) return;

          let author = messageElement.querySelector('#author-name').textContent;
          let message = messageElement.querySelector('#message').textContent;
          let image = messageElement.querySelector('#author-photo img').src;
          messageElement.classList.add('qua-youtube:pinged');

          // console.log(`%c${author}: %c${message}`, 'font-family: "Outfit", sans-serif; color: #8d87fd;', 'font-family: "Outfit", sans-serif; color: #fff;');

          if (message.toLowerCase().includes(`@${username.toLowerCase()}`) || message.toLowerCase().includes(username.toLowerCase())) {
            console.log(`You have been mentioned by ${author}!\n${message}\n${new Date().toLocaleTimeString()}`);
            
            if (audio.paused) {
              audio.play();
            }
            let notification = new Notification(`${author} mentioned you!`, {
              icon: image,
              body: message,
              tag: "quartyn.chat.mention"
             });
             notification.onclick = function() {
              notification.close();
            };
          }

        });
      });
    });
    
    window.addEventListener('load', function setChat() {
      let chatContainer = document.querySelector("#items.yt-live-chat-item-list-renderer");
      // if (!document.querySelector('#items.yt-live-chat-item-list-renderer')) {
      //   setTimeout(() => {
      //     console.log('Retrying chat injection');
      //     setChat();
      //   }, 3000);
      //   return;
      // }
      console.log(window.location.href);
      setTimeout(() => {
        if (chatContainer) {
          observer.observe(chatContainer, { subtree: false, childList: true });      
          console.log('Chat was injected!');
        }
      }, 6000);
    });
    // #endregion

  }
  // #endregion YouTube

  // #region YouTube Music
  if (window.location.host === 'music.youtube.com') {
    let pageStatus = setInterval(() => {
      if (document.readyState == "complete") {
        videoControlsInit();
        clearInterval(pageStatus);
      }
    }, 100);
  
    let pathname = window.location.pathname;
    let last_search = window.location.search;
    document.addEventListener("DOMSubtreeModified", (e) => {
      if (window.location.search == last_search) return;

      last_search = window.location.search;
      pathname = window.location.pathname;

      if (pathname == '/watch') {
        videoControlsInit();
      }
    });
  
    // #region Ads Manager --- DONE
    let AdNo = true,
    AdYes = true;
    setInterval(() => {
      const AdOverlay = document.querySelector('.video-ads.ytp-ad-module > .ytp-ad-player-overlay');
      const VideoAdClose = document.querySelector('.ytp-ad-skip-button');
      const Video = document.querySelector('video');
      if (AdOverlay) {
        if (AdYes) {
          AdYes = false;
          AdNo = true;
          if (Video.muted) {
          } else {
            Video.muted = true;
            sessionStorage.setItem('qtools-video-muted', 'true');
          }
        }
        setInterval(() => {
          if (VideoAdClose) {
            VideoAdClose.click();
          }
        }, 5000);
      } else {
        if (AdNo) {
          AdNo = false;
          AdYes = true;
          if (sessionStorage.getItem('qtools-video-muted') === 'true') {
            sessionStorage.removeItem('qtools-video-muted');
            Video.muted = false;
          }
        }
      }
    }, 10);
    //#endregion
  }
  // #endregion

  // #region Functions
  let ANIMATION_DURATION = 5000;
  function videoNotification() {
    let notificationContainer = document.querySelector('.qua-small-notification');
    if (notificationContainer) {
      notificationContainer.classList.add('qua-active');
      setTimeout(() => {
        notificationContainer.classList.remove('qua-active');
      }, ANIMATION_DURATION);
      return;
    }
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'qua-small-notification';
    notificationContainer.innerHTML = `
    <img width="32" height="32" src="${chromePath}img/app/logo48.png">
    <p>Ad was closed</p>
    `;
    document.querySelector('.qua-video-controls').appendChild(notificationContainer);
  }

  function setShort() {
    let reel = document.querySelector('#shorts-container').querySelector('ytd-reel-video-renderer[is-active]:not(:has(.quartyn-volume))');
    console.log('Quartyn | #Shorts');
    let volume = localStorage.getItem('qua:shorts-volume') == null ? .8 : localStorage.getItem('qua:shorts-volume');

    if (reel.querySelector('video') === null) {
      setTimeout(() => {
        setShort()
      }, 500);
      return;
    }
    reel.querySelector('video').volume = volume;

    let volumeManager = document.createElement('div');
    volumeManager.className = 'quartyn-volume';
    volumeManager.style = `position: absolute;`;
    let volumeInput = document.createElement('input');
    volumeInput.type = 'range';
    volumeInput.min = '0';
    volumeInput.max = '100';
    volumeInput.value = volume * 100;
    volumeInput.addEventListener('input', function() {
      console.log(`Volume was changed to ${this.value}`);
      reel.querySelector('video').volume = this.value / 100;
      localStorage.setItem('qua:shorts-volume', this.value / 100);
    });
    
    volumeManager.appendChild(volumeInput);
    console.log('Test Version 4.0');
    console.log(reel);
    reel.querySelector('#player-container ytd-shorts-player-controls').appendChild(volumeManager);
  }

  function videoControlsInit() {
    quartyn.log(`Video controls for ${window.location.href} are loading..`);
    if (window.location.pathname == "/watch") {
      let video_players = document.querySelectorAll('#movie_player');
      let video_controls = document.createElement('div');
      video_controls.className = 'qua-video-controls';
      video_controls.innerHTML = `
      <div class="q-background" qua-selector="qua-video-background"></div>
      <div class="qua-small-notification">
        <img width="32" height="32" src="${chromePath}img/app/logo48.png">
        <p>Ad was closed</p>
      </div>`;
      let videoBackground = video_controls.querySelector('[qua-selector="qua-video-background"]');

      // let custom_background = settings.options['custom_background'] == undefined ? 'vaporwave_traveller.jpg' : settings.options['custom_background'];
      let custom_background = settings?.options['custom_background'] ?? 'vaporwave_traveller.jpg';
      fetch(`${chromePath}img/images/${custom_background}`)
      .then((response) => response.text())
      .then((data) => {
        videoBackground.style.backgroundImage = `url(${chromePath}img/images/${custom_background})`;
      })
      .catch(err => {
        videoBackground.style.backgroundImage = `url(${chromePath}img/images/vaporwave_traveller.jpg)`;
        // saveStorage('custom_background', 'vaporwave_traveller.jpg', 2);
        requestSave({
          options: {
            'custom_background': 'vaporwave_traveller.jpg'
          }
        });
        
        quartyn.error(err);
      });

      video_players.forEach(player => {
        if (player.querySelector('.qua-video-controls')) return;
        if (settings.options['customBg'] == "on") {
          player.setAttribute('qua-background', 'true');
        } else {
          player.removeAttribute('qua-background');
        }
        player.appendChild(video_controls);
        quartyn.log('Video controls were successfully imported to the video');
      });
    }
    if (window.location.pathname.includes('/shorts/')) {
      window.onload = () => {
        let setScroller = setInterval(() => {
          if (document.querySelector('#shorts-container')) {
            document.querySelector('#shorts-container').addEventListener('scroll', setShort);
            clearInterval(setScroller);
            setShort();
          }
        }, 100);
        if (localStorage.getItem('qua:shorts-notification') === null) {
          let shortsNotification = oneActionNotification('We added Shorts Volume changer', 'Now you can control youtube shorts volume', 'Ok');
          document.querySelector(`[qid="${shortsNotification.id}"] ${shortsNotification.button}`).addEventListener('click', function () {
            this.closest('.quartyn-notification').setAttribute('qremoving', '');
            setTimeout(() => {
              this.closest('.quartyn-notification').remove();
            }, 400);
            
            localStorage.setItem('qua:shorts-notification', 'false');
          });
        }
      }
    }
  }
  function qStats(t) {
    let qmsg = {
      qua: "stats",
      type: t
    }

    try {
      chrome.runtime.sendMessage(qmsg);
    } catch(err) {
      q.err('It Seems, that Extension was Updated in the Background... Refresh Tab to apply New Version.');
    }
  }

  // #endregion
})();