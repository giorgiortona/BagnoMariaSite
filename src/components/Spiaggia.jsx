import VideoLoop from './VideoLoop.jsx'
import { useLanguage } from '../i18n.jsx'

const moments = [
  {
    time: '05:35',
    image: '/media/la-prima-luce.jpeg',
    className: 'day-card-wide',
  },
  {
    time: '12:30',
    image: '/media/piedi-nell-acqua.jpeg',
    className: 'day-card-tall',
  },
  {
    time: '20:12',
    image: '/media/golden-hour.jpeg',
    className: 'day-card-square',
  },
]

export default function Spiaggia() {
  const { copy } = useLanguage()
  return (
    <section className="day-section" id="giornata">
      <div className="section-shell">
        <header className="day-header">
          <h2 data-reveal>{copy.beach.heading}</h2>
          <p data-reveal>{copy.beach.lead}</p>
        </header>

        <div className="day-grid">
          {moments.map((moment, index) => {
            const localized = copy.beach.moments[index]
            return (
            <article className={`day-card ${moment.className}`} key={moment.time}>
              <div className="day-card-media" data-media-reveal>
                {moment.video ? (
                  <VideoLoop src={moment.video} poster={moment.poster} aria-label={localized.alt} />
                ) : (
                  <img src={moment.image} alt={localized.alt} loading="lazy" />
                )}
                <span className="day-number" aria-hidden="true">0{index + 1}</span>
              </div>
              <div className="day-card-copy" data-reveal>
                <span>{moment.time}</span>
                <h3>{localized.title}</h3>
                <p>{localized.text}</p>
              </div>
            </article>
            )
          })}
        </div>

        <div className="day-services" data-reveal>
          <a href="#prenota">
            <span>{copy.beach.services[0]}</span>
            <svg className="service-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {/* Umbrella pole */}
              <line x1="20" y1="14" x2="20" y2="36" />
              {/* Umbrella canopy */}
              <path d="M6 16 C6 8, 20 4, 20 4 C20 4, 34 8, 34 16" />
              <line x1="6" y1="16" x2="20" y2="14" />
              <line x1="20" y1="14" x2="34" y2="16" />
              {/* Ground line */}
              <line x1="14" y1="36" x2="26" y2="36" />
            </svg>
          </a>
          <span>
            <span>{copy.beach.services[1]}</span>
            <svg className="service-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {/* Three gentle waves representing shallow water */}
              <path d="M4 18 Q10 14, 16 18 Q22 22, 28 18 Q34 14, 38 18" />
              <path d="M4 24 Q10 20, 16 24 Q22 28, 28 24 Q34 20, 38 24" />
              <path d="M4 30 Q10 26, 16 30 Q22 34, 28 30 Q34 26, 38 30" />
            </svg>
          </span>
          <span>
            <span>{copy.beach.services[2]}</span>
            <svg className="service-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {/* Head */}
              <circle cx="19" cy="7.5" r="3.5" />
              {/* Spine, Seat, Leg, Footrest */}
              <path d="M19 11v11.5h6l4 8h3" />
              {/* Armrest */}
              <path d="M19 17h6" />
              {/* Wheel (Open Arc) */}
              <path d="M10 17.5A9 9 0 1 0 24 25" />
            </svg>
          </span>
          <a href="#bar">
            <span>{copy.beach.services[3]}</span>
            <svg className="service-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {/* Cocktail glass */}
              <path d="M10 6 L20 20 L30 6" />
              <line x1="10" y1="6" x2="30" y2="6" />
              {/* Stem */}
              <line x1="20" y1="20" x2="20" y2="32" />
              {/* Base */}
              <line x1="14" y1="32" x2="26" y2="32" />
              {/* Olive / cherry */}
              <circle cx="24" cy="10" r="1.5" fill="currentColor" stroke="none" />
              {/* Little umbrella stick */}
              <line x1="24" y1="10" x2="24" y2="4" />
              <path d="M24 4 Q28 4, 27 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
