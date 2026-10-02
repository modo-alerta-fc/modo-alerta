/* ═══════════════════════════════════════════════
   MODO ALERTA — Modo Sala (multiplayer estilo Kahoot)
   Depende de game.js (Sound, showScreen, transitionTo, svg,
   saveToLeaderboard, showLeaderboard), scenes.js (renderScenarioFrame,
   animateScenarioEntry) e data.js (gameData).
   ═══════════════════════════════════════════════ */

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O/1/I
const TIME_LIMIT_SEC = 25;      // os cenários têm cara de app de verdade: dá tempo de olhar os detalhes
const MAX_POINTS = 1000;
const MIN_POINTS = 500;
const QUESTIONS_PER_LEVEL = 4;  // 3 níveis × 4 = 12 perguntas, do Recruta ao Especialista

const RoomState = {
  roomCode: null,
  playerId: null,
  playerName: '',
  playerArea: '',
  isHost: false,
  hostId: null,
  pendingMode: null,       // 'create' | 'join'
  phase: null,
  currentQuestionIndex: -1,
  questionStartedAtMs: null,
  timeLimitSec: TIME_LIMIT_SEC,
  questions: [],
  players: [],
  myAnswered: false,
  myResults: new Map(),    // questionIndex -> acertou? (reconstruído do banco ao retomar)
  lastAnswers: [],
  unsubRoom: null,
  unsubPlayers: null,
  unsubAnswers: null,
  unsubQuestionAnswers: null,
  hostCountdownInterval: null,
  roomPollInterval: null,
  visibleCountdownInterval: null,
  phaseTransitionInFlight: false,
  finalRankingRevealed: false,
};

// ── HELPERS ────────────────────────────────────

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

function flattenScenarios(data) {
  const out = [];
  data.levels.forEach(level => {
    level.scenarios.forEach(scenario => {
      out.push({ ...scenario, levelName: level.name, levelColor: level.color, levelIcon: level.icon });
    });
  });
  return out;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Monta a partida em ordem de dificuldade: 4 do Recruta, 4 do Investigador e
// 4 do Especialista, sorteadas a cada sala. Cada nível tem 1 ou 2 legítimos,
// pra resposta não virar "é sempre golpe".
function pickQuestionSet(data, perLevel) {
  const pool = flattenScenarios(data);
  const out = [];
  data.levels.forEach(level => {
    const inLevel = pool.filter(s => s.levelName === level.name);
    const legit = shuffle(inLevel.filter(s => !s.isScam));
    const scam  = shuffle(inLevel.filter(s => s.isScam));
    const nLegit = Math.min(legit.length, 1 + Math.floor(Math.random() * 2));
    out.push(...shuffle([...legit.slice(0, nLegit), ...scam.slice(0, perLevel - nLegit)]));
  });
  return out;
}

function getOrCreatePlayerId() {
  let id = sessionStorage.getItem('modoAlerta_playerId');
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `p_${Date.now()}_${Math.random().toString(16).slice(2)}`);
    sessionStorage.setItem('modoAlerta_playerId', id);
  }
  return id;
}

// Guarda sala/nome/área na aba, pra quem recarregar a página (ou cair a conexão)
// voltar pra mesma partida sem perder os pontos.
const SESSION_KEY = 'modoAlerta_session';

function saveRoomSession() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    code: RoomState.roomCode, name: RoomState.playerName, area: RoomState.playerArea,
  }));
}

function loadRoomSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

// Link direto da sala (?sala=CODIGO): no celular, quem abre o link já cai na
// tela de entrada com o código preenchido — sem precisar digitar.
function roomCodeFromUrl() {
  const code = (new URLSearchParams(location.search).get('sala') || '').trim().toUpperCase();
  return /^[A-Z0-9]{6}$/.test(code) ? code : '';
}

function roomJoinLink(code) {
  return `${location.origin}${location.pathname}?sala=${code}`;
}

function scoreAnswer(decision, isScam, questionStartedAtMs, timeLimitSec) {
  const timeTakenMs = Math.min(timeLimitSec * 1000, Math.max(0, Date.now() - questionStartedAtMs));
  const correct = (decision === 'scam') === isScam;
  if (!correct) return { correct: false, points: 0, timeTakenMs };
  const ratio = timeTakenMs / (timeLimitSec * 1000);
  const points = Math.round(MAX_POINTS - (MAX_POINTS - MIN_POINTS) * ratio);
  return { correct: true, points, timeTakenMs };
}

function backendReady() {
  return !!(window._createRoom && window._roomExists && window._subscribeRoom);
}

function isHostPlayer(p) {
  // Compara pelo hostId (autoritativo, vem do doc da sala), não pela flag isHost
  // de cada jogador — assim não depende do round-trip dessa coluna estar sempre certo.
  return p.id === RoomState.hostId;
}

function sortedPlayers() {
  // O host só administra a sala — não joga, não pontua, não aparece no ranking.
  return RoomState.players.filter(p => !isHostPlayer(p)).sort((a, b) => b.score - a.score);
}

// ── MODE SELECT ────────────────────────────────

