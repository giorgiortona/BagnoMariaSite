import { useEffect, useMemo, useState } from 'react'
import { LogoMark } from './Logo.jsx'

const MESI = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]
const GIORNI = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do']

/* Booking engine ufficiale di spiagge.it, incorporabile via iframe:
   https://www.spiagge.it/developers-booking-engine-embed/

   Il codice licenza è `it-le-73050-bagnomaria` (73050 è il CAP di Santa
   Maria al Bagno) — si legge nel campo "license" della scheda ufficiale
   del lido su spiagge.it. Non va confuso con il 10119 dell'indirizzo
   pubblico, che è l'id della pagina: con quello il widget risponde
   "le prenotazioni online non sono ancora aperte".

   Puntiamo direttamente a new-widget: il vecchio dominio reindirizza qui
   ma per strada perde le date che gli passiamo. */
const WIDGET_BASE =
  'https://new-widget.spiagge.it/stabilimenti-balneari/prenotazione/it-le-73050-bagnomaria'

function isoLocale(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const oggi = new Date()
oggi.setHours(0, 0, 0, 0)

function stessoGiorno(a, b) {
  return (
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatta(d) {
  return d
    ? d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })
    : null
}

function Calendario({ range, onSelect }) {
  const [vista, setVista] = useState(
    () => new Date(oggi.getFullYear(), oggi.getMonth(), 1)
  )

  const celle = useMemo(() => {
    const anno = vista.getFullYear()
    const mese = vista.getMonth()
    const primo = new Date(anno, mese, 1)
    const nGiorni = new Date(anno, mese + 1, 0).getDate()
    /* lunedì = prima colonna */
    const offset = (primo.getDay() + 6) % 7
    const out = []
    for (let i = 0; i < offset; i++) out.push(null)
    for (let g = 1; g <= nGiorni; g++) out.push(new Date(anno, mese, g))
    return out
  }, [vista])

  const { start, end } = range
  const inRange = (d) => start && end && d > start && d < end

  const meseCorrente =
    vista.getFullYear() === oggi.getFullYear() && vista.getMonth() === oggi.getMonth()

  return (
    <div className="cal" role="group" aria-label="Calendario per scegliere le date">
      <div className="cal-head">
        <button
          type="button"
          className="cal-nav"
          onClick={() => setVista(new Date(vista.getFullYear(), vista.getMonth() - 1, 1))}
          disabled={meseCorrente}
          aria-label="Mese precedente"
        >
          ←
        </button>
        <span className="cal-title">
          {MESI[vista.getMonth()]} <em>{vista.getFullYear()}</em>
        </span>
        <button
          type="button"
          className="cal-nav"
          onClick={() => setVista(new Date(vista.getFullYear(), vista.getMonth() + 1, 1))}
          aria-label="Mese successivo"
        >
          →
        </button>
      </div>

      <div className="cal-grid cal-week" aria-hidden="true">
        {GIORNI.map((g) => (
          <span key={g}>{g}</span>
        ))}
      </div>

      <div className="cal-grid">
        {celle.map((d, i) => {
          if (!d) return <span key={`v${i}`} />
          const passato = d < oggi
          const selStart = stessoGiorno(d, start)
          const selEnd = stessoGiorno(d, end)
          const dentro = inRange(d)
          return (
            <button
              type="button"
              key={d.toISOString()}
              className={[
                'cal-day',
                passato ? 'is-past' : '',
                selStart || selEnd ? 'is-selected' : '',
                dentro ? 'is-in-range' : '',
                stessoGiorno(d, oggi) ? 'is-today' : '',
              ].join(' ')}
              disabled={passato}
              onClick={() => onSelect(d)}
              aria-pressed={selStart || selEnd || dentro}
              aria-label={d.toLocaleDateString('it-IT', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BookingModal({ range, onClose }) {
  const [caricato, setCaricato] = useState(false)
  const { start, end } = range

  const url =
    `${WIDGET_BASE}?lang=it&ybnl=1` +
    `&startdate=${isoLocale(start)}&enddate=${isoLocale(end || start)}`

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="booking-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Prenotazione ombrellone su spiagge.it"
      data-lenis-prevent
    >
      <div className="booking-scrim" onClick={onClose} />
      <div className="booking-card">
        <header className="booking-head">
          <span className="booking-title">
            <LogoMark size={30} />
            <span>
              Prenota il tuo ombrellone
              <small>
                {formatta(start)}
                {end ? ` → ${formatta(end)}` : ''}
              </small>
            </span>
          </span>
          <button
            type="button"
            className="booking-close"
            onClick={onClose}
            aria-label="Chiudi la prenotazione"
          >
            ✕
          </button>
        </header>
        <div className="booking-body">
          {!caricato && (
            <p className="booking-loading script">stiamo aprendo la mappa della spiaggia&hellip;</p>
          )}
          <iframe
            src={url}
            title="Prenotazione ombrellone — spiagge.it"
            onLoad={() => setCaricato(true)}
            allow="payment"
          />
        </div>
      </div>
    </div>
  )
}

export default function Prenota() {
  const [range, setRange] = useState({ start: null, end: null })
  const [aperto, setAperto] = useState(false)

  const scegli = (d) => {
    const { start, end } = range
    if (!start || (start && end)) {
      setRange({ start: d, end: null })
    } else if (d < start) {
      setRange({ start: d, end: null })
    } else if (stessoGiorno(d, start)) {
      setRange({ start: null, end: null })
    } else {
      setRange({ start, end: d })
    }
  }

  const { start, end } = range
  const notti = start && end ? Math.round((end - start) / 86400000) : 0
  const giorni = start ? (end ? notti + 1 : 1) : 0

  const riepilogo = !start
    ? 'Scegli il giorno di arrivo — e, se resti di più, quello di partenza.'
    : end
      ? `Dal ${formatta(start)} al ${formatta(end)} · ${giorni} giorni di mare`
      : `${formatta(start)} · 1 giorno di mare`

  const oggetto = encodeURIComponent('Richiesta prenotazione ombrellone')
  const corpo = encodeURIComponent(
    start
      ? end
        ? `Buongiorno,\nvorrei prenotare un ombrellone dal ${formatta(start)} al ${formatta(end)} (${giorni} giorni).\nGrazie!`
        : `Buongiorno,\nvorrei prenotare un ombrellone per il giorno ${formatta(start)}.\nGrazie!`
      : 'Buongiorno,\nvorrei informazioni per prenotare un ombrellone.\nGrazie!'
  )

  return (
    <section className="prenota" id="prenota">
      <div className="prenota-orbit" aria-hidden="true"><span>sole · mare · relax · </span></div>
      <div className="section-shell prenota-grid">
        <div className="prenota-copy">
          <h2 data-reveal>Scegli i giorni.<br /><em>Il mare è già qui.</em></h2>

          <p className="prenota-riepilogo" data-reveal aria-live="polite">
            <span className="script">{riepilogo}</span>
          </p>

          <div className="prenota-cta" data-reveal>
            <button
              type="button"
              className={`button button-ink ${start ? '' : 'is-disabled'}`}
              aria-disabled={!start}
              onClick={() => { if (start) setAperto(true) }}
            >
              Scegli l&rsquo;ombrellone
              <span className="arrow" aria-hidden="true">→</span>
            </button>
            <a
              className="button button-outline-ink"
              href={`mailto:magefsunsrl@gmail.com?subject=${oggetto}&body=${corpo}`}
            >
              Richiedi via email
            </a>
          </div>
        </div>

        <div className="prenota-cal" data-reveal data-delay="0.1">
          <Calendario range={range} onSelect={scegli} />
        </div>
      </div>

      {aperto && start && (
        <BookingModal range={range} onClose={() => setAperto(false)} />
      )}
    </section>
  )
}
