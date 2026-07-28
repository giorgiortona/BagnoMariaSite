import { useId } from 'react'

/* Elementi decorativi stilizzati — mare, sole, tramonto.
   Tutti aria-hidden e pointer-events:none: pura atmosfera. */

/* Sole a raggi usato come firma grafica nella sezione manifesto e nel menù. */
export function SunLines({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 420 420" aria-hidden="true">
      <circle cx="210" cy="210" r="92" />
      {Array.from({ length: 24 }, (_, index) => {
        const angle = index * 15
        return <path key={angle} d="M210 24v58" transform={`rotate(${angle} 210 210)`} />
      })}
    </svg>
  )
}

/* Sole line-art con raggi (ruota dolcemente allo scroll) */
export function SoleLineArt({ className = '' }) {
  return (
    <svg
      className={`decor decor-sole ${className}`}
      viewBox="0 0 300 300"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="150" cy="150" r="70" stroke="currentColor" strokeWidth="1.5" />
      <g data-spin style={{ transformOrigin: '150px 150px' }} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M150 40v-22" />
        <path d="M150 282v-22" />
        <path d="M40 150H18" />
        <path d="M282 150h-22" />
        <path d="M72 72L57 57" />
        <path d="M243 243l-15-15" />
        <path d="M228 72l15-15" />
        <path d="M57 243l15-15" />
      </g>
    </svg>
  )
}

/* Tramonto: disco caldo che scende dietro le onde (scrub allo scroll) */
export function Tramonto({ className = '' }) {
  return (
    <svg
      className={`decor decor-tramonto ${className}`}
      viewBox="0 0 260 180"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dec-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#9EDDF2" />
        </linearGradient>
        <clipPath id="dec-orizzonte">
          <rect x="0" y="0" width="260" height="118" />
        </clipPath>
      </defs>
      <g clipPath="url(#dec-orizzonte)">
        <circle className="sun-disc" cx="130" cy="78" r="42" fill="url(#dec-sun)" opacity="0.9" />
      </g>
      <g stroke="#7CC0E4" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M14 122c14-10 28-10 42 0s28 10 42 0 28-10 42 0 28 10 42 0 28-10 42 0" />
        <path d="M40 146c14-10 28-10 42 0s28 10 42 0 28-10 42 0 28 10 42 0" opacity="0.55" />
        <path d="M66 168c14-9 28-9 42 0s28 9 42 0 28-9 42 0" opacity="0.3" />
      </g>
    </svg>
  )
}

/* Gabbiani — piccoli archi in volo */
export function Gabbiani({ className = '' }) {
  return (
    <svg
      className={`decor decor-gabbiani ${className}`}
      viewBox="0 0 220 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path data-drift d="M30 46c8-9 18-9 24 0 6-9 16-9 24 0" />
      <path data-drift data-drift-delay="0.6" d="M120 26c6-7 14-7 19 0 5-7 13-7 19 0" opacity="0.75" />
      <path data-drift data-drift-delay="1.1" d="M156 84c5-6 12-6 16 0 4-6 11-6 16 0" opacity="0.5" />
    </svg>
  )
}

/* Barca a vela che attraversa la sezione allo scroll */
export function Barca({ className = '' }) {
  return (
    <svg
      className={`decor decor-barca ${className}`}
      viewBox="0 0 120 110"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* la vela grande prende in pieno la luce bassa: oro → corallo */}
        <linearGradient id="bm-vela-maestra" x1="62" y1="16" x2="90" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBDD8C" />
          <stop offset="0.45" stopColor="#F6C244" />
          <stop offset="1" stopColor="#EE8A5E" />
        </linearGradient>
        {/* il fiocco resta chiaro, ma scaldato di pesca verso il basso */}
        <linearGradient id="bm-fiocco" x1="55" y1="26" x2="36" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF7EC" />
          <stop offset="1" stopColor="#F7C9A4" />
        </linearGradient>
        {/* lo scafo tiene il blu del mare */}
        <linearGradient id="bm-scafo" x1="32" y1="84" x2="86" y2="101" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2E7DA6" />
          <stop offset="1" stopColor="#1B5678" />
        </linearGradient>
      </defs>

      <g strokeLinecap="round" strokeLinejoin="round">
        {/* albero di legno caldo */}
        <path d="M60 12v66" stroke="#C07A4C" strokeWidth="2" />
        <path d="M60 16c22 8 30 34 28 56H60z" fill="url(#bm-vela-maestra)" />
        <path d="M55 26c-16 9-22 32-21 46h21z" fill="url(#bm-fiocco)" stroke="#EAA478" strokeWidth="1.2" />
        <path d="M30 84h60l-10 16H42z" fill="url(#bm-scafo)" />
        {/* il tramonto che si posa sul bordo dello scafo */}
        <path d="M31 84h58" stroke="#F6C244" strokeWidth="2.2" opacity="0.95" />
        <path d="M14 104c10-7 20-7 30 0s20 7 30 0 20-7 30 0" stroke="#7CC0E4" strokeWidth="2" fill="none" />
      </g>
    </svg>
  )
}

