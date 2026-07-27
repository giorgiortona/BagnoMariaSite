import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import Preloader from './components/Preloader.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Intro from './components/Intro.jsx'
import Spiaggia from './components/Spiaggia.jsx'
import Bar from './components/Bar.jsx'
import Menu from './components/Menu.jsx'
import Eventi from './components/Eventi.jsx'
import Gallery from './components/Gallery.jsx'
import Prenota from './components/Prenota.jsx'
import Contatti from './components/Contatti.jsx'
import Footer from './components/Footer.jsx'
import { GrecaBorder, MareScena, WaveBorder } from './components/Decor.jsx'
import { motionDisabled } from './lib/motion.js'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [ready, setReady] = useState(false)
  const mainRef = useRef(null)

  useEffect(() => {
    if (motionDisabled()) return undefined

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)

    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    if (!ready || motionDisabled()) return undefined

    const ctx = gsap.context(() => {
      /* Stato iniziale subito, mentre il preloader copre ancora la pagina:
         senza questo gli elementi restano visibili finché il loro trigger non
         scatta, e a quel punto spariscono di colpo per rifare l'entrata. */
      gsap.set('[data-reveal]', { y: 42, autoAlpha: 0 })

      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: (items) => {
          gsap.to(items, {
            y: 0,
            autoAlpha: 1,
            duration: 0.95,
            stagger: 0.09,
            ease: 'power3.out',
            overwrite: true,
          })
        },
      })

      gsap.utils.toArray('[data-media-reveal]').forEach((media) => {
        const child = media.querySelector('img, video')
        gsap.timeline({
          scrollTrigger: { trigger: media, start: 'top 84%', once: true },
        })
          .fromTo(
            media,
            { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power4.inOut' },
          )
          .fromTo(
            child,
            { scale: 1.12 },
            { scale: 1, duration: 1.4, ease: 'power3.out' },
            '<',
          )
      })

      gsap.utils.toArray('[data-parallax]').forEach((media) => {
        gsap.fromTo(
          media,
          { yPercent: -4 },
          {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: {
              trigger: media.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          },
        )
      })

      gsap.to('.manifesto-sun', {
        rotate: 28,
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.manifesto',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })

      gsap.utils.toArray('.mare-scena .wave-layer').forEach((layer) => {
        gsap.to(layer, {
          xPercent: Number(layer.dataset.speed || 6),
          ease: 'none',
          scrollTrigger: {
            trigger: '.mare-scena',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })
      })

      gsap.fromTo('.mare-sole', { y: 45 }, {
        y: -24,
        ease: 'none',
        scrollTrigger: {
          trigger: '.mare-scena',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })

      gsap.fromTo('.mare-barca', { x: 0, rotate: -2 }, {
        x: () => window.innerWidth * 0.5,
        rotate: 2,
        ease: 'none',
        scrollTrigger: {
          trigger: '.mare-scena',
          start: 'top 90%',
          end: 'bottom 10%',
          scrub: 1.2,
        },
      })

      gsap.utils.toArray('[data-drift]').forEach((bird) => {
        gsap.to(bird, {
          x: 6,
          y: -8,
          duration: 2.5,
          delay: Number(bird.dataset.driftDelay || 0),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })
    }, mainRef)

    ScrollTrigger.refresh()

    /* Immagini e font arrivano dopo il primo refresh e spostano il layout:
       senza un secondo giro alcuni trigger restano su posizioni sbagliate e
       il loro elemento non si rivela mai. */
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)

    return () => {
      window.removeEventListener('load', refresh)
      ctx.revert()
    }
  }, [ready])

  return (
    <>
      <a className="skip-link" href="#contenuto">Vai al contenuto</a>
      <Preloader onDone={() => setReady(true)} />
      <Nav />
      <main id="contenuto" ref={mainRef}>
        <Hero ready={ready} />
        <GrecaBorder className="site-greca site-greca-white" />
        <Intro />
        <Spiaggia />
        <WaveBorder className="site-greca site-greca-sky" />
        <Bar />
        <Menu />
        <Eventi />
        <Gallery />
        <MareScena />
        <GrecaBorder className="site-greca site-greca-white" />
        <Prenota />
        <Contatti />
      </main>
      <Footer />
    </>
  )
}