function showModeSelect() {
  showScreen('screen-mode-select');

  const btnCreate = document.getElementById('btn-create-room');
  const btnJoin   = document.getElementById('btn-join-room');
  const newCreate = btnCreate.cloneNode(true);
  const newJoin   = btnJoin.cloneNode(true);
  btnCreate.parentNode.replaceChild(newCreate, btnCreate);
  btnJoin.parentNode.replaceChild(newJoin, btnJoin);

  newCreate.addEventListener('click', () => {
    Sound.click();
    RoomState.pendingMode = 'create';
    transitionTo(() => showRegisterForRoom());
  });
  newJoin.addEventListener('click', () => {
    Sound.click();
    RoomState.pendingMode = 'join';
    transitionTo(() => showRegisterForRoom());
  });
}

// ── REGISTER (nome + área [+ código da sala]) ──

function showRegisterForRoom() {
  showScreen('screen-register');

  const isJoin = RoomState.pendingMode === 'join';
  document.getElementById('register-title').textContent = isJoin ? 'ENTRAR NA SALA' : 'CRIAR SALA';
  document.getElementById('register-desc').textContent = isJoin
    ? 'Digite seus dados e o código da sala para entrar.'
    : 'Digite seus dados para criar a sala e convidar seu grupo.';
  document.getElementById('form-group-roomcode').style.display = isJoin ? '' : 'none';
  document.getElementById('btn-register-label').textContent = isJoin ? 'ENTRAR' : 'CRIAR SALA';

  const errorEl = document.getElementById('register-error');
  errorEl.style.display = 'none';
  errorEl.textContent = '';

  // Clona nome/área/código/botão primeiro (removendo listeners de renders anteriores),
  // e só então liga os listeners aos elementos que de fato ficam no DOM.
  const inputName = document.getElementById('input-name');
  const newName = inputName.cloneNode(true);
  inputName.parentNode.replaceChild(newName, inputName);
  newName.value = RoomState.playerName || '';

  const inputArea = document.getElementById('input-area');
  const newArea = inputArea.cloneNode(true);
  inputArea.parentNode.replaceChild(newArea, inputArea);
  newArea.value = RoomState.playerArea || '';

  const inputCode = document.getElementById('input-roomcode');
  const newInputCode = inputCode.cloneNode(true);
  inputCode.parentNode.replaceChild(newInputCode, inputCode);
  newInputCode.value = isJoin ? roomCodeFromUrl() : '';

  const btn = document.getElementById('btn-register');
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);

  // Botão "Avançar/Ir" do teclado do celular: pula pro próximo campo ou envia.
  const submitIfReady = () => { if (!newBtn.disabled) newBtn.click(); };
  const onEnter = (el, next) => el.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    next();
  });
  onEnter(newName, () => newArea.focus());
  onEnter(newArea, () => (isJoin && newInputCode.value.trim().length !== 6) ? newInputCode.focus() : submitIfReady());
  onEnter(newInputCode, submitIfReady);

  function checkReady() {
    const ready = newName.value.trim() && newArea.value.trim() && (!isJoin || newInputCode.value.trim().length === 6);
    newBtn.disabled = !ready;
  }

  newName.addEventListener('input', checkReady);
  newArea.addEventListener('input', checkReady);
  newInputCode.addEventListener('input', () => {
    newInputCode.value = newInputCode.value.toUpperCase();
    checkReady();
  });

  checkReady();

  newBtn.addEventListener('click', async () => {
    Sound.click();
    if (!backendReady()) {
      errorEl.textContent = 'Modo sala indisponível: o banco de dados ainda não foi configurado neste app.';
      errorEl.style.display = 'block';
      return;
    }
    newBtn.disabled = true;
    RoomState.playerName = newName.value.trim();
    RoomState.playerArea = newArea.value.trim();
    RoomState.playerId   = getOrCreatePlayerId();

    try {
      if (isJoin) {
        await joinRoom(newInputCode.value.trim().toUpperCase());
      } else {
        await createRoom();
      }
    } catch (e) {
      console.error(e);
      errorEl.textContent = e.code === 'started'
        ? 'Essa partida já começou. Aguarde a próxima ou peça ao host para criar uma nova sala.'
        : isJoin
          ? 'Não foi possível entrar na sala. Verifique o código e tente novamente.'
          : 'Não foi possível criar a sala. Tente novamente.';
      errorEl.style.display = 'block';
      newBtn.disabled = false;
    }
  });
}

async function createRoom() {
  RoomState.questions = pickQuestionSet(gameData, QUESTIONS_PER_LEVEL);

  let code = generateRoomCode();
  while (await window._roomExists(code)) {
    code = generateRoomCode();
  }
  RoomState.roomCode = code;
  RoomState.isHost = true;
  RoomState.hostId = RoomState.playerId;

  await window._createRoom(code, {
    code,
    hostId: RoomState.playerId,
    phase: 'lobby',
    currentQuestionIndex: -1,
    totalQuestions: RoomState.questions.length,
    timeLimitSec: TIME_LIMIT_SEC,
    questionStartedAtMs: null,
    questionIds: RoomState.questions.map(q => q.id),
  });

  await window._setPlayer(code, RoomState.playerId, {
    name: RoomState.playerName,
    area: RoomState.playerArea,
    isHost: true,
    score: 0,
  });

  enterRoom();
}

