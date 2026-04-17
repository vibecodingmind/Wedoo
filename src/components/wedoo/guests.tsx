'use client'

import { useState, useEffect } from 'react'

interface Guest {
  id: string; name: string; email: string | null; phone: string | null; dietaryRestriction: string | null; rsvpStatus: string; tableNumber: number | null; plusOne: boolean; createdAt: string
}

export default function Guests({ weddingId }: { weddingId: string }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [form, setForm] = useState({ name: '', email: '', phone: '', dietaryRestriction: '', plusOne: false })

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      const res = await fetch(`/api/guests?weddingId=${weddingId}`)
      const data = await res.json()
      if (!cancelled) { setGuests(data); setLoading(false) }
    }
    fetchData()
    return () => { cancelled = true }
  }, [weddingId, refreshKey])

  const refresh = () => setRefreshKey(k => k + 1)

  const deleteGuest = async (id: string) => {
    await fetch(`/api/guests/${id}`, { method: 'DELETE' })
    refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/guests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, ...form })
    })
    setShowDialog(false)
    setForm({ name: '', email: '', phone: '', dietaryRestriction: '', plusOne: false })
    refresh()
  }

  const updateRSVP = async (id: string, status: string) => {
    await fetch(`/api/guests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rsvpStatus: status })
    })
    refresh()
  }

  const confirmed = guests.filter(g => g.rsvpStatus === 'ACCEPTED').length
  const declined = guests.filter(g => g.rsvpStatus === 'DECLINED').length
  const pending = guests.filter(g => g.rsvpStatus === 'PENDING').length
  const filtered = guests.filter(g =>
    (filter === 'ALL' || g.rsvpStatus === filter) &&
    (!search || g.name.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Guest Manager</h2>
          <p className="text-sm text-muted-foreground">Track RSVPs and manage your guest list</p>
        </div>
        <button onClick={() => setShowDialog(true)} className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          Add Guest
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5"><p className="text-xs text-muted-foreground">Total Guests</p><p className="mt-1 text-2xl font-bold">{guests.length}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-xs text-muted-foreground">Confirmed</p><p className="mt-1 text-2xl font-bold text-emerald-600">{confirmed}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-xs text-muted-foreground">Declined</p><p className="mt-1 text-2xl font-bold text-red-600">{declined}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-xs text-muted-foreground">Pending</p><p className="mt-1 text-2xl font-bold text-amber-600">{pending}</p></div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-[200px] rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Search guests..." />
        {['ALL', 'ACCEPTED', 'PENDING', 'DECLINED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${filter === f ? 'bg-violet-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Guest Table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="hidden md:table-cell px-4 py-3 text-left font-medium">Email</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left font-medium">Dietary</th>
                <th className="px-4 py-3 text-left font-medium">RSVP</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left font-medium">Table</th>
                <th className="px-4 py-3 text-left font-medium">+1</th>
                <th className="px-4 py-3 text-left font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(guest => (
                <tr key={guest.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{guest.name}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-muted-foreground">{guest.email || '-'}</td>
                  <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground">{guest.dietaryRestriction || '-'}</td>
                  <td className="px-4 py-3">
                    <select value={guest.rsvpStatus} onChange={e => updateRSVP(guest.id, e.target.value)}
                      className={`rounded-md border-0 px-2 py-1 text-xs font-medium cursor-pointer ${
                        guest.rsvpStatus === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                        guest.rsvpStatus === 'DECLINED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="DECLINED">Declined</option>
                    </select>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3">{guest.tableNumber || '-'}</td>
                  <td className="px-4 py-3">{guest.plusOne ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteGuest(guest.id)} className="rounded p-1 text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No guests found</p>}
        </div>
      </div>

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDialog(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Add Guest</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div><label className="text-sm font-medium">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Guest name" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-sm font-medium">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="text-sm font-medium">Dietary Restriction</label><input value={form.dietaryRestriction} onChange={e => setForm({ ...form, dietaryRestriction: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Vegetarian, Gluten-free" /></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.plusOne} onChange={e => setForm({ ...form, plusOne: e.target.checked })} className="rounded" /><span className="text-sm font-medium">Has a plus one</span></label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowDialog(false)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600">Add Guest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
