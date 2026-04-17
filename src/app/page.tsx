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

interface Wedding { id: string; name: string; date: string; budget: number; status: string }
interface Pledge { id: string; amount: number; status: string; contributorName: string; category: string; createdAt: string }
interface BudgetItem { id: string; name: string; allocatedAmount: number; spentAmount: number }
interface Guest { id: string; rsvpStatus: string; name: string }
interface Notification { id: string; title: string; message: string; type: string; read: boolean; createdAt: string }

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', paths: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', '9 22V12', '15 22V12', '2 10', '22 10'] },
  { id: 'pledges', label: 'Pledges', paths: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'] },
  { id: 'budget', label: 'Budget', paths: ['M21 12V7H5a2 2 0 0 1 0-4h14v4', 'M3 5v14a2 2 0 0 0 2 2h16v-5', '18 12a2 2 0 0 0 0 4h4v-4Z'] },
  { id: 'guests', label: 'Guests', paths: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'] },
  { id: 'messages', label: 'Messages', paths: ['m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z'] },
  { id: 'cards', label: 'Cards', paths: ['M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'] },
  { id: 'checklist', label: 'Checklist', paths: ['M12 20h9', 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z', 'M9 11l3 3L22 4'] },
  { id: 'vendors', label: 'Vendors', paths: ['m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7', 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'M2 7h20'] },
  { id: 'notifications', label: 'Alerts', paths: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'] },
  { id: 'settings', label: 'Settings', paths: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'] },
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
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
      case 'messages': return <Messages weddingId={wedding.id} />
      case 'cards': return <Cards weddingId={wedding.id} />
      case 'checklist': return <Checklist weddingId={wedding.id} />
      case 'vendors': return <Vendors />
      case 'notifications': return <Notifications weddingId={wedding.id} />
      case 'settings': return <Settings wedding={wedding} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-full w-64 transform border-r bg-card transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 px-6 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-sm shadow-rose-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Wedoo</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5 tracking-wide">WEDDING PLANNER</p>
          </div>
        </div>
        <nav className="space-y-1 p-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveModule(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                activeModule === item.id
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.paths.map((d, i) => <path key={i} d={d} />)}
              </svg>
              {item.label}
              {item.id === 'notifications' && unreadNotifications > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{unreadNotifications}</span>
              )}
            </button>
          ))}
        </nav>
        {wedding && (
          <div className="absolute bottom-0 left-0 right-0 border-t p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-xs font-bold text-white">S&J</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Active Wedding</p>
                <p className="text-sm font-semibold truncate">{wedding.name}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-md px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold capitalize">{activeModule === 'notifications' ? 'Alerts' : activeModule === 'checklist' ? 'Checklist' : activeModule}</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="rounded-lg p-2 hover:bg-muted transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            {/* Notifications */}
            <button onClick={() => setActiveModule('notifications')} className="relative rounded-lg p-2 hover:bg-muted transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              {unreadNotifications > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">{unreadNotifications}</span>
              )}
            </button>

            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-xs font-bold text-white ml-1">
              SJ
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8 max-w-7xl">
          {renderModule()}
        </main>
      </div>
    </div>
  )
}
