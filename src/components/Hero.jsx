import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Gabbiani, GrecaBorder } from './Decor.jsx'
import { LogoWordmark } from './Logo.jsx'
import { motionDisabled } from '../lib/motion.js'
import VideoLoop from './VideoLoop.jsx'

export default function Hero({ ready }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (!ready || motionDisabled()) return undefined

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .from('.hero-video', { scale: 1.1, duration: 1.9 })
        .from('.hero-place, .hero-side-note', { autoAlpha: 0, y: 18, duration: 0.65, stagger: 0.08 }, 0.15)
        /* Il logo è un blocco unico (l'ombrellone è la "i"), quindi la parola
           entra con lo stesso scatto che prima aveva il marchio. */
        .from('.hero-wordmark', { autoAlpha: 0, scale: 0.9, y: 32, duration: 0.95, ease: 'back.out(1.4)' }, 0.18)
        .from('.hero-tagline', { autoAlpha: 0, y: 16, duration: 0.65 }, 0.52)
        .from('.hero-bottom > *', { autoAlpha: 0, y: 22, duration: 0.7, stagger: 0.08 }, 0.65)

      gsap.to('.hero-stage', {
        yPercent: 12,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      })

      gsap.to('.hero-heading', {
        yPercent: -18,
        autoAlpha: 0.25,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: '80% top',
          scrub: 0.8,
        },
      })

      gsap.to('.hero-foam span', {
        xPercent: 90,
        duration: 9,
        stagger: 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, rootRef)

    return () => ctx.revert()
  }, [ready])

  return (
    <section className="hero" id="top" ref={rootRef}>
      <div className="hero-stage" aria-hidden="true">
        <VideoLoop
          className="hero-video"
          src="/media/mare-desktop.mp4"
          srcMobile="/media/mare-mobile.mp4"
          poster="/media/hero-poster.webp"
        />
        <div className="hero-shade" />
      </div>

      <p className="hero-place">Santa Maria al Bagno · Nardò</p>
      <p className="hero-side-note">Lido · Bar · Eventi<br />sulla costa ionica</p>

      <Gabbiani className="hero-gabbiani" />
      <div className="hero-foam" aria-hidden="true"><span /><span /><span /></div>

      <div className="hero-heading">
        <h1 className="hero-wordmark"><LogoWordmark /></h1>
        <p className="hero-tagline">Sabbia chiara · acqua cristallina</p>
      </div>

      <div className="hero-bottom">
        <p>Una piccola spiaggia, il sole della Puglia<br />e tutto il tempo per stare bene.</p>
        <a className="button button-sun" href="#prenota">
          Prenota il tuo posto <span aria-hidden="true">↗</span>
        </a>
        <a className="hero-scroll" href="#spiaggia">
          <span>Scopri</span>
          <i aria-hidden="true" />
        </a>
      </div>

      <div className="hero-sun-stamp" aria-hidden="true">
        <span>Mar Ionio</span>
      </div>

      <GrecaBorder className="hero-greca" />
    </section>
  )
}
