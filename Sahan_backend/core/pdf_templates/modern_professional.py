from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle,
)
from reportlab.platypus.flowables import KeepInFrame
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT

PAGE_W, PAGE_H = A4
H_MARGIN = 0.45 * inch
V_MARGIN = 0.45 * inch
CONTENT_W = PAGE_W - 2 * H_MARGIN
SIDEBAR_W = CONTENT_W * 0.30
MAIN_W = CONTENT_W * 0.70

# Realistic body height: page minus estimated header (~50 pts) minus both margins.
# mode='shrink' scales content that still overflows rather than spilling onto page 2.
HEADER_EST = 50
KIF_H = PAGE_H - HEADER_EST - 2 * V_MARGIN   # ≈ 727 pts

NAVY = '#1e3a5f'
STEEL = '#2563eb'
SIDEBAR_BG = '#eef2f7'
MUTED = '#64748b'
DARK = '#1e293b'
DIVIDER = '#cbd5e1'


def _styles():
    return dict(
        name=ParagraphStyle(
            'mpName', fontName='Helvetica-Bold', fontSize=18,
            textColor=colors.HexColor(NAVY), spaceAfter=2,
        ),
        contact=ParagraphStyle(
            'mpContact', fontName='Helvetica', fontSize=8,
            textColor=colors.HexColor(MUTED), spaceAfter=3,
        ),
        s_label=ParagraphStyle(
            'mpSLabel', fontName='Helvetica-Bold', fontSize=8,
            textColor=colors.HexColor(NAVY), spaceBefore=10, spaceAfter=4,
            textTransform='uppercase', letterSpacing=0.8,
        ),
        s_item=ParagraphStyle(
            'mpSItem', fontName='Helvetica', fontSize=8.5,
            textColor=colors.HexColor(DARK), leading=12, spaceAfter=3,
        ),
        section=ParagraphStyle(
            'mpSection', fontName='Helvetica-Bold', fontSize=8,
            textColor=colors.HexColor(STEEL), textTransform='uppercase',
            letterSpacing=1.2, spaceBefore=8, spaceAfter=2,
            keepWithNext=True,
        ),
        body=ParagraphStyle(
            'mpBody', fontName='Helvetica', fontSize=8.5,
            leading=12, spaceAfter=3, textColor=colors.HexColor(DARK),
        ),
        bold=ParagraphStyle(
            'mpBold', fontName='Helvetica-Bold', fontSize=8.5,
            spaceAfter=1, textColor=colors.HexColor(DARK),
            keepWithNext=True,
        ),
        small=ParagraphStyle(
            'mpSmall', fontName='Helvetica', fontSize=8,
            textColor=colors.HexColor(MUTED), spaceAfter=2,
        ),
    )


def _hr():
    return HRFlowable(width='100%', thickness=0.5, color=colors.HexColor(DIVIDER), spaceAfter=4)


def _section(title, s):
    return [Paragraph(title, s['section']), _hr()]


def _build_sidebar(user_data, tailored_data, s):
    items = []

    # Contact items — LinkedIn rendered as a clickable link, not a raw URL
    if user_data.get('contact_email'):
        email = user_data['contact_email']
        items.append(Paragraph(f'<a href="mailto:{email}" color="{STEEL}">{email}</a>', s['contact']))
    if user_data.get('phone_number'):
        items.append(Paragraph(user_data['phone_number'], s['contact']))
    if user_data.get('location'):
        items.append(Paragraph(user_data['location'], s['contact']))
    if user_data.get('linkedin_url'):
        linkedin_url = user_data['linkedin_url']
        items.append(Paragraph(f'<a href="{linkedin_url}" color="{STEEL}">LinkedIn</a>', s['contact']))
    items.append(Spacer(1, 8))

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
        items.extend(_section('Professional Summary', s))
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
            items.append(Spacer(1, 4))

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
                items.append(Paragraph(tech, s['small']))
            if link:
                items.append(Paragraph(
                    f'<a href="{link}" color="{STEEL}">{link}</a>', s['small'],
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

    story.append(Paragraph(user_data.get('full_name', ''), s['name']))
    contact_parts = []
    if user_data.get('contact_email'):
        email = user_data['contact_email']
        contact_parts.append(f'<a href="mailto:{email}" color="{STEEL}">{email}</a>')
    if user_data.get('phone_number'):
        contact_parts.append(user_data['phone_number'])
    if user_data.get('location'):
        contact_parts.append(user_data['location'])
    if user_data.get('linkedin_url'):
        linkedin_url = user_data['linkedin_url']
        contact_parts.append(f'<a href="{linkedin_url}" color="{STEEL}">LinkedIn</a>')
    if contact_parts:
        story.append(Paragraph('  ·  '.join(contact_parts), s['contact']))
    story.append(HRFlowable(
        width='100%', thickness=1.5, color=colors.HexColor(STEEL), spaceAfter=8,
    ))

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
        ('VALIGN',        (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND',    (0, 0), (0,  -1), colors.HexColor(SIDEBAR_BG)),
        ('LEFTPADDING',   (0, 0), (0,  -1), 6),
        ('RIGHTPADDING',  (0, 0), (0,  -1), 8),
        ('TOPPADDING',    (0, 0), (0,  -1), 6),
        ('BOTTOMPADDING', (0, 0), (0,  -1), 6),
        ('LEFTPADDING',   (1, 0), (1,  -1), 10),
        ('RIGHTPADDING',  (1, 0), (1,  -1), 0),
        ('TOPPADDING',    (1, 0), (1,  -1), 0),
        ('BOTTOMPADDING', (1, 0), (1,  -1), 0),
    ]))
    story.append(body)
    doc.build(story)
