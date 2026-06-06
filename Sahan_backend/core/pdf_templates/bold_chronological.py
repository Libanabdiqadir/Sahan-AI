from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

PAGE_W, PAGE_H = A4
H_MARGIN = 0.75 * inch
V_MARGIN = 0.45 * inch          # was 0.60 — recovers ~22 pts of vertical canvas
CONTENT_W = PAGE_W - 2 * H_MARGIN

BLACK = '#0a0a0a'
DARK = '#1a1a1a'
MUTED = '#4b5563'
LIGHT = '#6b7280'
RULE = '#000000'
ACHIEVEMENT_BG = '#f9fafb'
ACHIEVEMENT_BORDER = '#e5e7eb'


def _styles():
    return dict(
        name=ParagraphStyle(
            'bcName', fontName='Times-Bold', fontSize=22,
            textColor=colors.HexColor(BLACK), alignment=TA_CENTER,
            textTransform='uppercase', letterSpacing=3, spaceAfter=3,  # was 4
        ),
        contact=ParagraphStyle(
            'bcContact', fontName='Times-Roman', fontSize=9,
            textColor=colors.HexColor(MUTED), alignment=TA_CENTER,
            spaceAfter=1,                                               # was 2
        ),
        section=ParagraphStyle(
            'bcSection', fontName='Times-Bold', fontSize=10,
            textColor=colors.HexColor(BLACK), alignment=TA_CENTER,
            textTransform='uppercase', letterSpacing=2,
            spaceBefore=8, spaceAfter=1,                               # was 10/2
            keepWithNext=True,
        ),
        body=ParagraphStyle(
            'bcBody', fontName='Times-Roman', fontSize=9,
            leading=12, spaceAfter=2, textColor=colors.HexColor(DARK),
        ),
        bold=ParagraphStyle(
            'bcBold', fontName='Times-Bold', fontSize=9,
            spaceAfter=1, textColor=colors.HexColor(DARK),
            keepWithNext=True,
        ),
        small=ParagraphStyle(
            'bcSmall', fontName='Times-Roman', fontSize=8.5,
            textColor=colors.HexColor(LIGHT), spaceAfter=1,            # was 2
        ),
        italic=ParagraphStyle(
            'bcItalic', fontName='Times-Italic', fontSize=9.5,
            leading=13, textColor=colors.HexColor(MUTED), spaceAfter=2, # was leading=14, spaceAfter=4
        ),
        achieve_title=ParagraphStyle(
            'bcAchTitle', fontName='Times-Bold', fontSize=9,
            textColor=colors.HexColor(DARK), spaceAfter=1,             # was 2
        ),
        achieve_body=ParagraphStyle(
            'bcAchBody', fontName='Times-Roman', fontSize=8.5,
            leading=11, textColor=colors.HexColor(MUTED),              # was leading=12
        ),
    )


def _thick_rule():
    return HRFlowable(
        width='100%', thickness=1.0,
        color=colors.HexColor(RULE), spaceAfter=4,                     # was 6
    )


def _thin_rule():
    return HRFlowable(
        width='100%', thickness=0.5,
        color=colors.HexColor('#d1d5db'), spaceAfter=3,                # was 4
    )


def _section_block(title, s):
    return [Paragraph(title, s['section']), _thick_rule()]


def _achievements_grid(achievements, s, cols=2):
    """Render key_achievements list as an evenly spaced grid."""
    if not achievements:
        return []
    cell_w = (CONTENT_W - (cols - 1) * 6) / cols
    rows = []
    row = []
    for i, item in enumerate(achievements):
        if isinstance(item, str):
            title, desc = item, ''
        else:
            title = item.get('title') or item.get('name', '')
            desc = item.get('description') or item.get('value', '')

        cell_content = [Paragraph(title, s['achieve_title'])]
        if desc:
            cell_content.append(Paragraph(desc, s['achieve_body']))
        row.append(cell_content)
        if len(row) == cols:
            rows.append(row)
            row = []
    if row:
        while len(row) < cols:
            row.append([Paragraph('', s['achieve_body'])])
        rows.append(row)

    grid = Table(rows, colWidths=[cell_w] * cols)
    grid.setStyle(TableStyle([
        ('VALIGN',        (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND',    (0, 0), (-1, -1), colors.HexColor(ACHIEVEMENT_BG)),
        ('BOX',           (0, 0), (-1, -1), 0.5, colors.HexColor(ACHIEVEMENT_BORDER)),
        ('INNERGRID',     (0, 0), (-1, -1), 0.5, colors.HexColor(ACHIEVEMENT_BORDER)),
        ('LEFTPADDING',   (0, 0), (-1, -1), 8),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 8),
        ('TOPPADDING',    (0, 0), (-1, -1), 4),                        # was 6
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),                        # was 6
    ]))
    return [grid, Spacer(1, 3)]                                        # was Spacer(1, 6)


