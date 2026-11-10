import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'

/** Spring "pop-out": scales 0.8 -> 1 with stiffness 100 when scrolled into view. */
export function Pop({ children, delay = 0, className = '', amount = 0.25, from = 0.8, y = 44 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, scale: from, y }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        delay,
        default: { type: 'spring', stiffness: 100, damping: 15, mass: 0.9 },
        opacity: { duration: 0.55, delay },
      }}
    >
      {children}
    </motion.div>
  )
}

/** Card that tilts toward the pointer and lights up under it. */
export function TiltCard({ children, className = '', max = 9 }) {
  const ref = useRef(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const sx = useSpring(rx, { stiffness: 180, damping: 18 })
  const sy = useSpring(ry, { stiffness: 180, damping: 18 })

  const onMove = (e) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * max * 2)
    rx.set((0.5 - py) * max * 2)
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }
  const reset = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{ rotateX: sx, rotateY: sy, transformPerspective: 900 }}
      className={`spot ${className}`}
    >
      {children}
    </motion.div>
  )
}

/** Button/link wrapper that leans toward the cursor. */
export function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  return (
    <motion.div
      ref={ref}
      style={{ x, y, display: 'inline-block' }}
      onPointerMove={(e) => {
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.div>
  )
}

/** Counts smoothly from its previous value to the new one. */
export function AnimatedNumber({ value, prefix = '', duration = 0.8 }) {
  const ref = useRef(null)
  const current = useRef(0)
  useEffect(() => {
    const controls = animate(current.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        current.current = v
        if (ref.current) ref.current.textContent = prefix + Math.round(v)
      },
    })
    return () => controls.stop()
  }, [value, prefix, duration])
  return <span ref={ref}>{prefix}0</span>
}

export function Eyebrow({ children, className = '' }) {
  return (
    <p className={`mb-4 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-muscovado ${className}`}>
      <span className="h-px w-8 bg-current" />
      {children}
    </p>
  )
}

export function Bean({ className = '', style }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} aria-hidden="true">
      <ellipse cx="30" cy="40" rx="24" ry="34" fill="currentColor" />
      <path d="M30 8C14 28 46 52 30 72" stroke="#f7f0e4" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".85" />
    </svg>
  )
}

/** Small set of stroke icons used in the benefits grid. */
export function Icon({ name, className = '' }) {
  const paths = {
    scale: 'M12 3v18M5 21h14M4 8h16M4 8l-2 6a3 3 0 0 0 6 0zM20 8l-2 6a3 3 0 0 0 6 0z',
    cap: 'M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5',
    leaf: 'M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19c3-5 6-7 10-9',
    receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
    heart: 'M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z',
    wifi: 'M2 9a15 15 0 0 1 20 0M5 12.5a10.5 10.5 0 0 1 14 0M8.5 16a5.5 5.5 0 0 1 7 0M12 19.5h.01',
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}

export { useTransform }
