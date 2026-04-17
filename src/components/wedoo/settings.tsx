'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface Wedding {
  id: string; name: string; date: string; budget: number; status: string
}

const STATUS_OPTIONS = [
  { value: 'PLANNING', label: 'Planning', color: 'bg-amber-100 text-amber-700' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-sky-100 text-sky-700' },
  { value: 'FINALIZING', label: 'Finalizing', color: 'bg-violet-100 text-violet-700' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
]

export default function Settings({ wedding }: { wedding: Wedding }) {
  const [form, setForm] = useState({ name: wedding.name, date: wedding.date.split('T')[0], budget: wedding.budget.toString(), status: wedding.status })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [exportToast, setExportToast] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/weddings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: wedding.id,
        name: form.name,
        date: new Date(form.date).toISOString(),
        budget: parseFloat(form.budget) || 0,
        status: form.status,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDeleteAllData = async () => {
    await fetch(`/api/weddings?id=${wedding.id}`, { method: 'DELETE' })
    setShowDeleteConfirm(false)
    window.location.reload()
  }

  const currentStatus = STATUS_OPTIONS.find(s => s.value === wedding.status) || STATUS_OPTIONS[0]
  const daysUntil = Math.max(0, Math.ceil((new Date(wedding.date).getTime() - new Date().getTime()) / 86400000))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Wedding Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your wedding details and preferences</p>
      </div>

      {/* Status Banner */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Status</p>
            <div className="mt-1 flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
              <span className="text-sm text-muted-foreground">{daysUntil} days remaining</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Wedding Date: <span className="font-medium text-foreground">{format(new Date(wedding.date), 'MMMM d, yyyy')}</span>
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="text-lg font-semibold">Wedding Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Wedding Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                placeholder="e.g., Sarah & James"
              />
              <p className="mt-1 text-xs text-muted-foreground">This will appear on your dashboard and cards</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1.5">Wedding Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Total Budget ($)</label>
                <input
                  type="number"
                  min="0"
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Planning Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, status: opt.value })}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      form.status === opt.value
                        ? `${opt.color} ring-2 ring-offset-1 ring-current`
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : saved ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            )}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-medium">All changes saved successfully</span>}
        </div>
      </form>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/30 p-6">
        <h3 className="text-lg font-semibold text-red-700">Danger Zone</h3>
        <p className="mt-1 text-sm text-red-600/80">These actions are irreversible. Please be certain before proceeding.</p>
        <div className="mt-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Reset All Data
          </button>
          <p className="mt-1 text-xs text-red-500/60">This will delete all wedding data and restart with fresh sample data</p>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-center">Reset All Data?</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center">This will permanently delete all your wedding data, including pledges, guests, budget items, messages, and cards. This cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted">Cancel</button>
              <button onClick={handleDeleteAllData} className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600">Yes, Reset Everything</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Reports */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold">Export Reports</h3>
        <p className="mt-1 text-sm text-muted-foreground">Download printable reports for your wedding planning</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { type: 'guests', label: 'Guest List', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
            { type: 'budget', label: 'Budget Report', icon: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
            { type: 'checklist', label: 'Checklist', icon: 'M9 11l3 3L22 4M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
            { type: 'full', label: 'Full Report', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
          ].map(item => (
            <button
              key={item.type}
              onClick={() => {
                window.open(`/api/export-pdf?weddingId=${wedding.id}&type=${item.type}`, '_blank')
                setExportToast(`${item.label} exported!`)
                setTimeout(() => setExportToast(null), 3000)
              }}
              className="flex items-center gap-3 rounded-lg border p-3 text-left text-sm font-medium hover:bg-muted transition-colors"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.color}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
              </div>
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">Print / Save as PDF</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {exportToast && (
        <div className="fixed top-4 right-4 z-[100] animate-in fade-in slide-in-from-top-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-lg flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {exportToast}
        </div>
      )}

      {/* App Info */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold">About Wedoo</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">License</span>
            <span className="font-medium">Premium</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Storage Used</span>
            <span className="font-medium">2.4 MB</span>
          </div>
        </div>
      </div>
    </div>
  )
}
