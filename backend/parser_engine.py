import re
import json
from dataclasses import dataclass
from typing import List, Dict, Any

# --- Text Sanitization Pipeline ---
def clean_resume_text(raw_text: str) -> str:
    # 1. Replace unusual bullet points with newlines
    text = re.sub(r'[▪•*➢+]', '\n', raw_text)
    
    # 2. Merge fragmented words (lowercase followed by newline then lowercase)
    text = re.sub(r'([a-z])\s*\n\s*([a-z])', r'\1 \2', text)
    
    # 3. Consolidate first 3-4 lines into a single Name string if they are short
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    name_parts = []
    
    for i in range(min(4, len(lines))):
        line = lines[i]
        # If line is short and has no weird punctuation, it's likely part of the name
        if len(line.split()) <= 2 and not re.search(r'[@\d:]', line):
            name_parts.append(line)
        else:
            break
            
    if name_parts:
        # Rebuild text with merged name
        full_name = " ".join(name_parts)
        text = full_name + "\n" + "\n".join(lines[len(name_parts):])
        
    return text

# --- Lexical Analyzer (Tokenizer) ---
# In a real-world scenario, this would use NLP (e.g., spaCy) for NER.
# For this academic project, we use regex and heuristics to tokenize lines.

@dataclass
class Token:
    type: str
    value: str

class Lexer:
    def __init__(self):
        # Basic patterns for terminals
        self.patterns = {
            'EMAIL': r'[\w\.-]+@[\w\.-]+\.\w+',
            'PHONE': r'\b\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}\b',
            'DATE_RANGE': r'\b(19|20)\d{2}\s*-\s*(19|20)\d{2}\b',
            'DATE': r'\b(19|20)\d{2}\b',
            'SECTION_EXPERIENCE': r'^(PROJECTS|WORK HISTORY|EMPLOYMENT|EXPERIENCE)$',
            'SECTION_EDUCATION': r'^(ACADEMICS|EDUCATION|QUALIFICATIONS)$',
            'SECTION_SKILLS': r'^(SKILLS|TECHNOLOGIES|CORE COMPETENCIES)$'
        }
    
    def tokenize_line(self, line: str) -> Token:
        line = line.strip()
        # Remove common bullet points and following whitespace
        line = re.sub(r'^[-*•+➢]\s*', '', line)
        if not line:
            return Token('EMPTY', '')
        
        for token_type, pattern in self.patterns.items():
            if re.search(pattern, line, re.IGNORECASE):
                # For exact section matches
                if token_type.startswith('SECTION_'):
                    if re.match(pattern, line, re.IGNORECASE):
                        return Token(token_type, line)
                else:
                    return Token(token_type, line)
        
        # Heuristics for other types
        # If it's short and doesn't look like a sentence, maybe a skill or name
        if len(line.split()) <= 4 and not line.endswith('.'):
            return Token('SHORT_PHRASE', line)
        
        return Token('DESCRIPTION', line)

    def tokenize(self, text: str) -> List[Token]:
        tokens = []
        for line in text.split('\n'):
            line = line.strip()
            if line:
                tokens.append(self.tokenize_line(line))
        return tokens

# --- CFG Syntax Analyzer (Parser) ---
# A simple recursive descent or state machine based parser that acts as our CFG evaluator.
# CFG Production Rules:
# S -> Header Experience Education Skills
# Header -> SHORT_PHRASE EMAIL PHONE (order independent for simplicity in token stream)
# Experience -> SECTION_EXPERIENCE ExpItem+
# ExpItem -> SHORT_PHRASE SHORT_PHRASE DATE_RANGE DESCRIPTION
# Education -> SECTION_EDUCATION EduItem+
# EduItem -> SHORT_PHRASE SHORT_PHRASE DATE
# Skills -> SECTION_SKILLS SHORT_PHRASE+

