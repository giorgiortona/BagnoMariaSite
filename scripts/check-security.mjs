import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const [html, vercelSource] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
])

const vercel = JSON.parse(vercelSource)
const csp = vercel.headers
  ?.flatMap((rule) => rule.headers || [])
  .find((header) => header.key.toLowerCase() === 'content-security-policy')
  ?.value

if (!csp) throw new Error('Content-Security-Policy assente da vercel.json')

const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
if (!jsonLd) throw new Error('Blocco JSON-LD assente da index.html')

const hash = `sha256-${createHash('sha256').update(jsonLd).digest('base64')}`
if (!csp.includes(`'${hash}'`)) {
  throw new Error(`Hash CSP del JSON-LD non aggiornato. Inserire '${hash}' in script-src.`)
}

const direttiveObbligatorie = [
  "default-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  'https://new-widget.spiagge.it',
]

for (const direttiva of direttiveObbligatorie) {
  if (!csp.includes(direttiva)) throw new Error(`Direttiva CSP mancante: ${direttiva}`)
}

console.log('Configurazione di sicurezza valida.')
