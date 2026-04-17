'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface ChecklistItem {
  id: string; weddingId: string; title: string; category: string; dueDate: string | null; completed: boolean; createdAt: string
}

const CATEGORIES = [
  { value: 'Venue', icon: 'M3 9 9 7 9 17 3 19Z', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { value: 'Catering', icon: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8ZM6 1v3M10 1v3M14 1v3', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'Attire', icon: 'M20.38 3.46 16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'Photography', icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z M15.5 14a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { value: 'Decor', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z M12 16v-4 M12 8h.01', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'Music', icon: 'M9 18V5l12-2v13', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'Stationery', icon: 'M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'Transport', icon: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2 M14 16H9 M7 16H5', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { value: 'General', icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z', color: 'bg-slate-100 text-slate-700 border-slate-200' },
]

export default function Checklist({ weddingId }: { weddingId: string }) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [form, setForm] = useState({ title: '', category: 'General', dueDate: '' })

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      const res = await fetch(`/api/checklist?weddingId=${weddingId}`)
      const data = await res.json()
      if (!cancelled) { setItems(data); setLoading(false) }
    }
    fetchData()
    return () => { cancelled = true }
  }, [weddingId, refreshKey])

  const refresh = () => setRefreshKey(k => k + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/checklist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, title: form.title, category: form.category, dueDate: form.dueDate || null }),
    })
    setShowDialog(false)
    setForm({ title: '', category: 'General', dueDate: '' })
    refresh()
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    await fetch(`/api/checklist/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }),
    })
    refresh()
  }

  const deleteItem = async (id: string) => {
    await fetch(`/api/checklist/${id}`, { method: 'DELETE' })
    refresh()
  }

  const completed = items.filter(i => i.completed).length
  const total = items.length
  const pct = total ? Math.round((completed / total) * 100) : 0

  const filtered = filter === 'ALL' ? items : items.filter(i => i.category === filter)
  const incompleteItems = filtered.filter(i => !i.completed)
  const completedItems = filtered.filter(i => i.completed)

  // Group incomplete items by due date proximity
  const overdue = incompleteItems.filter(i => i.dueDate && new Date(i.dueDate) < new Date())
  const upcoming = incompleteItems.filter(i => i.dueDate && new Date(i.dueDate) >= new Date() && new Date(i.dueDate) <= new Date(Date.now() + 7 * 86400000))
  const later = incompleteItems.filter(i => !i.dueDate || new Date(i.dueDate) > new Date(Date.now() + 7 * 86400000))

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Wedding Checklist</h2>
          <p className="text-sm text-muted-foreground">Track every detail for your perfect day</p>
        </div>
        <button onClick={() => setShowDialog(true)} className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Add Task
        </button>
      </div>

      {/* Progress Overview */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <span className="text-2xl font-bold text-rose-600">{pct}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="text-emerald-600 font-medium">{completed} completed</span>
          <span className="text-amber-600 font-medium">{incompleteItems.length} remaining</span>
          {overdue.length > 0 && <span className="text-red-600 font-medium">{overdue.length} overdue</span>}
        </div>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map(cat => {
          const catItems = items.filter(i => i.category === cat.value)
          const catCompleted = catItems.filter(i => i.completed).length
          if (catItems.length === 0) return null
          const catPct = Math.round((catCompleted / catItems.length) * 100)
          return (
            <button key={cat.value} onClick={() => setFilter(filter === cat.value ? 'ALL' : cat.value)}
              className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${filter === cat.value ? 'ring-2 ring-rose-500' : ''}`}>
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${cat.color.split(' ').slice(0, 2).join(' ')}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={cat.icon} /></svg>
              </div>
              <p className="mt-2 text-sm font-semibold">{cat.value}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-rose-500 transition-all" style={{ width: `${catPct}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{catCompleted}/{catItems.length} done</p>
            </button>
          )
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('ALL')} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          All ({items.length})
        </button>
        <button onClick={() => setFilter('pending')} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          Pending ({incompleteItems.length})
        </button>
        <button onClick={() => setFilter('done')} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === 'done' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          Completed ({completedItems.length})
        </button>
      </div>

      {/* Task Lists */}
      <div className="space-y-6">
        {/* Overdue */}
        {overdue.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Overdue ({overdue.length})
            </h4>
            <div className="space-y-2">
              {overdue.map(item => <ChecklistRow key={item.id} item={item} onToggle={toggleComplete} onDelete={deleteItem} overdue />)}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Due This Week ({upcoming.length})
            </h4>
            <div className="space-y-2">
              {upcoming.map(item => <ChecklistRow key={item.id} item={item} onToggle={toggleComplete} onDelete={deleteItem} />)}
            </div>
          </div>
        )}

        {/* All other pending items */}
        {(filter === 'ALL' || filter === 'pending' || filter === later[0]?.category) && later.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Upcoming Tasks ({later.length})
            </h4>
            <div className="space-y-2">
              {later.map(item => <ChecklistRow key={item.id} item={item} onToggle={toggleComplete} onDelete={deleteItem} />)}
            </div>
          </div>
        )}

        {/* Completed */}
        {(filter === 'ALL' || filter === 'done') && completedItems.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Completed ({completedItems.length})
            </h4>
            <div className="space-y-2">
              {completedItems.map(item => <ChecklistRow key={item.id} item={item} onToggle={toggleComplete} onDelete={deleteItem} />)}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No tasks found</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first task to start planning!</p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDialog(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Add Task</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Task Title *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Book the photographer" />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowDialog(false)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ChecklistRow({ item, onToggle, onDelete, overdue }: {
  item: ChecklistItem
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  overdue?: boolean
}) {
  const cat = CATEGORIES.find(c => c.value === item.category)
  const isOverdue = overdue || (item.dueDate && new Date(item.dueDate) < new Date() && !item.completed)

  return (
    <div className={`group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:shadow-sm ${item.completed ? 'opacity-60' : ''} ${isOverdue ? 'border-red-200' : ''}`}>
      <button
        onClick={() => onToggle(item.id, item.completed)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          item.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/30 hover:border-rose-500'
        }`}
      >
        {item.completed && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {cat && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${cat.color.split(' ').slice(0, 2).join(' ')}`}>
              {item.category}
            </span>
          )}
          {item.dueDate && (
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {format(new Date(item.dueDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  )
}
