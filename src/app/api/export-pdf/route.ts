import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const weddingId = req.nextUrl.searchParams.get('weddingId')
  const type = req.nextUrl.searchParams.get('type') || 'guests'

  if (!weddingId) return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 })

  const wedding = await db.wedding.findFirst({ where: { id: weddingId } })
  if (!wedding) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })

  const weddingName = wedding.name
  const weddingDate = new Date(wedding.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let htmlContent = ''

  if (type === 'guests') {
    const guests = await db.guest.findMany({ where: { weddingId }, orderBy: { name: 'asc' } })
    htmlContent = buildGuestReport(weddingName, weddingDate, guests)
  } else if (type === 'budget') {
    const items = await db.budgetCategory.findMany({ where: { weddingId } })
    htmlContent = buildBudgetReport(weddingName, weddingDate, wedding.budget, items)
  } else if (type === 'checklist') {
    const items = await db.checklistItem.findMany({
      where: { weddingId },
      orderBy: [{ completed: 'asc' }, { category: 'asc' }],
    })
    htmlContent = buildChecklistReport(weddingName, weddingDate, items.map(i => ({ title: i.title, category: i.category, dueDate: i.dueDate ? i.dueDate.toISOString() : null, completed: i.completed })))
  } else if (type === 'full') {
    const [guests, budgetItems, checklistItems] = await Promise.all([
      db.guest.findMany({ where: { weddingId }, orderBy: { name: 'asc' } }),
      db.budgetCategory.findMany({ where: { weddingId } }),
      db.checklistItem.findMany({
        where: { weddingId },
        orderBy: [{ completed: 'asc' }, { category: 'asc' }],
      }),
    ])
    htmlContent = buildFullReport(weddingName, weddingDate, wedding.budget, guests, budgetItems, checklistItems.map(i => ({ title: i.title, category: i.category, dueDate: i.dueDate ? i.dueDate.toISOString() : null, completed: i.completed })))
  } else {
    return NextResponse.json({ error: 'Invalid type. Use: guests, budget, checklist, or full' }, { status: 400 })
  }

  return new Response(htmlContent, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="${weddingName.replace(/\s+/g, '_')}_${type}_report.html"`,
    },
  })
}

/* ========== Shared Header ========== */
function reportShell(title: string, weddingName: string, weddingDate: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1a1a2e;
    background: #fff;
    line-height: 1.6;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
    @page { margin: 0.5in; size: A4; }
  }
  .header {
    background: linear-gradient(135deg, #e11d48 0%, #be123c 50%, #9f1239 100%);
    color: white;
    padding: 32px 40px;
    text-align: center;
  }
  .header .logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .header .logo svg { width: 28px; height: 28px; }
  .header .logo-text {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .header .report-title {
    font-size: 13px;
    font-weight: 500;
    opacity: 0.85;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 4px;
  }
  .header .wedding-name {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .header .wedding-date {
    font-size: 13px;
    opacity: 0.8;
  }
  .header .generated {
    font-size: 11px;
    opacity: 0.6;
    margin-top: 12px;
  }
  .content { padding: 32px 40px; max-width: 900px; margin: 0 auto; }
  .section { margin-bottom: 32px; }
  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: #e11d48;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #fce7f3;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .stat-card {
    background: linear-gradient(135deg, #fff5f7 0%, #ffe4e6 100%);
    border: 1px solid #fecdd3;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }
  .stat-card .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #e11d48;
    line-height: 1.1;
  }
  .stat-card .stat-label {
    font-size: 11px;
    font-weight: 600;
    color: #9f1239;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
  }
  .stat-card.green { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-color: #bbf7d0; }
  .stat-card.green .stat-value { color: #166534; }
  .stat-card.green .stat-label { color: #15803d; }
  .stat-card.amber { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-color: #fde68a; }
  .stat-card.amber .stat-value { color: #b45309; }
  .stat-card.amber .stat-label { color: #d97706; }
  .stat-card.red { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-color: #fca5a5; }
  .stat-card.red .stat-value { color: #dc2626; }
  .stat-card.red .stat-label { color: #ef4444; }
  .stat-card.neutral { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-color: #e2e8f0; }
  .stat-card.neutral .stat-value { color: #334155; }
  .stat-card.neutral .stat-label { color: #64748b; }
  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  th {
    background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
    text-align: left;
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 700;
    color: #9f1239;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #f9a8d4;
  }
  th.right { text-align: right; }
  td {
    padding: 10px 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
  }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) { background: #fafafa; }
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }
  .badge-accepted { background: #dcfce7; color: #166534; }
  .badge-pending { background: #fef3c7; color: #b45309; }
  .badge-declined { background: #fee2e2; color: #dc2626; }
  .badge-done { background: #dcfce7; color: #166534; }
  .badge-todo { background: #fef3c7; color: #b45309; }
  .progress-bar {
    width: 100%;
    height: 8px;
    background: #f1f5f9;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 4px;
  }
  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }
  .category-group { margin-bottom: 20px; }
  .category-header {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    padding: 8px 0;
    margin-bottom: 4px;
  }
  .check { color: #16a34a; font-size: 16px; }
  .uncheck { color: #cbd5e1; font-size: 16px; }
  .footer {
    text-align: center;
    padding: 24px;
    color: #94a3b8;
    font-size: 11px;
    border-top: 1px solid #f1f5f9;
    margin-top: 32px;
  }
  .footer span { color: #e11d48; font-weight: 600; }
  .print-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #e11d48;
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin: 20px auto;
    transition: background 0.2s;
  }
  .print-btn:hover { background: #be123c; }
  .cover-page {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 40px;
  }
  .cover-page .big-heart { font-size: 64px; margin-bottom: 24px; }
  .cover-page h1 {
    font-size: 36px;
    font-weight: 800;
    color: #e11d48;
    margin-bottom: 8px;
  }
  .cover-page .subtitle {
    font-size: 16px;
    color: #64748b;
    margin-bottom: 32px;
  }
  .cover-page .date-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #fce7f3;
    color: #9f1239;
    padding: 10px 24px;
    border-radius: 30px;
    font-size: 15px;
    font-weight: 600;
  }
  .toc {
    list-style: none;
    padding: 0;
    margin: 24px 0;
  }
  .toc li {
    padding: 10px 0;
    border-bottom: 1px dashed #e2e8f0;
    font-size: 14px;
    color: #475569;
    display: flex;
    justify-content: space-between;
  }
  .toc li span { color: #e11d48; font-weight: 600; }
</style>
</head>
<body>
${bodyHtml}
<div class="footer">
  Generated by <span>Wedoo</span> Wedding Planner &middot; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &middot; <span>♥</span> Your perfect day awaits
</div>
<div class="no-print" style="text-align:center; padding-bottom:40px;">
  <button class="print-btn" onclick="window.print()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    Print / Save as PDF
  </button>
</div>
</body>
</html>`
}

/* ========== Header ========== */
function buildHeader(weddingName: string, weddingDate: string, reportType: string) {
  return `<div class="header">
  <div class="logo">
    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    <span class="logo-text">Wedoo</span>
  </div>
  <div class="report-title">${reportType}</div>
  <div class="wedding-name">${weddingName}</div>
  <div class="wedding-date">${weddingDate}</div>
  <div class="generated">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
</div>`
}

/* ========== Guests Report ========== */
function buildGuestReport(weddingName: string, weddingDate: string, guests: Array<{
  name: string; email: string | null; phone: string | null; rsvpStatus: string; tableNumber: number | null; plusOne: boolean; dietaryRestriction: string | null
}>) {
  const confirmed = guests.filter(g => g.rsvpStatus === 'ACCEPTED').length
  const pending = guests.filter(g => g.rsvpStatus === 'PENDING').length
  const declined = guests.filter(g => g.rsvpStatus === 'DECLINED').length
  const withPlusOne = guests.filter(g => g.plusOne).length

  const body = `${buildHeader(weddingName, weddingDate, 'Guest List Report')}
<div class="content">
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value">${guests.length}</div><div class="stat-label">Total Invited</div></div>
    <div class="stat-card green"><div class="stat-value">${confirmed}</div><div class="stat-label">Confirmed</div></div>
    <div class="stat-card amber"><div class="stat-value">${pending}</div><div class="stat-label">Pending</div></div>
    <div class="stat-card red"><div class="stat-value">${declined}</div><div class="stat-label">Declined</div></div>
    <div class="stat-card neutral"><div class="stat-value">${withPlusOne}</div><div class="stat-label">Plus Ones</div></div>
  </div>

  <div class="section">
    <div class="section-title">📋 Guest Details</div>
    <table>
      <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>RSVP Status</th><th>Table</th><th>+1</th><th>Dietary</th></tr></thead>
      <tbody>
        ${guests.map((g, i) => `<tr>
          <td>${i + 1}</td>
          <td><strong>${g.name}</strong></td>
          <td>${g.email || '—'}</td>
          <td>${g.phone || '—'}</td>
          <td><span class="badge badge-${g.rsvpStatus.toLowerCase()}">${g.rsvpStatus}</span></td>
          <td>${g.tableNumber != null ? `Table ${g.tableNumber}` : '—'}</td>
          <td>${g.plusOne ? '✓' : '—'}</td>
          <td>${g.dietaryRestriction || '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>`

  return reportShell('Guest List', weddingName, weddingDate, body)
}

/* ========== Budget Report ========== */
function buildBudgetReport(weddingName: string, weddingDate: string, totalBudget: number, items: Array<{
  name: string; allocatedAmount: number; spentAmount: number
}>) {
  const totalAllocated = items.reduce((s, i) => s + i.allocatedAmount, 0)
  const totalSpent = items.reduce((s, i) => s + i.spentAmount, 0)
  const remaining = totalBudget - totalSpent
  const spendPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

  const barColor = spendPercent > 90 ? '#dc2626' : spendPercent > 70 ? '#f59e0b' : '#e11d48'

  const body = `${buildHeader(weddingName, weddingDate, 'Budget Report')}
<div class="content">
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value">$${totalBudget.toLocaleString()}</div><div class="stat-label">Total Budget</div></div>
    <div class="stat-card amber"><div class="stat-value">$${totalSpent.toLocaleString()}</div><div class="stat-label">Total Spent</div></div>
    <div class="stat-card ${remaining >= 0 ? 'green' : 'red'}"><div class="stat-value">$${remaining.toLocaleString()}</div><div class="stat-label">${remaining >= 0 ? 'Remaining' : 'Over Budget'}</div></div>
    <div class="stat-card neutral"><div class="stat-value">${spendPercent}%</div><div class="stat-label">Budget Used</div></div>
  </div>

  <!-- Overall Progress -->
  <div class="section">
    <div class="section-title">💰 Overall Spending Progress</div>
    <div style="margin-bottom:8px; font-size:13px; color:#64748b;">$${totalSpent.toLocaleString()} of $${totalBudget.toLocaleString()} spent</div>
    <div class="progress-bar" style="height:12px;">
      <div class="progress-fill" style="width:${spendPercent}%; background:${barColor};"></div>
    </div>
  </div>

  <!-- Category Breakdown -->
  <div class="section">
    <div class="section-title">📊 Category Breakdown</div>
    <table>
      <thead><tr><th>Category</th><th class="right">Allocated</th><th class="right">Spent</th><th class="right">Remaining</th><th class="right">Progress</th></tr></thead>
      <tbody>
        ${items.map(item => {
          const rem = item.allocatedAmount - item.spentAmount
          const pct = item.allocatedAmount > 0 ? Math.min(100, Math.round((item.spentAmount / item.allocatedAmount) * 100)) : 0
          const pColor = pct > 90 ? '#dc2626' : pct > 70 ? '#f59e0b' : '#e11d48'
          return `<tr>
            <td><strong>${item.name}</strong></td>
            <td class="right">$${item.allocatedAmount.toLocaleString()}</td>
            <td class="right">$${item.spentAmount.toLocaleString()}</td>
            <td class="right" style="color:${rem < 0 ? '#dc2626' : '#166534'}; font-weight:600;">$${rem.toLocaleString()}</td>
            <td class="right" style="min-width:120px;">
              <div style="display:flex; align-items:center; gap:8px; justify-content:flex-end;">
                <div class="progress-bar" style="width:80px; display:inline-block;">
                  <div class="progress-fill" style="width:${pct}%; background:${pColor};"></div>
                </div>
                <span style="font-size:11px; font-weight:600; color:#64748b;">${pct}%</span>
              </div>
            </td>
          </tr>`
        }).join('')}
      </tbody>
    </table>
  </div>
</div>`

  return reportShell('Budget Report', weddingName, weddingDate, body)
}

/* ========== Checklist Report ========== */
function buildChecklistReport(weddingName: string, weddingDate: string, items: Array<{
  title: string; category: string; dueDate: string | null; completed: boolean
}>) {
  const completed = items.filter(i => i.completed).length
  const todo = items.length - completed
  const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0

  // Group by category
  const grouped: Record<string, typeof items> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  const body = `${buildHeader(weddingName, weddingDate, 'Checklist Report')}
<div class="content">
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value">${items.length}</div><div class="stat-label">Total Tasks</div></div>
    <div class="stat-card green"><div class="stat-value">${completed}</div><div class="stat-label">Completed</div></div>
    <div class="stat-card amber"><div class="stat-value">${todo}</div><div class="stat-label">Remaining</div></div>
    <div class="stat-card neutral"><div class="stat-value">${pct}%</div><div class="stat-label">Progress</div></div>
  </div>

  <div class="section">
    <div class="section-title">✅ Overall Progress</div>
    <div class="progress-bar" style="height:12px;">
      <div class="progress-fill" style="width:${pct}%; background:#16a34a;"></div>
    </div>
    <div style="margin-top:8px; font-size:13px; color:#64748b;">${completed} of ${items.length} tasks completed</div>
  </div>

  ${Object.entries(grouped).map(([category, catItems]) => {
    const catCompleted = catItems.filter(i => i.completed).length
    const catPct = catItems.length > 0 ? Math.round((catCompleted / catItems.length) * 100) : 0
    return `<div class="section">
      <div class="section-title">${category} <span style="font-size:12px; font-weight:400; color:#94a3b8; margin-left:auto;">${catCompleted}/${catItems.length} (${catPct}%)</span></div>
      <table>
        <thead><tr><th style="width:40px;"></th><th>Task</th><th>Due Date</th><th>Status</th></tr></thead>
        <tbody>
          ${catItems.map(item => `<tr>
            <td style="text-align:center;">${item.completed ? '<span class="check">✓</span>' : '<span class="uncheck">☐</span>'}</td>
            <td style="${item.completed ? 'text-decoration:line-through; color:#94a3b8;' : ''}">${item.title}</td>
            <td>${item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
            <td><span class="badge ${item.completed ? 'badge-done' : 'badge-todo'}">${item.completed ? 'Done' : 'To Do'}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`
  }).join('')}
</div>`

  return reportShell('Checklist Report', weddingName, weddingDate, body)
}

/* ========== Full Report ========== */
function buildFullReport(
  weddingName: string,
  weddingDate: string,
  totalBudget: number,
  guests: Array<{ name: string; email: string | null; phone: string | null; rsvpStatus: string; tableNumber: number | null; plusOne: boolean; dietaryRestriction: string | null }>,
  budgetItems: Array<{ name: string; allocatedAmount: number; spentAmount: number }>,
  checklistItems: Array<{ title: string; category: string; dueDate: string | null; completed: boolean }>
) {
  const confirmed = guests.filter(g => g.rsvpStatus === 'ACCEPTED').length
  const pending = guests.filter(g => g.rsvpStatus === 'PENDING').length
  const totalSpent = budgetItems.reduce((s, i) => s + i.spentAmount, 0)
  const remaining = totalBudget - totalSpent
  const clCompleted = checklistItems.filter(i => i.completed).length
  const spendPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
  const clPct = checklistItems.length > 0 ? Math.round((clCompleted / checklistItems.length) * 100) : 0

  // Group checklist by category
  const grouped: Record<string, typeof checklistItems> = {}
  for (const item of checklistItems) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  const body = `${buildHeader(weddingName, weddingDate, 'Complete Wedding Report')}

<!-- Cover Page -->
<div class="content">
  <div class="cover-page">
    <div class="big-heart">💍</div>
    <h1>${weddingName}</h1>
    <div class="subtitle">Complete Wedding Planning Report</div>
    <div class="date-badge">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      ${weddingDate}
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="section">
    <div class="section-title">📑 Table of Contents</div>
    <ul class="toc">
      <li><span>1.</span> Wedding Summary</li>
      <li><span>2.</span> Guest List (${guests.length} guests)</li>
      <li><span>3.</span> Budget Overview ($${totalBudget.toLocaleString()})</li>
      <li><span>4.</span> Planning Checklist (${checklistItems.length} tasks)</li>
    </ul>
  </div>

  <!-- Summary -->
  <div class="section">
    <div class="section-title">📊 Wedding Summary</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${guests.length}</div><div class="stat-label">Guests Invited</div></div>
      <div class="stat-card green"><div class="stat-value">${confirmed}</div><div class="stat-label">Confirmed</div></div>
      <div class="stat-card amber"><div class="stat-value">${pending}</div><div class="stat-label">Pending RSVP</div></div>
      <div class="stat-card"><div class="stat-value">$${totalBudget.toLocaleString()}</div><div class="stat-label">Total Budget</div></div>
      <div class="stat-card ${remaining >= 0 ? 'green' : 'red'}"><div class="stat-value">$${remaining.toLocaleString()}</div><div class="stat-label">Remaining</div></div>
      <div class="stat-card neutral"><div class="stat-value">${clPct}%</div><div class="stat-label">Tasks Done</div></div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- Guest List Section -->
  <div class="section">
    <div class="section-title">👥 Guest List</div>
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="stat-card"><div class="stat-value">${guests.length}</div><div class="stat-label">Total</div></div>
      <div class="stat-card green"><div class="stat-value">${confirmed}</div><div class="stat-label">Confirmed</div></div>
      <div class="stat-card amber"><div class="stat-value">${pending}</div><div class="stat-label">Pending</div></div>
      <div class="stat-card red"><div class="stat-value">${guests.length - confirmed - pending}</div><div class="stat-label">Declined</div></div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>RSVP</th><th>Table</th><th>+1</th><th>Dietary</th></tr></thead>
      <tbody>
        ${guests.map((g, i) => `<tr>
          <td>${i + 1}</td>
          <td><strong>${g.name}</strong></td>
          <td>${g.email || '—'}</td>
          <td>${g.phone || '—'}</td>
          <td><span class="badge badge-${g.rsvpStatus.toLowerCase()}">${g.rsvpStatus}</span></td>
          <td>${g.tableNumber != null ? `Table ${g.tableNumber}` : '—'}</td>
          <td>${g.plusOne ? '✓' : '—'}</td>
          <td>${g.dietaryRestriction || '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <!-- Budget Section -->
  <div class="section">
    <div class="section-title">💰 Budget Overview</div>
    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="stat-card"><div class="stat-value">$${totalBudget.toLocaleString()}</div><div class="stat-label">Total Budget</div></div>
      <div class="stat-card amber"><div class="stat-value">$${totalSpent.toLocaleString()}</div><div class="stat-label">Spent</div></div>
      <div class="stat-card ${remaining >= 0 ? 'green' : 'red'}"><div class="stat-value">$${remaining.toLocaleString()}</div><div class="stat-label">${remaining >= 0 ? 'Remaining' : 'Over'}</div></div>
    </div>
    <div style="margin-bottom:16px;">
      <div class="progress-bar" style="height:12px;">
        <div class="progress-fill" style="width:${spendPercent}%; background:${spendPercent > 90 ? '#dc2626' : '#e11d48'};"></div>
      </div>
      <div style="margin-top:4px; font-size:12px; color:#64748b;">${spendPercent}% of budget used</div>
    </div>
    <table>
      <thead><tr><th>Category</th><th class="right">Allocated</th><th class="right">Spent</th><th class="right">Remaining</th></tr></thead>
      <tbody>
        ${budgetItems.map(item => {
          const rem = item.allocatedAmount - item.spentAmount
          return `<tr>
            <td><strong>${item.name}</strong></td>
            <td class="right">$${item.allocatedAmount.toLocaleString()}</td>
            <td class="right">$${item.spentAmount.toLocaleString()}</td>
            <td class="right" style="color:${rem < 0 ? '#dc2626' : '#166534'}; font-weight:600;">$${rem.toLocaleString()}</td>
          </tr>`
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <!-- Checklist Section -->
  <div class="section">
    <div class="section-title">✅ Planning Checklist</div>
    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="stat-card"><div class="stat-value">${checklistItems.length}</div><div class="stat-label">Total Tasks</div></div>
      <div class="stat-card green"><div class="stat-value">${clCompleted}</div><div class="stat-label">Completed</div></div>
      <div class="stat-card amber"><div class="stat-value">${checklistItems.length - clCompleted}</div><div class="stat-label">Remaining</div></div>
    </div>
    <div class="progress-bar" style="height:12px; margin-bottom:24px;">
      <div class="progress-fill" style="width:${clPct}%; background:#16a34a;"></div>
    </div>

    ${Object.entries(grouped).map(([category, catItems]) => {
      const catCompleted = catItems.filter(i => i.completed).length
      return `<div class="category-group">
        <div class="category-header">${category} (${catCompleted}/${catItems.length})</div>
        <table>
          <thead><tr><th style="width:40px;"></th><th>Task</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            ${catItems.map(item => `<tr>
              <td style="text-align:center;">${item.completed ? '<span class="check">✓</span>' : '<span class="uncheck">☐</span>'}</td>
              <td style="${item.completed ? 'text-decoration:line-through; color:#94a3b8;' : ''}">${item.title}</td>
              <td>${item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
              <td><span class="badge ${item.completed ? 'badge-done' : 'badge-todo'}">${item.completed ? 'Done' : 'To Do'}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`
    }).join('')}
  </div>
</div>`

  return reportShell('Complete Wedding Report', weddingName, weddingDate, body)
}
