from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle,
)
from reportlab.platypus.flowables import KeepInFrame
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER

PAGE_W, PAGE_H = A4
H_MARGIN = 0.0        # header runs edge-to-edge via a full-width table
V_MARGIN = 0.0
BODY_H_MARGIN = 0.45 * inch
BODY_V_MARGIN = 0.30 * inch
CONTENT_W = PAGE_W - 2 * BODY_H_MARGIN
SIDEBAR_W = CONTENT_W * 0.30
MAIN_W = CONTENT_W * 0.70
KIF_H = 28 * inch

NAVY_DARK = '#0f172a'
NAVY = '#1e3a8a'
NAVY_LIGHT = '#dbeafe'
GOLD = '#fbbf24'
WHITE = '#ffffff'
MUTED = '#94a3b8'
DARK = '#1e293b'
BODY_MUTED = '#475569'
DIVIDER = '#bfdbfe'
SIDEBAR_BG = '#f0f4ff'


def _styles():
    return dict(
        name=ParagraphStyle(
            'enName', fontName='Helvetica-Bold', fontSize=22,
            textColor=colors.HexColor(WHITE), spaceAfter=2,
        ),
        tagline=ParagraphStyle(
            'enTagline', fontName='Helvetica', fontSize=10,
            textColor=colors.HexColor(NAVY_LIGHT), spaceAfter=0,
        ),
        header_contact=ParagraphStyle(
            'enHdrContact', fontName='Helvetica', fontSize=8,
            textColor=colors.HexColor(MUTED), spaceAfter=0,
        ),
        s_label=ParagraphStyle(
            'enSLabel', fontName='Helvetica-Bold', fontSize=8,
            textColor=colors.HexColor(NAVY), spaceBefore=12, spaceAfter=5,
            textTransform='uppercase', letterSpacing=1.0,
        ),
        s_item=ParagraphStyle(
            'enSItem', fontName='Helvetica', fontSize=9,
            textColor=colors.HexColor(DARK), leading=15, spaceAfter=4,
        ),
        section=ParagraphStyle(
            'enSection', fontName='Helvetica-Bold', fontSize=8.5,
            textColor=colors.HexColor(NAVY), textTransform='uppercase',
            letterSpacing=1.2, spaceBefore=10, spaceAfter=2,
        ),
        body=ParagraphStyle(
            'enBody', fontName='Helvetica', fontSize=9,
            leading=13, spaceAfter=3, textColor=colors.HexColor(DARK),
        ),
        bold=ParagraphStyle(
            'enBold', fontName='Helvetica-Bold', fontSize=9,
            spaceAfter=1, textColor=colors.HexColor(DARK),
        ),
        small=ParagraphStyle(
            'enSmall', fontName='Helvetica', fontSize=8,
            textColor=colors.HexColor(BODY_MUTED), spaceAfter=2,
        ),
        italic=ParagraphStyle(
            'enItalic', fontName='Helvetica-Oblique', fontSize=9,
            leading=13, textColor=colors.HexColor(BODY_MUTED), spaceAfter=4,
        ),
    )


def _hr():
    return HRFlowable(width='100%', thickness=0.5, color=colors.HexColor(DIVIDER), spaceAfter=4)


def _section(title, s):
    return [Paragraph(title, s['section']), _hr()]


def _build_header_table(user_data, s):
    name = user_data.get('full_name', '')
    contact_parts = [x for x in [
        user_data.get('contact_email'), user_data.get('phone_number'),
        user_data.get('location'), user_data.get('linkedin_url'),
    ] if x]

    left_cell = [Paragraph(name, s['name'])]
    right_cell = [Paragraph(p, s['header_contact']) for p in contact_parts]

    header = Table(
        [[left_cell, right_cell]],
        colWidths=[PAGE_W * 0.60, PAGE_W * 0.40],
    )
    header.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, -1), colors.HexColor(NAVY_DARK)),
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN',         (1, 0), (1,  -1), 'RIGHT'),
        ('LEFTPADDING',   (0, 0), (0,  -1), 18),
        ('RIGHTPADDING',  (0, 0), (0,  -1), 10),
        ('TOPPADDING',    (0, 0), (-1, -1), 18),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 18),
        ('LEFTPADDING',   (1, 0), (1,  -1), 10),
        ('RIGHTPADDING',  (1, 0), (1,  -1), 18),
    ]))
    return header


