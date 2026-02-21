import smtplib
import os
import json
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
import io


def generate_pdf_bytes(data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.8 * inch)
    styles = getSampleStyleSheet()
    elements = []

    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=20,
                                 textColor=colors.HexColor('#001f3f'))
    header_style = ParagraphStyle('Header', parent=styles['Heading2'], fontSize=13,
                                  textColor=colors.HexColor('#003366'))
    normal_style = styles['Normal']

    elements.append(Paragraph("POLLUTION CONTROL BOARD", title_style))
    elements.append(Paragraph("OFFICIAL NOTICE OF VIOLATION", header_style))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(f"Date: {datetime.now().strftime('%d %B %Y, %H:%M IST')}", normal_style))
    elements.append(Spacer(1, 0.15 * inch))
    elements.append(Paragraph(f"<b>Issued To:</b> {data.get('industry_name', 'N/A')}", normal_style))
    elements.append(Paragraph(f"<b>Industry Type:</b> {data.get('industry_type', 'N/A')}", normal_style))
    elements.append(Paragraph(f"<b>Location:</b> {data.get('location', 'N/A')}", normal_style))
    elements.append(Spacer(1, 0.15 * inch))
    elements.append(Paragraph("VIOLATION DETAILS", header_style))

    table_data = [['Pollutant', 'Detected Value', 'Safe Limit', 'Excess %']]
    for v in data.get('violations', []):
        excess = round(((v['value'] - v['limit']) / v['limit']) * 100, 1)
        table_data.append([v['pollutant'], f"{v['value']} µg/m³",
                           f"{v['limit']} µg/m³", f"+{excess}%"])

    t = Table(table_data, colWidths=[1.5 * inch, 1.8 * inch, 1.8 * inch, 1.2 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#001f3f')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f0f4f8'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#001f3f')),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(f"<b>Action Taken:</b> {data.get('action', 'Notice Issued')}", normal_style))
    elements.append(Spacer(1, 0.1 * inch))
    elements.append(Paragraph(f"<b>Officer Remarks:</b> {data.get('comment', '')}", normal_style))
    elements.append(Spacer(1, 0.3 * inch))
    elements.append(Paragraph(
        "This notice has been issued under the Environment Protection Act. "
        "Immediate corrective action is mandatory.", normal_style))
    elements.append(Spacer(1, 0.4 * inch))
    elements.append(Paragraph("_____________________________", normal_style))
    elements.append(Paragraph("Authorised Officer, Pollution Control Board", normal_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


def _build_html(data: dict) -> str:
    violations_html = "".join([
        f"<tr><td style='padding:8px;border:1px solid #ccc'>{v['pollutant']}</td>"
        f"<td style='padding:8px;border:1px solid #ccc;color:#e53e3e;font-weight:bold'>{v['value']} µg/m³</td>"
        f"<td style='padding:8px;border:1px solid #ccc'>{v['limit']} µg/m³</td></tr>"
        for v in data.get('violations', [])
    ])
    return f"""
    <html><body style='font-family:Arial,sans-serif;background:#f5f5f5;padding:20px'>
    <div style='max-width:600px;margin:auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)'>
      <div style='background:#001f3f;color:white;padding:24px 32px'>
        <h1 style='margin:0;font-size:22px'>⚠ Official Violation Notice</h1>
        <p style='margin:4px 0 0;opacity:0.8'>Pollution Control Board – AeroSense Intelligence System</p>
      </div>
      <div style='padding:32px'>
        <p>Dear Industry Representative,</p>
        <p>During an autonomous aerial emission scan by <strong>AeroSense Drone</strong>,
        violations were detected at <strong>{data.get('industry_name')}</strong>:</p>
        <table style='border-collapse:collapse;width:100%;margin:16px 0'>
          <tr style='background:#001f3f;color:white'>
            <th style='padding:10px;border:1px solid #ccc;text-align:left'>Pollutant</th>
            <th style='padding:10px;border:1px solid #ccc;text-align:left'>Detected</th>
            <th style='padding:10px;border:1px solid #ccc;text-align:left'>Safe Limit</th>
          </tr>
          {violations_html}
        </table>
        <p><strong>Action Taken:</strong> {data.get('action', 'Notice Issued')}</p>
        <p><strong>Officer Remarks:</strong> {data.get('comment', '')}</p>
        <p style='color:#e53e3e;font-weight:bold'>Immediate corrective action required within 48 hours.</p>
      </div>
      <div style='background:#f0f4f8;padding:16px 32px;font-size:12px;color:#666'>
        AeroSense – Autonomous Aerial Emission Intelligence System | Pollution Control Board
      </div>
    </div></body></html>"""


def _demo_log(to_email: str, data: dict):
    """Log email to console when SMTP is not configured (demo mode)."""
    print("\n" + "=" * 60)
    print("  [AEROSENSE] EMAIL NOTICE (Demo Mode – SMTP not configured)")
    print("=" * 60)
    print(f"  TO      : {to_email}")
    print(f"  SUBJECT : ⚠ POLLUTION VIOLATION NOTICE – {data.get('industry_name')}")
    print(f"  INDUSTRY: {data.get('industry_name')} ({data.get('industry_type')})")
    print(f"  ACTION  : {data.get('action')}")
    print(f"  REMARKS : {data.get('comment')}")
    if data.get('violations'):
        print("  VIOLATIONS:")
        for v in data['violations']:
            excess = round(((v['value'] - v['limit']) / v['limit']) * 100, 1)
            print(f"    • {v['pollutant']}: {v['value']} µg/m³ (limit {v['limit']}, +{excess}%)")
    print("=" * 60)
    print("  To send real emails, configure SMTP in backend/.env")
    print("=" * 60 + "\n")


def send_notice_email(to_email: str, data: dict):
    """
    Returns (success: bool, mode: str)
    mode = 'smtp' | 'demo'
    """
    smtp_host = os.getenv('SMTP_HOST', '')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER', '')
    smtp_pass = os.getenv('SMTP_PASS', '')
    smtp_from = os.getenv('SMTP_FROM', smtp_user)

    # ── Demo mode if SMTP not configured ────────────────────
    if not smtp_user or not smtp_pass or smtp_user == 'your-email@gmail.com':
        _demo_log(to_email, data)
        return True, 'demo'

    # ── Real SMTP send ───────────────────────────────────────
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"⚠ POLLUTION VIOLATION NOTICE – {data.get('industry_name')}"
    msg['From'] = smtp_from
    msg['To'] = to_email
    msg.attach(MIMEText(_build_html(data), 'html'))

    try:
        pdf_bytes = generate_pdf_bytes(data)
        pdf_part = MIMEApplication(pdf_bytes, Name='violation_notice.pdf')
        pdf_part['Content-Disposition'] = 'attachment; filename="violation_notice.pdf"'
        msg.attach(pdf_part)
    except Exception as e:
        print(f"[PDF] Error: {e}")

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_from, to_email, msg.as_string())
        return True, 'smtp'
    except Exception as e:
        print(f"[EMAIL] Send failed: {e}")
        return False, 'error'
