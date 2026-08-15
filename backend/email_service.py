import os
import resend
from typing import List, Optional

def send_status_email(to_email: str, candidate_name: str, status: str, missing_skills: Optional[List[str]] = None):
    # Fetch credentials from environment
    resend_api_key = os.getenv("RESEND_API_KEY")
    sender_email = os.getenv("SMTP_EMAIL", "onboarding@resend.dev")

    if not resend_api_key:
        print("RESEND_API_KEY not set in .env. Email not sent.")
        return

    if not to_email:
        print(f"Candidate {candidate_name} has no email address. Email not sent.")
        return

    resend.api_key = resend_api_key
    subject = ""
    content = ""

    if status == "accept":
        subject = "Congratulations! You have been shortlisted"
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
        subject = "Update regarding your application"
        
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

    params: resend.Emails.SendParams = {
        "from": f"TOC Hiring Team <{sender_email}>",
        "to": [to_email],
        "subject": subject,
        "html": content,
        "reply_to": "no-reply-toc@gmail.com"
    }

    try:
        email_response = resend.Emails.send(params)
        print(f"Email sent successfully to {to_email}. Resend ID: {email_response.get('id', 'unknown')}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
