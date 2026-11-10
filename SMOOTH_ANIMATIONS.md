# Smooth Web Animation Guide

## Recommended Stack

```bash
npm install framer-motion gsap
```

- **Framer Motion** for React components, modals, buttons, and hover effects
- **GSAP + ScrollTrigger** for advanced scroll animations and timelines
- **CSS transitions** for simple visual effects

## Core Rules

Animate GPU-friendly properties whenever possible:

- `transform`
- `opacity`
- `scale`
- `translate`
- `rotate`

Avoid frequently animating layout properties such as `width`, `height`, `margin`,
`padding`, `top`, and `left`.

Keep movement subtle:

- Hover movement: `2px–8px`
- Scroll reveal: `30px–60px`
- Scale changes: usually `0.96–1.05`

## Scroll Reveal

```jsx
<motion.div
  initial={{ opacity: 0, y: 44, scale: 0.9 }}
  whileInView={{ opacity: 1, y: 0, scale: 1 }}
  viewport={{ once: true, amount: 0.25 }}
  transition={{
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 0.9,
  }}
>
  Content
</motion.div>
```

Use `once: true` to avoid repeating animations unnecessarily.

## Hover and Click Effects

```jsx
<motion.button
  whileHover={{ y: -4, scale: 1.03 }}
  whileTap={{ scale: 0.96 }}
  transition={{
    type: 'spring',
    stiffness: 260,
    damping: 20,
  }}
>
  Click me
</motion.button>
```

## Scroll Progress

```jsx
const { scrollYProgress } = useScroll()

const progress = useSpring(scrollYProgress, {
  stiffness: 120,
  damping: 28,
})
```

```jsx
<motion.div
  style={{ scaleX: progress }}
  className="fixed left-0 right-0 top-0 h-1 origin-left"
/>
```

## GSAP Scroll Animation

```js
gsap.registerPlugin(ScrollTrigger)

gsap.from('.section-title', {
  y: 60,
  opacity: 0,
  duration: 1,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.section-title',
    start: 'top 80%',
    once: true,
  },
})
```

Use GSAP for complex timelines, parallax, pinned sections, and coordinated
multi-element animations.

## Smooth Cursor Effects

Use motion values with springs:

```jsx
const x = useSpring(useMotionValue(0), {
  stiffness: 220,
  damping: 16,
})
```

Reset the values when the pointer leaves:

```jsx
onPointerLeave={() => {
  x.set(0)
  y.set(0)
}}
```

Reusable cursor and card effects are implemented in
[`src/components/primitives.jsx`](./src/components/primitives.jsx).

## Easing

Use consistent easing throughout the interface:

```js
ease: [0.22, 1, 0.36, 1]
```

or:

```js
ease: 'power3.out'
ease: 'power3.inOut'
```

## Accessibility

Respect users who prefer reduced motion:

```jsx
const reduceMotion = useReducedMotion()

<motion.div
  initial={reduceMotion ? false : { opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

## Performance Checklist

- Animate transforms and opacity
- Use `once: true` for scroll reveals
- Avoid too many simultaneous animations
- Keep blur effects limited
- Test on mobile devices
- Use production builds for performance testing
- Keep spring settings consistent
- Prefer small, natural movements

The current implementation follows these patterns in
[`src/components/primitives.jsx`](./src/components/primitives.jsx),
[`src/components/Header.jsx`](./src/components/Header.jsx), and
[`src/App.jsx`](./src/App.jsx).
