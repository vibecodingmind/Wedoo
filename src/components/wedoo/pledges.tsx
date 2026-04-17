'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface Pledge {
  id: string; contributorName: string; contributorEmail: string; amount: number; category: string; status: string; message: string; createdAt: string
}

const CATEGORIES = ['Venue', 'Catering', 'Photography', 'Flowers', 'Music', 'Decor', 'Attire', 'Honeymoon', 'General']

export default function Pledges({ weddingId }: { weddingId: string }) {
  const [pledges, setPledges] = useState<Pledge[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [showPayModal, setShowPayModal] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [paidId, setPaidId] = useState<string | null>(null)
  const [filter, setFilter] = useState('ALL')
  const [form, setForm] = useState({ contributorName: '', contributorEmail: '', amount: '', category: 'General', message: '' })

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      const res = await fetch(`/api/pledges?weddingId=${weddingId}`)
      const data = await res.json()
      if (!cancelled) { setPledges(data); setLoading(false) }
    }
    fetchData()
    return () => { cancelled = true }
  }, [weddingId, refreshKey])

  const refresh = () => setRefreshKey(k => k + 1)

  const deletePledge = async (id: string) => {
    await fetch(`/api/pledges/${id}`, { method: 'DELETE' })
    refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/pledges', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, ...form })
    })
    setShowDialog(false)
    setForm({ contributorName: '', contributorEmail: '', amount: '', category: 'General', message: '' })
    refresh()
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/pledges/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    })
    refresh()
  }

  const handlePayNow = async (pledge: Pledge) => {
    setPaying(true)
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pledgeId: pledge.id, amount: pledge.amount }),
      })
      const data = await res.json()
      if (data.success) {
        setPaidId(pledge.id)
        setTimeout(() => {
          setPaidId(null)
          setShowPayModal(null)
          refresh()
        }, 2500)
      }
    } catch {
      // Handle error silently
    } finally {
      setPaying(false)
    }
  }

  const total = pledges.reduce((s, p) => s + p.amount, 0)
  const paid = pledges.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
  const pending = pledges.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0)
  const filtered = filter === 'ALL' ? pledges : pledges.filter(p => p.status === filter)

  const payPledge = showPayModal ? pledges.find(p => p.id === showPayModal) : null

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pledge Management</h2>
          <p className="text-sm text-muted-foreground">Track and manage financial contributions</p>
        </div>
        <button onClick={() => setShowDialog(true)} className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          New Pledge
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Pledged</p>
              <p className="mt-1 text-2xl font-bold">${total.toLocaleString()}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-500">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{pledges.length} total pledge{pledges.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">${paid.toLocaleString()}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{pledges.filter(p => p.status === 'PAID').length} completed</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">${pending.toLocaleString()}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{pledges.filter(p => p.status === 'PENDING').length} awaiting payment</p>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Collection Progress</span>
          <span className="text-muted-foreground">{total ? Math.round((paid / total) * 100) : 0}% collected</span>
        </div>
        <div className="mt-2 h-3 w-full rounded-full bg-muted">
          <div className="h-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all" style={{ width: `${total ? (paid / total) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['ALL', 'PAID', 'PENDING', 'CANCELLED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === f ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()} ({f === 'ALL' ? pledges.length : pledges.filter(p => p.status === f).length})
          </button>
        ))}
      </div>

      {/* Pledge List */}
      <div className="space-y-3">
        {filtered.map(pledge => (
          <div key={pledge.id} className="rounded-xl border bg-card p-4 transition-all hover:shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{pledge.contributorName}</h4>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    pledge.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                    pledge.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>{pledge.status}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{pledge.category}</span>
                  {pledge.contributorEmail && <span>{pledge.contributorEmail}</span>}
                  <span>{format(new Date(pledge.createdAt), 'MMM d, yyyy')}</span>
                </div>
                {pledge.message && <p className="mt-2 text-sm italic text-muted-foreground">&ldquo;{pledge.message}&rdquo;</p>}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">${pledge.amount.toLocaleString()}</p>
                <div className="mt-2 flex gap-2 items-center justify-end">
                  {pledge.status === 'PENDING' && (
                    <>
                      <button onClick={() => setShowPayModal(pledge.id)} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
                        </svg>
                        Pay Now
                      </button>
                      <button onClick={() => updateStatus(pledge.id, 'CANCELLED')} className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200">Cancel</button>
                    </>
                  )}
                  {pledge.status === 'CANCELLED' && (
                    <button onClick={() => updateStatus(pledge.id, 'PENDING')} className="rounded-md bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80">Restore</button>
                  )}
                  <button onClick={() => deletePledge(pledge.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No pledges found</p>}
      </div>

      {/* Payment Confirmation Modal */}
      {showPayModal && payPledge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !paying && setShowPayModal(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            {paidId === payPledge.id ? (
              <div className="flex flex-col items-center py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-emerald-700">Payment Complete!</h3>
                <p className="mt-1 text-sm text-muted-foreground">Thank you for your contribution</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                      <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Confirm Payment</h3>
                    <p className="text-sm text-muted-foreground">Process payment securely</p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium">{payPledge.contributorName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-lg text-emerald-600">${payPledge.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{payPledge.category}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowPayModal(null)} disabled={paying}
                    className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => handlePayNow(payPledge)} disabled={paying}
                    className="flex-1 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                    {paying ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Pay ${payPledge.amount.toLocaleString()}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDialog(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">New Pledge</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Contributor Name *</label>
                <input required value={form.contributorName} onChange={e => setForm({ ...form, contributorName: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Full name" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" value={form.contributorEmail} onChange={e => setForm({ ...form, contributorEmail: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="email@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Amount ($) *</label>
                  <input required type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" rows={2} placeholder="Optional message..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowDialog(false)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600">Create Pledge</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
