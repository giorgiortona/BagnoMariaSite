export default function Contatti() {
  return (
    <section className="contact" id="contatti">
      <div className="contact-top">
        <span className="section-index" data-reveal>07 / Vieni al mare</span>
        <h2 data-reveal>Sei già<br /><em>quasi qui.</em></h2>
        <a
          className="contact-map-link"
          href="https://www.google.com/maps/place/Bagnomaria/@40.1304604,17.9935316,17z"
          target="_blank"
          rel="noreferrer"
          data-reveal
        >
          <span>Apri in Google Maps</span><b aria-hidden="true">↗</b>
        </a>
      </div>

      <div className="contact-grid">
        <div className="contact-address" data-reveal>
          <span>Dove</span>
          <address>
            Via Fra Graziano da Nardò, 30<br />
            73048 Santa Maria al Bagno (LE)
          </address>
          <p>40.1305° N<br />17.9935° E</p>
        </div>
        <div className="contact-hours" data-reveal>
          <span>Quando</span>
          <p>Tutti i giorni<br /><strong>09:00 — 19:00</strong></p>
          <small>Stagione estiva</small>
        </div>
        <div className="contact-links" data-reveal>
          <span>Parliamone</span>
          <a href="tel:+393334444182">+39 333 444 4182 ↗</a>
          <a href="mailto:magefsunsrl@gmail.com">magefsunsrl@gmail.com ↗</a>
          <a href="https://www.instagram.com/_bagnomaria_/" target="_blank" rel="noreferrer">Instagram ↗</a>
        </div>
      </div>

      <div className="contact-map" data-reveal>
        <iframe
          title="Mappa — Bagno Maria, Santa Maria al Bagno"
          src="https://www.google.com/maps?q=Bagnomaria,+Via+Fra+Graziano+da+Nard%C3%B2+30,+Santa+Maria+al+Bagno&z=16&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  )
}
