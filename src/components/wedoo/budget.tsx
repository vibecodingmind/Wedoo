'use client'

import { useState, useEffect } from 'react'

interface BudgetItem {
  id: string; name: string; allocatedAmount: number; spentAmount: number
}

const CHART_COLORS = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500', 'bg-sky-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500']

export default function Budget({ weddingId, weddingBudget }: { weddingId: string; weddingBudget: number }) {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({ name: '', allocatedAmount: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editSpent, setEditSpent] = useState('')

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      const res = await fetch(`/api/budget?weddingId=${weddingId}`)
      const data = await res.json()
      if (!cancelled) { setItems(data); setLoading(false) }
    }
    fetchData()
    return () => { cancelled = true }
  }, [weddingId, refreshKey])

  const refresh = () => setRefreshKey(k => k + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/budget', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, name: form.name, allocatedAmount: parseFloat(form.allocatedAmount) || 0 })
    })
    setShowDialog(false)
    setForm({ name: '', allocatedAmount: '' })
    refresh()
  }

  const updateSpent = async (id: string) => {
    await fetch(`/api/budget/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spentAmount: parseFloat(editSpent) || 0 })
    })
    setEditId(null)
    setEditSpent('')
    refresh()
  }

  const totalAllocated = items.reduce((s, i) => s + i.allocatedAmount, 0)
  const totalSpent = items.reduce((s, i) => s + i.spentAmount, 0)
  const remaining = weddingBudget - totalSpent

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Budget Planner</h2>
          <p className="text-sm text-muted-foreground">Manage and track your wedding expenses</p>
        </div>
        <button onClick={() => setShowDialog(true)} className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Add Category
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Wedding Budget</p>
          <p className="mt-1 text-2xl font-bold">${weddingBudget.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Allocated</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">${totalAllocated.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">${totalSpent.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl border bg-card p-5 ${remaining < 0 ? 'border-red-200 bg-red-50' : ''}`}>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={`mt-1 text-2xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>${remaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Visual Budget Bar */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Budget Utilization</span>
          <span className="text-muted-foreground">${totalSpent.toLocaleString()} of ${weddingBudget.toLocaleString()}</span>
        </div>
        <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex">
          {items.map((item, i) => {
            const pct = weddingBudget ? (item.spentAmount / weddingBudget) * 100 : 0
            return pct > 0 ? <div key={item.id} className={`${CHART_COLORS[i % CHART_COLORS.length]} transition-all`} style={{ width: `${pct}%` }} title={`${item.name}: $${item.spentAmount.toLocaleString()}`} /> : null
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {items.slice(0, 6).map((item, i) => (
            <div key={item.id} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${CHART_COLORS[i % CHART_COLORS.length]}`} />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {items.map((item, i) => {
          const pct = item.allocatedAmount ? Math.min(100, (item.spentAmount / item.allocatedAmount) * 100) : 0
          const overBudget = item.spentAmount > item.allocatedAmount
          return (
            <div key={item.id} className="rounded-xl border bg-card p-4 transition-all hover:shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${CHART_COLORS[i % CHART_COLORS.length]}`} />
                  <h4 className="font-semibold">{item.name}</h4>
                  {overBudget && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Over Budget</span>}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Allocated: <span className="font-medium text-foreground">${item.allocatedAmount.toLocaleString()}</span></span>
                  {editId === item.id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={editSpent} onChange={e => setEditSpent(e.target.value)} className="w-24 rounded border bg-background px-2 py-1 text-xs" autoFocus />
                      <button onClick={() => updateSpent(item.id)} className="rounded bg-emerald-500 px-2 py-1 text-xs text-white">Save</button>
                      <button onClick={() => setEditId(null)} className="rounded bg-muted px-2 py-1 text-xs">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditId(item.id); setEditSpent(item.spentAmount.toString()) }} className="text-muted-foreground hover:text-foreground">
                      Spent: <span className="font-medium">${item.spentAmount.toLocaleString()}</span>
                      <span className="ml-1 text-xs">(edit)</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className={`h-2 rounded-full transition-all ${overBudget ? 'bg-red-500' : CHART_COLORS[i % CHART_COLORS.length]}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>{pct.toFixed(0)}% used</span>
                  <span>${(item.allocatedAmount - item.spentAmount).toLocaleString()} remaining</span>
                </div>
              </div>
            </div>
          )
        })}
        {items.length === 0 && <p className="py-8 text-center text-muted-foreground">No budget categories yet. Add one to get started!</p>}
      </div>

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDialog(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Add Budget Category</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Category Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Venue, Catering" />
              </div>
              <div>
                <label className="text-sm font-medium">Allocated Amount ($) *</label>
                <input required type="number" min="1" value={form.allocatedAmount} onChange={e => setForm({ ...form, allocatedAmount: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowDialog(false)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600">Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