async function joinRoom(code) {
  if (!code || code.length !== 6) throw new Error('invalid code');
  const room = await window._getRoom(code);
  if (!room) throw new Error('room not found');

  const existing = await window._getPlayer(code, RoomState.playerId);
  if (!existing && room.phase !== 'lobby') {
    const err = new Error('room already started');
    err.code = 'started';
    throw err;
  }

  const pool = flattenScenarios(gameData);
  const ids = room.questionIds || [];
  RoomState.questions = ids.map(id => pool.find(s => s.id === id)).filter(Boolean);
  RoomState.roomCode = code;
  RoomState.hostId = room.hostId;
  RoomState.isHost = room.hostId === RoomState.playerId;

  if (existing) {
    // Voltando pra sala (recarregou a página): mantém a pontuação e as
    // respostas já dadas, em vez de recriar o jogador zerado.
    const answers = await window._getMyAnswers(code, RoomState.playerId).catch(() => []);
    RoomState.myResults = new Map(answers.map(a => [a.questionIndex, !!a.correct]));
  } else {
    await window._setPlayer(code, RoomState.playerId, {
      name: RoomState.playerName,
      area: RoomState.playerArea,
      isHost: false,
      score: 0,
    });
  }

  enterRoom();
}

async function tryResumeRoom() {
  const session = loadRoomSession();
  if (!session || !session.code || !backendReady()) return;
  RoomState.playerName = session.name || '';
  RoomState.playerArea = session.area || '';
  RoomState.playerId   = getOrCreatePlayerId();
  try {
    await joinRoom(session.code);
  } catch (e) {
    console.warn('Não foi possível retomar a sala anterior.', e);
    sessionStorage.removeItem(SESSION_KEY);
  }
}

function enterRoom() {
  saveRoomSession();
  subscribeToRoom();
  subscribeToPlayers();
  startRoomPolling();
}

// ── SUBSCRIPTIONS ──────────────────────────────

// A partida só anda pra frente (lobby → pergunta → revelação → próxima … → final).
// Esse "placar de progresso" permite ignorar dados velhos que cheguem fora de ordem.
const PHASE_RANK = { lobby: 0, question: 1, reveal: 2 };
function roomProgress(phase, index) {
  if (phase === 'final') return Infinity;
  if (!(phase in PHASE_RANK)) return -Infinity;
  return ((index ?? -1) + 1) * 10 + PHASE_RANK[phase];
}

function applyRoomData(roomData) {
  if (!roomData) return;
  const prevPhase = RoomState.phase;
  const prevIndex = RoomState.currentQuestionIndex;
  if (roomProgress(roomData.phase, roomData.currentQuestionIndex) < roomProgress(prevPhase, prevIndex)) return;

  RoomState.phase                = roomData.phase;
  RoomState.currentQuestionIndex = roomData.currentQuestionIndex;
  RoomState.questionStartedAtMs  = roomData.questionStartedAtMs;
  RoomState.timeLimitSec         = roomData.timeLimitSec || TIME_LIMIT_SEC;
  RoomState.hostId               = roomData.hostId;

  const changed = roomData.phase !== prevPhase || roomData.currentQuestionIndex !== prevIndex;
  if (changed) routeToPhase();
}

function subscribeToRoom() {
  if (RoomState.unsubRoom) RoomState.unsubRoom();
  RoomState.unsubRoom = window._subscribeRoom(RoomState.roomCode, applyRoomData);
}

// ── CELULAR: TELA APAGADA / TROCA DE APP / REDE INSTÁVEL ──
// O tempo real do Supabase não reenvia o que aconteceu enquanto a conexão
// estava caída. Sem isso, quem apaga a tela perde a pergunta inteira.
const ROOM_POLL_MS = 4000;

async function syncRoomNow() {
  if (!RoomState.roomCode || !window._getRoom) return;
  try { applyRoomData(await window._getRoom(RoomState.roomCode)); }
  catch (e) { /* sem rede agora — a próxima tentativa resolve */ }
}

function resyncAfterResume() {
  if (!RoomState.roomCode) return;
  subscribeToRoom();     // recria os canais (a conexão antiga pode ter morrido)
  subscribeToPlayers();  // e relê jogadores/pontuação
}

function startRoomPolling() {
  stopRoomPolling();
  RoomState.roomPollInterval = setInterval(syncRoomNow, ROOM_POLL_MS);
}

function stopRoomPolling() {
  if (RoomState.roomPollInterval) {
    clearInterval(RoomState.roomPollInterval);
    RoomState.roomPollInterval = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') resyncAfterResume();
});
window.addEventListener('online', resyncAfterResume);

function subscribeToPlayers() {
  if (RoomState.unsubPlayers) RoomState.unsubPlayers();
  RoomState.unsubPlayers = window._subscribeCollection(RoomState.roomCode, 'players', (players) => {
    RoomState.players = players;
    renderPlayersForActiveScreen();
  });
}

