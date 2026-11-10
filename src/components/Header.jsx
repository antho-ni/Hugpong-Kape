import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import gsap from 'gsap'
import { nav } from '../data'

export function scrollToHash(hash) {
  const el = document.querySelector(hash)
  if (!el) return
  gsap.to(window, { scrollTo: { y: el, offsetY: 72 }, duration: 1.3, ease: 'power3.inOut' })
}

export default function Header({ user, onAuth, onLogout }) {
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(null)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setSolid(y > 40)
    setHidden(y > prev && y > 220 && !open)
  })

  const go = (e, href) => { e.preventDefault(); setOpen(false); scrollToHash(href) }

  return (
    <>
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-caramel via-muscovado to-calamansi" />
      <motion.header
        animate={{ y: hidden ? '-110%' : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? 'bg-cream/80 shadow-[0_1px_0_rgba(36,21,13,.08)] backdrop-blur-lg' : ''}`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#top" onClick={(e) => { e.preventDefault(); gsap.to(window, { scrollTo: 0, duration: 1.2, ease: 'power3.inOut' }) }} className="group flex items-center gap-2 font-serif text-xl font-bold">
            <motion.svg viewBox="0 0 24 24" className="h-6 w-6 text-muscovado" whileHover={{ rotate: 18, scale: 1.15 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }}>
              <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h1.5a2.5 2.5 0 0 1 0 5H17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
            Hugpong Kape
          </a>

          <nav className="hidden gap-1 md:flex" onPointerLeave={() => setHover(null)}>
            {nav.map((n) => (
              <a key={n.href} href={n.href} onClick={(e) => go(e, n.href)} onPointerEnter={() => setHover(n.href)} className="relative px-4 py-2 text-sm font-medium">
                {hover === n.href && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-espresso/8" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative">{n.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={onLogout} className="hidden rounded-full border border-espresso/15 px-4 py-2 text-sm font-semibold transition hover:bg-espresso/5 md:block">Log out</button>
            ) : (
              <button onClick={onAuth} className="hidden rounded-full bg-espresso px-4 py-2 text-sm font-semibold text-cream transition hover:bg-muscovado md:block">
                Log in
              </button>
            )}
            <button className="grid h-10 w-10 place-items-center rounded-full border border-espresso/15 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <span className="relative block h-3 w-5">
              <motion.span className="absolute left-0 top-0 h-[2px] w-5 bg-espresso" animate={open ? { y: 5, rotate: 45 } : { y: 0, rotate: 0 }} />
              <motion.span className="absolute left-0 top-[10px] h-[2px] w-5 bg-espresso" animate={open ? { y: -5, rotate: -45 } : { y: 0, rotate: 0 }} />
            </span>
            </button>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          className="overflow-hidden bg-cream/95 backdrop-blur md:hidden"
        >
          <div className="flex flex-col gap-1 px-6 pb-5">
            {nav.map((n, i) => (
              <motion.a key={n.href} href={n.href} onClick={(e) => go(e, n.href)} initial={false} animate={open ? { x: 0, opacity: 1 } : { x: -16, opacity: 0 }} transition={{ delay: open ? i * 0.05 : 0 }} className="rounded-lg px-3 py-3 text-lg font-medium active:bg-espresso/5">
                {n.label}
              </motion.a>
            ))}
            {user ? (
              <button onClick={() => { setOpen(false); onLogout() }} className="rounded-lg px-3 py-3 text-left text-lg font-medium active:bg-espresso/5">Log out</button>
            ) : (
              <button onClick={() => { setOpen(false); onAuth() }} className="rounded-lg px-3 py-3 text-left text-lg font-medium active:bg-espresso/5">Log in</button>
            )}
          </div>
        </motion.div>
      </motion.header>
    </>
  )
}
