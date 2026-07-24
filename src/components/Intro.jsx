import VideoLoop from './VideoLoop.jsx'

function SunLines() {
  return (
    <svg className="manifesto-sun" viewBox="0 0 420 420" aria-hidden="true">
      <circle cx="210" cy="210" r="92" />
      {Array.from({ length: 24 }, (_, index) => {
        const angle = index * 15
        return <path key={angle} d="M210 24v58" transform={`rotate(${angle} 210 210)`} />
      })}
    </svg>
  )
}

export default function Intro() {
  return (
    <section className="manifesto" id="spiaggia">
      <div className="manifesto-visual">
        <div className="manifesto-photo" data-media-reveal>
          <VideoLoop
            src="/media/spiaggia-drone.mp4"
            poster="/media/spiaggia-drone-poster.webp"
            aria-label="La spiaggia di Santa Maria al Bagno ripresa dal drone"
          />
        </div>
        <SunLines />
        <p className="manifesto-coordinate">Ionio · 40.1305° N / 17.9935° E</p>
      </div>

      <div className="manifesto-copy">
        <span className="section-index" data-reveal>01 / La spiaggia</span>
        <p className="display-copy" data-reveal>
          Qui il mare<br />
          entra <em>piano.</em>
        </p>
        <p className="manifesto-lead" data-reveal>
          Una lingua di sabbia chiara in un tratto di costa rocciosa. Acqua bassa,
          trasparente e protetta: il lusso semplice di un'insenatura cittadina.
        </p>
        <div className="manifesto-facts">
          <div data-reveal>
            <strong>9 — 19</strong>
            <span>ogni giorno d'estate</span>
          </div>
          <div data-reveal>
            <strong>0 m</strong>
            <span>dalla cittadina al mare</span>
          </div>
          <div data-reveal>
            <strong>∞</strong>
            <span>tramonti da ricordare</span>
          </div>
        </div>
        <p className="hand-note" data-reveal>tra Gallipoli e Santa Caterina</p>
      </div>
    </section>
  )
}