function renderPlayersForActiveScreen() {
  const active = (id) => {
    const el = document.getElementById(id);
    return el && el.classList.contains('active');
  };
  if (active('screen-lobby'))  renderLobbyPlayers();
  if (active('screen-reveal')) renderRevealList(RoomState.lastAnswers);
  if (active('screen-final'))  renderFinalRanking();
}

function routeToPhase() {
  stopHostCountdownLoop();
  stopVisibleCountdown();
  stopQuestionAnswerTracking();
  if (RoomState.phase === 'lobby') {
    transitionTo(() => showLobby());
  } else if (RoomState.phase === 'question') {
    RoomState.myAnswered = false;
    transitionTo(() => showQuestion());
    if (RoomState.isHost) startHostCountdownLoop();
  } else if (RoomState.phase === 'reveal') {
    transitionTo(() => showReveal());
  } else if (RoomState.phase === 'final') {
    transitionTo(() => showFinalRoom());
  }
}

// ── LOBBY ──────────────────────────────────────

function showLobby() {
  showScreen('screen-lobby');
  document.getElementById('lobby-code').textContent = RoomState.roomCode;
  const link = roomJoinLink(RoomState.roomCode);
  document.getElementById('lobby-link').textContent = RoomState.isHost ? `ou acesse: ${link}` : '';
  document.querySelector('.lobby-hint').textContent = RoomState.isHost
    ? 'Aponte a câmera do celular para o QR Code ou digite o código para entrar na sala.'
    : 'Você está na sala! Aguarde os outros participantes.';
  renderLobbyQr(RoomState.isHost ? link : null);

  const btnCopy = document.getElementById('btn-copy-code');
  const newBtnCopy = btnCopy.cloneNode(true);
  btnCopy.parentNode.replaceChild(newBtnCopy, btnCopy);
  newBtnCopy.addEventListener('click', () => {
    Sound.click();
    navigator.clipboard?.writeText(link).catch(() => {});
  });

  const btnStart = document.getElementById('btn-start-game');
  const waitMsg  = document.getElementById('lobby-waiting-msg');
  if (RoomState.isHost) {
    btnStart.style.display = 'inline-flex';
    waitMsg.style.display = 'none';
    const newBtnStart = btnStart.cloneNode(true);
    btnStart.parentNode.replaceChild(newBtnStart, btnStart);
    newBtnStart.addEventListener('click', () => {
      Sound.start();
      startGame();
    });
  } else {
    btnStart.style.display = 'none';
    waitMsg.style.display = 'block';
  }

  renderLobbyPlayers();
}

// QR Code no telão do host: o público aponta a câmera e cai direto na sala.
// Se a biblioteca não carregar (CDN bloqueado), o lobby segue com código + link.
function renderLobbyQr(link) {
  const box = document.getElementById('lobby-qr');
  if (!box) return;
  box.innerHTML = '';
  box.style.display = 'none';
  if (!link || typeof QRCode === 'undefined') return;
  new QRCode(box, { text: link, width: 220, height: 220, colorDark: '#0b0b0f', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
  box.removeAttribute('title'); // a lib coloca o link como tooltip; o link já aparece embaixo
  box.style.display = '';
}

function renderLobbyPlayers() {
  const list = document.getElementById('lobby-players');
  if (!list) return;
  list.innerHTML = '';
  RoomState.players.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'lobby-player-chip';
    chip.innerHTML = `<span class="lobby-player-name">${escapeHtml(p.name)}${isHostPlayer(p) ? ' 👑' : ''}</span><span class="lobby-player-area">${escapeHtml(p.area)}</span>`;
    list.appendChild(chip);
  });

  const btnStart = document.getElementById('btn-start-game');
  if (RoomState.isHost && btnStart) {
    btnStart.disabled = RoomState.players.filter(p => !isHostPlayer(p)).length < 1;
  }
}

function startGame() {
  if (!RoomState.isHost || RoomState.players.filter(p => !isHostPlayer(p)).length < 1) return;
  window._updateRoom(RoomState.roomCode, {
    phase: 'question',
    currentQuestionIndex: 0,
    questionStartedAtMs: Date.now(),
  });
}

// ── PERGUNTA ───────────────────────────────────

