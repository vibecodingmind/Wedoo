import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const weddingId = request.nextUrl.searchParams.get('weddingId')
  if (!weddingId) {
    return NextResponse.json({ error: 'weddingId is required' }, { status: 400 })
  }

  const events = await db.timelineEvent.findMany({
    where: { weddingId },
    orderBy: [{ sortOrder: 'asc' }, { time: 'asc' }],
  })

  return NextResponse.json(events)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { weddingId, time, title, description, category, sortOrder } = body

    if (!weddingId || !time || !title) {
      return NextResponse.json({ error: 'weddingId, time, and title are required' }, { status: 400 })
    }

    const event = await db.timelineEvent.create({
      data: {
        weddingId,
        time,
        title,
        description: description || '',
        category: category || 'ceremony',
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 })
  }
}
