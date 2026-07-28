import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'

const LINKS = [
  { href: '#spiaggia', label: 'La spiaggia' },
  { href: '#giornata', label: 'La giornata' },
  { href: '#menu', label: 'Menù' },
  { href: '#eventi', label: 'Eventi' },
  { href: '#contatti', label: 'Dove siamo' },
]

export default function Nav() {
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
        <a href="#top" className="nav-brand" aria-label="Bagno Maria — torna all'inizio" onClick={close}>
          <Logo light={open || (!scrolled && !menuActive)} />
        </a>

        <nav className="nav-panel" id="menu-principale" aria-label="Navigazione principale">
          <ul>
            {LINKS.map((link, index) => (
              <li key={link.href}>
                <span aria-hidden="true">0{index + 1}</span>
                <a href={link.href} onClick={close}>{link.label}</a>
              </li>
            ))}
          </ul>
          <a className="nav-panel-book" href="#prenota" onClick={close}>
            Prenota il tuo posto <span aria-hidden="true">↗</span>
          </a>
          <div className="nav-panel-meta">
            <span>40°07′49″ N</span>
            <span>Costa ionica · Puglia</span>
          </div>
        </nav>

        <a className="nav-book" href="#prenota" onClick={close}>
          Prenota <span aria-hidden="true">↗</span>
        </a>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={open}
          aria-controls="menu-principale"
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
