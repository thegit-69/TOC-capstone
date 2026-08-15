import smtplib
import os
from email.message import EmailMessage
from typing import List, Optional

def send_status_email(to_email: str, candidate_name: str, status: str, missing_skills: Optional[List[str]] = None):
    # Fetch credentials from environment
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))

    if not smtp_email or not smtp_password:
        print("SMTP_EMAIL or SMTP_PASSWORD not set in .env. Email not sent.")
        return

    if not to_email:
        print(f"Candidate {candidate_name} has no email address. Email not sent.")
        return

    msg = EmailMessage()
    msg['From'] = f"TOC Hiring Team <{smtp_email}>"
    msg['To'] = to_email
    msg['Reply-To'] = "no-reply-toc@gmail.com"

    if status == "accept":
        msg['Subject'] = "Congratulations! You have been shortlisted"
        content = f"""
        <html>
        <body>
            <p>Dear {candidate_name},</p>
            <p>Congratulations! We are pleased to inform you that your profile has been shortlisted for the next round.</p>
            <p>Our team will reach out to you shortly with further instructions.</p>
            <br/>
            <p>Best regards,</p>
            <p>Hiring Team</p>
        </body>
        </html>
        """
    elif status == "reject":
        msg['Subject'] = "Update regarding your application"
        
        feedback_html = ""
        if missing_skills and len(missing_skills) > 0:
            skills_list = "".join([f"<li>{skill}</li>" for skill in missing_skills])
            feedback_html = f"""
            <p>While your background is impressive, we are currently looking for candidates with stronger experience in the following areas:</p>
            <ul>
                {skills_list}
            </ul>
            <p>We encourage you to focus on these skills and apply again in the future.</p>
            """
        else:
            feedback_html = "<p>Unfortunately, we have decided to move forward with other candidates who more closely match our current requirements.</p>"

        content = f"""
        <html>
        <body>
            <p>Dear {candidate_name},</p>
            <p>Thank you for taking the time to apply and share your profile with us.</p>
            {feedback_html}
            <br/>
            <p>We wish you the best in your job search.</p>
            <br/>
            <p>Best regards,</p>
            <p>Hiring Team</p>
        </body>
        </html>
        """
    else:
        # Ignore other statuses like 'pending'
        return

    msg.set_content("Please enable HTML to view this message.")
    msg.add_alternative(content, subtype='html')

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
