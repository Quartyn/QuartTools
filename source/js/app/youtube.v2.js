class Controls {
    body;
    child;
    defaultBackground = 'vaporwave_traveller.jpg';
    allowedBackgrounds = ["vaporwave_traveller.jpg"];

    constructor() {
        let video_controls = document.createElement('div');
        video_controls.className = `qua-overlay-app_video-controls`;
        video_controls.innerHTML = `
        <div class="qua-overlay-app_video-controls_background" qua-overlay-action="video-controls.background"></div>
        <div class="qua-small-notification">
          <img width="32" height="32" src="${myExtensionLink}img/app/logo48.png">
          <p>Ad was closed</p>
        </div>
        `;

        this.child = video_controls;
        if (settings) this.setBackground();
    }

    setBackground(id = settings?.options['custom_background'] ?? this.defaultBackground) {
        this.child.querySelector('[qua-overlay-action="video-controls.background"]').style.backgroundImage = `url(${extensionURL}img/images/${id})`;
    }
}
class Player {
    video;
    player;
    controls;
    hasAd = false;

    testAd() {
        this.player.classList.add('ad-showing');
    }

    setPlayer(element) {
        this.player = element;
        this.video = this.player.querySelector('video');
    }
    setControls(controls) {
        if (this.hasControls()) return console.log('Controls are already inserted');
        this.controls = controls;
        console.log(this.player, this.controls);
        this.player.appendChild(this.controls);
    }
    hasControls() {
        if (this.player.querySelector('.qua-overlay-app_video-controls')) return true;
        return false;
    }

    setVolume(volume) {
        if (this.video.volume == volume) return;

        this.lastVolume = this.video.volume;
        this.video.volume = volume;
    }
    recoverVolume() {
        this.video.volume = this.lastVolume;
    }
    
}

let player = new Player;
let controls = new Controls;

document.addEventListener('readystatechange', function() {
    if (document.readyState != 'interactive') return;
    // console.log(document.readyState);
    handlePages();
});

let lastWindow = {
    search: window.location.search,
    path: window.location.pathname,
}

function handlePages() {
    if (lastWindow.path === '/watch') return initWatch();
}

function handleChanges(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.target === document.body) {
            if (window.location.search !== lastWindow.search) {
                lastWindow.search = window.location.search;
                lastWindow.path = window.location.pathname;
                
                handlePages();
            }
        }
    }
}
const observer = new MutationObserver(handleChanges);
observer.observe(document, { childList: true, subtree: true });

function initWatch() {
    let element = document.querySelector('#movie_player');
    player.setPlayer(element);    
    player.setControls(controls.child);
    player.testAd();

    const classObserver = new MutationObserver(classChanged);
    classObserver.observe(player.player, { attributes: true, attributeFilter: ['class'] });
    const sourceObserver = new MutationObserver(sourceChanged);
    sourceObserver.observe(player.video, { attributes: true, attributeFilter: ['src'] });
}

function sourceChanged(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type !== 'attributes' || mutation.attributeName !== 'src') continue;

        if (player.hasAd) {
            if (settings.options['muteAd']) player.setVolume(0);
        } else {
            if (settings.options['muteAd']) player.recoverVolume();
        }
    }
}

function classChanged(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') continue;

        if (mutation.target.className.includes('ad-showing')) {
            if (player.hasAd) continue;

            player.hasAd = true;
            if (settings.options['muteAd']) player.setVolume(0)
        } else {
            if (!player.hasAd) continue;

            player.hasAd = false;
            if (settings.options['muteAd']) player.recoverVolume();
        }
    }
}