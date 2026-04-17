import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const item = await db.checklistItem.update({
    where: { id },
    data: {
      title: body.title,
      category: body.category,
      dueDate: body.dueDate ? new Date(body.dueDate) : (body.dueDate === null ? null : undefined),
      completed: body.completed,
    },
  })
  return NextResponse.json(item)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.checklistItem.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
