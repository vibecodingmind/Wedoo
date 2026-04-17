'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Dashboard from '@/components/wedoo/dashboard'
import Pledges from '@/components/wedoo/pledges'
import Budget from '@/components/wedoo/budget'
import Guests from '@/components/wedoo/guests'
import Messages from '@/components/wedoo/messages'
import Cards from '@/components/wedoo/cards'
import Vendors from '@/components/wedoo/vendors'
import Notifications from '@/components/wedoo/notifications'
import Checklist from '@/components/wedoo/checklist'
import Settings from '@/components/wedoo/settings'
import Assistant from '@/components/wedoo/assistant'
import Gallery from '@/components/wedoo/gallery'
import Seating from '@/components/wedoo/seating'
import Timeline from '@/components/wedoo/timeline'
import PwaInstall from '@/components/wedoo/pwa-install'
import EmailSettings from '@/components/wedoo/email-settings'
import Profile from '@/components/wedoo/profile'

interface Wedding { id: string; name: string; date: string; budget: number; status: string }
interface Pledge { id: string; weddingId: string; amount: number; status: string; contributorName: string; category: string; createdAt: string }
interface BudgetItem { id: string; name: string; allocatedAmount: number; spentAmount: number }
interface Guest { id: string; rsvpStatus: string; name: string }
interface Notification { id: string; title: string; message: string; type: string; read: boolean; createdAt: string }

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { id: 'pledges', label: 'Pledges', icon: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' },
  { id: 'budget', label: 'Budget', icon: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5' },
  { id: 'guests', label: 'Guests', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { id: 'seating', label: 'Seating', icon: 'M3 3h18v18H3zM12 2v20M2 12h20' },
  { id: 'messages', label: 'Messages', icon: 'm3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z' },
  { id: 'cards', label: 'Cards', icon: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2zM14 2v6h6' },
  { id: 'timeline', label: 'Timeline', icon: 'M12 2v20M2 12h20M7 2h10v4H7zM7 18h10v4H7z' },
  { id: 'checklist', label: 'Checklist', icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5zM9 11l3 3L22 4' },
  { id: 'vendors', label: 'Vendors', icon: 'm2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M2 7h20' },
  { id: 'gallery', label: 'Gallery', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21z' },
  { id: 'assistant', label: 'AI Assistant', icon: 'M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z' },
  { id: 'profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
  { id: 'notifications', label: 'Alerts', icon: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0' },
  { id: 'email-settings', label: 'Email Setup', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' },
  { id: 'settings', label: 'Settings', icon: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
]

export default function Home() {
  const { activeModule, setActiveModule, sidebarOpen, setSidebarOpen, unreadNotifications, setUnreadNotifications } = useAppStore()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [pledges, setPledges] = useState<Pledge[]>([])
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [ready, setReady] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wedoo-dark') === 'true'
    }
    return false
  })
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('wedoo-dark', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    const init = async () => {
      await fetch('/api/seed', { method: 'POST' })
      const [wRes, pRes, bRes, gRes, nRes] = await Promise.all([
        fetch('/api/weddings'), fetch('/api/pledges'), fetch('/api/budget'),
        fetch('/api/guests'), fetch('/api/notifications'),
      ])
      const [ws, ps, bs, gs, ns] = await Promise.all([wRes.json(), pRes.json(), bRes.json(), gRes.json(), nRes.json()])
      if (ws.length > 0) {
        setWedding(ws[0])
        setPledges(ps.filter((p: Pledge) => p.weddingId === ws[0].id))
        setBudgetItems(bs.filter((b: BudgetItem) => 'weddingId' in b && (b as BudgetItem & { weddingId: string }).weddingId === ws[0].id))
        setGuests(gs.filter((g: Guest) => 'weddingId' in g && (g as Guest & { weddingId: string }).weddingId === ws[0].id))
        setNotifications(ns.filter((n: Notification) => 'weddingId' in n && (n as Notification & { weddingId: string }).weddingId === ws[0].id))
        setUnreadNotifications(ns.filter((n: Notification) => !n.read).length)
      }
      setReady(true)
    }
    init()
  }, [])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleExport = (type: string) => {
    if (!wedding) return
    window.open(`/api/export-pdf?weddingId=${wedding.id}&type=${type}`, '_blank')
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported!`)
  }

  const renderModule = () => {
    if (!wedding || !ready) return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-rose-500" stroke="currentColor" strokeWidth="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium">Loading your wedding...</p>
      </div>
    )
    switch (activeModule) {
      case 'dashboard': return <Dashboard wedding={wedding} pledges={pledges} budgetItems={budgetItems} guests={guests} notifications={notifications} onNavigate={setActiveModule} />
      case 'pledges': return <Pledges weddingId={wedding.id} />
      case 'budget': return <Budget weddingId={wedding.id} weddingBudget={wedding.budget} />
      case 'guests': return <Guests weddingId={wedding.id} />
      case 'seating': return <Seating weddingId={wedding.id} />
      case 'messages': return <Messages weddingId={wedding.id} />
      case 'cards': return <Cards weddingId={wedding.id} />
      case 'timeline': return <Timeline weddingDate={wedding.date} />
      case 'checklist': return <Checklist weddingId={wedding.id} />
      case 'vendors': return <Vendors />
      case 'gallery': return <Gallery weddingId={wedding.id} />
      case 'assistant': return <Assistant weddingId={wedding.id} weddingBudget={wedding.budget} guestCount={guests.length} weddingDate={wedding.date} />
      case 'profile': return <Profile />
      case 'notifications': return <Notifications weddingId={wedding.id} />
      case 'email-settings': return <EmailSettings weddingId={wedding.id} />
      case 'settings': return <Settings wedding={wedding} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <PwaInstall />
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] animate-in fade-in slide-in-from-top-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-lg flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-full w-64 transform border-r bg-card transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-14 items-center gap-3 px-5 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 shadow-sm shadow-rose-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Wedoo</h1>
          </div>
        </div>
        <nav className="space-y-0.5 p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 7.5rem)' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveModule(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                activeModule === item.id
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
              {item.label}
              {item.id === 'notifications' && unreadNotifications > 0 && (
                <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{unreadNotifications}</span>
              )}
            </button>
          ))}
        </nav>
        {wedding && (
          <div className="absolute bottom-0 left-0 right-0 border-t p-3 bg-card">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-[10px] font-bold text-white">S&J</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{wedding.name}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(wedding.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/80 backdrop-blur-md px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 rounded-lg hover:bg-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold capitalize">{activeModule === 'notifications' ? 'Alerts' : activeModule === 'assistant' ? 'AI Assistant' : activeModule === 'seating' ? 'Seating' : activeModule}</h2>
          </div>
          <div className="flex items-center gap-1">
            {/* Export dropdown */}
            {wedding && ['guests', 'budget', 'checklist'].includes(activeModule) && (
              <button onClick={() => handleExport(activeModule)}
                className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
            )}
            {/* Dark Mode */}
            <button onClick={toggleDarkMode} className="rounded-lg p-1.5 hover:bg-muted transition-colors" title={darkMode ? 'Light mode' : 'Dark mode'}>
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            {/* Notifications */}
            <button onClick={() => setActiveModule('notifications')} className="relative rounded-lg p-1.5 hover:bg-muted transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              {unreadNotifications > 0 && <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-rose-500 text-[8px] font-bold text-white flex items-center justify-center">{unreadNotifications}</span>}
            </button>
            {/* Avatar */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-[10px] font-bold text-white ml-0.5">SJ</div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6 max-w-7xl">
          {renderModule()}
        </main>
      </div>
    </div>
  )
}
