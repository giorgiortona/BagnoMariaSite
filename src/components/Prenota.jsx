import { useEffect, useMemo, useState } from 'react'
import { LogoMark } from './Logo.jsx'
import { useLanguage } from '../i18n.jsx'

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

function formatta(d, locale) {
  return d
    ? d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long' })
    : null
}

function nomeMese(d, locale) {
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(d)
  return month.charAt(0).toLocaleUpperCase(locale) + month.slice(1)
}

function Calendario({ range, onSelect, copy, locale }) {
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
    <div className="cal" role="group" aria-label={copy.booking.calendar}>
      <div className="cal-head">
        <button
          type="button"
          className="cal-nav"
          onClick={() => setVista(new Date(vista.getFullYear(), vista.getMonth() - 1, 1))}
          disabled={meseCorrente}
          aria-label={copy.booking.previous}
        >
          ←
        </button>
        <span className="cal-title">
          {nomeMese(vista, locale)} <em>{vista.getFullYear()}</em>
        </span>
        <button
          type="button"
          className="cal-nav"
          onClick={() => setVista(new Date(vista.getFullYear(), vista.getMonth() + 1, 1))}
          aria-label={copy.booking.next}
        >
          →
        </button>
      </div>

      <div className="cal-grid cal-week" aria-hidden="true">
        {copy.booking.weekdays.map((g) => (
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
              aria-label={d.toLocaleDateString(locale, {
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

function BookingModal({ range, onClose, copy, locale }) {
  const [caricato, setCaricato] = useState(false)
  const { start, end } = range

  const url =
    `${WIDGET_BASE}?lang=${copy.bookingLanguage}&ybnl=1` +
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
      aria-label={copy.booking.modalLabel}
      data-lenis-prevent
    >
      <div className="booking-scrim" onClick={onClose} />
      <div className="booking-card">
        <header className="booking-head">
          <span className="booking-title">
            <LogoMark size={30} />
            <span>
              {copy.booking.modalTitle}
              <small>
                {formatta(start, locale)}
                {end ? ` → ${formatta(end, locale)}` : ''}
              </small>
            </span>
          </span>
          <button
            type="button"
            className="booking-close"
            onClick={onClose}
            aria-label={copy.booking.close}
          >
            ✕
          </button>
        </header>
        <div className="booking-body">
          {!caricato && (
            <p className="booking-loading script">{copy.booking.loading}</p>
          )}
          <iframe
            src={url}
            title={copy.booking.iframeTitle}
            onLoad={() => setCaricato(true)}
            allow="payment"
          />
        </div>
      </div>
    </div>
  )
}

export default function Prenota() {
  const { copy } = useLanguage()
  const { locale } = copy
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
    ? copy.booking.chooseSummary
    : end
      ? copy.booking.range(formatta(start, locale), formatta(end, locale), giorni)
      : copy.booking.oneDay(formatta(start, locale))

  const oggetto = encodeURIComponent(copy.booking.emailSubject)
  const corpo = encodeURIComponent(
    start
      ? end
        ? copy.booking.emailRange(formatta(start, locale), formatta(end, locale), giorni)
        : copy.booking.emailOneDay(formatta(start, locale))
      : copy.booking.emailNoDate
  )

  return (
    <section className="prenota" id="prenota">
      <div className="prenota-orbit" aria-hidden="true"><span>{copy.booking.orbit}</span></div>
      <div className="section-shell prenota-grid">
        <div className="prenota-copy">
          <h2 data-reveal>{copy.booking.heading}</h2>

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
              {copy.booking.chooseUmbrella}
              <span className="arrow" aria-hidden="true">→</span>
            </button>
            <a
              className="button button-outline-ink"
              href={`mailto:magefsunsrl@gmail.com?subject=${oggetto}&body=${corpo}`}
            >
              {copy.booking.email}
            </a>
          </div>
        </div>

        <div className="prenota-cal" data-reveal data-delay="0.1">
          <Calendario range={range} onSelect={scegli} copy={copy} locale={locale} />
        </div>
      </div>

      {aperto && start && (
        <BookingModal range={range} onClose={() => setAperto(false)} copy={copy} locale={locale} />
      )}
    </section>
  )
}
