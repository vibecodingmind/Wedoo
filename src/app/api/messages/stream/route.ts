import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const channelName = req.nextUrl.searchParams.get('channelName')
  const lastTimestamp = req.nextUrl.searchParams.get('lastTimestamp')

  if (!weddingId) {
    return new Response('Missing weddingId', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // Stream may have been closed
        }
      }

      // Send initial connection confirmation
      sendEvent({ type: 'connected', timestamp: new Date().toISOString() })

      // Poll for new messages every 3 seconds
      let lastCheck = lastTimestamp ? new Date(lastTimestamp) : new Date(0)
      let keepAlive = true

      const poll = async () => {
        while (keepAlive) {
          try {
            const where: Record<string, unknown> = {
              weddingId,
              createdAt: { gt: lastCheck },
            }
            if (channelName) {
              where.channelName = channelName
            }

            const messages = await db.message.findMany({
              where,
              orderBy: { createdAt: 'asc' },
            })

            if (messages.length > 0) {
              sendEvent({ type: 'messages', messages })
              lastCheck = messages[messages.length - 1].createdAt
            }

            // Send a keepalive ping every poll
            sendEvent({ type: 'ping' })
          } catch {
            // Database query may fail, just continue polling
          }

          // Wait 3 seconds
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }

      poll()

      // Close after 5 minutes
      setTimeout(() => {
        keepAlive = false
        sendEvent({ type: 'timeout' })
        try {
          controller.close()
        } catch {
          // Already closed
        }
      }, 5 * 60 * 1000)

      // Clean up on client disconnect
      req.signal.addEventListener('abort', () => {
        keepAlive = false
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
