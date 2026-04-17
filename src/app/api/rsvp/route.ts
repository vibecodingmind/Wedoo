import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const guestId = req.nextUrl.searchParams.get('guestId')

  if (!guestId) {
    return NextResponse.json({ error: 'Missing guestId' }, { status: 400 })
  }

  const guest = await db.guest.findUnique({
    where: { id: guestId },
    include: { wedding: true },
  })

  if (!guest) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }

  return NextResponse.json(guest)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { guestId, rsvpStatus, plusOne, dietaryRestriction, message } = body

  if (!guestId) {
    return NextResponse.json({ error: 'Missing guestId' }, { status: 400 })
  }

  const guest = await db.guest.update({
    where: { id: guestId },
    data: {
      rsvpStatus: rsvpStatus || undefined,
      plusOne: plusOne !== undefined ? plusOne : undefined,
      dietaryRestriction: dietaryRestriction || undefined,
    },
  })

  return NextResponse.json(guest)
}
