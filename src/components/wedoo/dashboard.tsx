import { differenceInDays, format } from 'date-fns'

interface DashboardProps {
  wedding: { id: string; name: string; date: string; budget: number } | null
  pledges: { id: string; amount: number; status: string; contributorName: string; category: string; createdAt: string }[]
  budgetItems: { id: string; name: string; allocatedAmount: number; spentAmount: number }[]
  guests: { id: string; rsvpStatus: string; name: string }[]
  notifications: { id: string; title: string; message: string; type: string; read: boolean; createdAt: string }[]
  onNavigate: (module: string) => void
}

export default function Dashboard({ wedding, pledges, budgetItems, guests, notifications, onNavigate }: DashboardProps) {
  if (!wedding) return null

  const daysUntil = Math.max(0, differenceInDays(new Date(wedding.date), new Date()))
  const totalPledged = pledges.reduce((s, p) => s + p.amount, 0)
  const paidPledges = pledges.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
  const pendingPledges = pledges.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0)
  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'ACCEPTED').length
  const totalAllocated = budgetItems.reduce((s, b) => s + b.allocatedAmount, 0)
  const totalSpent = budgetItems.reduce((s, b) => s + b.spentAmount, 0)
  const unread = notifications.filter(n => !n.read).length

  const recentActivity = [
    ...notifications.slice(0, 4).map(n => ({ text: n.message, time: n.createdAt, icon: n.type })),
    ...pledges.slice(0, 3).map(p => ({ text: `${p.contributorName} pledged $${p.amount.toLocaleString()}`, time: p.createdAt, icon: 'pledge' })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6)

  const budgetChartData = budgetItems.map(b => ({ name: b.name, value: b.spentAmount, fill: `var(--chart-${(budgetItems.indexOf(b) % 5) + 1})` }))

  return (
    <div className="space-y-6">
      {/* Hero Countdown */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-400 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuMTA1IDAgMi0uODk1IDItMnYtNGMwLTEuMTA1LS44OTUtMi0yLTJoLTJjLTEuMTA1IDAtMiAuODk1LTIgMnY0YzAgMS4xMDUuODk1IDIgMiAyaDR6bTAgMjBjMS4xMDUgMCAyLS44OTUgMi0ydi00YzAtMS4xMDUtLjg5NS0yLTItMmgtMmMtMS4xMDUgMC0yIC44OTUtMiAydjRjMCAxLjEwNS44OTUgMiAyIDJoNHptMC0xMGMxLjEwNSAwIDItLjg5NSAyLTJ2LTRjMC0xLjEwNS0uODk1LTItMi0yaC0yYy0xLjEwNSAwLTIgLjg5NS0yIDJ2NGMwIDEuMTA1Ljg5NSAyIDIgMmg0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10">
          <p className="text-sm font-medium uppercase tracking-wider opacity-80">Your Wedding</p>
          <h1 className="mt-2 text-4xl font-bold">{wedding.name}</h1>
          <p className="mt-1 text-lg opacity-90">{format(new Date(wedding.date), 'MMMM d, yyyy')}</p>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-7xl font-black leading-none">{daysUntil}</span>
            <span className="text-xl font-medium opacity-80 pb-2">days to go</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <button onClick={() => onNavigate('budget')} className="rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Budget</p>
              <p className="text-xl font-bold">${wedding.budget.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (totalSpent / totalAllocated) * 100)}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">${totalSpent.toLocaleString()} spent of ${totalAllocated.toLocaleString()}</p>
          </div>
        </button>

        <button onClick={() => onNavigate('pledges')} className="rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pledges</p>
              <p className="text-xl font-bold">${totalPledged.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-3 text-xs">
            <span className="text-emerald-600">${paidPledges.toLocaleString()} paid</span>
            <span className="text-amber-600">${pendingPledges.toLocaleString()} pending</span>
          </div>
        </button>

        <button onClick={() => onNavigate('guests')} className="rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Confirmed</p>
              <p className="text-xl font-bold">{confirmedGuests}<span className="text-sm font-normal text-muted-foreground">/{guests.length}</span></p>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${guests.length ? (confirmedGuests / guests.length) * 100 : 0}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{guests.filter(g => g.rsvpStatus === 'PENDING').length} awaiting response</p>
          </div>
        </button>

        <button onClick={() => onNavigate('notifications')} className="rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Notifications</p>
              <p className="text-xl font-bold">{unread}<span className="text-sm font-normal text-muted-foreground"> unread</span></p>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {unread > 0 ? 'You have pending notifications' : 'All caught up!'}
          </div>
        </button>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Budget Overview */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Budget Overview</h3>
          <div className="flex items-center gap-6">
            <div className="relative h-40 w-40 shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-muted" strokeWidth="3" />
                {budgetChartData.map((item, i) => {
                  const total = budgetChartData.reduce((s, d) => s + d.value, 0)
                  const pct = total ? (item.value / total) * 100 : 0
                  const offset = budgetChartData.slice(0, i).reduce((s, d) => s + (total ? (d.value / total) * 100 : 0), 0)
                  return <circle key={i} cx="18" cy="18" r="15.9" fill="none" className={item.fill} strokeWidth="3" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={`${-offset}`} strokeLinecap="round" />
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">${totalSpent.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">total spent</span>
              </div>
            </div>
            <div className="space-y-2 overflow-hidden">
              {budgetItems.slice(0, 5).map((item, i) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full bg-chart-${i + 1}`} />
                  <span className="flex-1 truncate text-sm">{item.name}</span>
                  <span className="text-sm font-medium">${item.spentAmount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  item.icon === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                  item.icon === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                  item.icon === 'URGENT' ? 'bg-red-100 text-red-700' :
                  item.icon === 'pledge' ? 'bg-rose-100 text-rose-700' :
                  'bg-sky-100 text-sky-700'
                }`}>
                  {item.icon === 'pledge' ? '$' :
                   item.icon === 'SUCCESS' ? '!' :
                   item.icon === 'WARNING' ? '!!' :
                   item.icon === 'URGENT' ? '!!!' : 'i'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(item.time), 'MMM d, h:mm a')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => onNavigate('pledges')} className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          Add Pledge
        </button>
        <button onClick={() => onNavigate('guests')} className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          Add Guest
        </button>
        <button onClick={() => onNavigate('cards')} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4V8z"/></svg>
          Create Card
        </button>
      </div>
    </div>
  )
}
