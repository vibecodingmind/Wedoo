import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, avatar, role } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        email,
        name: name || null,
        avatar: avatar || null,
        role: role || 'COUPLE',
      },
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
