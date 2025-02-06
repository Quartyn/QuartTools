(function(){

    setInterval(() => {
        if (settings.options['igVolume'] !== 'on') return;

        let video_players = document.querySelectorAll('video');
        video_players.forEach(video => {
            if (video.getAttribute('qua:status') == "connected") return;
            video.setAttribute('qua:status', 'connected');

            let wasMuted = false;
            let volume = localStorage.getItem('qua:volume');
            if (volume == null) {
                volume = 50;
            }

            video.volume = volume / 100;

            video.addEventListener('play', function() {
                let volume = localStorage.getItem('qua:volume');
                if (volume == null) {
                    volume = 50;
                }

                volume = volume / 100;
                video.volume = volume;
                let volumer = video.parentElement.parentElement.querySelector('.qua-volume');
                if (!volumer) return;
                volumer.querySelector('input').value = volume * 100;
            });
            video.addEventListener('volumechange', function() {
                if (video.muted) {
                    video.volume = localStorage.getItem('qua:volume') / 100;
                    wasMuted = true;
                }
                if (wasMuted) {
                    wasMuted = false;
                    video.volume = localStorage.getItem('qua:volume') / 100;
                }
                
                localStorage.setItem('qua:volume', video.volume * 100);
            });

            let input = import_input();
            video.parentElement.parentElement.appendChild(input);
        });
    }, 100);

    function import_input() {
        let volume = isNaN(localStorage.getItem('qua:volume')) ? 100 : localStorage.getItem('qua:volume');

        let qua_volume = document.createElement('div');
        qua_volume.className = 'qua-volume';
        qua_volume.innerHTML = `<input type="range" min="0" max="100" step="1" value="${volume}">`;

        qua_volume.querySelector('input').addEventListener('input', function(e) {
            let video = this.parentElement.parentElement.querySelector('video')
            video.volume = this.value / 100;
            if (video.muted) {
                localStorage.setItem('qua:volume', this.value);
            }
        });
        return qua_volume;
    }

})();