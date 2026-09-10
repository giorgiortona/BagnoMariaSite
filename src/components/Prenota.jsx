import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
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

function inizioOggi() {
  const data = new Date()
  data.setHours(0, 0, 0, 0)
  return data
}

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
  const [oggi, setOggi] = useState(inizioOggi)
  const [vista, setVista] = useState(
    () => new Date(oggi.getFullYear(), oggi.getMonth(), 1)
  )

  useEffect(() => {
    const aggiornaOggi = () => {
      if (document.visibilityState === 'visible') setOggi(inizioOggi())
    }
    document.addEventListener('visibilitychange', aggiornaOggi)
    return () => document.removeEventListener('visibilitychange', aggiornaOggi)
  }, [])

  useEffect(() => {
    const meseAttuale = new Date(oggi.getFullYear(), oggi.getMonth(), 1)
    if (vista < meseAttuale) setVista(meseAttuale)
  }, [oggi, vista])

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

  const meseCorrente = vista <= new Date(oggi.getFullYear(), oggi.getMonth(), 1)

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
  const [stato, setStato] = useState('loading')
  const cardRef = useRef(null)
  const closeRef = useRef(null)
  const titleId = useId()
  const { start, end } = range

  const url = useMemo(() => {
    const widgetUrl = new URL(WIDGET_BASE)
    widgetUrl.searchParams.set('lang', copy.bookingLanguage)
    widgetUrl.searchParams.set('ybnl', '1')
    widgetUrl.searchParams.set('startdate', isoLocale(start))
    widgetUrl.searchParams.set('enddate', isoLocale(end || start))
    return widgetUrl.toString()
  }, [copy.bookingLanguage, end, start])

  useEffect(() => {
    const focusPrecedente = document.activeElement
    const overflowPrecedente = document.body.style.overflow
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusabili = [...(cardRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
      ) || [])].filter((elemento) => !elemento.hasAttribute('disabled'))
      if (!focusabili.length) return

      const primo = focusabili[0]
      const ultimo = focusabili[focusabili.length - 1]
      if (e.shiftKey && document.activeElement === primo) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primo.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus())

    return () => {
      window.cancelAnimationFrame(focusFrame)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflowPrecedente
      if (focusPrecedente instanceof HTMLElement && focusPrecedente.isConnected) {
        focusPrecedente.focus({ preventScroll: true })
      }
    }
  }, [onClose])

  useEffect(() => {
    setStato('loading')
    const timeout = window.setTimeout(() => {
      setStato((corrente) => (corrente === 'loading' ? 'slow' : corrente))
    }, 12000)
    return () => window.clearTimeout(timeout)
  }, [url])

  return (
    <div
      className="booking-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-lenis-prevent
    >
      <div className="booking-scrim" onClick={onClose} aria-hidden="true" />
      <div className="booking-card" ref={cardRef}>
        <header className="booking-head">
          <h2 className="booking-title" id={titleId}>
            <LogoMark size={30} />
            <span>
              {copy.booking.modalTitle}
              <small>
                {formatta(start, locale)}
                {end ? ` → ${formatta(end, locale)}` : ''}
              </small>
            </span>
          </h2>
          <button
            type="button"
            className="booking-close"
            ref={closeRef}
            onClick={onClose}
            aria-label={copy.booking.close}
          >
            ✕
          </button>
        </header>
        <div className="booking-body">
          {stato === 'loading' && (
            <p className="booking-loading script" role="status">{copy.booking.loading}</p>
          )}
          {stato === 'slow' && (
            <div className="booking-fallback" role="alert">
              <strong>{copy.booking.slowTitle}</strong>
              <span>{copy.booking.slowMessage}</span>
            </div>
          )}
          <iframe
            key={url}
            src={url}
            title={copy.booking.iframeTitle}
            onLoad={() => setStato('loaded')}
            onError={() => setStato('slow')}
            allow="payment"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <footer className="booking-footer">
          <span>{copy.booking.providerNote}</span>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {copy.booking.openExternal} <span aria-hidden="true">↗</span>
          </a>
        </footer>
      </div>
    </div>
  )
}

export default function Prenota() {
  const { copy } = useLanguage()
  const { locale } = copy
  const [range, setRange] = useState({ start: null, end: null })
  const [aperto, setAperto] = useState(false)
  const chiudiPrenotazione = useCallback(() => setAperto(false), [])

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
        <BookingModal range={range} onClose={chiudiPrenotazione} copy={copy} locale={locale} />
      )}
    </section>
  )
}
