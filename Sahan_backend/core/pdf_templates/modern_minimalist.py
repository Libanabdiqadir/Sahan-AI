from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle,
)
from reportlab.platypus.flowables import KeepInFrame
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT

PAGE_W, PAGE_H = A4
H_MARGIN = 0.45 * inch
V_MARGIN = 0.50 * inch
CONTENT_W = PAGE_W - 2 * H_MARGIN
SIDEBAR_W = CONTENT_W * 0.30
MAIN_W = CONTENT_W * 0.70

# Realistic body height: page minus estimated header (~40 pts) minus both margins.
# mode='shrink' scales content that still overflows rather than spilling onto page 2.
HEADER_EST = 40
KIF_H = PAGE_H - HEADER_EST - 2 * V_MARGIN   # ≈ 729 pts

CHARCOAL = '#1f2937'
ACCENT = '#374151'
MUTED = '#6b7280'
LIGHT = '#9ca3af'
DIVIDER = '#e5e7eb'
SEPARATOR = '#d1d5db'
LINK_CLR = '#334155'


def _styles():
    return dict(
        name=ParagraphStyle(
            'mmName', fontName='Helvetica-Bold', fontSize=20,
            textColor=colors.HexColor(CHARCOAL), spaceAfter=3,
        ),
        contact_header=ParagraphStyle(
            'mmContactH', fontName='Helvetica', fontSize=8.5,
            textColor=colors.HexColor(MUTED), spaceAfter=2, leading=13,
        ),
        s_label=ParagraphStyle(
            'mmSLabel', fontName='Helvetica-Bold', fontSize=8,
            textColor=colors.HexColor(CHARCOAL), spaceBefore=10, spaceAfter=4,
            textTransform='uppercase', letterSpacing=1.0,
        ),
        s_item=ParagraphStyle(
            'mmSItem', fontName='Helvetica', fontSize=8.5,
            textColor=colors.HexColor(ACCENT), leading=12, spaceAfter=3,
        ),
        section=ParagraphStyle(
            'mmSection', fontName='Helvetica-Bold', fontSize=8.5,
            textColor=colors.HexColor(CHARCOAL), textTransform='uppercase',
            letterSpacing=1.2, spaceBefore=8, spaceAfter=2,
            keepWithNext=True,
        ),
        body=ParagraphStyle(
            'mmBody', fontName='Helvetica', fontSize=8.5,
            leading=12, spaceAfter=3, textColor=colors.HexColor(ACCENT),
        ),
        bold=ParagraphStyle(
            'mmBold', fontName='Helvetica-Bold', fontSize=8.5,
            spaceAfter=1, textColor=colors.HexColor(CHARCOAL),
            keepWithNext=True,
        ),
        small=ParagraphStyle(
            'mmSmall', fontName='Helvetica', fontSize=8,
            textColor=colors.HexColor(MUTED), spaceAfter=2,
        ),
    )


def _hr(color=DIVIDER, thickness=0.5):
    return HRFlowable(
        width='100%', thickness=thickness,
        color=colors.HexColor(color), spaceAfter=4,
    )


def _section(title, s):
    return [Paragraph(title, s['section']), _hr()]


def _build_sidebar(user_data, tailored_data, s):
    items = []

    # Contact items — LinkedIn rendered as a clickable link, not a raw URL
    if user_data.get('contact_email'):
        email = user_data['contact_email']
        items.append(Paragraph(
            f'<a href="mailto:{email}" color="{LINK_CLR}">{email}</a>',
            s['contact_header'],
        ))
    if user_data.get('phone_number'):
        items.append(Paragraph(user_data['phone_number'], s['contact_header']))
    if user_data.get('location'):
        items.append(Paragraph(user_data['location'], s['contact_header']))
    if user_data.get('linkedin_url'):
        linkedin_url = user_data['linkedin_url']
        items.append(Paragraph(
            f'<a href="{linkedin_url}" color="{LINK_CLR}">LinkedIn</a>',
            s['contact_header'],
        ))
    items.append(Spacer(1, 10))

    for heading, key in [
        ('Skills', 'tech_skills'),
        ('Soft Skills', 'soft_skills'),
        ('Languages', 'languages'),
    ]:
        entries = tailored_data.get(key) or []
        if entries:
            items.append(Paragraph(heading, s['s_label']))
            for entry in entries:
                items.append(Paragraph(f'• {entry}', s['s_item']))
            items.append(Spacer(1, 4))

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
            items.append(Spacer(1, 4))

    return items


