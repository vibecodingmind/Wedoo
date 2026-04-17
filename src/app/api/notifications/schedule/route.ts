import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { db } from '@/lib/db'

const SCHEDULED_FILE = join(process.cwd(), 'data', 'scheduled-notifications.json')

interface ScheduledNotification {
  id: string
  weddingId: string
  type: string
  scheduledFor: string
  data: Record<string, unknown>
  status: 'PENDING' | 'SENT' | 'CANCELLED'
  createdAt: string
}

function loadScheduled(): ScheduledNotification[] {
  try {
    if (existsSync(SCHEDULED_FILE)) {
      return JSON.parse(readFileSync(SCHEDULED_FILE, 'utf-8'))
    }
  } catch {
    // File doesn't exist or is corrupted
  }
  return []
}

function saveScheduled(notifications: ScheduledNotification[]) {
  const dir = join(process.cwd(), 'data')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(SCHEDULED_FILE, JSON.stringify(notifications, null, 2))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { weddingId } = body

  if (!weddingId) {
    return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 })
  }

  // Fetch wedding info
  const wedding = await db.wedding.findUnique({ where: { id: weddingId } })
  if (!wedding) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
  }

  const weddingDate = new Date(wedding.date)
  const now = new Date()
  const scheduled: ScheduledNotification[] = []

  // Calculate reminder dates
  const reminderDays = [30, 7, 1]

  for (const days of reminderDays) {
    const reminderDate = new Date(weddingDate)
    reminderDate.setDate(reminderDate.getDate() - days)

    if (reminderDate > now) {
      scheduled.push({
        id: `sched_${Date.now()}_${days}`,
        weddingId,
        type: 'WEDDING_REMINDER',
        scheduledFor: reminderDate.toISOString(),
        data: {
          weddingName: wedding.name,
          weddingDate: weddingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          daysUntil: days,
        },
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      })
    }
  }

  // Check for upcoming checklist items due within 7 days
  const upcomingChecklist = await db.checklistItem.findMany({
    where: {
      weddingId,
      completed: false,
      dueDate: {
        gte: now,
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  })

  for (const item of upcomingChecklist) {
    scheduled.push({
      id: `sched_${Date.now()}_cl_${item.id.slice(0, 6)}`,
      weddingId,
      type: 'CHECKLIST_REMINDER',
      scheduledFor: item.dueDate ? new Date(item.dueDate.getTime() - 24 * 60 * 60 * 1000).toISOString() : new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      data: {
        itemTitle: item.title,
        category: item.category,
        dueDate: item.dueDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || 'TBD',
      },
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    })
  }

  // Save scheduled notifications
  const existing = loadScheduled()
  existing.push(...scheduled)
  saveScheduled(existing)

  return NextResponse.json({
    success: true,
    message: `Scheduled ${scheduled.length} notifications`,
    scheduled,
  })
}

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const scheduled = loadScheduled()

  const filtered = weddingId
    ? scheduled.filter(s => s.weddingId === weddingId)
    : scheduled

  return NextResponse.json(filtered)
}
