(function () {
      let currentAudio = null;
      let currentBtn   = null;
      let currentBar   = null;

      const PLAY_ICON  = '<polygon points="5,3 19,12 5,21"/>';
      const PAUSE_ICON = '<rect x="6" y="3" width="4" height="18"/><rect x="14" y="3" width="4" height="18"/>';

      function setIcon(btn, icon) {
        const svg = btn.querySelector('svg');
        if (svg) svg.innerHTML = icon;
      }

      function resetPlayer(btn, bar) {
        btn.classList.remove('playing');
        btn.textContent = '';
        btn.insertAdjacentHTML('afterbegin',
          `<svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;flex-shrink:0">${PLAY_ICON}</svg>`);
        btn.append(' Play');
        if (bar) { bar.style.width = '0%'; }
      }

      document.querySelectorAll('.btn-play').forEach(function (btn) {
        const card = btn.closest('.audio-card');
        const bar  = card ? card.querySelector('.audio-progress-bar') : null;

        btn.addEventListener('click', function () {
          const src = btn.dataset.src;

          // If this button is already playing — pause it
          if (currentAudio && currentBtn === btn) {
            currentAudio.pause();
            resetPlayer(btn, bar);
            currentAudio = null;
            currentBtn   = null;
            currentBar   = null;
            return;
          }

          // Stop any other track that's playing
          if (currentAudio) {
            currentAudio.pause();
            resetPlayer(currentBtn, currentBar);
          }

          // Start new track
          const audio = new Audio(src);
          currentAudio = audio;
          currentBtn   = btn;
          currentBar   = bar;

          btn.classList.add('playing');
          btn.textContent = '';
          btn.insertAdjacentHTML('afterbegin',
            `<svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;flex-shrink:0">${PAUSE_ICON}</svg>`);
          btn.append(' Pause');

          // Update progress bar
          audio.addEventListener('timeupdate', function () {
            if (audio.duration && bar) {
              bar.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
            }
          });

          // When track ends, reset
          audio.addEventListener('ended', function () {
            resetPlayer(btn, bar);
            currentAudio = null;
            currentBtn   = null;
            currentBar   = null;
          });

          audio.play().catch(function (err) {
            console.warn('Audio playback error:', err);
            resetPlayer(btn, bar);
            currentAudio = null;
          });
        });
      });
    })();