function showQuestion() {
  const idx = RoomState.currentQuestionIndex;
  const scenario = RoomState.questions[idx];
  if (!scenario) return;

  showScreen('screen-question');
  Sound.whoosh();

  document.getElementById('question-progress-label').textContent = `PERGUNTA ${idx + 1} / ${RoomState.questions.length}`;
  updateMyScoreDisplay();

  renderScenarioFrame(scenario);

  const stepDecision = document.getElementById('step-decision');
  const waitMsg       = document.getElementById('question-waiting-msg');
  const hostMonitor   = document.getElementById('host-monitor');

  if (RoomState.isHost) {
    stepDecision.style.display = 'none';
    waitMsg.style.display = 'none';
    hostMonitor.style.display = 'flex';

    const btnForceReveal = document.getElementById('btn-force-reveal');
    const newBtnForceReveal = btnForceReveal.cloneNode(true);
    btnForceReveal.parentNode.replaceChild(newBtnForceReveal, btnForceReveal);
    newBtnForceReveal.addEventListener('click', () => {
      Sound.click();
      triggerReveal();
    });

    startQuestionAnswerTracking(idx);
  } else {
    stepDecision.style.display = '';
    hostMonitor.style.display = 'none';
    waitMsg.textContent = 'Resposta enviada — aguardando os outros jogadores…';
    waitMsg.style.display = 'none';

    const btnGroup = document.getElementById('decision-buttons');
    btnGroup.style.display = 'flex';

    document.querySelectorAll('.decision-btn').forEach(btn => {
      btn.classList.remove('selected');
      btn.disabled = false;
      btn.onclick = () => submitAnswer(btn.dataset.decision, scenario);
    });

    // Já respondeu essa pergunta antes de recarregar a página: não deixa responder de novo.
    if (RoomState.myResults.has(idx)) {
      RoomState.myAnswered = true;
      btnGroup.style.display = 'none';
      waitMsg.style.display = 'block';
    }
  }

  const card = document.getElementById('scenario-card');
  card.onclick = () => { if (_skipAnimation) _skipAnimation(); };

  animateScenarioEntry(scenario);
  startVisibleCountdown();
}

// Só o host acompanha isso: conta quantos jogadores (excluindo o próprio host,
// que não joga) já responderam a pergunta atual, e revela assim que todos
// tiverem respondido — sem precisar esperar o tempo total acabar.
function startQuestionAnswerTracking(questionIndex) {
  stopQuestionAnswerTracking();
  const total = RoomState.players.filter(p => !isHostPlayer(p)).length;
  const totalEl = document.getElementById('host-total-count');
  const countEl = document.getElementById('host-answered-count');
  if (totalEl) totalEl.textContent = total;
  if (countEl) countEl.textContent = '0';

  RoomState.unsubQuestionAnswers = window._subscribeAnswers(RoomState.roomCode, questionIndex, (answers) => {
    if (countEl) countEl.textContent = answers.length;
    if (total > 0 && answers.length >= total) triggerReveal();
  });
}

function stopQuestionAnswerTracking() {
  if (RoomState.unsubQuestionAnswers) {
    RoomState.unsubQuestionAnswers();
    RoomState.unsubQuestionAnswers = null;
  }
}

function updateMyScoreDisplay() {
  const me = RoomState.players.find(p => p.id === RoomState.playerId);
  const el = document.getElementById('header-score');
  if (el) el.textContent = me ? me.score : 0;
}

function submitAnswer(decision, scenario) {
  if (RoomState.myAnswered) return;
  RoomState.myAnswered = true;
  Sound.click();

  document.querySelectorAll('.decision-btn').forEach(b => { b.disabled = true; });
  const chosenBtn = document.querySelector(`.decision-btn[data-decision="${decision}"]`);
  if (chosenBtn) chosenBtn.classList.add('selected');

  const { correct, points } = scoreAnswer(decision, scenario.isScam, RoomState.questionStartedAtMs, RoomState.timeLimitSec);
  RoomState.myResults.set(RoomState.currentQuestionIndex, correct);
  const answerId = `${RoomState.currentQuestionIndex}_${RoomState.playerId}`;

  window._submitAnswer(RoomState.roomCode, answerId, {
    playerId: RoomState.playerId,
    questionIndex: RoomState.currentQuestionIndex,
    decision, correct, points,
    answeredAtMs: Date.now(),
  }).then(() => {
    const me = RoomState.players.find(p => p.id === RoomState.playerId);
    const newScore = (me ? me.score : 0) + points;
    return window._updatePlayerScore(RoomState.roomCode, RoomState.playerId, newScore);
  }).catch(e => console.error(e));

  document.getElementById('question-waiting-msg').style.display = 'block';
  document.getElementById('decision-buttons').style.display = 'none';
}

function startVisibleCountdown() {
  stopVisibleCountdown();
  const barEl = document.getElementById('question-timer-bar');
  const numEl = document.getElementById('question-timer-num');

  function tick() {
    if (!RoomState.questionStartedAtMs) return;
    const elapsedMs   = Date.now() - RoomState.questionStartedAtMs;
    const totalMs     = RoomState.timeLimitSec * 1000;
    const remainingMs = Math.max(0, totalMs - elapsedMs);
    const pct = remainingMs / totalMs;

    if (barEl) {
      barEl.style.width = `${Math.max(0, pct * 100)}%`;
      barEl.classList.toggle('danger', pct < 0.3);
    }
    if (numEl) numEl.textContent = Math.ceil(remainingMs / 1000);

    if (remainingMs <= 0) {
      stopVisibleCountdown();
      if (!RoomState.myAnswered) {
        document.querySelectorAll('.decision-btn').forEach(b => { b.disabled = true; });
        const waitMsg = document.getElementById('question-waiting-msg');
        waitMsg.textContent = 'Tempo esgotado!';
        waitMsg.style.display = 'block';
        document.getElementById('decision-buttons').style.display = 'none';
      }
    }
  }

  tick();
  RoomState.visibleCountdownInterval = setInterval(tick, 100);
}

