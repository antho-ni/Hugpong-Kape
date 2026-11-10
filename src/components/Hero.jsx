import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { AnimatedNumber, Bean, Magnetic } from './primitives'
import { scrollToHash } from './Header'

const plain = ['Coffee', 'that', 'pays', 'the']
const italic = ['people', 'who', 'grow', 'it.']

const wrap = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }
const word = {
  hidden: { y: '115%', rotate: 4 },
  show: { y: 0, rotate: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
}
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 16 } },
}

const rows = [
  ['Farming group', 42, 'text-muscovado'],
  ['Beans and supplies', 56, 'text-roast'],
  ['Shop and students', 42, 'text-[#6f8f1f]'],
]

const beans = [
  { cls: 'left-[4%] top-[18%] h-14 text-roast/80', speed: 0.9, r: -20 },
  { cls: 'left-[44%] top-[8%] h-9 text-caramel', speed: 0.5, r: 35 },
  { cls: 'right-[6%] top-[14%] h-16 text-muscovado/80', speed: 1.2, r: 15 },
  { cls: 'left-[10%] bottom-[10%] h-10 text-caramel/90', speed: 0.7, r: 60 },
  { cls: 'right-[38%] bottom-[6%] h-12 text-roast/60', speed: 1.1, r: -45 },
  { cls: 'right-[3%] bottom-[18%] h-8 text-calamansi', speed: 0.4, r: 25 },
]

