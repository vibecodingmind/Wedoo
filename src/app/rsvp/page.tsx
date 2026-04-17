'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface GuestData {
  id: string
  name: string
  email: string | null
  phone: string | null
  dietaryRestriction: string | null
  rsvpStatus: string
  tableNumber: number | null
  plusOne: boolean
  wedding: {
    name: string
    date: string
  }
}

function RSVPContent() {
  const searchParams = useSearchParams()
  const guestId = searchParams.get('guestId')

  const [guest, setGuest] = useState<GuestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    rsvpStatus: '',
    plusOne: false,
    dietaryRestriction: '',
    message: '',
  })

  useEffect(() => {
    if (!guestId) {
      setError('No guest ID provided. Please check your invitation link.')
      setLoading(false)
      return
    }
    const fetchGuest = async () => {
      try {
        const res = await fetch(`/api/rsvp?guestId=${guestId}`)
        if (!res.ok) {
          setError('Guest not found. Please check your invitation link.')
          return
        }
        const data = await res.json()
        setGuest(data)
        setForm({
          rsvpStatus: data.rsvpStatus || '',
          plusOne: data.plusOne || false,
          dietaryRestriction: data.dietaryRestriction || '',
          message: '',
        })
      } catch {
        setError('Failed to load guest information. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchGuest()
  }, [guestId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestId || !form.rsvpStatus) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          rsvpStatus: form.rsvpStatus,
          plusOne: form.plusOne,
          dietaryRestriction: form.dietaryRestriction,
          message: form.message,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch {
      // Handle error silently
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500 mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-md w-full text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Oops!</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Confetti */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${6 + Math.random() * 10}px`,
                height: `${6 + Math.random() * 10}px`,
                background: ['#f43f5e', '#ec4899', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 7)],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                top: '-20px',
              }}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-md w-full text-center relative z-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-6 animate-bounce-in">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-muted-foreground mb-2">Your RSVP has been received</p>
          <p className="text-sm text-muted-foreground">
            {form.rsvpStatus === 'ACCEPTED'
              ? "We can't wait to celebrate with you!"
              : "We're sorry you can't make it. We'll miss you!"}
          </p>
          {form.rsvpStatus === 'ACCEPTED' && form.plusOne && (
            <p className="text-sm text-rose-500 mt-1 font-medium">Your plus-one is confirmed!</p>
          )}
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-100">
            <p className="text-xs text-rose-600">We'll send more details closer to the date</p>
          </div>
        </div>

        <style jsx>{`
          @keyframes confetti {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          .animate-confetti {
            animation: confetti linear forwards;
          }
          @keyframes bounce-in {
            0% { transform: scale(0); }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .animate-bounce-in {
            animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
        `}</style>
      </div>
    )
  }

  if (!guest) return null

  const weddingDate = new Date(guest.wedding.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-6 text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </div>
              <span className="text-lg font-bold">Wedoo</span>
            </div>
            <h1 className="text-2xl font-bold">{guest.wedding.name}</h1>
            <p className="mt-1 text-rose-100 text-sm flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              {weddingDate}
            </p>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">You&apos;re invited!</p>
              <h2 className="text-xl font-bold mt-1">{guest.name}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* RSVP Buttons */}
              <div>
                <label className="block text-sm font-medium mb-2">Will you attend?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, rsvpStatus: 'ACCEPTED' }))}
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      form.rsvpStatus === 'ACCEPTED'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-emerald-300 text-muted-foreground'
                    }`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`mx-auto mb-1.5 ${form.rsvpStatus === 'ACCEPTED' ? 'text-emerald-500' : ''}`}>
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    <span className="text-sm font-semibold">Joyfully Accept</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, rsvpStatus: 'DECLINED' }))}
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      form.rsvpStatus === 'DECLINED'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300 text-muted-foreground'
                    }`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`mx-auto mb-1.5 ${form.rsvpStatus === 'DECLINED' ? 'text-red-500' : ''}`}>
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                    <span className="text-sm font-semibold">Regretfully Decline</span>
                  </button>
                </div>
              </div>

              {/* Plus One */}
              {form.rsvpStatus === 'ACCEPTED' && (
                <div className="rounded-lg border p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                  {/* Plus One Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Bringing a guest?</p>
                      <p className="text-xs text-muted-foreground">Let us know if you&apos;ll have a plus-one</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, plusOne: !f.plusOne }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.plusOne ? 'bg-rose-500' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.plusOne ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Dietary Restriction */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Dietary Restrictions</label>
                    <input
                      type="text"
                      value={form.dietaryRestriction}
                      onChange={e => setForm(f => ({ ...f, dietaryRestriction: e.target.value }))}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      placeholder="e.g., Vegetarian, Gluten-free, Nut allergy..."
                    />
                  </div>

                  {/* Personal Message */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Personal Message (optional)</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Share your wishes for the happy couple..."
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!form.rsvpStatus || submitting}
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Send RSVP
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              Can&apos;t wait to celebrate with you! •{' '}
              <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent font-medium">
                Wedoo
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RSVPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
      </div>
    }>
      <RSVPContent />
    </Suspense>
  )
}
