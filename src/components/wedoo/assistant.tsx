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

/* ---------- Pre-written AI responses ---------- */
const QUICK_ACTIONS = [
  {
    label: 'Budget Tips',
    icon: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4Z',
    key: 'budget',
  },
  {
    label: 'Vendor Help',
    icon: 'm2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M2 7h20',
    key: 'vendor',
  },
  {
    label: 'Timeline',
    icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
    key: 'timeline',
  },
  {
    label: 'Decoration Ideas',
    icon: 'M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z',
    key: 'decoration',
  },
  {
    label: 'Guest Management',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    key: 'guest',
  },
]

function getResponseForKey(key: string, budget: number, guests: number, date: string): string {
  const budgetFormatted = budget.toLocaleString()
  const daysLeft = Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  const responses: Record<string, string> = {
    budget: `Here's a smart budget breakdown for your wedding with a $${budgetFormatted} budget:

**Recommended Allocation:**
• **Venue & Catering** — 45-50% ($${Math.round(budget * 0.47).toLocaleString()})
  This is your biggest expense. Consider off-peak dates or weekday weddings for significant savings.
• **Photography & Videography** — 10-12% ($${Math.round(budget * 0.11).toLocaleString()})
  Book early! Top photographers get reserved 12-18 months in advance.
• **Flowers & Decor** — 8-10% ($${Math.round(budget * 0.09).toLocaleString()})
  Mix high-impact statement pieces with affordable greenery and candles.
• **Music & Entertainment** — 5-8% ($${Math.round(budget * 0.065).toLocaleString()})
  A great DJ can be more cost-effective than a live band.
• **Attire & Beauty** — 8-10% ($${Math.round(budget * 0.09).toLocaleString()})
  Look for sample sales and trunk shows for designer gowns at discounts.
• **Stationery & Favors** — 2-3% ($${Math.round(budget * 0.025).toLocaleString()})
  Digital save-the-dates save on postage. DIY favors add a personal touch.
• **Miscellaneous & Buffer** — 10-15% ($${Math.round(budget * 0.125).toLocaleString()})
  Always keep a contingency fund for unexpected costs!

💡 **Pro Tips:**
- Track every expense in your Wedoo budget tool
- Negotiate packages — vendors often bundle services at 10-20% off
- Consider a Sunday wedding for 15-30% venue savings`,

    vendor: `Here's your complete guide to choosing the perfect wedding vendors:

**How to Choose Vendors Like a Pro:**

🔍 **Research & Shortlist**
- Start with 3-5 options per vendor category
- Check reviews on The Knot, WeddingWire, and Google
- Ask for referrals from recently married friends
- Look at full wedding galleries, not just highlight reels

💬 **Questions to Ask Every Vendor:**
- "What's included in your base package?"
- "Are there any additional fees (travel, overtime, setup)?"
- "What happens if you're unavailable on our date?"
- "Can we see a full portfolio of a similar wedding?"
- "What's your payment schedule and cancellation policy?"

⚠️ **Red Flags to Watch For:**
- No written contract or vague terms
- Reluctance to provide references
- Pressure to sign immediately without review
- Significant price changes after initial quote

**Vendor Booking Priority:**
1. **Venue** (12-18 months out)
2. **Photographer/Videographer** (10-12 months)
3. **Caterer** (8-10 months)
4. **Florist & DJ/Band** (6-8 months)
5. **Cake, officiant, rentals** (4-6 months)

💡 **Pro Tips:**
- Use Wedoo's vendor directory to compare options
- Book early — popular vendors fill up fast!
- Build relationships — vendors can recommend each other`,

    timeline: `Here's your comprehensive 12-month wedding planning timeline:

${daysLeft > 365 ? `You have ${daysLeft} days — perfect timing! Here's your roadmap:` : `Your wedding is in ${daysLeft} days. Here's a prioritized checklist based on where you are:`}

**📅 12+ Months Before**
- Set your budget and create a shared spreadsheet
- Choose your wedding date (check venue availability first!)
- Start a guest list draft
- Research and book your venue
- Begin photographer/ videographer search
- Hire a wedding planner (if desired)

**📅 9-11 Months Before**
- Book your caterer and photographer
- Choose your wedding party
- Start dress shopping
- Book entertainment (DJ/ band)
- Select an officiant

**📅 6-8 Months Before**
- Book florist, rental companies, and transportation
- Order your wedding dress
- Plan the honeymoon
- Register for gifts
- Send save-the-dates
- Start planning decor themes

**📅 4-5 Months Before**
- Book hair and makeup artists
- Order the cake
- Plan rehearsal dinner
- Schedule engagement photos
- Select groomsmen attire

**📅 2-3 Months Before**
- Send invitations (8 weeks before)
- Finalize menu tastings
- Write vows
- Plan seating chart
- Order wedding favors
- Apply for marriage license

**📅 1 Month Before**
- Confirm all vendor details
- Have your final dress fitting
- Create a day-of timeline
- Break in your wedding shoes
- Assign day-of responsibilities

**📅 Final Week**
- Confirm final guest count with caterer
- Prepare tips and payments for vendors
- Pack for your honeymoon
- Relax and enjoy your big day! 💍`,

    decoration: `Here are stunning decoration ideas for your wedding:

**🌸 Popular Wedding Themes for ${new Date().getFullYear()}:**

**1. Garden Romance** 🌿
- Lush greenery garlands on tables and arches
- Wildflower centerpieces in mismatched vintage vases
- Soft pastel palette: blush, sage, cream, dusty rose
- Fairy lights woven through greenery
- Pampas grass accents

**2. Modern Minimalist** ✨
- Clean white and gold color scheme
- Geometric arch or acrylic signage
- Single statement bloom arrangements
- Candles at varying heights
- Linen napkins with subtle textures

**3. Bohemian Elegance** 🪶
- Macramé backdrops and table runners
- Terracotta and earthy tones with dried flowers
- Brass candle holders and lanterns
- Rattan furniture and woven rugs
- Crystal suncatchers for light play

**4. Rustic Chic** 🪵
- Wooden barrels and crates for displays
- Mason jar centerpieces with LED lights
- Burlap and lace table runners
- Chalkboard signs for seating and menus
- Wildflower bouquets tied with twine

**5. Glamorous Evening** 💎
- Sequin tablecloths and velvet linens
- Crystal chandeliers or hanging installations
- Metallic accents: gold, rose gold, or silver
- Uplighting to transform the venue
- Mirrored surfaces for visual depth

**Budget-Friendly Decor Tips:**
- Repurpose ceremony flowers for the reception
- Candles create ambiance for less than $2 each
- Use greenery as your base — it's cheaper than flowers
- Rent statement pieces instead of buying
- DIY your signage and place cards`,

    guest: `Here's your complete guide to managing ${guests} wedding guests:

**📋 Guest Management Strategy:**

**Creating Your Guest List:**
- Start with your "must-invite" list (family & closest friends)
- Set clear rules for plus-ones and children
- Use the 80/20 rule: expect 80% acceptance rate
- Create A, B, and C tiers for your list
- Account for vendor meal counts (+5% buffer)

**RSVP Tracking Best Practices:**
- Set a firm RSVP deadline (6-8 weeks before)
- Use digital RSVPs for easier tracking (Wedoo handles this!)
- Follow up on non-responders within 1 week of deadline
- Track dietary restrictions and allergies early
- Update your caterer with final numbers promptly

**Seating Strategy:**
- Seat families together
- Mix social groups at tables (introduce friends to each other!)
- Place the dance floor near younger guests
- Have a "reserved" sign system
- Create a kids' table with activities if needed

**Managing Difficult Situations:**
- Be clear about your +1 policy on invitations
- Have a plan for unexpected RSVPs
- Address dietary needs with your caterer in advance
- Consider a "no children" policy with a clear, kind message
- Have a quiet exit plan for guests who need to leave early

**Communication Tips:**
- Send save-the-dates 6-8 months out
- Include your wedding website on all correspondence
- Provide hotel block information early
- Share a weekend itinerary for traveling guests
- Send a welcome bag with local recommendations

💡 **With ${guests} guests, expect roughly ${Math.round(guests * 0.8)} to attend based on average acceptance rates. Plan your seating for this number!**`,
  }

  return responses[key] || responses.budget
}