def _build_main(tailored_data, s):
    items = []

    if tailored_data.get('summary'):
        items.extend(_section('Summary', s))
        items.append(Paragraph(tailored_data['summary'], s['body']))  # plain, not italic
        items.append(Spacer(1, 4))

    exp_list = tailored_data.get('experience') or []
    if exp_list:
        items.extend(_section('Experience', s))
        for exp in exp_list:
            items.append(Paragraph(f"<b>{exp.get('role', '')}</b>", s['bold']))
            items.append(Paragraph(
                f"{exp.get('company', '')}  ·  {exp.get('duration', '')}",
                s['small'],
            ))
            for r in exp.get('responsibilities', []):
                items.append(Paragraph(f'• {r}', s['body']))
            items.append(Spacer(1, 4))

    edu_list = tailored_data.get('education') or []
    if edu_list:
        items.extend(_section('Education', s))
        for edu in edu_list:
            items.append(Paragraph(f"<b>{edu.get('degree', '')}</b>", s['bold']))
            items.append(Paragraph(
                f"{edu.get('university', '')}  ·  {edu.get('graduation_year', '')}",
                s['small'],
            ))
            items.append(Spacer(1, 3))

    proj_list = tailored_data.get('projects') or []
    if proj_list:
        items.extend(_section('Projects', s))
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
                hdr += f'  <font size="8" color="{MUTED}">{dates}</font>'
            items.append(Paragraph(hdr, s['bold']))
            if tech:
                items.append(Paragraph(f'<i>{tech}</i>', s['small']))
            if link:
                items.append(Paragraph(
                    f'<a href="{link}" color="{LINK_CLR}">{link}</a>', s['small'],
                ))
            if desc:
                items.append(Paragraph(f'• {desc}', s['body']))
            for h in proj.get('highlights', []):
                items.append(Paragraph(f'• {h}', s['body']))
            items.append(Spacer(1, 4))

    return items


def render_pdf(buffer, user_data, tailored_data):
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=H_MARGIN, rightMargin=H_MARGIN,
        topMargin=V_MARGIN, bottomMargin=V_MARGIN,
    )
    s = _styles()
    story = []

    # Minimal header — name left-aligned, thin rule beneath
    story.append(Paragraph(user_data.get('full_name', ''), s['name']))
    story.append(_hr(color=CHARCOAL, thickness=1.0))

    sidebar_kif = KeepInFrame(
        SIDEBAR_W - 14, KIF_H,
        _build_sidebar(user_data, tailored_data, s),
        mode='shrink',                               # was 'overflow'
    )
    main_kif = KeepInFrame(
        MAIN_W - 10, KIF_H,
        _build_main(tailored_data, s),
        mode='shrink',                               # was 'overflow'
    )

    body = Table([[sidebar_kif, main_kif]], colWidths=[SIDEBAR_W, MAIN_W])
    body.setStyle(TableStyle([
        ('VALIGN',       (0, 0), (-1, -1), 'TOP'),
        ('LINEAFTER',    (0, 0), (0,  -1), 0.5, colors.HexColor(SEPARATOR)),
        ('LEFTPADDING',  (0, 0), (0,  -1), 0),
        ('RIGHTPADDING', (0, 0), (0,  -1), 12),
        ('TOPPADDING',   (0, 0), (0,  -1), 4),
        ('BOTTOMPADDING',(0, 0), (0,  -1), 4),
        ('LEFTPADDING',  (1, 0), (1,  -1), 14),
        ('RIGHTPADDING', (1, 0), (1,  -1), 0),
        ('TOPPADDING',   (1, 0), (1,  -1), 0),
        ('BOTTOMPADDING',(1, 0), (1,  -1), 0),
    ]))
    story.append(body)
    doc.build(story)
