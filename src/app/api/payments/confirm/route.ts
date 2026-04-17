import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('paymentId')

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
  }

  const amount = paymentId.includes('amount') ? '250.00' : '250.00'
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Confirmed - Wedoo</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    /* Confetti */
    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    }

    .confetti {
      position: absolute;
      top: -10px;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      animation: confetti-fall linear forwards;
    }

    @keyframes confetti-fall {
      0% {
        transform: translateY(-10px) rotate(0deg) scale(1);
        opacity: 1;
      }
      70% {
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg) scale(0.5);
        opacity: 0;
      }
    }

    .confetti:nth-child(1) { left: 5%; background: #f43f5e; animation-duration: 3s; animation-delay: 0s; width: 8px; height: 12px; border-radius: 0; }
    .confetti:nth-child(2) { left: 12%; background: #ec4899; animation-duration: 3.5s; animation-delay: 0.2s; width: 6px; height: 14px; }
    .confetti:nth-child(3) { left: 20%; background: #f97316; animation-duration: 2.8s; animation-delay: 0.4s; width: 10px; height: 10px; border-radius: 50%; }
    .confetti:nth-child(4) { left: 28%; background: #eab308; animation-duration: 3.2s; animation-delay: 0.1s; width: 7px; height: 15px; }
    .confetti:nth-child(5) { left: 35%; background: #22c55e; animation-duration: 3.7s; animation-delay: 0.3s; width: 9px; height: 9px; border-radius: 50%; }
    .confetti:nth-child(6) { left: 42%; background: #3b82f6; animation-duration: 2.9s; animation-delay: 0.5s; width: 8px; height: 12px; }
    .confetti:nth-child(7) { left: 50%; background: #8b5cf6; animation-duration: 3.3s; animation-delay: 0.15s; width: 11px; height: 11px; }
    .confetti:nth-child(8) { left: 58%; background: #f43f5e; animation-duration: 3.6s; animation-delay: 0.35s; width: 6px; height: 16px; border-radius: 0; }
    .confetti:nth-child(9) { left: 65%; background: #ec4899; animation-duration: 2.7s; animation-delay: 0.25s; width: 9px; height: 8px; border-radius: 50%; }
    .confetti:nth-child(10) { left: 72%; background: #f97316; animation-duration: 3.4s; animation-delay: 0.45s; width: 7px; height: 13px; }
    .confetti:nth-child(11) { left: 80%; background: #eab308; animation-duration: 3.1s; animation-delay: 0.05s; width: 10px; height: 10px; }
    .confetti:nth-child(12) { left: 88%; background: #22c55e; animation-duration: 3.8s; animation-delay: 0.55s; width: 8px; height: 14px; border-radius: 0; }
    .confetti:nth-child(13) { left: 95%; background: #3b82f6; animation-duration: 2.6s; animation-delay: 0.4s; width: 12px; height: 8px; border-radius: 50%; }
    .confetti:nth-child(14) { left: 8%; background: #8b5cf6; animation-duration: 3.9s; animation-delay: 0.6s; width: 6px; height: 10px; }
    .confetti:nth-child(15) { left: 48%; background: #f43f5e; animation-duration: 3s; animation-delay: 0.5s; width: 8px; height: 8px; border-radius: 50%; }
    .confetti:nth-child(16) { left: 75%; background: #ec4899; animation-duration: 3.2s; animation-delay: 0.2s; width: 10px; height: 6px; }
    .confetti:nth-child(17) { left: 33%; background: #22c55e; animation-duration: 2.8s; animation-delay: 0.7s; width: 7px; height: 11px; }
    .confetti:nth-child(18) { left: 60%; background: #f97316; animation-duration: 3.5s; animation-delay: 0.1s; width: 9px; height: 13px; border-radius: 0; }
    .confetti:nth-child(19) { left: 15%; background: #eab308; animation-duration: 3.3s; animation-delay: 0.45s; width: 5px; height: 15px; }
    .confetti:nth-child(20) { left: 85%; background: #3b82f6; animation-duration: 3.6s; animation-delay: 0.3s; width: 11px; height: 7px; border-radius: 50%; }

    /* Sparkle confetti (star shapes) */
    .sparkle {
      position: absolute;
      top: -10px;
      width: 12px;
      height: 12px;
      background: #fbbf24;
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
      animation: sparkle-fall linear forwards;
    }

    @keyframes sparkle-fall {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }

    .sparkle:nth-child(21) { left: 18%; animation-duration: 4s; animation-delay: 0.3s; width: 10px; height: 10px; }
    .sparkle:nth-child(22) { left: 40%; animation-duration: 4.5s; animation-delay: 0.6s; width: 8px; height: 8px; }
    .sparkle:nth-child(23) { left: 62%; animation-duration: 3.8s; animation-delay: 0.1s; width: 14px; height: 14px; }
    .sparkle:nth-child(24) { left: 83%; animation-duration: 4.2s; animation-delay: 0.8s; width: 10px; height: 10px; }

    .card {
      position: relative;
      z-index: 2;
      background: white;
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(244, 63, 94, 0.15), 0 0 0 1px rgba(244, 63, 94, 0.05);
      text-align: center;
      animation: card-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes card-enter {
      0% { transform: scale(0.9) translateY(20px); opacity: 0; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }

    .check-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: bounce-in 0.6s 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
    }

    @keyframes bounce-in {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }

    .check-circle svg {
      width: 40px;
      height: 40px;
      color: white;
      stroke-dasharray: 60;
      stroke-dashoffset: 60;
      animation: draw-check 0.5s 0.7s ease forwards;
    }

    @keyframes draw-check {
      to { stroke-dashoffset: 0; }
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 32px;
    }

    .details {
      background: #f8fafc;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 32px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .detail-row:not(:last-child) {
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-label {
      font-size: 14px;
      color: #94a3b8;
    }

    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }

    .amount {
      font-size: 36px;
      font-weight: 700;
      color: #059669;
      margin-bottom: 4px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #f43f5e;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 12px 24px;
      border-radius: 12px;
      transition: all 0.2s;
    }

    .back-link:hover {
      background: #fff1f2;
    }

    .back-link svg {
      width: 18px;
      height: 18px;
    }

    .watermark {
      margin-top: 24px;
      font-size: 13px;
      color: #cbd5e1;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="confetti-container">
    <div class="confetti"></div><div class="confetti"></div><div class="confetti"></div>
    <div class="confetti"></div><div class="confetti"></div><div class="confetti"></div>
    <div class="confetti"></div><div class="confetti"></div><div class="confetti"></div>
    <div class="confetti"></div><div class="confetti"></div><div class="confetti"></div>
    <div class="confetti"></div><div class="confetti"></div><div class="confetti"></div>
    <div class="confetti"></div><div class="confetti"></div><div class="confetti"></div>
    <div class="confetti"></div><div class="confetti"></div>
    <div class="sparkle"></div><div class="sparkle"></div>
    <div class="sparkle"></div><div class="sparkle"></div>
  </div>

  <div class="card">
    <div class="check-circle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>

    <h1>Payment Confirmed!</h1>
    <p class="subtitle">Your contribution has been received. Thank you!</p>

    <div class="amount">$${amount}</div>

    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Payment ID</span>
        <span class="detail-value">${paymentId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value" style="color: #059669;">✓ Completed</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${date}</span>
      </div>
    </div>

    <a href="/" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m19 12-7-7 7 7" /><path d="m12 19-7-7 7-7" />
      </svg>
      Back to Wedoo
    </a>

    <p class="watermark">Wedoo - Wedding Planning Made Beautiful</p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
