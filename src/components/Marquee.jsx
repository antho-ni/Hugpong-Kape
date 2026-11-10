import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ticker } from '../data'

/** Infinite ticker that speeds up and skews with scroll velocity. */
export default function Marquee({ dark = false }) {
  const root = useRef(null)
  const track = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const loop = gsap.to(track.current, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 })
      const skew = gsap.quickTo(root.current, 'skewX', { duration: 0.4, ease: 'power3' })
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity()
          skew(gsap.utils.clamp(-8, 8, -v / 220))
          gsap.to(loop, { timeScale: 1 + Math.min(Math.abs(v) / 250, 6), duration: 0.3, overwrite: true })
          gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.25 })
        },
      })
    }, root)
    return () => mm.revert()
  }, [])

  const items = [...ticker, ...ticker]
  return (
    <div ref={root} aria-hidden="true" className={`overflow-hidden py-5 ${dark ? 'bg-muscovado text-cream' : 'bg-espresso text-cream'}`}>
      <div ref={track} className="flex w-max whitespace-nowrap will-change-transform">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {items.map((t, i) => (
              <span key={i} className="flex items-center font-serif text-2xl italic md:text-3xl">
                <span className="px-8">{t}</span>
                <span className="text-caramel">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