function stopVisibleCountdown() {
  if (RoomState.visibleCountdownInterval) {
    clearInterval(RoomState.visibleCountdownInterval);
    RoomState.visibleCountdownInterval = null;
  }
}

// ── HOST: AUTO-AVANÇO POR TEMPO ────────────────

function triggerReveal() {
  if (!RoomState.isHost || RoomState.phase !== 'question' || RoomState.phaseTransitionInFlight) return;
  RoomState.phaseTransitionInFlight = true;
  window._updateRoom(RoomState.roomCode, { phase: 'reveal' })
    .catch(e => console.error(e))
    .finally(() => { RoomState.phaseTransitionInFlight = false; });
}

function startHostCountdownLoop() {
  stopHostCountdownLoop();
  RoomState.hostCountdownInterval = setInterval(() => {
    if (RoomState.phase !== 'question' || !RoomState.questionStartedAtMs) return;
    const elapsedMs = Date.now() - RoomState.questionStartedAtMs;
    if (elapsedMs >= RoomState.timeLimitSec * 1000) triggerReveal();
  }, 250);
}

function stopHostCountdownLoop() {
  if (RoomState.hostCountdownInterval) {
    clearInterval(RoomState.hostCountdownInterval);
    RoomState.hostCountdownInterval = null;
  }
}

// ── REVELAÇÃO ──────────────────────────────────

function showReveal() {
  showScreen('screen-reveal');
  Sound.levelUp();

  const idx = RoomState.currentQuestionIndex;
  const scenario = RoomState.questions[idx];

  const chip = document.getElementById('reveal-answer-chip');
  chip.textContent = scenario.revealLabel || (scenario.isScam ? 'GOLPE' : 'LEGÍTIMO');
  chip.className = `ans-chip ${scenario.isScam ? 'scam' : 'legit'}`;
  renderRevealExplanation(scenario);

  if (RoomState.unsubAnswers) RoomState.unsubAnswers();
  RoomState.unsubAnswers = window._subscribeAnswers(RoomState.roomCode, idx, (answers) => {
    RoomState.lastAnswers = answers;
    renderRevealList(answers);
  });

  const isLast = idx >= RoomState.questions.length - 1;
  const btn = document.getElementById('btn-reveal-next');
  const waitMsg = document.getElementById('reveal-waiting-msg');

  if (RoomState.isHost) {
    btn.style.display = 'inline-flex';
    waitMsg.style.display = 'none';
    btn.querySelector('span').textContent = isLast ? 'VER RESULTADO FINAL' : 'PRÓXIMA PERGUNTA';
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      Sound.click();
      advanceFromReveal(isLast);
    });
  } else {
    btn.style.display = 'none';
    waitMsg.style.display = 'block';
  }
}

