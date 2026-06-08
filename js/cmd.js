// ── FAKE CMD OVERLAY ──────────────────────────────────────────────────────────

const ARM_LINES = [
  { text: '===============================================================', cls: 'dim',    delay: 0    },
  { text: '  KREMLIN SECURE SHELL v7.3 — MINISTRY OF DEFENCE SYSTEM',      cls: 'grey',   delay: 350  },
  { text: '  CLASSIFICATION: TOP SECRET // EYES ONLY',                      cls: 'grey',   delay: 700  },
  { text: '===============================================================', cls: 'dim',    delay: 1050 },
  { text: '',                                                                cls: '',       delay: 1200 },
  { text: 'C:\\KREMLIN\\sys32> auth_daemon.exe --escalate --level=ROOT',    cls: 'white',  delay: 1450 },
  { text: '[AUTH]  Initializing secure authentication protocol...',          cls: 'cyan',   delay: 1900 },
  { text: '[AUTH]  Hardware token: PRESENT',                                 cls: 'cyan',   delay: 2350 },
  { text: '[AUTH]  Biometric scan: CONFIRMED',                               cls: 'green',  delay: 2800 },
  { text: '[AUTH]  Voice print: MATCHED',                                    cls: 'green',  delay: 3250 },
  { text: '[AUTH]  Clearance level: OMEGA-7 — ACCESS GRANTED',               cls: 'green',  delay: 3700 },
  { text: '',                                                                cls: '',       delay: 3950 },
  { text: 'C:\\KREMLIN\\sys32> warhead_ctrl.exe --mode=ARM --target=ALL --region=EUR', cls: 'white', delay: 4200 },
  { text: '[SYS]   Loading warhead_ctrl module v9.4.1...',                   cls: 'cyan',   delay: 4650 },
  { text: '[SYS]   Decrypting target coordinates... DONE',                   cls: 'cyan',   delay: 5100 },
  { text: '[SYS]   Connecting to satellite uplink COSMOS-4... ESTABLISHED',  cls: 'cyan',   delay: 5550 },
  { text: '[SYS]   Verifying warhead status on all 43 sites...',             cls: 'yellow', delay: 6000 },
  { text: '[SITE]  EUR-01 through EUR-43 ... ALL ONLINE',                    cls: 'yellow', delay: 6450 },
  { text: '[SYS]   Broadcasting ARM authorization signal...',                cls: 'yellow', delay: 6900 },
  { text: '[SYS]   Encryption handshake complete on all nodes',              cls: 'yellow', delay: 7350 },
  { text: '[SYS]   Detonation timer synchronized — T-MINUS COUNTING',       cls: 'red',    delay: 7800 },
  { text: '[SYS]   LAUNCH AUTHORIZATION: CONFIRMED',                         cls: 'red',    delay: 8250 },
  { text: '[SYS]   Encryption lock applied. No abort without auth key.',     cls: 'green',  delay: 8700 },
  { text: '',                                                                cls: '',       delay: 8950 },
  { text: 'C:\\KREMLIN\\sys32> exit',                                        cls: 'white',  delay: 9100 },
];

const DISARM_LINES = [
  { text: '===============================================================',            cls: 'dim',    delay: 0    },
  { text: '  KREMLIN SECURE SHELL v7.3 — EMERGENCY ABORT PROTOCOL',                    cls: 'grey',   delay: 350  },
  { text: '  CLASSIFICATION: TOP SECRET // ABORT AUTHORITY REQUIRED',                  cls: 'grey',   delay: 700  },
  { text: '===============================================================',            cls: 'dim',    delay: 1050 },
  { text: '',                                                                            cls: '',       delay: 1200 },
  { text: 'C:\\KREMLIN\\sys32> auth_daemon.exe --escalate --abort-override',            cls: 'white',  delay: 1450 },
  { text: '[AUTH]  Initializing emergency abort authentication...',                     cls: 'cyan',   delay: 1900 },
  { text: '[AUTH]  Emergency abort key: VALID',                                         cls: 'green',  delay: 2350 },
  { text: '[AUTH]  Secondary confirmation: ACCEPTED',                                   cls: 'green',  delay: 2800 },
  { text: '[AUTH]  ABORT clearance level: ALPHA-1 — ACCESS GRANTED',                   cls: 'green',  delay: 3250 },
  { text: '',                                                                            cls: '',       delay: 3500 },
  { text: 'C:\\KREMLIN\\sys32> warhead_ctrl.exe --mode=ABORT --target=ALL --region=EUR --force', cls: 'white', delay: 3750 },
  { text: '[SYS]   Loading warhead_ctrl module v9.4.1...',                              cls: 'cyan',   delay: 4200 },
  { text: '[SYS]   Connecting to satellite uplink COSMOS-4... ESTABLISHED',             cls: 'cyan',   delay: 4650 },
  { text: '[SYS]   Transmitting ABORT signal to all 43 sites...',                       cls: 'yellow', delay: 5100 },
  { text: '[SITE]  EUR-01 through EUR-43 ... ABORT RECEIVED',                           cls: 'yellow', delay: 5550 },
  { text: '[SYS]   Disarming sequence initiated on all nodes...',                       cls: 'yellow', delay: 6000 },
  { text: '[SYS]   Detonation timer: HALTED',                                           cls: 'orange', delay: 6450 },
  { text: '[SYS]   Warhead safeties: RE-ENGAGED',                                       cls: 'green',  delay: 6900 },
  { text: '[SYS]   All 43 warheads confirmed SAFE',                                     cls: 'green',  delay: 7350 },
  { text: '[SYS]   ABORT SUCCESSFUL — THREAT NEUTRALIZED',                              cls: 'green',  delay: 7800 },
  { text: '',                                                                            cls: '',       delay: 8050 },
  { text: 'C:\\KREMLIN\\sys32> exit',                                                   cls: 'white',  delay: 8200 },
];

const ARM_CLOSE_DELAY   = ARM_LINES[ARM_LINES.length - 1].delay   + 800;
const DISARM_CLOSE_DELAY = DISARM_LINES[DISARM_LINES.length - 1].delay + 800;

/**
 * Show the fake CMD window, animate lines one by one, then close.
 * @param {Array}    lines      - array of {text, cls, delay}
 * @param {number}   closeDelay - ms after which the window closes
 * @param {Function} onDone     - callback after window closes
 */
function showFakeCmd(lines, closeDelay, onDone) {
  const overlay = document.getElementById('cmdOverlay');
  const body    = document.getElementById('cmdBody');
  body.innerHTML = '';
  overlay.classList.add('show');
  soundCmdOpen();

  lines.forEach(({ text, cls, delay }) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className  = 'cmd-line ' + (cls || '');
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      if (text !== '') soundLine(cls);
    }, delay);
  });

  setTimeout(() => {
    soundCmdClose();
    setTimeout(() => {
      overlay.classList.remove('show');
      body.innerHTML = '';
      if (onDone) onDone();
    }, 400);
  }, closeDelay);
}
