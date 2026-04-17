import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const where = weddingId ? { weddingId } : {}
  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(notifications)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const notification = await db.notification.create({
    data: {
      weddingId: body.weddingId,
      title: body.title,
      message: body.message,
      type: body.type || 'INFO',
      read: false,
    },
  })
  return NextResponse.json(notification, { status: 201 })
}
