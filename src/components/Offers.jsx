import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bean, Eyebrow, Pop, TiltCard } from './primitives'
import { perks } from '../data'
import { scrollToHash } from './Header'

function Confetti() {
  const bits = Array.from({ length: 18 }, (_, i) => i)
  const colors = ['#e0953f', '#b8641f', '#9bbf3b', '#7b5ea7', '#3b2416']
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      {bits.map((i) => {
        const a = (i / bits.length) * Math.PI * 2
        const d = 120 + (i % 3) * 40
        return (
          <motion.span key={i} className="absolute h-2.5 w-2.5 rounded-sm" style={{ background: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d + 30, opacity: 0, scale: 1, rotate: 360 }}
            transition={{ duration: 1.1, ease: 'easeOut' }} />
        )
      })}
    </div>
  )
}

function StampCard() {
  const [stamps, setStamps] = useState(Array(9).fill(false))
  const [burst, setBurst] = useState(0)
  const count = stamps.filter(Boolean).length
  const full = count === 9

  const toggle = (i) => {
    const next = stamps.map((s, k) => (k === i ? !s : s))
    setStamps(next)
    if (next.every(Boolean)) setBurst((b) => b + 1)
  }

  return (
    <div className="relative rounded-[2rem] border border-espresso/10 bg-paper p-7 shadow-[0_30px_60px_-35px_rgba(36,21,13,.5)] md:p-10">
      <h3 className="font-serif text-3xl font-bold">The stamp card</h3>
      <p className="mt-2 text-espresso/70">Buy nine cups and the tenth is free. Tap a circle to try it.</p>

      <div className="mt-8 grid grid-cols-5 gap-3 sm:gap-4">
        {stamps.map((on, i) => (
          <motion.button key={i} onClick={() => toggle(i)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
            aria-pressed={on} aria-label={`Cup ${i + 1} ${on ? 'stamped' : 'not stamped'}`}
            className={`relative grid aspect-square place-items-center rounded-full border-2 border-dashed ${on ? 'border-muscovado bg-caramel/15' : 'border-espresso/25'}`}>
            <span className="absolute font-mono text-xs text-espresso/30">{i + 1}</span>
            <AnimatePresence>
              {on && (
                <motion.span key="stamp" initial={{ scale: 2.4, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: -8, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 10 }} className="absolute inset-1.5 grid place-items-center">
                  <Bean className="h-3/4 w-auto text-muscovado" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
        <motion.div animate={full ? { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] } : { scale: 1 }} transition={{ duration: 0.7 }}
          className={`relative grid aspect-square place-items-center rounded-full text-center text-[10px] font-bold uppercase leading-tight tracking-wide sm:text-xs ${full ? 'bg-calamansi text-espresso shadow-[0_0_0_6px_rgba(155,191,59,.25)]' : 'bg-espresso/10 text-espresso/40'}`}>
          10th<br />free
        </motion.div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-espresso/10">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-caramel to-muscovado" animate={{ width: `${(count / 9) * 100}%` }} transition={{ type: 'spring', stiffness: 100, damping: 16 }} />
        </div>
        <p className="font-mono text-sm font-semibold"><motion.span key={count} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">{count}</motion.span> of 9 cups stamped</p>
      </div>
      <p className="mt-5 text-sm text-espresso/65">
        Want to keep your real stamps?{' '}
        <a href="#register" onClick={(e) => { e.preventDefault(); scrollToHash('#register') }} className="font-semibold text-muscovado underline underline-offset-4">Create a free account</a>.
      </p>
      {burst > 0 && <Confetti key={burst} />}
    </div>
  )
}

export default function Offers() {
  return (
    <section id="offers" className="px-6 py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Pop className="mb-14 max-w-3xl">
          <Eyebrow>Offers</Eyebrow>
          <h2 className="font-serif text-4xl font-bold leading-[1.08] md:text-6xl">
            Come back often. <span className="italic text-muscovado">Give a little more.</span>
          </h2>
        </Pop>

        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Pop><StampCard /></Pop>
          <ul className="space-y-5">
            {perks.map((p, i) => (
              <li key={p.title}>
                <Pop delay={i * 0.12} y={50}>
                  <TiltCard className="rounded-3xl border border-espresso/10 bg-paper p-7" max={6}>
                    <h3 className="font-serif text-2xl font-bold">{p.title}</h3>
                    <p className="mt-2 text-espresso/70">{p.text}</p>
                  </TiltCard>
                </Pop>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
