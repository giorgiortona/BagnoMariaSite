import { useLanguage } from '../i18n.jsx'

export default function Contatti() {
  const { copy } = useLanguage()
  return (
    <section className="contact" id="contatti">
      <div className="contact-top">
        <h2 data-reveal>{copy.contact.heading}</h2>
        <a
          className="contact-map-link"
          href="https://www.google.com/maps/place/Bagnomaria/@40.1304604,17.9935316,17z"
          target="_blank"
          rel="noreferrer"
          data-reveal
        >
          <span>{copy.contact.maps}</span><b aria-hidden="true">↗</b>
        </a>
      </div>

      <div className="contact-grid">
        <div className="contact-address" data-reveal>
          <span>{copy.contact.where}</span>
          <address>
            Via Fra Graziano da Nardò, 30<br />
            73048 Santa Maria al Bagno (LE)
          </address>
        </div>
        <div className="contact-hours" data-reveal>
          <span>{copy.contact.when}</span>
          <p>{copy.contact.everyDay}<br /><strong>09:00 — 19:00</strong></p>
          <small>{copy.contact.season}</small>
        </div>
        <div className="contact-links" data-reveal>
          <span>{copy.contact.talk}</span>
          <a href="tel:+393334444182">+39 333 444 4182 ↗</a>
          <a href="mailto:magefsunsrl@gmail.com">magefsunsrl@gmail.com ↗</a>
          <a href="https://www.instagram.com/_bagnomaria_/" target="_blank" rel="noreferrer">Instagram ↗</a>
        </div>
      </div>

      <div className="contact-map" data-reveal>
        <iframe
          title={copy.contact.mapTitle}
          src="https://www.google.com/maps?q=Bagnomaria,+Via+Fra+Graziano+da+Nard%C3%B2+30,+Santa+Maria+al+Bagno&z=16&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  )
}
