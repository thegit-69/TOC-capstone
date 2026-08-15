import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import engine, get_db
from extractor import extract_text_from_pdf
from parser_engine import parse_resume_text
from db_operations import save_profile_to_db
from email_service import send_status_email
import hashlib

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Pydantic schemas for responses
from pydantic import BaseModel

class LoginSchema(BaseModel):
    username: str
    password: str

class EducationSchema(BaseModel):
    id: uuid.UUID
    degree: Optional[str]
    institution: Optional[str]
    graduation_year: Optional[str]
    class Config:
        from_attributes = True

class ExperienceSchema(BaseModel):
    id: uuid.UUID
    job_title: Optional[str]
    company: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    description: Optional[str]
    class Config:
        from_attributes = True

class SkillSchema(BaseModel):
    id: uuid.UUID
    skill_name: Optional[str]
    category: Optional[str]
    class Config:
        from_attributes = True

class CandidateBaseSchema(BaseModel):
    id: uuid.UUID
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    status: Optional[str] = "pending"
    class Config:
        from_attributes = True

class CandidateDetailSchema(CandidateBaseSchema):
    education: List[EducationSchema] = []
    experience: List[ExperienceSchema] = []
    skills: List[SkillSchema] = []

class CandidateStatusUpdateSchema(BaseModel):
    status: str
    missing_skills: Optional[List[str]] = []

class JobCreateSchema(BaseModel):
    title: str
    description: Optional[str] = None
    experience_years: Optional[str] = None
    education_level: Optional[str] = None
    department: Optional[str] = None
    skills: List[str]

