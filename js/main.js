(() => {
  'use strict';

  /* ================= CONFIGURACIÓN (edita aquí) ================= */
  const CONFIG = {
    // Volumen de la canción de fondo (0 a 1). Bájalo si la quieres más suave.
    musicVolume: 0.22,
    // Número con lada, sin "+" ni espacios (ej. "5215512345678"). Vacío = botón oculto.
    whatsappNumber: '',
    whatsappText: 'Hola, confirmo mi asistencia al bautizo de Bastian Antonio ✦',
    // Agrega la ciudad para que el mapa sea más preciso.
    // Enlace exacto de Google Maps de la parroquia (si está vacío, busca por nombre)
    churchUrl: 'https://www.google.com/maps/place/Parroquia+de+San+Miguel+Arc%C3%A1ngel/@20.3650148,-103.8215121,17z/data=!3m1!4b1!4m6!3m5!1s0x8425e609e3307721:0x525c2d2a23791d1a!8m2!3d20.3650148!4d-103.8215121!16s%2Fg%2F1trxklgz',
    churchQuery: 'Parroquia de San Miguel Arcángel',
    // Enlace exacto de Google Maps de la recepción (si está vacío, busca por nombre)
    partyUrl: 'https://www.google.com/maps/place/Huerta+la+bendici%C3%B3n/@20.356665,-103.8144903,17z/data=!3m1!4b1!4m6!3m5!1s0x8425e5c80ab0b8ad:0x4437a3dd92ee054d!8m2!3d20.356665!4d-103.8144903!16s%2Fg%2F11m_k1vsdp',
    partyQuery: 'Terraza Huerta La Bendición, Brizuela 570',
    // Fecha y hora del evento (hora local del invitado) para la cuenta regresiva
    eventDate: [2026, 11, 28, 12, 0, 0]   // año, mes, día, hora, min, seg
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = () => typeof window.gsap !== 'undefined';
  const animate = !reduced;

  const stage = $('#stage'), envelope = $('#envelope'), envWrap = $('#envWrap');
  const flap = $('#flap'), mini = $('#mini'), seal = $('#seal'), hint = $('#hint');
  const letterWrap = $('#letterWrap'), letter = $('#letter');
  let opened = false;

  // Se enlaza lo antes posible para que el toque funcione aunque otra parte falle
  // Dos toques: el 1.º activa el sonido (gesto válido para el audio del navegador), el 2.º abre el sobre.
  // Si el sonido está silenciado (botón de arriba), basta un toque.
  let armed = false;
  function tapEnvelope() {
    if (opened) return;
    if (!armed && !Sound.muted) { armWithSound(); return; }
    open();
  }
  function armWithSound() {
    armed = true;
    Sound.start();
    const hintText = $('#hintText');
    hintText.textContent = 'Un toque más… ya casi';
    hint.classList.add('armed');
    envelope.setAttribute('aria-label', 'Toca una vez más para abrir la invitación');
    envWrap.classList.add('wake');
    envWrap.addEventListener('animationend', () => envWrap.classList.remove('wake'), { once: true });
    Sound.harp(); Sound.sparkle(4, .6);
    if (hasGsap() && animate) {
      const r = seal.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 12);
    }
  }
  envWrap.addEventListener('click', tapEnvelope);
  envelope.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapEnvelope(); } });

  /* ---------- Música de fondo: "Arrullo de estrellas" ----------
     Solo suena la canción (sin efectos), a volumen bajo, en bucle y con entrada suave.
     Coloca el archivo en assets/audio/arrullo-de-estrellas.mp3 (ver CONFIG.musicVolume). */
  const bgm = $('#bgm');
  const Sound = (() => {
    let ctx, gain, started = false, muted = false, wired = false;
    try { muted = localStorage.getItem('sound') === 'off'; } catch (e) {}
    const level = () => (muted ? 0 : CONFIG.musicVolume);

    function init() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          try {
            ctx = new AC();
            gain = ctx.createGain(); gain.gain.value = started ? level() : 0;
            gain.connect(ctx.destination);
            // El volumen se controla con Web Audio (en iPhone `audio.volume` no funciona)
            ctx.createMediaElementSource(bgm).connect(gain); wired = true;
          } catch (e) { wired = false; }
        }
      }
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    }
    function fadeTo(v, secs) {
      if (wired && ctx) { gain.gain.cancelScheduledValues(ctx.currentTime); gain.gain.setTargetAtTime(v, ctx.currentTime, secs / 3); }
      else bgm.volume = Math.max(0, Math.min(1, v));
    }
    function start() {
      if (started || !bgm) return;
      init();
      started = true;
      if (!wired) bgm.volume = 0;
      const p = bgm.play();
      if (p && p.catch) p.catch(() => { started = false; });   // sin archivo o bloqueado: se reintenta en el siguiente gesto
      fadeTo(level(), 4);
    }
    const noop = () => {};
    return {
      init, start,
      get running() { return !!bgm && !bgm.paused && (!ctx || ctx.state === 'running'); },
      get muted() { return muted; },
      setMuted(v) {
        muted = v;
        try { localStorage.setItem('sound', v ? 'off' : 'on'); } catch (e) {}
        if (started) fadeTo(level(), .4);
      },
      pause() { if (started) bgm.pause(); },
      resume() { if (started && !muted) { init(); bgm.play().catch(() => {}); } },
      // Los efectos de sonido fueron reemplazados por la canción: se dejan vacíos
      pop: noop, creak: noop, whoosh: noop, sparkle: noop, fanfare: noop, chime: noop,
      twinkle: noop, harp: noop, knock: noop, choir: noop, click: noop
    };
  })();
  // No dejar sonando la canción si la página queda en segundo plano
  document.addEventListener('visibilitychange', () => document.hidden ? Sound.pause() : Sound.resume());

  // Chrome solo permite audio tras un gesto de activación (en móvil: touchend/click, no touchstart).
  // Se reintenta en cada gesto hasta que el audio esté realmente activo.
  const unlockEvents = ['pointerup', 'touchend', 'click', 'keydown'];
  function unlockAudio() {
    Sound.init();
    if (Sound.running) unlockEvents.forEach(ev => window.removeEventListener(ev, unlockAudio, true));
  }
  unlockEvents.forEach(ev => window.addEventListener(ev, unlockAudio, { capture: true, passive: true }));
  const soundBtn = $('#soundBtn');
  function paintSoundBtn() {
    soundBtn.setAttribute('aria-pressed', String(Sound.muted));
    soundBtn.setAttribute('aria-label', Sound.muted ? 'Activar sonidos' : 'Silenciar sonidos');
  }
  paintSoundBtn();
  soundBtn.addEventListener('click', () => {
    Sound.init(); Sound.setMuted(!Sound.muted); paintSoundBtn();
    if (!Sound.muted) setTimeout(() => Sound.chime(4), 60);
  });
  $$('.btn').forEach(b => b.addEventListener('click', () => Sound.click()));

  /* ---------- Estrellas del cielo ---------- */
  (function skyStars() {
    const host = $('#skyStars');
    for (let i = 0; i < 34; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.setProperty('--s', 8 + Math.random() * 14 + 'px');
      s.style.setProperty('--t', 2.2 + Math.random() * 3 + 's');
      s.style.setProperty('--dl', -Math.random() * 4 + 's');
      host.appendChild(s);
    }
  })();

  /* ---------- Acciones ---------- */
  const maps = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  $('#btnChurch').href = CONFIG.churchUrl || maps(CONFIG.churchQuery);
  $('#btnParty').href = CONFIG.partyUrl || maps(CONFIG.partyQuery);
  if (CONFIG.whatsappNumber) {
    const wa = $('#btnWa');
    wa.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappText)}`;
    wa.hidden = false;
  }
  /* ---------- Cuenta regresiva ---------- */
  (function countdown() {
    const [y, mo, d, h, mi, se] = CONFIG.eventDate;
    const target = new Date(y, mo - 1, d, h, mi, se).getTime();
    const box = $('#countdown'), sub = $('#cdSub'), title = $('.cd-title', box);
    const els = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') };
    const pad = n => String(n).padStart(2, '0');
    const set = (el, v) => {
      if (el.textContent === v) return;
      el.textContent = v;
      if (animate) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
    };
    function update() {
      const diff = target - Date.now();
      if (diff <= 0) {
        const sameDay = Date.now() - target < 12 * 3600e3;
        box.classList.add('is-today');
        title.textContent = sameDay ? '¡Hoy es el gran día!' : '¡Gracias por acompañarnos!';
        sub.textContent = sameDay ? 'Te esperamos con mucho cariño ✦' : 'Bastian Antonio ✦';
        return false;
      }
      const t = Math.floor(diff / 1000);
      set(els.d, String(Math.floor(t / 86400)));
      set(els.h, pad(Math.floor(t % 86400 / 3600)));
      set(els.m, pad(Math.floor(t % 3600 / 60)));
      set(els.s, pad(t % 60));
      return true;
    }
    if (update()) {
      const id = setInterval(() => { if (!update()) clearInterval(id); }, 1000);
    }
  })();

  /* ---------- Óvalo (tamaño real en px para dibujar el trazo) ---------- */
  const oval = $('#oval'), gold = $('#ovalGold'), blue = $('#ovalBlue');
  function sizeOval() {
    const w = letter.clientWidth, h = letter.clientHeight;
    oval.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const set = (el, inset, ry) => {
      el.setAttribute('cx', w / 2); el.setAttribute('cy', h / 2);
      el.setAttribute('rx', w / 2 - inset); el.setAttribute('ry', h / 2 - ry);
    };
    set(gold, w * 0.022, h * 0.018);
    set(blue, w * 0.030, h * 0.026);
  }
  sizeOval();
  if ('ResizeObserver' in window) new ResizeObserver(sizeOval).observe(letter);
  else window.addEventListener('resize', sizeOval);

  /* ---------- Explosión de estrellas ---------- */
  function burst(x, y, n = 34) {
    if (!hasGsap() || !animate) return;
    const host = $('#burst');
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      s.style.setProperty('--s', 10 + Math.random() * 18 + 'px');
      host.appendChild(s);
      const ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * Math.min(innerWidth, 520) * 0.55;
      gsap.fromTo(s, { x, y, scale: 0, rotation: 0, opacity: 1 }, {
        x: x + Math.cos(ang) * dist, y: y + Math.sin(ang) * dist - 40,
        scale: 0.6 + Math.random(), rotation: (Math.random() - .5) * 360,
        duration: 1.2 + Math.random() * .9, ease: 'power3.out'
      });
      gsap.to(s, { opacity: 0, y: '+=60', duration: .8, delay: .9 + Math.random() * .6, ease: 'power1.in', onComplete: () => s.remove() });
    }
  }

  /* ---------- Revelado de la carta (al entrar en pantalla) ---------- */
  const reveals = {
    up:      el => gsap.fromTo(el, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .95, ease: 'power3.out' }),
    fade:    el => gsap.fromTo(el, { opacity: 0, scale: .8 }, { opacity: .92, scale: 1, duration: 1.6, ease: 'power2.out' }),
    drop:    el => gsap.fromTo(el, { y: -50, opacity: 0, scale: .85 }, { y: 0, opacity: 1, scale: 1, duration: 1.3, ease: 'elastic.out(1,.65)' }),
    name:    el => gsap.fromTo(el, { opacity: 0, scale: .9, filter: 'blur(10px)', letterSpacing: '.18em' }, { opacity: 1, scale: 1, filter: 'blur(0px)', letterSpacing: '.02em', duration: 1.7, ease: 'power3.out' }),
    pop:     el => gsap.fromTo(el, { scale: 0, rotation: -140, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: .9, ease: 'back.out(2.4)' }),
    ribbon:  el => gsap.fromTo(el, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1.15, ease: 'power3.out' }),
    'slide-l': el => gsap.fromTo(el, { x: -70, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'back.out(1.4)' }),
    'slide-r': el => gsap.fromTo(el, { x: 70, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'back.out(1.4)' }),
    bow:     el => gsap.fromTo(el, { scale: .2, opacity: 0, rotation: -12 }, { scale: 1, opacity: 1, rotation: 0, duration: 1.4, ease: 'elastic.out(1,.55)' })
  };

  const revealSounds = {
    drop: () => { Sound.harp(); },
    name: () => { Sound.chime(5); Sound.sparkle(6, .9); },
    ribbon: () => { Sound.whoosh(.12, .6); Sound.chime(3); },
    pop: () => Sound.twinkle(),
    'slide-l': () => Sound.knock(),
    'slide-r': () => Sound.knock(),
    bow: () => { Sound.creak(); Sound.sparkle(7, .8); }
  };

  function startReveals() {
    // Dibujo del óvalo
    gsap.set([gold, blue], { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(gold, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', delay: .2 });
    gsap.to(blue, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', delay: .45 });

    const items = $$('[data-r]');
    const done = new WeakSet();
    const io = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      vis.forEach((e, i) => {
        const el = e.target;
        if (done.has(el)) return;
        done.add(el); io.unobserve(el);
        const tween = (reveals[el.dataset.r] || reveals.up)(el);
        const dl = .15 + i * .16;
        tween.delay(dl);
        const cue = revealSounds[el.dataset.r];
        if (cue) gsap.delayedCall(dl, cue);
        // al terminar, el escalado de la cinta no debe quedar fijado inline
        if (el.dataset.r === 'ribbon') tween.eventCallback('onComplete', () => gsap.set(el, { clearProps: 'transform' }));
      });
    }, { threshold: .15 });
    items.forEach(el => io.observe(el));
    // líneas divisorias: se "dibujan" desde el centro
    $$('.divider .ln').forEach(ln => {
      gsap.set(ln, { scaleX: 0 });
      const o = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { gsap.to(ln, { scaleX: 1, duration: 1.1, ease: 'power2.out', delay: .35 }); o.disconnect(); }
      }, { threshold: .5 });
      o.observe(ln);
    });
  }

  /* ---------- Apertura ---------- */
  function finishOpen() {
    document.body.classList.remove('is-locked');
    document.body.classList.add('is-open');
    stage.style.display = 'none';
    window.scrollTo(0, 0);
    sizeOval();
  }

  function showLetterInstantly() {
    letterWrap.style.opacity = 1; letterWrap.style.visibility = 'visible';
    finishOpen();
  }

  function open() {
    if (opened) return;
    opened = true;
    Sound.start();
    envelope.style.animation = 'none';
    envelope.setAttribute('aria-expanded', 'true');
    envelope.disabled = true;

    if (!animate || !hasGsap()) { showLetterInstantly(); return; }
    try { playOpening(); } catch (err) { console.error(err); showLetterInstantly(); }
  }

  function playOpening() {
    document.documentElement.classList.add('js');
    sizeOval();
    const r = seal.getBoundingClientRect();
    const sx = r.left + r.width / 2, sy = r.top + r.height / 2;

    seal.style.animation = 'none';
    gsap.set(letter, { transformOrigin: '50% 0', scale: .4, y: innerHeight * .35, opacity: 0 });
    gsap.set($('.letter-wrap'), { autoAlpha: 0 });
    gsap.set($$('.letter [data-r], .letter .divider .ln, .actions [data-r]'), { opacity: 0 });
    gsap.set([gold, blue], { strokeDasharray: 1, strokeDashoffset: 1 });

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.add(() => { burst(sx, sy, 30); Sound.pop(); Sound.sparkle(5, .9); }, 0)
      .add(() => Sound.creak(), .4)
      .to(hint, { opacity: 0, y: 10, duration: .4 }, 0)
      .to(seal, { scale: 1.5, opacity: 0, duration: .55, ease: 'power2.out' }, 0)
      // 1) se abre la solapa (3D)
      .to(flap, { rotationX: -180, duration: 1, ease: 'power2.inOut' }, .35)
      .set(flap, { zIndex: 1 }, .8)
      // 2) la carta asoma
      .add(() => { Sound.whoosh(.1, .8); Sound.choir(); }, 1.2)
      .to(mini, { yPercent: -62, duration: 1.05, ease: 'power3.out' }, 1.2)
      .to(envWrap, { scale: 1.06, duration: 1.2, ease: 'sine.inOut' }, 1.2)
      // 3) la carta se despliega a pantalla completa
      .add(() => { burst(innerWidth / 2, innerHeight * .45, 46); Sound.whoosh(.12, 1); Sound.fanfare(); Sound.sparkle(7, 2); }, 2.25)
      .to(mini, { scale: 2.1, yPercent: -75, opacity: 0, duration: .8, ease: 'power2.in' }, 2.2)
      .to(envWrap, { y: innerHeight * .55, opacity: 0, duration: .9, ease: 'power3.in' }, 2.25)
      .to($('.kicker'), { y: -60, opacity: 0, duration: .6 }, 2.2)
      .set(letterWrap, { autoAlpha: 1 }, 2.4)
      .to(letter, { scale: 1, y: 0, opacity: 1, duration: 1.3, ease: 'power3.out', clearProps: 'transform' }, 2.4)
      .add(() => { finishOpen(); startReveals(); gsap.set(letter, { clearProps: 'all' }); }, 3.5)
      .to(stage, { opacity: 0, duration: .01 }, 3.5);
  }

  /* Atajo para pruebas / compartir directo: ?abierta */
  if (/[?&#]abierta/.test(location.search + location.hash)) {
    opened = true;
    letterWrap.style.opacity = 1; letterWrap.style.visibility = 'visible';
    finishOpen();
    if (hasGsap() && animate) { document.documentElement.classList.add('js'); startReveals(); }
  }
  window.addEventListener('load', sizeOval);
})();
