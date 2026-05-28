from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .services import ResumeService
from .models import UserProfile, ResumeHistory, Document
from .serializer import (
  UserSerializer,
  DocumentSerializer,
  UserProfileSerializer,
  ResumeHistorySerializer,
)
from rest_framework.authtoken.models import Token
from rest_framework import status

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import HRFlowable, SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from django.http import HttpResponse
import json


User = get_user_model()

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['GET', 'PATCH'])
    def me(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
    
        if request.method == 'PATCH':
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)


class ResumeHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ResumeHistory.objects.filter(user=self.request.user)

    @action(detail=False, methods=['POST'])
    @authentication_classes([TokenAuthentication])
    def tailor(self, request):
        job_description = request.data.get('job_description')

        if not job_description:
            return Response({'error': 'Job description is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        resume = ResumeService.tailor_resume(request.user, job_description)
        serializer = self.get_serializer(resume)
        return Response(serializer.data)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_profile_picture(request):
    user = request.user
    if 'profile_picture' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)
    
    user.profile_picture = request.FILES['profile_picture']
    user.save()

    pic_url = request.build_absolute_uri(user.profile_picture.url)

    try:
        profile = user.profile
        master = profile.master_data or {}
        master['profile_picture_url'] = pic_url
        profile.master_data = master
        profile.save()
    except Exception :
        pass
    
    return Response({'profile_picture': pic_url})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_cv_pdf(request):
    data = request.data
    profile = data.get('profile', {})
    tailored = data.get('tailored', {})
    job_title = data.get('job_title', '')
    company_name = data.get('company_name', '')

    response = HttpResponse(content_type='application/pdf')
    filename = f"{profile.get('full_name', 'CV').replace(' ', '_')}_Harvard_CV.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Access-Control-Expose-Headers'] = 'Content-Disposition'

    doc = SimpleDocTemplate(
        response,
        pagesize=A4,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
    )

    styles = getSampleStyleSheet()

    name_style = ParagraphStyle('Name', fontName='Times-Bold', fontSize=16,
                                 alignment=TA_CENTER, textTransform='uppercase',
                                 letterSpacing=2, spaceAfter=3)
    contact_style = ParagraphStyle('Contact', fontName='Times-Roman', fontSize=9,
                                    alignment=TA_CENTER, textColor=colors.HexColor('#4b5563'),
                                    spaceAfter=6)
    section_style = ParagraphStyle('Section', fontName='Times-Bold', fontSize=9,
                                    textTransform='uppercase', letterSpacing=1.5,
                                    spaceBefore=6, spaceAfter=3)
    body_style = ParagraphStyle('Body', fontName='Times-Roman', fontSize=9.5,
                                 leading=14, spaceAfter=3)
    italic_style = ParagraphStyle('Italic', fontName='Times-Italic', fontSize=9.5,
                                   leading=14, textColor=colors.HexColor('#374151'),
                                   spaceAfter=4)
    bold_style = ParagraphStyle('Bold', fontName='Times-Bold', fontSize=9.5, spaceAfter=1)
    small_style = ParagraphStyle('Small', fontName='Times-Roman', fontSize=8.5,
                                  textColor=colors.HexColor('#6b7280'))

    story = []

    # Header
    full_name = profile.get('full_name', '')
    story.append(Paragraph(full_name, name_style))

    contact_parts = [x for x in [
        profile.get('contact_email'),
        profile.get('phone_number'),
        profile.get('location'),
        profile.get('linkedin_url'),
    ] if x]
    story.append(Paragraph('  ·  '.join(contact_parts), contact_style))
    story.append(HRFlowable(width='100%', thickness=1.2, color=colors.HexColor('#1a1a2e'), spaceAfter=8))

    # Summary
    if tailored.get('summary'):
        story.append(Paragraph('PROFESSIONAL SUMMARY', section_style))
        story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#d1d5db'), spaceAfter=4))
        story.append(Paragraph(tailored['summary'], italic_style))
        story.append(Spacer(1, 4))

    # Experience
    if tailored.get('experience'):
        story.append(Paragraph('PROFESSIONAL EXPERIENCE', section_style))
        story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#d1d5db'), spaceAfter=4))
        for exp in tailored['experience']:
            # Role + Date on same line
            role_date = f"<b>{exp.get('role', '')}</b>"
            story.append(Paragraph(role_date, bold_style))
            story.append(Paragraph(f"<i>{exp.get('company', '')}</i>   {exp.get('duration', '')}", small_style))
            for r in exp.get('responsibilities', []):
                story.append(Paragraph(f"• {r}", body_style))
            story.append(Spacer(1, 3))

    # Education
    if tailored.get('education'):
        story.append(Paragraph('EDUCATION', section_style))
        story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#d1d5db'), spaceAfter=4))
        for edu in tailored['education']:
            story.append(Paragraph(f"<b>{edu.get('degree', '')}</b>   {edu.get('graduation_year', '')}", bold_style))
            story.append(Paragraph(f"<i>{edu.get('university', '')}</i>", small_style))
            story.append(Spacer(1, 3))

    # Skills
    story.append(Paragraph('SKILLS & LANGUAGES', section_style))
    story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#d1d5db'), spaceAfter=4))
    if tailored.get('tech_skills'):
        story.append(Paragraph(f"<b>Technical:</b> {', '.join(tailored['tech_skills'])}", body_style))
    if tailored.get('soft_skills'):
        story.append(Paragraph(f"<b>Soft Skills:</b> {', '.join(tailored['soft_skills'])}", body_style))
    if tailored.get('languages'):
        story.append(Paragraph(f"<b>Languages:</b> {', '.join(tailored['languages'])}", body_style))

    doc.build(story)
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_cover_letter_pdf(request):
    data = request.data
    profile = data.get('profile', {})
    tailored = data.get('tailored', {})
    job_title = data.get('job_title', '')
    company_name = data.get('company_name', '')

    response = HttpResponse(content_type='application/pdf')
    filename = f"{profile.get('full_name', 'CoverLetter').replace(' ', '_')}_Cover_Letter.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Access-Control-Expose-Headers'] = 'Content-Disposition'

    doc = SimpleDocTemplate(
        response,
        pagesize=A4,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
    )

    styles = getSampleStyleSheet()
    name_style = ParagraphStyle('Name', fontName='Times-Bold', fontSize=16,
                                 alignment=TA_CENTER, spaceAfter=3)
    contact_style = ParagraphStyle('Contact', fontName='Times-Roman', fontSize=9,
                                    alignment=TA_CENTER, textColor=colors.HexColor('#4b5563'),
                                    spaceAfter=6)
    body_style = ParagraphStyle('Body', fontName='Times-Roman', fontSize=10.5,
                                 leading=16, spaceAfter=10)
    bold_style = ParagraphStyle('Bold', fontName='Times-Bold', fontSize=10.5, spaceAfter=4)

    story = []

    # Header
    full_name = profile.get('full_name', '')
    story.append(Paragraph(full_name.upper(), name_style))
    contact_parts = [x for x in [
        profile.get('contact_email'),
        profile.get('phone_number'),
        profile.get('location'),
        profile.get('linkedin_url'),
    ] if x]
    story.append(Paragraph('  ·  '.join(contact_parts), contact_style))
    story.append(HRFlowable(width='100%', thickness=1.2, color=colors.HexColor('#1a1a2e'), spaceAfter=16))

    # Date
    from datetime import date
    story.append(Paragraph(date.today().strftime('%B %d, %Y'), body_style))

    # Recipient
    story.append(Paragraph('<b>Hiring Manager</b>', bold_style))
    story.append(Paragraph(company_name, body_style))

    # Subject
    story.append(Paragraph(f'<b>Re: Application for {job_title}</b>', bold_style))
    story.append(Spacer(1, 6))

    # Body
    cover_letter = tailored.get('cover_letter', '')
    for para in cover_letter.split('\n\n'):
        if para.strip():
            story.append(Paragraph(para.strip(), body_style))

    # Sign off
    story.append(Spacer(1, 20))
    story.append(Paragraph('Sincerely,', body_style))
    story.append(Spacer(1, 24))
    story.append(Paragraph(f'<b>{full_name}</b>', bold_style))
    if profile.get('contact_email'):
        story.append(Paragraph(profile['contact_email'], body_style))
    if profile.get('phone_number'):
        story.append(Paragraph(profile['phone_number'], body_style))

    doc.build(story)
    return response