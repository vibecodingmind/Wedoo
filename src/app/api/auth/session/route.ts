import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Return the first user as a demo session
    const user = await db.user.findFirst()
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 })
  }
}
