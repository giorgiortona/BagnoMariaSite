import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { GrecaBorder, WaveBorder } from './Decor.jsx'
import { LogoWordmark } from './Logo.jsx'
import { motionDisabled } from '../lib/motion.js'

export default function Preloader({ onDone }) {
  const rootRef = useRef(null)
  const counterRef = useRef(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useLayoutEffect(() => {
    const root = rootRef.current

    if (motionDisabled()) {
      gsap.set(root, { display: 'none' })
      doneRef.current?.()
      return undefined
    }

    const ctx = gsap.context(() => {
      const strokes = root.querySelectorAll('.preloader-logo path')
      const progress = { value: 0 }

      strokes.forEach((path) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, fillOpacity: 0 })
      })

      gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => gsap.set(root, { display: 'none' }),
      })
        .from('.preloader-frame', { autoAlpha: 0, duration: 0.7 }, 0)
        /* Scaglionamento stretto: i tracciati sono 14 e con passi larghi il
           disegno finiva dopo l'uscita del pannello. Così chiude entro 1.1s. */
        .to(strokes, {
          strokeDashoffset: 0,
          duration: 0.7,
          stagger: 0.025,
          ease: 'power2.inOut',
        }, 0.08)
        /* la scritta si riempie, poi tocca all'ombrellone aprirsi */
        .to(strokes, { fillOpacity: 1, duration: 0.35, ease: 'power2.out' }, 0.95)
        .from('.preloader-bubble', {
          autoAlpha: 0,
          y: 30,
          scale: 0.4,
          duration: 0.75,
          stagger: 0.06,
        }, 0.25)
        .to('.preloader-bar-fill', { scaleX: 1, duration: 1.45, ease: 'power2.inOut' }, 0.55)
        .to(progress, {
          value: 100,
          duration: 1.45,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (counterRef.current) counterRef.current.textContent = String(Math.round(progress.value)).padStart(3, '0')
          },
        }, 0.55)
        /* l'ombrellone si apre a 1.35s (vedi openDelay sotto): il pannello
           aspetta che abbia finito prima di uscire */
        .add(() => doneRef.current?.(), 2.2)
        .to(root, { yPercent: -100, duration: 0.95, ease: 'power4.inOut' }, 2.4)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <GrecaBorder className="preloader-frame preloader-frame-top" />
      <div className="preloader-bubbles">
        {Array.from({ length: 8 }, (_, index) => <i className="preloader-bubble" key={index} />)}
      </div>
      <div className="preloader-inner">
        <LogoWordmark className="preloader-logo" outlined openDelay={1350} />
        <div className="preloader-loading">
          <div className="preloader-bar"><span className="preloader-bar-fill" /></div>
          <span>Loading mare&hellip;</span>
          <b ref={counterRef}>000</b>
        </div>
        <p>Santa Maria al Bagno · costa ionica</p>
      </div>
      <WaveBorder className="preloader-frame preloader-frame-bottom" />
    </div>
  )
}