export default function Hero({ ready }) {
  const root = useRef(null)
  const state = ready ? 'show' : 'hidden'

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const trig = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.utils.toArray('[data-speed]').forEach((el) => {
        gsap.to(el, { y: -parseFloat(el.dataset.speed) * 320, ease: 'none', scrollTrigger: trig })
      })
      gsap.to('.hero-copy', { yPercent: -14, opacity: 0.15, ease: 'none', scrollTrigger: trig })
      gsap.to('.hero-receipt', { yPercent: -10, rotate: 4, scale: 0.94, ease: 'none', scrollTrigger: trig })
      gsap.to('.hero-blob', { yPercent: 25, ease: 'none', scrollTrigger: trig })
    }, root)
    return () => mm.revert()
  }, [])

  return (
    <section id="top" ref={root} className="relative flex min-h-screen items-center overflow-hidden pb-20 pt-28">
      {/* Soft background */}
      <div className="hero-blob pointer-events-none absolute -right-40 -top-32 h-[38rem] w-[38rem] rounded-full bg-caramel/25 blur-3xl" />
      <div className="hero-blob pointer-events-none absolute -bottom-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-calamansi/20 blur-3xl" />

      {/* Parallax beans (GSAP moves wrapper, Framer spins the bean) */}
      {beans.map((b, i) => (
        <div key={i} data-speed={b.speed} className={`pointer-events-none absolute ${b.cls.split(' ').filter((c) => !c.startsWith('h-') && !c.startsWith('text-')).join(' ')}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={ready ? { opacity: 1, scale: 1, rotate: [b.r, b.r + 14, b.r - 8, b.r], y: [0, -12, 6, 0] } : {}}
            transition={{
              opacity: { delay: 0.5 + i * 0.1 },
              scale: { type: 'spring', stiffness: 100, damping: 12, delay: 0.5 + i * 0.1 },
              rotate: { duration: 9 + i, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 7 + i, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <Bean className={`w-auto ${b.cls.split(' ').filter((c) => c.startsWith('h-') || c.startsWith('text-')).join(' ')}`} />
          </motion.div>
        </div>
      ))}

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hero-copy">
          <motion.div initial="hidden" animate={state} variants={wrap}>
            <motion.p variants={rise} className="mb-6 inline-flex items-center gap-2 rounded-full border border-espresso/15 bg-paper/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-calamansi opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-calamansi" />
              </span>
              Student concept · Bacolod City
            </motion.p>

            <h1 className="font-serif text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              {plain.map((w, i) => (
                <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <motion.span variants={word} className="inline-block origin-bottom-left">{w}</motion.span>
                </span>
              ))}
              <br />
              {italic.map((w, i) => (
                <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <motion.span variants={word} className="inline-block origin-bottom-left italic text-muscovado">{w}</motion.span>
                </span>
              ))}
            </h1>

            <motion.p variants={rise} className="mt-7 max-w-xl text-lg leading-relaxed text-espresso/75">
              Hugpong Kape buys beans straight from highland farmers in Negros and sends <strong className="font-semibold text-espresso">30 centavos of every peso</strong> back to their farming group.
            </motion.p>

            <motion.div variants={rise} className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <a href="#menu" onClick={(e) => { e.preventDefault(); scrollToHash('#menu') }} className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-espresso px-7 py-4 font-semibold text-cream">
                  <span className="absolute inset-0 -translate-x-full bg-muscovado transition-transform duration-500 ease-out group-hover:translate-x-0" />
                  <span className="relative">See where your money goes</span>
                  <motion.span className="relative" animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>→</motion.span>
                </a>
              </Magnetic>
              <Magnetic strength={0.2}>
                <a href="#how" onClick={(e) => { e.preventDefault(); scrollToHash('#how') }} className="inline-flex items-center rounded-full border border-espresso/25 px-7 py-4 font-semibold transition-colors hover:bg-espresso/5">
                  How it works
                </a>
              </Magnetic>
            </motion.div>
          </motion.div>
        </div>

        {/* Receipt */}
        <div className="hero-receipt mx-auto w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 80, rotate: -8, scale: 0.8 }}
            animate={ready ? { opacity: 1, y: 0, rotate: 2, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 100, damping: 14, delay: 0.5 }}
          >
            <motion.div animate={{ y: [0, -10, 0], rotate: [0, -1, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="relative bg-paper px-7 pb-6 pt-8 shadow-[0_30px_60px_-20px_rgba(36,21,13,.35)]">
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-caramel via-muscovado to-calamansi" />
                <p className="text-center font-serif text-2xl font-bold">Hugpong Kape</p>
                <div className="my-4 border-t-2 border-dashed border-espresso/20" />
                <motion.ul initial="hidden" animate={state} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18, delayChildren: 1.1 } } }} className="space-y-3 font-mono text-sm">
                  <motion.li variants={rise} className="flex justify-between font-semibold"><span>1 Muscovado Latte</span><span>₱<AnimatedNumber value={ready ? 140 : 0} duration={1.4} /></span></motion.li>
                  <li className="border-t-2 border-dashed border-espresso/20" />
                  {rows.map(([label, n, color]) => (
                    <motion.li key={label} variants={rise} className={`flex justify-between ${color}`}>
                      <span>{label}</span><span>₱{n}</span>
                    </motion.li>
                  ))}
                  <li className="border-t-2 border-dashed border-espresso/20" />
                  <motion.li variants={rise} className="flex justify-between text-base font-bold"><span>Total</span><span>₱140</span></motion.li>
                </motion.ul>

                {/* split bar */}
                <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-espresso/10">
                  {[['30%', 'bg-caramel'], ['40%', 'bg-roast'], ['30%', 'bg-calamansi']].map(([w, c], i) => (
                    <motion.div key={i} className={c} initial={{ width: 0 }} animate={ready ? { width: w } : {}} transition={{ duration: 0.9, delay: 1.6 + i * 0.25, ease: [0.22, 1, 0.36, 1] }} />
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-espresso/55">Sample figures for a concept shop</p>
              </div>
              <div className="zigzag" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-espresso/50 md:flex" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 2 }}>
        Scroll
        <span className="relative block h-10 w-px overflow-hidden bg-espresso/15">
          <motion.span className="absolute inset-x-0 top-0 h-4 bg-espresso" animate={{ y: [-16, 40] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
        </span>
      </motion.div>
    </section>
  )
}
