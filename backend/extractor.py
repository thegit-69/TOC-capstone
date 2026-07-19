import pdfplumber

def extract_text_from_pdf(filepath: str) -> str:
    """
    Extracts text from a given PDF file.
    """
    text = ""
    try:
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error extracting text from {filepath}: {e}")
    return text

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        print(extract_text_from_pdf(sys.argv[1]))
