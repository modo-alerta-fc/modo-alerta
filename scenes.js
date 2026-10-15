/* ═══════════════════════════════════════════════
   MODO ALERTA — Cenários (SMS, WhatsApp, e-mail, ligação, site, QR, LinkedIn)
   Cada renderizador imita a tela real do app, para a pessoa treinar o olhar
   no que ela vai ver de verdade no celular. Depende de game.js (escapeHtml,
   svg, typeConfig, Sound). Todo texto vindo de data.js passa por escapeHtml.
   ═══════════════════════════════════════════════ */

// ── TEXTO ─────────────────────────────────────

// Destaca links e e-mails como o app faria (azul/sublinhado). Roda sobre o
// texto JÁ escapado, então não abre brecha para HTML.
const LINK_RE = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|((?:https?:\/\/)?(?:[\w-]+\.)+(?:com|net|org|br|ly|me|io|app)(?:\.br)?(?:\/[^\s<]*)?)/gi;

function richText(text) {
  return escapeHtml(text)
    .replace(LINK_RE, (m) => `<span class="sc-link">${m}</span>`)
    .replace(/\n/g, '<br>');
}

function initials(name) {
  const words = String(name).replace(/[^\p{L}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  return (words[0][0] + (words[1] ? words[1][0] : '')).toUpperCase();
}

// Cor de avatar estável por nome (como os apps fazem)
const AVATAR_COLORS = ['#5b8def', '#e0794b', '#3fa796', '#b46ad6', '#d4a72c', '#d65d7a', '#4aa3df'];
function avatarColor(name) {
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const ICON = {
  person:  svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>', 22),
  back:    svg('<path d="M19 12H5M12 19l-7-7 7-7"/>', 20),
  dots:    svg('<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>', 20),
  phone:   svg('<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L7.91 9.91a16 16 0 006.08 6.08l1.97-1.97a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/>', 18),
  video:   svg('<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/>', 20),
  play:    '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M7 4.5v15l12-7.5z"/></svg>',
  mic:     svg('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 17v5"/>', 14),
  clip:    svg('<path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>', 20),
  camera:  svg('<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>', 20),
  smile:   svg('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>', 20),
  lock:    svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>', 14),
  reload:  svg('<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>', 16),
  archive: svg('<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 002 2h12a2 2 0 002-2V8M10 12h4"/>', 18),
  trash:   svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', 18),
  link:    svg('<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>', 14),
  micOff:  svg('<path d="M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2M19 10v2a7 7 0 01-.11 1.23M12 19v4"/>', 20),
  keypad:  '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="6" cy="5" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="18" cy="5" r="1.6"/><circle cx="6" cy="11" r="1.6"/><circle cx="12" cy="11" r="1.6"/><circle cx="18" cy="11" r="1.6"/><circle cx="6" cy="17" r="1.6"/><circle cx="12" cy="17" r="1.6"/><circle cx="18" cy="17" r="1.6"/></svg>',
  speaker: svg('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/>', 20),
  hangup:  '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 010-1.41C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 00-2.67-1.85.996.996 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>',
  file:    '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M6 2h8l6 6v14H6z" fill="#e5484d"/><path d="M14 2v6h6" fill="#ff8a8f"/><text x="13" y="18.5" font-size="5.2" font-family="Inter,Arial" font-weight="700" fill="#fff" text-anchor="middle">PDF</text></svg>',
};

function avatarHtml(name, known, cls = 'sc-avatar') {
  if (!known) return `<div class="${cls} sc-avatar-unknown">${ICON.person}</div>`;
  return `<div class="${cls}" style="background:${avatarColor(name)}">${escapeHtml(initials(name))}</div>`;
}

// ── RENDERIZADORES ────────────────────────────

function renderSms(s) {
  const known = !/^[+\d]/.test(s.sender);
  const bubbles = s.messages.map((m) => `<div class="sc-sms-bubble sc-anim">${richText(m)}</div>`).join('');
  return `
    <div class="sc-sms">
      <div class="sc-sms-top">
        <span class="sc-ico">${ICON.back}</span>
        ${avatarHtml(s.sender, known)}
        <div class="sc-sms-who">${escapeHtml(s.sender)}</div>
        <span class="sc-ico">${ICON.phone}</span>
        <span class="sc-ico">${ICON.dots}</span>
      </div>
      <div class="sc-sms-thread">
        <div class="sc-sms-day">Hoje · ${escapeHtml(s.time || '')}</div>
        ${bubbles}
      </div>
      <div class="sc-sms-input"><span>Mensagem de texto</span></div>
    </div>`;
}

function waBubble(m, i, s) {
  const time = `<span class="sc-wa-time">${escapeHtml(s.time || '')}</span>`;
  const tail = i === 0 ? ' sc-wa-tail' : '';
  const author = (s.group && m.author)
    ? `<div class="sc-wa-author" style="color:${avatarColor(m.author)}">${escapeHtml(m.author)}</div>` : '';

  if (m.audio) {
    const bars = Array.from({ length: 28 }, (_, k) => {
      const h = 5 + Math.round(Math.abs(Math.sin(k * 1.7) * 13 + Math.sin(k * 0.6) * 5));
      return `<span style="height:${h}px"></span>`;
    }).join('');
    return `
      <div class="sc-wa-row sc-anim" data-wa-status="gravando áudio…">
        <div class="sc-wa-bubble sc-wa-audio${tail}">
          ${author}
          <div class="sc-wa-audio-row">
            <span class="sc-wa-play">${ICON.play}</span>
            <div class="sc-wa-wave">${bars}</div>
            <div class="sc-wa-audio-av" style="background:${avatarColor(s.sender)}">${escapeHtml(initials(s.sender))}<span>${ICON.mic}</span></div>
          </div>
          <div class="sc-wa-audio-meta"><span>${escapeHtml(m.audio)}</span>${time}</div>
          ${m.transcript ? `<div class="sc-wa-transcript"><span>Transcrição</span>${escapeHtml(m.transcript)}</div>` : ''}
        </div>
      </div>`;
  }
  if (m.file) {
    return `
      <div class="sc-wa-row sc-anim">
        <div class="sc-wa-bubble sc-wa-filebubble${tail}">
          ${author}
          <div class="sc-wa-doc">
            <span class="sc-wa-doc-ico">${ICON.file}</span>
            <div class="sc-wa-doc-txt">
              <div class="sc-wa-doc-name">${escapeHtml(m.file.name)}</div>
              <div class="sc-wa-doc-meta">${escapeHtml(m.file.meta || '')}</div>
            </div>
          </div>
          <div class="sc-wa-doc-foot">${time}</div>
        </div>
      </div>`;
  }
  return `
    <div class="sc-wa-row sc-anim">
      <div class="sc-wa-bubble${tail}">
        ${author}
        <span class="sc-wa-text">${richText(m.text)}<span class="sc-wa-spacer"></span></span>${time}
      </div>
    </div>`;
}

function renderWhatsApp(s) {
  const known = !!s.saved;
  const status = s.group ? (s.members || '') : (known ? 'online' : '');
  // Conversa com número desconhecido: o WhatsApp mostra o "cartão" com o nome
  // que a própria pessoa escolheu (~Nome) e as opções Bloquear / Adicionar.
  const unknownCard = known ? '' : `
    <div class="sc-wa-unknown">
      <div class="sc-wa-unknown-av">${ICON.person}</div>
      ${s.pushName ? `<div class="sc-wa-unknown-name">~ ${escapeHtml(s.pushName)}</div>` : ''}
      <div class="sc-wa-unknown-num">${escapeHtml(s.sender)}</div>
      <div class="sc-wa-unknown-note">Não está nos seus contatos</div>
      <div class="sc-wa-unknown-actions"><span class="block">Bloquear</span><span>Adicionar</span></div>
    </div>`;
  const avatar = known
    ? `<div class="sc-wa-av" style="background:${avatarColor(s.sender)}">${escapeHtml(initials(s.sender)) || ICON.person}</div>`
    : `<div class="sc-wa-av sc-avatar-unknown">${ICON.person}</div>`;

  return `
    <div class="sc-wa">
      <div class="sc-wa-top">
        <span class="sc-ico">${ICON.back}</span>
        ${avatar}
        <div class="sc-wa-head">
          <div class="sc-wa-name">${escapeHtml(s.sender)}</div>
          <div class="sc-wa-status" data-default="${escapeHtml(status)}">${escapeHtml(status)}</div>
        </div>
        <span class="sc-ico">${ICON.video}</span>
        <span class="sc-ico">${ICON.phone}</span>
        <span class="sc-ico">${ICON.dots}</span>
      </div>
      <div class="sc-wa-chat">
        <div class="sc-wa-day"><span>Hoje</span></div>
        ${unknownCard}
        ${s.messages.map((m, i) => waBubble(m, i, s)).join('')}
      </div>
      <div class="sc-wa-input">
        <div class="sc-wa-field"><span class="sc-ico">${ICON.smile}</span><span class="ph">Mensagem</span><span class="sc-ico">${ICON.clip}</span><span class="sc-ico">${ICON.camera}</span></div>
        <div class="sc-wa-mic">${svg('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 17v5"/>', 20)}</div>
      </div>
    </div>`;
}

function renderEmail(s) {
  const buttons = (s.buttons || []).length
    ? `<div class="sc-mail-rsvp">${s.buttons.map((b) => `<span>${escapeHtml(b)}</span>`).join('')}</div>` : '';
  const cta = s.cta ? `
    <div class="sc-mail-cta">${escapeHtml(s.cta)}</div>
    ${s.ctaUrl ? `<div class="sc-mail-linkhint">${ICON.link}<span>Ao segurar o botão, o celular mostra: <span class="sc-link">${escapeHtml(s.ctaUrl)}</span></span></div>` : ''}` : '';
  return `
    <div class="sc-mail">
      <div class="sc-mail-top">
        <span class="sc-ico">${ICON.back}</span>
        <span class="sc-mail-top-sp"></span>
        <span class="sc-ico">${ICON.archive}</span>
        <span class="sc-ico">${ICON.trash}</span>
        <span class="sc-ico">${ICON.dots}</span>
      </div>
      <div class="sc-mail-subject">${escapeHtml(s.subject)} <span class="sc-mail-tag">Caixa de entrada</span></div>
      <div class="sc-mail-from">
        ${avatarHtml(s.fromName, true)}
        <div class="sc-mail-who">
          <div class="sc-mail-line1"><span class="sc-mail-name">${escapeHtml(s.fromName)}</span><span class="sc-mail-time">${escapeHtml(s.time || '')}</span></div>
          <div class="sc-mail-addr">&lt;${escapeHtml(s.fromAddress)}&gt;</div>
          <div class="sc-mail-to">para mim</div>
        </div>
      </div>
      <div class="sc-mail-body sc-anim">${richText(s.body)}${buttons}${cta}</div>
    </div>`;
}

function renderCall(s) {
  const known = !/^[+\d]/.test(s.caller);
  const speaker = s.speaker || 'Quem ligou';
  const lines = s.lines.map((l) => `
    <div class="sc-call-line sc-anim"><span class="sc-call-speaker">${escapeHtml(speaker)}</span>“${escapeHtml(l)}”</div>`).join('');
  return `
    <div class="sc-call">
      <div class="sc-call-state"><span class="sc-call-live"></span>Chamada em andamento · ${escapeHtml(s.duration || '00:15')}</div>
      ${avatarHtml(s.caller, known, 'sc-call-av')}
      <div class="sc-call-name">${escapeHtml(s.caller)}</div>
      <div class="sc-call-note">${escapeHtml(s.callerNote || '')}</div>
      <div class="sc-call-lines">${lines}</div>
      <div class="sc-call-keys">
        <span>${ICON.micOff}<em>Mudo</em></span>
        <span>${ICON.keypad}<em>Teclado</em></span>
        <span>${ICON.speaker}<em>Viva-voz</em></span>
        <span class="sc-call-end">${ICON.hangup}<em>Desligar</em></span>
      </div>
    </div>`;
}

function renderSite(s) {
  const raw = s.url.replace(/^https?:\/\//, '');
  const cut = raw.indexOf('/');
  const host = cut === -1 ? raw : raw.slice(0, cut);
  const path = cut === -1 ? '' : raw.slice(cut);
  const field = (f) => `<div class="sc-web-field"><label>${escapeHtml(f)}</label><div class="sc-web-input"></div></div>`;
  const fields = (s.fields || []).map((f) => Array.isArray(f)
    ? `<div class="sc-web-row">${f.map(field).join('')}</div>` : field(f)).join('');
  return `
    <div class="sc-web">
      <div class="sc-web-bar">
        <div class="sc-web-omni">
          <span class="sc-web-lock">${ICON.lock}</span>
          <span class="sc-web-url"><span class="host">${escapeHtml(host)}</span><span class="path">${escapeHtml(path)}</span></span>
        </div>
        <span class="sc-web-tabs">1</span>
        <span class="sc-ico">${ICON.dots}</span>
      </div>
      <div class="sc-web-page sc-anim">
        <div class="sc-web-brand">${escapeHtml(s.brand || '')}</div>
        <div class="sc-web-title">${escapeHtml(s.pageTitle || '')}</div>
        <p class="sc-web-text">${richText(s.body || '')}</p>
        ${fields}
        ${s.cta ? `<div class="sc-web-btn">${escapeHtml(s.cta)}</div>` : ''}
      </div>
    </div>`;
}

function renderQr(s) {
  // O QR do cartaz é um QR "de verdade" (gerado com o link), e o adesivo, quando
  // existe, fica torto por cima. Abaixo, o que a câmera do celular mostraria.
  return `
    <div class="sc-qr">
      <div class="sc-poster">
        <div class="sc-poster-tag">${escapeHtml(s.posterTag || '')}</div>
        <div class="sc-poster-title">${escapeHtml(s.posterTitle || '')}</div>
        <div class="sc-poster-text">${escapeHtml(s.posterText || '')}</div>
        <div class="sc-poster-qr">
          <div class="sc-qr-code" data-qr="${escapeHtml(s.sticker ? 'https://eventos.ferreiracosta.com.br/checkin' : 'https://' + s.qrUrl)}"></div>
          ${s.sticker ? `<div class="sc-qr-sticker"><div class="sc-qr-code" data-qr="${escapeHtml('https://' + s.qrUrl)}"></div></div>` : ''}
        </div>
      </div>
      <div class="sc-qr-scan sc-anim">
        <span class="sc-qr-scan-ico">${ICON.camera}</span>
        <div>
          <div class="sc-qr-scan-lbl">Câmera do celular · QR Code detectado</div>
          <div class="sc-qr-scan-url">${escapeHtml(s.qrUrl)}</div>
        </div>
      </div>
    </div>`;
}

function renderLinkedIn(s) {
  const msgs = s.messages.map((m, i) => `
    <div class="sc-li-msg sc-anim">
      ${i === 0 ? `<div class="sc-li-msg-head">${avatarHtml(s.sender, true, 'sc-li-mini')}<b>${escapeHtml(s.sender)}</b><span>${escapeHtml(s.time || '')}</span></div>` : ''}
      <div class="sc-li-msg-text">${richText(m)}</div>
    </div>`).join('');
  return `
    <div class="sc-li">
      <div class="sc-li-top"><span class="sc-ico">${ICON.back}</span><span class="sc-li-top-title">Mensagens</span><span class="sc-ico">${ICON.dots}</span></div>
      <div class="sc-li-profile">
        ${avatarHtml(s.sender, true, 'sc-li-av')}
        <div>
          <div class="sc-li-name">${escapeHtml(s.sender)}</div>
          <div class="sc-li-headline">${escapeHtml(s.headline || '')}</div>
          <div class="sc-li-meta">${escapeHtml(s.meta || '')}</div>
        </div>
      </div>
      <div class="sc-li-thread">${msgs}</div>
      <div class="sc-li-input">Escreva uma mensagem…</div>
    </div>`;
}

// Carta de Outubro Rosa: uma afirmação para julgar como mito ou verdade.
function renderHealth(s) {
  return `
    <div class="sc-health sc-anim">
      <div class="sc-health-ribbon" aria-hidden="true">${RIBBON_SVG}</div>
      <div class="sc-health-kicker">Mito ou verdade?</div>
      <p class="sc-health-statement">“${escapeHtml(s.statement || '')}”</p>
      <div class="sc-health-foot">Cuidar também é prevenir</div>
    </div>`;
}

const RENDERERS = {
  'Saúde': renderHealth,
  'SMS': renderSms, 'WhatsApp': renderWhatsApp, 'Email': renderEmail, 'Ligação': renderCall,
  'Site': renderSite, 'QR Code': renderQr, 'LinkedIn': renderLinkedIn,
};

// Desenha os QR Codes reais do cartaz (lib qrcodejs, já carregada pro lobby).
// Sem a lib, cai num desenho genérico — o cenário continua legível pela prévia da câmera.
const QR_FALLBACK = '<svg viewBox="0 0 21 21" shape-rendering="crispEdges"><path fill="#111" d="M0 0h7v7H0zM14 0h7v7h-7zM0 14h7v7H0z"/><path fill="#fff" d="M1 1h5v5H1zM15 1h5v5h-5zM1 15h5v5H1z"/><path fill="#111" d="M2 2h3v3H2zM16 2h3v3h-3zM2 16h3v3H2zM9 1h2v2H9zM8 4h3v2H8zM9 8h4v2H9zM14 9h2v3h-2zM8 12h2v4H8zM12 14h3v2h-3zM17 12h3v2h-3zM11 17h2v3h-2zM15 17h5v2h-5zM18 15h2v2h-2z"/></svg>';

function paintQrCodes(root) {
  root.querySelectorAll('.sc-qr-code').forEach((el) => {
    el.innerHTML = '';
    const size = el.closest('.sc-qr-sticker') ? 88 : 132;
    if (typeof QRCode === 'undefined') { el.innerHTML = QR_FALLBACK; return; }
    new QRCode(el, { text: el.dataset.qr, width: size, height: size, colorDark: '#111111', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.L });
    el.removeAttribute('title');
  });
}

/* Monta o cenário no card. O efeito de entrada é aplicado depois por
   animateScenarioEntry(). */
function renderScenarioFrame(scenario) {
  const cfg = typeConfig[scenario.type] || { icon: '', label: scenario.type, color: '#94a3b8' };
  document.getElementById('scenario-type-icon').innerHTML    = cfg.icon;
  document.getElementById('scenario-type-label').textContent = cfg.label;
  document.getElementById('scenario-type-bar').style.borderLeft = `3px solid ${cfg.color}`;

  const levelEl = document.getElementById('scenario-level');
  if (levelEl) {
    levelEl.textContent = scenario.kind === 'health' ? 'Saúde · CIPA'
      : scenario.levelName ? `Nível ${scenario.levelIcon || ''} · ${scenario.levelName}` : '';
    levelEl.style.color = scenario.levelColor || '';
    levelEl.style.borderColor = scenario.levelColor || '';
  }

  const contextEl = document.getElementById('scenario-context');
  contextEl.textContent = scenario.context || '';
  contextEl.style.display = scenario.context ? 'block' : 'none';

  const scene = document.getElementById('scene');
  const render = RENDERERS[scenario.type];
  scene.innerHTML = render ? render(scenario) : `<div class="sc-plain">${richText(scenario.content || '')}</div>`;
  // Situação de saúde: a pergunta aparece embaixo da cena (também no telão do host).
  if (scenario.kind === 'health' && scenario.type !== 'Saúde' && scenario.question) {
    scene.insertAdjacentHTML('beforeend', `<div class="sc-health-ask">${RIBBON_SHIELD}<span>${escapeHtml(scenario.question)}</span></div>`);
  }
  paintQrCodes(scene);
}

// ── ANIMAÇÃO DE ENTRADA ───────────────────────
// Como no app: no WhatsApp o topo mostra "digitando…" e a mensagem chega
// inteira; SMS e LinkedIn chegam uma a uma; na ligação as falas aparecem como
// legenda. Tocar no card pula a animação.

let _skipAnimation = null;

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

  const items = [...document.querySelectorAll('#scene .sc-anim')];
  const statusEl = document.querySelector('#scene .sc-wa-status');
  const timers = [];
  let finished = false;

  const show = (el) => el.classList.add('sc-in');
  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    items.forEach(show);
    if (statusEl) statusEl.textContent = statusEl.dataset.default || '';
    _skipAnimation = null;
    revealDecision();
    if (onDone) onDone();
  };
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  let t = 250;
  if (scenario.type === 'WhatsApp') {
    items.forEach((el) => {
      at(t, () => { if (statusEl) statusEl.textContent = el.dataset.waStatus || 'digitando…'; });
      t += 700;
      at(t, () => { show(el); Sound.typingTick(); if (statusEl) statusEl.textContent = statusEl.dataset.default || ''; });
      t += 350;
    });
  } else if (scenario.type === 'SMS' || scenario.type === 'LinkedIn') {
    items.forEach((el) => { t += 450; at(t, () => { show(el); Sound.typingTick(); }); });
  } else if (scenario.type === 'Ligação') {
    items.forEach((el) => { t += 750; at(t, () => { show(el); Sound.typingTick(); }); });
  } else {
    items.forEach((el) => at(t, () => show(el)));
  }
  at(t + 200, finish);
  _skipAnimation = finish;
}
