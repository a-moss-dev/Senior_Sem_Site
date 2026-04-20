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

      // Fully reset a button back to Play and zero the progress bar
      function resetPlayer(btn, bar) {
        btn.classList.remove('playing');
        btn.textContent = '';
        btn.insertAdjacentHTML('afterbegin',
          `<svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;flex-shrink:0">${PLAY_ICON}</svg>`);
        btn.append(' Play');
        if (bar) { bar.style.width = '0%'; }
      }

      // Switch button to paused state WITHOUT resetting position
      function pausePlayer(btn) {
        btn.classList.remove('playing');
        btn.textContent = '';
        btn.insertAdjacentHTML('afterbegin',
          `<svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;flex-shrink:0">${PLAY_ICON}</svg>`);
        btn.append(' Resume');
      }

      // Switch button to playing state
      function playingPlayer(btn) {
        btn.classList.add('playing');
        btn.textContent = '';
        btn.insertAdjacentHTML('afterbegin',
          `<svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;flex-shrink:0">${PAUSE_ICON}</svg>`);
        btn.append(' Pause');
      }

      document.querySelectorAll('.btn-play').forEach(function (btn) {
        const card  = btn.closest('.audio-card');
        const bar   = card ? card.querySelector('.audio-progress-bar') : null;
        const wrap  = card ? card.querySelector('.audio-progress-wrap') : null;
        // Use the <audio> element already in the card — no new Audio() needed,
        // which avoids the browser mistakenly prompting for microphone access.
        const audio = card ? card.querySelector('audio') : null;

        if (!audio) return;

        // Update progress bar as the track plays
        audio.addEventListener('timeupdate', function () {
          if (audio.duration && bar) {
            bar.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
          }
        });

        // Fully reset when the track reaches the end
        audio.addEventListener('ended', function () {
          resetPlayer(btn, bar);
          currentAudio = null;
          currentBtn   = null;
          currentBar   = null;
        });

        // Scrub — click anywhere on the progress bar wrapper to seek
        if (wrap) {
          wrap.style.cursor = 'pointer';
          wrap.addEventListener('click', function (e) {
            if (!audio.duration) return;
            const rect = wrap.getBoundingClientRect();
            const pct  = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pct * audio.duration;
            if (bar) { bar.style.width = (pct * 100) + '%'; }
          });
        }

        btn.addEventListener('click', function () {
          // This track is currently playing — pause it (keep position)
          if (currentAudio === audio && !audio.paused) {
            audio.pause();
            pausePlayer(btn);
            return;
          }

          // This track is paused mid-way — resume it
          if (currentAudio === audio && audio.paused) {
            audio.play().catch(function (err) { console.warn(err); });
            playingPlayer(btn);
            return;
          }

          // A different track is playing — stop it first
          if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            resetPlayer(currentBtn, currentBar);
          }

          // Start this track from wherever it currently is
          currentAudio = audio;
          currentBtn   = btn;
          currentBar   = bar;

          playingPlayer(btn);

          audio.play().catch(function (err) {
            console.warn('Audio playback error:', err);
            resetPlayer(btn, bar);
            currentAudio = null;
          });
        });
      });
    })();

    // ============================================================
    // PHOTO MODAL — do not edit
    // ============================================================
    (function () {
      const overlay = document.getElementById('photoModal');
      const modalImg = document.getElementById('photoModalImg');
      const modalCap = document.getElementById('photoModalCaption');
      const closeBtn = document.getElementById('photoModalClose');

      function openModal(src, alt, caption) {
        modalImg.src = src;
        modalImg.alt = alt || '';
        modalCap.textContent = caption || '';
        modalCap.style.display = caption ? 'block' : 'none';
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      function closeModal() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        // Small delay before clearing src so the close animation isn't jarring
        setTimeout(function () { modalImg.src = ''; }, 200);
      }

      // Wire up each photo item that contains a real <img>
      document.querySelectorAll('.photo-item').forEach(function (item) {
        item.addEventListener('click', function () {
          const img = item.querySelector('img');
          if (!img) return; // placeholder — no image yet, do nothing
          const caption = item.querySelector('.photo-caption');
          openModal(img.src, img.alt, caption ? caption.textContent.trim() : '');
        });
      });

      // Close on overlay background click (but not on the image itself)
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });

      // Close button
      closeBtn.addEventListener('click', closeModal);

      // Close on Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
      });
    })();
