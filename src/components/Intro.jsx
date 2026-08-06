import VideoLoop from './VideoLoop.jsx'
import { SunLines } from './Decor.jsx'
import { useLanguage } from '../i18n.jsx'

export default function Intro() {
  const { copy } = useLanguage()
  return (
    <section className="manifesto" id="spiaggia">
      <div className="manifesto-visual">
        <div className="manifesto-photo" data-media-reveal>
          <VideoLoop
            src="/media/spiaggia-drone.mp4"
            poster="/media/spiaggia-drone-poster.webp"
            aria-label={copy.intro.videoLabel}
          />
        </div>
        <SunLines className="manifesto-sun" />
      </div>

      <div className="manifesto-copy">
        <p className="display-copy" data-reveal>
          {copy.intro.line}
        </p>
        <p className="manifesto-lead" data-reveal>
          {copy.intro.lead}
        </p>
        <div className="manifesto-facts">
          <div data-reveal>
            <strong>9 — 19</strong>
            <span>{copy.intro.facts[0]}</span>
          </div>
          <div data-reveal>
            <strong>0 m</strong>
            <span>{copy.intro.facts[1]}</span>
          </div>
          <div data-reveal>
            <strong>∞</strong>
            <span>{copy.intro.facts[2]}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
