/* ═══════════════════════════════════════════════
   MODO ALERTA — Utilitários compartilhados + Sound Engine
   (lógica do Modo Sala fica em room.js)
   ═══════════════════════════════════════════════ */

// ── SOUND ENGINE ──────────────────────────────
const Sound = (() => {
  let ctx = null;
  let enabled = true;
  // Numa sala com dezenas de celulares, os bipes viram barulho: no celular o som
  // começa desligado (o host no computador continua com som). A escolha fica salva.
  const MUTE_KEY = 'modoAlerta_muted';
  let muted = (() => {
    try {
      const saved = localStorage.getItem(MUTE_KEY);
      if (saved !== null) return saved === '1';
    } catch (e) {}
    return window.matchMedia('(pointer: coarse)').matches;
  })();

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { enabled = false; }
  }

  function master(gain = 0.4) {
    const g = ctx.createGain();
    g.gain.value = gain;
    g.connect(ctx.destination);
    return g;
  }

  function osc(freq, type, duration, gainVal = 0.3, start = 0) {
    if (!ctx || !enabled || muted) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime + start);
    g.gain.setValueAtTime(0, ctx.currentTime + start);
    g.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + start + 0.01);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime + start);
    o.stop(ctx.currentTime + start + duration + 0.05);
  }

  const sounds = {
    click() {
      init();
      osc(880, 'sine', 0.08, 0.2);
      osc(1100, 'sine', 0.06, 0.1, 0.04);
    },
    select(value) {
      init();
      const freqs = [260, 300, 380, 460, 560];
      const freq = freqs[value - 1] || 380;
      osc(freq, 'triangle', 0.15, 0.25);
      osc(freq * 1.5, 'sine', 0.1, 0.1, 0.05);
    },
    correct() {
      init();
      osc(523, 'sine', 0.12, 0.3);
      osc(659, 'sine', 0.12, 0.3, 0.1);
      osc(784, 'sine', 0.2, 0.35, 0.2);
      osc(1047, 'sine', 0.15, 0.3, 0.32);
    },
    wrong() {
      init();
      osc(300, 'sawtooth', 0.15, 0.25);
      osc(220, 'sawtooth', 0.2, 0.3, 0.12);
      osc(180, 'sawtooth', 0.15, 0.2, 0.25);
    },
    levelUp() {
      init();
      [523, 659, 784, 1047, 1175, 1568].forEach((f, i) => {
        osc(f, 'sine', 0.18, 0.3, i * 0.1);
      });
    },
    start() {
      init();
      osc(220, 'sine', 0.08, 0.2);
      osc(330, 'sine', 0.1, 0.2, 0.1);
      osc(440, 'sine', 0.1, 0.2, 0.2);
      osc(880, 'sine', 0.2, 0.35, 0.32);
    },
    whoosh() {
      init();
      if (!ctx || !enabled || muted) return;
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(3000, ctx.currentTime + 0.25);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      source.start(); source.stop(ctx.currentTime + 0.35);
    },
    finalFanfare() {
      init();
      const melody = [523, 659, 784, 1047, 784, 1047, 1175, 1568];
      melody.forEach((f, i) => osc(f, 'sine', 0.22, 0.3, i * 0.12));
    },
    hover() {
      init();
      osc(1400, 'sine', 0.035, 0.06);
    },
    typingTick() {
      init();
      osc(1100 + Math.random() * 150, 'sine', 0.03, 0.03);
    },
    isMuted() { return muted; },
    setMuted(value) {
      muted = !!value;
      try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) {}
    },
  };

  return sounds;
})();

// ── HOVER SOUND (com cooldown para não spammar) ───
let _hoverCooldown = false;
function playHoverSound() {
  if (_hoverCooldown) return;
  Sound.hover();
  _hoverCooldown = true;
  setTimeout(() => { _hoverCooldown = false; }, 90);
}

document.addEventListener('mouseover', (e) => {
  const target = e.target.closest(
    '.btn-primary:not(:disabled), .btn-secondary:not(:disabled), .decision-btn, .badge'
  );
  if (!target) return;
  if (target.disabled) return;
  playHoverSound();
});

// ── HELPERS ───────────────────────────────────

