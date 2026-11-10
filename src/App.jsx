import { useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Splash from './components/Splash'
import Header from './components/Header'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Problem from './components/Problem'
import HowItWorks from './components/HowItWorks'
import Benefits from './components/Benefits'
import Menu from './components/Menu'
import Farmers from './components/Farmers'
import Offers from './components/Offers'
import Faq from './components/Faq'
import Join from './components/Join'
import AuthModal from './components/AuthModal'
import StaffDashboard from './components/StaffDashboard'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
ScrollTrigger.config({ ignoreMobileResize: true })

export default function App() {
  const [splash, setSplash] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const done = useCallback(() => setSplash(false), [])

  useEffect(() => {
    fetch('/api/me.php', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true))
  }, [])

  useEffect(() => {
    // Layout shifts when web fonts land would throw pinned sections off.
    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts?.ready) document.fonts.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  useEffect(() => { if (!splash) requestAnimationFrame(() => ScrollTrigger.refresh()) }, [splash])

  const logout = () => {
    fetch('/api/csrf.php', { credentials: 'include' }).then((response) => response.json()).then(({ token }) =>
      fetch('/api/logout.php', { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': token } })
    ).finally(() => setUser(null))
  }

  if (authReady && user && ['staff', 'admin'].includes(user.role)) {
    return <StaffDashboard user={user} onLogout={logout} />
  }

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Splash show={splash} onDone={done} />
      <Header user={user} onAuth={() => setAuthOpen(true)} onLogout={logout} />
      <main>
        <Hero ready={!splash} />
        <Marquee />
        <Problem />
        <HowItWorks />
        <Benefits />
        <Marquee dark />
        <Menu />
        <Farmers />
        <Offers />
        <Faq />
      </main>
      <Join />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={(nextUser) => {
        setUser(nextUser)
        setAuthOpen(false)
      }} />
    </>
  )
}
