import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const where = weddingId ? { weddingId } : {}
  const pledges = await db.pledge.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(pledges)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const pledge = await db.pledge.create({
    data: {
      weddingId: body.weddingId,
      contributorName: body.contributorName,
      contributorEmail: body.contributorEmail || '',
      amount: parseFloat(body.amount) || 0,
      category: body.category || 'General',
      status: 'PENDING',
      message: body.message || '',
    },
  })
  return NextResponse.json(pledge, { status: 201 })
}