// Explicação da revelação: resumo + sinais que decidem + o que fazer na vida real
function renderRevealExplanation(scenario) {
  const el = document.getElementById('reveal-explanation');
  const kind = scenario.isScam ? 'scam' : 'legit';
  const signals = (scenario.signals || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
  el.innerHTML = `
    <p class="rv-summary">${escapeHtml(scenario.explanation || '')}</p>
    ${signals ? `<div class="rv-label">${scenario.isScam ? 'Sinais de golpe' : 'Por que é seguro'}</div><ul class="rv-signals ${kind}">${signals}</ul>` : ''}
    ${scenario.action ? `<div class="rv-action"><b>O que fazer:</b> ${escapeHtml(scenario.action)}</div>` : ''}`;
}

function renderRevealList(answers) {
  const list = document.getElementById('reveal-players-list');
  if (!list) return;
  list.innerHTML = '';

  const answersByPlayer = new Map((answers || []).map(a => [a.playerId, a]));

  sortedPlayers().forEach((p, i) => {
    const ans = answersByPlayer.get(p.id);
    const status = !ans ? 'none' : ans.correct ? 'correct' : 'wrong';
    const statusLabel = status === 'none' ? 'Não respondeu' : status === 'correct' ? 'Acertou' : 'Errou';
    const gained = ans ? ans.points : 0;

    const row = document.createElement('div');
    row.className = `reveal-player-row status-${status}`;
    row.innerHTML = `
      <div class="lb-rank">${i + 1}</div>
      <div class="lb-info">
        <div class="lb-name">${escapeHtml(p.name)}</div>
        <div class="lb-area">${statusLabel}${gained > 0 ? ` · +${Number(gained)}` : ''}</div>
      </div>
      <div class="lb-score"><div class="lb-pts">${Number(p.score) || 0} pts</div></div>
    `;
    list.appendChild(row);
  });
}

function advanceFromReveal(isLast) {
  if (!RoomState.isHost || RoomState.phaseTransitionInFlight) return;
  RoomState.phaseTransitionInFlight = true;
  const patch = isLast
    ? { phase: 'final' }
    : { phase: 'question', currentQuestionIndex: RoomState.currentQuestionIndex + 1, questionStartedAtMs: Date.now() };
  window._updateRoom(RoomState.roomCode, patch)
    .catch(e => console.error(e))
    .finally(() => { RoomState.phaseTransitionInFlight = false; });
}

// ── FINAL ──────────────────────────────────────

function showFinalRoom() {
  showScreen('screen-final');
  Sound.finalFanfare();
  stopHostCountdownLoop();
  stopVisibleCountdown();
  stopQuestionAnswerTracking();

  if (RoomState.isHost) {
    renderHostFinalScreen();
  } else {
    renderPlayerFinalScreen();
  }

  renderFinalRanking();

  const btnLb = document.getElementById('btn-leaderboard');
  const newBtnLb = btnLb.cloneNode(true);
  btnLb.parentNode.replaceChild(newBtnLb, btnLb);
  newBtnLb.addEventListener('click', () => {
    Sound.click();
    transitionTo(() => showLeaderboard('screen-final'));
  });

  const btnPlay = document.getElementById('btn-play-again');
  const newBtnPlay = btnPlay.cloneNode(true);
  btnPlay.parentNode.replaceChild(newBtnPlay, btnPlay);
  newBtnPlay.addEventListener('click', () => {
    Sound.start();
    leaveRoom();
    transitionTo(() => showScreen('screen-splash'));
  });
}

function renderPlayerFinalScreen() {
  document.getElementById('final-score-box').style.display = '';
  document.getElementById('final-tip').style.display = '';

  const me = RoomState.players.find(p => p.id === RoomState.playerId);
  const myScore  = me ? me.score : 0;
  const total    = RoomState.questions.length;
  const correctCount = [...RoomState.myResults.values()].filter(Boolean).length;
  // A medalha vem dos ACERTOS, não da velocidade — quem analisa com calma e
  // acerta tudo merece ouro. A rapidez só conta para os pontos do ranking.
  const pct = total ? correctCount / total : 0;

  let gradeClass, title, subtitle;
  if (pct >= 0.8) {
    gradeClass = 'grade-gold'; title = 'MESTRE ANTI-GOLPE!';
    subtitle = 'Impressionante! Você identificou os golpes com rapidez e precisão. Continue espalhando esse conhecimento!';
  } else if (pct >= 0.6) {
    gradeClass = 'grade-silver'; title = 'INVESTIGADOR AFIADO!';
    subtitle = 'Muito bom! Você demonstrou grande habilidade para identificar tentativas de golpe rapidamente.';
  } else {
    gradeClass = 'grade-bronze'; title = 'EM FORMAÇÃO!';
    subtitle = 'Você está no caminho certo! Continue treinando seus instintos digitais.';
  }

  const medalConfig = {
    'grade-gold':   { letter: '★', color: '#FFD700', dark: '#B8860B', name: 'MEDALHA DE OURO' },
    'grade-silver': { letter: '★', color: '#C0C0C0', dark: '#808080', name: 'MEDALHA DE PRATA' },
    'grade-bronze': { letter: '★', color: '#CD7F32', dark: '#8B5A2B', name: 'MEDALHA DE BRONZE' },
  };
  const medal = medalConfig[gradeClass];

  document.getElementById('final-trophy').innerHTML = `
    <div class="medal-wrapper">
      <svg viewBox="0 0 80 112" width="120" height="168" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="medal-shine" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0.05)"/>
          </radialGradient>
        </defs>
        <rect x="28" y="0" width="11" height="42" rx="2" fill="${medal.color}"/>
        <rect x="41" y="0" width="11" height="42" rx="2" fill="${medal.dark}"/>
        <polygon points="28,42 40,56 52,42" fill="${medal.color}"/>
        <circle cx="40" cy="84" r="28" fill="rgba(0,0,0,0.28)"/>
        <circle cx="40" cy="82" r="28" fill="${medal.dark}"/>
        <circle cx="40" cy="82" r="24" fill="${medal.color}"/>
        <circle cx="40" cy="82" r="24" fill="url(#medal-shine)"/>
        <circle cx="40" cy="82" r="19" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>
        <text x="40" y="91" text-anchor="middle" font-size="22" font-weight="900" fill="rgba(0,0,0,0.4)" font-family="Orbitron,sans-serif">${medal.letter}</text>
        <text x="40" y="90" text-anchor="middle" font-size="22" font-weight="900" fill="white" font-family="Orbitron,sans-serif">${medal.letter}</text>
      </svg>
      <div class="medal-name" style="color:${medal.color}">${medal.name}</div>
    </div>`;

  document.getElementById('final-title').textContent    = title;
  document.getElementById('final-subtitle').textContent = subtitle;
  document.getElementById('final-score-num').textContent = myScore;

  // Só salva uma vez por sala — quem recarrega a página na tela final não duplica no ranking.
  const savedKey = `modoAlerta_saved_${RoomState.roomCode}`;
  if (!sessionStorage.getItem(savedKey)) {
    sessionStorage.setItem(savedKey, '1');
    saveToLeaderboard(RoomState.playerName, RoomState.playerArea, myScore, gradeClass);
  }

  const stars = Math.round(pct * 5);
  document.getElementById('final-stars').innerHTML =
    `<div class="star-bar">${Array.from({length: 5}, (_, i) =>
      `<div class="star-seg ${i < stars ? 'filled' : ''}"></div>`
    ).join('')}</div><span class="star-label">${correctCount}/${total} acertos</span>`;

  const tips = [
    "Bancos e empresas legítimas NUNCA pedem sua senha ou código de verificação por telefone, SMS ou e-mail.",
    "Sempre verifique o domínio completo do remetente de e-mails. Um 'l' pode ser um 'I' (i maiúsculo).",
    "Antes de clicar em qualquer link, confira o endereço real: no computador, passe o mouse por cima; no celular, pressione e segure o link.",
    "Ative sempre a autenticação em dois fatores (2FA) em suas contas importantes.",
    "Em caso de dúvida sobre uma ligação, desligue e ligue de volta pelo número oficial que está no cartão ou site.",
  ];
  document.getElementById('final-tip').textContent = tips[Math.floor(Math.random() * tips.length)];
}

function renderHostFinalScreen() {
  document.getElementById('final-trophy').innerHTML = `
    <div class="medal-wrapper">
      <svg viewBox="0 0 24 24" width="96" height="96" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 22V4a1 1 0 011-1h11l-1.5 4.5L16 12H5"/>
      </svg>
    </div>`;
  document.getElementById('final-title').textContent    = 'SALA ENCERRADA!';
  document.getElementById('final-subtitle').textContent = 'Você administrou a sala. Confira como cada jogador se saiu no ranking abaixo.';
  document.getElementById('final-score-box').style.display = 'none';
  document.getElementById('final-stars').innerHTML = '';
  document.getElementById('final-tip').style.display = 'none';
}

function buildRankRow(p, i) {
  const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
  const row = document.createElement('div');
  row.className = 'lb-item';
  row.innerHTML = `
    <div class="lb-rank ${rankClass}">${i + 1}</div>
    <div class="lb-info">
      <div class="lb-name">${escapeHtml(p.name)}${p.id === RoomState.playerId ? ' (você)' : ''}</div>
      <div class="lb-area">${escapeHtml(p.area)}</div>
    </div>
    <div class="lb-score"><div class="lb-pts">${Number(p.score) || 0} pts</div></div>
  `;
  return row;
}

function renderFinalRanking() {
  const list = document.getElementById('final-room-ranking');
  if (!list) return;
  const sorted = sortedPlayers();

  // Re-renderizações depois da primeira (ex: um doc de jogador atualiza)
  // não repetem a animação de suspense — só redesenham a lista final.
  if (RoomState.finalRankingRevealed) {
    list.innerHTML = '';
    sorted.forEach((p, i) => list.appendChild(buildRankRow(p, i)));
    return;
  }
  RoomState.finalRankingRevealed = true;
  list.innerHTML = '';

  const podium = sorted.slice(0, 3);
  const rest   = sorted.slice(3);

  // 4º lugar em diante aparece de imediato, sem suspense.
  rest.forEach((p, i) => list.appendChild(buildRankRow(p, i + 3)));

  // Pódio revelado com atraso, na ordem inversa (3º, depois 2º, depois 1º),
  // cada linha entrando por cima das anteriores.
  const revealSteps = podium.map((p, i) => ({ p, i })).reverse();
  revealSteps.forEach((step, order) => {
    setTimeout(() => {
      const row = buildRankRow(step.p, step.i);
      row.classList.add('rank-reveal');
      list.prepend(row);
      Sound.select(order + 1);
      requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add('rank-reveal-in')));
    }, order * 900);
  });
}

