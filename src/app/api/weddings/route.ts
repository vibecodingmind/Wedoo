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
