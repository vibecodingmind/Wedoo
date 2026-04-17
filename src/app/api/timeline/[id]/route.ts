import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { time, title, description, category, sortOrder } = body

    const event = await db.timelineEvent.update({
      where: { id },
      data: {
        ...(time !== undefined && { time }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return NextResponse.json(event)
  } catch {
    return NextResponse.json({ error: 'Failed to update timeline event' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.timelineEvent.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete timeline event' }, { status: 500 })
  }
}