function leaveRoom() {
  if (RoomState.unsubRoom)    { RoomState.unsubRoom(); RoomState.unsubRoom = null; }
  if (RoomState.unsubPlayers) { RoomState.unsubPlayers(); RoomState.unsubPlayers = null; }
  if (RoomState.unsubAnswers) { RoomState.unsubAnswers(); RoomState.unsubAnswers = null; }
  stopRoomPolling();
  stopHostCountdownLoop();
  stopVisibleCountdown();
  stopQuestionAnswerTracking();
  sessionStorage.removeItem('modoAlerta_playerId');
  sessionStorage.removeItem(SESSION_KEY);
  // Tira o ?sala= da barra, senão "Jogar novamente" tentaria entrar na sala que acabou.
  if (location.search.includes('sala=')) history.replaceState(null, '', location.pathname);

  RoomState.roomCode = null;
  RoomState.playerId = null;
  RoomState.isHost = false;
  RoomState.pendingMode = null;
  RoomState.phase = null;
  RoomState.currentQuestionIndex = -1;
  RoomState.questionStartedAtMs = null;
  RoomState.questions = [];
  RoomState.players = [];
  RoomState.lastAnswers = [];
  RoomState.myAnswered = false;
  RoomState.myResults = new Map();
  RoomState.phaseTransitionInFlight = false;
  RoomState.finalRankingRevealed = false;
}