/* Onda ripetuta usata dagli strati del mare stilizzato */
function OndaPath({ y = 60, amp = 34, fill }) {
  /* una sinusoide morbida che si ripete ogni 360px, larga 2880px */
  let d = `M0 ${y}`
  for (let x = 0; x < 2880; x += 360) {
    d += ` q 90 ${-amp} 180 0 t 180 0`
  }
  d += ' V 200 H 0 Z'
  return <path d={d} fill={fill} />
}

/* Gli stessi quattro strati d'acqua vengono riutilizzati anche nel tramonto
   del menù, così le due scene marine appartengono allo stesso paesaggio. */
const SEA_LAYERS = [
  { fill: '#F6E2D2', y: 46, amp: 26, height: '92%', speed: -5 },
  { fill: '#CFE6F2', y: 52, amp: 32, height: '72%', speed: 7 },
  { fill: '#7CC0E4', y: 58, amp: 36, height: '52%', speed: -9 },
  { fill: '#2E7DA6', y: 64, amp: 30, height: '34%', speed: 12 },
]

export function SeaLayers({ className = 'wave-layer' }) {
  return SEA_LAYERS.map((layer) => (
    <svg
      key={layer.fill}
      className={className}
      style={{ height: layer.height }}
      data-speed={layer.speed}
      viewBox="0 0 2880 200"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <OndaPath y={layer.y} amp={layer.amp} fill={layer.fill} />
    </svg>
  ))
}

/* Mare stilizzato di sfondo: strati d'onda che scorrono con lo scroll,
   sole caldo e barca a vela che attraversa la scena. */
export function MareScena() {
  return (
    <section className="mare-scena" aria-hidden="true">
      <div className="mare-sole" data-sole-parallax />
      <Barca className="mare-barca" />
      <SeaLayers />
    </section>
  )
}

/* Alone morbido color tramonto per dare corpo agli sfondi bianchi */
export function Alone({ className = '', tinta = 'oro' }) {
  return <div className={`decor decor-alone alone-${tinta} ${className}`} aria-hidden="true" />
}

/* Nastro con motivo a Greca che scorre all'infinito */
export function GrecaBorder({ className = '' }) {
  const patternId = useId().replace(/:/g, '')
  return (
    <div className={`greca-wrapper ${className}`} aria-hidden="true">
      <div className="greca-track">
        <svg width="200%" height="40" className="greca-svg">
          <defs>
            <pattern id={patternId} x="0" y="0" width="60" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M 0 30 H 20 V 10 H 50 V 20 H 40 V 30 H 60" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinejoin="miter" 
                strokeLinecap="square" 
              />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="40" fill={`url(#${patternId})`} />
        </svg>
      </div>
    </div>
  )
}

/* Nastro con motivo a Onde e punti (ispirato ai motivi classici marini) */
export function WaveBorder({ className = '' }) {
  const patternId = useId().replace(/:/g, '')
  return (
    <div className={`greca-wrapper ${className}`} aria-hidden="true">
      <div className="greca-track">
        <svg width="200%" height="40" className="greca-svg wave-svg">
          <defs>
            <pattern id={patternId} x="0" y="0" width="80" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M 0 25 C 25 25, 25 5, 40 5 C 55 5, 55 25, 80 25" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
              <circle cx="20" cy="12" r="4" fill="currentColor" />
              <circle cx="60" cy="12" r="4" fill="currentColor" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="40" fill={`url(#${patternId})`} />
        </svg>
      </div>
    </div>
  )
}
