// ── VOICE ANNOUNCEMENTS — Web Speech API ─────────────────────────────────────

// Pre-load voices on page load
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

/**
 * Speak a text string with a deep/robotic voice if available.
 * @param {string} text
 * @param {number} pitch  - 0.0–2.0  (default 0.85 = slightly low)
 * @param {number} rate   - 0.1–10   (default 0.82 = slightly slow)
 */
function speak(text, pitch = 0.85, rate = 0.82) {
  try {
    if (!window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.pitch  = pitch;
    utt.rate   = rate;
    utt.volume = 1.0;

    // Prefer a deep male voice if available
    const voices = window.speechSynthesis.getVoices();
    const pref = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('male')  ||
       v.name.toLowerCase().includes('david') ||
       v.name.toLowerCase().includes('george')||
       v.name.toLowerCase().includes('james'))
    );
    if (pref) utt.voice = pref;

    window.speechSynthesis.cancel(); // stop any current speech
    window.speechSynthesis.speak(utt);
  } catch(e) {}
}
