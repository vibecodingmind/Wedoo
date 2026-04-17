import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const vendors = await db.vendor.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(vendors)
}
