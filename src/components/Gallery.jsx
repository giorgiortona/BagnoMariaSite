import VideoLoop from './VideoLoop.jsx'

const gallery = [
  { image: '/media/borgo-dal-mare.webp', alt: 'La cittadina di Santa Maria al Bagno vista dal mare', label: 'La cittadina' },
  { video: '/media/bar-caffe.mp4', poster: '/media/bar-caffe-poster.webp', alt: 'Un momento al bar del lido', label: 'Il bar' },
  { image: '/media/mattino.webp', alt: 'La spiaggia calma al mattino', label: 'Mattino' },
  { image: '/media/baia-panorama.webp', alt: 'Panorama della spiaggia di Santa Maria al Bagno', label: 'La spiaggia' },
  { image: '/media/passerella.webp', alt: 'La passerella bianca del lido', label: 'Verso il mare' },
  { image: '/media/spiaggia-estate.webp', alt: 'La spiaggia in una giornata d’estate', label: 'Estate' },
]

export default function Gallery() {
  return (
    <section className="gallery" id="galleria">
      <header className="gallery-head section-shell">
        <span className="section-index" data-reveal>05 / Cartoline</span>
        <h2 data-reveal>Un po’ di Salento<br />da portare <em>con te.</em></h2>
        <p data-reveal>Trascina per attraversare la nostra estate.</p>
      </header>

      <div className="gallery-track" aria-label="Galleria fotografica">
        {gallery.map((item, index) => (
          <figure className={`gallery-item gallery-item-${(index % 3) + 1}`} key={item.label}>
            <div className="gallery-media">
              {item.video ? (
                <VideoLoop src={item.video} poster={item.poster} aria-label={item.alt} />
              ) : (
                <img src={item.image} alt={item.alt} loading="lazy" />
              )}
            </div>
            <figcaption><span>0{index + 1}</span>{item.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
