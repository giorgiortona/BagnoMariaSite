/* Regia del reel Bagnomaria.
   Questo file viene iniettato nella pagina del sito vero durante il rendering
   (vedi render.mjs) e diventa `window.__reel`. Espone due sole cose:

     __reel.init(opts)  una volta, a pagina pronta
     __reel.frame(t)    per ogni fotogramma, con t in secondi

   `frame` deve essere deterministico: dato lo stesso t disegna lo stesso
   fotogramma. Nulla qui dipende da requestAnimationFrame o dall'orologio di
   sistema: il tempo lo decide il renderer, non il browser. */

(function () {
  const W = 450   // larghezza logica della scena (px CSS)
  const H = 800   // altezza logica (9:16)

  /* ─── copione ───────────────────────────────────────────────────────────
     Tutti i tempi sono in secondi. Cambiare qui cambia il montaggio. */
  const T = {
    supIn: 0.00, supOut: 2.35,   // il sup attraversa lo schermo
    revealEnd: 2.50,             // il sito è completamente scoperto
    tapBurger: 4.05,             // si apre il menu a panino
    tapMenu: 6.05,               // il dito arriva sulla voce "Menù"...
    openMenu: 6.55,              // ...e preme dentro l'onda di stacco
    menuClose: 11.20,
    outroWave: [23.25, 24.35],   // le onde risalgono e coprono
    endCard: 24.20,
    total: 28.7,
  }

  /* Il cerchio compare prima del clic e resta un attimo dopo: il gesto si
     deve leggere, non solo intuire. */
  const TAP_IN = 0.30
  const TAP_OUT = 0.55

  const TAPS = [
    { t: T.tapBurger, sel: '.nav-toggle' },
    { t: T.tapMenu, click: T.openMenu, sel: '.nav-panel a[href="#menu"]' },
  ]

  /* Stacchi pieni: un'onda copre lo schermo, il sito cambia dietro, l'onda
     esce. È il gesto dell'apertura riusato come transizione di montaggio. */
  const WIPES = [
    { c: T.openMenu, d: 0.80 },
    { c: T.menuClose, d: 0.72 },
  ]

  /* Il sito non scorre: salta di sezione in sezione, come le pagine di una
     presentazione. Ogni salto è coperto da una passata di schiuma. */
  const JUMPS = [
    { t: T.menuClose, sel: '#spiaggia' },
    { t: 12.95, sel: '#giornata', sweep: true },
    { t: 14.35, sel: '#bar', sweep: true },
    { t: 15.75, sel: '#eventi', sweep: true },
    { t: 17.15, sel: '#galleria', sweep: true },
    { t: 18.55, sel: '#prenota', sweep: true },
    { t: 19.95, sel: '#contatti', sweep: true },
    { t: 21.35, sel: '#top', sweep: true },
  ]

  /* Stessa idea dentro la pagina del menù: tre fermate, non uno scorrimento.
     `k` è la frazione di pagina. */
  const MENU_JUMPS = [
    { t: T.openMenu, k: 0 },
    { t: 8.25, k: 0.30, sweep: true },
    { t: 9.55, k: 0.62, sweep: true },
  ]

  /* ─── utilità ─────────────────────────────────────────────────────────── */
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
  const lerp = (a, b, k) => a + (b - a) * k
  /* avanzamento 0→1 fra due istanti */
  const span = (t, a, b) => clamp((t - a) / (b - a))
  const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
  const easeOut = (k) => 1 - Math.pow(1 - k, 3)
  /* accelerazione dolce: la pagaiata non parte da ferma né si inchioda */
  const glide = (k) => k * k * (3 - 2 * k)

  let ctx, canvas, tapEl, ringEl, endEl, heroImg
  let heroFrames = 0
  let markPaths = []
  const markLengths = []
  const fired = new Set()
  const offsets = {}
  let menuScrollMax = 0

  /* ─── mare ────────────────────────────────────────────────────────────── */
  /* Due mari: quello chiaro dell'apertura e quello profondo del finale, dove
     sopra ci va la scritta bianca e serve contrasto. */
  function seaFill(c, deep) {
    const g = c.createLinearGradient(0, 0, W * 0.35, H)
    if (deep) {
      g.addColorStop(0, '#1184b2')
      g.addColorStop(0.34, '#0b6d97')
      g.addColorStop(0.7, '#07547d')
      g.addColorStop(1, '#033b5c')
    } else {
      g.addColorStop(0, '#e4f6fd')
      g.addColorStop(0.28, '#a8e0f3')
      g.addColorStop(0.62, '#61bde1')
      g.addColorStop(1, '#1184b2')
    }
    return g
  }

  /* Increspature: righe morbide che scorrono lentamente, danno profondità
     al fondale senza rubare la scena al sup. */
  function ripples(c, t, deep) {
    c.save()
    c.lineWidth = 1.4
    for (let i = 0; i < 16; i++) {
      const base = (i / 16) * H * 1.25 - H * 0.1
      const drift = Math.sin(t * 0.55 + i * 0.9) * 14
      const y = base + drift
      c.globalAlpha = (deep ? 0.07 : 0.10) + 0.07 * Math.sin(i * 1.7)
      c.strokeStyle = deep || i % 3 === 0 ? '#ffffff' : '#07547d'
      c.beginPath()
      for (let x = -20; x <= W + 20; x += 10) {
        const yy = y + Math.sin(x * 0.021 + i * 1.3 + t * 0.8) * (5 + i * 0.5)
        if (x === -20) c.moveTo(x, yy)
        else c.lineTo(x, yy)
      }
      c.stroke()
    }
    c.restore()
  }

  /* Bordo ondulato di un semipiano: restituisce i punti della cresta.
     F = punto sul fronte, u = direzione di avanzamento (versore). */
  function crest(F, u, amp, freq, phase) {
    const n = { x: -u.y, y: u.x }
    const R = 1400
    const pts = []
    for (let s = -R; s <= R; s += 12) {
      const w =
        Math.sin(s * freq + phase) * amp +
        Math.sin(s * freq * 2.37 + phase * 1.6) * amp * 0.42 +
        Math.sin(s * freq * 0.53 - phase * 0.7) * amp * 0.6
      pts.push({ x: F.x + n.x * s + u.x * w, y: F.y + n.y * s + u.y * w })
    }
    return pts
  }

  /* Riempie di mare il semipiano davanti al fronte e disegna la schiuma
     sulla cresta. Tutto ciò che resta indietro mostra il sito. */
  function drawCover(c, F, u, amp, phase, alpha, deep) {
    const pts = crest(F, u, amp, 0.028, phase)
    const far = 2000
    c.save()
    c.globalAlpha = alpha
    c.beginPath()
    c.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y)
    c.lineTo(pts[pts.length - 1].x + u.x * far, pts[pts.length - 1].y + u.y * far)
    c.lineTo(pts[0].x + u.x * far, pts[0].y + u.y * far)
    c.closePath()
    c.fillStyle = seaFill(c, deep)
    c.fill()
    c.restore()

    foam(c, pts, F, u, amp, phase, alpha, 16)
  }

  /* Schiuma sulla cresta: una fascia larga sfumata, una linea netta e le
     bollicine che scappano avanti. */
  function foam(c, pts, F, u, amp, phase, alpha, band) {
    c.save()
    c.globalAlpha = alpha
    c.lineJoin = 'round'
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y)
    c.strokeStyle = 'rgba(255,255,255,0.55)'
    c.lineWidth = band
    c.stroke()
    c.strokeStyle = 'rgba(255,255,255,0.95)'
    c.lineWidth = 3.5
    c.stroke()
    c.restore()

    c.save()
    const n = { x: -u.y, y: u.x }
    c.fillStyle = 'rgba(255,255,255,0.8)'
    for (let i = 0; i < 46; i++) {
      const s = (i / 46 - 0.5) * 1600
      const j = Math.sin(i * 12.9898) * 43758.5453
      const r = j - Math.floor(j)
      const off = -8 - r * 34
      const w = Math.sin(s * 0.028 + phase) * amp
      const x = F.x + n.x * s + u.x * (w + off)
      const y = F.y + n.y * s + u.y * (w + off)
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue
      c.globalAlpha = alpha * (0.85 - r * 0.4)
      c.beginPath()
      c.arc(x, y, 0.9 + r * 2.4, 0, 6.2832)
      c.fill()
    }
    c.restore()
  }

  /* Passata di schiuma senza mare dietro: copre per un attimo il salto da una
     sezione all'altra senza nascondere la pagina. */
  function drawSweep(c, t, at) {
    const d = 0.42
    const k = span(t, at - d / 2, at + d / 2)
    if (k <= 0 || k >= 1) return
    const u = { x: 0, y: 1 }
    const F = { x: 0, y: lerp(H + 130, -130, easeInOut(k)) }
    const alpha = Math.min(1, Math.sin(k * Math.PI) * 1.6)
    const phase = t * 3.2
    const pts = crest(F, u, 13, 0.028, phase)

    /* Fascia d'acqua, non di sola schiuma: il bianco sparirebbe sulle sezioni
       chiare. Tre passate di larghezza calante fanno il bordo sfumato. */
    c.save()
    c.beginPath()
    c.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y)
    c.lineJoin = 'round'
    c.lineCap = 'round'
    c.strokeStyle = seaFill(c, false)
    for (const [w, a] of [[210, 0.20], [150, 0.30], [88, 0.45]]) {
      c.globalAlpha = alpha * a
      c.lineWidth = w
      c.stroke()
    }
    c.restore()

    foam(c, pts, F, u, 13, phase, alpha, 20)
  }

  /* ─── il sup ──────────────────────────────────────────────────────────── */
  /* Vista dall'alto, come nel video drone dell'hero: tavola, pagaiatore e
     scia a V. Disegnato a mano su una griglia di 100 x 260. */
  function board(c) {
    c.beginPath()
    c.moveTo(50, 2)
    c.bezierCurveTo(70, 40, 83, 92, 83, 150)
    c.bezierCurveTo(83, 206, 71, 245, 50, 258)
    c.bezierCurveTo(29, 245, 17, 206, 17, 150)
    c.bezierCurveTo(17, 92, 30, 40, 50, 2)
    c.closePath()
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath()
    c.moveTo(x + r, y)
    c.arcTo(x + w, y, x + w, y + h, r)
    c.arcTo(x + w, y + h, x, y + h, r)
    c.arcTo(x, y + h, x, y, r)
    c.arcTo(x, y, x + w, y, r)
    c.closePath()
  }

  function drawSup(c, pos, u, scale) {
    const ang = Math.atan2(u.y, u.x) - Math.PI / 2
    c.save()
    c.translate(pos.x, pos.y)
    c.rotate(ang)
    c.scale(scale, scale)
    c.translate(-50, -130)

    /* ombra sull'acqua */
    c.save()
    c.translate(6, 10)
    c.fillStyle = 'rgba(3,59,92,0.22)'
    board(c)
    c.fill()
    c.restore()

    /* tavola */
    board(c)
    c.fillStyle = '#ffffff'
    c.fill()
    c.strokeStyle = 'rgba(7,84,125,0.55)'
    c.lineWidth = 2.2
    c.stroke()

    /* striscia centrale */
    c.beginPath()
    c.moveTo(50, 28)
    c.lineTo(50, 232)
    c.strokeStyle = 'rgba(97,189,225,0.75)'
    c.lineWidth = 3
    c.stroke()

    const ink = '#07547d'

    /* pagaia: asta in diagonale, pala in acqua a sinistra */
    c.save()
    c.strokeStyle = ink
    c.lineWidth = 6
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(6, 74)
    c.lineTo(92, 168)
    c.stroke()
    c.restore()
    c.beginPath()
    c.ellipse(2, 68, 9, 15, -0.75, 0, 6.2832)
    c.fillStyle = ink
    c.fill()

    /* gambe */
    c.fillStyle = ink
    roundRect(c, 36, 148, 12, 52, 6); c.fill()
    roundRect(c, 52, 148, 12, 52, 6); c.fill()

    /* busto e braccia */
    c.beginPath()
    c.ellipse(50, 140, 19, 24, 0, 0, 6.2832)
    c.fill()
    c.save()
    c.strokeStyle = ink
    c.lineWidth = 9
    c.lineCap = 'round'
    c.beginPath(); c.moveTo(34, 130); c.lineTo(18, 86); c.stroke()
    c.beginPath(); c.moveTo(64, 146); c.lineTo(80, 156); c.stroke()
    c.restore()

    /* testa */
    c.beginPath()
    c.arc(50, 112, 11.5, 0, 6.2832)
    c.fill()

    c.restore()
  }

  /* Scia a V dietro la tavola: resta sul sito già scoperto e sfuma. */
  function drawWake(c, pos, u, t, p) {
    const n = { x: -u.y, y: u.x }
    c.save()
    c.lineCap = 'round'
    for (let i = 0; i < 22; i++) {
      const d = 46 + i * 26                       // distanza dietro la tavola
      const spread = 7 + i * 3.4                  // la V si apre
      const fade = clamp(1 - i / 22) * 0.5 * clamp(p * 4)
      const bx = pos.x - u.x * d
      const by = pos.y - u.y * d
      const wob = Math.sin(i * 0.8 - t * 3.2) * 3
      c.globalAlpha = fade
      c.strokeStyle = '#ffffff'
      c.lineWidth = Math.max(0.6, 3.4 - i * 0.09)
      for (const side of [-1, 1]) {
        c.beginPath()
        c.moveTo(bx + n.x * spread * side + wob, by + n.y * spread * side + wob)
        c.lineTo(bx - u.x * 26 + n.x * (spread + 3.4) * side, by - u.y * 26 + n.y * (spread + 3.4) * side)
        c.stroke()
      }
    }
    /* turbolenza appena dietro la coda */
    c.fillStyle = '#ffffff'
    for (let i = 0; i < 26; i++) {
      const j = Math.sin(i * 78.233 + Math.floor(t * 12)) * 43758.5453
      const r = j - Math.floor(j)
      const d = 40 + r * 150
      const s = (r - 0.5) * 46
      c.globalAlpha = (0.45 - r * 0.3) * clamp(p * 4)
      c.beginPath()
      c.arc(pos.x - u.x * d + n.x * s, pos.y - u.y * d + n.y * s, 1 + r * 3, 0, 6.2832)
      c.fill()
    }
    c.restore()
  }

  /* ─── tocchi sullo schermo ────────────────────────────────────────────── */
  function drawTap(t) {
    let best = null
    for (const tap of TAPS) {
      if (t >= tap.t - TAP_IN && t <= tap.t + TAP_OUT) best = tap
    }
    if (!best || !best.pos) {
      tapEl.style.opacity = '0'
      ringEl.style.opacity = '0'
      return
    }
    /* il dito scende, preme al momento del clic, poi si stacca */
    const k = (t - (best.t - TAP_IN)) / (TAP_IN + TAP_OUT)
    const press = TAP_IN / (TAP_IN + TAP_OUT)
    const inK = clamp(k / (press * 0.75))
    const outK = clamp((k - press - 0.22) / 0.4)
    const s = lerp(0.5, 1, easeOut(inK)) * lerp(1, 0.88, outK)
    tapEl.style.transform = `translate(${best.pos.x}px, ${best.pos.y}px) scale(${s})`
    tapEl.style.opacity = String(clamp(inK) * (1 - outK))
    const rk = clamp((k - press) / 0.5)
    ringEl.style.transform = `translate(${best.pos.x}px, ${best.pos.y}px) scale(${lerp(0.9, 2.8, easeOut(rk))})`
    ringEl.style.opacity = String((1 - rk) * 0.85)
  }

  /* ─── salti di sezione ────────────────────────────────────────────────── */
  /* La posizione delle sezioni si misura una volta sola, a menù chiuso: è la
     stessa per tutto il filmato e rimisurarla a ogni fotogramma costerebbe un
     ricalcolo di layout. */
  function jumpTarget(sel) {
    if (offsets[sel] === undefined) {
      const el = document.querySelector(sel)
      offsets[sel] = el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY) : 0
    }
    return offsets[sel]
  }

  function applyJumps(t) {
    let current = null
    for (const jump of JUMPS) if (t >= jump.t) current = jump
    if (!current) return
    window.scrollTo(0, jumpTarget(current.sel))
  }

  function applyMenuJumps(t) {
    const page = document.querySelector('.menu-page')
    if (!page) return
    if (!menuScrollMax) menuScrollMax = page.scrollHeight - page.clientHeight
    let current = null
    for (const jump of MENU_JUMPS) if (t >= jump.t) current = jump
    if (current) page.scrollTop = menuScrollMax * current.k
  }

  /* ─── cartello finale ─────────────────────────────────────────────────── */
  function drawEnd(t) {
    const k = span(t, T.endCard, T.endCard + 0.5)
    endEl.style.opacity = String(k)
    if (k <= 0) return

    /* la scritta si disegna, poi si riempie: stesso gesto del preloader */
    const draw = span(t, T.endCard + 0.15, T.endCard + 1.55)
    const fill = span(t, T.endCard + 1.35, T.endCard + 2.0)
    markPaths.forEach((p, i) => {
      const len = markLengths[i]
      const local = clamp((draw - (i / Math.max(1, markPaths.length)) * 0.35) / 0.65)
      p.style.strokeDashoffset = String(len * (1 - easeOut(local)))
      p.style.fillOpacity = String(easeOut(fill))
    })

    const rule = span(t, T.endCard + 1.7, T.endCard + 2.35)
    document.getElementById('reel-end-rule').style.width = `${easeOut(rule) * 150}px`

    const one = (id, a, b) => {
      const kk = easeOut(span(t, a, b))
      const el = document.getElementById(id)
      el.style.opacity = String(kk)
      el.style.transform = `translateY(${lerp(14, 0, kk)}px)`
    }
    one('reel-end-tagline', T.endCard + 1.95, T.endCard + 2.6)
    one('reel-end-place', T.endCard + 2.25, T.endCard + 2.9)
    one('reel-end-site', T.endCard + 2.65, T.endCard + 3.35)
  }

  /* ─── il fotogramma ───────────────────────────────────────────────────── */
  function frame(t) {
    /* 1. stato del sito: clic, fermate nel menù, salti di sezione */
    for (const tap of TAPS) {
      /* posizione del bersaglio, presa poco prima che il dito compaia */
      if (!tap.pos && t >= tap.t - TAP_IN - 0.06) {
        const el = document.querySelector(tap.sel)
        if (el) {
          const r = el.getBoundingClientRect()
          tap.pos = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        }
      }
      const at = tap.click === undefined ? tap.t : tap.click
      if (t >= at && !fired.has(tap.sel + tap.t)) {
        fired.add(tap.sel + tap.t)
        const el = document.querySelector(tap.sel)
        if (el) el.click()
      }
    }

    if (t >= T.openMenu && t < T.menuClose) applyMenuJumps(t)

    if (t >= T.menuClose) {
      if (!fired.has('close')) {
        fired.add('close')
        window.location.hash = '#top'
        window.scrollTo(0, 0)
      }
      applyJumps(t)
    }

    /* 2. video dell'hero: un fotogramma estratto, scelto in modo deterministico */
    if (heroImg && heroFrames) {
      const idx = Math.floor(t * 30) % heroFrames
      const src = `${window.__reelHeroBase}${String(idx + 1).padStart(4, '0')}.jpg`
      if (heroImg.getAttribute('src') !== src) heroImg.setAttribute('src', src)
    }

    /* 3. scena disegnata */
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(window.__reelDpr, 0, 0, window.__reelDpr, 0, 0)

    if (t < T.revealEnd + 0.35) {
      /* intro: il sup entra dall'angolo in alto a sinistra e taglia lo schermo */
      /* La punta della tavola è già dentro l'inquadratura al fotogramma zero:
         è quello il fermo immagine che Instagram usa come copertina. */
      /* Andatura quasi costante: con una curva più morbida la tavola sfrecciava
         a metà corsa e usciva dopo un secondo e mezzo scarso. */
      const kk = span(t, T.supIn, T.supOut)
      const p = 0.18 * glide(kk) + 0.82 * kk
      const P0 = { x: -0.07 * W, y: -0.05 * H }
      const P1 = { x: 1.22 * W, y: 1.20 * H }
      const dx = P1.x - P0.x
      const dy = P1.y - P0.y
      const len = Math.hypot(dx, dy)
      const u = { x: dx / len, y: dy / len }
      const pos = { x: lerp(P0.x, P1.x, p), y: lerp(P0.y, P1.y, p) }
      const F = { x: pos.x - u.x * 74, y: pos.y - u.y * 74 }
      const fade = 1 - span(t, T.supOut, T.revealEnd + 0.35)

      /* il mare copre solo la parte non ancora attraversata */
      ctx.save()
      drawCover(ctx, F, u, lerp(6, 20, Math.min(1, p * 2)), t * 3.4, 1)
      /* le increspature vivono dentro il mare, non sopra il sito */
      ctx.globalCompositeOperation = 'source-atop'
      ripples(ctx, t)
      ctx.restore()

      if (p < 0.995) {
        if (p > 0.015) drawWake(ctx, pos, u, t, p)
        drawSup(ctx, pos, u, 0.60)
      }
      if (fade > 0 && fade < 1) {
        /* residuo di schiuma che si dissolve sul sito */
        ctx.save()
        ctx.globalAlpha = fade * 0.6
        drawCover(ctx, { x: F.x + u.x * 40, y: F.y + u.y * 40 }, u, 14, t * 3.4, 1)
        ctx.restore()
      }
    }

    /* passata di schiuma su ogni salto di sezione */
    for (const jump of JUMPS) if (jump.sweep) drawSweep(ctx, t, jump.t)
    for (const jump of MENU_JUMPS) if (jump.sweep) drawSweep(ctx, t, jump.t)

    /* stacchi a onda fra una schermata e l'altra */
    for (const wipe of WIPES) {
      const a = wipe.c - wipe.d / 2
      const b = wipe.c + wipe.d / 2
      if (t < a || t > b) continue
      const first = t <= wipe.c
      const k = easeInOut(span(t, first ? a : wipe.c, first ? wipe.c : b))
      drawCover(ctx, { x: 0, y: lerp(H + 70, -70, k) }, { x: 0, y: first ? 1 : -1 }, 13, t * 3.2, 1)
      ctx.save()
      ctx.globalCompositeOperation = 'source-atop'
      ripples(ctx, t)
      ctx.restore()
    }

    if (t >= T.outroWave[0]) {
      /* finale: il mare risale dal basso e copre il sito */
      const k = easeInOut(span(t, T.outroWave[0], T.outroWave[1]))
      /* il fronte sale dal basso: coperto è tutto ciò che sta sotto la cresta */
      const u = { x: 0, y: 1 }
      const F = { x: 0, y: lerp(H + 70, -70, k) }
      drawCover(ctx, F, u, lerp(16, 8, k), t * 3.0, 1, true)
      ctx.save()
      ctx.globalCompositeOperation = 'source-atop'
      ripples(ctx, t, true)
      ctx.restore()
      /* un sup lontano che riattraversa in basso, come richiamo dell'apertura */
      const sp = span(t, T.outroWave[0] + 0.9, T.total + 0.6)
      if (sp > 0 && k > 0.7) {
        ctx.save()
        ctx.globalAlpha = 0.5
        drawSup(ctx, { x: lerp(-80, W + 100, sp), y: lerp(H * 0.74, H * 0.88, sp) }, { x: 0.72, y: 0.69 }, 0.24)
        ctx.restore()
      }
      drawEnd(t)
    } else {
      endEl.style.opacity = '0'
    }

    drawTap(t)
  }

  /* ─── avvio ───────────────────────────────────────────────────────────── */
  function init(opts) {
    window.__reelDpr = opts.dpr
    window.__reelHeroBase = opts.heroBase
    heroFrames = opts.heroFrames

    const root = document.createElement('div')
    root.id = 'reel-root'
    root.innerHTML = [
      '<canvas id="reel-canvas"></canvas>',
      '<div id="reel-tap-ring"></div>',
      '<div id="reel-tap"></div>',
      '<div id="reel-end">',
      '  <div id="reel-end-mark"></div>',
      '  <div id="reel-end-rule"></div>',
      '  <p id="reel-end-tagline">Sabbia chiara<br>acqua cristallina</p>',
      '  <p id="reel-end-place">Santa Maria al Bagno · Nardò</p>',
      '  <span id="reel-end-site">bagnomaria.com</span>',
      '</div>',
    ].join('')
    document.body.appendChild(root)

    canvas = document.getElementById('reel-canvas')
    canvas.width = Math.round(W * opts.dpr)
    canvas.height = Math.round(H * opts.dpr)
    ctx = canvas.getContext('2d')
    tapEl = document.getElementById('reel-tap')
    ringEl = document.getElementById('reel-tap-ring')
    endEl = document.getElementById('reel-end')

    /* la scritta del cartello finale è il marchio vero del sito */
    const mark = document.querySelector('.hero-wordmark svg')
    if (mark) {
      const clone = mark.cloneNode(true)
      document.getElementById('reel-end-mark').appendChild(clone)
      /* il tratto va spesso quanto la griglia del marchio, non in pixel:
         il viewBox del logo è alto qualche migliaio di unità */
      const vb = (clone.viewBox && clone.viewBox.baseVal.width) || 4905
      markPaths = Array.from(clone.querySelectorAll('path'))
      markPaths.forEach((p) => {
        const len = p.getTotalLength ? p.getTotalLength() : 0
        markLengths.push(len)
        p.style.fill = '#ffffff'
        p.style.stroke = '#ffffff'
        p.style.strokeWidth = String(vb / 120)
        p.style.strokeDasharray = String(len)
        p.style.strokeDashoffset = String(len)
        p.style.fillOpacity = '0'
      })
    }

    /* l'hero mostra i fotogrammi del video vero al posto del poster fisso */
    const poster = document.querySelector('.hero-stage .hero-video')
    if (poster) {
      heroImg = document.createElement('img')
      heroImg.className = 'hero-video'
      heroImg.id = 'reel-hero-img'
      poster.replaceWith(heroImg)
    }

    for (const el of document.querySelectorAll('#reel-end > *')) {
      if (el.id !== 'reel-end-mark' && el.id !== 'reel-end-rule') el.style.opacity = '0'
    }
  }

  window.__reel = { init, frame, T }
})()
