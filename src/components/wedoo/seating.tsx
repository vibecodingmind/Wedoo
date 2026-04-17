'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

interface Guest {
  id: string
  name: string
  email: string | null
  rsvpStatus: string
  tableNumber: number | null
  plusOne: boolean
}

interface TableAssignment {
  tableNumber: number
  guestIds: string[]
}

// Static Tailwind class sets per table index — ensures JIT detection
const TABLE_STYLES = [
  {
    circleBg: 'bg-rose-100 dark:bg-rose-950/50',
    circleBorder: 'border-rose-300 dark:border-rose-700',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800',
    dot: 'bg-rose-400',
    countBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
  {
    circleBg: 'bg-pink-100 dark:bg-pink-950/50',
    circleBorder: 'border-pink-300 dark:border-pink-700',
    badge: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800',
    dot: 'bg-pink-400',
    countBg: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  },
  {
    circleBg: 'bg-amber-100 dark:bg-amber-950/50',
    circleBorder: 'border-amber-300 dark:border-amber-700',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-400',
    countBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    circleBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    circleBorder: 'border-emerald-300 dark:border-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-400',
    countBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    circleBg: 'bg-sky-100 dark:bg-sky-950/50',
    circleBorder: 'border-sky-300 dark:border-sky-700',
    badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800',
    dot: 'bg-sky-400',
    countBg: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  {
    circleBg: 'bg-violet-100 dark:bg-violet-950/50',
    circleBorder: 'border-violet-300 dark:border-violet-700',
    badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800',
    dot: 'bg-violet-400',
    countBg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  {
    circleBg: 'bg-teal-100 dark:bg-teal-950/50',
    circleBorder: 'border-teal-300 dark:border-teal-700',
    badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800',
    dot: 'bg-teal-400',
    countBg: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  },
  {
    circleBg: 'bg-orange-100 dark:bg-orange-950/50',
    circleBorder: 'border-orange-300 dark:border-orange-700',
    badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800',
    dot: 'bg-orange-400',
    countBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  {
    circleBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/50',
    circleBorder: 'border-fuchsia-300 dark:border-fuchsia-700',
    badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/30 dark:text-fuchsia-300 dark:border-fuchsia-800',
    dot: 'bg-fuchsia-400',
    countBg: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  },
  {
    circleBg: 'bg-lime-100 dark:bg-lime-950/50',
    circleBorder: 'border-lime-300 dark:border-lime-700',
    badge: 'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950/30 dark:text-lime-300 dark:border-lime-800',
    dot: 'bg-lime-400',
    countBg: 'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300',
  },
]

function getTableStyle(index: number) {
  return TABLE_STYLES[index % TABLE_STYLES.length]
}

export default function Seating({ weddingId }: { weddingId: string }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [tables, setTables] = useState<TableAssignment[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({ tableNumber: i + 1, guestIds: [] }))
  )
  const [loading, setLoading] = useState(true)
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null)
  const [searchUnseated, setSearchUnseated] = useState('')

  // ── Fetch guests & pre-assign from DB ──────────────────────────────
  useEffect(() => {
    let cancelled = false
    const fetchGuests = async () => {
      try {
        const res = await fetch(`/api/guests?weddingId=${weddingId}`)
        const data: Guest[] = await res.json()
        if (cancelled) return
        setGuests(data)
        // Auto-assign guests that already have tableNumber set
        setTables(prev => {
          const next = prev.map(t => ({ ...t, guestIds: [] as string[] }))
          data.forEach(g => {
            if (g.tableNumber != null) {
              const idx = next.findIndex(t => t.tableNumber === g.tableNumber)
              if (idx !== -1) next[idx].guestIds.push(g.id)
            }
          })
          return next
        })
      } catch {
        /* empty */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchGuests()
    return () => {
      cancelled = true
    }
  }, [weddingId])

  // ── Derived state ──────────────────────────────────────────────────
  const guestMap = useMemo(() => {
    const m = new Map<string, Guest>()
    guests.forEach(g => m.set(g.id, g))
    return m
  }, [guests])

  const seatedIds = useMemo(() => {
    const s = new Set<string>()
    tables.forEach(t => t.guestIds.forEach(id => s.add(id)))
    return s
  }, [tables])

  const unseatedGuests = useMemo(
    () => guests.filter(g => !seatedIds.has(g.id)),
    [guests, seatedIds]
  )

  const filteredUnseated = useMemo(
    () =>
      unseatedGuests.filter(g =>
        g.name.toLowerCase().includes(searchUnseated.toLowerCase())
      ),
    [unseatedGuests, searchUnseated]
  )

  // ── Drag & Drop ────────────────────────────────────────────────────
  const onDragStart = useCallback((e: React.DragEvent, guestId: string) => {
    setDraggedGuestId(guestId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', guestId)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDropOnTable = useCallback(
    (e: React.DragEvent, tableNumber: number) => {
      e.preventDefault()
      const gid = e.dataTransfer.getData('text/plain')
      if (!gid) return
      setTables(prev =>
        prev.map(t => {
          const without = t.guestIds.filter(id => id !== gid)
          return t.tableNumber === tableNumber
            ? { ...t, guestIds: [...without, gid] }
            : { ...t, guestIds: without }
        })
      )
      setDraggedGuestId(null)
    },
    []
  )

  const onDropOnUnseated = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const gid = e.dataTransfer.getData('text/plain')
    if (!gid) return
    setTables(prev =>
      prev.map(t => ({ ...t, guestIds: t.guestIds.filter(id => id !== gid) }))
    )
    setDraggedGuestId(null)
  }, [])

  const onDragEnd = useCallback(() => setDraggedGuestId(null), [])

  // ── Table management ───────────────────────────────────────────────
  const addTable = () => {
    if (tables.length >= TABLE_STYLES.length) return
    const nextNum =
      tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1
    setTables(prev => [...prev, { tableNumber: nextNum, guestIds: [] }])
  }

  const removeTable = (num: number) =>
    setTables(prev => prev.filter(t => t.tableNumber !== num))

  const unseatGuest = (guestId: string) =>
    setTables(prev =>
      prev.map(t => ({ ...t, guestIds: t.guestIds.filter(id => id !== guestId) }))
    )

  // ── Truncate helper ────────────────────────────────────────────────
  const truncate = (name: string, max: number) =>
    name.length > max ? name.slice(0, max) + '\u2026' : name

  // ── Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-rose-500"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          Loading seating chart...
        </p>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tables</h2>
          <p className="text-sm text-muted-foreground">
            Seating Chart &mdash; organize your guests around the room
          </p>
        </div>
        <button
          onClick={addTable}
          disabled={tables.length >= TABLE_STYLES.length}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Add Table
        </button>
      </div>

      {/* ─── Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Total Guests</p>
          <p className="mt-1 text-2xl font-bold">{guests.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Tables</p>
          <p className="mt-1 text-2xl font-bold">{tables.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Seated</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {seatedIds.size}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">Unseated</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {unseatedGuests.length}
          </p>
        </div>
      </div>

      {/* ─── Main layout: tables + sidebar ───────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Tables Area ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Desktop: Visual grid */}
          <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tables.map((table, idx) => {
              const style = getTableStyle(idx)
              const guestsAtTable = table.guestIds
                .map(id => guestMap.get(id))
                .filter((g): g is Guest => !!g)

              return (
                <div
                  key={table.tableNumber}
                  onDragOver={onDragOver}
                  onDrop={e => onDropOnTable(e, table.tableNumber)}
                  className={`relative rounded-xl border bg-card p-5 transition-all duration-200 ${
                    draggedGuestId
                      ? 'ring-2 ring-rose-300 ring-offset-2 ring-offset-background'
                      : 'hover:shadow-md'
                  }`}
                >
                  {/* Table header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${style.dot}`}
                      >
                        {table.tableNumber}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold leading-none">
                          Table {table.tableNumber}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {guestsAtTable.length} guest
                          {guestsAtTable.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTable(table.tableNumber)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 transition-colors"
                      title="Remove table"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Circular table visual */}
                  <div
                    className="relative mx-auto select-none"
                    style={{ width: 240, height: 240 }}
                  >
                    {/* Center circle */}
                    <div
                      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full ${style.circleBg} ${style.circleBorder} border-2 flex items-center justify-center shadow-sm transition-transform duration-200 ${
                        draggedGuestId
                          ? 'scale-110 shadow-lg'
                          : ''
                      }`}
                    >
                      <div className="text-center pointer-events-none">
                        <div className="text-xl leading-none">
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`mx-auto ${style.circleBorder.replace('border-', 'text-').replace(/dark:.*$/, '')}`}
                          >
                            <circle cx="12" cy="5" r="3" />
                            <circle cx="5" cy="19" r="3" />
                            <circle cx="19" cy="19" r="3" />
                            <path d="M12 8v4" />
                            <path d="M5 16v-4" />
                            <path d="M19 16v-4" />
                          </svg>
                        </div>
                        <p
                          className={`text-[11px] font-semibold mt-1 ${style.badge.split(' ').find(c => c.startsWith('text-'))}`}
                        >
                          {table.tableNumber}
                        </p>
                      </div>
                    </div>

                    {/* Guest chips around circle */}
                    {guestsAtTable.map((guest, gi) => {
                      const count = Math.max(guestsAtTable.length, 1)
                      const angle =
                        (gi / count) * Math.PI * 2 - Math.PI / 2
                      const radius = 100
                      const x = 120 + radius * Math.cos(angle)
                      const y = 120 + radius * Math.sin(angle)
                      return (
                        <div
                          key={guest.id}
                          draggable
                          onDragStart={e => onDragStart(e, guest.id)}
                          onDragEnd={onDragEnd}
                          className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing px-2 py-0.5 rounded-full text-[11px] font-medium leading-snug whitespace-nowrap border shadow-sm transition-all duration-150 hover:shadow-md hover:scale-105 hover:-translate-y-[calc(50%+2px)] ${style.badge}`}
                          style={{ left: x, top: y }}
                          title={guest.name + (guest.plusOne ? ' (+1)' : '')}
                        >
                          {truncate(guest.name, 12)}
                        </div>
                      )
                    })}

                    {/* Empty indicator */}
                    {guestsAtTable.length === 0 && !draggedGuestId && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-xs text-muted-foreground mt-20 animate-pulse">
                          Drop guests here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile: Compact list */}
          <div className="md:hidden space-y-3">
            {tables.map((table, idx) => {
              const style = getTableStyle(idx)
              const guestsAtTable = table.guestIds
                .map(id => guestMap.get(id))
                .filter((g): g is Guest => !!g)

              return (
                <div
                  key={table.tableNumber}
                  onDragOver={onDragOver}
                  onDrop={e => onDropOnTable(e, table.tableNumber)}
                  className={`rounded-xl border bg-card p-4 transition-all ${
                    draggedGuestId ? 'ring-2 ring-rose-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${style.dot}`}
                      />
                      <h3 className="text-sm font-semibold">
                        Table {table.tableNumber}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        ({guestsAtTable.length})
                      </span>
                    </div>
                    <button
                      onClick={() => removeTable(table.tableNumber)}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Mini circle + list */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 w-16 h-16 rounded-full ${style.circleBg} ${style.circleBorder} border flex items-center justify-center`}
                    >
                      <span className={`text-xs font-bold ${style.countBg.replace('bg-', 'text-').split(' ')[0]}`}>
                        {table.tableNumber}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                      {guestsAtTable.map(guest => (
                        <span
                          key={guest.id}
                          draggable
                          onDragStart={e => onDragStart(e, guest.id)}
                          onDragEnd={onDragEnd}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border cursor-grab active:cursor-grabbing transition-all hover:shadow-sm ${style.badge}`}
                        >
                          {truncate(guest.name, 14)}
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              unseatGuest(guest.id)
                            }}
                            className="ml-0.5 hover:text-red-500 transition-colors"
                            draggable={false}
                          >
                            <svg
                              width="8"
                              height="8"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                            >
                              <path d="M18 6L6 18" />
                              <path d="M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                      {guestsAtTable.length === 0 && (
                        <p className="text-xs text-muted-foreground py-1">
                          Drop guests here
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Unseated Guests Sidebar ──────────────────────────── */}
        <aside className="w-full lg:w-72 shrink-0">
          <div
            onDragOver={onDragOver}
            onDrop={onDropOnUnseated}
            className={`rounded-xl border bg-card p-4 lg:sticky lg:top-20 transition-all ${
              draggedGuestId
                ? 'ring-2 ring-rose-300 shadow-lg'
                : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold">Unseated Guests</h3>
              <span className="inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 min-w-[20px]">
                {filteredUnseated.length}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Drag onto a table to seat &middot; Drag back to unseat
            </p>

            {/* Search */}
            <div className="relative mb-3">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={searchUnseated}
                onChange={e => setSearchUnseated(e.target.value)}
                className="w-full rounded-lg border bg-background pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-300 transition-shadow"
                placeholder="Search..."
              />
            </div>

            {/* Guest list */}
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-0.5 scrollbar-thin">
              {filteredUnseated.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-2">
                  <div className="text-2xl">🎉</div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {searchUnseated
                      ? 'No matches found'
                      : 'All guests are seated!'}
                  </p>
                </div>
              ) : (
                filteredUnseated.map(guest => (
                  <div
                    key={guest.id}
                    draggable
                    onDragStart={e => onDragStart(e, guest.id)}
                    onDragEnd={onDragEnd}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-background hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {guest.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Name */}
                    <span className="text-sm font-medium truncate flex-1">
                      {guest.name}
                    </span>
                    {/* Badges */}
                    <div className="flex items-center gap-1 shrink-0">
                      {guest.plusOne && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          +1
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          guest.rsvpStatus === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : guest.rsvpStatus === 'DECLINED'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {guest.rsvpStatus === 'ACCEPTED'
                          ? '✓'
                          : guest.rsvpStatus === 'DECLINED'
                            ? '✗'
                            : '?'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
