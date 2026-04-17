#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wedoo Wedding Planner - Comprehensive Project Plan Document (Body PDF)
World-class project planning document generated via ReportLab.
"""

import os, sys, hashlib

# ━━ Skill Path Setup ━━
PDF_SKILL_DIR = os.path.expanduser("~/.openclaw/workspace/skills/pdf")
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, "scripts"))

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, Image, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from pypdf import PdfReader, PdfWriter, Transformation

# ━━ Font Registration ━━
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/calibri-regular.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('Calibri', normal='Calibri', bold='Calibri')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ━━ Color Palette (Cascade - auto-generated) ━━
PAGE_BG       = colors.HexColor('#f1f1ef')
SECTION_BG    = colors.HexColor('#efeeec')
CARD_BG       = colors.HexColor('#e9e8e5')
TABLE_STRIPE  = colors.HexColor('#f5f5f3')
HEADER_FILL   = colors.HexColor('#585037')
COVER_BLOCK   = colors.HexColor('#635c44')
BORDER_COLOR  = colors.HexColor('#d7d2c2')
ICON_COLOR    = colors.HexColor('#81734a')
ACCENT        = colors.HexColor('#562cd6')
ACCENT2       = colors.HexColor('#59c38e')
TEXT_PRIMARY   = colors.HexColor('#181816')
TEXT_MUTED     = colors.HexColor('#86847c')

TABLE_HEADER_COLOR = HEADER_FILL
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = TABLE_STRIPE

# ━━ Page Dimensions ━━
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 1.0 * inch
RIGHT_MARGIN = 1.0 * inch
TOP_MARGIN = 0.9 * inch
BOTTOM_MARGIN = 0.9 * inch
AVAILABLE_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN
CONTENT_H = PAGE_H - TOP_MARGIN - BOTTOM_MARGIN

# ━━ Styles ━━
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    name='DocTitle', fontName='Times New Roman', fontSize=24, leading=32,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=12
)
h1_style = ParagraphStyle(
    name='H1Style', fontName='Times New Roman', fontSize=20, leading=28,
    textColor=HEADER_FILL, spaceBefore=18, spaceAfter=10
)
h2_style = ParagraphStyle(
    name='H2Style', fontName='Times New Roman', fontSize=15, leading=22,
    textColor=ACCENT, spaceBefore=14, spaceAfter=8
)
h3_style = ParagraphStyle(
    name='H3Style', fontName='Times New Roman', fontSize=12, leading=18,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6
)
body_style = ParagraphStyle(
    name='BodyStyle', fontName='Times New Roman', fontSize=10.5, leading=18,
    alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6
)
body_left = ParagraphStyle(
    name='BodyLeft', fontName='Times New Roman', fontSize=10.5, leading=18,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=4
)
bullet_style = ParagraphStyle(
    name='BulletStyle', fontName='Times New Roman', fontSize=10.5, leading=18,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY, leftIndent=20, bulletIndent=8,
    spaceBefore=2, spaceAfter=2
)
caption_style = ParagraphStyle(
    name='CaptionStyle', fontName='Times New Roman', fontSize=9.5, leading=14,
    alignment=TA_CENTER, textColor=TEXT_MUTED, spaceBefore=3, spaceAfter=6
)
callout_style = ParagraphStyle(
    name='CalloutStyle', fontName='Times New Roman', fontSize=11, leading=18,
    alignment=TA_LEFT, textColor=HEADER_FILL, leftIndent=20, borderPadding=10,
    spaceBefore=6, spaceAfter=6
)

# TOC styles
toc_h1_style = ParagraphStyle(
    name='TOCH1', fontName='Times New Roman', fontSize=13, leftIndent=20,
    spaceBefore=6, spaceAfter=3, textColor=TEXT_PRIMARY
)
toc_h2_style = ParagraphStyle(
    name='TOCH2', fontName='Times New Roman', fontSize=11, leftIndent=40,
    spaceBefore=2, spaceAfter=2, textColor=TEXT_MUTED
)

# Table cell styles
header_cell = ParagraphStyle(
    name='HeaderCell', fontName='Times New Roman', fontSize=10,
    textColor=colors.white, alignment=TA_CENTER, leading=14
)
cell_style = ParagraphStyle(
    name='CellStyle', fontName='Times New Roman', fontSize=9.5,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, leading=14,
    wordWrap='CJK'
)
cell_center = ParagraphStyle(
    name='CellCenter', fontName='Times New Roman', fontSize=9.5,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER, leading=14
)

# ━━ TocDocTemplate ━━
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

MAX_KEEP_HEIGHT = A4[1] * 0.4

def safe_keep(elements):
    total_h = 0
    for el in elements:
        w, h = el.wrap(AVAILABLE_W, CONTENT_H)
        total_h += h
    if total_h <= MAX_KEEP_HEIGHT:
        return [KeepTogether(elements)]
    elif len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)

def make_table(data, col_ratios=None, num_header_rows=1):
    if col_ratios is None:
        col_ratios = [1.0 / len(data[0])] * len(data[0])
    col_widths = [r * AVAILABLE_W for r in col_ratios]
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
    ]
    for i in range(num_header_rows):
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), TABLE_HEADER_COLOR))
        style_cmds.append(('TEXTCOLOR', (0, i), (-1, i), TABLE_HEADER_TEXT))
    for i in range(num_header_rows, len(data)):
        bg = TABLE_ROW_EVEN if (i - num_header_rows) % 2 == 0 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BUILD DOCUMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUTPUT_BODY = '/home/z/my-project/download/wedoo_body.pdf'
doc = TocDocTemplate(
    OUTPUT_BODY,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
    title='Wedoo Wedding Planner - Comprehensive Project Plan',
    author='Z.ai',
    creator='Z.ai'
)

story = []

# ━━━━━━━━━━━━━━━━━━━━━━
# TABLE OF CONTENTS
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Paragraph('<b>Table of Contents</b>', title_style))
story.append(Spacer(1, 12))
toc = TableOfContents()
toc.levelStyles = [toc_h1_style, toc_h2_style]
story.append(toc)
story.append(PageBreak())

# ━━━━━━━━━━━━━━━━━━━━━━
# 1. EXECUTIVE SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━
story.extend(safe_keep([
    add_heading('<b>1. Executive Summary</b>', h1_style, level=0),
    Paragraph(
        'Wedoo is an ambitious, world-class wedding planning platform designed to fundamentally transform how couples, families, and vendors collaborate to create unforgettable wedding experiences. The platform consolidates every critical aspect of wedding planning into a single, elegant, and powerful digital ecosystem, eliminating the fragmentation and stress that has traditionally plagued the wedding industry. From managing financial pledges and real-time budgeting to intelligent notifications, seamless messaging, beautiful card creation, and comprehensive vendor coordination, Wedoo represents the next generation of event management technology.',
        body_style
    ),
]))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The global wedding services market is projected to exceed $400 billion by 2028, with a significant and growing portion of couples seeking digital-first solutions to manage their planning journey. Despite this massive demand, the current market remains deeply fragmented, with no single platform offering a truly comprehensive, end-to-end experience. Wedoo is positioned to fill this gap by delivering an enterprise-grade platform that combines the simplicity consumers demand with the power and reliability that professional planners and vendors require. Our approach is rooted in extensive user research, modern cloud-native architecture, and a relentless focus on user experience.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'This project plan outlines the complete strategic blueprint for building Wedoo from the ground up, encompassing product vision, market analysis, feature architecture, technical infrastructure, phased development timeline, team structure, risk mitigation strategies, budget estimation, quality assurance protocols, and go-to-market execution. The plan is designed for a 30-week delivery cycle divided into four major phases: Discovery and Planning, MVP Development, Beta Launch and Testing, and Growth and Scaling. Each phase includes clearly defined milestones, deliverables, and success criteria to ensure accountability and measurable progress throughout the project lifecycle.',
    body_style
))

# ━━━━━━━━━━━━━━━━━━━━━━
# 2. PROJECT VISION & MISSION
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>2. Project Vision and Mission</b>', h1_style, level=0),
]))

story.append(add_heading('<b>2.1 Vision Statement</b>', h2_style, level=1))
story.append(Paragraph(
    'To become the definitive global platform for wedding planning, empowering millions of couples to orchestrate their dream celebrations with confidence, creativity, and complete financial transparency. Wedoo envisions a future where the stress, confusion, and information asymmetry that traditionally accompany wedding planning are replaced by an intuitive, collaborative, and data-rich digital experience. Our platform will set the gold standard for what modern event planning technology should look like, combining cutting-edge artificial intelligence with deeply human-centered design principles.',
    body_style
))

story.append(add_heading('<b>2.2 Mission Statement</b>', h2_style, level=1))
story.append(Paragraph(
    'To deliver a unified, intelligent, and beautifully designed wedding planning ecosystem that simplifies complexity, fosters genuine collaboration between all stakeholders, and ensures every wedding is planned with precision, joy, and financial responsibility. We are committed to building technology that respects the emotional significance of weddings while providing the practical tools and insights needed to make every celebration a resounding success. Our mission extends beyond software: we aim to build a trusted community and marketplace that serves the entire wedding ecosystem.',
    body_style
))

story.append(add_heading('<b>2.3 Core Values</b>', h2_style, level=1))
values_data = [
    [Paragraph('<b>Value</b>', header_cell), Paragraph('<b>Description</b>', header_cell), Paragraph('<b>Impact</b>', header_cell)],
    [Paragraph('User Obsession', cell_style), Paragraph('Every feature, interaction, and design decision is driven by deep empathy for our users and their unique planning journeys.', cell_style), Paragraph('Market-leading satisfaction and retention rates', cell_center)],
    [Paragraph('Transparency', cell_style), Paragraph('Full financial visibility, honest communication, and open pricing structures for all platform participants.', cell_style), Paragraph('Trust-driven vendor and couple relationships', cell_center)],
    [Paragraph('Innovation', cell_style), Paragraph('Continuous investment in AI, automation, and emerging technologies to push the boundaries of what a planning platform can achieve.', cell_style), Paragraph('Competitive moat and platform differentiation', cell_center)],
    [Paragraph('Inclusivity', cell_style), Paragraph('Celebrating diverse cultural traditions, preferences, budgets, and family structures through customizable platform experiences.', cell_style), Paragraph('Global market accessibility and cultural resonance', cell_center)],
    [Paragraph('Reliability', cell_style), Paragraph('Enterprise-grade uptime, security, and data integrity that couples and vendors can depend on during their most important moments.', cell_style), Paragraph('Platform credibility and professional adoption', cell_center)],
]
story.append(Spacer(1, 10))
story.append(make_table(values_data, [0.18, 0.55, 0.27]))
story.append(Paragraph('Table 1: Wedoo Core Values Framework', caption_style))

# ━━━━━━━━━━━━━━━━━━━━━━
# 3. MARKET ANALYSIS
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>3. Market Analysis and Competitive Landscape</b>', h1_style, level=0),
]))

story.append(add_heading('<b>3.1 Market Size and Growth</b>', h2_style, level=1))
story.append(Paragraph(
    'The global wedding services market represents one of the largest and most resilient consumer spending categories worldwide. Current industry valuations place the market at approximately $300 billion annually, with projections indicating growth to over $400 billion by 2028, driven by increasing average wedding budgets, a growing preference for experiential celebrations, and the rapid digitalization of the planning process. The Asia-Pacific region is the fastest-growing segment, followed closely by North America and Europe, while Africa and the Middle East present significant untapped opportunities for technology-driven solutions.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Within this broader market, the wedding technology segment has emerged as a particularly dynamic growth area. Digital wedding planning tools, including platforms, mobile applications, and vendor marketplaces, currently represent approximately $8-12 billion of the total market and are growing at a compound annual growth rate (CAGR) of 18-22%. This growth is fueled by millennial and Gen Z couples who are digital natives and expect seamless, mobile-first experiences in every aspect of their lives, including one of the most significant events they will ever plan. The average couple spends between 200 and 500 hours planning their wedding, creating enormous demand for tools that can streamline and simplify this process.',
    body_style
))

story.append(add_heading('<b>3.2 Competitive Analysis</b>', h2_style, level=1))
comp_data = [
    [Paragraph('<b>Competitor</b>', header_cell), Paragraph('<b>Strengths</b>', header_cell), Paragraph('<b>Weaknesses</b>', header_cell), Paragraph('<b>Wedoo Advantage</b>', header_cell)],
    [Paragraph('The Knot', cell_style), Paragraph('Brand recognition, large vendor database, content library', cell_style), Paragraph('Outdated UI, no pledge management, limited real-time collaboration, expensive vendor listings', cell_style), Paragraph('Modern UI/UX, built-in pledge and budget tools, real-time messaging', cell_style)],
    [Paragraph('Zola', cell_style), Paragraph('Clean design, good registry experience, curated vendor list', cell_style), Paragraph('Limited budgeting tools, no messaging platform, weak guest management', cell_style), Paragraph('Complete financial suite, messaging hub, guest list management', cell_style)],
    [Paragraph('WeddingWire', cell_style), Paragraph('Strong vendor marketplace, review system, SEO presence', cell_style), Paragraph('Fragmented tools, poor mobile experience, no pledge system', cell_style), Paragraph('Integrated all-in-one platform, mobile-first, pledge ecosystem', cell_style)],
    [Paragraph('Pinterest / Canva', cell_style), Paragraph('Inspiration and design tools, massive user base', cell_style), Paragraph('Not a planning tool, no vendor management, no budget tracking', cell_style), Paragraph('Purpose-built planning with design inspiration built-in', cell_style)],
]
story.append(Spacer(1, 10))
story.append(make_table(comp_data, [0.15, 0.27, 0.30, 0.28]))
story.append(Paragraph('Table 2: Competitive Landscape Analysis', caption_style))

story.append(add_heading('<b>3.3 Target Market Segments</b>', h2_style, level=1))
story.append(Paragraph(
    'Wedoo targets three primary market segments that together represent the most significant revenue opportunities in the wedding technology space. The first and largest segment consists of engaged couples aged 22-40, who are actively planning their weddings and seeking digital tools to manage the complexity of the process. This segment values convenience, visual design, mobile accessibility, and real-time collaboration features. They are willing to pay premium subscription fees for tools that genuinely reduce stress and save time during the planning process.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The second segment comprises professional wedding planners and coordinators who manage multiple weddings simultaneously and require enterprise-grade tools for project management, client communication, budget tracking, and vendor coordination. This B2B segment offers high-value recurring revenue opportunities and serves as a powerful distribution channel for reaching engaged couples through planner recommendations. The third segment includes wedding vendors (photographers, caterers, florists, venues, musicians, and more) who benefit from the Wedoo marketplace, client communication tools, and booking management features. By serving all three segments on a single platform, Wedoo creates powerful network effects that drive engagement and reduce churn.',
    body_style
))

# ━━━━━━━━━━━━━━━━━━━━━━
# 4. PRODUCT ARCHITECTURE
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>4. Product Architecture and Feature Design</b>', h1_style, level=0),
]))

story.append(add_heading('<b>4.1 Platform Overview</b>', h2_style, level=1))
story.append(Paragraph(
    'Wedoo is architected as a modular, microservices-based platform that delivers a comprehensive suite of wedding planning tools through a unified and intuitive user interface. The platform is designed around the principle of progressive disclosure, where users encounter a clean, approachable interface that gradually reveals powerful advanced features as their planning needs evolve. This architecture ensures that first-time users feel welcomed and supported while power users and professional planners have access to the depth and flexibility they require. The platform consists of seven core modules, each responsible for a distinct aspect of the wedding planning experience.',
    body_style
))

story.append(add_heading('<b>4.2 Core Modules</b>', h2_style, level=1))

# Module table
module_data = [
    [Paragraph('<b>Module</b>', header_cell), Paragraph('<b>Description</b>', header_cell), Paragraph('<b>Key Capabilities</b>', header_cell), Paragraph('<b>Priority</b>', header_cell)],
    [Paragraph('Pledge Management', cell_style), Paragraph('Financial contribution tracking for family and friends who wish to support the wedding financially.', cell_style), Paragraph('Pledge creation, tracking, reminders, payment integration, transparency dashboard', cell_center), Paragraph('P0 - Critical', cell_center)],
    [Paragraph('Budget Planner', cell_style), Paragraph('Intelligent budgeting tool with category management, forecasting, and AI-powered recommendations.', cell_style), Paragraph('Category budgets, expense tracking, forecasting, vendor cost comparison, savings goals', cell_center), Paragraph('P0 - Critical', cell_center)],
    [Paragraph('Notification Engine', cell_style), Paragraph('Multi-channel notification system delivering timely updates via push, email, SMS, and in-app.', cell_style), Paragraph('Event reminders, task deadlines, vendor updates, RSVP alerts, custom triggers', cell_center), Paragraph('P0 - Critical', cell_center)],
    [Paragraph('Messaging Hub', cell_style), Paragraph('Real-time messaging platform connecting couples, families, planners, and vendors in shared channels.', cell_style), Paragraph('Group chats, direct messages, file sharing, vendor channels, read receipts', cell_center), Paragraph('P1 - High', cell_center)],
    [Paragraph('Card Studio', cell_style), Paragraph('Design tool for creating save-the-dates, invitations, thank-you cards, and other wedding stationery.', cell_style), Paragraph('Template library, custom design, digital + print, RSVP integration, QR codes', cell_center), Paragraph('P1 - High', cell_center)],
    [Paragraph('Guest Manager', cell_style), Paragraph('Comprehensive guest list management with RSVP tracking, meal preferences, seating, and accommodations.', cell_style), Paragraph('Guest lists, RSVP tracking, dietary needs, seating planner, accommodation tracker', cell_center), Paragraph('P1 - High', cell_center)],
    [Paragraph('Vendor Marketplace', cell_style), Paragraph('Curated marketplace connecting couples with verified vendors, complete with reviews and booking.', cell_style), Paragraph('Vendor profiles, reviews, booking, contract management, payment processing', cell_center), Paragraph('P2 - Medium', cell_center)],
]
story.append(Spacer(1, 10))
story.append(make_table(module_data, [0.16, 0.30, 0.34, 0.12]))
story.append(Paragraph('Table 3: Core Platform Modules and Priority Classification', caption_style))

story.append(add_heading('<b>4.3 Module Deep-Dive: Pledge Management</b>', h2_style, level=1))
story.append(Paragraph(
    'The Pledge Management module is one of Wedoo\'s most innovative features, addressing a widespread need in many cultures where family members and close friends contribute financially to support the wedding celebration. This module provides a transparent, respectful, and organized system for managing these contributions without the awkwardness often associated with financial discussions. Pledge creators can define specific categories such as venue, catering, photography, or decoration, allowing contributors to direct their pledges toward areas that are most meaningful to them.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The system supports both anonymous and attributed pledges, with real-time tracking that shows progress toward each category goal and the overall wedding budget. Automated reminders can be configured to send gentle follow-ups to contributors at appropriate intervals, and a comprehensive dashboard provides the couple with a clear overview of all pledges received, pending, and outstanding. The pledge module integrates seamlessly with the Budget Planner, automatically reflecting pledge contributions in the overall financial picture. Payment processing is handled through secure integration with leading payment gateways, supporting multiple currencies and payment methods to accommodate international contributors.',
    body_style
))

story.append(add_heading('<b>4.4 Module Deep-Dive: Budget Planner</b>', h2_style, level=1))
story.append(Paragraph(
    'The Budget Planner is the financial command center of the Wedoo platform, providing couples with a comprehensive, intelligent, and visually engaging tool for managing every dollar of their wedding expenditure. Unlike simple spreadsheet-based budgeting tools, Wedoo\'s Budget Planner leverages machine learning algorithms trained on thousands of real wedding budgets to provide personalized recommendations and realistic cost estimates for each category. When a couple sets their overall budget, the system suggests optimal allocation percentages based on their location, guest count, wedding style, and cultural preferences.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Each budget category (venue, catering, photography, entertainment, attire, flowers, stationery, transportation, and more) includes detailed sub-categories, vendor cost comparisons from the marketplace, and the ability to track both estimated and actual expenditures in real time. The forecasting engine uses historical data and current spending patterns to predict whether the couple is on track to meet their budget, providing early warnings when spending trends suggest potential overruns. Visual charts and progress indicators make it easy to understand the financial picture at a glance, while detailed breakdowns are always available for those who want to dive deeper.',
    body_style
))

story.append(add_heading('<b>4.5 Module Deep-Dive: Notification Engine</b>', h2_style, level=1))
story.append(Paragraph(
    'The Notification Engine ensures that no critical task, deadline, or update is ever missed during the complex planning process. Built on a microservices architecture with a message queue backbone, the engine processes and delivers notifications across four primary channels: push notifications (mobile and desktop), email, SMS, and in-app alerts. Each notification is intelligently routed based on user preferences, urgency level, and delivery optimization algorithms that minimize notification fatigue while ensuring critical information always reaches the intended recipient promptly.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The system supports a rich library of notification templates covering every aspect of wedding planning, from task deadline reminders and vendor payment schedules to RSVP deadline alerts and weather update notifications for outdoor events. Users can create custom notification rules and triggers, allowing them to automate reminders for personal tasks and milestones. The notification preference center gives each user granular control over which notifications they receive, through which channels, and at what frequency, ensuring the system enhances productivity without becoming overwhelming.',
    body_style
))

story.append(add_heading('<b>4.6 Module Deep-Dive: Messaging Hub</b>', h2_style, level=1))
story.append(Paragraph(
    'The Messaging Hub transforms wedding communication from a chaotic mix of text messages, phone calls, email threads, and social media messages into a single, organized, and searchable platform. The hub supports both group channels (such as "Wedding Party," "Family - Bride\'s Side," or "Vendor Coordination") and direct one-on-one messaging, ensuring that every conversation happens in the right context. Built on WebSocket technology for real-time message delivery, the hub supports text, images, documents, voice messages, and video clips, providing a rich communication experience that adapts to each user\'s preferred style.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'A key differentiator of the Wedoo Messaging Hub is its deep integration with the planning context. Messages can reference specific vendors, budget items, tasks, or guests, creating direct links between communication and action. For example, a discussion about a florist in the vendor channel automatically surfaces the vendor\'s profile, proposal, and contract status alongside the conversation. File sharing is built into every channel, with automatic organization of shared documents, contracts, and images. Read receipts and delivery confirmations ensure accountability, while message search and pinning help users quickly find critical information buried in conversation history.',
    body_style
))

story.append(add_heading('<b>4.7 Module Deep-Dive: Card Studio</b>', h2_style, level=1))
story.append(Paragraph(
    'The Card Studio is Wedoo\'s creative design module, empowering couples to design beautiful, personalized wedding stationery without the need for professional graphic design skills or expensive design software. The studio offers a curated library of professionally designed templates across multiple categories including save-the-dates, invitations, RSVP cards, thank-you cards, menus, place cards, programs, and seating charts. Each template is fully customizable, allowing couples to adjust colors, fonts, layouts, imagery, and text to perfectly match their wedding theme and personal style.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The Card Studio supports both digital and physical delivery. Digital cards can be shared via email, SMS, or unique web links, with built-in RSVP tracking and QR code generation for seamless guest responses. Physical cards can be ordered through Wedoo\'s print-on-demand integration, which handles printing, quality control, and shipping directly to the couple or their guests. The studio includes a collaboration feature that allows bridesmaids, groomsmen, family members, or the wedding planner to contribute to the design process, making card creation a shared and enjoyable experience rather than a solitary task.',
    body_style
))

# ━━━━━━━━━━━━━━━━━━━━━━
# 5. TECHNICAL ARCHITECTURE
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>5. Technical Architecture</b>', h1_style, level=0),
]))

story.append(add_heading('<b>5.1 Technology Stack</b>', h2_style, level=1))
story.append(Paragraph(
    'The Wedoo platform is built on a modern, cloud-native technology stack carefully selected for scalability, developer productivity, security, and long-term maintainability. Every technology decision is driven by the requirements of serving millions of concurrent users, processing sensitive financial and personal data, and delivering sub-second response times across a globally distributed user base. The stack follows industry best practices for microservices architecture, containerization, and infrastructure as code.',
    body_style
))

tech_data = [
    [Paragraph('<b>Layer</b>', header_cell), Paragraph('<b>Technology</b>', header_cell), Paragraph('<b>Purpose</b>', header_cell)],
    [Paragraph('Frontend (Web)', cell_style), Paragraph('Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui', cell_style), Paragraph('Server-side rendering, progressive web app, responsive design', cell_style)],
    [Paragraph('Frontend (Mobile)', cell_style), Paragraph('React Native with Expo', cell_style), Paragraph('Cross-platform iOS and Android native applications', cell_style)],
    [Paragraph('Backend API', cell_style), Paragraph('Node.js (Fastify), TypeScript', cell_style), Paragraph('High-performance REST and GraphQL API layer', cell_style)],
    [Paragraph('Real-time Engine', cell_style), Paragraph('Socket.io, Redis Pub/Sub', cell_style), Paragraph('WebSocket messaging, live notifications, real-time sync', cell_style)],
    [Paragraph('Database (Primary)', cell_style), Paragraph('PostgreSQL 16', cell_style), Paragraph('Relational data, transactions, complex queries', cell_style)],
    [Paragraph('Database (Cache)', cell_style), Paragraph('Redis 7', cell_style), Paragraph('Caching, session management, message queues', cell_style)],
    [Paragraph('Database (Search)', cell_style), Paragraph('Elasticsearch 8', cell_style), Paragraph('Full-text search for vendors, templates, messages', cell_style)],
    [Paragraph('Object Storage', cell_style), Paragraph('AWS S3 / Cloudflare R2', cell_style), Paragraph('Image, document, and media file storage', cell_style)],
    [Paragraph('Payment Processing', cell_style), Paragraph('Stripe, PayPal', cell_style), Paragraph('Secure pledge and vendor payment processing', cell_style)],
    [Paragraph('Infrastructure', cell_style), Paragraph('AWS (EKS, RDS, S3, CloudFront, SES, SNS)', cell_style), Paragraph('Cloud hosting, CDN, email delivery, SMS', cell_style)],
    [Paragraph('CI/CD', cell_style), Paragraph('GitHub Actions, Docker, Kubernetes', cell_style), Paragraph('Automated testing, building, and deployment', cell_style)],
    [Paragraph('Monitoring', cell_style), Paragraph('Datadog, Sentry, PagerDuty', cell_style), Paragraph('Application performance, error tracking, incident response', cell_style)],
]
story.append(Spacer(1, 10))
story.append(make_table(tech_data, [0.18, 0.37, 0.45]))
story.append(Paragraph('Table 4: Complete Technology Stack', caption_style))

story.append(add_heading('<b>5.2 System Architecture</b>', h2_style, level=1))
story.append(Paragraph(
    'Wedoo employs a microservices architecture pattern where each core module (Pledge, Budget, Notification, Messaging, Cards, Guest, Vendor) operates as an independent, deployable service with its own database schema, API endpoints, and business logic. This architectural approach provides several critical advantages: independent scalability (the messaging service can scale independently of the card creation service), fault isolation (a failure in the notification service does not impact budget tracking), technology flexibility (individual services can adopt new technologies without affecting the broader platform), and team autonomy (different development teams can own and deploy their services independently).',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Communication between microservices follows two primary patterns: synchronous communication via a centralized API Gateway for user-facing requests, and asynchronous communication via an event-driven architecture using Apache Kafka for inter-service events such as "pledge received," "RSVP confirmed," or "payment processed." The API Gateway handles authentication, rate limiting, request routing, and response aggregation, presenting a unified API surface to frontend clients while managing the complexity of the underlying microservices topology. Service mesh technology (Istio) provides advanced traffic management, observability, and security for inter-service communication.',
    body_style
))

story.append(add_heading('<b>5.3 Database Design</b>', h2_style, level=1))
story.append(Paragraph(
    'The database architecture follows the database-per-service pattern, where each microservice owns and manages its own data store. This approach eliminates single points of failure, enables independent schema evolution, and allows each service to choose the most appropriate database technology for its specific data access patterns. The primary relational database is PostgreSQL 16, used for services that require ACID transactions, complex joins, and strong data consistency guarantees such as the Budget, Pledge, and Guest Management services. Redis serves as the caching layer and message broker, providing sub-millisecond response times for frequently accessed data and powering the real-time features of the Notification and Messaging services.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Elasticsearch is deployed as the search and analytics engine, powering the vendor marketplace search, template discovery, and full-text message search across the Messaging Hub. All database backups follow the 3-2-1 rule (three copies, two different media, one offsite), with continuous point-in-time recovery capability for PostgreSQL and automated snapshot management for all data stores. Data encryption is enforced both at rest (AES-256) and in transit (TLS 1.3), with row-level security policies ensuring that users can only access data they are authorized to view.',
    body_style
))

story.append(add_heading('<b>5.4 Security Architecture</b>', h2_style, level=1))
story.append(Paragraph(
    'Security is a foundational pillar of the Wedoo platform, not an afterthought. The security architecture is designed in accordance with OWASP Top 10, SOC 2 Type II, and GDPR compliance requirements, implementing defense-in-depth strategies across every layer of the technology stack. User authentication is handled through OAuth 2.0 with PKCE flow, supporting social login (Google, Apple, Facebook), email/password with bcrypt hashing, and two-factor authentication via TOTP and SMS. JSON Web Tokens (JWT) with short expiration times and refresh token rotation provide secure session management.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'All API endpoints are protected by role-based access control (RBAC) with granular permissions that distinguish between couples, family members, wedding planners, vendors, and platform administrators. Input validation is enforced at both the API gateway and individual service levels, preventing injection attacks and ensuring data integrity. Regular penetration testing, automated vulnerability scanning (Snyk, Dependabot), and a responsible disclosure program ensure that the platform remains resilient against emerging threats. Payment processing is fully PCI DSS compliant, with all cardholder data handled exclusively by Stripe and never stored on Wedoo servers.',
    body_style
))

# ━━━━━━━━━━━━━━━━━━━━━━
# 6. PROJECT PHASES & TIMELINE
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>6. Project Phases and Timeline</b>', h1_style, level=0),
]))
story.append(Paragraph(
    'The Wedoo project follows a structured, milestone-driven development approach divided into four major phases spanning 30 weeks. Each phase has clearly defined objectives, deliverables, quality gates, and success metrics. The phased approach balances the urgency of market entry with the discipline required to build a robust, scalable platform that can serve millions of users from day one. Critical path dependencies are carefully managed to ensure that foundational infrastructure and core features are established before more advanced capabilities are developed.',
    body_style
))

story.append(add_heading('<b>6.1 Phase 1: Discovery and Planning (Weeks 1-4)</b>', h2_style, level=1))
story.append(Paragraph(
    'The Discovery and Planning phase establishes the strategic, technical, and design foundations for the entire project. This phase involves intensive user research, competitive analysis, requirements engineering, architectural design, and team onboarding. Cross-functional workshops bring together product managers, designers, engineers, and domain experts to align on the product vision, define the minimum viable product (MVP) scope, and establish the technical architecture that will support long-term platform growth.',
    body_style
))

phase1_data = [
    [Paragraph('<b>Week</b>', header_cell), Paragraph('<b>Activities</b>', header_cell), Paragraph('<b>Deliverables</b>', header_cell)],
    [Paragraph('1-2', cell_center), Paragraph('User research interviews, market validation, competitive deep-dive analysis, stakeholder alignment workshops', cell_style), Paragraph('User research report, validated feature priority matrix, stakeholder alignment document', cell_style)],
    [Paragraph('3', cell_center), Paragraph('Product requirements specification, UX wireframing, technical architecture design, infrastructure planning', cell_style), Paragraph('Product requirements document (PRD), wireframes, architecture decision records', cell_style)],
    [Paragraph('4', cell_center), Paragraph('Design system creation, API contract definition, database schema design, sprint planning, CI/CD pipeline setup', cell_style), Paragraph('Design system, OpenAPI specs, ERD diagrams, development environment, sprint backlog', cell_style)],
]
story.append(Spacer(1, 10))
story.append(make_table(phase1_data, [0.10, 0.45, 0.45]))
story.append(Paragraph('Table 5: Phase 1 - Discovery and Planning Schedule', caption_style))

story.append(add_heading('<b>6.2 Phase 2: MVP Development (Weeks 5-16)</b>', h2_style, level=1))
story.append(Paragraph(
    'The MVP Development phase is the heart of the project, encompassing twelve weeks of intensive software development organized into six two-week sprints. The MVP includes the five highest-priority modules: User Authentication, Pledge Management, Budget Planner, Notification Engine, and Guest Management. Each sprint follows the Scrum framework with daily standups, sprint planning, sprint reviews, and retrospectives. Continuous integration and continuous deployment (CI/CD) pipelines ensure that code is automatically tested, built, and deployed to staging environments on every commit, with production deployments occurring at the end of each sprint after passing quality gates.',
    body_style
))

sprint_data = [
    [Paragraph('<b>Sprint</b>', header_cell), Paragraph('<b>Weeks</b>', header_cell), Paragraph('<b>Focus Area</b>', header_cell), Paragraph('<b>Key Deliverables</b>', header_cell)],
    [Paragraph('Sprint 1', cell_center), Paragraph('5-6', cell_center), Paragraph('Foundation: Auth, user profiles, project setup, database migrations, core API infrastructure', cell_style), Paragraph('Working auth system, user management, base API framework, database schema v1', cell_style)],
    [Paragraph('Sprint 2', cell_center), Paragraph('7-8', cell_center), Paragraph('Pledge Management: pledge creation, tracking, payment integration, contributor dashboard', cell_style), Paragraph('Full pledge module with Stripe integration, contributor portal, progress tracking', cell_style)],
    [Paragraph('Sprint 3', cell_center), Paragraph('9-10', cell_center), Paragraph('Budget Planner: category management, expense tracking, forecasting engine, visualization charts', cell_style), Paragraph('Budget module with AI recommendations, forecasting, interactive charts', cell_style)],
    [Paragraph('Sprint 4', cell_center), Paragraph('11-12', cell_center), Paragraph('Notifications: multi-channel engine, preference center, template library, scheduling system', cell_style), Paragraph('Notification service with push/email/SMS, preference UI, automation rules', cell_style)],
    [Paragraph('Sprint 5', cell_center), Paragraph('13-14', cell_center), Paragraph('Guest Manager: guest lists, RSVP tracking, dietary preferences, seating planner integration', cell_style), Paragraph('Guest module with RSVP tracking, meal management, import/export', cell_style)],
    [Paragraph('Sprint 6', cell_center), Paragraph('15-16', cell_center), Paragraph('Integration, performance optimization, security audit, accessibility compliance, bug fixing', cell_style), Paragraph('Fully integrated MVP, performance benchmarks, security audit report, WCAG 2.1 AA', cell_style)],
]
story.append(Spacer(1, 10))
story.append(make_table(sprint_data, [0.12, 0.10, 0.38, 0.40]))
story.append(Paragraph('Table 6: Phase 2 - MVP Sprint Plan', caption_style))

story.append(add_heading('<b>6.3 Phase 3: Beta Launch and Testing (Weeks 17-20)</b>', h2_style, level=1))
story.append(Paragraph(
    'The Beta Launch phase transitions the platform from internal development to real-world validation through a controlled beta program involving 500-1,000 selected participants. Beta participants include engaged couples actively planning weddings, professional wedding planners, and a curated group of wedding vendors. This phase focuses on collecting authentic user feedback, identifying and resolving edge cases, validating performance under real-world load conditions, and refining the user experience based on observed usage patterns.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'During the beta phase, a dedicated quality assurance team conducts comprehensive testing across multiple dimensions including functional testing (verifying all features work as specified), performance testing (ensuring the platform handles peak concurrent users), security testing (penetration testing and vulnerability assessment), usability testing (observing real users interacting with the platform), and compatibility testing (validating across browsers, devices, and operating systems). All user feedback is systematically collected through in-app feedback tools, surveys, and one-on-one interviews, then triaged and prioritized for incorporation into the product roadmap.',
    body_style
))

story.append(add_heading('<b>6.4 Phase 4: Growth and Scaling (Weeks 21-30)</b>', h2_style, level=1))
story.append(Paragraph(
    'The Growth and Scaling phase focuses on expanding the platform\'s feature set, user base, and market presence. This phase introduces the Messaging Hub and Card Studio modules, launches the Vendor Marketplace, implements advanced features such as AI-powered wedding style recommendations and smart budget optimization, and executes the go-to-market strategy across digital and traditional channels. Infrastructure is scaled to support millions of concurrent users, with auto-scaling policies, CDN optimization, and database sharding strategies implemented as user growth demands.',
    body_style
))

growth_data = [
    [Paragraph('<b>Weeks</b>', header_cell), Paragraph('<b>Focus Area</b>', header_cell), Paragraph('<b>Key Deliverables</b>', header_cell)],
    [Paragraph('21-24', cell_center), Paragraph('Messaging Hub and Card Studio development, vendor marketplace launch preparation', cell_style), Paragraph('Real-time messaging, card design tool, vendor onboarding system, print integration', cell_style)],
    [Paragraph('25-26', cell_center), Paragraph('AI features, advanced analytics, mobile app launch, performance optimization', cell_style), Paragraph('AI recommendations, dashboard analytics, iOS/Android apps, load-tested infrastructure', cell_style)],
    [Paragraph('27-28', cell_center), Paragraph('International expansion preparation, localization, multi-currency support, marketing campaigns', cell_style), Paragraph('Localized platforms (3 languages), multi-currency payments, launch marketing materials', cell_style)],
    [Paragraph('29-30', cell_center), Paragraph('Public launch, press events, influencer partnerships, post-launch monitoring and optimization', cell_style), Paragraph('Public launch, media coverage, growth metrics dashboard, operational runbooks', cell_style)],
]
story.append(Spacer(1, 10))
story.append(make_table(growth_data, [0.12, 0.38, 0.50]))
story.append(Paragraph('Table 7: Phase 4 - Growth and Scaling Roadmap', caption_style))

# ━━━━━━━━━━━━━━━━━━━━━━
# 7. TEAM STRUCTURE
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>7. Team Structure and Organization</b>', h1_style, level=0),
]))
story.append(Paragraph(
    'Building a world-class platform requires a world-class team. The Wedoo project is organized around a cross-functional team structure following the Spotify model of aligned autonomy, where small, autonomous squads own specific product areas while remaining aligned to the overall product vision and technical standards. This organizational model balances the agility and ownership benefits of small teams with the coordination and consistency benefits of a unified organization, enabling rapid iteration without sacrificing quality or coherence.',
    body_style
))

team_data = [
    [Paragraph('<b>Role</b>', header_cell), Paragraph('<b>Count</b>', header_cell), Paragraph('<b>Responsibilities</b>', header_cell), Paragraph('<b>Phase</b>', header_cell)],
    [Paragraph('Product Manager', cell_style), Paragraph('2', cell_center), Paragraph('Product strategy, roadmap, requirements prioritization, stakeholder management, analytics', cell_style), Paragraph('All', cell_center)],
    [Paragraph('Tech Lead / Architect', cell_style), Paragraph('2', cell_center), Paragraph('System architecture, technology decisions, code review standards, technical mentorship', cell_style), Paragraph('All', cell_center)],
    [Paragraph('Senior Backend Engineers', cell_style), Paragraph('4', cell_center), Paragraph('Microservices development, API design, database optimization, security implementation', cell_style), Paragraph('2-4', cell_center)],
    [Paragraph('Senior Frontend Engineers', cell_style), Paragraph('3', cell_center), Paragraph('Web application development, UI implementation, state management, performance optimization', cell_style), Paragraph('2-4', cell_center)],
    [Paragraph('Mobile Engineers (React Native)', cell_style), Paragraph('2', cell_center), Paragraph('iOS and Android application development, native feature integration, app store deployment', cell_style), Paragraph('3-4', cell_center)],
    [Paragraph('UX/UI Designer', cell_style), Paragraph('2', cell_center), Paragraph('User research, wireframing, visual design, design system maintenance, usability testing', cell_style), Paragraph('All', cell_center)],
    [Paragraph('QA Engineers', cell_style), Paragraph('2', cell_center), Paragraph('Test strategy, automated testing, manual testing, performance testing, security testing', cell_style), Paragraph('2-4', cell_center)],
    [Paragraph('DevOps / SRE Engineer', cell_style), Paragraph('2', cell_center), Paragraph('CI/CD pipelines, infrastructure management, monitoring, incident response, cost optimization', cell_style), Paragraph('1-4', cell_center)],
    [Paragraph('Data Scientist', cell_style), Paragraph('1', cell_center), Paragraph('ML model development, budget forecasting, personalization algorithms, analytics pipelines', cell_style), Paragraph('2-4', cell_center)],
    [Paragraph('Project Manager', cell_style), Paragraph('1', cell_center), Paragraph('Sprint planning, cross-team coordination, risk management, timeline tracking, reporting', cell_style), Paragraph('All', cell_center)],
]
story.append(Spacer(1, 10))
story.append(make_table(team_data, [0.20, 0.08, 0.52, 0.10]))
story.append(Paragraph('Table 8: Team Structure and Resource Allocation', caption_style))

# ━━━━━━━━━━━━━━━━━━━━━━
# 8. RISK ASSESSMENT
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>8. Risk Assessment and Mitigation</b>', h1_style, level=0),
]))
story.append(Paragraph(
    'Every project of this magnitude carries inherent risks that must be identified, assessed, and proactively managed. The Wedoo risk management framework follows a structured approach where risks are categorized by domain (technical, market, operational, financial), assessed by probability and impact, and assigned specific mitigation strategies with clear ownership and monitoring protocols. The risk register is reviewed weekly during sprint retrospectives and monthly during steering committee meetings, ensuring that emerging risks are captured early and existing mitigations remain effective.',
    body_style
))

risk_data = [
    [Paragraph('<b>Risk</b>', header_cell), Paragraph('<b>Probability</b>', header_cell), Paragraph('<b>Impact</b>', header_cell), Paragraph('<b>Mitigation Strategy</b>', header_cell)],
    [Paragraph('Scope creep beyond MVP timeline', cell_style), Paragraph('High', cell_center), Paragraph('High', cell_center), Paragraph('Strict PRD governance, change control board, MVP scope freeze after Phase 1 sign-off', cell_style)],
    [Paragraph('Key team member departure', cell_style), Paragraph('Medium', cell_center), Paragraph('High', cell_center), Paragraph('Cross-training, comprehensive documentation, competitive retention packages, backup staffing plan', cell_style)],
    [Paragraph('Third-party API service disruption', cell_style), Paragraph('Medium', cell_center), Paragraph('High', cell_center), Paragraph('Multi-provider strategy (Stripe + PayPal), circuit breakers, fallback mechanisms, SLA monitoring', cell_style)],
    [Paragraph('Data breach or security incident', cell_style), Paragraph('Low', cell_center), Paragraph('Critical', cell_center), Paragraph('SOC 2 compliance, regular penetration testing, incident response plan, cyber insurance, security training', cell_style)],
    [Paragraph('Market launch timing misalignment', cell_style), Paragraph('Medium', cell_center), Paragraph('Medium', cell_center), Paragraph('Seasonal wedding calendar analysis, flexible launch window, phased rollout by region', cell_style)],
    [Paragraph('Performance degradation at scale', cell_style), Paragraph('Medium', cell_center), Paragraph('High', cell_center), Paragraph('Load testing from Phase 2, auto-scaling infrastructure, CDN strategy, database read replicas', cell_style)],
    [Paragraph('Budget overrun', cell_style), Paragraph('Medium', cell_center), Paragraph('Medium', cell_center), Paragraph('Monthly financial reviews, 15% contingency buffer, phased investment model, vendor negotiation', cell_style)],
]
story.append(Spacer(1, 10))
story.append(make_table(risk_data, [0.22, 0.10, 0.10, 0.58]))
story.append(Paragraph('Table 9: Risk Assessment Matrix', caption_style))

# ━━━━━━━━━━━━━━━━━━━━━━
# 9. BUDGET ESTIMATION
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>9. Budget Estimation</b>', h1_style, level=0),
]))
story.append(Paragraph(
    'The Wedoo project budget is structured to support a 30-week development cycle from initial discovery through public launch, with an additional 12-month post-launch runway for growth and optimization. The budget encompasses personnel costs, infrastructure and cloud services, third-party software licenses, design and branding, legal and compliance, marketing and launch activities, and a 15% contingency reserve. All cost estimates are based on current market rates for senior-level talent and enterprise-grade cloud services, with regional cost adjustments applied where applicable.',
    body_style
))

budget_data = [
    [Paragraph('<b>Category</b>', header_cell), Paragraph('<b>Phase 1</b>', header_cell), Paragraph('<b>Phase 2</b>', header_cell), Paragraph('<b>Phase 3</b>', header_cell), Paragraph('<b>Phase 4</b>', header_cell), Paragraph('<b>Total</b>', header_cell)],
    [Paragraph('Personnel (salaries)', cell_style), Paragraph('$85,000', cell_center), Paragraph('$340,000', cell_center), Paragraph('$85,000', cell_center), Paragraph('$106,250', cell_center), Paragraph('$616,250', cell_center)],
    [Paragraph('Cloud Infrastructure', cell_style), Paragraph('$5,000', cell_center), Paragraph('$25,000', cell_center), Paragraph('$15,000', cell_center), Paragraph('$30,000', cell_center), Paragraph('$75,000', cell_center)],
    [Paragraph('Third-Party Services', cell_style), Paragraph('$2,000', cell_center), Paragraph('$8,000', cell_center), Paragraph('$4,000', cell_center), Paragraph('$12,000', cell_center), Paragraph('$26,000', cell_center)],
    [Paragraph('Design and Branding', cell_style), Paragraph('$15,000', cell_center), Paragraph('$10,000', cell_center), Paragraph('$5,000', cell_center), Paragraph('$10,000', cell_center), Paragraph('$40,000', cell_center)],
    [Paragraph('Legal and Compliance', cell_style), Paragraph('$10,000', cell_center), Paragraph('$5,000', cell_center), Paragraph('$5,000', cell_center), Paragraph('$10,000', cell_center), Paragraph('$30,000', cell_center)],
    [Paragraph('Marketing and Launch', cell_style), Paragraph('$2,000', cell_center), Paragraph('$5,000', cell_center), Paragraph('$15,000', cell_center), Paragraph('$50,000', cell_center), Paragraph('$72,000', cell_center)],
    [Paragraph('Quality Assurance', cell_style), Paragraph('$3,000', cell_center), Paragraph('$15,000', cell_center), Paragraph('$10,000', cell_center), Paragraph('$8,000', cell_center), Paragraph('$36,000', cell_center)],
    [Paragraph('Contingency (15%)', cell_style), Paragraph('$18,450', cell_center), Paragraph('$61,500', cell_center), Paragraph('$20,700', cell_center), Paragraph('$27,938', cell_center), Paragraph('$128,588', cell_center)],
    [Paragraph('<b>Phase Total</b>', cell_style), Paragraph('<b>$140,450</b>', cell_center), Paragraph('<b>$469,500</b>', cell_center), Paragraph('<b>$159,700</b>', cell_center), Paragraph('<b>$254,188</b>', cell_center), Paragraph('<b>$1,023,838</b>', cell_center)],
]
story.append(Spacer(1, 10))
story.append(make_table(budget_data, [0.22, 0.13, 0.13, 0.13, 0.14, 0.13]))
story.append(Paragraph('Table 10: Budget Estimation by Phase (USD)', caption_style))

# ━━━━━━━━━━━━━━━━━━━━━━
# 10. QA & TESTING
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>10. Quality Assurance and Testing Strategy</b>', h1_style, level=0),
]))
story.append(Paragraph(
    'Quality assurance is embedded into every phase of the Wedoo development lifecycle, following a shift-left testing philosophy where testing activities begin as early as possible in the development process rather than being relegated to a final QA gate. This approach ensures that defects are identified and resolved when they are least expensive to fix, reducing overall project risk and improving the predictability of delivery timelines. The QA strategy encompasses multiple testing levels, automated testing frameworks, and continuous quality monitoring throughout the product lifecycle.',
    body_style
))

story.append(add_heading('<b>10.1 Testing Pyramid</b>', h2_style, level=1))
story.append(Paragraph(
    'The testing strategy follows the industry-standard testing pyramid, with unit tests forming the broad base, integration tests in the middle layer, and end-to-end (E2E) tests at the top. Unit tests cover individual functions and components with a target coverage of 85% or higher for all backend services and 80% for frontend components. These tests execute in milliseconds and provide immediate feedback to developers during the coding process. Integration tests verify that multiple components and services work together correctly, covering API contracts, database interactions, and third-party service integrations.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'End-to-end tests simulate real user journeys through the platform using Playwright for web applications and Detox for mobile applications. These tests validate critical user flows such as user registration, pledge creation and payment, budget setup and expense tracking, guest list import and RSVP tracking, and card design and ordering. E2E tests are executed on every pull request against the staging environment and comprehensively before each production deployment. Load testing using k6 simulates thousands of concurrent users to validate platform performance under stress, with performance budgets defining acceptable response time thresholds for all critical API endpoints.',
    body_style
))

# ━━━━━━━━━━━━━━━━━━━━━━
# 11. GO-TO-MARKET STRATEGY
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>11. Go-to-Market Strategy</b>', h1_style, level=0),
]))
story.append(Paragraph(
    'The Wedoo go-to-market (GTM) strategy is designed to build awareness, drive adoption, and establish market leadership through a multi-channel approach that combines digital marketing, strategic partnerships, community building, and content leadership. The strategy recognizes that the wedding planning market is fundamentally driven by trust, word-of-mouth recommendations, and social proof, and therefore prioritizes building authentic relationships with the wedding community over aggressive paid acquisition.',
    body_style
))

story.append(add_heading('<b>11.1 Launch Strategy</b>', h2_style, level=1))
story.append(Paragraph(
    'The launch strategy follows a three-stage approach: private beta (weeks 17-20), soft public launch (weeks 21-24), and full public launch (weeks 25-30). The private beta generates initial user feedback and social proof through a curated group of 500-1,000 early adopters selected through wedding planning communities, social media, and partnerships with leading wedding blogs and influencers. Beta participants receive complimentary premium access in exchange for their feedback and testimonials, creating a cohort of passionate early advocates.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The soft public launch opens the platform to all users with a freemium model that provides generous free-tier functionality alongside premium features available through monthly or annual subscriptions. Marketing efforts during this phase focus on content marketing (wedding planning guides, budgeting tips, trend reports), social media engagement (Instagram, Pinterest, TikTok), and strategic partnerships with wedding venues and planners who can recommend Wedoo to their clients. The full public launch amplifies these efforts with press coverage, launch events, influencer campaigns, and paid digital advertising targeting engaged couples in key markets.',
    body_style
))

story.append(add_heading('<b>11.2 Revenue Model</b>', h2_style, level=1))
rev_data = [
    [Paragraph('<b>Revenue Stream</b>', header_cell), Paragraph('<b>Model</b>', header_cell), Paragraph('<b>Pricing</b>', header_cell), Paragraph('<b>Target Margin</b>', header_cell)],
    [Paragraph('Premium Subscription (Couples)', cell_style), Paragraph('SaaS Monthly/Annual', cell_style), Paragraph('$9.99/mo or $79.99/yr', cell_center), Paragraph('75%', cell_center)],
    [Paragraph('Professional Plan (Planners)', cell_style), Paragraph('SaaS Monthly/Annual', cell_style), Paragraph('$29.99/mo or $249.99/yr', cell_center), Paragraph('80%', cell_center)],
    [Paragraph('Vendor Marketplace Commission', cell_style), Paragraph('Transaction Fee', cell_style), Paragraph('5-8% per booking', cell_center), Paragraph('90%', cell_center)],
    [Paragraph('Card Studio Print Orders', cell_style), Paragraph('Markup on Print', cell_style), Paragraph('30-50% margin on prints', cell_center), Paragraph('45%', cell_center)],
    [Paragraph('Payment Processing Fees', cell_style), Paragraph('Convenience Fee', cell_style), Paragraph('2.5% pledge processing', cell_center), Paragraph('95%', cell_center)],
    [Paragraph('Premium Templates', cell_style), Paragraph('One-time Purchase', cell_style), Paragraph('$2.99 - $9.99 per template', cell_center), Paragraph('90%', cell_center)],
]
story.append(Spacer(1, 10))
story.append(make_table(rev_data, [0.24, 0.18, 0.30, 0.16]))
story.append(Paragraph('Table 11: Revenue Model and Pricing Strategy', caption_style))

# ━━━━━━━━━━━━━━━━━━━━━━
# 12. SUCCESS METRICS & KPIs
# ━━━━━━━━━━━━━━━━━━━━━━
story.append(Spacer(1, 18))
story.extend(safe_keep([
    add_heading('<b>12. Success Metrics and Key Performance Indicators</b>', h1_style, level=0),
]))
story.append(Paragraph(
    'Success is measured through a comprehensive framework of Key Performance Indicators (KPIs) that span user acquisition, engagement, satisfaction, revenue, and technical performance dimensions. These metrics are tracked in real time through automated dashboards and reviewed weekly by the product team and monthly by the executive steering committee. Each KPI has defined targets for each project phase, enabling objective assessment of progress and early identification of areas requiring attention.',
    body_style
))

kpi_data = [
    [Paragraph('<b>KPI Category</b>', header_cell), Paragraph('<b>Metric</b>', header_cell), Paragraph('<b>Phase 3 Target</b>', header_cell), Paragraph('<b>Phase 4 Target</b>', header_cell)],
    [Paragraph('Acquisition', cell_style), Paragraph('Registered users', cell_style), Paragraph('5,000', cell_center), Paragraph('50,000', cell_center)],
    [Paragraph('Acquisition', cell_style), Paragraph('Active weddings planned', cell_style), Paragraph('1,500', cell_center), Paragraph('15,000', cell_center)],
    [Paragraph('Engagement', cell_style), Paragraph('Weekly active users (WAU)', cell_style), Paragraph('60% of registered', cell_center), Paragraph('45% of registered', cell_center)],
    [Paragraph('Engagement', cell_style), Paragraph('Avg. session duration', cell_style), Paragraph('12 minutes', cell_center), Paragraph('15 minutes', cell_center)],
    [Paragraph('Satisfaction', cell_style), Paragraph('NPS score', cell_style), Paragraph('50+', cell_center), Paragraph('60+', cell_center)],
    [Paragraph('Satisfaction', cell_style), Paragraph('App store rating', cell_style), Paragraph('4.5+ stars', cell_center), Paragraph('4.7+ stars', cell_center)],
    [Paragraph('Revenue', cell_style), Paragraph('Monthly recurring revenue', cell_style), Paragraph('$15,000', cell_center), Paragraph('$150,000', cell_center)],
    [Paragraph('Revenue', cell_style), Paragraph('Free-to-premium conversion', cell_style), Paragraph('8%', cell_center), Paragraph('12%', cell_center)],
    [Paragraph('Technical', cell_style), Paragraph('Platform uptime (SLA)', cell_style), Paragraph('99.5%', cell_center), Paragraph('99.9%', cell_center)],
    [Paragraph('Technical', cell_style), Paragraph('API response time (p95)', cell_style), Paragraph('200ms', cell_center), Paragraph('150ms', cell_center)],
]
story.append(Spacer(1, 10))
story.append(make_table(kpi_data, [0.15, 0.28, 0.25, 0.25]))
story.append(Paragraph('Table 12: Key Performance Indicators and Targets', caption_style))

# ━━━━━━━━━━━━━━━━━━━━━━
# BUILD
# ━━━━━━━━━━━━━━━━━━━━━━
doc.multiBuild(story)
print(f"Body PDF generated: {OUTPUT_BODY}")
