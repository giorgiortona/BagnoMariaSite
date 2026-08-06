import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import { useLanguage } from '../i18n.jsx'

const LINKS = [
  '#spiaggia', '#giornata', '#menu', '#eventi', '#contatti',
]

export default function Nav() {
  const { copy } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [menuActive, setMenuActive] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  useEffect(() => {
    const onHashChange = () => setMenuActive(window.location.hash === '#menu')
    onHashChange()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const close = () => setOpen(false)

  return (
    <header className={`site-nav ${scrolled ? 'is-scrolled' : ''} ${menuActive ? 'is-menu-active' : ''} ${open ? 'is-open' : ''}`}>
      <div className="nav-shell">
        <a href="#top" className="nav-brand" aria-label={copy.common.backToTop} onClick={close}>
          <Logo light={open || (!scrolled && !menuActive)} />
        </a>

        <nav className="nav-panel" id="menu-principale" aria-label={copy.nav.aria}>
          <ul>
            {LINKS.map((href, index) => (
              <li key={href}>
                <span aria-hidden="true">0{index + 1}</span>
                <a href={href} onClick={close}>{copy.nav.links[index]}</a>
              </li>
            ))}
          </ul>
          <a className="nav-panel-book" href="#prenota" onClick={close}>
            {copy.nav.bookLong} <span aria-hidden="true">↗</span>
          </a>
          <LanguageSelector className="nav-language-mobile" onChange={close} />
          <div className="nav-panel-meta">
            <span>40°07′49″ N</span>
            <span>{copy.nav.coast}</span>
          </div>
        </nav>

        <div className="nav-actions">
          <LanguageSelector className="nav-language-desktop" />
          <a className="nav-book" href="#prenota" onClick={close}>
            {copy.nav.book} <span aria-hidden="true">↗</span>
          </a>

          <button
            type="button"
            className="nav-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? copy.nav.close : copy.nav.open}
            aria-expanded={open}
            aria-controls="menu-principale"
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
