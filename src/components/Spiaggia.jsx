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
          <span className="section-index" data-reveal>02 / La giornata</span>
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
          <a href="#prenota">Ombrelloni & lettini</a>
          <span>Fondale basso</span>
          <span>Accesso disabili</span>
          <a href="#bar">Bar vista mare</a>
        </div>
      </div>
    </section>
  )
}
