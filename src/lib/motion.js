/* Animazioni disattivate per chi preferisce il movimento ridotto
   (o con ?static in query string, utile per test e screenshot). */
export function motionDisabled() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    new URLSearchParams(window.location.search).has('static')
  )
}
