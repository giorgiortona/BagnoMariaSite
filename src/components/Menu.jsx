import { useEffect, useRef, useState } from 'react'
import { LogoWordmark } from './Logo.jsx'
import { GrecaBorder, SeaLayers, SunLines, WaveBorder } from './Decor.jsx'
import Preloader from './Preloader.jsx'

/* ─── Dati menù Bagno Maria (unito con ingredienti) ─── */
const MENU_DATA = [
  {
    categoria: 'Caffetteria',
    piatti: [
      { nome: 'Caffè espresso', prezzo: '1.30' },
      { nome: 'Cappuccino', prezzo: '1.80' },
      { nome: 'Espressino', prezzo: '1.50' },
      { nome: 'Caffè Americano', prezzo: '1.80' },
      { nome: 'Caffè Decaffeinato', prezzo: '1.50' },
      { nome: 'Caffè in ghiaccio', prezzo: '2.00' },
      { nome: 'Caffè Leccese', desc: 'in ghiaccio, latte di mandorla', prezzo: '2.00' },
      { nome: 'Caffè d\'orzo', prezzo: '1.50' },
      { nome: 'Ginseng dolce o amaro', prezzo: '1.80' },
      { nome: 'Crema caffè', desc: 'Grande 3.00 · Piccola 2.00', prezzo: '' },
      { nome: 'Caffè shakerato', prezzo: '2.50' },
      { nome: 'Latte macchiato', prezzo: '1.80' },
    ],
  },
  {
    categoria: 'Colazione e Frutta',
    piatti: [
      { nome: 'Cornetto vuoto vegano', prezzo: '1.80', desc: 'Farciture: Crema pasticcera (no lattosio) · Nocciolata · Frutti di bosco · Albicocca · Pistacchio', tag: 'vegan' },
      { nome: 'Pasticciotto alla crema', desc: 'Grande 2.00 · Piccolo 1.50', prezzo: '' },
      { nome: 'Ciambella al cioccolato', prezzo: '2.00' },
      { nome: 'Bicchiere mix di frutta fresca', prezzo: '3.00' },
      { nome: 'Bowl mix di frutta fresca', prezzo: '5.00' },
    ],
  },
  {
    categoria: 'Aperitivo',
    piatti: [
      { nome: 'Frittino misto', desc: '6 pezzi', prezzo: '3.00' },
      { nome: 'Puccette miste', desc: '4 pezzi', prezzo: '3.00' },
      { nome: 'Tris', desc: 'Taralli, arachidi e olive', prezzo: '3.00' },
      { nome: 'Pizzetta rossa', prezzo: '1.20' },
      { nome: 'Wrustel di pane', prezzo: '1.20' },
      { nome: 'Focaccia barese', prezzo: '2.50' },
      { nome: 'Rustico Salentino', prezzo: '2.50' },
      { nome: 'Calzone fritto', prezzo: '2.50' },
    ],
  },
  {
    categoria: 'Le Frise',
    piatti: [
      { nome: 'La Leccese', desc: 'Pomodorini gialli e rossi, rucola, origano, olio EVO, sale', tag: 'vegan', prezzo: '6.00' },
      { nome: 'La Campagnola', desc: 'Pomodorini, mozzarella, rucola, origano, cipolla croccante, olio EVO, sale', prezzo: '6.00' },
      { nome: 'Ortoviola', desc: 'Pomodorini, avocado, cavolo rosso e basilico', tag: 'vegan', prezzo: '6.00' },
      { nome: 'La Tonnata', desc: 'Pomodorini, tonno, olive nere, grana a scaglie, grattugiata di limone, fiore di cappero, olio EVO', prezzo: '7.00' },
      { nome: 'Fumè', desc: 'Pomodorini, stracciatella, salmone affumicato, pesto di basilico, olio EVO, limone', prezzo: '8.00' },
      { nome: 'Alicrunch', desc: 'Pomodorini gialli, alici, olive nere, cipolla rossa, olio EVO, tarallo sbriciolato', prezzo: '8.00' },
    ],
  },
  {
    categoria: 'I Crostoni',
    piatti: [
      { nome: 'Rustichella', desc: 'Pomodori, basilico, sale e olio EVO', tag: 'vegan', prezzo: '6.00' },
      { nome: 'Del Verde', desc: 'Pesto di basilico, mozzarella, pomodori secchi, speck', prezzo: '7.00' },
      { nome: 'Marinaro', desc: 'Formaggio spalmabile, alici, rucola, dressing olio', prezzo: '7.00' },
      { nome: 'Cremoso', desc: 'Formaggio spalmabile, avocado, pomodori secchi', tag: 'vegetarian', prezzo: '7.00' },
      { nome: 'Grecale', desc: 'Feta, pomodori, patè di olive nere, prosciutto crudo, origano, olio', prezzo: '8.00' },
    ],
  },
  {
    categoria: 'Le Piadine',
    piatti: [
      { nome: 'La Cruda', desc: 'Mozzarella, prosciutto crudo, lattuga, pomodoro', prezzo: '6.50' },
      { nome: 'La Spianata', desc: 'Spianata piccante, rucola, provola dolce, cavolo rosso, pomodori secchi', prezzo: '6.50' },
      { nome: 'Punta Secca', desc: 'Bresaola, rucola, Parmigiano Reggiano, pomodoro, limone, glassa aceto balsamico', prezzo: '7.00' },
      { nome: 'L\'Ortolana', desc: 'Avocado, zucchine condite, lattuga, pomodoro, crema di patate', tag: 'vegetarian', prezzo: '7.00' },
      { nome: 'Melanzina', desc: 'Mozzarella, lattuga, pomodoro, melanzane condite', tag: 'vegetarian', prezzo: '7.00' },
      { nome: 'Salmò', desc: 'Avocado, Philadelphia, salmone, lattuga', prezzo: '7.50' },
    ],
  },
  {
    categoria: 'I Panini',
    piatti: [
      { nome: 'N1', desc: 'Ciabatta, pomodoro, prosciutto crudo, mozzarella, olio EVO', prezzo: '6.00' },
      { nome: 'N2', desc: 'Ciabatta, tonno, provola dolce, capperi', prezzo: '6.00' },
      { nome: 'N3', desc: 'Ciabatta, bresaola, Philadelphia, pomodori secchi e rucola', prezzo: '6.00' },
      { nome: 'N4', desc: 'Puccia, spianata piccante, provola dolce, pomodori secchi, olio', prezzo: '6.00' },
      { nome: 'N5', desc: 'Puccia, mortadella, stracciatella, pesto di pistacchio', prezzo: '7.00' },
      { nome: 'N6', desc: 'Puccia, crema di radicchio, prosciutto cotto, mozzarella, pomodorini, zucchine secche sott\'olio', prezzo: '6.50' },
      { nome: 'N7', desc: 'Puccia, speck, provola dolce, rucola, tarallo sbriciolato, olio EVO', prezzo: '6.00' },
      { nome: 'N8', desc: 'Pane multicereali, alici, stracciatella, rucola, pomodorini gialli, olio EVO', prezzo: '8.00' },
      { nome: 'N9', desc: 'Pane multicereali, salmone affumicato, stracciatella, rucola, tarallo sbriciolato, pepe rosa, olio EVO', prezzo: '8.00' },
      { nome: 'N10', desc: 'Ciabatta cruda, rucola, grana e lime', tag: 'vegetarian', prezzo: '6.00' },
      { nome: 'N11', desc: 'Panino, pomodoro, mozzarella e origano', tag: 'vegetarian', prezzo: '6.00' },
      { nome: 'N12', desc: 'Puccia, insalata, zucchine condite, pomodori secchi e rucola', tag: 'vegan', prezzo: '6.00' },
    ],
  },
  {
    categoria: 'Le Insalate',
    piatti: [
      { nome: 'Pinolissima', desc: 'Iceberg, tonno, pomodorini, grana, pinoli, rucola', prezzo: '8.00' },
      { nome: 'Caesar Beach', desc: 'Iceberg, radicchio, crudo, grana, salsa caesar, scaglie grana', prezzo: '8.00' },
      { nome: 'Tarallina', desc: 'Iceberg, rucola, pomodorini gialli, tarallo sbriciolato, tonno, olive nere, limone grattugiato', prezzo: '8.00' },
      { nome: 'Mediterranea', desc: 'Iceberg, feta, pomodori, olive nere, rucola, julienne di carota e peperone, olio EVO', tag: 'vegetarian', prezzo: '8.00' },
      { nome: 'Mix Orto', desc: 'Iceberg, cavolo rosso, pomodori, mais, pinoli e dressing glassa di aceto balsamico', tag: 'vegan', prezzo: '8.00' },
      { nome: 'Bosco Rosso', desc: 'Cavolo rosso, feta, speck a cubetti, noci, dressing glassa aceto balsamico', prezzo: '9.00' },
      { nome: 'Nordica', desc: 'Iceberg, salmone affumicato, stracciatella, tarallo sbriciolato, olive nere, pomodoro giallo', prezzo: '9.00' },
      { nome: 'Insalata di mare', desc: 'Insalata di mare, sedano, carota, prezzemolo tritato, succo di limone, olio EVO', prezzo: '9.00' },
      { nome: 'Avonoci', desc: 'Iceberg, avocado, pomodori secchi, noci, feta, salsa caesar', tag: 'vegetarian', prezzo: '9.00' },
      { nome: 'Insalata di farro', desc: 'Farro cotto a vapore, olio EVO e rucola fresca (componibile con ingredienti da menù, max 5 a scelta)', tag: 'vegan', prezzo: '9.00' },
    ],
  },
  {
    categoria: 'I Primi Piatti',
    nota: 'Primi piatti pre-cotti e surgelati',
    piatti: [
      { nome: 'Lasagna alla bolognese', prezzo: '8.00' },
      { nome: 'Mezze penne al pomodoro', prezzo: '8.00' },
      { nome: 'Tagliata di pollo con orzo e verdure', prezzo: '8.00' },
      { nome: 'Paccheri al ragù di seppia', prezzo: '10.00' },
      { nome: 'Risotto alla marinara', prezzo: '10.00' },
    ],
  },
  {
    categoria: 'Beverage',
    piatti: [
      { nome: 'Acqua naturale', prezzo: '1.00' },
      { nome: 'Acqua frizzante', prezzo: '1.00' },
      { nome: 'CocaCola / CocaCola zero', prezzo: '2.50' },
      { nome: 'Fanta', prezzo: '2.50' },
      { nome: 'Lemonsoda', prezzo: '2.50' },
      { nome: 'Schweppes Tonica / Lemon', prezzo: '2.50' },
      { nome: 'Cocktail San Pellegrino', prezzo: '2.50' },
      { nome: 'Crodino', prezzo: '2.50' },
      { nome: 'Succo di frutta', prezzo: '2.50' },
      { nome: 'Estathé Pesca / Limone', prezzo: '3.00' },
      { nome: 'Cedrata Tassoni', prezzo: '3.00' },
      { nome: 'RedBull', prezzo: '3.50' },
      { nome: 'Campari Soda', prezzo: '3.50' },
    ],
  },
  {
    categoria: 'Birre in bottiglia 33cl',
    piatti: [
      { nome: 'Stella Artois', prezzo: '3.00' },
      { nome: 'Beck\'s', prezzo: '3.00' },
      { nome: 'Corona', prezzo: '4.00' },
      { nome: 'Corona Zero', prezzo: '4.00' },
      { nome: 'Estrella Galicia Gluten Free', prezzo: '4.00' },
      { nome: 'Ichnusa non filtrata', prezzo: '4.00' },
      { nome: 'Menabrea', prezzo: '4.00' },
      { nome: 'Ceres', prezzo: '4.00' },
      { nome: 'IPA Vertiga Bali', prezzo: '6.00' },
    ],
  },
  {
    categoria: 'Vino, Prosecco e Champagne',
    piatti: [
      { nome: 'Bottiglia di vino', desc: 'selezione salentina · rosato e bianco', prezzo: '20.00' },
      { nome: 'Calafuria', prezzo: '25.00' },
      { nome: 'Bollicine', prezzo: '18.00' },
      { nome: 'Prosecco DOCG Millesimato', prezzo: '25.00' },
      { nome: 'Moët & Chandon Champagne', desc: 'Brut Impérial', prezzo: '100.00' },
      { nome: 'Cicchetto', prezzo: '3.00' },
      { nome: 'Amaro', prezzo: '4.00' },
      { nome: 'Grappa bianca e barricata', prezzo: '4.00' },
    ],
  },
  {
    categoria: 'Drink',
    piatti: [
      { nome: 'Gin Tonic', prezzo: '6.00' },
      { nome: 'Gin Lemon', prezzo: '6.00' },
      { nome: 'Aperol Spritz', prezzo: '6.00' },
      { nome: 'Campari Spritz', prezzo: '6.00' },
      { nome: 'Vodka Tonic', prezzo: '6.00' },
      { nome: 'Vodka Lemon', prezzo: '6.00' },
      { nome: 'Hugo Spritz', prezzo: '7.00' },
      { nome: 'Gin Fizz', prezzo: '7.00' },
      { nome: 'Negroni', prezzo: '7.00' },
      { nome: 'Moscow Mule', prezzo: '7.00' },
      { nome: 'London Mule', prezzo: '7.00' },
      { nome: 'Mexican Mule', prezzo: '7.00' },
      { nome: 'Americano', prezzo: '7.00' },
      { nome: 'Cuba Libre', prezzo: '7.00' },
      { nome: 'Long Island', prezzo: '7.00' },
      { nome: 'Piña Colada', prezzo: '7.00' },
      { nome: 'Margarita', prezzo: '7.00' },
      { nome: 'Tequila Sunrise', prezzo: '7.00' },
      { nome: 'Sex on the Beach', prezzo: '7.00' },
    ],
  },
  {
    categoria: 'I Pestati',
    piatti: [
      { nome: 'Mojito', prezzo: '8.00' },
      { nome: 'Capiroska', prezzo: '8.00' },
      { nome: 'Fragoloska', prezzo: '8.00' },
      { nome: 'Caipirinha', prezzo: '8.00' },
    ],
  },
  {
    categoria: 'Selezione Gin e Vodka Premium',
    piatti: [
      { nome: 'Bombay', prezzo: '7.00' },
      { nome: 'Gin Mare', prezzo: '8.00' },
      { nome: 'Malfy Original', prezzo: '8.00' },
      { nome: 'Malfy Pink', prezzo: '8.00' },
      { nome: 'Malfy Lemon', prezzo: '8.00' },
      { nome: 'Malfy Orange', prezzo: '8.00' },
      { nome: 'Hendrick\'s', prezzo: '8.00' },
      { nome: 'Bulldog', prezzo: '8.00' },
      { nome: 'Bobby\'s', prezzo: '8.00' },
      { nome: 'Sacàra', prezzo: '8.00' },
      { nome: 'Del Professore', prezzo: '8.00' },
      { nome: 'ExtraverGin', prezzo: '8.00' },
      { nome: 'Tanqueray N°10', prezzo: '8.00' },
      { nome: 'Nordés', prezzo: '8.00' },
      { nome: 'Citadelle', prezzo: '8.00' },
      { nome: 'J Rose', prezzo: '9.00' },
      { nome: 'Monkey', prezzo: '9.00' },
      { nome: 'Engine', prezzo: '9.00' },
      { nome: 'Portofino', prezzo: '10.00' },
      { nome: 'Sky', prezzo: '8.00' },
      { nome: 'Belvedere', prezzo: '9.00' },
    ],
  },
]

