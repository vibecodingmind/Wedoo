import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { src, caption, category } = body

    const photo = await db.photo.update({
      where: { id },
      data: {
        ...(src !== undefined && { src }),
        ...(caption !== undefined && { caption }),
        ...(category !== undefined && { category }),
      },
    })

    return NextResponse.json(photo)
  } catch {
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.photo.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
