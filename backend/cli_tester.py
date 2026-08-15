import json
import sys
from extractor import extract_text_from_pdf
from parser_engine import parse_resume_text
from db_operations import save_profile_to_db

def process_resume(pdf_path: str):
    print(f"--- Processing {pdf_path} ---")
    print("1. Extracting Text...")
    raw_text = extract_text_from_pdf(pdf_path)
    
    print("2. Extracted Text:")
    print("-" * 20)
    print(raw_text)
    print("-" * 20)
    
    print("3. Parsing Text...")
    profile = parse_resume_text(raw_text)
    
    print("4. Parsed Profile (JSON):")
    print("-" * 20)
    print(json.dumps(profile, indent=2))
    print("-" * 20)

    print("5. Saving to Database...")
    candidate_id = save_profile_to_db(profile)
    print(f"Saved Candidate ID: {candidate_id}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        process_resume(sys.argv[1])
    else:
        print("Usage: python main.py <path_to_pdf>")
