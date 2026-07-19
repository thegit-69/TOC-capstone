from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

def create_resume_pdf(filename, content):
    c = canvas.Canvas(filename, pagesize=letter)
    c.setFont("Helvetica", 12)
    y_position = 750
    for line in content.split('\n'):
        if line.strip():
            c.drawString(50, y_position, line.strip())
            y_position -= 20
    c.save()
    print(f"Created {filename}")

sample_1_text = """
JOHN DOE
john.doe@email.com
123-456-7890

EXPERIENCE
Software Engineer
Tech Corp
2020 - 2023
Developed backend microservices.

Junior Developer
Startup Inc
2018 - 2020
Built frontend features using React.

EDUCATION
Bachelor of Science
University of Technology
2018

SKILLS
Python
Java
React
"""

if __name__ == "__main__":
    if not os.path.exists("samples"):
        os.makedirs("samples")
    create_resume_pdf("samples/sample_resume_1.pdf", sample_1_text)
