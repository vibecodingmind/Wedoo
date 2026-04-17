'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { format } from 'date-fns'

interface Message { id: string; channelName: string; senderName: string; content: string; createdAt: string }

const CHANNELS = ['General', 'Wedding Party', 'Vendors', 'Family']
const CHANNEL_ICONS: Record<string, string> = {
  'General': 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'Wedding Party': 'm16 21-2-2 5-5V2h-4v12l-5 5-1 1 1-1z',
  'Vendors': 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'Family': 'm16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
}
const CHANNEL_COLORS: Record<string, string> = {
  'General': 'text-rose-500', 'Wedding Party': 'text-violet-500', 'Vendors': 'text-amber-500', 'Family': 'text-emerald-500',
}

export default function Messages({ weddingId }: { weddingId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [channel, setChannel] = useState('General')
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [typing, setTyping] = useState(false)
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      const res = await fetch(`/api/messages?weddingId=${weddingId}&channel=${channel}`)
      const data = await res.json()
      if (!cancelled) {
        setMessages(data)
        setLoading(false)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [weddingId, channel, refreshKey])

  // SSE connection
  useEffect(() => {
    let es: EventSource | null = null

    const connect = () => {
      const lastTs = messages.length > 0
        ? new Date(Math.max(...messages.map(m => new Date(m.createdAt).getTime()))).toISOString()
        : new Date(0).toISOString()

      es = new EventSource(`/api/messages/stream?weddingId=${weddingId}&channelName=${channel}&lastTimestamp=${encodeURIComponent(lastTs)}`)
      eventSourceRef.current = es

      es.onopen = () => setConnected(true)

      es.addEventListener('connected', () => setConnected(true))

      es.addEventListener('messages', (event) => {
        try {
          const parsed = JSON.parse(event.data)
          if (parsed.messages && Array.isArray(parsed.messages)) {
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id))
              const newMsgs = parsed.messages.filter((m: Message) => !existingIds.has(m.id))
              if (newMsgs.length > 0) {
                const newIds: string[] = newMsgs.map((m: Message) => m.id)
                setNewMessageIds(prev => {
                  const next = new Set(prev)
                  newIds.forEach(id => next.add(id))
                  return next
                })
                setTimeout(() => {
                  setNewMessageIds(prev => {
                    const next = new Set(prev)
                    newIds.forEach(id => next.delete(id))
                    return next
                  })
                }, 1000)
                return [...prev, ...newMsgs]
              }
              return prev
            })
          }
        } catch {
          // Ignore parse errors
        }
      })

      es.addEventListener('timeout', () => {
        setConnected(false)
        es?.close()
        // Auto-reconnect
        setTimeout(connect, 1000)
      })

      es.onerror = () => {
        setConnected(false)
        es?.close()
        // Auto-reconnect after 2 seconds
        setTimeout(connect, 2000)
      }
    }

    connect()

    return () => {
      es?.close()
      setConnected(false)
    }
  }, [weddingId, channel, messages.length])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [messages.length])

  const refresh = () => setRefreshKey(k => k + 1)

  const handleInputChange = useCallback((value: string) => {
    setInput(value)
    setTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000)
  }, [])

  const send = async () => {
    if (!input.trim()) return
    setTyping(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    await fetch('/api/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, channelName: channel, senderName: 'You', content: input })
    })
    setInput('')
    refresh()
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4 overflow-hidden rounded-xl border bg-card">
      {/* Channels */}
      <div className="hidden w-56 shrink-0 border-r bg-muted/20 md:block">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Channels</h3>
        </div>
        <div className="space-y-1 px-2">
          {CHANNELS.map(ch => (
            <button key={ch} onClick={() => setChannel(ch)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${channel === ch ? 'bg-rose-100 text-rose-700' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={CHANNEL_ICONS[ch]} /></svg>
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Channel Selector */}
      <div className="flex w-full gap-2 overflow-x-auto p-3 md:hidden">
        {CHANNELS.map(ch => (
          <button key={ch} onClick={() => setChannel(ch)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${channel === ch ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}`}>
            {ch}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <div className={`md:hidden ${CHANNEL_COLORS[channel] || 'text-rose-500'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={CHANNEL_ICONS[channel]} /></svg>
          </div>
          <h3 className="font-semibold">{channel}</h3>
          <span className="text-xs text-muted-foreground">{messages.length} messages</span>
          {/* Live indicator */}
          <div className="ml-auto flex items-center gap-1.5">
            {connected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-600">Live</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-xs font-medium text-amber-600">Reconnecting</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-3 border-rose-200 border-t-rose-500" /></div>
          ) : messages.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No messages yet. Start the conversation!</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.senderName === 'You' ? 'flex-row-reverse' : ''} ${newMessageIds.has(msg.id) ? 'animate-in slide-in-from-bottom-2 fade-in duration-300' : ''}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  msg.senderName === 'You' ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>{msg.senderName.charAt(0)}</div>
                <div className={`max-w-[75%] ${msg.senderName === 'You' ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold">{msg.senderName}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                  </div>
                  <div className={`inline-block rounded-2xl px-4 py-2 text-sm ${msg.senderName === 'You' ? 'bg-rose-500 text-white' : 'bg-muted'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Typing indicator */}
        {typing && (
          <div className="px-4 pb-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
              </div>
              You are typing...
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input value={input} onChange={e => handleInputChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm" placeholder={`Message #${channel}...`} />
            <button onClick={send} className="rounded-xl bg-rose-500 px-4 py-2.5 text-white hover:bg-rose-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4z"/><path d="m22 2-11 11"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
