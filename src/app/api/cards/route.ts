import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const where = weddingId ? { weddingId } : {}
  const cards = await db.card.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(cards)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const card = await db.card.create({
    data: {
      weddingId: body.weddingId,
      type: body.type,
      title: body.title,
      subtitle: body.subtitle || '',
      designData: JSON.stringify(body.designData || {}),
    },
  })
  return NextResponse.json(card, { status: 201 })
}
