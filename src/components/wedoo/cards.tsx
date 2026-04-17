'use client'

import { useState, useEffect } from 'react'

interface Card { id: string; type: string; title: string; subtitle: string; designData: string; createdAt: string }

const TEMPLATES = [
  { id: 'blush', name: 'Blush Romance', bg: 'from-rose-100 via-pink-50 to-white', accent: 'text-rose-600', border: 'border-rose-200' },
  { id: 'classic', name: 'Classic Elegance', bg: 'from-amber-50 via-yellow-50 to-white', accent: 'text-amber-700', border: 'border-amber-200' },
  { id: 'garden', name: 'Garden Party', bg: 'from-emerald-50 via-teal-50 to-white', accent: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'modern', name: 'Modern Minimal', bg: 'from-slate-100 via-gray-50 to-white', accent: 'text-slate-700', border: 'border-slate-200' },
]

const CARD_TYPES = ['SAVE_THE_DATE', 'INVITATION', 'THANK_YOU']
const TYPE_LABELS: Record<string, string> = { SAVE_THE_DATE: 'Save the Date', INVITATION: 'Invitation', THANK_YOU: 'Thank You' }

export default function Cards({ weddingId }: { weddingId: string }) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ type: 'SAVE_THE_DATE', title: '', subtitle: '', template: 'blush' })
  const [preview, setPreview] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      const res = await fetch(`/api/cards?weddingId=${weddingId}`)
      const data = await res.json()
      if (!cancelled) { setCards(data); setLoading(false) }
    }
    fetchData()
    return () => { cancelled = true }
  }, [weddingId, refreshKey])

  const refresh = () => setRefreshKey(k => k + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/cards', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, type: form.type, title: form.title, subtitle: form.subtitle, designData: { template: form.template } })
    })
    setShowCreate(false)
    setForm({ type: 'SAVE_THE_DATE', title: '', subtitle: '', template: 'blush' })
    refresh()
  }

  const deleteCard = async (id: string) => {
    await fetch(`/api/cards/${id}`, { method: 'DELETE' })
    refresh()
  }

  const selectedTemplate = TEMPLATES.find(t => t.id === form.template) || TEMPLATES[0]

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Card Studio</h2>
          <p className="text-sm text-muted-foreground">Design beautiful wedding stationery</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Create Card
        </button>
      </div>

      {/* Existing Cards */}
      {cards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(card => {
            let design = { template: 'blush' }
            try { design = JSON.parse(card.designData) } catch {}
            const tpl = TEMPLATES.find(t => t.id === design.template) || TEMPLATES[0]
            return (
              <div key={card.id} className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md">
                <div className={`relative aspect-[3/2] bg-gradient-to-br ${tpl.bg} flex items-center justify-center p-6`}>
                  <div className="text-center">
                    <p className={`text-xs font-medium uppercase tracking-widest ${tpl.accent} opacity-70`}>{TYPE_LABELS[card.type] || card.type}</p>
                    <h4 className={`mt-2 text-2xl font-bold ${tpl.accent}`}>{card.title}</h4>
                    {card.subtitle && <p className="mt-1 text-sm text-muted-foreground">{card.subtitle}</p>}
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => deleteCard(card.id)} className="rounded-md bg-red-500/90 p-1.5 text-white hover:bg-red-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{TYPE_LABELS[card.type]}</span>
                    <span className="text-xs text-muted-foreground capitalize">{tpl.name}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {cards.length === 0 && !showCreate && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-lg text-muted-foreground">No cards created yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Click &ldquo;Create Card&rdquo; to design your first wedding card</p>
        </div>
      )}

      {/* Create Flow */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Card</h3>
              <button onClick={() => setPreview(!preview)} className="text-sm text-rose-500 hover:text-rose-600 font-medium">{preview ? 'Edit' : 'Preview'}</button>
            </div>

            {preview ? (
              <div className="mt-4 flex justify-center">
                <div className={`w-full max-w-sm aspect-[3/2] bg-gradient-to-br ${selectedTemplate.bg} rounded-2xl ${selectedTemplate.border} border-2 flex items-center justify-center p-8 shadow-lg`}>
                  <div className="text-center">
                    <p className={`text-xs font-medium uppercase tracking-widest ${selectedTemplate.accent} opacity-70`}>{TYPE_LABELS[form.type]}</p>
                    <h4 className={`mt-3 text-3xl font-bold ${selectedTemplate.accent}`}>{form.title || 'Your Title'}</h4>
                    {form.subtitle && <p className="mt-2 text-sm text-muted-foreground max-w-[200px] mx-auto">{form.subtitle}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {CARD_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                      className={`rounded-xl border p-3 text-left text-sm font-medium transition-colors ${form.type === t ? 'border-rose-500 bg-rose-50 text-rose-700' : 'hover:bg-muted'}`}>
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Sarah & James" />
                </div>
                <div>
                  <label className="text-sm font-medium">Subtitle</label>
                  <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., request the pleasure of your company" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Design Template</label>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.map(tpl => (
                      <button key={tpl.id} type="button" onClick={() => setForm({ ...form, template: tpl.id })}
                        className={`rounded-xl border-2 p-3 text-left transition-all ${form.template === tpl.id ? `${tpl.border} shadow-sm` : 'border-transparent hover:bg-muted'}`}>
                        <div className={`h-12 rounded-lg bg-gradient-to-br ${tpl.bg} mb-2`} />
                        <p className="text-sm font-medium">{tpl.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCreate(false); setPreview(false) }} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                  <button type="submit" className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">Create Card</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