function getKeywordResponse(input: string, budget: number, guests: number, date: string): string {
  const lower = input.toLowerCase()
  const budgetFormatted = budget.toLocaleString()
  const daysLeft = Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  if (/cake|dessert|sweet|bake/i.test(lower)) {
    return `🍰 Great question about your wedding cake! Here's everything you need to know:

**Choosing Your Wedding Cake:**

**Popular Trends:**
- **Naked or semi-naked cakes** — rustic, modern, and Instagram-worthy
- **Buttercream finishes** — smooth, elegant, and more affordable than fondant
- **Mini cakes or cupcakes** — fun alternatives to a traditional tiered cake
- **Donut towers** — trendy and budget-friendly for ${guests} guests
- **Cheese wheel cakes** — perfect for foodie couples!

**Budget Guidance (from your $${budgetFormatted} budget):**
- Allocate 1-3% of your budget for cake ($${Math.round(budget * 0.02).toLocaleString()})
- Per-slice pricing ranges from $3-$15+ depending on design complexity
- For ${guests} guests, you'll need roughly ${Math.round(guests * 1.2)} servings

**Pro Tips:**
- Schedule your cake tasting 4-6 months before the wedding
- Ask about additional fees for delivery, setup, and cake cutting
- Fresh flowers on cake are usually provided by your florist
- Consider a "display" cake and a sheet cake for guests — saves 40%!
- Save the top tier for your first anniversary`
  }

  if (/music|dj|band|entertain|song|dance|playlist/i.test(lower)) {
    return `🎵 Here's your complete wedding music and entertainment guide:

**Music Options Compared:**

**🎧 DJ (Most Popular)**
- **Cost:** $800-$2,500
- **Pros:** Vast music library, smooth transitions, takes requests
- **Best for:** Couples who want variety and dancing all night

**🎸 Live Band**
- **Cost:** $2,000-$10,000+
- **Pros:** Unique energy, interactive performance
- **Best for:** Couples who want a concert-like experience

**🎻 String Quartet/Classical**
- **Cost:** $1,000-$3,000
- **Pros:** Elegant, sophisticated ambiance
- **Best for:** Ceremony and cocktail hour

**Must-Have Playlist Moments:**
- Processional & recessional songs
- First dance
- Father-daughter / mother-son dance
- Last song of the night
- Hora loca or crowd favorites for dancing

**Pro Tips:**
- Provide a "Do Not Play" list alongside your must-play songs
- For ${guests} guests, ensure your venue's sound system covers the space
- Book 6-8 months in advance — popular dates fill fast
- Consider a live vocalist during cocktail hour and DJ for the reception`
  }

  if (/flower|florist|floral|decor|centerpiece|bouquet|arrangement|greenery/i.test(lower)) {
    return `💐 Here's your complete wedding flowers and decor guide:

**Flower Planning for ${guests} Guests:**

**Essential Floral Elements:**
- Bridal bouquet ($150-$400)
- Bridesmaid bouquets ($75-$150 each)
- Boutonnieres ($10-$25 each)
- Centerpieces ($50-$200 per table)
- Ceremony arch/installation ($500-$3,000)
- Flower girl petals & basket ($30-$80)

**Smart Ways to Save on Flowers:**
- Choose **in-season blooms** — peonies in spring, dahlias in fall
- Use **greenery-heavy** arrangements (eucalyptus, ferns, ivy)
- Repurpose ceremony flowers for the reception
- Mix high-end blooms with affordable fillers
- Consider **dried flowers** for a trendy, budget-friendly option

**Popular Flower Palettes:**
- 🤍 **Classic White:** Roses, peonies, lilies, ranunculus
- 🌸 **Romantic Pink:** Garden roses, peonies, sweet peas
- 🧡 **Warm Autumn:** Dahlias, sunflowers, berries, burnt orange
- 💜 **Moody Luxe:** Burgundy roses, deep purple, dark foliage

**Pro Tips:**
- Meet with your florist 8-10 months before
- Bring photos of styles you love
- Consider candles + greenery for cost-effective table decor
- Ask about rental items (vases, arches) vs. purchasing`
  }

  if (/photo|photog|video|videog|camera|shoot|portrait|album/i.test(lower)) {
    return `📸 Here's your complete wedding photography guide:

**Photography Options:**

**📷 What to Look For in a Photographer:**
- Strong portfolio with full wedding galleries
- Shooting style that matches your vision
- Reviews from couples with similar wedding sizes
- Clear contract with deliverables and timeline
- Second shooter included or available

**Essential Shot List:**
- Getting ready (bride & groom separately)
- First look (if doing one)
- Ceremony key moments
- Family formals (make a list of groupings!)
- Wedding party portraits
- Couple portraits during golden hour
- Reception details (cake, decor, rings)
- Candid moments throughout the day
- First dance, toasts, cake cutting, bouquet toss

**Photography Packages:**
- **Essential (6 hours):** $2,000-$4,000
- **Standard (8 hours):** $3,500-$7,000
- **Premium (10+ hours + video):** $6,000-$15,000

**💡 Pro Tips:**
- Book your photographer 10-12 months in advance
- Create a Pinterest board of styles you love
- Hire a second shooter for complete coverage with ${guests} guests
- Consider an engagement session (included in most packages)
- Plan your timeline around golden hour for stunning portraits`
  }

  if (/venue|location|place|space|outdoor|indoor|garden|beach|ballroom/i.test(lower)) {
    return `🏛️ Here's your guide to choosing the perfect wedding venue:

**Venue Categories:**

**🏡 Indoor Venues**
- Ballrooms, hotels, banquet halls, historic estates
- Climate-controlled, reliable, elegant
- Usually include tables, chairs, and catering

**🌿 Outdoor Venues**
- Gardens, vineyards, beaches, parks
- Stunning natural backdrops, romantic atmosphere
- Always have a weather backup plan!

**🏨 All-Inclusive Venues**
- Hotels, resorts, country clubs
- One-stop planning with built-in vendors
- Often offer guest room blocks

**Key Questions to Ask:**
- What's the guest capacity and minimum count?
- What's included (tables, chairs, linens, lighting)?
- Are there noise restrictions or curfews?
- What are the catering and bar policies?
- Is there a backup plan for outdoor ceremonies?
- What are the setup and breakdown timelines?

**Budget Tips:**
- Friday and Sunday weddings can save 20-40%
- Off-season months (Jan-Mar) offer significant discounts
- All-inclusive venues simplify budgeting
- Consider non-traditional venues like restaurants or art galleries`
  }

  if (/dress|gown|attire|suit|tux|wedding dress|bridal/i.test(lower)) {
    return `👗 Here's your wedding attire guide:

**For the Bride:**
- Start shopping 9-12 months before
- Bring only 2-3 people to appointments
- Try on different silhouettes (A-line, mermaid, ball gown, sheath)
- Consider the venue and formality level
- Budget: $1,000-$5,000+ (sample sales can save 50%!)

**For the Groom/Partner:**
- Coordinate with the bride's dress style
- Start 4-6 months before
- Consider renting vs. buying
- Budget: $200-$1,500+ for suit/tuxedo

**Don't Forget:**
- Shoes, veil/headpiece, jewelry
- Alterations (factor in $300-$800)
- Emergency kit for the day of
- Steam/press services

**Timeline Tips:**
- Final fitting 2-3 weeks before the wedding
- Break in your shoes before the big day
- Assign someone to handle your dress post-ceremony`
  }

  if (/honeymoon|travel|trip|vacation|destination/i.test(lower)) {
    return `✈️ Here's your honeymoon planning guide:

**Popular Honeymoon Destinations:**
- 🏖️ **Tropical:** Maldives, Bora Bora, Hawaii, Bali
- 🏰 **European:** Italy, Greece, France, Spain
- 🏔️ **Adventure:** New Zealand, Costa Rica, Iceland
- 🌃 **City Break:** Paris, Tokyo, New York

**Planning Timeline:**
- Research destinations 6-8 months before
- Book flights and accommodation 4-6 months out
- Apply for passports/visas 3-4 months before
- Plan activities and tours 2-3 months before

**Budget Tips:**
- Use your wedding date as leverage for upgrades
- Consider an off-peak honeymoon (saves 20-40%)
- All-inclusive resorts simplify budgeting
- Register for a honeymoon fund as a gift option`
  }

  // Default response
  return `Thanks for your question! Here's some general wedding planning advice for your upcoming celebration:

**Your Wedding at a Glance:**
- 💰 Budget: $${budgetFormatted}
- 👥 Expected Guests: ~${guests}
- 📅 Days Until Wedding: ${daysLeft}

**Top Planning Priorities:**
1. **Lock in your venue** — this is the biggest decision and books out fastest
2. **Book your photographer early** — the best ones get reserved 12+ months out
3. **Set up your budget tracking** — use Wedoo's budget tool to stay on track
4. **Start your guest list** — knowing your headcount affects venue, catering, and budget decisions
5. **Choose your wedding party** — they'll be your support team throughout the planning process

**Quick Tips:**
- Join Wedoo's community for real couple advice
- Set milestone reminders for key planning deadlines
- Don't forget to enjoy the process — it goes fast!
- Consider hiring a day-of coordinator for peace of mind

Is there something specific you'd like to dive deeper into? Try the quick action buttons below for detailed guides! 💕`
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

  const simulateTypingAndRespond = useCallback((userContent: string, responseContent: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)
    setInputValue('')

    const typingDelay = 800 + Math.random() * 1200

    setTimeout(() => {
      setIsTyping(false)
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    }, typingDelay)
  }, [])

  const handleQuickAction = useCallback((key: string) => {
    const action = QUICK_ACTIONS.find(a => a.key === key)
    if (!action) return
    setHasInteracted(true)
    const response = getResponseForKey(key, weddingBudget, guestCount, weddingDate)
    simulateTypingAndRespond(action.label, response)
  }, [weddingBudget, guestCount, weddingDate, simulateTypingAndRespond])

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed || isTyping) return
    setHasInteracted(true)
    const response = getKeywordResponse(trimmed, weddingBudget, guestCount, weddingDate)
    simulateTypingAndRespond(trimmed, response)
  }, [inputValue, isTyping, weddingBudget, guestCount, weddingDate, simulateTypingAndRespond])

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
