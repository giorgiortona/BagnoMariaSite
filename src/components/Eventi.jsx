import VideoLoop from './VideoLoop.jsx'

/* Le tre cose che il lido sa fare quando il sole scende. */
const PROPOSTE = [
  {
    n: '01',
    titolo: 'Matrimoni in spiaggia',
    testo:
      'Il sì con i piedi nella sabbia e lo Ionio a fare da testimone. Allestiamo la spiaggia, il rito e la cena: voi pensate solo a guardarvi.',
  },
  {
    n: '02',
    titolo: 'Aperitivi al tramonto',
    testo:
      'Il rito che ci riesce meglio. Calici, musica bassa e il sole che scende dietro l’isola — anche per gruppi, su prenotazione.',
  },
  {
    n: '03',
    titolo: 'Feste private',
    testo:
      'Compleanni, lauree, serate danzanti. Dopo l’ultimo ombrellone chiuso la spiaggia diventa vostra, fino a notte.',
  },
]

export default function Eventi() {
  return (
    <section className="events" id="eventi">
      <div className="events-background" aria-hidden="true">
        <VideoLoop src="/media/video-eventi.mp4" data-parallax />
      </div>
      <div className="events-overlay" />

      {/* testo e cartolina partono dalla stessa riga */}
      <div className="events-top">
        <div className="events-copy">
          <span className="section-index" data-reveal>04 / Eventi</span>
          <h2 data-reveal>Ci sono sere che<br />restano <em>addosso.</em></h2>
          <p data-reveal>
            Quando l’ultimo ombrellone si chiude, la spiaggia resta a voi: tre modi
            per prendervela tutta.
          </p>
          <a className="button button-outline-light" href="#contatti" data-reveal>
            Immagina il tuo evento <span aria-hidden="true">↗</span>
          </a>
        </div>

        <aside className="event-poster" data-reveal>
          <div className="event-poster-image">
            <img src="/media/foto-sposi.jpeg" alt="Festa degli sposi al Bagno Maria" loading="lazy" />
          </div>
          <div className="event-poster-copy">
            <span>Prossimo appuntamento</span>
            <strong>Il tuo evento in spiaggia</strong>
          </div>
        </aside>
      </div>

      <ul className="events-proposte">
        {PROPOSTE.map((p) => (
          <li key={p.n} data-reveal>
            <span className="events-proposta-n">{p.n}</span>
            <h3>{p.titolo}</h3>
            <p>{p.testo}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
