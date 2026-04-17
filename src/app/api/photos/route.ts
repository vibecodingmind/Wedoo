import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const weddingId = request.nextUrl.searchParams.get('weddingId')
  if (!weddingId) {
    return NextResponse.json({ error: 'weddingId is required' }, { status: 400 })
  }

  const photos = await db.photo.findMany({
    where: { weddingId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(photos)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { weddingId, src, caption, category } = body

    if (!weddingId || !src) {
      return NextResponse.json({ error: 'weddingId and src are required' }, { status: 400 })
    }

    const photo = await db.photo.create({
      data: {
        weddingId,
        src,
        caption: caption || '',
        category: category || 'Inspiration',
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 })
  }
}
