import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const EMAILS_FILE = join(process.cwd(), 'data', 'emails.json')

interface EmailRecord {
  id: string
  type: string
  weddingId: string
  recipientEmail: string
  subject: string
  body: string
  data: Record<string, unknown>
  sentAt: string
}

const NOTIFICATION_TEMPLATES: Record<string, (data: Record<string, unknown>) => { subject: string; body: string }> = {
  RSVP_RECEIVED: (data) => ({
    subject: `🎉 New RSVP from ${data.guestName || 'A guest'}`,
    body: `${data.guestName || 'A guest'} has ${data.status === 'ACCEPTED' ? 'accepted' : 'declined'} your wedding invitation${data.plusOne ? ' and will bring a plus one' : ''}. Dietary restrictions: ${data.dietaryRestriction || 'None'}.\n\nMessage: "${data.message || 'No message'}"`,
  }),
  PLEDGE_RECEIVED: (data) => ({
    subject: `💰 New pledge of $${data.amount || 0} from ${data.contributorName || 'A contributor'}`,
    body: `${data.contributorName || 'A contributor'} has pledged $${data.amount || 0} for ${data.category || 'General'}. ${data.message ? `Message: "${data.message}"` : ''}`,
  }),
  CHECKLIST_REMINDER: (data) => ({
    subject: `📋 Reminder: ${data.itemTitle || 'Checklist item'} due ${data.dueDate || 'soon'}`,
    body: `This is a reminder that "${data.itemTitle || 'a checklist item'}" is due on ${data.dueDate || 'soon'}. Category: ${data.category || 'General'}. Don't forget to complete it!`,
  }),
  BUDGET_ALERT: (data) => ({
    subject: `⚠️ Budget Alert: ${data.categoryName || 'Category'} at ${data.percentage || 90}%`,
    body: `Your ${data.categoryName || 'budget category'} has reached ${data.percentage || 90}% of its allocated amount. Spent: $${data.spent || 0} of $${data.allocated || 0}.`,
  }),
  WEDDING_REMINDER: (data) => ({
    subject: `💍 Your wedding is ${data.daysUntil || 30} days away!`,
    body: `Just a reminder that your wedding "${data.weddingName || 'Your Wedding'}" is in ${data.daysUntil || 30} days! Make sure everything is on track. Date: ${data.weddingDate || 'TBD'}`,
  }),
}

function loadEmails(): EmailRecord[] {
  try {
    if (existsSync(EMAILS_FILE)) {
      return JSON.parse(readFileSync(EMAILS_FILE, 'utf-8'))
    }
  } catch {
    // File doesn't exist or is corrupted
  }
  return []
}

function saveEmails(emails: EmailRecord[]) {
  const dir = join(process.cwd(), 'data')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(EMAILS_FILE, JSON.stringify(emails, null, 2))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, weddingId, recipientEmail, data } = body

  if (!type || !weddingId || !recipientEmail) {
    return NextResponse.json({ error: 'Missing required fields: type, weddingId, recipientEmail' }, { status: 400 })
  }

  const template = NOTIFICATION_TEMPLATES[type]
  if (!template) {
    return NextResponse.json({ error: `Unknown notification type: ${type}` }, { status: 400 })
  }

  const { subject, body: emailBody } = template(data || {})

  const emailRecord: EmailRecord = {
    id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    weddingId,
    recipientEmail,
    subject,
    body: emailBody,
    data: data || {},
    sentAt: new Date().toISOString(),
  }

  // Log to console
  console.log(`📧 [EMAIL NOTIFICATION] Type: ${type}`)
  console.log(`   To: ${recipientEmail}`)
  console.log(`   Subject: ${subject}`)
  console.log(`   Body: ${emailBody}`)
  console.log(`   ---`)

  // Save to JSON file
  const emails = loadEmails()
  emails.unshift(emailRecord)
  // Keep only last 100 emails
  saveEmails(emails.slice(0, 100))

  return NextResponse.json({ success: true, message: 'Email notification sent', emailId: emailRecord.id })
}

export async function GET() {
  const emails = loadEmails()
  return NextResponse.json(emails.slice(0, 10))
}