const DIET_LABELS = {
  vegetarian: 'Vegetariano',
  vegan: 'Vegano',
}

const DIET_ICONS = {
  vegetarian: '/icons/diet-vegetarian.png',
  vegan: '/icons/diet-vegan.png',
}

const SUNSET_STOPS = [
  { at: 0, color: [7, 84, 125] },
  { at: 0.35, color: [246, 194, 68] },
  { at: 0.72, color: [238, 138, 94] },
  { at: 1, color: [205, 67, 61] },
]

function getSunsetColor(progress) {
  const upperIndex = SUNSET_STOPS.findIndex((stop) => stop.at >= progress)
  if (upperIndex <= 0) return SUNSET_STOPS[0].color

  const lower = SUNSET_STOPS[upperIndex - 1]
  const upper = SUNSET_STOPS[upperIndex]
  const localProgress = (progress - lower.at) / (upper.at - lower.at)

  return lower.color.map((channel, index) => (
    Math.round(channel + ((upper.color[index] - channel) * localProgress))
  ))
}

function DietIcon({ type }) {
  const label = DIET_LABELS[type]

  return (
    <span
      className={`menu-diet-icon menu-diet-icon-${type}`}
      role="img"
      aria-label={label}
      title={label}
    >
      <img src={DIET_ICONS[type]} alt="" aria-hidden="true" />
    </span>
  )
}

