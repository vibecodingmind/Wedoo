'use client'

import { useState } from 'react'

interface NotificationSetting {
  id: string
  label: string
  description: string
  icon: string
  enabled: boolean
}

const INITIAL_SETTINGS: NotificationSetting[] = [
  {
    id: 'rsvp',
    label: 'RSVP Notifications',
    description: 'Get notified when guests accept or decline your invitation',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    enabled: true,
  },
  {
    id: 'pledge',
    label: 'Pledge Notifications',
    description: 'Receive updates when new pledges are created or paid',
    icon: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
    enabled: true,
  },
  {
    id: 'checklist',
    label: 'Checklist Reminders',
    description: 'Get reminders for upcoming checklist deadlines and tasks',
    icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5zM9 11l3 3L22 4',
    enabled: false,
  },
  {
    id: 'budget',
    label: 'Budget Alerts',
    description: 'Alerts when spending exceeds 80% in any budget category',
    icon: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5',
    enabled: true,
  },
  {
    id: 'wedding',
    label: 'Wedding Reminders',
    description: 'Countdown reminders as your wedding day approaches',
    icon: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
    enabled: true,
  },
]

export default function EmailSettings({ weddingId }: { weddingId: string }) {
  const [settings, setSettings] = useState<NotificationSetting[]>(INITIAL_SETTINGS)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  const testNotification = async (setting: NotificationSetting) => {
    setTesting(setting.id)
    setTestResult(null)
    try {
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: setting.id === 'rsvp' ? 'RSVP_RECEIVED' : setting.id === 'pledge' ? 'PLEDGE_RECEIVED' : setting.id === 'checklist' ? 'CHECKLIST_REMINDER' : setting.id === 'budget' ? 'BUDGET_ALERT' : 'WEDDING_REMINDER',
          weddingId,
          recipientEmail: 'test@example.com',
          data: {
            guestName: 'Test Guest',
            amount: 100,
            itemTitle: 'Test Item',
            categoryName: 'Test Category',
            weddingName: 'Test Wedding',
            daysUntil: 30,
            status: 'ACCEPTED',
          },
        }),
      })
      const data = await res.json()
      if (data.success) {
        setTestResult({ type: 'success', message: `"${setting.label}" test email sent successfully!` })
      } else {
        setTestResult({ type: 'error', message: data.error || 'Failed to send test notification' })
      }
    } catch {
      setTestResult({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setTesting(null)
    }
  }

  const enabledCount = settings.filter(s => s.enabled).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Email Setup</h2>
        <p className="text-sm text-muted-foreground">Configure which notifications you&apos;d like to receive via email</p>
      </div>

      {/* Summary Card */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-500">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">Notification Summary</p>
              <p className="text-xs text-muted-foreground">{enabledCount} of {settings.length} notification types enabled</p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-sm font-bold text-emerald-600">{enabledCount}</span>
          </div>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-muted">
          <div className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300" style={{ width: `${(enabledCount / settings.length) * 100}%` }} />
        </div>
      </div>

      {/* Test Result Toast */}
      {testResult && (
        <div className={`rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
          testResult.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
            testResult.type === 'success' ? 'bg-emerald-200' : 'bg-red-200'
          }`}>
            {testResult.type === 'success' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            )}
          </div>
          <p className="text-sm font-medium">{testResult.message}</p>
          <button onClick={() => setTestResult(null)} className="ml-auto shrink-0 p-1 rounded-md hover:bg-black/5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Settings Cards */}
      <div className="space-y-3">
        {settings.map(setting => (
          <div key={setting.id} className={`rounded-xl border bg-card p-5 transition-all ${setting.enabled ? 'border-rose-200' : ''}`}>
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                setting.enabled ? 'bg-rose-100 text-rose-600' : 'bg-muted text-muted-foreground'
              }`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={setting.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-sm">{setting.label}</h4>
                  <button
                    type="button"
                    onClick={() => toggleSetting(setting.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      setting.enabled ? 'bg-rose-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{setting.description}</p>
                <div className="mt-3">
                  <button
                    onClick={() => testNotification(setting)}
                    disabled={testing === setting.id || !setting.enabled}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {testing === setting.id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    )}
                    {testing === setting.id ? 'Sending...' : 'Test Notification'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
