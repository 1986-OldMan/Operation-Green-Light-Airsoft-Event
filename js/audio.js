// ── AUDIO ENGINE ─────────────────────────────────────────────────────────────
// All sound generation via Web Audio API — no external files needed

let AC = null;

function getAC() {
  if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

// Basic sine blip
function blip(freq, dur, vol, t) {
  try {
    const c = getAC(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sine'; o.frequency.value = freq;
    const n = c.currentTime + t;
    g.gain.setValueAtTime(vol, n);
    g.gain.linearRampToValueAtTime(vol * 0.2, n + dur * 0.4);
    g.gain.linearRampToValueAtTime(0, n + dur);
    o.start(n); o.stop(n + dur + 0.002);
  } catch(e) {}
}

// Frequency-swept chirp
function chirp(f1, f2, dur, vol, t, type = 'sine') {
  try {
    const c = getAC(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    const n = c.currentTime + t;
    o.frequency.setValueAtTime(f1, n);
    o.frequency.exponentialRampToValueAtTime(f2, n + dur);
    g.gain.setValueAtTime(vol, n);
    g.gain.linearRampToValueAtTime(vol * 0.3, n + dur * 0.6);
    g.gain.linearRampToValueAtTime(0, n + dur);
    o.start(n); o.stop(n + dur + 0.003);
  } catch(e) {}
}

// Filtered noise swoosh
function swoosh(t, vol = 0.15, dur = 0.07) {
  try {
    const c = getAC();
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    const src = c.createBufferSource(); src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(600, c.currentTime + t);
    filt.frequency.linearRampToValueAtTime(3500, c.currentTime + t + dur);
    filt.Q.value = 1.5;
    const g = c.createGain();
    src.connect(filt); filt.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0, c.currentTime + t);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + t + 0.01);
    g.gain.linearRampToValueAtTime(0, c.currentTime + t + dur);
    src.start(c.currentTime + t); src.stop(c.currentTime + t + dur + 0.01);
  } catch(e) {}
}

// Low sawtooth thud
function thud(t) {
  try {
    const c = getAC(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(110, c.currentTime + t);
    o.frequency.exponentialRampToValueAtTime(35, c.currentTime + t + 0.09);
    const n = c.currentTime + t;
    g.gain.setValueAtTime(0.38, n);
    g.gain.exponentialRampToValueAtTime(0.0001, n + 0.11);
    o.start(n); o.stop(n + 0.13);
  } catch(e) {}
}

// ── FEDERAL SIGNAL SIREN — 6 seconds ─────────────────────────────────────────
// Steady ~850Hz tone with 2.1Hz AM modulation = classic "wah-wah-wah" pulse
function playFederalSiren(durationSecs) {
  try {
    const c = getAC();
    const startT = c.currentTime;
    const endT   = startT + durationSecs;

    const osc1 = c.createOscillator(); osc1.type = 'sawtooth'; osc1.frequency.value = 850;
    const osc2 = c.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.value = 1700;
    const osc3 = c.createOscillator(); osc3.type = 'square';   osc3.frequency.value = 425;

    const amOsc = c.createOscillator(); amOsc.type = 'sine'; amOsc.frequency.value = 2.1;
    const amDepth = c.createGain(); amDepth.gain.value = 0.45;
    const amOffset = c.createConstantSource(); amOffset.offset.value = 0.55;
    const amMix = c.createGain(); amMix.gain.value = 1;
    amOsc.connect(amDepth); amDepth.connect(amMix);
    amOffset.connect(amMix);

    const g1 = c.createGain(); g1.gain.value = 0.5;
    const g2 = c.createGain(); g2.gain.value = 0.25;
    const g3 = c.createGain(); g3.gain.value = 0.15;
    osc1.connect(g1); osc2.connect(g2); osc3.connect(g3);

    const preGain = c.createGain(); preGain.gain.value = 1;
    g1.connect(preGain); g2.connect(preGain); g3.connect(preGain);

    const vca = c.createGain(); vca.gain.value = 0;
    amMix.connect(vca.gain);
    preGain.connect(vca);

    const master = c.createGain();
    master.gain.setValueAtTime(0, startT);
    master.gain.linearRampToValueAtTime(0.6, startT + 0.3);
    master.gain.setValueAtTime(0.6, endT - 0.4);
    master.gain.linearRampToValueAtTime(0, endT);

    vca.connect(master); master.connect(c.destination);

    osc1.start(startT); osc1.stop(endT + 0.1);
    osc2.start(startT); osc2.stop(endT + 0.1);
    osc3.start(startT); osc3.stop(endT + 0.1);
    amOsc.start(startT); amOsc.stop(endT + 0.1);
    amOffset.start(startT); amOffset.stop(endT + 0.1);
  } catch(e) {}
}

// ── R2D2 SOUNDS ───────────────────────────────────────────────────────────────
function r2chirp(t) {
  chirp(1200, 2800, 0.06, 0.28, t, 'sine');
  chirp(2800, 1400, 0.05, 0.22, t + 0.07, 'sine');
}

function r2confirm(t) {
  chirp(800,  2200, 0.055, 0.26, t + 0.00, 'sine');
  chirp(1400, 3000, 0.050, 0.22, t + 0.07, 'sine');
  chirp(2000, 3600, 0.045, 0.20, t + 0.14, 'sine');
  blip(3200, 0.04, 0.18, t + 0.22);
}

function r2alert(t) {
  for (let i = 0; i < 5; i++) {
    blip(2400 + i * 200, 0.035, 0.22, t + i * 0.055);
    blip(1200, 0.030, 0.16, t + i * 0.055 + 0.025);
  }
}

function r2startup(t) {
  swoosh(t, 0.18, 0.06);
  thud(t + 0.04);
  chirp(400,  2400, 0.07, 0.28, t + 0.10, 'sine');
  chirp(2400, 1200, 0.06, 0.24, t + 0.19, 'sine');
  chirp(1200, 3200, 0.06, 0.24, t + 0.28, 'sine');
  blip(3200, 0.04, 0.22, t + 0.38);
  blip(2800, 0.04, 0.18, t + 0.43);
}

function r2shutdown(t) {
  chirp(2800, 400, 0.07, 0.24, t + 0.00, 'sine');
  chirp(1600, 200, 0.06, 0.20, t + 0.10, 'sine');
  blip(180, 0.07, 0.14, t + 0.22);
  swoosh(t + 0.06, 0.10, 0.08);
}

// ── CMD line sounds ───────────────────────────────────────────────────────────
function soundCmdOpen()  { r2startup(0); }
function soundCmdClose() { r2shutdown(0); }

function soundLine(cls) {
  try {
    if (cls === '' || cls === 'dim') return;
    if      (cls === 'grey')   { blip(900, 0.02, 0.06, 0); }
    else if (cls === 'white')  { r2chirp(0); }
    else if (cls === 'cyan')   { chirp(1000, 2000, 0.055, 0.18, 0, 'sine'); swoosh(0.04, 0.07, 0.05); }
    else if (cls === 'green')  { r2confirm(0); }
    else if (cls === 'yellow') { chirp(1400, 1800, 0.045, 0.18, 0, 'sine'); blip(1800, 0.03, 0.12, 0.06); }
    else if (cls === 'orange') { chirp(1600, 1200, 0.05, 0.20, 0, 'sine'); chirp(1200, 1600, 0.04, 0.16, 0.07, 'sine'); }
    else if (cls === 'red')    { r2alert(0); }
  } catch(e) {}
}

// ── Tick beep for final countdown ─────────────────────────────────────────────
function tickBeep(urgent) {
  if (urgent) { blip(1800, 0.05, 0.32, 0); blip(2200, 0.04, 0.24, 0.06); }
  else        { blip(1400, 0.04, 0.28, 0); }
}
