'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: string
}

const ROLE_STYLES: Record<string, string> = {
  COUPLE: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
  PLANNER: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  VENDOR: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  GUEST: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

export default function Profile() {
  const { user, setUser } = useAppStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [weddingsCount, setWeddingsCount] = useState(0)
  const [guestsCount, setGuestsCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setProfile(user)
        setEditName(user.name || '')
        setEditEmail(user.email || '')
        return
      }
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
          setEditName(data.name || '')
          setEditEmail(data.email || '')
          setUser(data)
        }
      } catch {
        // silent fail
      }
    }
    loadProfile()
  }, [user, setUser])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [wRes, gRes] = await Promise.all([fetch('/api/weddings'), fetch('/api/guests')])
        if (wRes.ok) {
          const weddings = await wRes.json()
          setWeddingsCount(weddings.length || 1)
        }
        if (gRes.ok) {
          const guests = await gRes.json()
          const accepted = guests.filter((g: { rsvpStatus: string }) => g.rsvpStatus === 'ACCEPTED')
          setGuestsCount(accepted.length + accepted.filter((g: { plusOne: boolean }) => g.plusOne).length)
        }
      } catch {
        // silent fail
      }
    }
    loadStats()
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail }),
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        setUser(updated)
        setEditing(false)
      }
    } catch {
      // silent fail
    }
    setSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      try {
        const res = await fetch(`/api/users/${profile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64 }),
        })
        if (res.ok) {
          const updated = await res.json()
          setProfile(updated)
          setUser(updated)
        }
      } catch {
        // silent fail
      }
    }
    reader.readAsDataURL(file)
  }

  const initials = (profile?.name || profile?.email || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>
        <div className="rounded-xl border bg-card p-8 text-center">
          <div className="h-16 w-16 animate-spin mx-auto mb-4 rounded-full border-4 border-rose-200 border-t-rose-500" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCAyIDQgNC0yIDQtNCA0LTQtMi00LTR6bTAgMGMwLTIgMi00IDQtNHM0IDIgNCA0LTIgNC00IDQtNC0yLTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name || 'Avatar'}
                className="h-24 w-24 rounded-full border-4 border-card object-cover shadow-lg"
              />
            ) : (
              <div className="h-24 w-24 rounded-full border-4 border-card bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-card border-2 border-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{profile.name || 'No name set'}</h3>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${ROLE_STYLES[profile.role] || ROLE_STYLES.GUEST}`}>
                {profile.role}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{weddingsCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Weddings</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{guestsCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Expected Guests</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{ROLE_STYLES[profile.role] ? '1' : '0'}</div>
          <div className="text-xs text-muted-foreground mt-1">Active Plans</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {profile.role === 'COUPLE' ? 'Admin' : 'Member'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Access Level</div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="font-semibold">Account Information</h3>
            <p className="text-xs text-muted-foreground">Update your name and email</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              Edit
            </button>
          ) : (
            <button
              onClick={() => { setEditing(false); setEditName(profile.name || ''); setEditEmail(profile.email || '') }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {editing ? (
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || !editEmail}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Name</div>
                <div className="text-sm font-medium">{profile.name || 'Not set'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="text-sm font-medium">{profile.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Role</div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${ROLE_STYLES[profile.role] || ROLE_STYLES.GUEST}`}>
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account ID */}
      <div className="rounded-xl border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Account ID</h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{profile.id}</p>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(profile.id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copy
          </button>
        </div>
      </div>
    </div>
  )
}
