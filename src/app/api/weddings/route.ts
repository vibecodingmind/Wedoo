import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const weddings = await db.wedding.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(weddings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const wedding = await db.wedding.create({
    data: {
      name: body.name,
      date: new Date(body.date),
      budget: parseFloat(body.budget) || 0,
      status: body.status || 'PLANNING',
    },
  })
  return NextResponse.json(wedding, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const wedding = await db.wedding.update({
    where: { id: body.id },
    data: {
      name: body.name,
      date: body.date ? new Date(body.date) : undefined,
      budget: body.budget !== undefined ? parseFloat(body.budget) : undefined,
      status: body.status,
    },
  })
  return NextResponse.json(wedding)
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  // Delete all related data
  await db.pledge.deleteMany({ where: { weddingId: id } })
  await db.budgetCategory.deleteMany({ where: { weddingId: id } })
  await db.guest.deleteMany({ where: { weddingId: id } })
  await db.message.deleteMany({ where: { weddingId: id } })
  await db.notification.deleteMany({ where: { weddingId: id } })
  await db.card.deleteMany({ where: { weddingId: id } })
  await db.checklistItem.deleteMany({ where: { weddingId: id } })
  await db.wedding.delete({ where: { id } })
  // Reseed
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/seed`, { method: 'POST' })
  return NextResponse.json({ success: true })
}
