'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface AssistantProps {
  weddingId: string
  weddingBudget: number
  guestCount: number
  weddingDate: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

/* ---------- Quick actions ---------- */
const QUICK_ACTIONS = [
  {
    label: 'Budget Tips',
    icon: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4Z',
    key: 'budget',
    prompt: 'Give me detailed budget planning tips for my wedding. Include recommended allocations, cost-saving strategies, and priority areas.',
  },
  {
    label: 'Vendor Help',
    icon: 'm2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M2 7h20',
    key: 'vendor',
    prompt: 'Help me choose and manage wedding vendors. What should I look for, what questions should I ask, and what is the booking priority?',
  },
  {
    label: 'Timeline',
    icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
    key: 'timeline',
    prompt: 'Give me a comprehensive wedding planning timeline. What should I do and when, based on my wedding date?',
  },
  {
    label: 'Decoration Ideas',
    icon: 'M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z',
    key: 'decoration',
    prompt: 'What are the best wedding decoration ideas and themes? Include current trends and budget-friendly options.',
  },
  {
    label: 'Guest Management',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    key: 'guest',
    prompt: 'Help me manage my wedding guests. Include RSVP tracking, seating strategy, and communication tips.',
  },
]

/* ---------- Fallback responses if API fails ---------- */
function getFallbackResponse(key: string, budget: number, guests: number, date: string): string {
  const budgetFormatted = budget.toLocaleString()
  const daysLeft = Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  const responses: Record<string, string> = {
    budget: `Here's a smart budget breakdown for your wedding with a $${budgetFormatted} budget:

**Recommended Allocation:**
- **Venue & Catering** — 45-50% ($${Math.round(budget * 0.47).toLocaleString()})
  This is your biggest expense. Consider off-peak dates for significant savings.
- **Photography & Videography** — 10-12% ($${Math.round(budget * 0.11).toLocaleString()})
  Book early! Top photographers get reserved 12-18 months in advance.
- **Flowers & Decor** — 8-10% ($${Math.round(budget * 0.09).toLocaleString()})
  Mix high-impact statement pieces with affordable greenery and candles.
- **Music & Entertainment** — 5-8% ($${Math.round(budget * 0.065).toLocaleString()})
- **Attire & Beauty** — 8-10% ($${Math.round(budget * 0.09).toLocaleString()})
- **Stationery & Favors** — 2-3% ($${Math.round(budget * 0.025).toLocaleString()})
- **Miscellaneous & Buffer** — 10-15% ($${Math.round(budget * 0.125).toLocaleString()})

**Pro Tips:**
- Track every expense in your Wedoo budget tool
- Negotiate packages — vendors often bundle services at 10-20% off
- Consider a Sunday wedding for 15-30% venue savings`,

    vendor: `Here's your complete guide to choosing the perfect wedding vendors:

**Vendor Booking Priority:**
1. **Venue** (12-18 months out)
2. **Photographer/Videographer** (10-12 months)
3. **Caterer** (8-10 months)
4. **Florist & DJ/Band** (6-8 months)
5. **Cake, officiant, rentals** (4-6 months)

**Questions to Ask Every Vendor:**
- "What's included in your base package?"
- "Are there any additional fees (travel, overtime, setup)?"
- "Can we see a full portfolio of a similar wedding?"
- "What's your payment schedule and cancellation policy?"

**Red Flags to Watch For:**
- No written contract or vague terms
- Reluctance to provide references
- Pressure to sign immediately`,

    timeline: `Here's your wedding planning timeline:

${daysLeft > 365 ? `You have ${daysLeft} days — perfect timing!` : `Your wedding is in ${daysLeft} days. Here's your roadmap:`}

**12+ Months Before:** Set budget, choose date, research venues, start guest list
**9-11 Months:** Book photographer & caterer, choose wedding party, start dress shopping
**6-8 Months:** Book florist & rentals, order dress, plan honeymoon, send save-the-dates
**4-5 Months:** Book hair/makeup, order cake, plan rehearsal dinner
**2-3 Months:** Send invitations, finalize menu, write vows, plan seating
**1 Month:** Confirm all vendors, final dress fitting, create day-of timeline
**Final Week:** Confirm guest count, prepare tips, relax and enjoy!`,

    decoration: `Here are stunning decoration ideas for your wedding:

**Popular Wedding Themes:**

1. **Garden Romance** — Lush greenery garlands, wildflower centerpieces, fairy lights
2. **Modern Minimalist** — Clean white and gold, geometric arch, single bloom arrangements
3. **Bohemian Elegance** — Macramé backdrops, terracotta tones, dried flowers, brass lanterns
4. **Rustic Chic** — Wooden barrels, mason jars, burlap runners, chalkboard signs
5. **Glamorous Evening** — Sequin linens, crystal chandeliers, metallic accents

**Budget-Friendly Tips:**
- Repurpose ceremony flowers for the reception
- Candles create ambiance for less than $2 each
- Use greenery as your base — cheaper than flowers
- DIY your signage and place cards`,

    guest: `Here's your guest management guide for ${guests} guests:

**Creating Your Guest List:**
- Start with "must-invite" list (family & closest friends)
- Set clear rules for plus-ones and children
- Use the 80/20 rule: expect 80% acceptance rate

**RSVP Tracking:**
- Set a firm deadline (6-8 weeks before)
- Use digital RSVPs for easier tracking
- Follow up on non-responders within 1 week
- Track dietary restrictions early

**Seating Strategy:**
- Seat families together
- Mix social groups at tables
- Place the dance floor near younger guests

**With ${guests} guests, expect roughly ${Math.round(guests * 0.8)} to attend!**`,
  }

  return responses[key] || responses.budget
}

function getDefaultFallback(budget: number, guests: number, date: string): string {
  const budgetFormatted = budget.toLocaleString()
  const daysLeft = Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  return `Thanks for your question! Here's some general wedding planning advice:

**Your Wedding at a Glance:**
- Budget: $${budgetFormatted}
- Expected Guests: ~${guests}
- Days Until Wedding: ${daysLeft}

**Top Planning Priorities:**
1. Lock in your venue
2. Book your photographer early
3. Set up budget tracking
4. Start your guest list
5. Choose your wedding party

Try the quick action buttons below for detailed guides!`
}

/* ---------- Component ---------- */
export default function Assistant({ weddingId, weddingBudget, guestCount, weddingDate }: AssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  const callAssistantAPI = useCallback(async (message: string): Promise<string> => {
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          weddingId,
          weddingBudget,
          guestCount,
          weddingDate,
        }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      return data.content || getDefaultFallback(weddingBudget, guestCount, weddingDate)
    } catch {
      // Fallback to local responses if API fails
      const lower = message.toLowerCase()
      for (const action of QUICK_ACTIONS) {
        if (lower.includes(action.key)) {
          return getFallbackResponse(action.key, weddingBudget, guestCount, weddingDate)
        }
      }
      return getDefaultFallback(weddingBudget, guestCount, weddingDate)
    }
  }, [weddingId, weddingBudget, guestCount, weddingDate])

  const handleQuickAction = useCallback(async (key: string) => {
    const action = QUICK_ACTIONS.find(a => a.key === key)
    if (!action || isTyping) return

    setHasInteracted(true)
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: action.label,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const response = await callAssistantAPI(action.prompt)
      setIsTyping(false)
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setIsTyping(false)
      const fallback = getFallbackResponse(key, weddingBudget, guestCount, weddingDate)
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fallback,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    }
  }, [isTyping, weddingBudget, guestCount, weddingDate, callAssistantAPI])

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isTyping) return

    setHasInteracted(true)
    setInputValue('')

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const response = await callAssistantAPI(trimmed)
      setIsTyping(false)
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setIsTyping(false)
      const fallback = getDefaultFallback(weddingBudget, guestCount, weddingDate)
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fallback,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    }
  }, [inputValue, isTyping, weddingBudget, guestCount, weddingDate, callAssistantAPI])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-10rem)] rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden border-b bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-5 py-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuMTA1IDAgMi0uODk1IDItMnYtNGMwLTEuMTA1LS44OTUtMi0yLTJoLTJjLTEuMTA1IDAtMiAuODk1LTIgMnY0YzAgMS4xMDUuODk1IDIgMiAyaDR6bTAgMjBjMS4xMDUgMCAyLS44OTUgMi0ydi00YzAtMS4xMDUtLjg5NS0yLTItMmgtMmMtMS4xMDUgMC0yIC44OTUtMiAydjRjMCAxLjEwNS44OTUgMiAyIDJoNHptMC0xMGMxLjEwNSAwIDItLjg5NSAyLTJ2LTRjMC0xLjEwNS0uODk1LTItMi0yaC0yYy0xLjEwNSAwLTIgLjg5NS0yIDJ2NGMwIDEuMTA1Ljg5NSAyIDIgMmg0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Wedding AI Assistant</h2>
            <p className="text-xs text-white/80 font-medium">Get smart suggestions for your big day</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-semibold text-white/90">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ scrollbarGutter: 'stable' }}
      >
        <div className="mx-auto max-w-3xl px-4 py-4 space-y-1">
          {/* Welcome message when no interaction */}
          {!hasInteracted && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950/50 dark:to-pink-950/50 mb-4">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Hi there! I&apos;m your wedding assistant</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                I can help with budget planning, vendor selection, timelines, decoration ideas, and more. Try a quick action below or ask me anything!
              </p>
              {/* Quick Action Chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.key}
                    onClick={() => handleQuickAction(action.key)}
                    disabled={isTyping}
                    className="group inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 dark:hover:bg-rose-950/30 dark:hover:border-rose-800 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500 transition-transform group-hover:scale-110">
                      <path d={action.icon} />
                    </svg>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {/* Avatar */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950/50 dark:to-pink-950/50'
                  : 'bg-gradient-to-br from-rose-500 to-pink-500'
              }`}>
                {msg.role === 'assistant' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
                    <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] sm:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'assistant'
                    ? 'bg-muted text-foreground rounded-tl-md'
                    : 'bg-rose-500 text-white rounded-tr-md'
                }`}>
                  {msg.role === 'assistant' ? (
                    <FormattedResponse content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
                <p className={`mt-1 text-[10px] text-muted-foreground px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950/50 dark:to-pink-950/50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
                  <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
                </svg>
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-md px-5 py-4">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions after initial interaction */}
          {hasInteracted && messages.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 pb-4">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.key}
                  onClick={() => handleQuickAction(action.key)}
                  disabled={isTyping}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 transition-all hover:border-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110">
                    <path d={action.icon} />
                  </svg>
                  {action.label}
                </button>
              ))}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 rounded-xl border bg-muted/50 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 dark:focus-within:ring-rose-950/50 transition-all px-3 py-1.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0 ml-1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about cake, flowers, music, venues..."
              disabled={isTyping}
              className="flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Powered by Wedoo AI &middot; Personalized advice based on your wedding details
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Rich text formatter for AI responses ---------- */
function FormattedResponse({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        if (!trimmed) return <div key={idx} className="h-2" />

        // Bold headers (lines starting with **)
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <p key={idx} className="font-semibold text-foreground">
              {trimmed.replace(/\*\*/g, '')}
            </p>
          )
        }

        // Inline bold **text**
        if (trimmed.includes('**')) {
          const parts = trimmed.split(/(\*\*.*?\*\*)/g)
          return (
            <p key={idx} className="text-foreground/90">
              {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i} className="font-semibold">{part.replace(/\*\*/g, '')}</strong>
                }
                return <span key={i}>{part}</span>
              })}
            </p>
          )
        }

        // Sub-headers starting with • or -
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          const text = trimmed.replace(/^[•-]\s*/, '')
          // Handle inline bold within list items
          const boldParts = text.split(/(\*\*.*?\*\*)/g)
          return (
            <p key={idx} className="text-foreground/80 pl-1 flex gap-2">
              <span className="text-rose-400 shrink-0 mt-px">•</span>
              <span>
                {boldParts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-medium">{part.replace(/\*\*/g, '')}</strong>
                  }
                  return <span key={i}>{part}</span>
                })}
              </span>
            </p>
          )
        }

        // Numbered items
        if (/^\d+\./.test(trimmed)) {
          return (
            <p key={idx} className="text-foreground/80">
              {trimmed}
            </p>
          )
        }

        // Regular text
        return (
          <p key={idx} className="text-foreground/80">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}
