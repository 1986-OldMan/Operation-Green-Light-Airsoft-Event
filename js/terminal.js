// ── TERMINAL ──────────────────────────────────────────────────────────────────

let termHistory = [];
let histIdx     = -1;

/**
 * Print a line to the terminal output.
 * @param {string} text  - can contain HTML
 * @param {string} cls   - t-ok / t-err / t-info / t-muted / t-warn
 */
function printLine(text, cls = 'info') {
  const out = document.getElementById('termOutput');
  const div = document.createElement('div');
  div.className = 't-line t-' + cls;
  div.innerHTML = text;
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
}

/** Called by SEND button and Enter key */
function submitCommand() {
  const input = document.getElementById('termInput');
  handleCommand(input.value);
  input.value = '';
}

function handleCommand(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;

  termHistory.unshift(raw);
  histIdx = -1;

  printLine(`<span style="color:#4a6a00">$</span> ${trimmed}`, 'info');

  const spaceIdx = trimmed.indexOf(' ');
  const cmd = (spaceIdx === -1 ? trimmed : trimmed.substring(0, spaceIdx)).toUpperCase();
  const arg = spaceIdx === -1 ? '' : trimmed.substring(spaceIdx + 1).trim();

  switch (cmd) {

    case 'HELP':
      printLine('────────────────────────────', 'muted');
      printLine('<span style="color:#ffaa00">ARM</span> [CODE]    — activate warheads', 'muted');
      printLine('<span style="color:#ffaa00">DISARM</span> [CODE] — abort sequence', 'muted');
      printLine('<span style="color:#ffaa00">STATUS</span>        — system report', 'muted');
      printLine('<span style="color:#ffaa00">LIST</span>          — all sites', 'muted');
      printLine('<span style="color:#ffaa00">SCAN</span> [TARGET] — site status', 'muted');
      printLine('<span style="color:#ffaa00">CLEAR</span>         — clear terminal', 'muted');
      printLine('────────────────────────────', 'muted');
      break;

    case 'ARM':
      if (TIMER_SECONDS === 0) {
        printLine('ERROR: TIMER NOT SET — aplică setările înainte', 'err');
      } else if (systemArmed) {
        printLine('ERROR: SEQUENCE ALREADY ACTIVE', 'err');
      } else if (arg === ARM_CODE) {
        printLine('CODE ACCEPTED. INITIATING BACKEND...', 'warn');
        showFakeCmd(ARM_LINES, ARM_CLOSE_DELAY, () => {
          systemArmed = true;
          countdown   = TIMER_SECONDS;
          COUNTRIES.forEach(c => { siteStates[c] = 'armed'; updateTile(c, 'armed'); });
          printLine('ALL WARHEADS ARMED. DETONATION IN ' + formatTime(TIMER_SECONDS), 'err');
          updateStats();
          startCountdown();
        });
      } else if (arg === '') {
        printLine('ERROR: AUTH CODE REQUIRED — ARM [CODE]', 'err');
      } else {
        printLine('ERROR: INVALID AUTHORIZATION CODE', 'err');
        printLine('ACCESS DENIED. INCIDENT LOGGED.', 'err');
      }
      break;

    case 'DISARM':
      if (!systemArmed) {
        printLine('ERROR: NO ACTIVE SEQUENCE', 'err');
      } else if (arg === DISARM_CODE) {
        printLine('CODE ACCEPTED. INITIATING ABORT...', 'ok');
        showFakeCmd(DISARM_LINES, DISARM_CLOSE_DELAY, () => {
          systemArmed = false;
          COUNTRIES.forEach(c => { siteStates[c] = 'defused'; updateTile(c, 'defused'); });
          printLine('ABORT RECEIVED BY ALL 43 SITES', 'ok');
          printLine('WARHEADS SAFED. SEQUENCE ABORTED.', 'ok');
          printLine('★ MISSION ACCOMPLISHED ★', 'ok');
          updateStats();
          stopCountdown();
        });
      } else if (arg === '') {
        printLine('ERROR: AUTH CODE REQUIRED — DISARM [CODE]', 'err');
      } else {
        printLine('ERROR: INVALID ABORT CODE', 'err');
        printLine('ACCESS DENIED.', 'err');
      }
      break;

    case 'STATUS': {
      const armed   = Object.values(siteStates).filter(s => s === 'armed').length;
      const defused = Object.values(siteStates).filter(s => s === 'defused').length;
      printLine('────────────────────────────', 'muted');
      printLine(`SEQUENCE: ${systemArmed
        ? '<span style="color:#ff2200">ACTIVE</span>'
        : '<span style="color:#4a6a00">INACTIVE</span>'}`, 'muted');
      printLine(`ARMED: <span style="color:#ff2200">${armed}/43</span>  DEFUSED: <span style="color:#00ff88">${defused}/43</span>`, 'muted');
      printLine(`TIME: ${systemArmed ? formatTime(countdown) : 'N/A'}`, 'muted');
      printLine('────────────────────────────', 'muted');
      break;
    }

    case 'LIST':
      printLine('────────────────────────────', 'muted');
      COUNTRIES.forEach(c => {
        const s   = siteStates[c];
        const col = s === 'armed' ? 'err' : s === 'defused' ? 'ok' : 'muted';
        const sym = s === 'armed' ? '⚠'   : s === 'defused' ? '✓'  : '○';
        printLine(`${sym} ${c.padEnd(13)} ${s.toUpperCase()}`, col);
      });
      printLine('────────────────────────────', 'muted');
      break;

    case 'SCAN': {
      const argUp  = arg.toUpperCase();
      const target = COUNTRIES.find(c => c.startsWith(argUp.substring(0, 6)));
      if (!arg) {
        printLine('ERROR: SPECIFY TARGET — SCAN [COUNTRY]', 'err');
      } else if (target) {
        const s   = siteStates[target];
        const col = s === 'armed' ? 'err' : s === 'defused' ? 'ok' : 'muted';
        printLine(`SCANNING ${target}...`, 'muted');
        setTimeout(() => printLine(
          `STATUS: <span style="${s==='armed'?'color:#ff2200':s==='defused'?'color:#00ff88':'color:#4a6a00'}">${s.toUpperCase()}</span>`,
          col
        ), 300);
      } else {
        printLine(`ERROR: TARGET NOT FOUND — ${arg}`, 'err');
      }
      break;
    }

    case 'CLEAR':
      document.getElementById('termOutput').innerHTML = '';
      break;

    default:
      printLine(`ERROR: UNKNOWN COMMAND — ${cmd}`, 'err');
      printLine('TYPE HELP FOR COMMAND LIST', 'muted');
  }
}

// ── KEYBOARD HANDLING ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const termInput = document.getElementById('termInput');

  termInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      submitCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      histIdx = Math.min(histIdx + 1, termHistory.length - 1);
      termInput.value = termHistory[histIdx] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      histIdx = Math.max(histIdx - 1, -1);
      termInput.value = histIdx >= 0 ? termHistory[histIdx] : '';
    }
  });
});