/* ─── Componente riga menù ─── */
function MenuItem({ nome, desc, prezzo, tag }) {
  return (
    <div className="menu-item">
      <div className="menu-item-left">
        <span className="menu-item-nome">
          {nome}
          {tag && <DietIcon type={tag} />}
        </span>
        {desc && <span className="menu-item-desc">{desc}</span>}
      </div>
      {prezzo && (
        <>
          <span className="menu-item-dots" aria-hidden="true" />
          <span className="menu-item-prezzo">€ {prezzo}</span>
        </>
      )}
    </div>
  )
}

/* ─── Sezione con categorie ─── */
function MenuCategoria({ categoria, piatti, nota }) {
  return (
    <div className="menu-cat">
      <h3 className="menu-cat-title">{categoria}</h3>
      {nota && <p className="menu-cat-nota">{nota}</p>}
      <div className="menu-cat-items">
        {piatti.map((p, i) => (
          <MenuItem key={`${p.nome}-${i}`} {...p} />
        ))}
      </div>
    </div>
  )
}

/* ─── Interfaccia Menù a tutto schermo ─── */
export default function Menu() {
  const [aperto, setAperto] = useState(false)
  const [session, setSession] = useState(0) // Usato per re-triggerare il preloader
  const pageRef = useRef(null)

  useEffect(() => {
    const checkHash = () => {
      const isMenu = window.location.hash === '#menu'
      setAperto((prev) => {
        // Se si sta aprendo, incrementa session per re-triggerare il preloader
        if (!prev && isMenu) setSession(s => s + 1)
        return isMenu
      })
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  useEffect(() => {
    if (aperto) {
      document.body.style.overflow = 'hidden'
      const onKey = (e) => { if (e.key === 'Escape') chiudi() }
      window.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', onKey)
      }
    }
  }, [aperto])

  useEffect(() => {
    if (!aperto || !pageRef.current) return undefined

    const page = pageRef.current
    let frame = 0
    let active = true

    const updateSun = () => {
      frame = 0

      const emblem = page.querySelector('.menu-page-emblem-identity')
      const horizon = page.querySelector('.menu-page-sea-horizon')
      if (!emblem || !horizon) return

      const maxScroll = Math.max(1, page.scrollHeight - page.clientHeight)
      const progress = Math.min(1, Math.max(0, page.scrollTop / maxScroll))
      const pageRect = page.getBoundingClientRect()
      const emblemRect = emblem.getBoundingClientRect()
      const horizonRect = horizon.getBoundingClientRect()
      const emblemCenterAtTop = emblemRect.top - pageRect.top + page.scrollTop + (emblemRect.height / 2)
      const horizonAtEnd = horizonRect.top - pageRect.top + page.scrollTop - maxScroll
      const sunY = emblemCenterAtTop + ((horizonAtEnd - emblemCenterAtTop) * progress)
      const compact = page.clientWidth <= 880
      const sunsetProgress = Math.min(1, Math.max(0, (progress - 0.82) / 0.18))
      const [red, green, blue] = getSunsetColor(sunsetProgress)

      page.style.setProperty('--menu-sun-y', `${sunY}px`)
      page.style.setProperty('--menu-sun-opacity', String((compact ? 0.12 : 0.2) + (progress * (compact ? 0.08 : 0.12))))
      page.style.setProperty('--menu-sun-rotation', `${progress * 36}deg`)
      page.style.setProperty('--menu-sun-color', `rgb(${red} ${green} ${blue})`)
      page.style.setProperty('--menu-sun-fill', `rgb(246 194 68 / ${sunsetProgress * 0.18})`)
      page.style.setProperty('--menu-sun-glow', String(sunsetProgress * 0.62))
      page.style.setProperty('--menu-sunset-progress', String(sunsetProgress))
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateSun)
    }

    requestUpdate()
    page.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(requestUpdate)
      : null
    resizeObserver?.observe(page)
    document.fonts?.ready.then(() => { if (active) requestUpdate() })

    return () => {
      active = false
      page.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      resizeObserver?.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [aperto])

  const chiudi = () => {
    window.location.hash = '#bar'
  }

  if (!aperto) return null

  return (
    <div
      ref={pageRef}
      className="menu-page"
      role="dialog"
      aria-modal="true"
      aria-label="Menù completo Bagno Maria"
      data-lenis-prevent
    >
      {/* Mostra il preloader all'apertura, usando session come key per rimontarlo */}
      <Preloader key={session} onDone={() => {}} />

      <div className="menu-page-backdrop" aria-hidden="true">
        <SunLines className="menu-page-travelling-sun" />
        <span className="menu-page-side-pattern menu-page-side-pattern-left" />
        <span className="menu-page-side-pattern menu-page-side-pattern-right" />
      </div>

      <header className="menu-page-header">
        <GrecaBorder className="site-greca menu-page-greca" />
        <div className="menu-page-header-inner">
          <div className="menu-page-emblem" aria-hidden="true">
            <span className="menu-page-emblem-line menu-page-emblem-line-left" />
            <span className="menu-page-emblem-identity">
              <LogoWordmark className="menu-page-emblem-wordmark" label="" />
            </span>
            <span className="menu-page-emblem-line menu-page-emblem-line-right" />
          </div>
        </div>
        <WaveBorder className="site-greca menu-page-header-wave" />
      </header>

      <div className="menu-page-content">
        <div className="menu-page-content-inner">
          <div className="menu-diet-legend" aria-label="Legenda alimentare">
            {Object.entries(DIET_LABELS).map(([type, label]) => (
              <span className="menu-diet-legend-item" key={type}>
                <DietIcon type={type} />
                {type === 'vegetarian' && <span>{label}</span>}
              </span>
            ))}
          </div>
          {MENU_DATA.map((cat, i) => (
            <MenuCategoria key={`${cat.categoria}-${i}`} {...cat} />
          ))}
        </div>
      </div>

      <div className="menu-page-footer">
        <div className="menu-page-sea" aria-hidden="true">
          <span className="menu-page-sea-horizon" />
          <SeaLayers className="menu-page-sea-wave-layer" />
        </div>
      </div>
    </div>
  )
}
