from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import HRFlowable, SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER


_DARK = '#1a1a2e'
_DIVIDER = '#d1d5db'
_MUTED = '#6b7280'
_BODY_DARK = '#374151'
_ACCENT = '#4b5563'


def _build_styles():
    return {
        'name': ParagraphStyle(
            'Name', fontName='Times-Bold', fontSize=16,
            alignment=TA_CENTER, textTransform='uppercase',
            letterSpacing=2, spaceAfter=2,                # was 3
        ),
        'contact': ParagraphStyle(
            'Contact', fontName='Times-Roman', fontSize=9,
            alignment=TA_CENTER, textColor=colors.HexColor(_ACCENT),
            spaceAfter=2,                                  # was 6
        ),
        'section': ParagraphStyle(
            'Section', fontName='Times-Bold', fontSize=9,
            textTransform='uppercase', letterSpacing=1.5,
            spaceBefore=2, spaceAfter=1,
            keepWithNext=True,
        ),
        'body': ParagraphStyle(
            'Body', fontName='Times-Roman', fontSize=9,
            leading=12, spaceAfter=2,
        ),
        'italic': ParagraphStyle(
            'Italic', fontName='Times-Italic', fontSize=9,
            leading=12, textColor=colors.HexColor(_BODY_DARK), spaceAfter=2,
        ),
        'bold': ParagraphStyle(
            'Bold', fontName='Times-Bold', fontSize=9,
            spaceAfter=1, keepWithNext=True,
        ),
        'small': ParagraphStyle(
            'Small', fontName='Times-Roman', fontSize=8.5,
            textColor=colors.HexColor(_MUTED), spaceAfter=1,  # added spaceAfter
        ),
    }


def _divider(thin=True):
    thickness = 0.5 if thin else 1.2
    color = colors.HexColor(_DIVIDER if thin else _DARK)
    return HRFlowable(
        width='100%', thickness=thickness, color=color,
        spaceAfter=3 if thin else 5,                      # was 4 / 8
    )


def _section_header(title, s):
    return [
        Paragraph(title, s['section']),
        _divider(thin=True),
    ]


def render_pdf(buffer, user_data, tailored_data):
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.45 * inch,
        leftMargin=0.45 * inch,
        topMargin=0.33 * inch,
        bottomMargin=0.33 * inch,
    )
    s = _build_styles()
    story = []

    # ── Header ────────────────────────────────────────────────────────────────
    full_name = user_data.get('full_name', '')
    story.append(Paragraph(full_name, s['name']))

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
    story.append(_divider(thin=False))

    # ── Professional Summary ───────────────────────────────────────────────────
    if tailored_data.get('summary'):
        story.extend(_section_header('Professional Summary', s))
        story.append(Paragraph(tailored_data['summary'], s['body']))
        story.append(Spacer(1, 2))                        # was 4

    # ── Experience ────────────────────────────────────────────────────────────
    if tailored_data.get('experience'):
        story.extend(_section_header('Professional Experience', s))
        for exp in tailored_data['experience']:
            story.append(Paragraph(f"<b>{exp.get('role', '')}</b>", s['bold']))
            story.append(Paragraph(
                f"<i>{exp.get('company', '')}</i>&nbsp;&nbsp;&nbsp;{exp.get('duration', '')}",
                s['small'],
            ))
            for responsibility in exp.get('responsibilities', []):
                story.append(Paragraph(f'• {responsibility}', s['body']))
            story.append(Spacer(1, 2))                    # was 3

    # ── Education ─────────────────────────────────────────────────────────────
    if tailored_data.get('education'):
        story.extend(_section_header('Education', s))
        for edu in tailored_data['education']:
            story.append(Paragraph(
                f"<b>{edu.get('degree', '')}</b>&nbsp;&nbsp;&nbsp;{edu.get('graduation_year', '')}",
                s['bold'],
            ))
            story.append(Paragraph(f"<i>{edu.get('university', '')}</i>", s['small']))
            story.append(Spacer(1, 2))                    # was 3

    # ── Projects ──────────────────────────────────────────────────────────────
    projects = tailored_data.get('projects') or []
    if projects:
        story.extend(_section_header('Projects', s))
        for proj in projects:
            name = proj.get('name', '')
            tech = proj.get('tech_stack') or proj.get('technologies', '')
            if isinstance(tech, list):
                tech = ', '.join(tech)
            link = proj.get('link') or proj.get('url', '')
            description = proj.get('description', '')

            header = f'<b>{name}</b>'
            if tech:
                header += f"  <font size='8' color='{_MUTED}'>{tech}</font>"
            story.append(Paragraph(header, s['bold']))

            if link:
                story.append(Paragraph(
                    f'<a href="{link}" color="#2563eb">{link}</a>', s['small'],
                ))
            if description:
                story.append(Paragraph(f'• {description}', s['body']))
            for highlight in proj.get('highlights', []):
                story.append(Paragraph(f'• {highlight}', s['body']))
            story.append(Spacer(1, 2))                    # was 3

    # ── Certifications ────────────────────────────────────────────────────────
    certifications = tailored_data.get('certifications') or []
    if certifications:
        story.extend(_section_header('Certifications', s))
        for cert in certifications:
            name = cert.get('name', '')
            issuer = cert.get('issuer') or cert.get('organization', '')
            year = cert.get('year') or cert.get('date', '')

            line = f'<b>{name}</b>'
            if issuer:
                line += f'  —  <i>{issuer}</i>'
            if year:
                line += f'&nbsp;&nbsp;&nbsp;{year}'
            story.append(Paragraph(line, s['bold']))
            story.append(Spacer(1, 1))                    # was 2

    # ── Skills & Languages ────────────────────────────────────────────────────
    story.extend(_section_header('Skills & Languages', s))
    if tailored_data.get('tech_skills'):
        story.append(Paragraph(
            f"<b>Technical:</b> {', '.join(tailored_data['tech_skills'])}", s['body'],
        ))
    if tailored_data.get('soft_skills'):
        story.append(Paragraph(
            f"<b>Soft Skills:</b> {', '.join(tailored_data['soft_skills'])}", s['body'],
        ))
    if tailored_data.get('languages'):
        story.append(Paragraph(
            f"<b>Languages:</b> {', '.join(tailored_data['languages'])}", s['body'],
        ))

    doc.build(story)
