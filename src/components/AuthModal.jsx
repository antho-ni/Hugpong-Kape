import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function AuthModal({ open, onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', account_type: 'regular', student_id: '', email: '', password: '', password_confirmation: '', id_document: null })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const csrfResponse = await fetch('/api/csrf.php', { credentials: 'include' })
      const { token } = await csrfResponse.json()
      const requestBody = mode === 'register' ? (() => {
        const body = new FormData()
        Object.entries(form).forEach(([key, value]) => { if (value !== null) body.append(key, value) })
        return body
      })() : JSON.stringify(form)
      const response = await fetch(`/api/${mode}.php`, {
        method: 'POST',
        headers: { ...(mode === 'login' ? { 'Content-Type': 'application/json' } : {}), 'X-CSRF-Token': token },
        credentials: 'include',
        body: requestBody,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to authenticate.')
      onAuthenticated(data.user)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-espresso/60 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="auth-title"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
          <motion.div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-paper p-7 shadow-2xl md:max-h-[calc(100vh-4rem)] md:p-9" initial={{ y: 20, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .96 }}>
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[.2em] text-muscovado">Hugpong Kape</p>
                <h2 id="auth-title" className="mt-2 font-serif text-4xl font-bold">{mode === 'login' ? 'Welcome back.' : 'Join the community.'}</h2>
              </div>
              <button onClick={onClose} className="text-2xl text-espresso/50 hover:text-espresso" aria-label="Close">×</button>
            </div>
            <div className="mt-6 flex rounded-full bg-espresso/5 p-1">
              {['login', 'register'].map((tab) => (
                <button key={tab} onClick={() => { setMode(tab); setError('') }} className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize ${mode === tab ? 'bg-espresso text-cream' : 'text-espresso/60'}`}>{tab}</button>
              ))}
            </div>
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === 'register' && <p className="rounded-xl bg-caramel/10 px-4 py-3 text-sm text-espresso/70">{form.account_type === 'student' ? 'Student registration requires staff approval. Upload a clear school ID so staff can verify your account.' : 'Create a regular Hugpong Kape account without student verification.'}</p>}
              {mode === 'register' && <label className="block text-sm font-semibold">Name<input required minLength="2" maxLength="80" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 font-normal outline-none focus:border-muscovado" /></label>}
              {mode === 'register' && <fieldset className="space-y-2"><legend className="text-sm font-semibold">Account type</legend><div className="grid grid-cols-2 gap-2"><label className={`cursor-pointer rounded-xl border p-3 text-sm ${form.account_type === 'regular' ? 'border-muscovado bg-caramel/10' : 'border-espresso/15'}`}><input type="radio" name="account_type" value="regular" checked={form.account_type === 'regular'} onChange={(event) => setForm({ ...form, account_type: event.target.value, student_id: '', id_document: null })} className="mr-2" />Regular account</label><label className={`cursor-pointer rounded-xl border p-3 text-sm ${form.account_type === 'student' ? 'border-muscovado bg-caramel/10' : 'border-espresso/15'}`}><input type="radio" name="account_type" value="student" checked={form.account_type === 'student'} onChange={(event) => setForm({ ...form, account_type: event.target.value })} className="mr-2" />Student account</label></div></fieldset>}
              {mode === 'register' && form.account_type === 'student' && <label className="block text-sm font-semibold">Student ID<input required maxLength="40" value={form.student_id} onChange={(event) => setForm({ ...form, student_id: event.target.value })} className="mt-2 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 font-normal outline-none focus:border-muscovado" /></label>}
              <label className="block text-sm font-semibold">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 font-normal outline-none focus:border-muscovado" /></label>
              <label className="block text-sm font-semibold">Password<input required type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 font-normal outline-none focus:border-muscovado" /></label>
              {mode === 'register' && <label className="block text-sm font-semibold">Confirm password<input required type="password" minLength="8" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} className="mt-2 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 font-normal outline-none focus:border-muscovado" /></label>}
              {mode === 'register' && form.account_type === 'student' && <label className="block text-sm font-semibold">School ID image<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setForm({ ...form, id_document: event.target.files?.[0] ?? null })} className="mt-2 block w-full rounded-xl border border-dashed border-espresso/25 bg-white px-4 py-3 text-sm font-normal" /><span className="mt-1 block text-xs font-normal text-espresso/50">JPG, PNG, or WebP up to 5 MB.</span></label>}
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button disabled={busy} className="w-full rounded-full bg-muscovado px-5 py-3 font-semibold text-white transition hover:bg-roast disabled:cursor-wait disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