class JobSchema(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    experience_years: Optional[str]
    education_level: Optional[str]
    department: Optional[str]
    skills: List[str] = []
    created_at: datetime
    class Config:
        from_attributes = True

class ScreenResultSchema(BaseModel):
    candidate: CandidateBaseSchema
    score: int
    matched_skills: List[str]
    missing_skills: List[str]
    experience: str
    education: str
    reason: str

app = FastAPI(title="CFG Resume Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=engine)
    db = next(get_db())
    admin_exists = db.query(models.Account).filter(models.Account.username == "admin").first()
    if not admin_exists:
        admin_acc = models.Account(
            username="admin",
            password_hash=get_password_hash("admin")
        )
        db.add(admin_acc)
        db.commit()

@app.post("/login")
def login(creds: LoginSchema, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.username == creds.username).first()
    if not account or account.password_hash != get_password_hash(creds.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"success": True, "username": account.username}

from db_operations import save_profile_to_db, create_job, get_jobs, get_job_by_id

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Save file temporarily
    temp_file_path = f"temp_{uuid.uuid4()}.pdf"
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. Extract
        raw_text = extract_text_from_pdf(temp_file_path)
        if not raw_text.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from PDF")
             
        # 2. Parse
        profile = parse_resume_text(raw_text)
        
        # 3. Save
        candidate_id = save_profile_to_db(profile)
        
        return {
            "message": "Resume successfully parsed and saved",
            "candidate_id": str(candidate_id),
            "parsed_profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/candidates", response_model=List[CandidateBaseSchema])
def get_candidates(db: Session = Depends(get_db)):
    candidates = db.query(models.Candidate).all()
    return candidates

@app.get("/candidates/{candidate_id}", response_model=CandidateDetailSchema)
def get_candidate(candidate_id: uuid.UUID, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@app.patch("/candidates/{candidate_id}/status")
def update_candidate_status(candidate_id: uuid.UUID, status_update: CandidateStatusUpdateSchema, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if status_update.status not in ["pending", "accept", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    candidate.status = status_update.status
    db.commit()

    # Queue the email
    if candidate.status in ["accept", "reject"] and candidate.email:
        background_tasks.add_task(
            send_status_email,
            to_email=candidate.email,
            candidate_name=candidate.name or "Candidate",
            status=candidate.status,
            missing_skills=status_update.missing_skills
        )

    return {"message": f"Status updated to {candidate.status}"}

@app.delete("/candidates/{candidate_id}")
def delete_candidate(candidate_id: uuid.UUID, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted successfully"}

@app.post("/jobs", response_model=JobSchema)
def add_job(job_in: JobCreateSchema, db: Session = Depends(get_db)):
    job = create_job(
        db=db,
        title=job_in.title,
        description=job_in.description,
        experience_years=job_in.experience_years,
        education_level=job_in.education_level,
        department=job_in.department,
        skills=job_in.skills
    )
    job_dict = {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "experience_years": job.experience_years,
        "education_level": job.education_level,
        "department": job.department,
        "created_at": job.created_at,
        "skills": [s.skill_name for s in job.skills]
    }
    return job_dict

@app.get("/jobs", response_model=List[JobSchema])
def list_jobs(db: Session = Depends(get_db)):
    db_jobs = get_jobs(db)
    result = []
    for job in db_jobs:
        result.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "experience_years": job.experience_years,
            "education_level": job.education_level,
            "department": job.department,
            "created_at": job.created_at,
            "skills": [s.skill_name for s in job.skills if s.skill_name]
        })
    return result

def compute_education_score(candidate_edu, job_edu):
    if not job_edu:
        return 1.0
    job_edu = job_edu.lower()
    
    # Simple heuristic
    has_bachelors = any(e.degree and ('b.s' in e.degree.lower() or 'bachelor' in e.degree.lower() or 'b.a' in e.degree.lower() or 'b.tech' in e.degree.lower() or 'b.e' in e.degree.lower()) for e in candidate_edu)
    has_masters = any(e.degree and ('m.s' in e.degree.lower() or 'master' in e.degree.lower() or 'mba' in e.degree.lower() or 'm.tech' in e.degree.lower() or 'm.e' in e.degree.lower()) for e in candidate_edu)
    has_phd = any(e.degree and ('ph.d' in e.degree.lower() or 'phd' in e.degree.lower()) for e in candidate_edu)
    
    if 'phd' in job_edu and not has_phd: return 0.2
    if ('master' in job_edu or 'm.tech' in job_edu) and not (has_masters or has_phd): return 0.5
    if ('bachelor' in job_edu or 'b.tech' in job_edu or 'b.e' in job_edu) and not (has_bachelors or has_masters or has_phd): return 0.3
    
    return 1.0

@app.get("/jobs/{job_id}/screen", response_model=List[ScreenResultSchema])
def screen_candidates(job_id: str, db: Session = Depends(get_db)):
    job = get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job_skills_lower = {s.skill_name.lower(): s.skill_name for s in job.skills if s.skill_name}
    job_skill_set = set(job_skills_lower.keys())
    
    candidates = db.query(models.Candidate).all()
    results = []

    for c in candidates:
        cand_skills_lower = {s.skill_name.lower() for s in c.skills if s.skill_name}
        
        # Jaccard Similarity
        if len(job_skill_set) == 0:
            skill_score = 100.0
            matched_skills = []
            missing_skills = []
        else:
            intersection = job_skill_set.intersection(cand_skills_lower)
            union = job_skill_set.union(cand_skills_lower)
            # if union is 0 (both empty), we already handled job_skill_set == 0 above
            jaccard = len(intersection) / len(union) if len(union) > 0 else 0
            skill_score = jaccard * 100.0
            
            matched_skills = [job_skills_lower[k] for k in intersection]
            missing_skills = [job_skills_lower[k] for k in (job_skill_set - cand_skills_lower)]

        # Education
        edu_multiplier = compute_education_score(c.education, job.education_level)
        
        final_score = int(skill_score * edu_multiplier)
        
        # Determine Reason
        reasons = []
        if edu_multiplier < 1.0:
            reasons.append(f"Does not strongly meet education requirement ({job.education_level})")
        if missing_skills:
            reasons.append(f"Missing {len(missing_skills)} required skills (e.g. {missing_skills[0]})")
            
        reason = " | ".join(reasons) if reasons else "Strong match across skills and education."
        
        # Summarize experience
        exp_summary = f"{len(c.experience)} roles listed"
        edu_summary = c.education[0].degree if c.education and c.education[0].degree else "Unknown"

        results.append(ScreenResultSchema(
            candidate=c,
            score=final_score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            experience=exp_summary,
            education=edu_summary,
            reason=reason
        ))
    
    # Sort by score descending
    results.sort(key=lambda x: x.score, reverse=True)
    return results
