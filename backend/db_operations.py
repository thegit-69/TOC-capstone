from database import engine, Base, SessionLocal
import models

def init_db():
    print("Creating tables in Supabase PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

def split_date_range(date_range: str):
    """
    Splits a date string like '2018 - 2020' into ('2018', '2020').
    If no split is possible, returns (date_range, None).
    """
    if not date_range:
        return None, None
    parts = date_range.split('-')
    if len(parts) == 2:
        return parts[0].strip(), parts[1].strip()
    return date_range.strip(), None

def save_profile_to_db(profile: dict):
    db = SessionLocal()
    try:
        # Create Candidate
        contact = profile.get("contact", {})
        candidate = models.Candidate(
            name=contact.get("name"),
            email=contact.get("email"),
            phone=contact.get("phone")
        )
        db.add(candidate)
        db.flush() # flush to get candidate.id

        # Create Education
        for edu in profile.get("education", []):
            db_edu = models.Education(
                candidate_id=candidate.id,
                degree=edu.get("degree"),
                institution=edu.get("institution"),
                graduation_year=edu.get("graduation_year")
            )
            db.add(db_edu)

        # Create Experience
        for exp in profile.get("experience", []):
            start_date, end_date = split_date_range(exp.get("date_range", ""))
            db_exp = models.Experience(
                candidate_id=candidate.id,
                job_title=exp.get("job_title"),
                company=exp.get("company"),
                start_date=start_date,
                end_date=end_date,
                description=exp.get("description")
            )
            db.add(db_exp)

        # Create Skills
        for skill_name in profile.get("skills", []):
            db_skill = models.Skill(
                candidate_id=candidate.id,
                skill_name=skill_name,
                category="General" # Default category
            )
            db.add(db_skill)

        db.commit()
        db.refresh(candidate)
        print(f"Successfully saved candidate {candidate.name} with ID {candidate.id} to DB.")
        return candidate.id

    except Exception as e:
        db.rollback()
        print(f"Error saving to DB: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    if "--init" in sys.argv:
        init_db()
