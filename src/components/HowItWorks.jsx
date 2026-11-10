import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Eyebrow } from './primitives'
import { steps } from '../data'

/** Pinned on desktop: a line draws down while each step lights up in turn. */
export default function HowItWorks() {
  const root = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const stepEls = gsap.utils.toArray('.how-step')
      gsap.set(stepEls, { opacity: 0.22, x: 36, scale: 0.94 })
      gsap.set('.how-dot', { scale: 0.6, backgroundColor: '#3b2416' })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=260%', scrub: 0.8, pin: '.how-pin', anticipatePin: 1 },
      })
      tl.fromTo('.how-fill', { scaleY: 0 }, { scaleY: 1, duration: steps.length }, 0)
      stepEls.forEach((el, i) => {
        const dot = el.querySelector('.how-dot')
        tl.to(el, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, i)
          .to(dot, { scale: 1.2, backgroundColor: '#e0953f', duration: 0.4 }, i)
        if (i < steps.length - 1) tl.to(el, { opacity: 0.45, scale: 0.97, duration: 0.5 }, i + 0.85)
        if (i < steps.length - 1) {
          tl.to('.how-num', { yPercent: (-100 * (i + 1)) / steps.length, duration: 0.6, ease: 'power2.inOut' }, i + 0.9)
        }
      })
      tl.to({}, { duration: 0.4 })
    }, root)

    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.how-step').forEach((el) => {
        gsap.from(el, { scale: 0.8, opacity: 0, y: 40, duration: 0.9, ease: 'back.out(1.5)', scrollTrigger: { trigger: el, start: 'top 88%' } })
      })
      gsap.fromTo('.how-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.how-list', start: 'top 70%', end: 'bottom 70%', scrub: true } })
    }, root)

    return () => mm.revert()
  }, [])

  return (
    <section ref={root} id="how" className="relative bg-espresso text-cream">
      <div className="how-pin flex min-h-screen items-center overflow-hidden px-6 py-24 md:py-0">
        {/* giant counter */}
        <div className="pointer-events-none absolute -left-4 bottom-0 hidden h-[26rem] overflow-hidden font-serif text-[22rem] font-bold leading-[26rem] text-cream/[0.04] md:block" aria-hidden="true">
          <div className="how-num">
            {steps.map((_, i) => (<div key={i} className="h-[26rem]">{i + 1}</div>))}
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow className="!text-caramel">The idea</Eyebrow>
            <h2 className="font-serif text-4xl font-bold leading-[1.08] md:text-6xl">
              Hugpong means joining together. <span className="italic text-caramel">So we cut out the middle.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/70">
              Hugpong Kape is a student-run coffee shop built around one partnership between university students and highland coffee growers.
            </p>
          </div>

          <ol className="how-list relative space-y-8 pl-14">
            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] rounded bg-cream/10">
              <div className="how-fill h-full w-full origin-top rounded bg-gradient-to-b from-caramel to-muscovado" />
            </div>
            {steps.map((s, i) => (
              <li key={s.title} className="how-step relative rounded-3xl border border-cream/10 bg-cream/[0.04] p-7 backdrop-blur">
                <span className="how-dot absolute -left-[3.05rem] top-8 grid h-10 w-10 place-items-center rounded-full border-4 border-espresso bg-roast text-sm font-bold text-cream">{i + 1}</span>
                <h3 className="font-serif text-2xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-cream/70">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
