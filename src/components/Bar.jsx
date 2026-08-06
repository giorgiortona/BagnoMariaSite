import VideoLoop from './VideoLoop.jsx'
import { useLanguage } from '../i18n.jsx'

export default function Bar() {
  const { copy } = useLanguage()
  return (
    <section className="taste" id="bar">
      <div className="taste-color" aria-hidden="true">
        {copy.bar.words.map((word) => <span key={word}>{word}</span>)}
      </div>

      <div className="taste-grid">
        <div className="taste-copy">
          <h2 data-reveal>{copy.bar.heading}</h2>
          <p data-reveal>{copy.bar.lead}</p>

          <ul className="taste-list" data-reveal>
            {copy.bar.list.map(([title, note], index) => (
              <li key={title}><b>0{index + 1}</b><span>{title}</span><em>{note}</em></li>
            ))}
          </ul>
          
          <div style={{ marginTop: '2.5rem' }} data-reveal>
            <a className="button button-outline-ink" href="#menu">{copy.bar.menu}</a>
          </div>
        </div>

        <div className="taste-collage">
          <figure className="taste-food" data-media-reveal>
            <img src="/media/frisella.webp" alt={copy.bar.foodAlt} loading="lazy" />
            <figcaption>{copy.bar.caption}</figcaption>
          </figure>
          <figure className="taste-video" data-media-reveal>
            <VideoLoop
              src="/media/bar-aperitivo.mp4"
              poster="/media/bar-aperitivo-poster.webp"
              aria-label={copy.bar.videoLabel}
            />
          </figure>
          <div className="taste-stamp" aria-hidden="true">
            <span>{copy.bar.madeIn}</span>
            <strong>Salento</strong>
            <small>{copy.bar.stamp}</small>
          </div>
        </div>
      </div>
    </section>
  )
}
