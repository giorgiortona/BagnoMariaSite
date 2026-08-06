import { useEffect, useRef } from 'react'
import VideoLoop from './VideoLoop.jsx'
import { useLanguage } from '../i18n.jsx'

/* Le cartoline in posizione 2ª e 5ª (item-2) sono verticali: lì vanno i
   video, girati col drone in verticale. Le altre (item-1 orizzontale,
   item-3) restano foto landscape, che le riempiono senza sgranarsi. */
const gallery = [
  { layout: 2, video: '/media/bar-caffe.mp4', poster: '/media/bar-caffe-poster.webp' },
  { layout: 1, image: '/media/la-spiaggia.jpeg' },
  { layout: 2, video: '/media/borgo-drone.mp4', poster: '/media/borgo-drone-poster.webp' },
  { layout: 3, image: '/media/estate.jpeg' },
]

export default function Gallery() {
  const { copy } = useLanguage()
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
        <h2 data-reveal>{copy.gallery.heading}</h2>
        <p data-reveal>{copy.gallery.lead}</p>
      </header>

      <div
        className="gallery-track"
        ref={trackRef}
        aria-label={copy.gallery.aria}
        data-lenis-prevent
      >
        {gallery.map((item, index) => {
          const [label, alt] = copy.gallery.items[index]
          return (
          <figure className={`gallery-item gallery-item-${item.layout}`} key={item.image || item.video}>
            <div className="gallery-media">
              {item.video ? (
                <VideoLoop src={item.video} poster={item.poster} aria-label={alt} />
              ) : (
                <img src={item.image} alt={alt} loading="lazy" draggable="false" />
              )}
            </div>
            <figcaption><span>0{index + 1}</span>{label}</figcaption>
          </figure>
          )
        })}
      </div>
    </section>
  )
}
