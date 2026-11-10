import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eyebrow, Pop } from './primitives'
import { faqs } from '../data'

export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="px-6 py-28 md:py-40">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <Pop>
          <Eyebrow>Questions</Eyebrow>
          <h2 className="font-serif text-4xl font-bold leading-[1.08] md:text-6xl">
            Things you <span className="italic text-muscovado">might ask.</span>
          </h2>
        </Pop>

        <ul className="divide-y divide-espresso/15 border-y border-espresso/15">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <li key={f.q}>
                <Pop delay={i * 0.06} y={24} from={0.92}>
                  <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="group flex w-full items-center justify-between gap-6 py-6 text-left">
                    <span className="font-serif text-xl font-bold md:text-2xl">{f.q}</span>
                    <motion.span animate={{ rotate: isOpen ? 135 : 0, backgroundColor: isOpen ? '#b8641f' : 'rgba(36,21,13,0)', color: isOpen ? '#fff' : '#24150d' }}
                      transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-espresso/25 text-2xl leading-none group-hover:border-muscovado">+</motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { type: 'spring', stiffness: 140, damping: 22 }, opacity: { duration: 0.25 } }} className="overflow-hidden">
                        <p className="max-w-xl pb-6 text-lg leading-relaxed text-espresso/70">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Pop>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
