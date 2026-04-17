import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const where = weddingId ? { weddingId } : {}
  const guests = await db.guest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(guests)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const guest = await db.guest.create({
    data: {
      weddingId: body.weddingId,
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      dietaryRestriction: body.dietaryRestriction || null,
      rsvpStatus: 'PENDING',
      plusOne: body.plusOne || false,
    },
  })
  return NextResponse.json(guest, { status: 201 })
}
