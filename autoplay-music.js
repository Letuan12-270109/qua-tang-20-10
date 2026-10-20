/* Background music for the 20/10 gift page.
 * Keep this file separate so music behavior can be changed without touching
 * the existing animation or UI logic.
 * Note: browsers may block audible autoplay until the visitor interacts.
 */
(() => {
  'use strict';

  const audio = new Audio('music/co-chac-yeu-la-day.mp3');
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = 0.7;

  let isPlaying = false;
  const interactionEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];

  function removeInteractionListeners() {
    interactionEvents.forEach((eventName) => {
      window.removeEventListener(eventName, retryPlayback, true);
    });
  }

  function retryPlayback() {
    if (isPlaying) return;

    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt.then(() => {
        isPlaying = true;
        removeInteractionListeners();
      }).catch(() => {
        // Leave the listeners active and retry on a later user interaction.
      });
    } else {
      isPlaying = true;
      removeInteractionListeners();
    }
  }

  interactionEvents.forEach((eventName) => {
    window.addEventListener(eventName, retryPlayback, {
      capture: true,
      passive: true
    });
  });

  // Try as soon as the page loads. If the browser permits autoplay, playback
  // starts immediately; otherwise the first user gesture starts it.
  retryPlayback();
})();
