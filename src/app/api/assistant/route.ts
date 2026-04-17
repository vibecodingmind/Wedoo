import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const FALLBACK_RESPONSES: Record<string, string> = {
  budget: "Here's a smart budget breakdown for your wedding:\n\n**Recommended Allocation:**\n- **Venue & Catering** — 45-50%\n- **Photography & Videography** — 10-12%\n- **Flowers & Decor** — 8-10%\n- **Music & Entertainment** — 5-8%\n- **Attire & Beauty** — 8-10%\n- **Stationery & Favors** — 2-3%\n- **Miscellaneous & Buffer** — 10-15%\n\nTrack every expense in Wedoo's budget tool and negotiate vendor packages for 10-20% savings!",
  vendor: "Here's your guide to choosing wedding vendors:\n\n**Booking Priority:**\n1. **Venue** (12-18 months out)\n2. **Photographer/Videographer** (10-12 months)\n3. **Caterer** (8-10 months)\n4. **Florist & DJ/Band** (6-8 months)\n5. **Cake, officiant, rentals** (4-6 months)\n\nAlways get written contracts, check references, and ask about hidden fees!",
  timeline: "Here's your wedding planning timeline:\n\n**12+ Months Before:** Set budget, choose date, research venues\n**9-11 Months:** Book photographer, caterer, choose wedding party\n**6-8 Months:** Book florist, order dress, send save-the-dates\n**4-5 Months:** Book hair/makeup, plan rehearsal dinner\n**2-3 Months:** Send invitations, finalize menu, write vows\n**1 Month:** Confirm all vendors, final dress fitting\n**Final Week:** Confirm guest count, prepare tips, relax!",
  decoration: "Here are stunning decoration ideas for your wedding:\n\n**Popular Themes:**\n- **Garden Romance** — Lush greenery, wildflowers, fairy lights\n- **Modern Minimalist** — White & gold, geometric arches, candles\n- **Bohemian Elegance** — Macramé, terracotta, dried flowers\n- **Rustic Chic** — Wooden barrels, mason jars, chalkboard signs\n\nBudget tip: Candles create ambiance for less than $2 each!",
  guest: "Here's your guest management guide:\n\n**RSVP Tips:**\n- Set firm deadline (6-8 weeks before)\n- Use digital RSVPs for easier tracking\n- Follow up on non-responders\n- Expect ~80% acceptance rate\n\n**Seating Strategy:**\n- Seat families together\n- Mix social groups at tables\n- Place dance floor near younger guests\n- Create a kids' table with activities if needed",
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase()
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(key)) return response
  }
  return "Thanks for your question! I'm currently experiencing high demand. Here are some quick tips:\n\n**Top Planning Priorities:**\n1. Lock in your venue\n2. Book your photographer early\n3. Set up budget tracking in Wedoo\n4. Start your guest list\n5. Choose your wedding party\n\nTry asking about budget, vendors, timeline, decorations, or guest management for detailed guidance!"
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, weddingId, weddingBudget, guestCount, weddingDate } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Calculate days remaining
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (new Date(weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    )

    const weddingDateFormatted = new Date(weddingDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const systemPrompt = `You are Wedoo AI, a helpful wedding planning assistant. You help couples plan their perfect wedding. You provide advice on budgets, vendors, timelines, decorations, guest management, and all aspects of wedding planning. Be warm, encouraging, and knowledgeable. Use markdown formatting for better readability.

Wedding Context:
- Wedding ID: ${weddingId || 'N/A'}
- Total Budget: $${Number(weddingBudget || 0).toLocaleString()}
- Guest Count: ${guestCount || 0}
- Wedding Date: ${weddingDateFormatted}
- Days Remaining: ${daysRemaining}

Keep your responses concise but informative. Use **bold** for emphasis, bullet points for lists, and emojis sparingly for warmth. Tailor your advice to the specific budget, timeline, and guest count provided.`

    try {
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      })

      const messageContent =
        completion.choices?.[0]?.message?.content || getFallbackResponse(message)

      return NextResponse.json({ content: messageContent })
    } catch (aiError) {
      console.error('AI SDK error, using fallback:', aiError)
      const fallback = getFallbackResponse(message)
      return NextResponse.json({ content: fallback })
    }
  } catch (error) {
    console.error('Assistant API error:', error)
    return NextResponse.json(
      { content: "I'm sorry, I encountered an issue processing your request. Please try again in a moment. In the meantime, feel free to use the quick action buttons for common wedding planning topics!" },
      { status: 200 }
    )
  }
}
