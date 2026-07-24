import VideoLoop from './VideoLoop.jsx'

export default function Bar() {
  return (
    <section className="taste" id="bar">
      <div className="taste-color" aria-hidden="true">
        <span>sale</span><span>Salento</span><span>sole</span>
      </div>

      <div className="taste-grid">
        <div className="taste-copy">
          <h2 data-reveal>Il Salento si mangia<br /><em>con le mani.</em></h2>
          <p data-reveal>
            Friselle, pomodori, olio buono. Poi cocktail,
            vini del territorio e il rito dell’aperitivo quando il sole tocca lo Ionio.
          </p>

          <ul className="taste-list" data-reveal>
            <li><b>01</b><span>Colazioni lente</span><em>dal mattino</em></li>
            <li><b>02</b><span>Friselle & piatti freschi</span><em>a pranzo</em></li>
            <li><b>03</b><span>Cocktail & vini salentini</span><em>al tramonto</em></li>
          </ul>
          
          <div style={{ marginTop: '2.5rem' }} data-reveal>
            <a className="button button-outline-ink" href="#menu">consulta tutto il menù</a>
          </div>
        </div>

        <div className="taste-collage">
          <figure className="taste-food" data-media-reveal>
            <img src="/media/frisella.webp" alt="Friselle salentine con pomodoro davanti al mare" loading="lazy" />
            <figcaption>pane, pomodoro, mare</figcaption>
          </figure>
          <figure className="taste-video" data-media-reveal>
            <VideoLoop
              src="/media/bar-aperitivo.mp4"
              poster="/media/bar-aperitivo-poster.webp"
              aria-label="La preparazione di un cocktail al tramonto"
            />
          </figure>
          <div className="taste-stamp" aria-hidden="true">
            <span>Made in</span>
            <strong>Salento</strong>
            <small>con il sole dentro</small>
          </div>
        </div>
      </div>
    </section>
  )
}
