import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const channel = req.nextUrl.searchParams.get('channel')
  const where: Record<string, unknown> = weddingId ? { weddingId } : {}
  if (channel) where.channelName = channel
  const messages = await db.message.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(messages)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = await db.message.create({
    data: {
      weddingId: body.weddingId,
      channelName: body.channelName || 'General',
      senderName: body.senderName || 'You',
      content: body.content,
    },
  })
  return NextResponse.json(message, { status: 201 })
}
