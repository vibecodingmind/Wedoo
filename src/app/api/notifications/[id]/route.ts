import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const notification = await db.notification.update({
    where: { id },
    data: { read: true },
  })
  return NextResponse.json(notification)
}
