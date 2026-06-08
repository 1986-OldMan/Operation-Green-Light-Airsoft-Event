// ── MAIN — countdown, detonation, app init ───────────────────────────────────

// ── COUNTDOWN ─────────────────────────────────────────────────────────────────
function startCountdown() {
  timerStartEpoch  = Date.now();
  warned30 = warned15 = warned5 = warned1 = false;
  finalCountingDown = false;

  const disp = document.getElementById('countdownDisplay');
  disp.className = 'countdown-display armed';
  document.getElementById('globalAlert').classList.add('show');
  document.getElementById('defusedBanner').classList.remove('show');

  // Federal Signal siren for 6 seconds, then voice
  playFederalSiren(6);
  setTimeout(() => speak('Warning. Nuclear detonation sequence active. All sites armed.', 0.75, 0.78), 6500);

  if (timerInterval) clearInterval(timerInterval);
  disp.textContent = formatTime(countdown);

  timerInterval = setInterval(() => {
    if (!systemArmed) { clearInterval(timerInterval); return; }

    const elapsed = Math.floor((Date.now() - timerStartEpoch) / 1000);
    countdown = Math.max(0, TIMER_SECONDS - elapsed);
    disp.textContent = formatTime(countdown);

    // ── TIMED WARNINGS ────────────────────────────────────────────────────────
    if (!warned30 && countdown <= 1800 && countdown > 1790) {
      warned30 = true;
      r2alert(0);
      setTimeout(() => speak('Warning. Thirty minutes to detonation.', 0.78, 0.80), 400);
      printLine('⚠ WARNING: 30 MINUTES TO DETONATION', 'warn');
    }
    if (!warned15 && countdown <= 900 && countdown > 890) {
      warned15 = true;
      r2alert(0);
      setTimeout(() => speak('Warning. Fifteen minutes to detonation.', 0.76, 0.79), 400);
      printLine('⚠ WARNING: 15 MINUTES TO DETONATION', 'warn');
    }
    if (!warned5 && countdown <= 300 && countdown > 290) {
      warned5 = true;
      r2alert(0); setTimeout(() => r2alert(0.4), 400);
      setTimeout(() => speak('Alert. Five minutes to detonation. Abort now.', 0.73, 0.77), 600);
      printLine('⚠ ALERT: 5 MINUTES TO DETONATION', 'err');
    }
    if (!warned1 && countdown <= 60 && countdown > 50) {
      warned1 = true;
      r2alert(0); setTimeout(() => r2alert(0.3), 300); setTimeout(() => r2alert(0.6), 600);
      setTimeout(() => speak('Final warning. One minute to detonation.', 0.70, 0.75), 700);
      printLine('⚠ FINAL WARNING: 1 MINUTE TO DETONATION', 'err');
    }

    // ── FINAL 10-SECOND COUNTDOWN ─────────────────────────────────────────────
    if (countdown <= 10 && countdown > 0 && !finalCountingDown) {
      clearInterval(timerInterval);
      startFinalCountdown();
      return;
    }
    if (countdown <= 0 && !finalCountingDown) {
      clearInterval(timerInterval);
      triggerDetonation();
    }
  }, 500);
}

function stopCountdown() {
  if (timerInterval) clearInterval(timerInterval);
  finalCountingDown = false;
  timerStartEpoch   = null;

  const disp = document.getElementById('countdownDisplay');
  disp.className   = 'countdown-display defused';
  disp.textContent = formatTime(countdown);
  document.getElementById('globalAlert').classList.remove('show');
  document.getElementById('defusedBanner').classList.add('show');

  r2confirm(0);
  setTimeout(() => speak('All warheads successfully disarmed. Threat neutralized.', 0.85, 0.80), 500);
}

// ── FINAL 10-SECOND COUNTDOWN — audio + voice only, no overlay ───────────────
function startFinalCountdown() {
  finalCountingDown = true;
  let sec = 10;

  speak(String(sec), 0.8, 1.1);
  tickBeep(false);
  printLine('⚠ T-MINUS 10 SECONDS TO DETONATION', 'err');

  const iv = setInterval(() => {
    if (!finalCountingDown) { clearInterval(iv); return; }
    sec--;
    if (sec <= 0) {
      clearInterval(iv);
      tickBeep(true);
      setTimeout(() => triggerDetonation(), 500);
      return;
    }
    if (sec <= 5) { tickBeep(true);  speak(String(sec), 0.7, 1.2); }
    else          { tickBeep(false); speak(String(sec), 0.8, 1.1); }
    document.getElementById('countdownDisplay').textContent = '00:0' + sec;
  }, 1000);
}

// ── DETONATION ────────────────────────────────────────────────────────────────
function triggerDetonation() {
  if (timerInterval) clearInterval(timerInterval);
  systemArmed       = false;
  timerStartEpoch   = null;
  finalCountingDown = false;

  const flash = document.getElementById('flashWhite');
  flash.style.transition = 'none';
  flash.style.opacity    = '1';
  setTimeout(() => { flash.style.transition = 'opacity 1.5s ease'; flash.style.opacity = '0'; }, 200);

  setTimeout(() => speak('Detonation sequence complete. All warheads detonated.', 0.70, 0.75), 300);
  setTimeout(() => {
    const vid = document.getElementById('detonationVideo');
    vid.currentTime = 0;
    vid.play().catch(() => {});
    document.getElementById('detonationOverlay').classList.add('show');
  }, 500);

  printLine('⚠ DETONATION SEQUENCE COMPLETE', 'err');
  printLine('ALL 43 WARHEADS DETONATED. MISSION FAILED.', 'err');
  document.getElementById('countdownDisplay').textContent = '00:00';
  document.getElementById('countdownDisplay').className   = 'countdown-display armed';
  document.getElementById('globalAlert').classList.remove('show');
  updateStats();
}

function closeDetonation() {
  const vid = document.getElementById('detonationVideo');
  vid.pause();
  vid.currentTime = 0;
  document.getElementById('detonationOverlay').classList.remove('show');
}

// ── APP INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initGrid();
  updateStats();
  requestWakeLock();
});
