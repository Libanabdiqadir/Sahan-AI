import json
import google.generativeai as genai
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from .models import ResumeHistory, Document, UserProfile

genai.configure(api_key=settings.GEMINI_API_KEY)


class ResumeService:
    @staticmethod
    def tailor_resume(user, job_description):
        model = genai.GenerativeModel(
            model_name='models/gemini-2.5-flash'
            )
        
        try:
            profile = UserProfile.objects.get(user=user)

            subscription = getattr(user, 'subscriptions', None)
            if subscription:
                if subscription.plan.lower() == 'free' and subscription.resume_this_month >= 2:
                    return {
                        "error": "Limit reached. Please upgrade to Pro for unlimited tailoring!",
                        "status": "limit_reached"
                    }
                
            master_data = profile.get_master_data()
            
            prompt = f"""
                You are an expert resume writer. Using the Master Data provided, create a tailored resume 
                for the following Job Description.

                Master Data: {master_data}
                Job Description: {job_description}

                Output MUST be a JSON object with these EXACT keys:
                1. 'summary': A professional summary tailored to the job.
                2. 'tech_skills': A list of relevant technical and hard skills (e.g., Python, React, SQL).
                3. 'soft_skills': A list of relevant soft skills (e.g., Leadership, Communication, Problem Solving).
                4. 'experience': A list of objects. Each object MUST have:
                - 'role', 'company', 'duration'
                - 'responsibilities': A list of 3-4 bullet points showing achievements relevant to the job.
                5. 'education': A list of objects. Each object MUST have:
                - 'degree', 'university', 'graduation_year'
                6. 'languages': A list of languages the candidate speaks.
                7. 'cover_letter': A full, professional tailored cover letter.
            """
            response = model.generate_content(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                }
            )
            
            cleaned_text = response.text.strip().removeprefix('```json').removesuffix('```')
            data = json.loads(cleaned_text)

            if subscription:
                subscription.resume_this_month += 1
                subscription.save()
        
            return ResumeHistory.objects.create(
                user=user,
                job_description=job_description,
                tailored_data=data,
                status='completed'
            )

        except ObjectDoesNotExist:
            return ResumeHistory.objects.create(
                user=user,
                job_description=job_description,
                status='failed',
                tailored_data={"error": "UserProfile missing. Please update your profile in settings."}
            )
        except Exception as e:
            return ResumeHistory.objects.create(
                user=user,
                job_description=job_description,
                status='failed',    
                tailored_data={"error": str(e)}
            )

    @staticmethod
    def generate_resume_pdf(resume_history_id, template_name='modern_minimalist'):
        try:
            resume = ResumeHistory.objects.get(id=resume_history_id)
            return Document.objects.create(
                resume_history=resume,
                template_name=template_name
            )
        except ResumeHistory.DoesNotExist:
            return None