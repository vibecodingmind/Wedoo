import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const item = await db.budgetCategory.update({
    where: { id },
    data: {
      allocatedAmount: body.allocatedAmount !== undefined ? parseFloat(body.allocatedAmount) : undefined,
      spentAmount: body.spentAmount !== undefined ? parseFloat(body.spentAmount) : undefined,
      name: body.name,
    },
  })
  return NextResponse.json(item)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.budgetCategory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
