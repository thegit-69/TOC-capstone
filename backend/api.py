import os
import shutil
import uuid
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import engine, get_db
from extractor import extract_text_from_pdf
from parser_engine import parse_resume_text
from db_operations import save_profile_to_db

# Pydantic schemas for responses
from pydantic import BaseModel

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
    class Config:
        from_attributes = True

class CandidateDetailSchema(CandidateBaseSchema):
    education: List[EducationSchema] = []
    experience: List[ExperienceSchema] = []
    skills: List[SkillSchema] = []

app = FastAPI(title="CFG Resume Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
