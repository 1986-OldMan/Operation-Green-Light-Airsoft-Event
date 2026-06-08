// ── UTILITIES ─────────────────────────────────────────────────────────────────

/**
 * Format seconds into MM:SS or HH:MM:SS
 */
function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ── GAME STATE ────────────────────────────────────────────────────────────────

const COUNTRIES = [
  "ALBANIA","ANDORRA","AUSTRIA","BELARUS","BELGIUM","BOSNIA","BULGARIA",
  "CROATIA","CYPRUS","CZECHIA","DENMARK","ESTONIA","FINLAND","FRANCE",
  "GERMANY","GREECE","HUNGARY","ICELAND","IRELAND","ITALY","KOSOVO",
  "LATVIA","LIECHTENSTEIN","LITHUANIA","LUXEMBOURG","MALTA","MOLDOVA",
  "MONACO","MONTENEGRO","NETHERLANDS","N.MACED.","NORWAY","POLAND",
  "PORTUGAL","ROMANIA","SAN MARINO","SERBIA","SLOVAKIA","SLOVENIA",
  "SPAIN","SWEDEN","SWITZERLAND","UKRAINE"
];

// Mutable state
let ARM_CODE     = "Nuclear_lunch_init_start";
let DISARM_CODE  = "Nuclear_lunch_exec_stop";
let TIMER_SECONDS = 0;

let siteStates       = {};
let systemArmed      = false;
let countdown        = 0;
let timerInterval    = null;
let timerStartEpoch  = null;
let wakeLock         = null;

// Warning flags — fire once per armed session
let warned30         = false;
let warned15         = false;
let warned5          = false;
let warned1          = false;
let finalCountingDown = false;

// Init all sites to idle
COUNTRIES.forEach(c => siteStates[c] = 'idle');

// ── GRID ──────────────────────────────────────────────────────────────────────
function initGrid() {
  const grid = document.getElementById('countriesGrid');
  grid.innerHTML = '';
  COUNTRIES.forEach(c => {
    const tile = document.createElement('div');
    tile.className = 'country-tile idle';
    tile.id = 'tile-' + c.replace(/[\s.]/g, '_');
    tile.innerHTML = `<span class="c-name">${c}</span><span class="c-status">IDLE</span>`;
    grid.appendChild(tile);
  });
}

function updateTile(country, state) {
  const tile = document.getElementById('tile-' + country.replace(/[\s.]/g, '_'));
  if (!tile) return;
  tile.className = 'country-tile ' + state;
  tile.querySelector('.c-status').textContent =
    { idle: 'IDLE', armed: '⚠ ARMED', defused: '✓ SAFE' }[state] || state;
}

// ── STATS PANEL ───────────────────────────────────────────────────────────────
function updateStats() {
  const armed   = Object.values(siteStates).filter(s => s === 'armed').length;
  const defused = Object.values(siteStates).filter(s => s === 'defused').length;
  const total   = COUNTRIES.length;

  document.getElementById('statArmed').textContent   = armed;
  document.getElementById('statDefused').textContent = defused;
  document.getElementById('armedStatus').textContent  = `● ARMED: ${armed}/${total}`;
  document.getElementById('defusedStatus').textContent = `● DEFUSED: ${defused}`;

  if (systemArmed) {
    document.getElementById('armedStatus').className   = 'status-pill active';
    document.getElementById('defusedStatus').className = defused > 0 ? 'status-pill ok' : 'status-pill idle';
    document.getElementById('statSeq').textContent     = 'ACTIVE';
    document.getElementById('seqStatus').className     = 'status-pill active';
    document.getElementById('seqStatus').textContent   = '● SEQUENCE: ACTIVE';
    document.getElementById('sysStatus').className     = 'status-pill active';
    document.getElementById('sysStatus').textContent   = '● SYSTEM: ARMED';

    const pct    = armed / total;
    const threat = document.getElementById('statThreat');
    if (armed === 0 && defused > 0) {
      threat.textContent = 'ELIMINATED'; threat.style.color = '#00ff88';
    } else if (pct > 0.7) {
      threat.textContent = 'CRITICAL';   threat.style.color = '#ff2200';
    } else if (pct > 0.3) {
      threat.textContent = 'HIGH';       threat.style.color = '#ffaa00';
    } else {
      threat.textContent = 'MODERATE';   threat.style.color = '#c8ff00';
    }
  } else {
    document.getElementById('sysStatus').className    = 'status-pill idle';
    document.getElementById('sysStatus').textContent  = '● SYSTEM STANDBY';
    document.getElementById('armedStatus').className  = 'status-pill idle';
    document.getElementById('seqStatus').className    = 'status-pill idle';
    document.getElementById('seqStatus').textContent  = '● SEQUENCE: INACTIVE';
    document.getElementById('statSeq').textContent    = 'INACTIVE';
    document.getElementById('statThreat').textContent = 'NONE';
    document.getElementById('statThreat').style.color = '#4a6a00';
  }
}

// ── WAKE LOCK ─────────────────────────────────────────────────────────────────
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) {
    document.getElementById('wakeStatus').textContent = '● WAKE LOCK: NOT SUPPORTED';
    return;
  }
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    document.getElementById('wakeStatus').textContent  = '● WAKE LOCK: ACTIVE';
    document.getElementById('wakeStatus').className    = 'wake-status ok';
    wakeLock.addEventListener('release', () => {
      document.getElementById('wakeStatus').textContent = '● WAKE LOCK: RELEASED';
      document.getElementById('wakeStatus').className   = 'wake-status warn';
    });
  } catch(e) {
    document.getElementById('wakeStatus').textContent = '● WAKE LOCK: EROARE';
  }
}

// Re-acquire on tab focus + recalculate timer after sleep
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && systemArmed && timerStartEpoch !== null) {
    const elapsed = Math.floor((Date.now() - timerStartEpoch) / 1000);
    countdown = Math.max(0, TIMER_SECONDS - elapsed);
    document.getElementById('countdownDisplay').textContent = formatTime(countdown);
    if (countdown <= 0 && !finalCountingDown) {
      clearInterval(timerInterval);
      startFinalCountdown();
      return;
    }
    if (!wakeLock || wakeLock.released) await requestWakeLock();
  }
});

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function applyAdminSettings() {
  const armVal   = document.getElementById('adminArmCode').value.trim();
  const disarmVal= document.getElementById('adminDisarmCode').value.trim();
  const minVal   = parseFloat(document.getElementById('adminTimer').value);

  if (!armVal || !disarmVal) { alert('Codurile nu pot fi goale!'); return; }
  if (isNaN(minVal) || minVal <= 0) { alert('Introdu un număr valid de minute!'); return; }

  ARM_CODE      = armVal;
  DISARM_CODE   = disarmVal;
  TIMER_SECONDS = Math.round(minVal * 60);

  const tStr = formatTime(TIMER_SECONDS);
  document.getElementById('adminInfo').innerHTML =
    `ARM: ${ARM_CODE}<br>DISARM: ${DISARM_CODE}<br>TIMER: ${tStr}`;

  printLine('SETTINGS UPDATED — TIMER: ' + tStr, 'ok');
  requestWakeLock();
}
