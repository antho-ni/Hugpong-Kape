import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { AnimatedNumber, Eyebrow, Pop } from './primitives'
import { useState } from 'react'

const PRICE = 140
const SPLIT = [
  { key: 'farm', label: 'Farming group', pct: 30, color: '#e0953f', text: 'text-muscovado' },
  { key: 'beans', label: 'Beans and supplies', pct: 40, color: '#3b2416', text: 'text-roast' },
  { key: 'shop', label: 'Shop and students', pct: 30, color: '#9bbf3b', text: 'text-[#6f8f1f]' },
]

const spring = { type: 'spring', stiffness: 100, damping: 16 }

function Cup({ inView }) {
  // liquid layers stack from the bottom of the cup: shop, beans, farmers
  const top = 44, bottom = 164, h = bottom - top
  let y = bottom
  const layers = [...SPLIT].reverse().map((s) => {
    const lh = (h * s.pct) / 100
    y -= lh
    return { ...s, y, lh }
  })
  return (
    <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-[280px]" aria-label="Cup showing 30% farmers, 40% beans, 30% shop">
      <defs>
        <clipPath id="cupClip"><path d="M34 44h124l-12 112a16 16 0 0 1-16 14H62a16 16 0 0 1-16-14z" /></clipPath>
      </defs>
      {/* steam */}
      {[70, 96, 122].map((x, i) => (
        <motion.path key={x} d={`M${x} 34c-8-8 8-14 0-24`} fill="none" stroke="#24150d" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round"
          animate={inView ? { y: [0, -10, -18], opacity: [0, 0.7, 0] } : {}}
          transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }} />
      ))}
      <path d="M34 44h124l-12 112a16 16 0 0 1-16 14H62a16 16 0 0 1-16-14z" fill="#fffaf1" stroke="#24150d" strokeWidth="4" strokeLinejoin="round" />
      <g clipPath="url(#cupClip)">
        {layers.map((l, i) => (
          <motion.rect key={l.key} x="20" width="160" fill={l.color}
            initial={{ y: bottom, height: 0 }}
            animate={inView ? { y: l.y, height: l.lh + 1 } : {}}
            transition={{ ...spring, delay: 0.2 + i * 0.25 }} />
        ))}
        <motion.path d="M20 50q20-8 40 0t40 0 40 0 40 0V70H20z" fill="#fff" fillOpacity=".22"
          animate={{ x: [-20, 0, -20] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} />
      </g>
      <path d="M156 64h10a22 22 0 0 1 0 44h-14" fill="none" stroke="#24150d" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="96" cy="186" rx="64" ry="8" fill="#24150d" opacity=".12" />
    </svg>
  )
}

export default function Menu() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const [qty, setQty] = useState(1)
  const [sponsor, setSponsor] = useState(false)

  const extra = sponsor ? 10 : 0
  const total = PRICE * qty + extra
  const amounts = {
    farm: Math.round(PRICE * 0.3) * qty + extra,
    beans: Math.round(PRICE * 0.4) * qty,
    shop: Math.round(PRICE * 0.3) * qty,
  }

  return (
    <section id="menu" className="px-6 py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Pop className="mb-14 max-w-3xl">
          <Eyebrow>Menu and where your money goes</Eyebrow>
          <h2 className="font-serif text-4xl font-bold leading-[1.08] md:text-6xl">
            Pick a drink and <span className="italic text-muscovado">see who gets what.</span>
          </h2>
        </Pop>

        <Pop amount={0.2}>
          <div ref={ref} className="grid items-center gap-10 overflow-hidden rounded-[2rem] border border-espresso/10 bg-paper p-6 shadow-[0_40px_80px_-40px_rgba(36,21,13,.45)] md:grid-cols-[0.8fr_1.2fr] md:p-12">
            <div>
              <Cup inView={inView} />
              <p className="mt-4 text-center font-serif text-2xl font-bold">Muscovado Latte</p>
              <p className="text-center text-espresso/60">₱{PRICE} per cup</p>
            </div>

            <div>
              {/* quantity */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold uppercase tracking-widest text-espresso/60">Cups</span>
                <div className="flex items-center rounded-full border border-espresso/15">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-xl" aria-label="Fewer cups">−</motion.button>
                  <span className="relative grid h-11 w-10 place-items-center overflow-hidden font-mono text-lg font-bold">
                    <motion.span key={qty} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring}>{qty}</motion.span>
                  </span>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQty((q) => Math.min(9, q + 1))} className="grid h-11 w-11 place-items-center text-xl" aria-label="More cups">+</motion.button>
                </div>

                <button onClick={() => setSponsor((s) => !s)} role="switch" aria-checked={sponsor} className="ml-auto flex items-center gap-3 text-left">
                  <span className="text-sm font-semibold">Sponsor a farmer <span className="text-muscovado">+₱10</span></span>
                  <span className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${sponsor ? 'bg-calamansi' : 'bg-espresso/20'}`}>
                    <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="h-5 w-5 rounded-full bg-white shadow" style={{ marginLeft: sponsor ? 'auto' : 0 }} />
                  </span>
                </button>
              </div>

              {/* split bar */}
              <div className="mt-8 flex h-5 w-full overflow-hidden rounded-full bg-espresso/10">
                {SPLIT.map((s) => (
                  <motion.div key={s.key} layout style={{ background: s.color }} animate={{ width: `${(amounts[s.key] / total) * 100}%` }} transition={spring} />
                ))}
              </div>

              {/* lines */}
              <ul className="mt-6 divide-y divide-dashed divide-espresso/20 font-mono">
                {SPLIT.map((s) => (
                  <li key={s.key} className="flex items-center justify-between py-3">
                    <span className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ background: s.color }} />{s.label} <span className="text-espresso/50">({s.pct}%)</span></span>
                    <span className={`text-lg font-bold ${s.text}`}><AnimatedNumber value={amounts[s.key]} prefix="₱" /></span>
                  </li>
                ))}
                <li className="flex items-center justify-between py-3 text-lg font-bold"><span>Total</span><span>₱<AnimatedNumber value={total} /></span></li>
              </ul>

              <motion.p key={`${qty}-${sponsor}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-caramel/15 px-5 py-4 text-espresso/80">
                Add ₱10 to sponsor a farmer. Your {qty === 1 ? 'cup' : `${qty} cups`} would send <strong className="text-muscovado">₱{amounts.farm}</strong> to the farming group.
              </motion.p>
              <p className="mt-3 text-xs text-espresso/50">Sample prices and percentages for a concept shop.</p>
            </div>
          </div>
        </Pop>
      </div>
    </section>
  )
}
