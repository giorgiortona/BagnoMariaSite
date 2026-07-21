import { useEffect, useRef, useState } from 'react'
import { motionDisabled } from '../lib/motion.js'

/* Video di atmosfera: muto, parte quando entra nello schermo e si ferma
   quando esce. Con `loop` disattivato scorre una volta sola e resta
   sull'ultimo fotogramma. Con `srcMobile` serve un taglio verticale ai
   telefoni, così il video non viene ingrandito e sgranato. */
export default function VideoLoop({
  src,
  srcMobile,
  poster,
  className = '',
  loop = true,
  ...rest
}) {
  const ref = useRef(null)
  const statico = motionDisabled()
  /* Sorgente scelta già al primo render: se la decidessimo dentro l'effetto,
     sui telefoni partirebbe comunque il download della versione desktop. */
  const [sorgente, setSorgente] = useState(() => (
    srcMobile && typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches
      ? srcMobile
      : src
  ))

  /* scelta della sorgente in base alla larghezza dello schermo */
  useEffect(() => {
    if (!srcMobile) return
    const mq = window.matchMedia('(max-width: 820px)')
    const scegli = () => setSorgente(mq.matches ? srcMobile : src)
    scegli()
    mq.addEventListener('change', scegli)
    return () => mq.removeEventListener('change', scegli)
  }, [src, srcMobile])

  useEffect(() => {
    const v = ref.current
    if (!v || statico) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { rootMargin: '120px' }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [statico, sorgente])

  if (statico) {
    return <img src={poster} alt="" className={className} {...rest} />
  }

  return (
    <video
      ref={ref}
      key={sorgente}
      className={className}
      src={sorgente}
      poster={poster}
      muted
      loop={loop}
      playsInline
      disablePictureInPicture
      preload="metadata"
      {...rest}
    />
  )
}
