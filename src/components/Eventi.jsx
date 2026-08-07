import VideoLoop from './VideoLoop.jsx'
import { useLanguage } from '../i18n.jsx'

const WHATSAPP_NUMBER = '393209376491'

export default function Eventi() {
  const { copy } = useLanguage()
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(copy.events.whatsappMessage)}`
  return (
    <section className="events" id="eventi">
      <div className="events-background" aria-hidden="true">
        <VideoLoop src="/media/video-eventi.mp4" data-parallax />
      </div>
      <div className="events-overlay" />

      {/* testo e cartolina partono dalla stessa riga */}
      <div className="events-top">
        <div className="events-copy">
          <h2 data-reveal>{copy.events.heading}</h2>
          <p data-reveal>{copy.events.lead}</p>
          <a
            className="button button-outline-light"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            data-reveal
          >
            {copy.events.cta} <span aria-hidden="true">↗</span>
          </a>
        </div>

        <aside className="event-poster" data-reveal>
          <div className="event-poster-image">
            <img src="/media/foto-sposi.jpeg" alt={copy.events.posterAlt} loading="lazy" />
          </div>
          <div className="event-poster-copy">
            <span>{copy.events.posterSmall}</span>
            <strong>{copy.events.posterTitle}</strong>
          </div>
        </aside>
      </div>

      <ul className="events-proposte">
        {copy.events.proposals.map(([title, text], index) => (
          <li key={title} data-reveal>
            <span className="events-proposta-n">0{index + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
