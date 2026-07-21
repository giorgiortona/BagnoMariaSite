import { useRef } from 'react'

export default function ProssimiEventi() {
  const sliderRef = useRef(null)

  const locandine = [
    {
      id: 1,
      image: '/photos/locandina-1.png',
      alt: 'Aperitivo aspettando il tramonto - Sabato 27 Giugno'
    },
    {
      id: 2,
      image: '/photos/locandina-1.png',
      alt: 'Secondo Evento di prova'
    }
  ]

  if (locandine.length === 0) {
    return null;
  }

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -sliderRef.current.offsetWidth, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: sliderRef.current.offsetWidth, behavior: 'smooth' })
    }
  }

  return (
    <section className="section section-schiuma prossimi-eventi" id="prossimi-eventi">
      <div className="container">
        
        <div className="prossimi-eventi-grid">
          {/* Colonna Testo e Controlli (Sinistra) */}
          <div className="prossimi-eventi-copy">
            <div className="section-head" style={{ marginBottom: '1.2rem' }}>
              <span className="eyebrow" data-reveal>Calendario</span>
              <h2 className="heading-lg">
                <span className="reveal-line"><span>I prossimi</span></span>
                <span className="reveal-line"><span><em>eventi in spiaggia.</em></span></span>
              </h2>
            </div>
            
            <p className="lead" data-reveal data-delay="0.1">
              Dagli aperitivi al tramonto ai dj set sotto le stelle: scopri gli appuntamenti imperdibili della stagione al Bagnomaria.
            </p>
            
            <div className="slider-controls" data-reveal data-delay="0.2">
              {locandine.length > 1 && (
                <>
                  <button className="slider-nav prev" onClick={scrollLeft} aria-label="Precedente">
                    ←
                  </button>
                  <button className="slider-nav next" onClick={scrollRight} aria-label="Successivo">
                    →
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Colonna Slider (Destra) */}
          <div className="prossimi-eventi-media" data-reveal data-delay="0.3">
            <div className="locandine-slider" ref={sliderRef}>
              {locandine.map((item) => (
                <div className="locandina-card-large" key={item.id}>
                  <div className="img-reveal">
                    <img src={item.image} alt={item.alt} loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
