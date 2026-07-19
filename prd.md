# Product Requirements Document (PRD)
## Project: Automated CFG-Based Resume Screening System

### 1. Overview
The **Automated CFG-Based Resume Screening System** aims to solve the inefficiencies of manual resume screening by applying principles from the **Theory of Computation**. By defining a Context-Free Grammar (CFG) for resume structures, the system will accurately parse semi-structured resume text (PDFs) into deterministic, machine-readable data.

### 2. Objectives & Success Metrics
*   **Academic Validation:** Successfully implement a CFG and a parsing algorithm (e.g., CYK or Earley) to extract data, demonstrating theoretical concepts in a practical application.
*   **Accuracy:** Achieve >85% accuracy in correctly categorizing extracted text into `Education`, `Experience`, and `Skills`.
*   **Performance:** Parse and store a standard resume in under 2 seconds.

### 3. Technology Stack
*   **Frontend:** **React + Vite** (Provides a blazing-fast development environment and a highly responsive user interface).
*   **Backend:** **Python + FastAPI** (Asynchronous, high-performance API perfectly suited for Python's NLP and parsing libraries).
    *  
*   **Database:** **PostgreSQL (via Supabase)**. 
    *   *Constraint:* Supabase will be used **strictly as a managed relational database** (like AWS RDS). BaaS features (like Supabase Auth, Storage, or auto-generated APIs) will be ignored. The FastAPI backend will connect directly to the database using an ORM (like SQLAlchemy) or raw SQL driver (like `asyncpg`).

### 4. Core Features & Requirements

#### 4.1. Core Parser Engine (The "Theory" Component)
*   **Input:** Raw text extracted from `.pdf` or `.docx` files.
*   **Process:**
    1.  **Lexical Analysis:** Tokenize the raw text into predefined terminal symbols (Dates, Degrees, Action Verbs, Proper Nouns).
    2.  **Syntax Analysis:** Use a predefined CFG to build a parse tree. Example productions:
        *   `S -> <Header> <ExperienceSection> <EducationSection> <SkillsSection>`
        *   `<ExperienceItem> -> <JobTitle> <Company> <DateRange> <Description>`
    3.  **Semantic Extraction:** Traverse the parse tree to construct a structured JSON object.
*   **Output:** Structured JSON containing Candidate Profile.

#### 4.2. Recruiter Dashboard (Frontend UI)
*   **Candidate Table:** View all parsed candidates in a sortable, filterable data grid.
*   **Detailed View:** Click on a candidate to view their parsed structured profile alongside the original document.
*   **Match Scoring (Future Scope):** Compare extracted skills against a provided job description.

#### 4.3. Applicant Upload Flow
*   **Drag & Drop Interface:** Simple UI for applicants or recruiters to upload resume files.
*   **Real-time Feedback:** Display success or failure of the parsing engine.

### 5. System Architecture & Data Flow
1.  **Client (React):** User uploads `resume.pdf`.
2.  **API Gateway (FastAPI):** Receives the file, passes it to the extraction utility.
3.  **Extraction Utility (Python):** Uses `pdfplumber` to convert PDF to raw string.
4.  **CFG Parser Engine (Python):** Tokenizes and parses the text based on grammar rules, outputting a structured dictionary.
5.  **Database Layer (FastAPI + SQLAlchemy):** Validates the data schema and executes `INSERT` statements into the managed PostgreSQL instance.
6.  **Response:** Frontend receives a `200 OK` with the parsed data to display.

### 6. Database Schema (High-Level)
*   **`candidates` table:** `id` (UUID), `name`, `email`, `phone`, `created_at`
*   **`education` table:** `id`, `candidate_id` (FK), `degree`, `institution`, `graduation_year`
*   **`experience` table:** `id`, `candidate_id` (FK), `job_title`, `company`, `start_date`, `end_date`, `description`
*   **`skills` table:** `id`, `candidate_id` (FK), `skill_name`, `category`

### 7. Implementation Roadmap
*   **Phase 1: The Engine (Backend & Theory)**
    *   Write text extraction scripts.
    *   Define CFG rules and build the parsing logic in Python.
*   **Phase 2: Database Integration**
    *   Provision Supabase PostgreSQL.
    *   Write SQLAlchemy models and connect FastAPI to the database.
*   **Phase 3: API Development**
    *   Create `POST /upload`, `GET /candidates`, and `GET /candidates/{id}` endpoints.
*   **Phase 4: Frontend Development**
    *   Initialize Vite + React app.
    *   Build upload components and connect to FastAPI.
    *   Build the recruiter dashboard to display PostgreSQL data.