class Parser:
    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0
        self.profile = {
            'contact': {'name': '', 'email': '', 'phone': ''},
            'experience': [],
            'education': [],
            'skills': []
        }

    def current(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None

    def consume(self):
        token = self.current()
        self.pos += 1
        return token

    def parse(self):
        # 1. Parse Header
        self.parse_header()
        
        # 2. Parse sections based on headers found
        while self.pos < len(self.tokens):
            curr = self.current()
            if curr.type == 'SECTION_EXPERIENCE':
                self.parse_experience()
            elif curr.type == 'SECTION_EDUCATION':
                self.parse_education()
            elif curr.type == 'SECTION_SKILLS':
                self.parse_skills()
            else:
                self.consume() # skip unknown stuff between sections
        
        return self.profile

    def parse_header(self):
        # Consume until we hit a section
        while self.pos < len(self.tokens) and not self.current().type.startswith('SECTION_'):
            t = self.consume()
            if t.type == 'EMAIL':
                self.profile['contact']['email'] = t.value
            elif t.type == 'PHONE':
                sanitized_phone = ''.join(c for c in t.value if c.isdigit() or c == '+')
                self.profile['contact']['phone'] = sanitized_phone
            elif t.type == 'SHORT_PHRASE' and not self.profile['contact'].get('name'):
                # Assume first short phrase is name
                self.profile['contact']['name'] = t.value

    def parse_experience(self):
        self.consume() # consume SECTION_EXPERIENCE
        
        current_exp = {}
        
        while self.pos < len(self.tokens) and not self.current().type.startswith('SECTION_'):
            t = self.consume()
            
            # Boundary detection: Start a new block if we hit a second DATE_RANGE
            # OR if we hit a SHORT_PHRASE and we already have both a job_title and company.
            if (t.type == 'DATE_RANGE' and 'date_range' in current_exp) or \
               (t.type == 'SHORT_PHRASE' and 'job_title' in current_exp and 'company' in current_exp):
                if current_exp:
                    self.profile['experience'].append(current_exp)
                current_exp = {}

            # Dynamic field assignment based on presence rather than strict state
            if t.type == 'SHORT_PHRASE':
                if 'job_title' not in current_exp:
                    current_exp['job_title'] = t.value
                elif 'company' not in current_exp:
                    current_exp['company'] = t.value
            elif t.type == 'DATE_RANGE':
                current_exp['date_range'] = t.value
            elif t.type == 'DESCRIPTION':
                current_exp['description'] = (current_exp.get('description', '') + ' ' + t.value).strip()
                
        # Flush the last entry
        if current_exp and ('job_title' in current_exp or 'company' in current_exp):
            self.profile['experience'].append(current_exp)

    def parse_education(self):
        self.consume() # SECTION_EDUCATION
        
        current_edu = {}
        
        while self.pos < len(self.tokens) and not self.current().type.startswith('SECTION_'):
            t = self.consume()
            
            # Boundary detection: Start a new block if we hit a second DATE
            # OR if we hit a SHORT_PHRASE and we already have both a degree and institution.
            if (t.type == 'DATE' and 'graduation_year' in current_edu) or \
               (t.type == 'SHORT_PHRASE' and 'degree' in current_edu and 'institution' in current_edu):
                if current_edu:
                    self.profile['education'].append(current_edu)
                current_edu = {}

            # Dynamic field assignment
            if t.type == 'SHORT_PHRASE':
                if 'degree' not in current_edu:
                    current_edu['degree'] = t.value
                elif 'institution' not in current_edu:
                    current_edu['institution'] = t.value
            elif t.type == 'DATE':
                current_edu['graduation_year'] = t.value
                
        # Flush the last entry
        if current_edu and ('degree' in current_edu or 'institution' in current_edu):
            self.profile['education'].append(current_edu)
                
    def parse_skills(self):
        self.consume() # SECTION_SKILLS
        while self.pos < len(self.tokens) and not self.current().type.startswith('SECTION_'):
            t = self.consume()
            if t.type == 'SHORT_PHRASE':
                self.profile['skills'].append(t.value)

def parse_resume_text(text: str) -> Dict[str, Any]:
    cleaned_text = clean_resume_text(text)
    lexer = Lexer()
    tokens = lexer.tokenize(cleaned_text)
    parser = Parser(tokens)
    return parser.parse()

if __name__ == "__main__":
    sample_text = """
    JOHN DOE
    john.doe@email.com
    123-456-7890

    EXPERIENCE
    Software Engineer
    Tech Corp
    2020 - 2023
    Developed backend microservices.

    EDUCATION
    Bachelor of Science
    University of Technology
    2018

    SKILLS
    Python
    Java
    React
    """
    profile = parse_resume_text(sample_text)
    print(json.dumps(profile, indent=2))