def _build_sidebar(user_data, tailored_data, s):
    items = []

    for heading, key in [
        ('Technical Skills', 'tech_skills'),
        ('Soft Skills', 'soft_skills'),
        ('Languages', 'languages'),
    ]:
        entries = tailored_data.get(key) or []
        if entries:
            items.append(Paragraph(heading, s['s_label']))
            for entry in entries:
                items.append(Paragraph(f'• {entry}', s['s_item']))
            items.append(Spacer(1, 6))

    certs = tailored_data.get('certifications') or []
    if certs:
        items.append(Paragraph('Certifications', s['s_label']))
        for cert in certs:
            name = cert.get('name', '')
            issuer = cert.get('issuer') or cert.get('organization', '')
            date = cert.get('year') or cert.get('issue_date') or cert.get('date', '')
            items.append(Paragraph(f'<b>{name}</b>', s['s_item']))
            if issuer:
                items.append(Paragraph(issuer, s['small']))
            if date:
                items.append(Paragraph(date, s['small']))
            items.append(Spacer(1, 5))

    return items


def _build_main(user_data, tailored_data, s):
    items = []

    if tailored_data.get('summary'):
        items.extend(_section('Executive Summary', s))
        items.append(Paragraph(tailored_data['summary'], s['italic']))
        items.append(Spacer(1, 4))

    exp_list = tailored_data.get('experience') or []
    if exp_list:
        items.extend(_section('Professional Experience', s))
        for exp in exp_list:
            items.append(Paragraph(f"<b>{exp.get('role', '')}</b>", s['bold']))
            items.append(Paragraph(
                f"{exp.get('company', '')}  ·  {exp.get('duration', '')}",
                s['small'],
            ))
            for r in exp.get('responsibilities', []):
                items.append(Paragraph(f'• {r}', s['body']))
            items.append(Spacer(1, 5))

    edu_list = tailored_data.get('education') or []
    if edu_list:
        items.extend(_section('Education', s))
        for edu in edu_list:
            items.append(Paragraph(f"<b>{edu.get('degree', '')}</b>", s['bold']))
            items.append(Paragraph(
                f"{edu.get('university', '')}  ·  {edu.get('graduation_year', '')}",
                s['small'],
            ))
            items.append(Spacer(1, 4))

    proj_list = tailored_data.get('projects') or []
    if proj_list:
        items.extend(_section('Notable Projects', s))
        for proj in proj_list:
            name = proj.get('name', '')
            tech = proj.get('tech_stack') or proj.get('technologies', '')
            if isinstance(tech, list):
                tech = ', '.join(tech)
            link = proj.get('link') or proj.get('url', '')
            dates = proj.get('dates') or proj.get('duration', '')
            desc = proj.get('description', '')
            hdr = f'<b>{name}</b>'
            if dates:
                hdr += f'  <font size="8" color="{BODY_MUTED}">{dates}</font>'
            items.append(Paragraph(hdr, s['bold']))
            if tech:
                items.append(Paragraph(f'<i>{tech}</i>', s['small']))
            if link:
                items.append(Paragraph(link, s['small']))
            if desc:
                items.append(Paragraph(f'• {desc}', s['body']))
            for h in proj.get('highlights', []):
                items.append(Paragraph(f'• {h}', s['body']))
            items.append(Spacer(1, 5))

    return items


def render_pdf(buffer, user_data, tailored_data):
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=0, rightMargin=0,
        topMargin=0, bottomMargin=BODY_V_MARGIN,
    )
    s = _styles()
    story = []

    # Full-bleed navy header banner
    story.append(_build_header_table(user_data, s))

    # Body: two-column layout with inner margins applied via padding
    sidebar_kif = KeepInFrame(
        SIDEBAR_W - 14, KIF_H,
        _build_sidebar(user_data, tailored_data, s),
        mode='overflow',
    )
    main_kif = KeepInFrame(
        MAIN_W - 10, KIF_H,
        _build_main(user_data, tailored_data, s),
        mode='overflow',
    )

    body = Table([[sidebar_kif, main_kif]], colWidths=[SIDEBAR_W, MAIN_W])
    body.setStyle(TableStyle([
        ('VALIGN',        (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND',    (0, 0), (0,  -1), colors.HexColor(SIDEBAR_BG)),
        ('LEFTPADDING',   (0, 0), (0,  -1), BODY_H_MARGIN),
        ('RIGHTPADDING',  (0, 0), (0,  -1), 10),
        ('TOPPADDING',    (0, 0), (0,  -1), 12),
        ('BOTTOMPADDING', (0, 0), (0,  -1), 10),
        ('LEFTPADDING',   (1, 0), (1,  -1), 14),
        ('RIGHTPADDING',  (1, 0), (1,  -1), BODY_H_MARGIN),
        ('TOPPADDING',    (1, 0), (1,  -1), 12),
        ('BOTTOMPADDING', (1, 0), (1,  -1), 10),
    ]))
    story.append(body)
    doc.build(story)
