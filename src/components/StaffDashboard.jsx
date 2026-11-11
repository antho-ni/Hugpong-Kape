import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { apiUrl } from '../lib/api'

const getCsrf = () => fetch(apiUrl('/csrf.php'), { credentials: 'include' }).then((response) => response.json())
const today = () => new Date().toISOString().slice(0, 10)

export default function StaffDashboard({ user = {}, onLogout }) {
  const [tab, setTab] = useState('cards')
  const [verificationView, setVerificationView] = useState('pending')
  const [posView, setPosView] = useState('checkout')
  const [students, setStudents] = useState([])
  const [members, setMembers] = useState([])
  const [selected, setSelected] = useState(null)
  const [selectedSale, setSelectedSale] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [shift, setShift] = useState(null)
  const [summary, setSummary] = useState({ transactions: 0, revenue: 0, discounts: 0 })
  const [report, setReport] = useState(null)
  const [reportDate, setReportDate] = useState(today())
  const [cart, setCart] = useState([])
  const [payment, setPayment] = useState('cash')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [customerId, setCustomerId] = useState('')
  const [restock, setRestock] = useState({ productId: '', quantity: '', reason: 'Supplier delivery' })
  const [confirmCheckout, setConfirmCheckout] = useState(false)

  const load = async (query = search) => {
    const response = await fetch(apiUrl(`/staff.php?q=${encodeURIComponent(query)}`), { credentials: 'include' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to load staff data.')
    setStudents(data.students)
    setMembers(data.members)
    const pos = await fetch(apiUrl(`/pos.php?report_date=${encodeURIComponent(reportDate)}`), { credentials: 'include' }).then((response) => response.json())
    if (pos.products) { setProducts(pos.products); setSales(pos.sales); setShift(pos.shift); setSummary(pos.summary); setReport(pos.report) }
  }

  useEffect(() => { load('').catch((loadError) => setError(loadError.message)) }, [])

  const action = async (payload) => {
    setBusy(true)
    setError('')
    try {
      const { token } = await getCsrf()
      const response = await fetch(apiUrl('/staff.php'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to update the stamp card.')
      await load()
      setSelected(null)
      setSelectedUser(null)
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setBusy(false)
    }
  }

  const posAction = async (payload) => {
    setBusy(true)
    setError('')
    try {
      const { token } = await getCsrf()
      const response = await fetch(apiUrl('/pos.php'), { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to complete POS action.')
      await load()
      if (payload.action === 'checkout') setCart([])
    } catch (posError) { setError(posError.message) } finally { setBusy(false) }
  }

  const addToCart = (product) => setCart((items) => {
    const existing = items.find((item) => item.id === product.id)
    if (existing) return items.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item)
    return [...items, { ...product, quantity: 1 }]
  })
  const updateQuantity = (productId, quantity) => setCart((items) => items
    .map((item) => item.id === productId ? { ...item, quantity } : item)
    .filter((item) => item.quantity > 0))
  const removeFromCart = (productId) => setCart((items) => items.filter((item) => item.id !== productId))
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const discountAmount = Math.floor(cartTotal * discountPercent / 100)
  const checkoutTotal = cartTotal - discountAmount
  const selectedCustomer = members.find((member) => member.id === customerId)

  return (
    <motion.div className="min-h-screen bg-cream px-5 py-6 md:px-10 md:py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-espresso/10 pb-6">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-muscovado font-serif text-xl font-bold text-cream">H</span><div><p className="font-serif text-xl font-bold">Hugpong Kape</p><p className="text-xs uppercase tracking-[.2em] text-muscovado">Staff portal</p></div></div>
        <div className="flex items-center gap-3"><span className="hidden text-sm text-espresso/60 sm:block">Signed in as {user.name || 'staff member'}</span><button onClick={onLogout} className="rounded-full border border-espresso/15 px-4 py-2 text-sm font-semibold transition hover:bg-espresso/5">Log out</button></div>
      </header>
      <main className="mx-auto max-w-6xl py-10">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-muscovado">Staff workspace</p>
        <h1 className="mt-2 font-serif text-5xl font-bold">{tab === 'cards' ? 'Stamp cards' : tab === 'verification' ? 'Student verification' : tab === 'inventory' ? 'Inventory' : 'Point of sale'}</h1>
        <p className="mt-3 max-w-xl text-espresso/60">{tab === 'cards' ? 'Search an approved student and record each purchase. Their 9th stamp unlocks a free drink.' : tab === 'verification' ? 'Review submitted school IDs and approve or reject student accounts.' : tab === 'inventory' ? 'Add deliveries and stock adjustments while keeping a movement history.' : 'Ring up orders, manage stock, take payments, and issue receipts.'}</p>
        <div className="mt-8 flex flex-wrap gap-2 rounded-2xl bg-paper p-2 shadow-sm">
          <button onClick={() => setTab('cards')} className={`rounded-xl px-5 py-3 text-sm font-semibold ${tab === 'cards' ? 'bg-espresso text-cream' : 'text-espresso/60'}`}>Stamp cards</button>
          <button onClick={() => setTab('verification')} className={`rounded-xl px-5 py-3 text-sm font-semibold ${tab === 'verification' ? 'bg-espresso text-cream' : 'text-espresso/60'}`}>Student verification</button>
          <button onClick={() => setTab('pos')} className={`rounded-xl px-5 py-3 text-sm font-semibold ${tab === 'pos' ? 'bg-espresso text-cream' : 'text-espresso/60'}`}>POS</button>
          <button onClick={() => setTab('inventory')} className={`rounded-xl px-5 py-3 text-sm font-semibold ${tab === 'inventory' ? 'bg-espresso text-cream' : 'text-espresso/60'}`}>Inventory</button>
        </div>
        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {tab !== 'pos' && tab !== 'inventory' && <div className="mt-8 flex gap-3"><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load().catch((loadError) => setError(loadError.message))} placeholder="Search name, email, or student ID" className="min-w-0 flex-1 rounded-full border border-espresso/15 bg-paper px-5 py-3 outline-none focus:border-muscovado" /><button onClick={() => load().catch((loadError) => setError(loadError.message))} className="rounded-full bg-espresso px-5 py-3 font-semibold text-cream">Search</button></div>}
        {tab === 'inventory' ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
            <section className="rounded-3xl bg-paper p-6 shadow-sm">
              <h2 className="font-serif text-3xl font-bold">Add stock</h2>
              <p className="mt-2 text-sm text-espresso/60">Record a delivery or inventory correction.</p>
              <label className="mt-6 block text-sm font-semibold">Product<select value={restock.productId} onChange={(event) => setRestock({ ...restock, productId: event.target.value })} className="mt-2 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 font-normal"><option value="">Choose a product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.stock} in stock</option>)}</select></label>
              <label className="mt-4 block text-sm font-semibold">Quantity<input value={restock.quantity} onChange={(event) => setRestock({ ...restock, quantity: event.target.value })} type="number" min="1" max="10000" placeholder="e.g. 25" className="mt-2 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 font-normal" /></label>
              <label className="mt-4 block text-sm font-semibold">Reason<select value={restock.reason} onChange={(event) => setRestock({ ...restock, reason: event.target.value })} className="mt-2 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 font-normal"><option value="Supplier delivery">Supplier delivery</option><option value="Inventory correction">Inventory correction</option><option value="Donation">Donation</option></select></label>
              <button disabled={busy} onClick={() => posAction({ action: 'restock', product_id: Number(restock.productId), quantity: Number(restock.quantity), reason: restock.reason })} className="mt-6 w-full rounded-full bg-muscovado px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Add stock'}</button>
            </section>
            <section><h2 className="font-serif text-3xl font-bold">Current stock</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{products.map((product) => <div key={product.id} className="rounded-2xl bg-paper p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><strong>{product.name}</strong><span className={`rounded-full px-3 py-1 text-xs font-bold ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-calamansi/20 text-roast'}`}>{product.stock} units</span></div><p className="mt-3 text-sm text-espresso/55">₱{product.price} per unit</p></div>)}</div></section>
          </div>
        ) : tab === 'pos' ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
            <section className="lg:col-span-2"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2 rounded-2xl bg-paper p-2"><button onClick={() => setPosView('checkout')} className={`rounded-xl px-5 py-3 text-sm font-semibold ${posView === 'checkout' ? 'bg-espresso text-cream' : 'text-espresso/60'}`}>Checkout</button><button onClick={() => setPosView('sales')} className={`rounded-xl px-5 py-3 text-sm font-semibold ${posView === 'sales' ? 'bg-espresso text-cream' : 'text-espresso/60'}`}>Sales history</button><button onClick={() => setPosView('report')} className={`rounded-xl px-5 py-3 text-sm font-semibold ${posView === 'report' ? 'bg-espresso text-cream' : 'text-espresso/60'}`}>Daily reports</button></div>{shift ? <div className="flex items-center gap-2"><span className="rounded-full bg-calamansi/20 px-3 py-1 text-sm font-semibold">Shift open</span><button onClick={() => posAction({ action: 'close_shift', shift_id: shift.id, closing_cash: 0 })} className="rounded-full border border-espresso/15 px-3 py-1 text-sm font-semibold">Close shift</button></div> : <button onClick={() => posAction({ action: 'open_shift', opening_cash: 0 })} className="rounded-full bg-muscovado px-4 py-2 text-sm font-semibold text-white">Open shift</button>}</div>{posView === 'checkout' ? <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]"><section><h2 className="font-serif text-3xl font-bold">Products</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{products.map((product) => <button key={product.id} disabled={!shift || product.stock < 1} onClick={() => addToCart(product)} className="rounded-2xl bg-paper p-5 text-left shadow-sm transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"><strong>{product.name}</strong><span className="mt-2 block font-serif text-2xl font-bold text-muscovado">₱{product.price}</span><span className="mt-1 block text-sm text-espresso/55">{product.stock} in stock</span></button>)}</div></section><section className="rounded-3xl bg-paper p-5 shadow-sm"><h2 className="font-serif text-3xl font-bold">Current order</h2>{cart.length === 0 ? <p className="mt-6 text-espresso/55">Add products to start an order.</p> : <div className="mt-5 space-y-3">{cart.map((item) => <div key={item.id} className="rounded-xl border border-espresso/10 p-3"><div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{item.name}</span><button onClick={() => removeFromCart(item.id)} className="text-xs font-semibold text-red-700 underline">Remove</button></div><div className="mt-2 flex items-center justify-between"><div className="flex items-center rounded-full border border-espresso/15"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid h-8 w-8 place-items-center text-lg" aria-label={`Decrease ${item.name}`}>−</button><span className="w-8 text-center text-sm font-bold">{item.quantity}</span><button disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="grid h-8 w-8 place-items-center text-lg disabled:opacity-30" aria-label={`Increase ${item.name}`}>+</button></div><span className="font-semibold">₱{item.price * item.quantity}</span></div></div>)}<div className="border-t border-espresso/10 pt-4 text-xl font-bold">Total <span className="float-right">₱{checkoutTotal}</span></div><label className="mt-4 block text-sm font-semibold">Customer <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="mt-2 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 font-normal"><option value="">Walk-in customer (no stamp)</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.student_id} · {member.stamps || 0}/9 stamps</option>)}</select></label><select value={payment} onChange={(event) => setPayment(event.target.value)} className="mt-3 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3"><option value="cash">Cash</option><option value="gcash">GCash</option><option value="card">Card</option></select><label className="mt-3 block text-sm font-semibold">Discount<select value={discountPercent} onChange={(event) => setDiscountPercent(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 font-normal"><option value="0">No discount</option><option value="10">Student · 10%</option><option value="20">Senior citizen · 20%</option><option value="30">Promo · 30%</option></select></label><button disabled={busy || !shift} onClick={() => setConfirmCheckout(true)} className="mt-4 w-full rounded-full bg-muscovado px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Processing…' : 'Complete sale'}</button></div>}</section></div> : posView === 'sales' ? <section className="rounded-3xl bg-paper p-6 shadow-sm"><h2 className="font-serif text-3xl font-bold">Sales history</h2><p className="mt-2 text-sm text-espresso/60">Select a sale to view the customer, order, and cashier.</p>{sales.length === 0 ? <p className="mt-6 text-sm text-espresso/55">No sales recorded yet.</p> : <div className="mt-5 space-y-2">{sales.map((sale) => <button key={sale.id} onClick={() => setSelectedSale(sale)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-espresso/10 p-4 text-left transition hover:bg-cream"><span><strong>Sale #{sale.id}</strong><span className="mt-1 block text-xs text-espresso/55">{new Date(sale.created_at).toLocaleString()} · {sale.customer_name || 'Walk-in'}</span></span><span className="text-right"><strong className="block text-muscovado">₱{sale.total}</strong><span className={`text-xs font-semibold ${sale.status === 'refunded' ? 'text-red-700' : 'text-roast'}`}>{sale.status}</span></span></button>)}</div>}</section>             : <section className="print-report rounded-3xl bg-paper p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h2 className="font-serif text-3xl font-bold">Daily reports</h2><p className="mt-2 text-sm text-espresso/60">Generate an end-of-day summary for the selected date.</p></div><button onClick={() => window.print()} className="print-report-controls rounded-full border border-espresso/15 px-4 py-2 text-sm font-semibold">Print report</button></div><div className="print-report-controls mt-5 flex gap-2"><input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} className="rounded-xl border border-espresso/15 bg-white px-4 py-2" /><button onClick={() => load().catch((loadError) => setError(loadError.message))} className="rounded-xl bg-espresso px-4 py-2 text-sm font-semibold text-cream">Generate</button></div>{report && <div className="mt-5"><p className="text-sm text-espresso/60">Report for {report.date}</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><div><span className="text-xs text-espresso/50">Transactions</span><strong className="block text-xl">{report.summary.transactions}</strong></div><div><span className="text-xs text-espresso/50">Gross sales</span><strong className="block text-xl">₱{report.summary.gross_sales}</strong></div><div><span className="text-xs text-espresso/50">Discounts</span><strong className="block text-xl">₱{report.summary.discounts}</strong></div><div><span className="text-xs text-espresso/50">Net sales</span><strong className="block text-xl text-muscovado">₱{report.summary.revenue}</strong></div></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><h3 className="font-semibold">By payment</h3>{report.payments.length ? report.payments.map((paymentRow) => <p key={paymentRow.payment_method} className="mt-2 flex justify-between text-sm capitalize"><span>{paymentRow.payment_method} ({paymentRow.transactions})</span><span>₱{paymentRow.total}</span></p>) : <p className="mt-2 text-sm text-espresso/55">No completed sales.</p>}</div><div><h3 className="font-semibold">Top products</h3>{report.top_products.length ? report.top_products.map((product) => <p key={product.name} className="mt-2 flex justify-between text-sm"><span>{product.name} × {product.quantity}</span><span>₱{product.total}</span></p>) : <p className="mt-2 text-sm text-espresso/55">No products sold.</p>}</div></div>{Number(report.refunds.transactions) > 0 && <p className="mt-5 text-sm text-red-700">Refunds: {report.refunds.transactions} transaction(s), ₱{report.refunds.total}</p>}</div>}</section>}</section>
          </div>
        ) : tab === 'cards' ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {members.length === 0 && <p className="rounded-2xl border border-dashed border-espresso/20 p-8 text-center text-espresso/60 md:col-span-2">No approved students found.</p>}
            {members.map((member) => <button key={member.id} onClick={() => setSelected(member)} className="rounded-2xl bg-paper p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between gap-4"><span><strong className="text-lg">{member.name}</strong><span className="mt-1 block text-sm text-espresso/55">{member.student_id} · {member.email}</span></span><span className="rounded-full bg-calamansi/20 px-3 py-1 text-xs font-bold text-roast">{member.stamps || 0}/9</span></div>
              <div className="mt-5 grid grid-cols-9 gap-2">{Array.from({ length: 9 }, (_, index) => <span key={index} className={`grid aspect-square place-items-center rounded-full border-2 text-xs font-bold ${index < (member.stamps || 0) ? 'border-muscovado bg-caramel text-cream' : 'border-espresso/15 text-espresso/25'}`}>{index < (member.stamps || 0) ? '✓' : index + 1}</span>)}</div>
              {(member.stamps || 0) >= 9 && !member.reward_redeemed && <p className="mt-4 rounded-xl bg-calamansi/20 px-3 py-2 text-sm font-bold text-roast">Free drink available</p>}
            </button>)}
          </div>
        ) : (
          <div className="mt-6">
            <div className="mb-5 flex flex-wrap gap-2 rounded-2xl bg-paper p-2">
              <button onClick={() => setVerificationView('pending')} className={`rounded-xl px-5 py-3 text-sm font-semibold ${verificationView === 'pending' ? 'bg-espresso text-cream' : 'text-espresso/60'}`}>Pending verification</button>
              <button onClick={() => setVerificationView('users')} className={`rounded-xl px-5 py-3 text-sm font-semibold ${verificationView === 'users' ? 'bg-espresso text-cream' : 'text-espresso/60'}`}>Current users</button>
            </div>
            {verificationView === 'users' ? <div className="space-y-3">{members.length === 0 && <p className="rounded-2xl border border-dashed border-espresso/20 p-8 text-center text-espresso/60">No current registered students found.</p>}{members.map((member) => <div key={member.id} className="flex items-center justify-between gap-4 rounded-2xl border border-espresso/10 bg-paper p-5"><div><strong>{member.name}</strong><p className="mt-1 text-sm text-espresso/60">{member.email}</p><p className="text-sm text-espresso/60">Student ID: {member.student_id}</p></div><button onClick={() => setSelectedUser(member)} className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Delete user</button></div>)}</div> : <div className="mt-6 grid gap-3">
            {students.length === 0 && <p className="rounded-2xl border border-dashed border-espresso/20 p-8 text-center text-espresso/60">No student applications found.</p>}
            {students.map((student) => <button key={student.id} onClick={() => setSelected({ ...student, verification: true })} className="grid gap-1 rounded-2xl border border-espresso/10 bg-paper p-5 text-left shadow-sm transition hover:border-muscovado hover:bg-caramel/5 md:grid-cols-[1fr_auto]"><span><strong>{student.name}</strong><span className="ml-3 text-sm text-espresso/55">{student.email}</span><span className="block text-sm text-espresso/60">Student ID: {student.student_id}</span></span><span className="self-center rounded-full bg-caramel/20 px-3 py-1 text-xs font-bold uppercase">{student.verification_status}</span></button>)}
            </div>}
          </div>
        )}
      </main>
      <AnimatePresence>
        {selectedUser && <motion.div className="fixed inset-0 z-[95] grid place-items-center bg-espresso/50 p-5" role="dialog" aria-modal="true" aria-labelledby="delete-user-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="w-full max-w-md rounded-3xl bg-paper p-6 shadow-2xl" initial={{ y: 18, scale: .96 }} animate={{ y: 0, scale: 1 }}>
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-red-700">Remove account</p>
            <h2 id="delete-user-title" className="mt-2 font-serif text-3xl font-bold">Delete {selectedUser.name}?</h2>
            <p className="mt-4 text-sm text-espresso/65">This removes the student account and stamp history. Existing sales will remain in reports as walk-in sales. This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3"><button disabled={busy} onClick={() => setSelectedUser(null)} className="rounded-full border border-espresso/15 px-5 py-3 font-semibold">Cancel</button><button disabled={busy} onClick={() => action({ action: 'delete_user', user_id: selectedUser.id })} className="rounded-full bg-red-700 px-5 py-3 font-semibold text-white">{busy ? 'Deleting…' : 'Delete user'}</button></div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {selectedSale && <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-espresso/50 p-5" role="dialog" aria-modal="true" aria-labelledby="sale-detail-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-paper p-6 shadow-2xl" initial={{ y: 20 }} animate={{ y: 0 }}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-semibold uppercase tracking-[.2em] text-muscovado">Sale details</p><h2 id="sale-detail-title" className="mt-1 font-serif text-3xl font-bold">Sale #{selectedSale.id}</h2><p className="mt-1 text-sm text-espresso/60">{new Date(selectedSale.created_at).toLocaleString()}</p></div>
              <button onClick={() => setSelectedSale(null)} aria-label="Close sale details" className="text-2xl">×</button>
            </div>
            <div className="mt-6 grid gap-3 rounded-2xl bg-cream p-4 text-sm sm:grid-cols-2">
              <div><p className="text-espresso/50">Customer</p><p className="font-semibold">{selectedSale.customer_name || 'Walk-in customer'}</p>{selectedSale.customer_email && <p className="text-xs text-espresso/60">{selectedSale.customer_email}</p>}</div>
              <div><p className="text-espresso/50">Sale made by</p><p className="font-semibold">{selectedSale.cashier_name || 'Unknown staff member'}</p>{selectedSale.cashier_email && <p className="text-xs text-espresso/60">{selectedSale.cashier_email}</p>}</div>
              <div><p className="text-espresso/50">Payment</p><p className="font-semibold capitalize">{selectedSale.payment_method}</p></div>
              <div><p className="text-espresso/50">Status</p><p className={`font-semibold ${selectedSale.status === 'refunded' ? 'text-red-700' : 'text-roast'}`}>{selectedSale.status}</p></div>
            </div>
            <h3 className="mt-6 font-serif text-2xl font-bold">Ordered items</h3>
            <div className="mt-3 space-y-2">{selectedSale.items.map((item) => <div key={`${selectedSale.id}-${item.product_id}`} className="flex justify-between gap-4 border-b border-espresso/10 pb-2 text-sm"><span>{item.product_name || 'Product'} × {item.quantity}</span><span>₱{item.unit_price * item.quantity}</span></div>)}</div>
            <div className="mt-5 space-y-1 text-right text-sm"><p>Subtotal: ₱{selectedSale.subtotal}</p><p>Discount: ₱{selectedSale.discount}</p><p className="pt-2 text-xl font-bold">Total: ₱{selectedSale.total}</p></div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {selected && <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-espresso/50 p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-paper p-6 shadow-2xl" initial={{ y: 20 }} animate={{ y: 0 }}>
            <div className="flex justify-between"><div><h2 className="font-serif text-3xl font-bold">{selected.name}</h2><p className="mt-1 text-espresso/60">{selected.student_id} · {selected.email}</p></div><button onClick={() => setSelected(null)} aria-label="Close" className="text-2xl">×</button></div>
            {selected.verification ? <><img src={apiUrl(`/id-document.php?id=${encodeURIComponent(selected.id)}`)} alt={`School ID for ${selected.name}`} className="mt-6 max-h-[50vh] w-full rounded-2xl border border-espresso/10 object-contain" /><div className="mt-6 flex justify-end gap-3"><button disabled={busy} onClick={() => action({ student_id: selected.id, decision: 'reject' })} className="rounded-full border border-red-300 px-5 py-3 font-semibold text-red-700">Reject</button><button disabled={busy} onClick={() => action({ student_id: selected.id, decision: 'approve' })} className="rounded-full bg-calamansi px-5 py-3 font-semibold text-espresso">Approve student</button></div></> : <><p className="mt-6 text-espresso/60">Circle the next stamp after confirming a completed purchase.</p><div className="mt-6 grid grid-cols-9 gap-2">{Array.from({ length: 9 }, (_, index) => <span key={index} className={`grid aspect-square place-items-center rounded-full border-2 text-sm font-bold ${index < (selected.stamps || 0) ? 'border-muscovado bg-caramel text-cream' : 'border-espresso/15 text-espresso/30'}`}>{index < (selected.stamps || 0) ? '✓' : index + 1}</span>)}</div><div className="mt-6 flex justify-end gap-3">{(selected.stamps || 0) >= 9 && !selected.reward_redeemed ? <button disabled={busy} onClick={() => action({ action: 'redeem', user_id: selected.id })} className="rounded-full bg-calamansi px-5 py-3 font-semibold text-espresso">Redeem free drink</button> : <button disabled={busy || (selected.stamps || 0) >= 9} onClick={() => action({ action: 'stamp', user_id: selected.id })} className="rounded-full bg-muscovado px-5 py-3 font-semibold text-white">{busy ? 'Saving…' : 'Add purchase stamp'}</button>}</div></>}
          </motion.div>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {confirmCheckout && <motion.div className="fixed inset-0 z-[95] grid place-items-center bg-espresso/60 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-sale-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="w-full max-w-md rounded-3xl bg-paper p-6 shadow-2xl" initial={{ y: 18, scale: .96 }} animate={{ y: 0, scale: 1 }}>
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-muscovado">Review order</p>
            <h2 id="confirm-sale-title" className="mt-2 font-serif text-3xl font-bold">Confirm sale?</h2>
            <div className="mt-5 space-y-2 border-y border-espresso/10 py-4 text-sm">
              {cart.map((item) => <div key={item.id} className="flex justify-between gap-4"><span>{item.name} × {item.quantity}</span><span>₱{item.price * item.quantity}</span></div>)}
              <div className="flex justify-between pt-2 text-espresso/60"><span>Customer</span><span>{selectedCustomer?.name || 'Walk-in'}</span></div>
              <div className="flex justify-between text-espresso/60"><span>Payment</span><span className="capitalize">{payment}</span></div>
              <div className="flex justify-between text-espresso/60"><span>Discount</span><span>{discountPercent}% {discountAmount ? `(₱${discountAmount})` : ''}</span></div>
              <div className="flex justify-between pt-2 text-xl font-bold"><span>Total</span><span>₱{checkoutTotal}</span></div>
            </div>
            {selectedCustomer && <p className="mt-4 rounded-xl bg-calamansi/15 px-4 py-3 text-sm text-roast">This completed sale will add one stamp to {selectedCustomer.name}.</p>}
            <div className="mt-6 flex justify-end gap-3"><button disabled={busy} onClick={() => setConfirmCheckout(false)} className="rounded-full border border-espresso/15 px-5 py-3 font-semibold">Cancel</button><button disabled={busy} onClick={() => { setConfirmCheckout(false); posAction({ action: 'checkout', items: cart, user_id: customerId, payment_method: payment, discount_percent: discountPercent }) }} className="rounded-full bg-muscovado px-5 py-3 font-semibold text-white">{busy ? 'Processing…' : 'Confirm sale'}</button></div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </motion.div>
  )
}
