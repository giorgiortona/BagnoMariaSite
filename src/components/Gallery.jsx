import { useEffect, useRef } from 'react'
import VideoLoop from './VideoLoop.jsx'

/* Le cartoline in posizione 2ª e 5ª (item-2) sono verticali: lì vanno i
   video, girati col drone in verticale. Le altre (item-1 orizzontale,
   item-3) restano foto landscape, che le riempiono senza sgranarsi. */
const gallery = [
  { image: '/media/borgo-dal-mare.webp', alt: 'La cittadina di Santa Maria al Bagno vista dal mare', label: 'La cittadina' },
  { video: '/media/bar-caffe.mp4', poster: '/media/bar-caffe-poster.webp', alt: 'Un momento al bar del lido', label: 'Il bar' },
  { image: '/media/baia-panorama.webp', alt: 'Panorama della spiaggia di Santa Maria al Bagno', label: 'La spiaggia' },
  { video: '/media/borgo-drone.mp4', poster: '/media/borgo-drone-poster.webp', alt: 'La cala di acqua cristallina ripresa dal drone', label: 'La cala' },
  { image: '/media/spiaggia-estate.webp', alt: 'La spiaggia in una giornata d’estate', label: 'Estate' },
]

export default function Gallery() {
  const trackRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    /* Il trackpad manda gesti diagonali: se il movimento è soprattutto
       orizzontale lo prendiamo noi, altrimenti lasciamo scorrere la pagina. */
    const onWheel = (e) => {
      const orizzontale = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      if (!orizzontale) return

      const max = track.scrollWidth - track.clientWidth
      const arrivato =
        (e.deltaX < 0 && track.scrollLeft <= 0) ||
        (e.deltaX > 0 && track.scrollLeft >= max - 1)

      /* solo se c'è ancora strada da fare: al bordo lasciamo il gesto
         al browser (indietro/avanti del trackpad) */
      if (arrivato) return

      e.preventDefault()
      track.scrollLeft += e.deltaX
    }

    /* Trascinamento col mouse, come promette la scritta "Trascina". */
    let trascino = false
    let partenzaX = 0
    let partenzaScroll = 0
    let mosso = 0

    const giu = (e) => {
      if (e.pointerType === 'touch') return // il touch scorre già da solo
      trascino = true
      mosso = 0
      partenzaX = e.clientX
      partenzaScroll = track.scrollLeft
      track.setPointerCapture(e.pointerId)
    }

    const muovi = (e) => {
      if (!trascino) return
      const delta = e.clientX - partenzaX
      mosso = Math.max(mosso, Math.abs(delta))
      /* la classe arriva solo dopo qualche pixel: così un semplice
         click sulle foto continua a funzionare */
      if (mosso > 6) track.classList.add('is-dragging')
      track.scrollLeft = partenzaScroll - delta
    }

    const su = (e) => {
      if (!trascino) return
      trascino = false
      track.classList.remove('is-dragging')
      if (track.hasPointerCapture?.(e.pointerId)) track.releasePointerCapture(e.pointerId)
    }

    track.addEventListener('wheel', onWheel, { passive: false })
    track.addEventListener('pointerdown', giu)
    track.addEventListener('pointermove', muovi)
    track.addEventListener('pointerup', su)
    track.addEventListener('pointercancel', su)

    return () => {
      track.removeEventListener('wheel', onWheel)
      track.removeEventListener('pointerdown', giu)
      track.removeEventListener('pointermove', muovi)
      track.removeEventListener('pointerup', su)
      track.removeEventListener('pointercancel', su)
    }
  }, [])

  return (
    <section className="gallery" id="galleria">
      <header className="gallery-head section-shell">
        <h2 data-reveal>Un po’ di Salento<br />da portare <em>con te.</em></h2>
        <p data-reveal>Trascina per attraversare la nostra estate.</p>
      </header>

      <div
        className="gallery-track"
        ref={trackRef}
        aria-label="Galleria fotografica"
        data-lenis-prevent
      >
        {gallery.map((item, index) => (
          <figure className={`gallery-item gallery-item-${(index % 3) + 1}`} key={item.label}>
            <div className="gallery-media">
              {item.video ? (
                <VideoLoop src={item.video} poster={item.poster} aria-label={item.alt} />
              ) : (
                <img src={item.image} alt={item.alt} loading="lazy" draggable="false" />
              )}
            </div>
            <figcaption><span>0{index + 1}</span>{item.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
