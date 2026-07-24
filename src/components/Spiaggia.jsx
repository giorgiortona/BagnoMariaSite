import VideoLoop from './VideoLoop.jsx'

const moments = [
  {
    time: '05:35',
    title: 'La prima luce',
    text: 'Il profumo del caffè, gli ombrelloni ancora chiusi e una passerella che porta dritta al mare.',
    image: '/media/la-prima-luce.jpeg',
    alt: 'La passerella bianca tra gli ombrelloni verso il mare',
    className: 'day-card-wide',
  },
  {
    time: '12:30',
    title: 'Piedi nell’acqua',
    text: 'Fondale basso, sabbia finissima e lettini a pochi passi dalla battigia. Qui anche i più piccoli si sentono a casa.',
    image: '/media/piedi-nell-acqua.jpeg',
    alt: 'Una giornata di sole e mare al Bagno Maria',
    className: 'day-card-tall',
  },
  {
    time: '20:12',
    title: 'Golden hour',
    text: 'La luce diventa calda, il ritmo rallenta e il primo calice arriva sulla sabbia.',
    image: '/media/golden-hour.jpeg',
    alt: 'La spiaggia e la cittadina in una luminosa giornata estiva',
    className: 'day-card-square',
  },
]

export default function Spiaggia() {
  return (
    <section className="day-section" id="giornata">
      <div className="section-shell">
        <header className="day-header">
          <h2 data-reveal>Dal primo caffè<br />all’ultimo <em>raggio.</em></h2>
          <p data-reveal>
            Nessun programma rigido. Solo il tempo scandito dal sole,
            dal mare e da quello che ti va.
          </p>
        </header>

        <div className="day-grid">
          {moments.map((moment, index) => (
            <article className={`day-card ${moment.className}`} key={moment.time}>
              <div className="day-card-media" data-media-reveal>
                {moment.video ? (
                  <VideoLoop src={moment.video} poster={moment.poster} aria-label={moment.alt} />
                ) : (
                  <img src={moment.image} alt={moment.alt} loading="lazy" />
                )}
                <span className="day-number" aria-hidden="true">0{index + 1}</span>
              </div>
              <div className="day-card-copy" data-reveal>
                <span>{moment.time}</span>
                <h3>{moment.title}</h3>
                <p>{moment.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="day-services" data-reveal>
          <a href="#prenota">
            <span>Ombrelloni &amp; lettini</span>
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
            <span>Fondale basso</span>
            <svg className="service-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {/* Three gentle waves representing shallow water */}
              <path d="M4 18 Q10 14, 16 18 Q22 22, 28 18 Q34 14, 38 18" />
              <path d="M4 24 Q10 20, 16 24 Q22 28, 28 24 Q34 20, 38 24" />
              <path d="M4 30 Q10 26, 16 30 Q22 34, 28 30 Q34 26, 38 30" />
            </svg>
          </span>
          <span>
            <span>Accesso disabili</span>
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
            <span>Bar vista mare</span>
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
