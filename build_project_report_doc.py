import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
import os

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_page_number_to_run(run):
    fld1 = OxmlElement('w:fldChar')
    fld1.set(qn('w:fldCharType'), 'begin')
    instr = OxmlElement('w:instrText')
    instr.set(qn('xml:space'), 'preserve')
    instr.text = 'PAGE'
    fld2 = OxmlElement('w:fldChar')
    fld2.set(qn('w:fldCharType'), 'separate')
    fld3 = OxmlElement('w:fldChar')
    fld3.set(qn('w:fldCharType'), 'end')
    run._r.extend([fld1, instr, fld2, fld3])

def create_report():
    doc = Document()

    # Configure Normal Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)
    normal_style.paragraph_format.line_spacing = 1.5
    normal_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    normal_style.paragraph_format.space_after = Pt(6)

    # Margins for Section 1 (Front Matter)
    section1 = doc.sections[0]
    section1.top_margin = Inches(1.0)
    section1.bottom_margin = Inches(1.0)
    section1.left_margin = Inches(1.25)
    section1.right_margin = Inches(1.0)
    section1.different_first_page_header_footer = False

    # -------------------------------------------------------------
    # COVER / TITLE PAGE
    # -------------------------------------------------------------
    p_title_space = doc.add_paragraph()
    p_title_space.paragraph_format.space_before = Pt(36)

    p_proj_title = doc.add_paragraph()
    p_proj_title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_proj_title.paragraph_format.space_after = Pt(8)
    r_title = p_proj_title.add_run("PAYTRACK: MODERN FULL-STACK SALARY & PAYROLL MANAGEMENT SYSTEM")
    r_title.bold = True
    r_title.font.size = Pt(20)
    r_title.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(28)
    r_sub = p_sub.add_run("A Robust, Automated Enterprise Solution for Workforce Compensation, Advance Ledger Reconciliation, Attendance Deductions, and Digital Payslip Generation")
    r_sub.italic = True
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = RGBColor(0x4A, 0x55, 0x68)

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.space_after = Pt(36)
    r_meta = p_meta.add_run("A CASE STUDY PROJECT REPORT\nSubmitted in partial fulfillment of the requirements for the award of the degree of\nBACHELOR OF TECHNOLOGY\nIN\nCOMPUTER SCIENCE AND ENGINEERING")
    r_meta.font.size = Pt(12)
    r_meta.bold = True

    p_box = doc.add_paragraph()
    p_box.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_box.paragraph_format.space_after = Pt(40)
    r_box = p_box.add_run("COURSE: FULL STACK DEVELOPMENT (FSD) — SEMESTER V\nACADEMIC YEAR: 2026 – 2027\nCASE STUDY REPORT — 1 COPY PER BATCH")
    r_box.font.size = Pt(11)
    r_box.italic = True

    p_cand = doc.add_paragraph()
    p_cand.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cand.paragraph_format.space_after = Pt(12)
    r_cand = p_cand.add_run("Submitted By:\nPROJECT BATCH - FSD SEM V\nDEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING")
    r_cand.font.size = Pt(12)
    r_cand.bold = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # CERTIFICATE OF ORIGINALITY & APPROVAL
    # -------------------------------------------------------------
    p_cert_title = doc.add_paragraph()
    p_cert_title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cert_title.paragraph_format.space_after = Pt(20)
    r_cert = p_cert_title.add_run("BONAFIDE CERTIFICATE")
    r_cert.bold = True
    r_cert.font.size = Pt(16)

    p_cert_body = doc.add_paragraph()
    p_cert_body.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_cert_body.paragraph_format.line_spacing = 1.5
    p_cert_body.paragraph_format.space_after = Pt(16)
    p_cert_body.add_run(
        "This is to certify that the project report entitled \"PAYTRACK: MODERN FULL-STACK SALARY & PAYROLL MANAGEMENT SYSTEM\" "
        "is a bonafide record of independent case study and development work carried out by the student batch of Semester V, "
        "Department of Computer Science and Engineering, in partial fulfillment of the requirements for the course of Full Stack "
        "Development (FSD) during the academic year 2026-2027. The work documented in this report represents original software engineering, "
        "database schema modeling, and full-stack implementation executed under academic supervision and has not been submitted elsewhere "
        "for the award of any other degree or diploma."
    )

    p_sig_space = doc.add_paragraph()
    p_sig_space.paragraph_format.space_before = Pt(60)

    # Signature table
    sig_table = doc.add_table(rows=2, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.autofit = False
    sig_table.columns[0].width = Inches(3.2)
    sig_table.columns[1].width = Inches(3.2)

    cell_00 = sig_table.cell(0, 0)
    cell_01 = sig_table.cell(0, 1)
    cell_10 = sig_table.cell(1, 0)
    cell_11 = sig_table.cell(1, 1)

    p_s1 = cell_00.paragraphs[0]
    p_s1.add_run("______________________________\nINTERNAL GUIDE / FACULTY\nDepartment of CSE").font.size = Pt(11)
    p_s2 = cell_01.paragraphs[0]
    p_s2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_s2.add_run("______________________________\nHEAD OF THE DEPARTMENT\nDepartment of CSE").font.size = Pt(11)

    p_s3 = cell_10.paragraphs[0]
    p_s3.paragraph_format.space_before = Pt(30)
    p_s3.add_run("Date: ______________\nPlace: _____________").font.size = Pt(10)
    p_s4 = cell_11.paragraphs[0]
    p_s4.paragraph_format.space_before = Pt(30)
    p_s4.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_s4.add_run("SEAL OF THE INSTITUTION").font.size = Pt(10)

    doc.add_page_break()

    # -------------------------------------------------------------
    # DECLARATION & ACKNOWLEDGEMENT
    # -------------------------------------------------------------
    p_dec_title = doc.add_paragraph()
    p_dec_title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dec_title.paragraph_format.space_after = Pt(16)
    r_dec = p_dec_title.add_run("DECLARATION")
    r_dec.bold = True
    r_dec.font.size = Pt(14)

    p_dec_body = doc.add_paragraph()
    p_dec_body.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_dec_body.paragraph_format.line_spacing = 1.5
    p_dec_body.add_run(
        "We hereby declare that the Full Stack Development project report entitled \"PAYTRACK: MODERN FULL-STACK SALARY & PAYROLL "
        "MANAGEMENT SYSTEM\" submitted to the Department of Computer Science and Engineering is an authentic record of our own research "
        "and developmental efforts. All architectural designs, data schema implementations, REST API integrations, and user interfaces "
        "described herein have been engineered by us, with appropriate intellectual acknowledgements accorded to open-source software libraries, "
        "industry standards, and academic literature."
    )

    p_ack_title = doc.add_paragraph()
    p_ack_title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ack_title.paragraph_format.space_before = Pt(24)
    p_ack_title.paragraph_format.space_after = Pt(16)
    r_ack = p_ack_title.add_run("ACKNOWLEDGEMENT")
    r_ack.bold = True
    r_ack.font.size = Pt(14)

    p_ack_body = doc.add_paragraph()
    p_ack_body.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ack_body.paragraph_format.line_spacing = 1.5
    p_ack_body.add_run(
        "We express our deepest sense of gratitude to our respected Faculty Guide, Course Instructors, and Head of the Department "
        "for their invaluable mentorship, technical direction, and constructive critique throughout the design and realization of this "
        "full-stack application. We also extend our sincere appreciation to the laboratory technical staff and our peers for providing a "
        "collaborative environment and essential testing infrastructure that contributed significantly to the successful fruition of this project."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # TABLE OF CONTENTS
    # -------------------------------------------------------------
    p_toc_title = doc.add_paragraph()
    p_toc_title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc_title.paragraph_format.space_after = Pt(20)
    r_toc = p_toc_title.add_run("TABLE OF CONTENTS")
    r_toc.bold = True
    r_toc.font.size = Pt(16)

    # TOC Table representation
    toc_data = [
        ("ABSTRACT", "iv"),
        ("1.0 INTRODUCTION", "1"),
        ("    1.1 PROJECT AIM AND OBJECTIVE", "2"),
        ("    1.2 SCOPE", "3"),
        ("2.0 SYSTEM ANALYSIS", "5"),
        ("    2.1 SOFTWARE REQUIREMENT SPECIFICATION", "5"),
        ("    2.2 SYSTEM DESCRIPTION", "7"),
        ("    2.3 SOFTWARE AND HARDWARE USED", "9"),
        ("3.0 SYSTEM DESIGN", "11"),
        ("    3.1 UML – USE CASE DIAGRAM OF FUNCTIONALITY", "11"),
        ("    3.2 FLOW CHART", "14"),
        ("    3.3 DATABASE SCHEMA & ENTITY-RELATIONSHIP DESIGN", "16"),
        ("4.0 SYSTEM IMPLEMENTATION", "18"),
        ("    4.1 LIST OF MODULES", "18"),
        ("    4.2 MODULE DESCRIPTION", "19"),
        ("    4.3 USER INTERFACE", "23"),
        ("5.0 CONCLUSION", "26"),
        ("6.0 REFERENCES", "28")
    ]

    toc_table = doc.add_table(rows=len(toc_data) + 1, cols=2)
    toc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    toc_table.autofit = False
    toc_table.columns[0].width = Inches(5.2)
    toc_table.columns[1].width = Inches(1.2)

    # Header
    h_c0 = toc_table.cell(0, 0)
    h_c1 = toc_table.cell(0, 1)
    set_cell_background(h_c0, "1A365D")
    set_cell_background(h_c1, "1A365D")
    p0 = h_c0.paragraphs[0]
    p1 = h_c1.paragraphs[0]
    p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r0 = p0.add_run("CHAPTER / TOPIC TITLE")
    r0.bold = True
    r0.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    r1 = p1.add_run("PAGE NO.")
    r1.bold = True
    r1.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for i, (title, pg) in enumerate(toc_data):
        c0 = toc_table.cell(i + 1, 0)
        c1 = toc_table.cell(i + 1, 1)
        p_c0 = c0.paragraphs[0]
        p_c1 = c1.paragraphs[0]
        p_c1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_c0.paragraph_format.line_spacing = 1.15
        p_c1.paragraph_format.line_spacing = 1.15
        p_c0.paragraph_format.space_after = Pt(2)
        p_c1.paragraph_format.space_after = Pt(2)

        r_t = p_c0.add_run(title)
        if title.startswith("1.0") or title.startswith("2.0") or title.startswith("3.0") or title.startswith("4.0") or title.startswith("5.0") or title.startswith("6.0") or title == "ABSTRACT":
            r_t.bold = True
            r_t.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)
        r_p = p_c1.add_run(pg)
        r_p.bold = True

    p_space_lof = doc.add_paragraph()
    p_space_lof.paragraph_format.space_before = Pt(20)

    p_lof_title = doc.add_paragraph()
    p_lof_title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lof_title.paragraph_format.space_after = Pt(12)
    r_lof = p_lof_title.add_run("LIST OF FIGURES & TABLES")
    r_lof.bold = True
    r_lof.font.size = Pt(14)

    fig_items = [
        ("Figure 2.1", "Three-Tier Web Application Architecture of Paytrack", "8"),
        ("Figure 3.1", "UML Use Case Diagram for Paytrack Management System", "12"),
        ("Figure 3.2", "System Flowchart of Payroll Calculation & Disbursal Workflow", "15"),
        ("Figure 3.3", "Database Entity-Relationship (ER) Diagram", "17"),
        ("Figure 4.1", "Paytrack Interactive Dashboard & Real-Time Analytics UI", "23"),
        ("Figure 4.2", "Workforce Directory & Employee Management Interface", "24"),
        ("Figure 4.3", "Automated Payroll Batch Processing & Disbursal Interface", "25"),
        ("Figure 4.4", "Executive Payslip Document with QR Verification Seal", "26"),
        ("Table 2.1", "Hardware Environment Specifications", "9"),
        ("Table 2.2", "Software Technology Stack Specifications", "10"),
        ("Table 3.1", "Use Case Actor-System Interaction Matrix", "13"),
        ("Table 4.1", "Comprehensive REST API Endpoint Reference", "21")
    ]

    lof_table = doc.add_table(rows=len(fig_items) + 1, cols=3)
    lof_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    lof_table.autofit = False
    lof_table.columns[0].width = Inches(1.4)
    lof_table.columns[1].width = Inches(4.0)
    lof_table.columns[2].width = Inches(1.0)

    lh0 = lof_table.cell(0, 0)
    lh1 = lof_table.cell(0, 1)
    lh2 = lof_table.cell(0, 2)
    set_cell_background(lh0, "2B6CB0")
    set_cell_background(lh1, "2B6CB0")
    set_cell_background(lh2, "2B6CB0")
    lh0.paragraphs[0].add_run("FIGURE / TABLE").bold = True
    lh0.paragraphs[0].runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    lh1.paragraphs[0].add_run("CAPTION / DESCRIPTION").bold = True
    lh1.paragraphs[0].runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    lh2.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    lh2.paragraphs[0].add_run("PAGE NO.").bold = True
    lh2.paragraphs[0].runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for idx, (f_num, f_desc, f_pg) in enumerate(fig_items):
        c0 = lof_table.cell(idx + 1, 0)
        c1 = lof_table.cell(idx + 1, 1)
        c2 = lof_table.cell(idx + 1, 2)
        c0.paragraphs[0].add_run(f_num).bold = True
        c1.paragraphs[0].add_run(f_desc)
        c2.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
        c2.paragraphs[0].add_run(f_pg).bold = True

    # -------------------------------------------------------------
    # SECTION BREAK FOR REPORT BODY (PAGE NUMBERING STARTS HERE)
    # -------------------------------------------------------------
    # Add a section break so that page numbers appear centered at the bottom of the page
    new_section = doc.add_section(docx.enum.section.WD_SECTION.NEW_PAGE)
    new_section.top_margin = Inches(1.0)
    new_section.bottom_margin = Inches(1.0)
    new_section.left_margin = Inches(1.25)
    new_section.right_margin = Inches(1.0)
    new_section.header.is_linked_to_previous = False
    new_section.footer.is_linked_to_previous = False

    # Header on body pages
    hdr_p = new_section.header.paragraphs[0]
    hdr_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hdr_run = hdr_p.add_run("Paytrack: Modern Full-Stack Salary & Payroll Management System")
    hdr_run.font.size = Pt(8.5)
    hdr_run.italic = True
    hdr_run.font.color.rgb = RGBColor(0x71, 0x80, 0x96)

    # Footer on body pages: Page Number Centered
    ftr_p = new_section.footer.paragraphs[0]
    ftr_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    ftr_run = ftr_p.add_run()
    ftr_run.font.size = Pt(11)
    ftr_run.font.name = 'Times New Roman'
    add_page_number_to_run(ftr_run)

    # -------------------------------------------------------------
    # ABSTRACT
    # -------------------------------------------------------------
    p_abs_h = doc.add_paragraph()
    p_abs_h.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abs_h.paragraph_format.space_before = Pt(12)
    p_abs_h.paragraph_format.space_after = Pt(16)
    r_absh = p_abs_h.add_run("ABSTRACT")
    r_absh.bold = True
    r_absh.font.size = Pt(16)
    r_absh.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    # Exactly 8 to 10 lines of paragraph, Justified, Times New Roman 12 pt, 1.5 line spacing
    p_abs = doc.add_paragraph()
    p_abs.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_abs.paragraph_format.line_spacing = 1.5
    p_abs.paragraph_format.space_after = Pt(16)
    p_abs.add_run(
        "Paytrack is an enterprise-grade, full-stack salary and payroll management web application engineered to automate workforce compensation workflows, minimize human accounting discrepancies, and provide real-time corporate financial visibility. Developed utilizing a modern three-tier architecture comprising an HTML5/CSS3 glassmorphic presentation layer, a resilient Node.js and Express.js RESTful application server, and a high-performance SQLite3 relational database with write-ahead logging, the platform centralizes core human resource operations. Key capabilities include comprehensive employee lifecycle management, automated salary advance and loan ledger reconciliation, attendance-driven unpaid leave deduction computation, single and batch payroll processing, dynamic salary slips with verifiable QR security seals, and export utilities supporting PDF and Excel formats. Furthermore, the system incorporates interactive visual analytics powered by Chart.js, dual-theme dark and light mode persistence, an instant salary arithmetic calculator, and tamper-resistant administrative audit logging to deliver a unified, compliant, and scalable enterprise payroll solution."
    )

    p_abs_kw = doc.add_paragraph()
    p_abs_kw.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_abs_kw.paragraph_format.line_spacing = 1.5
    p_abs_kw.paragraph_format.space_after = Pt(24)
    r_kw = p_abs_kw.add_run("Keywords: ")
    r_kw.bold = True
    p_abs_kw.add_run("Full-Stack Development, Payroll Automation, Node.js, Express.js, SQLite3, Salary Ledger, Attendance Deductions, Glassmorphism UI, Payslip Generation, RESTful API.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 1.0 INTRODUCTION
    # -------------------------------------------------------------
    p_c1_h = doc.add_paragraph()
    p_c1_h.paragraph_format.space_before = Pt(16)
    p_c1_h.paragraph_format.space_after = Pt(10)
    r_c1 = p_c1_h.add_run("1.0 INTRODUCTION")
    r_c1.bold = True
    r_c1.font.size = Pt(16)
    r_c1.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    p_c1_intro1 = doc.add_paragraph()
    p_c1_intro1.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c1_intro1.paragraph_format.line_spacing = 1.5
    p_c1_intro1.add_run(
        "In modern commercial enterprises and institutional organizations, compensation disbursement and human resource accounting "
        "represent core operational pillars that directly govern employee satisfaction, organizational morale, and financial audit compliance. "
        "Historically, small-to-medium enterprises (SMEs) and growing corporations relied upon manual book-keeping techniques or decoupled desktop "
        "spreadsheets to compute monthly salaries, log advance requests, track unpaid absences, and issue compensation vouchers. However, as organizational "
        "structures scale and departmental specializations proliferate, manual spreadsheet workflows become inherently prone to mathematical formula "
        "errors, unauthorized ledger tampering, accidental data overwrite, lack of concurrency control, and tedious reconciliation delays."
    )

    p_c1_intro2 = doc.add_paragraph()
    p_c1_intro2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c1_intro2.paragraph_format.line_spacing = 1.5
    p_c1_intro2.add_run(
        "Furthermore, contemporary fiscal management demands agile, transparent, and multi-channel audit trails. Enterprise accounting officers "
        "require instantaneous visibility into monthly aggregate payroll liability, departmental resource expenditures, outstanding loan and salary "
        "advance balances, and granular per-employee earnings breakdowns. The rapid evolution of full-stack web engineering—characterized by decoupled "
        "client-server architectures, RESTful communication protocols, high-concurrency event-driven backends, and lightweight embedded relational "
        "databases—offers an ideal technological paradigm to resolve these challenges. The Paytrack system is conceived and realized within this modern "
        "web engineering context, delivering a unified digital platform that automates the complete payroll lifecycle from employee onboarding to "
        "electronic payslip generation."
    )

    # 1.1 PROJECT AIM AND OBJECTIVE
    p_c1_sub1 = doc.add_paragraph()
    p_c1_sub1.paragraph_format.space_before = Pt(14)
    p_c1_sub1.paragraph_format.space_after = Pt(6)
    r_sub1 = p_c1_sub1.add_run("1.1 PROJECT AIM AND OBJECTIVE")
    r_sub1.bold = True
    r_sub1.font.size = Pt(14)
    r_sub1.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    # Exactly 4-5 lines in times new roman 12, justified
    p_aim = doc.add_paragraph()
    p_aim.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_aim.paragraph_format.line_spacing = 1.5
    p_aim.paragraph_format.space_after = Pt(12)
    p_aim.add_run(
        "The primary aim of this project is to architect and deploy a robust, secure, and automated full-stack payroll management system that eliminates manual computational inefficiencies in corporate compensation workflows. Its key objectives comprise developing an intuitive workforce directory, automating dynamic net salary calculations integrating advance loans and leave deductions, providing verifiable digital payslips, and delivering interactive financial analytics to enhance operational transparency and fiscal governance."
    )

    p_aim_points = doc.add_paragraph()
    p_aim_points.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_aim_points.paragraph_format.line_spacing = 1.5
    p_aim_points.add_run(
        "To accomplish this comprehensive aim, the project formulates the following tangible technical objectives:\n"
        "1. Real-Time Full-Stack Architecture: Construct an end-to-end web system utilizing HTML5, modern CSS3 Glassmorphism, vanilla JavaScript ES6+, Express.js, and SQLite3 to guarantee instantaneous responsiveness without heavyweight runtime dependencies.\n"
        "2. Automated Deduction Engine: Formulate algorithmic services that automatically retrieve outstanding employee advances and calculate pro-rated unpaid leave deductions based on exact per-day rates, seamlessly deducting them during monthly batch generation.\n"
        "3. Multi-Channel Disbursal & Compliance: Integrate multi-modal disbursement classification (NEFT, IMPS, UPI, Cheque, Cash) alongside verified corporate payslips styled with dynamic dual-column earnings-versus-deductions breakdowns and embedded QR verification seals.\n"
        "4. Visual Analytics & Reporting: Implement real-time dashboard visualizations featuring Chart.js bar and donut charts, automated audit trail logging, and one-click export utilities to standard Microsoft Excel (.xlsx) and printable PDF documents."
    )

    # 1.2 SCOPE
    p_c1_sub2 = doc.add_paragraph()
    p_c1_sub2.paragraph_format.space_before = Pt(14)
    p_c1_sub2.paragraph_format.space_after = Pt(6)
    r_sub2 = p_c1_sub2.add_run("1.2 SCOPE")
    r_sub2.bold = True
    r_sub2.font.size = Pt(14)
    r_sub2.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    p_scope_desc = doc.add_paragraph()
    p_scope_desc.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_scope_desc.paragraph_format.line_spacing = 1.5
    p_scope_desc.add_run(
        "The functional and technical scope of the Paytrack system spans organizational compensation administration across diverse commercial, "
        "educational, and technological enterprises. The system addresses the needs of multiple administrative stakeholders including Human Resources "
        "(HR) Executives, Payroll Officers, Finance Directors, and System Administrators. Specifically, the organizational and technical scope encompasses:\n\n"
        "• Workforce Lifecycle Management: Comprehensive recording, updating, search-filtering, and soft/hard lifecycle tracking of corporate personnel across distinct corporate departments (Engineering, Product & Design, Marketing, Sales, Human Resources, Finance, and Operations).\n\n"
        "• Advance & Loan Ledger Reconciliation: Real-time issuance of short-term employee financial advances, multi-month repayment scheduling, automated remaining balance tracking, and auto-settlement during payroll batch execution.\n\n"
        "• Attendance & Absence Compensation Processing: Standardized recording of monthly paid and unpaid leaves, dynamic computation of per-day salary deductibles utilizing normalized 30-day corporate calendar metrics, and automatic ledger adjustments.\n\n"
        "• Single & Batch Payroll Generation: Flexible processing engines capable of computing compensation on an individualized single-employee basis or across the entire active workforce simultaneously with transactional atomicity.\n\n"
        "• Audit Trails & System Configuration: Persistent logging of every administrative action (sign-ins, profile edits, disbursals, advance deductions), coupled with customizable company profiles, authorized signatory details, and credential management.\n\n"
        "• Boundaries and Limitations: In its current implementation, the application assumes a unified base corporate currency (configurable via company settings), operates under an administrative single-tenant control model, and relies on administrator-entered monthly attendance metrics rather than direct biometric IoT sensor streaming."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # 2.0 SYSTEM ANALYSIS
    # -------------------------------------------------------------
    p_c2_h = doc.add_paragraph()
    p_c2_h.paragraph_format.space_before = Pt(16)
    p_c2_h.paragraph_format.space_after = Pt(10)
    r_c2 = p_c2_h.add_run("2.0 SYSTEM ANALYSIS")
    r_c2.bold = True
    r_c2.font.size = Pt(16)
    r_c2.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    # 2.1 SOFTWARE REQUIREMENT SPECIFICATION
    p_c2_sub1 = doc.add_paragraph()
    p_c2_sub1.paragraph_format.space_before = Pt(14)
    p_c2_sub1.paragraph_format.space_after = Pt(6)
    r_c2_s1 = p_c2_sub1.add_run("2.1 SOFTWARE REQUIREMENT SPECIFICATION")
    r_c2_s1.bold = True
    r_c2_s1.font.size = Pt(14)
    r_c2_s1.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    # Requirements of the application selected Para – 10 -12 lines
    p_srs_para = doc.add_paragraph()
    p_srs_para.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_srs_para.paragraph_format.line_spacing = 1.5
    p_srs_para.paragraph_format.space_after = Pt(14)
    p_srs_para.add_run(
        "The software requirement specification delineates the functional, computational, and technical criteria essential for deploying the Paytrack payroll application across modern distributed environments. The application mandates a responsive cross-browser web interface capable of executing administrative workforce operations, role-based authentication, and live mathematical salary computations without client-side latency. Core system specifications encompass persistent employee record storage, multi-factor advance repayment tracking, automated prorated leave deduction algorithms, and transactional payroll batch generation with foreign key referential integrity. On the architectural plane, the system requires an event-driven Node.js execution runtime, an Express.js middleware framework handling RESTful JSON payloads, and an ACID-compliant SQLite3 database operating in write-ahead logging mode for resilient concurrent transactions. Security requirements dictate strict input sanitization, HTTP request logging via Morgan, protected administrative endpoints, and tamper-evident audit trails for financial accountability. Finally, document rendering capabilities must support client-side vector payslip generation via jsPDF, high-fidelity browser print media styling, and structured spreadsheet serialization through SheetJS."
    )

    p_srs_detail = doc.add_paragraph()
    p_srs_detail.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_srs_detail.paragraph_format.line_spacing = 1.5
    p_srs_detail.add_run(
        "The Software Requirement Specification (SRS) is categorized into functional requirements that define system behavior and non-functional requirements that govern quality attributes, performance benchmarks, and security constraints:\n\n"
        "A. Functional Requirements (FR):\n"
        "• FR-01 (Authentication & Session Management): The system must validate user administrative credentials, maintain state via secure local tokens, and restrict modification access to authenticated administrators.\n"
        "• FR-02 (Workforce Directory & CRUD): The system must provide real-time creation, updating, retrieval, and soft/hard deletion of employee profiles, complete with departmental categorization and basic salary assignments.\n"
        "• FR-03 (Advance Ledger Management): The system must track financial loan disbursements, maintain remaining debt balances, and automatically deduct agreed instalments during monthly payroll execution.\n"
        "• FR-04 (Leave & Absence Deductions): The system must record monthly paid and unpaid absences, calculating per-day deductions dynamically using the standard corporate formula: Leave Deduction = (Basic Salary / 30) × Unpaid Days.\n"
        "• FR-05 (Payroll Arithmetic Computation): The system must compute Net Salary dynamically using the verified arithmetic model: Net = Basic + Bonus - Advance Deduction - Leave Deduction - Other Statutory Deductions.\n"
        "• FR-06 (Batch Processing): The system must support single-click batch generation of monthly payroll for all active employees without redundant database writes or deadlocks.\n"
        "• FR-07 (Payslip Generation & Export): The system must construct official dual-column payslips with company branding, authorized signatures, QR security seals, direct PDF generation, and Excel (.xlsx) sheet exports.\n"
        "• FR-08 (Interactive Analytics): The system must visualize expenditure trends, paid versus pending disbursements, and departmental allocations via responsive Chart.js components.\n\n"
        "B. Non-Functional Requirements (NFR):\n"
        "• NFR-01 (Performance & Latency): REST API endpoints must respond within 150 milliseconds under standard concurrency; UI interactions and search filtering must execute instantaneously in under 50 milliseconds.\n"
        "• NFR-02 (Data Integrity & ACID Guarantees): SQLite3 database transactions must enforce strict foreign key constraints (ON DELETE CASCADE) and Write-Ahead Logging (WAL) to prevent partial writes.\n"
        "• NFR-03 (Usability & Responsiveness): The user interface must support adaptive layouts across desktop monitors, laptops, and tablets, featuring modern glassmorphism design principles and instant dark/light theme switching.\n"
        "• NFR-04 (Reliability & Recovery): The application must maintain persistent storage in a single portable database file (`paytrack.db`) capable of immediate backup, migration, and zero-downtime server restart."
    )

    # 2.2 SYSTEM DESCRIPTION
    p_c2_sub2 = doc.add_paragraph()
    p_c2_sub2.paragraph_format.space_before = Pt(14)
    p_c2_sub2.paragraph_format.space_after = Pt(6)
    r_c2_s2 = p_c2_sub2.add_run("2.2 SYSTEM DESCRIPTION")
    r_c2_s2.bold = True
    r_c2_s2.font.size = Pt(14)
    r_c2_s2.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    p_sys_desc1 = doc.add_paragraph()
    p_sys_desc1.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_sys_desc1.paragraph_format.line_spacing = 1.5
    p_sys_desc1.add_run(
        "Paytrack is designed around an enterprise 3-Tier Client-Server Architecture that cleanly decouples presentation, business logic, "
        "and data persistence layers. This modular separation of concerns ensures that frontend user interface components can evolve independently "
        "of server-side calculation rules, while relational database schemas maintain strict consistency and ACID compliance.\n\n"
        "1. Presentation Tier (Client-Side): Implemented entirely in semantic HTML5, modern CSS3 utilizing CSS Custom Properties (CSS variables) "
        "and backdrop-blur glassmorphic aesthetics, and vanilla ECMAScript 6+ JavaScript. The client functions as a Single-Page Application (SPA) "
        "that manages UI state, coordinates modal views, performs live client-side input validation, renders interactive visual charts via Chart.js, "
        "and compiles vector documents via jsPDF and SheetJS without external framework bloat.\n\n"
        "2. Application / Business Logic Tier (Server-Side): Engineered on the Node.js V8 JavaScript runtime utilizing the Express.js framework. "
        "The server exposes a comprehensive set of RESTful API endpoints exchanging structured JSON payloads. This tier handles administrative "
        "authentication, business calculation engines (such as pro-rated leave deduction and advance recovery scheduling), audit logging middleware, "
        "and request parameter sanitization.\n\n"
        "3. Data Storage Tier (Persistence): Powered by SQLite3 through the high-performance `better-sqlite3` native C++ binding library. "
        "Unlike standard asynchronous drivers that incur event-loop queue overhead, `better-sqlite3` executes synchronous, blocking disk queries "
        "with sub-millisecond execution speeds. The database operates in Write-Ahead Logging (WAL) mode, permitting concurrent non-blocking reads "
        "while atomic writes take place, alongside strict foreign key enforcement."
    )

    # Insert Figure 2.1
    if os.path.exists('report_images/fig_2_1_architecture.png'):
        p_img = doc.add_paragraph()
        p_img.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture('report_images/fig_2_1_architecture.png', width=Inches(6.0))

        p_cap = doc.add_paragraph()
        p_cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        r_cap = p_cap.add_run("Figure 2.1: Three-Tier Web Application Architecture of Paytrack System")
        r_cap.bold = True
        r_cap.font.size = Pt(10.5)
        r_cap.italic = True

    # 2.3 SOFTWARE AND HARDWARE USED
    p_c2_sub3 = doc.add_paragraph()
    p_c2_sub3.paragraph_format.space_before = Pt(14)
    p_c2_sub3.paragraph_format.space_after = Pt(6)
    r_c2_s3 = p_c2_sub3.add_run("2.3 SOFTWARE AND HARDWARE USED")
    r_c2_s3.bold = True
    r_c2_s3.font.size = Pt(14)
    r_c2_s3.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    p_sh_desc = doc.add_paragraph()
    p_sh_desc.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_sh_desc.paragraph_format.line_spacing = 1.5
    p_sh_desc.add_run(
        "To ensure seamless execution, continuous integration, and rapid testing across both developer workstations and corporate production environments, "
        "the Paytrack platform specifies well-defined hardware and software configurations. The system is intentionally architected to maintain a minimal "
        "operational footprint, allowing it to execute smoothly on standard entry-level hardware while scaling effortlessly to multi-core server racks."
    )

    # Hardware Table
    p_th1 = doc.add_paragraph()
    p_th1.paragraph_format.space_before = Pt(8)
    p_th1.paragraph_format.space_after = Pt(4)
    r_th1 = p_th1.add_run("Table 2.1: Hardware Environment Specifications")
    r_th1.bold = True
    r_th1.font.size = Pt(11)

    hw_data = [
        ("Hardware Component", "Minimum Requirement (Client / Host)", "Recommended Specification (Server Host)"),
        ("Processor (CPU)", "Intel Core i3 / AMD Ryzen 3 (Dual-Core 2.0 GHz)", "Intel Core i5 / AMD Ryzen 5 (Quad-Core 3.0+ GHz)"),
        ("System Memory (RAM)", "4 GB DDR3 / DDR4 RAM", "8 GB / 16 GB DDR4 RAM"),
        ("Storage (Disk)", "500 MB Free Space (HDD / SSD)", "10 GB Solid State Drive (NVMe SSD for fast WAL I/O)"),
        ("Display Resolution", "1280 × 720 HD Resolution", "1920 × 1080 Full HD or Higher Display Monitor"),
        ("Network Interface", "Standard 10/100 Mbps NIC (Localhost / LAN)", "Gigabit Ethernet Controller (1000 Mbps LAN / WAN)")
    ]

    t_hw = doc.add_table(rows=len(hw_data), cols=3)
    t_hw.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_hw.autofit = False
    t_hw.columns[0].width = Inches(2.0)
    t_hw.columns[1].width = Inches(2.4)
    t_hw.columns[2].width = Inches(2.4)

    for r_idx, row in enumerate(hw_data):
        for c_idx, val in enumerate(row):
            cell = t_hw.cell(r_idx, c_idx)
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            if r_idx == 0:
                set_cell_background(cell, "1A365D")
                r = p.add_run(val)
                r.bold = True
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                if r_idx % 2 == 1:
                    set_cell_background(cell, "F7FAFC")
                r = p.add_run(val)
                r.font.size = Pt(9.5)
                if c_idx == 0:
                    r.bold = True

    # Software Table
    p_th2 = doc.add_paragraph()
    p_th2.paragraph_format.space_before = Pt(14)
    p_th2.paragraph_format.space_after = Pt(4)
    r_th2 = p_th2.add_run("Table 2.2: Software Technology Stack Specifications")
    r_th2.bold = True
    r_th2.font.size = Pt(11)

    sw_data = [
        ("Layer / Category", "Technology / Software Tool", "Version", "Functional Role in Project"),
        ("Operating System", "Microsoft Windows / Linux / macOS", "Windows 10/11, Ubuntu 22.04+", "Host deployment and execution OS"),
        ("Backend Runtime", "Node.js (V8 Engine)", "v18.x to v22.x LTS", "Event-driven asynchronous JavaScript runtime"),
        ("Backend Framework", "Express.js", "^4.21.2", "RESTful routing, JSON body-parser, HTTP middleware"),
        ("Database Engine", "SQLite3 (`better-sqlite3`)", "^11.8.1", "Synchronous, relational ACID database with WAL"),
        ("HTTP Logger", "Morgan", "^1.10.0", "Development and production HTTP request logging"),
        ("Cross-Origin Engine", "CORS Middleware", "^2.8.5", "Manages secure Cross-Origin Resource Sharing"),
        ("Client UI Core", "HTML5 & Modern CSS3", "Semantic & CSS3 Vars", "Responsive glassmorphism UI, dual themes"),
        ("Client Scripting", "Vanilla JavaScript (ES6+)", "Modern ECMAScript", "DOM manipulation, API fetch async calls, state"),
        ("Visual Analytics", "Chart.js", "v4.4.1 (CDN)", "Canvas-based dynamic expenditure and donut charts"),
        ("Document Generation", "jsPDF & SheetJS (XLSX)", "v2.5.1 / v0.18.5", "Client-side PDF compilation & Excel spreadsheet export")
    ]

    t_sw = doc.add_table(rows=len(sw_data), cols=4)
    t_sw.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_sw.autofit = False
    t_sw.columns[0].width = Inches(1.5)
    t_sw.columns[1].width = Inches(2.0)
    t_sw.columns[2].width = Inches(1.2)
    t_sw.columns[3].width = Inches(2.1)

    for r_idx, row in enumerate(sw_data):
        for c_idx, val in enumerate(row):
            cell = t_sw.cell(r_idx, c_idx)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            if r_idx == 0:
                set_cell_background(cell, "2B6CB0")
                r = p.add_run(val)
                r.bold = True
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                if r_idx % 2 == 1:
                    set_cell_background(cell, "F7FAFC")
                r = p.add_run(val)
                r.font.size = Pt(9)
                if c_idx == 0:
                    r.bold = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # 3.0 SYSTEM DESIGN
    # -------------------------------------------------------------
    p_c3_h = doc.add_paragraph()
    p_c3_h.paragraph_format.space_before = Pt(16)
    p_c3_h.paragraph_format.space_after = Pt(10)
    r_c3 = p_c3_h.add_run("3.0 SYSTEM DESIGN")
    r_c3.bold = True
    r_c3.font.size = Pt(16)
    r_c3.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    p_c3_intro = doc.add_paragraph()
    p_c3_intro.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c3_intro.paragraph_format.line_spacing = 1.5
    p_c3_intro.add_run(
        "System design transforms functional and technical requirements into concrete architectural specifications, behavioral models, "
        "and data schemas. This section presents the formal design artifacts of Paytrack, comprising Unified Modeling Language (UML) Use Case "
        "diagrams defining operational actors, comprehensive system flowcharts mapping mathematical and transactional execution paths, and "
        "complete Entity-Relationship (ER) schemas modeling persistent relational data structures."
    )

    # 3.1 UML – USE CASE DIAGRAM OF FUNCTIONALITY
    p_c3_sub1 = doc.add_paragraph()
    p_c3_sub1.paragraph_format.space_before = Pt(14)
    p_c3_sub1.paragraph_format.space_after = Pt(6)
    r_c3_s1 = p_c3_sub1.add_run("3.1 UML – USE CASE DIAGRAM OF FUNCTIONALITY")
    r_c3_s1.bold = True
    r_c3_s1.font.size = Pt(14)
    r_c3_s1.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    p_uc_desc = doc.add_paragraph()
    p_uc_desc.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_uc_desc.paragraph_format.line_spacing = 1.5
    p_uc_desc.add_run(
        "The UML Use Case model formalizes the functional interaction boundaries between human actors and the Paytrack software system. "
        "The primary actor is the **System Administrator / HR Payroll Officer**, who possesses administrative authority to manage employees, "
        "record financial advances, input leave balances, compute monthly payroll runs, disburse salary payments, and configure institutional "
        "branding settings. A secondary actor is the **Finance Auditor / Executive Management**, who interacts with analytical dashboards, "
        "monitors aggregate corporate expenditures, audits security logs, and exports certified financial reports."
    )

    # Insert Figure 3.1
    if os.path.exists('report_images/fig_3_1_usecase.png'):
        p_img = doc.add_paragraph()
        p_img.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture('report_images/fig_3_1_usecase.png', width=Inches(6.0))

        p_cap = doc.add_paragraph()
        p_cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        r_cap = p_cap.add_run("Figure 3.1: UML Use Case Diagram for Paytrack Management System")
        r_cap.bold = True
        r_cap.font.size = Pt(10.5)
        r_cap.italic = True

    # Use Case Table
    p_th3 = doc.add_paragraph()
    p_th3.paragraph_format.space_before = Pt(10)
    p_th3.paragraph_format.space_after = Pt(4)
    r_th3 = p_th3.add_run("Table 3.1: Use Case Actor-System Interaction Matrix")
    r_th3.bold = True
    r_th3.font.size = Pt(11)

    uc_data = [
        ("Use Case ID", "Use Case Title", "Primary Actor", "Pre-conditions", "Main Success Scenario Summary"),
        ("UC-01", "User Authentication", "Admin / HR Officer", "Valid credentials in DB", "Admin enters username/password; system validates hash, creates session, and redirects to Dashboard."),
        ("UC-02", "Manage Employee Profiles", "Admin / HR Officer", "Authenticated Admin", "Admin provisions employee with designation, department, and basic salary; system generates UUID and stores record."),
        ("UC-03", "Manage Advance Loans", "Admin / HR Officer", "Active Employee exists", "Admin disburses loan; system initializes remaining balance and binds advance record to employee ID with status 'Open'."),
        ("UC-04", "Record Leaves & Deductions", "Admin / HR Officer", "Active Employee exists", "Admin logs monthly unpaid absences; system calculates prorated deduction = (Basic / 30) * Unpaid_Days."),
        ("UC-05", "Automated Payroll Batch Run", "Admin / HR Officer", "Month/Year selected", "System queries active workforce, applies advance balance & leave deductions, verifies Net >= 0, and saves run."),
        ("UC-06", "Salary Disbursal & Receipting", "Admin / Finance Officer", "Pending Payroll record", "Admin selects payment mode (NEFT/UPI/Cheque) and enters transaction reference; status transitions to 'Disbursed'."),
        ("UC-07", "Generate & Export Payslips", "Admin / Finance Officer", "Payroll record exists", "System renders branded payslip document with dual-column ledgers, QR seal, and triggers PDF download / print.")
    ]

    t_uc = doc.add_table(rows=len(uc_data), cols=5)
    t_uc.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_uc.autofit = False
    t_uc.columns[0].width = Inches(1.1)
    t_uc.columns[1].width = Inches(1.6)
    t_uc.columns[2].width = Inches(1.3)
    t_uc.columns[3].width = Inches(1.3)
    t_uc.columns[4].width = Inches(1.7)

    for r_idx, row in enumerate(uc_data):
        for c_idx, val in enumerate(row):
            cell = t_uc.cell(r_idx, c_idx)
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            if r_idx == 0:
                set_cell_background(cell, "1A365D")
                r = p.add_run(val)
                r.bold = True
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                if r_idx % 2 == 1:
                    set_cell_background(cell, "F7FAFC")
                r = p.add_run(val)
                r.font.size = Pt(8.5)
                if c_idx == 0:
                    r.bold = True

    # 3.2 FLOW CHART
    p_c3_sub2 = doc.add_paragraph()
    p_c3_sub2.paragraph_format.space_before = Pt(16)
    p_c3_sub2.paragraph_format.space_after = Pt(6)
    r_c3_s2 = p_c3_sub2.add_run("3.2 FLOW CHART")
    r_c3_s2.bold = True
    r_c3_s2.font.size = Pt(14)
    r_c3_s2.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    p_fc_desc = doc.add_paragraph()
    p_fc_desc.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_fc_desc.paragraph_format.line_spacing = 1.5
    p_fc_desc.add_run(
        "The system flowchart delineates the procedural execution logic governed by the Paytrack calculation engine during a monthly salary run. "
        "The algorithm guarantees transactional integrity by verifying that deductions do not exceed statutory limits, reconciling advance ledgers "
        "atomically, and preventing duplicate disbursement records for the same employee within the same calendar billing cycle."
    )

    # Insert Figure 3.2
    if os.path.exists('report_images/fig_3_2_flowchart.png'):
        p_img = doc.add_paragraph()
        p_img.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture('report_images/fig_3_2_flowchart.png', width=Inches(5.5))

        p_cap = doc.add_paragraph()
        p_cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        r_cap = p_cap.add_run("Figure 3.2: System Flowchart of Payroll Calculation and Disbursal Workflow")
        r_cap.bold = True
        r_cap.font.size = Pt(10.5)
        r_cap.italic = True

    p_fc_steps = doc.add_paragraph()
    p_fc_steps.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_fc_steps.paragraph_format.line_spacing = 1.5
    p_fc_steps.add_run(
        "Algorithmic Execution Pipeline for Payroll Processing:\n"
        "Step 1: Input Initialization — The administrator specifies the target calendar Month, Year, and employee scope (Individual vs Bulk Workforce).\n"
        "Step 2: Employee Profile Retrieval — The server queries the `employees` table, validating that the target employee status is 'Active' and retrieving their agreed base compensation (Basic_Salary).\n"
        "Step 3: Advance Ledger Lookup — The server queries the `advances` table for records matching `employee_id` with `status = 'Open'` and `remaining_balance > 0`. The system retrieves outstanding advance liability.\n"
        "Step 4: Unpaid Leave Computation — The engine retrieves recorded unpaid absences from the `leaves` table for the specified period and computes the deduction: Leave_Deduction = (Basic_Salary / 30) × Unpaid_Leaves.\n"
        "Step 5: Formula Evaluation — The system evaluates Net Disbursed Compensation: Net_Salary = Basic_Salary + Bonus - Advance_Deduction - Leave_Deduction - Other_Deduction.\n"
        "Step 6: Mathematical & Business Validation — The system verifies that Net_Salary is non-negative (>= 0). If negative, the batch operation aborts with a descriptive validation error.\n"
        "Step 7: Atomic Database Commit — Within a unified database transaction, the engine inserts the record into `payroll`, updates `remaining_balance` in `advances` (updating status to 'Settled' if balance reaches 0), and creates an audit entry in `activity_logs`.\n"
        "Step 8: Document Compilation — The verified payroll entry becomes immediately available for digital payslip rendering, print media emission, and spreadsheet export."
    )

    # 3.3 DATABASE SCHEMA & ENTITY-RELATIONSHIP DESIGN
    p_c3_sub3 = doc.add_paragraph()
    p_c3_sub3.paragraph_format.space_before = Pt(16)
    p_c3_sub3.paragraph_format.space_after = Pt(6)
    r_c3_s3 = p_c3_sub3.add_run("3.3 DATABASE SCHEMA & ENTITY-RELATIONSHIP DESIGN")
    r_c3_s3.bold = True
    r_c3_s3.font.size = Pt(14)
    r_c3_s3.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    p_er_desc = doc.add_paragraph()
    p_er_desc.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_er_desc.paragraph_format.line_spacing = 1.5
    p_er_desc.add_run(
        "The relational database schema is normalized to Third Normal Form (3NF) to eliminate data redundancy, prevent update anomalies, "
        "and maintain referential integrity across the system lifecycle. The central parent entity is `employees`, which forms one-to-many "
        "(1 : N) relational foreign key associations with `advances`, `leaves`, and `payroll` tables, configured with cascading deletion rules."
    )

    # Insert Figure 3.3
    if os.path.exists('report_images/fig_3_3_er_diagram.png'):
        p_img = doc.add_paragraph()
        p_img.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture('report_images/fig_3_3_er_diagram.png', width=Inches(6.0))

        p_cap = doc.add_paragraph()
        p_cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        r_cap = p_cap.add_run("Figure 3.3: Database Entity-Relationship (ER) Diagram of Paytrack Database")
        r_cap.bold = True
        r_cap.font.size = Pt(10.5)
        r_cap.italic = True

    # Table Schema Dictionaries
    p_sch_title = doc.add_paragraph()
    p_sch_title.paragraph_format.space_before = Pt(8)
    p_sch_title.paragraph_format.space_after = Pt(4)
    r_st = p_sch_title.add_run("Table 3.2: Database Data Dictionary — `employees` Entity")
    r_st.bold = True
    r_st.font.size = Pt(11)

    emp_schema = [
        ("Column Name", "Data Type", "Constraints", "Description"),
        ("id", "TEXT", "PRIMARY KEY", "Unique alphanumeric employee identifier (e.g. emp_k8j3x)"),
        ("name", "TEXT", "NOT NULL", "Full legal name of the employee"),
        ("email", "TEXT", "NULLABLE", "Official corporate email address for correspondence"),
        ("mobile", "TEXT", "NULLABLE", "Contact mobile telephone number"),
        ("department", "TEXT", "NOT NULL", "Assigned corporate department (Engineering, Sales, etc.)"),
        ("designation", "TEXT", "NOT NULL", "Corporate position / job designation title"),
        ("joining_date", "TEXT", "NOT NULL", "ISO date string representing date of corporate joining"),
        ("basic_salary", "REAL", "NOT NULL, DEFAULT 0", "Agreed monthly base salary compensation"),
        ("status", "TEXT", "DEFAULT 'Active'", "Employment status flag ('Active' or 'Inactive')"),
        ("address", "TEXT", "NULLABLE", "Residential or official postal address"),
        ("avatar_color", "TEXT", "NULLABLE", "Hexadecimal theme accent color for UI card display"),
        ("created_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Database record creation timestamp")
    ]

    t_emp = doc.add_table(rows=len(emp_schema), cols=4)
    t_emp.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_emp.autofit = False
    t_emp.columns[0].width = Inches(1.5)
    t_emp.columns[1].width = Inches(1.1)
    t_emp.columns[2].width = Inches(1.8)
    t_emp.columns[3].width = Inches(2.6)

    for r_idx, row in enumerate(emp_schema):
        for c_idx, val in enumerate(row):
            cell = t_emp.cell(r_idx, c_idx)
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            if r_idx == 0:
                set_cell_background(cell, "1A365D")
                r = p.add_run(val)
                r.bold = True
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                if r_idx % 2 == 1:
                    set_cell_background(cell, "F7FAFC")
                r = p.add_run(val)
                r.font.size = Pt(8.5)
                if c_idx == 0:
                    r.bold = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # 4.0 SYSTEM IMPLEMENTATION
    # -------------------------------------------------------------
    p_c4_h = doc.add_paragraph()
    p_c4_h.paragraph_format.space_before = Pt(16)
    p_c4_h.paragraph_format.space_after = Pt(10)
    r_c4 = p_c4_h.add_run("4.0 SYSTEM IMPLEMENTATION")
    r_c4.bold = True
    r_c4.font.size = Pt(16)
    r_c4.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    p_c4_intro = doc.add_paragraph()
    p_c4_intro.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c4_intro.paragraph_format.line_spacing = 1.5
    p_c4_intro.add_run(
        "System implementation covers the technical translation of architectural models into executable full-stack software code. "
        "Paytrack is implemented using an asynchronous, event-driven Node.js and Express.js backend coupled with a modern, responsive "
        "vanilla JavaScript client-side application. This section delineates the core modular breakdown, deep module implementation "
        "mechanisms, RESTful endpoint architectures, and user interface implementations."
    )

    # 4.1 LIST OF MODULES
    p_c4_sub1 = doc.add_paragraph()
    p_c4_sub1.paragraph_format.space_before = Pt(14)
    p_c4_sub1.paragraph_format.space_after = Pt(6)
    r_c4_s1 = p_c4_sub1.add_run("4.1 LIST OF MODULES")
    r_c4_s1.bold = True
    r_c4_s1.font.size = Pt(14)
    r_c4_s1.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    p_mod_list = doc.add_paragraph()
    p_mod_list.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_mod_list.paragraph_format.line_spacing = 1.5
    p_mod_list.add_run(
        "The Paytrack enterprise architecture is decomposed into eight cohesive, independently testable functional modules:\n\n"
        "1. Module 1: Authentication & Access Control Subsystem\n"
        "2. Module 2: Workforce Information & Employee Lifecycle Management Module\n"
        "3. Module 3: Salary Advance & Loan Ledger Subsystem\n"
        "4. Module 4: Attendance Tracking & Leave Deduction Engine\n"
        "5. Module 5: Automated Payroll Computation & Bulk Disbursal Engine\n"
        "6. Module 6: Executive Digital Payslip & QR Verification Generator\n"
        "7. Module 7: Interactive Financial Analytics & Executive KPI Dashboard\n"
        "8. Module 8: Security Audit Logging & System Configuration Subsystem"
    )

    # 4.2 MODULE DESCRIPTION
    p_c4_sub2 = doc.add_paragraph()
    p_c4_sub2.paragraph_format.space_before = Pt(14)
    p_c4_sub2.paragraph_format.space_after = Pt(6)
    r_c4_s2 = p_c4_sub2.add_run("4.2 MODULE DESCRIPTION")
    r_c4_s2.bold = True
    r_c4_s2.font.size = Pt(14)
    r_c4_s2.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    p_mod_desc = doc.add_paragraph()
    p_mod_desc.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_mod_desc.paragraph_format.line_spacing = 1.5
    p_mod_desc.add_run(
        "• Module 1: Authentication & Access Control Subsystem — Manages administrator session initialization, credential verification "
        "against the SQLite3 database, and security header controls. Upon successful authentication, user identity tokens are maintained within "
        "browser storage, gating access to sensitive payroll operations. Password updates are protected through mandatory current-password validation.\n\n"
        "• Module 2: Workforce Information & Employee Lifecycle Management — Provides comprehensive CRUD capabilities for corporate personnel. "
        "The module supports live dynamic filtering across departmental pills (Engineering, Design, Marketing, Sales, HR, Finance, Operations) "
        "and instantaneous full-text search across employee names, email addresses, phone numbers, and designations. It supports dual viewing modes: "
        "a compact tabular Data Grid and an interactive Visual Avatar Card Grid.\n\n"
        "• Module 3: Salary Advance & Loan Ledger Subsystem — Governs employee advance requests, tracking disbursed capital, reason for advance, "
        "and amortized remaining balances. The system renders dynamic CSS progress bars showing debt liquidation percentage and automatically "
        "surfaces outstanding advance obligations during payroll calculation, preventing financial write-offs.\n\n"
        "• Module 4: Attendance Tracking & Leave Deduction Engine — Normalizes monthly attendance into paid allowances and unpaid absences. "
        "The calculation engine automatically computes monetary leave deductions based on exact employee daily earnings rates, applying the "
        "formulaic standard: Leave Deduction = (Basic Salary / 30) × Unpaid Leave Days.\n\n"
        "• Module 5: Automated Payroll Computation & Bulk Disbursal Engine — Serves as the core arithmetic clearinghouse. Administrators can "
        "execute real-time calculation previews or generate full batch runs for all active personnel simultaneously. Once processed, salaries "
        "transition through lifecycle states ('Pending' to 'Disbursed') upon logging payment modes (NEFT, IMPS, UPI, Cheque, Cash) and transaction reference codes.\n\n"
        "• Module 6: Executive Digital Payslip & QR Verification Generator — Dynamically synthesizes high-fidelity compensation statements featuring "
        "corporate branding, GSTIN/tax credentials, dual-column earnings-versus-deductions breakdown, and embedded QR verification seals. "
        "Leveraging client-side jsPDF and CSS @media print styling, users can print or download vector-perfect PDF documents with a single click.\n\n"
        "• Module 7: Interactive Financial Analytics & Executive Dashboard — Renders high-level corporate KPI metric cards (Total Workforce, "
        "Monthly Gross Disbursal, Active Advance Liability, and Pending Disbursal Counts) coupled with responsive Chart.js visual charts "
        "illustrating expenditure trends over trailing billing cycles and departmental headcount-cost donut distributions.\n\n"
        "• Module 8: Security Audit Logging & System Configuration — Maintains an append-only audit trail in the `activity_logs` table, "
        "recording the exact timestamp, action type, description, and administrator ID for every critical mutation. Additionally, it permits "
        "dynamic customization of corporate metadata (Company Name, Tax ID, Address, Currency Symbol, and Authorized Signatory Title)."
    )

    # REST API Table
    p_th4 = doc.add_paragraph()
    p_th4.paragraph_format.space_before = Pt(12)
    p_th4.paragraph_format.space_after = Pt(4)
    r_th4 = p_th4.add_run("Table 4.1: Comprehensive REST API Endpoint Reference")
    r_th4.bold = True
    r_th4.font.size = Pt(11)

    api_data = [
        ("HTTP Method", "API Route Endpoint", "Request Body / Params", "Success Code", "Operational Function"),
        ("POST", "/api/auth/login", "{ username, password }", "200 OK", "Authenticates administrator and initializes session"),
        ("GET", "/api/dashboard/stats", "None (Query params)", "200 OK", "Fetches KPI metrics, monthly trend charts, & activity feed"),
        ("GET", "/api/employees", "search, dept, status", "200 OK", "Lists employee workforce with real-time query filters"),
        ("POST", "/api/employees", "{ name, dept, salary... }", "201 Created", "Creates new employee profile in database"),
        ("PUT", "/api/employees/:id", "{ name, dept, salary... }", "200 OK", "Updates existing employee information"),
        ("DELETE", "/api/employees/:id", "URL id parameter", "200 OK", "Cascading deletion of employee and bound records"),
        ("GET", "/api/advances", "None", "200 OK", "Lists advance loans and debt amortization progress"),
        ("POST", "/api/advances", "{ employee_id, amount... }", "201 Created", "Disburses new salary advance and logs balance"),
        ("GET", "/api/leaves", "month, year", "200 OK", "Retrieves employee monthly attendance and deductions"),
        ("POST", "/api/leaves", "{ employee_id, unpaid... }", "201 Created", "Records leave entry and applies deduction formula"),
        ("POST", "/api/payroll/calculate-preview", "{ employee_id, bonus... }", "200 OK", "Executes live arithmetic computation preview"),
        ("POST", "/api/payroll/generate", "{ employee_id, month... }", "201 Created", "Generates and commits individualized salary run"),
        ("POST", "/api/payroll/generate-all", "{ month, year }", "201 Created", "Executes bulk batch payroll generation for all active staff"),
        ("PUT", "/api/payroll/:id/pay", "{ method, ref, date }", "200 OK", "Transitions status to 'Disbursed' with payment details"),
        ("GET", "/api/payroll/:id/payslip", "URL id parameter", "200 OK", "Returns complete payslip and corporate profile data"),
        ("GET", "/api/reports", "month, year", "200 OK", "Compiles comprehensive financial payroll summary report"),
        ("GET", "/api/logs", "limit", "200 OK", "Retrieves chronological security and activity audit records")
    ]

    t_api = doc.add_table(rows=len(api_data), cols=5)
    t_api.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_api.autofit = False
    t_api.columns[0].width = Inches(1.1)
    t_api.columns[1].width = Inches(2.1)
    t_api.columns[2].width = Inches(1.4)
    t_api.columns[3].width = Inches(1.0)
    t_api.columns[4].width = Inches(1.4)

    for r_idx, row in enumerate(api_data):
        for c_idx, val in enumerate(row):
            cell = t_api.cell(r_idx, c_idx)
            set_cell_margins(cell, top=60, bottom=60, left=70, right=70)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            if r_idx == 0:
                set_cell_background(cell, "1A365D")
                r = p.add_run(val)
                r.bold = True
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                if r_idx % 2 == 1:
                    set_cell_background(cell, "F7FAFC")
                r = p.add_run(val)
                r.font.size = Pt(8)
                if c_idx == 0:
                    r.bold = True

    # 4.3 USER INTERFACE
    p_c4_sub3 = doc.add_paragraph()
    p_c4_sub3.paragraph_format.space_before = Pt(16)
    p_c4_sub3.paragraph_format.space_after = Pt(6)
    r_c4_s3 = p_c4_sub3.add_run("4.3 USER INTERFACE")
    r_c4_s3.bold = True
    r_c4_s3.font.size = Pt(14)
    r_c4_s3.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    p_ui_desc = doc.add_paragraph()
    p_ui_desc.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ui_desc.paragraph_format.line_spacing = 1.5
    p_ui_desc.add_run(
        "The Paytrack user interface is built on a responsive modern design system incorporating modern glassmorphism, CSS Custom Properties, "
        "and fluid layout grids. The UI provides a high-contrast dark theme by default, with an instant one-click toggle to a clean light theme "
        "persisted in local browser storage. The following figures present the operational interfaces of the application:"
    )

    # Insert Figure 4.1
    if os.path.exists('report_images/fig_4_1_ui_dashboard.png'):
        p_img = doc.add_paragraph()
        p_img.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture('report_images/fig_4_1_ui_dashboard.png', width=Inches(5.8))

        p_cap = doc.add_paragraph()
        p_cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(12)
        r_cap = p_cap.add_run("Figure 4.1: Paytrack Interactive Dashboard and Real-Time Financial Analytics UI")
        r_cap.bold = True
        r_cap.font.size = Pt(10.5)
        r_cap.italic = True

    # Insert Figure 4.2
    if os.path.exists('report_images/fig_4_2_ui_directory.png'):
        p_img = doc.add_paragraph()
        p_img.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture('report_images/fig_4_2_ui_directory.png', width=Inches(5.8))

        p_cap = doc.add_paragraph()
        p_cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(12)
        r_cap = p_cap.add_run("Figure 4.2: Workforce Directory and Employee Lifecycle Management Interface")
        r_cap.bold = True
        r_cap.font.size = Pt(10.5)
        r_cap.italic = True

    # Insert Figure 4.3
    if os.path.exists('report_images/fig_4_3_ui_payroll.png'):
        p_img = doc.add_paragraph()
        p_img.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture('report_images/fig_4_3_ui_payroll.png', width=Inches(5.8))

        p_cap = doc.add_paragraph()
        p_cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(12)
        r_cap = p_cap.add_run("Figure 4.3: Automated Payroll Batch Processing and Disbursal Interface")
        r_cap.bold = True
        r_cap.font.size = Pt(10.5)
        r_cap.italic = True

    # Insert Figure 4.4
    if os.path.exists('report_images/fig_4_4_ui_payslip.png'):
        p_img = doc.add_paragraph()
        p_img.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture('report_images/fig_4_4_ui_payslip.png', width=Inches(5.5))

        p_cap = doc.add_paragraph()
        p_cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        r_cap = p_cap.add_run("Figure 4.4: Executive Payslip Document with QR Verification Seal and Dual Ledger")
        r_cap.bold = True
        r_cap.font.size = Pt(10.5)
        r_cap.italic = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # 5.0 CONCLUSION
    # -------------------------------------------------------------
    p_c5_h = doc.add_paragraph()
    p_c5_h.paragraph_format.space_before = Pt(16)
    p_c5_h.paragraph_format.space_after = Pt(10)
    r_c5 = p_c5_h.add_run("5.0 CONCLUSION")
    r_c5.bold = True
    r_c5.font.size = Pt(16)
    r_c5.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    p_c5_body1 = doc.add_paragraph()
    p_c5_body1.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c5_body1.paragraph_format.line_spacing = 1.5
    p_c5_body1.add_run(
        "The Paytrack Full-Stack Salary & Payroll Management System successfully demonstrates how modern web engineering standards can "
        "transform traditional, error-prone manual compensation ledgers into a secure, automated, and real-time enterprise workflow. "
        "By coupling an agile vanilla JavaScript Single Page Application with an event-driven Node.js and Express.js RESTful backend and a "
        "high-concurrency SQLite3 database operating in Write-Ahead Logging mode, the project achieves exceptional operational performance, "
        "sub-millisecond data transactions, and robust data integrity."
    )

    p_c5_body2 = doc.add_paragraph()
    p_c5_body2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c5_body2.paragraph_format.line_spacing = 1.5
    p_c5_body2.add_run(
        "The platform effectively solves core business bottlenecks by automating complex mathematical calculations—including prorated unpaid leave "
        "deductions and multi-month advance debt amortizations—while eliminating human computational mistakes. Furthermore, executive decision-making "
        "is strengthened through interactive Chart.js analytics, instantaneous spreadsheet export capabilities via SheetJS, verifiable vector PDF payslip "
        "compilations with QR security seals, and non-repudiable audit logging."
    )

    p_c5_fut_title = doc.add_paragraph()
    p_c5_fut_title.paragraph_format.space_before = Pt(12)
    p_c5_fut_title.paragraph_format.space_after = Pt(4)
    r_fut = p_c5_fut_title.add_run("5.1 FUTURE ENHANCEMENTS")
    r_fut.bold = True
    r_fut.font.size = Pt(13)
    r_fut.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    p_c5_future = doc.add_paragraph()
    p_c5_future.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c5_future.paragraph_format.line_spacing = 1.5
    p_c5_future.add_run(
        "While the current release of Paytrack provides an exhaustive feature set for small-to-medium enterprise administration, future research "
        "and development will focus on the following strategic extensions:\n"
        "1. Biometric IoT & Attendance Sensor Streaming: Integrating direct hardware telemetry protocols (MQTT / WebSockets) to capture real-time biometric fingerprint and facial recognition time-clock events without manual monthly leave entry.\n"
        "2. Employee Self-Service Mobile Application: Developing a progressive web app (PWA) or native React Native / Flutter client allowing individual employees to submit leave applications, request salary advances, and download personal payslips securely.\n"
        "3. Statutory Tax Filing & Regulatory Compliance Engine: Incorporating automated jurisdiction-specific tax computation algorithms (such as TDS under the Indian Income Tax Act, Provident Fund / ESI calculations, or US W-2/1099 compliance).\n"
        "4. Direct Banking Gateway API Integration: Connecting automated payment clearinghouse APIs (RazorpayX, Stripe Treasury, or NACH clearing) for instantaneous one-click bank account crediting directly from the disbursal modal."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # 6.0 REFERENCES
    # -------------------------------------------------------------
    p_c6_h = doc.add_paragraph()
    p_c6_h.paragraph_format.space_before = Pt(16)
    p_c6_h.paragraph_format.space_after = Pt(10)
    r_c6 = p_c6_h.add_run("6.0 REFERENCES")
    r_c6.bold = True
    r_c6.font.size = Pt(16)
    r_c6.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    references = [
        "[1] M. Haverbeke, Eloquent JavaScript: A Modern Introduction to Programming, 3rd ed. San Francisco, CA: No Starch Press, 2018.",
        "[2] E. Brown, Web Development with Node and Express: Leveraging the JavaScript Stack, 2nd ed. Sebastopol, CA: O'Reilly Media, 2019.",
        "[3] D. Flanagan, JavaScript: The Definitive Guide: Master the World's Most-Used Programming Language, 7th ed. O'Reilly Media, 2020.",
        "[4] R. Fielding, \"Architectural Styles and the Design of Network-based Software Architectures,\" Ph.D. dissertation, Dept. Inf. Comput. Sci., Univ. California, Irvine, CA, 2000.",
        "[5] D. R. Hipp, \"SQLite: Small. Fast. Reliable. Choose any three,\" SQLite Consortium Documentation, 2024. [Online]. Available: https://www.sqlite.org.",
        "[6] J. Long, better-sqlite3: The fastest and simplest library for SQLite3 in Node.js, GitHub Repository, 2024. [Online]. Available: https://github.com/WiseLibs/better-sqlite3.",
        "[7] Chart.js Documentation, \"Simple yet flexible JavaScript charting library for designers & developers,\" Chart.js Consortium, 2024. [Online]. Available: https://www.chartjs.org.",
        "[8] J. Mrkvicka and J. Owens, jsPDF: Client-side JavaScript PDF generation, Parallax Inc., 2024. [Online]. Available: https://github.com/parallax/jsPDF.",
        "[9] SheetJS LLC, \"SheetJS Community Edition: Spreadsheet Data Toolkit,\" 2024. [Online]. Available: https://sheetjs.com.",
        "[10] W3C, \"CSS Flexible Box Layout Module Level 1 & CSS Grid Layout Module Level 2,\" World Wide Web Consortium (W3C) Recommendations, 2023.",
        "[11] IEEE Standards Association, \"IEEE Standard for System and Software Engineering - Software Life Cycle Processes,\" IEEE Std 12207-2017, pp. 1-138, 2017.",
        "[12] R. Pressman and B. Maxim, Software Engineering: A Practitioner's Approach, 9th ed. New York, NY: McGraw-Hill Education, 2020."
    ]

    for ref in references:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_ref.paragraph_format.line_spacing = 1.5
        p_ref.paragraph_format.space_after = Pt(8)
        p_ref.add_run(ref)

    output_path = r"C:\SEM 5\FSD_PROJECT_dir\Paytrack_FSD_Project_Report.docx"
    doc.save(output_path)
    print(f"Project report successfully written to {output_path}!")

if __name__ == '__main__':
    create_report()

