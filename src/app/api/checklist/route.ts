import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const where = weddingId ? { weddingId } : {}
  const items = await db.checklistItem.findMany({
    where,
    orderBy: [
      { completed: 'asc' },
      { dueDate: 'asc' },
      { createdAt: 'desc' },
    ],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.checklistItem.create({
    data: {
      weddingId: body.weddingId,
      title: body.title,
      category: body.category || 'General',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      completed: false,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
