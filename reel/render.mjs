/* Renderer del reel Bagnomaria.
 *
 * Pilota il sito vero in un Chrome headless e ne registra 25 secondi
 * fotogramma per fotogramma, aggiungendo sopra la regia di overlay.js.
 *
 * Il tempo non scorre da solo: ogni fotogramma viene composto, le transizioni
 * CSS vengono portate a mano all'istante giusto (Web Animations API) e solo
 * allora si scatta. Così il filmato è identico a ogni rilancio e non perde
 * fotogrammi, cosa che una cattura in tempo reale non garantisce.
 *
 * Uso:
 *   npm run dev                     (in un altro terminale, porta 5185)
 *   node reel/render.mjs
 *
 * Puppeteer non è una dipendenza del sito: passare la sua posizione con
 * NODE_PATH, oppure installarlo dove si preferisce.
 */

import { execFile, spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { promisify } from 'node:util'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

/* Puppeteer può stare fuori dal progetto: se non si risolve come modulo,
   si ripiega su PUPPETEER_PATH o su NODE_PATH (che vale solo per require). */
let puppeteer
try {
  puppeteer = (await import('puppeteer')).default
} catch {
  puppeteer = createRequire(import.meta.url)(process.env.PUPPETEER_PATH || 'puppeteer')
}

const run = promisify(execFile)
const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')

const SITE = process.env.SITE_URL || 'http://localhost:5185'
const FPS = 30
const DURATION = 28.7
const TOTAL = Number(process.env.REEL_FRAMES) || Math.round(FPS * DURATION)
const VIEW = { width: 450, height: 800, dpr: 2.4 }   // → 1080 x 1920
const HERO_PORT = 5199

const work = process.env.REEL_WORK || path.join(root, 'reel', '.cache')
const heroDir = path.join(work, 'hero')
const framesDir = path.join(work, 'frames')
const outFile = path.join(root, 'reel', 'out', 'reel-bagnomaria.mp4')

const log = (...a) => console.log('·', ...a)

/* ─── 1. fotogrammi del video dell'hero ──────────────────────────────────
   Il sito con `?static` mostra il poster fisso al posto del video. Per
   riavere il mare in movimento, ma restando deterministici, estraiamo i
   fotogrammi del video vero e li serviamo uno per fotogramma. */
async function extractHero() {
  await fs.mkdir(heroDir, { recursive: true })
  const already = (await fs.readdir(heroDir)).filter((f) => f.endsWith('.jpg'))
  if (already.length > 100) return already.length

  const src = path.join(root, 'public', 'media', 'mare-mobile.mp4')
  log('estrazione fotogrammi hero da', path.basename(src))
  await run('ffmpeg', [
    '-y', '-i', src,
    '-vf', `fps=${FPS},scale=1080:1920`,
    '-q:v', '3',
    path.join(heroDir, '%04d.jpg'),
  ], { maxBuffer: 1 << 26 })
  return (await fs.readdir(heroDir)).filter((f) => f.endsWith('.jpg')).length
}

/* piccolo server solo per quei fotogrammi */
function serveHero() {
  const server = createServer(async (req, res) => {
    const name = path.basename(req.url.split('?')[0])
    try {
      const buf = await fs.readFile(path.join(heroDir, name))
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'max-age=99999' })
      res.end(buf)
    } catch {
      res.writeHead(404).end()
    }
  })
  return new Promise((ok) => server.listen(HERO_PORT, '127.0.0.1', () => ok(server)))
}

