/**
 * TU Food Pass - 100% Robust Offline Audio Synthesizer
 * Unlocks AudioContext on first touch/click and uses reliable sound generation.
 */

window.TUAudio = (function() {
  let ctx = null;
  let isMuted = false;
  let isUnlocked = false;

  function getAudioContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    return ctx;
  }

  function unlock() {
    const ac = getAudioContext();
    if (ac) {
      if (ac.state === 'suspended') {
        ac.resume().then(() => {
          isUnlocked = true;
        }).catch(() => {});
      } else {
        isUnlocked = true;
      }
    }
  }

  // Global listeners to unlock on first user gesture
  ['click', 'touchstart', 'touchend', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, unlock, { once: false, passive: true });
  });

  function playTone(freq, type = 'sine', duration = 0.08, volume = 0.3) {
    if (isMuted) return;
    try {
      unlock();
      const ac = getAudioContext();
      if (!ac) return;

      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);

      gain.gain.setValueAtTime(volume, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ac.currentTime + duration);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch (e) {
      console.warn('Audio playTone error:', e);
    }
  }

  return {
    isMuted: () => isMuted,

    toggleMute: function() {
      isMuted = !isMuted;
      return isMuted;
    },

    unlock: unlock,

    // Button click tactile sound
    click: function() {
      playTone(520, 'sine', 0.05, 0.25);
    },

    // Spinning tick sound
    wheelTick: function() {
      playTone(750, 'triangle', 0.04, 0.2);
    },

    // Spinning tick rapid
    tickStep: function(step = 1) {
      const freq = 500 + (step % 8) * 60;
      playTone(freq, 'triangle', 0.05, 0.25);
    },

    // Celebration fanfare when a food is picked
    fanfare: function() {
      if (isMuted) return;
      unlock();
      const notes = [
        { f: 523.25, d: 0.12, t: 0 },    // C5
        { f: 659.25, d: 0.12, t: 100 },  // E5
        { f: 783.99, d: 0.12, t: 200 },  // G5
        { f: 1046.50, d: 0.35, t: 300 }  // C6
      ];
      notes.forEach(n => {
        setTimeout(() => {
          playTone(n.f, 'triangle', n.d, 0.35);
        }, n.t);
      });
    },

    // Coupon unlock sound
    couponUnlock: function() {
      if (isMuted) return;
      unlock();
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playTone(freq, 'sine', 0.15, 0.3);
        }, idx * 80);
      });
    }
  };
})();
