import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Magnetic, Pop } from './primitives'

const info = [
  ['Visit', ['University of Saint La Salle, near Gate 2', 'Bacolod City']],
  ['Hours', ['Mon to Fri, 7:00 AM to 8:00 PM', 'Sat, 8:00 AM to 6:00 PM']],
  ['Contact', ['s2300417@usls.edu.ph']],
]

export default function Join() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr(true); return }
    setErr(false); setDone(true)
  }

  return (
    <section id="register" className="relative overflow-hidden bg-espresso px-6 pb-12 pt-28 text-cream md:pt-40">
      <motion.div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-muscovado/30 blur-3xl" animate={{ scale: [1, 1.2, 1], x: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="relative mx-auto max-w-6xl">
        <Pop>
          <h2 className="max-w-3xl font-serif text-5xl font-bold leading-[1.04] md:text-7xl">
            Buy a cup. <span className="italic text-caramel">Support a farmer.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-cream/70">Leave your email and we would let you know when the doors open.</p>
        </Pop>

        <Pop delay={0.1} className="mt-10 max-w-xl">
          <div className="relative min-h-[4.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              {!done ? (
                <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -16 }} className="flex flex-col gap-3 sm:flex-row" noValidate>
                  <motion.div animate={err ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }} className="flex-1">
                    <label className="sr-only" htmlFor="email">Email for the opening list</label>
                    <input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(false) }} placeholder="you@school.edu.ph"
                      className={`w-full rounded-full border bg-cream/10 px-6 py-4 text-cream placeholder:text-cream/40 outline-none transition focus:border-caramel focus:bg-cream/15 ${err ? 'border-red-400' : 'border-cream/20'}`} />
                  </motion.div>
                  <Magnetic strength={0.15}>
                    <motion.button whileTap={{ scale: 0.95 }} className="w-full rounded-full bg-caramel px-8 py-4 font-semibold text-espresso transition hover:bg-cream sm:w-auto">Join the list</motion.button>
                  </Magnetic>
                </motion.form>
              ) : (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 100, damping: 12 }} className="flex items-center gap-4 rounded-full border border-calamansi/40 bg-calamansi/10 px-6 py-4">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0 text-calamansi" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <motion.circle cx="12" cy="12" r="10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                    <motion.path d="M7 12.5l3.5 3.5L17 9" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                  </svg>
                  <span>Salamat! We will write to <strong>{email}</strong> when we open.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {err && <p role="alert" className="mt-2 pl-6 text-sm text-red-300">Please enter a valid email address.</p>}
        </Pop>

        <div className="mt-24 grid gap-10 border-t border-cream/15 pt-12 md:grid-cols-3">
          {info.map(([title, lines], i) => (
            <Pop key={title} delay={i * 0.1} y={30} from={0.9}>
              <h3 className="font-serif text-2xl font-bold text-caramel">{title}</h3>
              <div className="mt-3 space-y-1 text-cream/75">
                {lines.map((l) => (title === 'Contact'
                  ? <a key={l} href={`mailto:${l}`} className="underline decoration-caramel underline-offset-4 hover:text-caramel">{l}</a>
                  : <p key={l}>{l}</p>))}
              </div>
            </Pop>
          ))}
        </div>

        <p className="mt-16 max-w-3xl text-xs leading-relaxed text-cream/45">
          Hugpong Kape is a student concept made for a class project. It is not a real business and is not an official project of the University of St. La Salle. All prices, figures and farmer profiles are examples.
        </p>
      </div>
    </section>
  )
}
