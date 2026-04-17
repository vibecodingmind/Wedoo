import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const type = req.nextUrl.searchParams.get('type') || 'guests'

  if (!weddingId) return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 })

  const wedding = await db.wedding.findFirst({ where: { id: weddingId } })
  if (!wedding) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })

  if (type === 'guests') {
    const guests = await db.guest.findMany({ where: { weddingId }, orderBy: { name: 'asc' } })
    const html = buildGuestListHtml(wedding.name, wedding.date, guests)
    return new Response(html, { headers: { 'Content-Type': 'text/html', 'Content-Disposition': `attachment; filename="Guest_List.html"` } })
  }

  if (type === 'budget') {
    const items = await db.budgetCategory.findMany({ where: { weddingId } })
    const html = buildBudgetHtml(wedding.name, wedding.budget, items)
    return new Response(html, { headers: { 'Content-Type': 'text/html', 'Content-Disposition': `attachment; filename="Budget_Report.html"` } })
  }

  if (type === 'checklist') {
    const items = await db.checklistItem.findMany({ where: { weddingId }, orderBy: [{ completed: 'asc' }, { category: 'asc' }] })
    const html = buildChecklistHtml(wedding.name, items.map(i => ({ title: i.title, category: i.category, dueDate: i.dueDate ? i.dueDate.toISOString() : null, completed: i.completed })))
    return new Response(html, { headers: { 'Content-Type': 'text/html', 'Content-Disposition': `attachment; filename="Checklist.html"` } })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

function buildGuestListHtml(weddingName: string, date: Date, guests: { name: string; email: string | null; phone: string | null; rsvpStatus: string; tableNumber: number | null; plusOne: boolean; dietaryRestriction: string | null }[]) {
  const confirmed = guests.filter(g => g.rsvpStatus === 'ACCEPTED').length
  const pending = guests.filter(g => g.rsvpStatus === 'PENDING').length
  const declined = guests.filter(g => g.rsvpStatus === 'DECLINED').length
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Guest List</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a}h1{color:#e11d48;border-bottom:3px solid #e11d48;padding-bottom:8px}h2{color:#64748b;font-size:14px;font-weight:400}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#fce7f3;text-align:left;padding:10px;font-size:13px;color:#9f1239;border-bottom:2px solid #fda4af}td{padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px}.accepted{color:#166534;font-weight:600}.pending{color:#d97706;font-weight:600}.declined{color:#dc2626;font-weight:600}.stats{display:flex;gap:16px;margin:20px 0}.stat{text-align:center;padding:12px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;flex:1}.stat .num{font-size:24px;font-weight:700;color:#e11d48}.stat .label{font-size:11px;color:#64748b;margin-top:2px}</style></head><body>
<h1>${weddingName}</h1><h2>Wedding Date: ${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h2>
<div class="stats"><div class="stat"><div class="num">${guests.length}</div><div class="label">Total</div></div><div class="stat"><div class="num" style="color:#166534">${confirmed}</div><div class="label">Confirmed</div></div><div class="stat"><div class="num" style="color:#d97706">${pending}</div><div class="label">Pending</div></div><div class="stat"><div class="num" style="color:#dc2626">${declined}</div><div class="label">Declined</div></div></div>
<table><thead><tr><th>#</th><th>Name</th><th>Email</th><th>RSVP</th><th>Table</th><th>+1</th><th>Dietary</th></tr></thead><tbody>
${guests.map((g, i) => `<tr><td>${i + 1}</td><td><strong>${g.name}</strong></td><td>${g.email || '-'}</td><td class="${g.rsvpStatus.toLowerCase()}">${g.rsvpStatus}</td><td>${g.tableNumber || '-'}</td><td>${g.plusOne ? 'Yes' : 'No'}</td><td>${g.dietaryRestriction || '-'}</td></tr>`).join('')}
</tbody></table></body></html>`
}

function buildBudgetHtml(weddingName: string, totalBudget: number, items: { name: string; allocatedAmount: number; spentAmount: number }[]) {
  const totalSpent = items.reduce((s, i) => s + i.spentAmount, 0)
  const remaining = totalBudget - totalSpent
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Budget Report</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a}h1{color:#e11d48;border-bottom:3px solid #e11d48;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#fce7f3;text-align:left;padding:10px;font-size:13px;color:#9f1239;border-bottom:2px solid #fda4af}td{padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px}.right{text-align:right}.over{color:#dc2626;font-weight:600}</style></head><body>
<h1>${weddingName} — Budget Report</h1>
<div style="display:flex;gap:16px;margin:20px 0;flex-wrap:wrap"><div style="flex:1;padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px"><div style="font-size:12px;color:#64748b">Total Budget</div><div style="font-size:24px;font-weight:700">$${totalBudget.toLocaleString()}</div></div><div style="flex:1;padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px"><div style="font-size:12px;color:#64748b">Total Spent</div><div style="font-size:24px;font-weight:700;color:#e11d48">$${totalSpent.toLocaleString()}</div></div><div style="flex:1;padding:16px;background:${remaining >= 0 ? '#dcfce7' : '#fee2e2'};border:1px solid #e2e8f0;border-radius:8px"><div style="font-size:12px;color:#64748b">Remaining</div><div style="font-size:24px;font-weight:700;color:${remaining >= 0 ? '#166534' : '#dc2626'}">$${remaining.toLocaleString()}</div></div></div>
<table><thead><tr><th>Category</th><th class="right">Allocated</th><th class="right">Spent</th><th class="right">Remaining</th></tr></thead><tbody>
${items.map(i => { const rem = i.allocatedAmount - i.spentAmount; return `<tr><td><strong>${i.name}</strong></td><td class="right">$${i.allocatedAmount.toLocaleString()}</td><td class="right">$${i.spentAmount.toLocaleString()}</td><td class="right ${rem < 0 ? 'over' : ''}">$${rem.toLocaleString()}</td></tr>` }).join('')}
</tbody></table></body></html>`
}

function buildChecklistHtml(weddingName: string, items: { title: string; category: string; dueDate: string | null; completed: boolean }[]) {
  const completed = items.filter(i => i.completed).length
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Checklist</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a}h1{color:#e11d48;border-bottom:3px solid #e11d48;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#fce7f3;text-align:left;padding:10px;font-size:13px;color:#9f1239;border-bottom:2px solid #fda4af}td{padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px}.done{color:#9ca3af;text-decoration:line-through}</style></head><body>
<h1>${weddingName} — Checklist</h1><p style="color:#64748b">${completed}/${items.length} tasks completed (${items.length ? Math.round((completed / items.length) * 100) : 0}%)</p>
<table><thead><tr><th></th><th>Task</th><th>Category</th><th>Due Date</th><th>Status</th></tr></thead><tbody>
${items.map(i => `<tr><td style="font-size:18px">${i.completed ? '&#10003;' : '&#9744;'}</td><td class="${i.completed ? 'done' : ''}"><strong>${i.title}</strong></td><td>${i.category}</td><td>${i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</td><td>${i.completed ? '<span style="color:#166534;font-weight:600">Done</span>' : '<span style="color:#d97706;font-weight:600">Pending</span>'}</td></tr>`).join('')}
</tbody></table></body></html>`
}