def render_pdf(buffer, user_data, tailored_data):
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=H_MARGIN, rightMargin=H_MARGIN,
        topMargin=V_MARGIN, bottomMargin=V_MARGIN,
    )
    s = _styles()
    story = []

    # ── Centered Header ───────────────────────────────────────────────────────
    story.append(Paragraph(user_data.get('full_name', ''), s['name']))

    contact_parts = []
    if user_data.get('contact_email'):
        email = user_data['contact_email']
        contact_parts.append(f'<a href="mailto:{email}" color="#2563eb">{email}</a>')
    if user_data.get('phone_number'):
        contact_parts.append(user_data['phone_number'])
    if user_data.get('location'):
        contact_parts.append(user_data['location'])
    if user_data.get('linkedin_url'):
        linkedin_url = user_data['linkedin_url']
        contact_parts.append(f'<a href="{linkedin_url}" color="#2563eb">LinkedIn</a>')
    story.append(Paragraph('  ·  '.join(contact_parts), s['contact']))
    story.append(_thick_rule())

    # ── Professional Summary ──────────────────────────────────────────────────
    if tailored_data.get('summary'):
        story.extend(_section_block('Professional Summary', s))
        story.append(Paragraph(tailored_data['summary'], s['body']))
        story.append(Spacer(1, 3))                                     # was 6

    # ── Key Achievements (2-column grid) ─────────────────────────────────────
    achievements = tailored_data.get('key_achievements') or []
    if achievements:
        story.extend(_section_block('Key Achievements', s))
        story.extend(_achievements_grid(achievements, s, cols=2))

    # ── Professional Experience ───────────────────────────────────────────────
    exp_list = tailored_data.get('experience') or []
    if exp_list:
        story.extend(_section_block('Professional Experience', s))
        for exp in exp_list:
            role = exp.get('role', '')
            company = exp.get('company', '')
            duration = exp.get('duration', '')
            header_row = Table(
                [[Paragraph(f'<b>{role}</b>', s['bold']),
                  Paragraph(duration, s['small'])]],
                colWidths=[CONTENT_W * 0.72, CONTENT_W * 0.28],
            )
            header_row.setStyle(TableStyle([
                ('VALIGN',        (0, 0), (-1, -1), 'BOTTOM'),
                ('ALIGN',         (1, 0), (1,  -1), 'RIGHT'),
                ('LEFTPADDING',   (0, 0), (-1, -1), 0),
                ('RIGHTPADDING',  (0, 0), (-1, -1), 0),
                ('TOPPADDING',    (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
            header_row.keepWithNext = 1
            story.append(header_row)
            story.append(Paragraph(f'<i>{company}</i>', s['small']))
            for r in exp.get('responsibilities', []):
                story.append(Paragraph(f'• {r}', s['body']))
            story.append(Spacer(1, 3))                                 # was 5

    # ── Education ─────────────────────────────────────────────────────────────
    edu_list = tailored_data.get('education') or []
    if edu_list:
        story.extend(_section_block('Education', s))
        for edu in edu_list:
            story.append(Paragraph(
                f"<b>{edu.get('degree', '')}</b>  —  {edu.get('university', '')}",
                s['bold'],
            ))
            story.append(Paragraph(edu.get('graduation_year', ''), s['small']))
            story.append(Spacer(1, 2))                                 # was 4

    # ── Projects ──────────────────────────────────────────────────────────────
    proj_list = tailored_data.get('projects') or []
    if proj_list:
        story.extend(_section_block('Projects', s))
        for proj in proj_list:
            name = proj.get('name', '')
            tech = proj.get('tech_stack') or proj.get('technologies', '')
            if isinstance(tech, list):
                tech = ', '.join(tech)
            link = proj.get('link') or proj.get('url', '')
            dates = proj.get('dates') or proj.get('duration', '')
            desc = proj.get('description', '')

            hdr_left = f'<b>{name}</b>'
            if tech:
                hdr_left += f'  <font size="8" color="{LIGHT}">{tech}</font>'

            header_row = Table(
                [[Paragraph(hdr_left, s['bold']),
                  Paragraph(dates, s['small'])]],
                colWidths=[CONTENT_W * 0.72, CONTENT_W * 0.28],
            )
            header_row.setStyle(TableStyle([
                ('VALIGN',        (0, 0), (-1, -1), 'BOTTOM'),
                ('ALIGN',         (1, 0), (1,  -1), 'RIGHT'),
                ('LEFTPADDING',   (0, 0), (-1, -1), 0),
                ('RIGHTPADDING',  (0, 0), (-1, -1), 0),
                ('TOPPADDING',    (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
            header_row.keepWithNext = 1
            story.append(header_row)
            if link:
                story.append(Paragraph(
                    f'<a href="{link}" color="#2563eb">{link}</a>', s['small'],
                ))
            if desc:
                story.append(Paragraph(f'• {desc}', s['body']))
            for h in proj.get('highlights', []):
                story.append(Paragraph(f'• {h}', s['body']))
            story.append(Spacer(1, 3))                                 # was 5

    # ── Certifications ────────────────────────────────────────────────────────
    certs = tailored_data.get('certifications') or []
    if certs:
        story.extend(_section_block('Certifications', s))
        for cert in certs:
            name = cert.get('name', '')
            issuer = cert.get('issuer') or cert.get('organization', '')
            date = cert.get('year') or cert.get('issue_date') or cert.get('date', '')
            line = f'<b>{name}</b>'
            if issuer:
                line += f'  —  <i>{issuer}</i>'
            if date:
                line += f'  ·  {date}'
            story.append(Paragraph(line, s['bold']))
            story.append(Spacer(1, 2))                                 # was 3

    # ── Skills ────────────────────────────────────────────────────────────────
    has_skills = any(tailored_data.get(k) for k in ('tech_skills', 'soft_skills', 'languages'))
    if has_skills:
        story.extend(_section_block('Skills & Languages', s))
        if tailored_data.get('tech_skills'):
            story.append(Paragraph(
                f"<b>Technical:</b>  {', '.join(tailored_data['tech_skills'])}", s['body'],
            ))
        if tailored_data.get('soft_skills'):
            story.append(Paragraph(
                f"<b>Soft Skills:</b>  {', '.join(tailored_data['soft_skills'])}", s['body'],
            ))
        if tailored_data.get('languages'):
            story.append(Paragraph(
                f"<b>Languages:</b>  {', '.join(tailored_data['languages'])}", s['body'],
            ))

    doc.build(story)
