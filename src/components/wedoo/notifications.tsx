'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface Notification { id: string; title: string; message: string; type: string; read: boolean; createdAt: string }

const TYPE_STYLES: Record<string, { bg: string; icon: string }> = {
  INFO: { bg: 'bg-sky-100 text-sky-700', icon: 'i' },
  SUCCESS: { bg: 'bg-emerald-100 text-emerald-700', icon: '!' },
  WARNING: { bg: 'bg-amber-100 text-amber-700', icon: '!!' },
  URGENT: { bg: 'bg-red-100 text-red-700', icon: '!!!' },
}

export default function Notifications({ weddingId }: { weddingId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      const res = await fetch(`/api/notifications?weddingId=${weddingId}`)
      const data = await res.json()
      if (!cancelled) { setNotifications(data); setLoading(false) }
    }
    fetchData()
    return () => { cancelled = true }
  }, [weddingId, refreshKey])

  const refresh = () => setRefreshKey(k => k + 1)

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    refresh()
  }

  const markAllRead = async () => {
    await Promise.all(notifications.filter(n => !n.read).map(n => fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })))
    refresh()
  }

  const unread = notifications.filter(n => !n.read).length
  const filtered = filter === 'ALL' ? notifications : notifications.filter(n => n.type === filter)

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm font-medium text-rose-500 hover:text-rose-600">
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'URGENT'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === f ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(notif => {
          const style = TYPE_STYLES[notif.type] || TYPE_STYLES.INFO
          return (
            <button key={notif.id} onClick={() => !notif.read && markRead(notif.id)}
              className={`flex w-full items-start gap-4 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-sm ${!notif.read ? 'border-rose-200 bg-rose-50/30' : ''}`}>
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style.bg}`}>
                {style.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{notif.title}</h4>
                  {!notif.read && <div className="h-2 w-2 rounded-full bg-rose-500" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{notif.message}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{format(new Date(notif.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</p>
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No notifications</p>}
      </div>
    </div>
  )
}
