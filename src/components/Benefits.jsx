import { motion } from 'framer-motion'
import { Eyebrow, Icon, Pop, TiltCard } from './primitives'
import { benefits } from '../data'

export default function Benefits() {
  return (
    <section id="why" className="px-6 py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Pop className="mb-16 max-w-3xl">
          <Eyebrow>Why it is worth your cup</Eyebrow>
          <h2 className="font-serif text-4xl font-bold leading-[1.08] md:text-6xl">
            Good coffee with a <span className="italic text-muscovado">clear conscience.</span>
          </h2>
        </Pop>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <li key={b.title}>
              <Pop delay={(i % 3) * 0.1} y={60}>
                <motion.div initial="rest" whileHover="hover" animate="rest">
                  <TiltCard className="group h-full rounded-3xl border border-espresso/10 bg-paper p-8">
                    <motion.div
                      variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -8, scale: 1.15 } }}
                      transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                      className="grid h-14 w-14 place-items-center rounded-2xl bg-espresso text-caramel"
                    >
                      <Icon name={b.icon} className="h-7 w-7" />
                    </motion.div>
                    <h3 className="mt-6 font-serif text-2xl font-bold">{b.title}</h3>
                    <p className="mt-2 leading-relaxed text-espresso/70">{b.text}</p>
                    <motion.span
                      variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-6 block h-[3px] origin-left rounded bg-gradient-to-r from-caramel to-muscovado"
                    />
                  </TiltCard>
                </motion.div>
              </Pop>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
