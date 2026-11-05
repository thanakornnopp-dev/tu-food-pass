/**
 * TU Food Pass - Offline Web Audio API Sound Synthesizer
 * Generates tactile clicks, roulette ticks, and celebration fanfares offline without external audio files.
 */

window.TUAudio = (function() {
  let ctx = null;
  let isMuted = false;

  function getAudioContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function playTone(freq, type, duration, gainStart, gainEnd = 0.001) {
    if (isMuted) return;
    try {
      const ac = getAudioContext();
      if (!ac) return;

      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);

      gain.gain.setValueAtTime(gainStart, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainEnd, ac.currentTime + duration);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + duration);
    } catch (e) {
      // Audio not permitted or not supported
    }
  }

  return {
    isMuted: () => isMuted,

    toggleMute: function() {
      isMuted = !isMuted;
      return isMuted;
    },

    setMute: function(muted) {
      isMuted = !!muted;
    },

    // UI Click sound
    click: function() {
      playTone(480, 'sine', 0.04, 0.15, 0.01);
    },

    // Roulette wheel tick sound (as it passes each slice)
    wheelTick: function(velocity = 1) {
      const freq = 600 + Math.min(velocity * 80, 500);
      playTone(freq, 'triangle', 0.03, 0.2, 0.01);
    },

    // Fanfare / Celebration chime when winning a meal
    fanfare: function() {
      if (isMuted) return;
      try {
        const ac = getAudioContext();
        if (!ac) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            playTone(freq, 'sine', 0.35, 0.25, 0.01);
          }, idx * 90);
        });
      } catch (e) {}
    },

    // Level up or Coupon unlock sound
    couponUnlock: function() {
      if (isMuted) return;
      try {
        const ac = getAudioContext();
        if (!ac) return;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            playTone(freq, 'triangle', 0.25, 0.2, 0.01);
          }, idx * 75);
        });
      } catch (e) {}
    }
  };
})();
