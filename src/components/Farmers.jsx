import { motion } from 'framer-motion'
import { Eyebrow, Pop } from './primitives'
import { farmers } from '../data'

const fields = [['Area', 'area'], ['Beans', 'beans'], ['Altitude', 'altitude']]

export default function Farmers() {
  return (
    <section id="farmers" className="bg-roast px-6 py-28 text-cream md:py-40">
      <div className="mx-auto max-w-6xl">
        <Pop className="mb-8 max-w-3xl">
          <Eyebrow className="!text-caramel">Our growers</Eyebrow>
          <h2 className="font-serif text-4xl font-bold leading-[1.08] md:text-6xl">
            The farming groups <span className="italic text-caramel">behind the beans.</span>
          </h2>
        </Pop>
        <Pop className="mb-14 max-w-3xl" amount={0.5}>
          <p className="rounded-2xl border border-caramel/30 bg-caramel/10 px-5 py-4 text-cream/80">
            These profiles are based on publicly documented coffee-growing communities in Negros Occidental. They are not current partners of Hugpong Kape, and any partnership would require permission and direct confirmation.
          </p>
        </Pop>

        <ul className="space-y-5">
          {farmers.map((f, i) => (
            <li key={f.group}>
              <Pop delay={i * 0.08} from={0.85} y={60}>
                <motion.article
                  whileHover={{ y: -4, backgroundColor: 'rgba(247,240,228,0.08)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="grid gap-6 rounded-3xl border border-cream/10 bg-cream/[0.04] p-7 md:grid-cols-[1.1fr_1.4fr_1fr] md:p-9"
                >
                  <div>
                    <span className="font-mono text-xs tracking-widest text-caramel">0{i + 1}</span>
                    <h3 className="mt-2 font-serif text-2xl font-bold leading-snug">{f.group}</h3>
                  </div>
                  <dl className="space-y-3 text-sm">
                    {fields.map(([label, key]) => (
                      <div key={key} className="grid grid-cols-[5.5rem_1fr] gap-3">
                        <dt className="font-semibold uppercase tracking-widest text-cream/45">{label}</dt>
                        <dd className="text-cream/85">{f[key]}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="border-t border-cream/10 pt-5 text-cream/75 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-cream/45">Publicly documented</span>
                    {f.info}
                  </p>
                </motion.article>
              </Pop>
            </li>
          ))}
        </ul>

        <Pop className="mt-10" amount={0.6}>
          <p className="text-sm text-cream/60">
            Public source:{' '}
            <a className="underline decoration-caramel underline-offset-4 hover:text-caramel" href="https://www.arcores.org/en/coffee-negros-philippines/" target="_blank" rel="noreferrer">
              ARCORES, “Raise the Coffee Cup in Negros Island”
            </a>
            . Details were accessed for project reference and should be re-confirmed before commercial use.
          </p>
        </Pop>
      </div>
    </section>
  )
}
