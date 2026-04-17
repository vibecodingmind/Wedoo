import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const guest = await db.guest.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      dietaryRestriction: body.dietaryRestriction,
      rsvpStatus: body.rsvpStatus,
      tableNumber: body.tableNumber,
      plusOne: body.plusOne,
    },
  })
  return NextResponse.json(guest)
}
