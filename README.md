# Sahan AI is an Intelligent Full-Stack Resume & Cover Letter Tailor

Sahan AI is a modern SaaS platform designed to automate and optimize the job application process. Instead of manually editing resumes for every different job posting, Sahan AI dynamically cross-references a user's stored professional profile with specific job descriptions to instantly generate targeted, high-impact resumes and cover letters using generative AI.

## 🚀 The Problem & Solution

**The Problem:** Generic resumes get filtered out by Applicant Tracking Systems (ATS). Manually tailoring professional experience, skills, and summaries for every job application is exhausting, time-consuming, and prone to formatting errors.
**The Solution:** Sahan AI acts as a personal AI career assistant. Users input their primary professional details once. When a job is found, they simply provide the target title, company, and job description. Sahan AI seamlessly merges their actual history with the employer's exact needs, producing optimal application documents instantly.

---

## 🛠️ Tech Stack

### Frontend
* **React.js** (TypeScript) - Highly modular, dynamic interactive UI component layers.
* **Vite** - High-speed frontend building and asset bundling.
* **Tailwind CSS** - Fluid, responsive layout design.

### Backend
* **Django & Django REST Framework (DRF)** - Secure, structured RESTful API engine handling user data pipelines.
* **Djoser & Simple JWT** - Token-based authentication, user account security, and validation protocols.
* **Google Gemini API** (`google-genai`) - Contextual intelligence engine mapping profile data to job requirements.

### Database
* **PostgreSQL** - Relational data architecture mapping multi-table user profiles, work experiences, skills, and generation history records.

---

## ✨ Core Features

* **Unified Profile Engine:** Store work histories, educational backgrounds, hard/soft skill portfolios, and project links in a centralized database schema.
* **3-Field Tailoring Form:** Provide only the **Job Title**, **Company Name**, and **Job Description** to trigger an optimization matrix.
* **Context-Aware AI Generation:** Leverages the Gemini API to analyze target descriptions, isolate vital keywords, and rewrite profile sections to showcase maximum relevance without fabricating experiences.
* **Double Document Outputs:** Generates both an optimized structured resume format and a highly compelling, personalized cover letter concurrently.
* **Historical Generation Tracking:** Review, modify, or download previously tailored assets from a history dashboard tracking metrics by company name.

---

## 🗂️ Project Structure

```text
RESUME_GENERATOR/
├── Sahan_backend/       # Django API, PostgreSQL Schemas, Gemini Core Engine
├── Sahan_frontend/      # React client app, State Management, Interface Views
└── .gitignore           # Global environment and local asset shield
