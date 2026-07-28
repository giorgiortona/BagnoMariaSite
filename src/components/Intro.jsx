import VideoLoop from './VideoLoop.jsx'
import { SunLines } from './Decor.jsx'

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
        <SunLines className="manifesto-sun" />
      </div>

      <div className="manifesto-copy">
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
      </div>
    </section>
  )
}