// Nome/área vêm digitados pelos jogadores e são exibidos para todos via innerHTML —
// sempre escapar antes, senão um "nome" com HTML roda código na tela dos outros.
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function transitionTo(showFn) {
  const overlay = document.createElement('div');
  overlay.className = 'transition-overlay';
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.classList.add('active');
    setTimeout(() => {
      showFn();
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 350);
    }, 300);
  });
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    requestAnimationFrame(() => el.classList.add('active'));
    window.scrollTo(0, 0);
  }
}

// ── SVG ICON HELPER ───────────────────────────
const svg = (paths, size = 18) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

// ── TYPE ICONS / LABELS ───────────────────────
const typeConfig = {
  'SMS':      { icon: svg('<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'), label: 'SMS', color: '#7AC143' },
  'WhatsApp': { icon: svg('<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'), label: 'WhatsApp', color: '#9dd46a' },
  'Email':    { icon: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>'), label: 'E-mail', color: '#a1a1aa' },
  'Ligação':  { icon: svg('<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91a16 16 0 006.08 6.08l1.97-1.97a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>'), label: 'Ligação', color: '#E71C35' },
  'Site':     { icon: svg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>'), label: 'Site / URL', color: '#f97316' },
  'QR Code':  { icon: svg('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="7" height="3"/>'), label: 'QR Code', color: '#f5a623' },
  'LinkedIn': { icon: svg('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>'), label: 'LinkedIn', color: '#5d9432' },
};

// ── BOTÃO DE SOM ──────────────────────────────
const ICON_SOUND_ON  = svg('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/>', 20);
const ICON_SOUND_OFF = svg('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>', 20);

function initSoundToggle() {
  const btn = document.getElementById('btn-sound');
  if (!btn) return;
  const render = () => {
    const muted = Sound.isMuted();
    btn.innerHTML = muted ? ICON_SOUND_OFF : ICON_SOUND_ON;
    btn.setAttribute('aria-label', muted ? 'Ligar som' : 'Desligar som');
    btn.setAttribute('aria-pressed', String(!muted));
    btn.title = btn.getAttribute('aria-label');
  };
  btn.addEventListener('click', () => {
    Sound.setMuted(!Sound.isMuted());
    render();
    Sound.click();
  });
  render();
}

// ── PARTICLES ─────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      animation-duration: ${Math.random() * 8 + 6}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: ${Math.random() * 0.5 + 0.1};
    `;
    container.appendChild(p);
  }
}

// ── SPLASH ────────────────────────────────────
function initSplash() {
  spawnParticles();
  document.getElementById('btn-start').addEventListener('click', () => {
    Sound.start();
    if (roomCodeFromUrl()) {
      // Veio pelo link da sala: vai direto pra tela de entrada com o código preenchido.
      RoomState.pendingMode = 'join';
      transitionTo(() => showRegisterForRoom());
    } else {
      transitionTo(() => showModeSelect());
    }
  });
}

// ── SCENARIO RENDERING (reaproveitado pelo Modo Sala) ──

/* Preenche o card do cenário (SMS/e-mail/ligação/site/QR/LinkedIn) com o
   conteúdo bruto. O efeito de "digitação" é aplicado depois, se desejado,
   por animateScenarioEntry(). */
function renderScenarioFrame(scenario) {
  const cfg = typeConfig[scenario.type] || { icon: '📄', label: scenario.type, color: '#94a3b8' };
  document.getElementById('scenario-type-icon').innerHTML     = cfg.icon;
  document.getElementById('scenario-type-label').textContent  = cfg.label;
  document.getElementById('scenario-type-bar').style.borderLeft = `3px solid ${cfg.color}`;

  const contextEl = document.getElementById('scenario-context');
  if (scenario.context) {
    contextEl.textContent = scenario.context;
    contextEl.style.display = 'block';
  } else {
    contextEl.style.display = 'none';
  }

  ['sms','whatsapp','email','call','site','qr','linkedin'].forEach(f => {
    const el = document.getElementById(`frame-${f}`);
    if (el) el.style.display = 'none';
  });

  // Botões de "call to action" (só existem nos frames de e-mail e site) —
  // ocultos por padrão, só aparecem se o cenário tiver scenario.cta.
  ['email-cta', 'site-cta'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.style.display = 'none';
  });

  const type = scenario.type;
  if (type === 'SMS') {
    const frame = document.getElementById('frame-sms');
    frame.style.display = 'block';
    document.getElementById('sms-sender').textContent  = scenario.sender;
    document.getElementById('sms-content').textContent = scenario.content;
  } else if (type === 'WhatsApp') {
    document.getElementById('frame-whatsapp').style.display = 'block';
    document.getElementById('wa-sender').textContent  = scenario.sender;
    document.getElementById('wa-content').textContent = scenario.content;
  } else if (type === 'Email') {
    document.getElementById('frame-email').style.display = 'block';
    document.getElementById('email-sender').textContent  = scenario.sender;
    document.getElementById('email-subject').textContent = scenario.subject || '(sem assunto)';
    document.getElementById('email-content').textContent = scenario.content;
    const cta = document.getElementById('email-cta');
    if (scenario.cta) { cta.textContent = scenario.cta; cta.style.display = 'block'; }
  } else if (type === 'Ligação') {
    document.getElementById('frame-call').style.display = 'block';
    document.getElementById('call-sender').textContent  = scenario.sender;
    document.getElementById('call-content').textContent = scenario.content;
  } else if (type === 'Site') {
    document.getElementById('frame-site').style.display = 'block';
    document.getElementById('site-sender').textContent  = scenario.sender;
    document.getElementById('site-content').textContent = scenario.content;
    const cta = document.getElementById('site-cta');
    if (scenario.cta) { cta.textContent = scenario.cta; cta.style.display = 'block'; }
  } else if (type === 'QR Code') {
    document.getElementById('frame-qr').style.display = 'block';
    document.getElementById('qr-content').textContent = scenario.content;
  } else if (type === 'LinkedIn') {
    document.getElementById('frame-linkedin').style.display = 'block';
    document.getElementById('li-sender').textContent  = scenario.sender;
    document.getElementById('li-content').textContent = scenario.content;
  }
}

// ── ANIMAÇÃO DE ENTRADA DO CENÁRIO ────────────

let _skipAnimation = null;

function typewriterEffect(element, text, speed, onComplete) {
  let i = 0;
  let tid = null;
  element.textContent = '';

  _skipAnimation = () => {
    if (tid) clearTimeout(tid);
    element.textContent = text;
    _skipAnimation = null;
    if (onComplete) onComplete();
  };

  function step() {
    if (i < text.length) {
      const ch = text[i++];
      element.textContent += ch;
      if (ch !== ' ' && ch !== '\n') Sound.typingTick();
      tid = setTimeout(step, speed);
    } else {
      _skipAnimation = null;
      if (onComplete) onComplete();
    }
  }
  step();
}

/* Indicador de "digitando…" seguido do balão real — usado por SMS e WhatsApp.
   wrapperSelector permite animar um balão que envolve o texto (WhatsApp),
   quando o próprio elemento de texto não é o balão inteiro (como no SMS). */
function runTypingBubble(textEl, containerEl, text, done, wrapperSelector) {
  const wrapperEl = wrapperSelector ? containerEl.querySelector(wrapperSelector) : textEl;
  textEl.textContent = '';
  wrapperEl.style.display = 'none';

  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  containerEl.appendChild(indicator);

  const typingDelay = Math.min(1400, Math.max(700, text.length * 8));
  const speed = Math.max(10, Math.min(28, 1800 / text.length));

  let tid = setTimeout(() => {
    indicator.remove();
    wrapperEl.style.display = '';
    typewriterEffect(textEl, text, speed, done);
  }, typingDelay);

  _skipAnimation = () => {
    clearTimeout(tid);
    indicator.remove();
    wrapperEl.style.display = '';
    textEl.textContent = text;
    _skipAnimation = null;
    done();
  };
}

function revealDecision() {
  const el = document.querySelector('.decision-section');
  if (!el) return;
  el.style.opacity = '1';
  el.style.transform = '';
  el.style.pointerEvents = '';
}

function animateScenarioEntry(scenario, onDone) {
  const decisionEl = document.querySelector('.decision-section');
  if (decisionEl) {
    decisionEl.style.opacity = '0';
    decisionEl.style.transform = 'translateY(10px)';
    decisionEl.style.pointerEvents = 'none';
  }

  const done = () => { revealDecision(); if (onDone) onDone(); };
  const type = scenario.type;

  if (type === 'SMS') {
    runTypingBubble(document.getElementById('sms-content'), document.querySelector('#frame-sms .phone-body'), scenario.content, done);

  } else if (type === 'WhatsApp') {
    runTypingBubble(document.getElementById('wa-content'), document.querySelector('#frame-whatsapp .wa-chat-bg'), scenario.content, done, '.wa-bubble');

  } else if (type === 'Email') {
    const body = document.getElementById('email-content');
    const text = scenario.content;
    body.textContent = '';
    const speed = Math.max(8, Math.min(20, 1800 / text.length));
    setTimeout(() => typewriterEffect(body, text, speed, done), 300);

  } else if (type === 'Ligação') {
    const el  = document.getElementById('call-content');
    const text = scenario.content;
    el.textContent = '';
    const speed = Math.max(10, Math.min(25, 1800 / text.length));
    setTimeout(() => typewriterEffect(el, text, speed, done), 500);

  } else {
    setTimeout(done, 400);
  }
}

// ── LEADERBOARD HISTÓRICO (todas as sessões, todos os dispositivos) ──

function _localSave(name, area, score, medal) {
  try {
    const board = JSON.parse(localStorage.getItem('modoAlerta_ranking') || '[]');
    board.push({ name, area, score, medal, date: new Date().toLocaleDateString('pt-BR') });
    board.sort((a, b) => b.score - a.score);
    localStorage.setItem('modoAlerta_ranking', JSON.stringify(board));
  } catch(e) {}
}

function _localLoad() {
  try { return JSON.parse(localStorage.getItem('modoAlerta_ranking') || '[]'); }
  catch { return []; }
}

async function saveToLeaderboard(name, area, score, medal) {
  if (window._saveScore) {
    try { await window._saveScore(name, area, score, medal); return; } catch(e) {}
  }
  _localSave(name, area, score, medal);
}

async function showLeaderboard(returnScreen) {
  showScreen('screen-leaderboard');
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '<p class="leaderboard-empty">Carregando...</p>';

  let board = [];
  if (window._loadRanking) {
    try { board = await window._loadRanking(); } catch(e) { board = _localLoad(); }
  } else {
    board = _localLoad();
  }

  list.innerHTML = '';
  if (board.length === 0) {
    list.innerHTML = '<p class="leaderboard-empty">Nenhuma partida registrada ainda.</p>';
  } else {
    const medalEmoji = { 'grade-gold': '🥇', 'grade-silver': '🥈', 'grade-bronze': '🥉' };
    const medalClass = { 'grade-gold': 'lb-gold', 'grade-silver': 'lb-silver', 'grade-bronze': 'lb-bronze' };
    board.forEach((entry, i) => {
      const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
      const item = document.createElement('div');
      item.className = `lb-item ${medalClass[entry.medal] || ''}`;
      item.innerHTML = `
        <div class="lb-rank ${rankClass}">${i + 1}</div>
        <div class="lb-medal">${medalEmoji[entry.medal] || '🎖️'}</div>
        <div class="lb-info">
          <div class="lb-name">${escapeHtml(entry.name)}</div>
          <div class="lb-area">${escapeHtml(entry.area)}</div>
        </div>
        <div class="lb-score">
          <div class="lb-pts">${Number(entry.score) || 0} pts</div>
          <div class="lb-date">${escapeHtml(entry.date)}</div>
        </div>
      `;
      list.appendChild(item);
    });
  }

  const btnBack = document.getElementById('btn-back-leaderboard');
  const newBtn  = btnBack.cloneNode(true);
  btnBack.parentNode.replaceChild(newBtn, btnBack);
  newBtn.addEventListener('click', () => {
    Sound.click();
    transitionTo(() => showScreen(returnScreen || 'screen-final'));
  });
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showScreen('screen-splash');
  initSplash();
  initSoundToggle();
  // O backend (módulo do Supabase no index.html) é ligado num listener do mesmo
  // evento que roda depois deste — por isso o setTimeout antes de tentar retomar.
  setTimeout(() => tryResumeRoom(), 0);
});
