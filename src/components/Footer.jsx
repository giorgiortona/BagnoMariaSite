import Logo, { LogoWordmark } from './Logo.jsx'
import { useLanguage } from '../i18n.jsx'

export default function Footer() {
  const { copy } = useLanguage()

  // Il ritorno in cima deve essere immediato: niente scroll animato
  // (lo `scroll-behavior: smooth` globale verrebbe altrimenti applicato).
  const jumpToTop = (event) => {
    event.preventDefault()
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  return (
    <footer className="footer">
      <div className="footer-sun" aria-hidden="true" />
      <div className="footer-top">
        <a href="#top" aria-label={copy.common.backToTop}><Logo light /></a>
        <a className="footer-up" href="#top" onClick={jumpToTop}>{copy.footer.up}</a>
      </div>

      {/* Il marchio a tutta larghezza. Decorativo: il nome è già annunciato
          dal logo in alto, quindi niente etichetta per i lettori di schermo. */}
      <LogoWordmark className="footer-word" label={null} />

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} MAGEFSUN S.R.L. · P. IVA/C.F. 04712180753
          <span style={{ margin: '0 0.6rem', opacity: 0.5 }}>|</span>
          <a href="/privacy-policy.html" style={{ textDecoration: 'underline' }}>Privacy</a>
          <span style={{ margin: '0 0.6rem', opacity: 0.5 }}>|</span>
          <a href="/cookie-policy.html" style={{ textDecoration: 'underline' }}>Cookie</a>
        </span>
        <span>Santa Maria al Bagno · Nardò · Puglia</span>
        <div>
          <a href="https://www.instagram.com/_bagnomaria_/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.facebook.com/profile.php?id=100064888320146" target="_blank" rel="noreferrer">Facebook</a>
        </div>
      </div>

      <p className="footer-credit">
        created by <a href="https://www.instagram.com/dimana.digitalcreations/" target="_blank" rel="noreferrer"><strong>Dimana.DigitalCreations</strong></a>
      </p>
    </footer>
  )
}
