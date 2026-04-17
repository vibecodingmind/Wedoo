'use client'

import { useState } from 'react'
import { format } from 'date-fns'

interface TimelineEvent {
  id: string; time: string; title: string; description: string; category: string
}

const CATEGORY_STYLES: Record<string, { bg: string; dot: string; border: string; badge: string }> = {
  ceremony: { bg: 'bg-rose-50 dark:bg-rose-950/30', dot: 'bg-rose-500', border: 'border-rose-200 dark:border-rose-800', badge: 'bg-rose-100 text-rose-700' },
  reception: { bg: 'bg-amber-50 dark:bg-amber-950/30', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-100 text-amber-700' },
  dining: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 text-emerald-700' },
  entertainment: { bg: 'bg-violet-50 dark:bg-violet-950/30', dot: 'bg-violet-500', border: 'border-violet-200 dark:border-violet-800', badge: 'bg-violet-100 text-violet-700' },
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  { id: '1', time: '14:00', title: 'Wedding Ceremony', description: 'Exchange of vows and rings. Processional with bridal party entrance.', category: 'ceremony' },
  { id: '2', time: '15:00', title: 'Cocktail Hour', description: 'Welcome drinks and hors d\'oeuvres. Mingling and photo opportunities.', category: 'reception' },
  { id: '3', time: '16:00', title: 'Grand Entrance', description: 'Bridal party announced and welcomed into the reception hall.', category: 'reception' },
  { id: '4', time: '16:15', title: 'First Dance', description: 'The couple\'s first dance as newlyweds. Parents join for a special moment.', category: 'entertainment' },
  { id: '5', time: '16:30', title: 'Toasts & Speeches', description: 'Best man, maid of honor, and family members share heartfelt words.', category: 'reception' },
  { id: '6', time: '17:00', title: 'Dinner Service', description: 'Plated dinner or buffet. Assigned seating with personalized menus.', category: 'dining' },
  { id: '7', time: '18:30', title: 'Cake Cutting', description: 'The couple cuts the wedding cake. First bite tradition.', category: 'dining' },
  { id: '8', time: '19:00', title: 'Bouquet & Garter Toss', description: 'Fun traditions for the single guests. High energy moment!', category: 'entertainment' },
  { id: '9', time: '19:30', title: 'Open Dance Floor', description: 'DJ or band takes over. Dance the night away with all your guests.', category: 'entertainment' },
  { id: '10', time: '22:00', title: 'Sparkler Send-Off', description: 'Grand exit through a tunnel of sparklers. Magical ending to a perfect day.', category: 'ceremony' },
]

export default function Timeline({ weddingDate }: { weddingDate: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>(DEFAULT_EVENTS)
  const [showDialog, setShowDialog] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ time: '', title: '', description: '', category: 'ceremony' })
  const [dragId, setDragId] = useState<string | null>(null)

  const sortedEvents = [...events].sort((a, b) => a.time.localeCompare(b.time))
  const totalMinutes = events.reduce((acc, e) => {
    const [h, m] = e.time.split(':').map(Number)
    return Math.max(acc, h * 60 + m)
  }, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editId) {
      setEvents(events.map(ev => ev.id === editId ? { ...ev, ...form } : ev))
      setEditId(null)
    } else {
      setEvents([...events, { id: Date.now().toString(), ...form }])
    }
    setShowDialog(false)
    setForm({ time: '', title: '', description: '', category: 'ceremony' })
  }

  const openEdit = (ev: TimelineEvent) => {
    setForm({ time: ev.time, title: ev.title, description: ev.description, category: ev.category })
    setEditId(ev.id)
    setShowDialog(true)
  }

  const deleteEvent = (id: string) => {
    setEvents(events.filter(ev => ev.id !== id))
  }

  const handleDragStart = (id: string) => setDragId(id)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const dragIdx = events.findIndex(e => e.id === dragId)
    const targetIdx = events.findIndex(e => e.id === targetId)
    if (dragIdx === -1 || targetIdx === -1) return
    const newEvents = [...events]
    const [moved] = newEvents.splice(dragIdx, 1)
    newEvents.splice(targetIdx, 0, moved)
    setEvents(newEvents)
    setDragId(null)
  }

  const formatTime12 = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h > 12 ? h - 12 : h || 12}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Wedding Day Timeline</h2>
          <p className="text-sm text-muted-foreground">{format(new Date(weddingDate), 'MMMM d, yyyy')} — {events.length} events planned</p>
        </div>
        <button onClick={() => { setShowDialog(true); setEditId(null); setForm({ time: '', title: '', description: '', category: 'ceremony' }) }}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Add Event
        </button>
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <div className={`h-3 w-3 rounded-full ${style.dot}`} />
            <span className="capitalize text-muted-foreground">{key}</span>
          </div>
        ))}
      </div>

      {/* Timeline Visual */}
      <div className="relative">
        {/* Progress Bar */}
        <div className="rounded-xl border bg-card p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Day Progress</span>
            <span className="text-muted-foreground">{formatTime12('14:00')} — {formatTime12('22:00')}</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-muted">
            {sortedEvents.map((ev, i) => {
              const [h, m] = ev.time.split(':').map(Number)
              const mins = h * 60 + m
              const pct = totalMinutes > 0 ? ((mins - 14 * 60) / (totalMinutes - 14 * 60)) * 100 : 0
              return <div key={ev.id} className={`absolute top-0 h-3 w-3 rounded-full ${CATEGORY_STYLES[ev.category]?.dot || 'bg-muted-foreground'}`} style={{ left: `${Math.max(0, Math.min(100, pct))}%`, transform: 'translateX(-50%)' }} title={`${formatTime12(ev.time)} - ${ev.title}`} />
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {sortedEvents.map((ev, i) => {
            const style = CATEGORY_STYLES[ev.category] || CATEGORY_STYLES.ceremony
            return (
              <div key={ev.id}
                draggable
                onDragStart={() => handleDragStart(ev.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(ev.id)}
                className={`relative flex gap-4 pb-6 last:pb-0 cursor-grab active:cursor-grabbing transition-opacity ${dragId === ev.id ? 'opacity-40' : ''}`}>
                {/* Line */}
                {i < sortedEvents.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border" />
                )}
                {/* Dot */}
                <div className="relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center">
                  <div className={`h-4 w-4 rounded-full ${style.dot} ring-4 ring-background`} />
                </div>
                {/* Card */}
                <div className={`flex-1 rounded-xl border ${style.border} ${style.bg} p-4 transition-all hover:shadow-md group`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-rose-600">{formatTime12(ev.time)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.badge}`}>{ev.category}</span>
                      </div>
                      <h4 className="font-semibold">{ev.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{ev.description}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEdit(ev)} className="rounded-md p-1.5 hover:bg-white/60 dark:hover:bg-white/20" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => deleteEvent(ev.id)} className="rounded-md p-1.5 hover:bg-red-100 hover:text-red-600" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDialog(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">{editId ? 'Edit Event' : 'Add Event'}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Time *</label>
                  <input required type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    {Object.keys(CATEGORY_STYLES).map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Event Title *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Cake Cutting" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowDialog(false)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600">{editId ? 'Update' : 'Add Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
