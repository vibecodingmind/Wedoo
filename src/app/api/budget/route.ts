import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const where = weddingId ? { weddingId } : {}
  const items = await db.budgetCategory.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.budgetCategory.create({
    data: {
      weddingId: body.weddingId,
      name: body.name,
      allocatedAmount: parseFloat(body.allocatedAmount) || 0,
      spentAmount: 0,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
