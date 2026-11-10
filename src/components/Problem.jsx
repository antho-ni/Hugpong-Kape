import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Eyebrow, Pop, TiltCard } from './primitives'
import { problems } from '../data'

const heading = 'Farmers grow the coffee. Middlemen set the price.'

export default function Problem() {
  const root = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.scrub-word', { opacity: 0.12, yPercent: 40 }, {
        opacity: 1, yPercent: 0, stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: '.scrub-heading', start: 'top 85%', end: 'bottom 50%', scrub: true },
      })
      gsap.fromTo('.problem-line', { scaleX: 0 }, {
        scaleX: 1, ease: 'none', transformOrigin: 'left',
        scrollTrigger: { trigger: '.problem-line', start: 'top 90%', end: 'top 55%', scrub: true },
      })
    }, root)
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} id="problem" className="relative px-6 py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Eyebrow>The problem</Eyebrow>
        <h2 className="scrub-heading max-w-4xl font-serif text-4xl font-bold leading-[1.08] md:text-6xl">
          {heading.split(' ').map((w, i) => (
            <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-[0.1em] align-bottom">
              <span className="scrub-word inline-block">{w}</span>
            </span>
          ))}
        </h2>
        <Pop className="mt-8 max-w-2xl" amount={0.5}>
          <p className="text-lg leading-relaxed text-espresso/75">
            Small coffee farmers in the uplands often sell through traders. They take the price they are offered, and the cup you buy in the city costs many times what the farmer was paid for the beans.
          </p>
        </Pop>
        <div className="problem-line mt-14 h-px w-full bg-espresso/25" />

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {problems.map((p, i) => (
            <li key={p.title}>
              <Pop delay={i * 0.12}>
                <TiltCard className="h-full rounded-3xl border border-espresso/10 bg-paper p-8 shadow-[0_10px_30px_-18px_rgba(36,21,13,.4)]">
                  <span className="font-serif text-5xl font-bold italic text-caramel/70">0{i + 1}</span>
                  <h3 className="mt-5 font-serif text-2xl font-bold">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-espresso/70">{p.text}</p>
                </TiltCard>
              </Pop>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
