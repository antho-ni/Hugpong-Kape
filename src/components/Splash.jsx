import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const word = 'Hugpong'.split('')

export default function Splash({ show, onDone }) {
  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : ''
    if (!show) return
    const t = setTimeout(onDone, 1900)
    return () => { clearTimeout(t); document.body.style.overflow = '' }
  }, [show, onDone])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] grid place-items-center bg-espresso text-cream"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="text-center">
            <div className="flex justify-center font-serif text-6xl font-bold md:text-8xl" aria-label="Hugpong Kape">
              {word.map((c, i) => (
                <span key={i} className="overflow-hidden pb-2">
                  <motion.span
                    className="inline-block"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 100, damping: 14 }}
                  >
                    {c}
                  </motion.span>
                </span>
              ))}
            </div>
            <motion.p
              className="mt-3 font-serif text-2xl italic text-caramel md:text-3xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
            >
              Kape
            </motion.p>
            <div className="mx-auto mt-8 h-[2px] w-40 overflow-hidden rounded bg-cream/15">
              <motion.div
                className="h-full origin-left bg-caramel"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 1.4, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