/* ─── 2. registrazione ───────────────────────────────────────────────────── */
async function record(heroFrames) {
  await fs.rm(framesDir, { recursive: true, force: true })
  await fs.mkdir(framesDir, { recursive: true })

  const browser = await puppeteer.launch({
    headless: 'shell',
    args: [
      '--hide-scrollbars',
      '--force-color-profile=srgb',
      '--font-render-hinting=none',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-dev-shm-usage',
    ],
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: VIEW.width,
    height: VIEW.height,
    deviceScaleFactor: VIEW.dpr,
    isMobile: true,
    hasTouch: true,
  })

  log('apertura', SITE)
  await page.goto(`${SITE}/?static`, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForSelector('.hero-wordmark svg', { timeout: 30000 })

  /* aggiustamenti validi solo per la registrazione */
  await page.addStyleTag({
    content: `
      html { scroll-behavior: auto !important; }
      ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
      /* il pannello scende un filo più svelto dei 650ms del sito, ma resta
         leggibile: il gesto del tocco si deve vedere */
      .nav-panel { transition-duration: 520ms !important; }
    `,
  })
  await page.addStyleTag({ path: path.join(here, 'overlay.css') })
  await page.addScriptTag({ path: path.join(here, 'overlay.js') })

  /* Le transizioni CSS del sito vengono messe in pausa e portate a mano al
     tempo del fotogramma: senza questo, con lo scatto più lento del tempo
     reale, il pannello risulterebbe già aperto al fotogramma dopo il clic. */
  await page.evaluate(() => {
    window.__reelSync = (t) => {
      void document.body.offsetHeight
      for (const a of document.getAnimations()) {
        if (a.__t0 === undefined) { a.__t0 = t; try { a.pause() } catch {} }
        const timing = a.effect ? a.effect.getTiming() : {}
        const total = (Number(timing.delay) || 0) + (Number(timing.duration) || 0)
        const local = (t - a.__t0) * 1000
        try {
          if (local >= total) a.finish()
          else a.currentTime = local
        } catch {}
      }
    }
  })

  await page.evaluate(async (opts) => {
    /* i fotogrammi dell'hero entrano tutti in cache prima di partire, così
       nessuno scatto aspetta la rete */
    await Promise.all(
      Array.from({ length: opts.heroFrames }, (_, i) => new Promise((ok) => {
        const im = new Image()
        im.onload = ok
        im.onerror = ok
        im.src = `${opts.heroBase}${String(i + 1).padStart(4, '0')}.jpg`
      })),
    )
    await document.fonts.ready
    window.__reel.init(opts)
  }, { dpr: VIEW.dpr, heroBase: `http://127.0.0.1:${HERO_PORT}/`, heroFrames })

  log(`registrazione di ${TOTAL} fotogrammi`)
  for (let i = 0; i < TOTAL; i++) {
    const t = i / FPS
    await page.evaluate((tt) => { window.__reel.frame(tt); window.__reelSync(tt) }, t)
    await page.screenshot({
      path: path.join(framesDir, `${String(i).padStart(5, '0')}.jpg`),
      type: 'jpeg',
      quality: 96,
      optimizeForSpeed: true,
    })
    if (i % 50 === 0) log(`  ${i}/${TOTAL}  (${t.toFixed(1)}s)`)
  }

  await browser.close()
}

/* ─── 3. montaggio ───────────────────────────────────────────────────────── */
async function encode() {
  await fs.mkdir(path.dirname(outFile), { recursive: true })
  log('codifica', path.basename(outFile))
  await new Promise((ok, ko) => {
    const ff = spawn('ffmpeg', [
      '-y',
      '-framerate', String(FPS),
      '-i', path.join(framesDir, '%05d.jpg'),
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-profile:v', 'high',
      '-movflags', '+faststart',
      '-r', String(FPS),
      outFile,
    ], { stdio: ['ignore', 'ignore', 'inherit'] })
    ff.on('close', (code) => (code === 0 ? ok() : ko(new Error(`ffmpeg ${code}`))))
  })
}

/* ─── main ───────────────────────────────────────────────────────────────── */
const heroFrames = await extractHero()
log(`${heroFrames} fotogrammi hero pronti`)
const server = await serveHero()
try {
  await record(heroFrames)
  await encode()
} finally {
  server.close()
}
log('fatto →', path.relative(root, outFile))
if (!existsSync(outFile)) process.exitCode = 1
