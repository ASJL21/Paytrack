# PAYTRACK: MODERN FULL-STACK SALARY & PAYROLL MANAGEMENT SYSTEM

**A CASE STUDY PROJECT REPORT**  
*Submitted in partial fulfillment of the requirements for the award of the degree of*  
**BACHELOR OF TECHNOLOGY IN COMPUTER SCIENCE AND ENGINEERING**  
**Course:** Full Stack Development (FSD) — Semester V | **Academic Year:** 2026 – 2027  
**Case Study Report:** 1 Copy per Batch  

---

## TABLE OF CONTENTS

- **ABSTRACT**
- **1.0 INTRODUCTION**
  - 1.1 Project Aim and Objective
  - 1.2 Scope
- **2.0 SYSTEM ANALYSIS**
  - 2.1 Software Requirement Specification
  - 2.2 System Description
  - 2.3 Software and Hardware Used
- **3.0 SYSTEM DESIGN**
  - 3.1 UML – Use Case Diagram of Functionality
  - 3.2 Flow Chart
  - 3.3 Database Schema & Entity-Relationship Design
- **4.0 SYSTEM IMPLEMENTATION**
  - 4.1 List of Modules
  - 4.2 Module Description
  - 4.3 User Interface
- **5.0 CONCLUSION**
  - 5.1 Project Summary
  - 5.2 Future Enhancements
- **6.0 REFERENCES**

---

## ABSTRACT

<div align="justify">
Paytrack is an enterprise-grade, full-stack salary and payroll management web application engineered to automate workforce compensation workflows, minimize human accounting discrepancies, and provide real-time corporate financial visibility. Developed utilizing a modern three-tier architecture comprising an HTML5/CSS3 glassmorphic presentation layer, a resilient Node.js and Express.js RESTful application server, and a high-performance SQLite3 relational database with write-ahead logging, the platform centralizes core human resource operations. Key capabilities include comprehensive employee lifecycle management, automated salary advance and loan ledger reconciliation, attendance-driven unpaid leave deduction computation, single and batch payroll processing, dynamic salary slips with verifiable QR security seals, and export utilities supporting PDF and Excel formats. Furthermore, the system incorporates interactive visual analytics powered by Chart.js, dual-theme dark and light mode persistence, an instant salary arithmetic calculator, and tamper-resistant administrative audit logging to deliver a unified, compliant, and scalable enterprise payroll solution.
</div>

**Keywords:** Full-Stack Development, Payroll Automation, Node.js, Express.js, SQLite3, Salary Ledger, Attendance Deductions, Glassmorphism UI, Payslip Generation, RESTful API.

---

## 1.0 INTRODUCTION

In modern commercial enterprises and institutional organizations, compensation disbursement and human resource accounting represent core operational pillars that directly govern employee satisfaction, organizational morale, and financial audit compliance. Historically, small-to-medium enterprises (SMEs) and growing corporations relied upon manual book-keeping techniques or decoupled desktop spreadsheets to compute monthly salaries, log advance requests, track unpaid absences, and issue compensation vouchers. However, as organizational structures scale and departmental specializations proliferate, manual spreadsheet workflows become inherently prone to mathematical formula errors, unauthorized ledger tampering, accidental data overwrite, lack of concurrency control, and tedious reconciliation delays.

Furthermore, contemporary fiscal management demands agile, transparent, and multi-channel audit trails. Enterprise accounting officers require instantaneous visibility into monthly aggregate payroll liability, departmental resource expenditures, outstanding loan and salary advance balances, and granular per-employee earnings breakdowns. The rapid evolution of full-stack web engineering—characterized by decoupled client-server architectures, RESTful communication protocols, high-concurrency event-driven backends, and lightweight embedded relational databases—offers an ideal technological paradigm to resolve these challenges. The Paytrack system is conceived and realized within this modern web engineering context, delivering a unified digital platform that automates the complete payroll lifecycle from employee onboarding to electronic payslip generation.

### 1.1 PROJECT AIM AND OBJECTIVE

<div align="justify">
The primary aim of this project is to architect and deploy a robust, secure, and automated full-stack payroll management system that eliminates manual computational inefficiencies in corporate compensation workflows. Its key objectives comprise developing an intuitive workforce directory, automating dynamic net salary calculations integrating advance loans and leave deductions, providing verifiable digital payslips, and delivering interactive financial analytics to enhance operational transparency and fiscal governance.
</div>

To accomplish this comprehensive aim, the project formulates the following tangible technical objectives:
1. **Real-Time Full-Stack Architecture:** Construct an end-to-end web system utilizing HTML5, modern CSS3 Glassmorphism, vanilla JavaScript ES6+, Express.js, and SQLite3 to guarantee instantaneous responsiveness without heavyweight runtime dependencies.
2. **Automated Deduction Engine:** Formulate algorithmic services that automatically retrieve outstanding employee advances and calculate pro-rated unpaid leave deductions based on exact per-day rates, seamlessly deducting them during monthly batch generation.
3. **Multi-Channel Disbursal & Compliance:** Integrate multi-modal disbursement classification (NEFT, IMPS, UPI, Cheque, Cash) alongside verified corporate payslips styled with dynamic dual-column earnings-versus-deductions breakdowns and embedded QR verification seals.
4. **Visual Analytics & Reporting:** Implement real-time dashboard visualizations featuring Chart.js bar and donut charts, automated audit trail logging, and one-click export utilities to standard Microsoft Excel (.xlsx) and printable PDF documents.

### 1.2 SCOPE

The functional and technical scope of the Paytrack system spans organizational compensation administration across diverse commercial, educational, and technological enterprises. The system addresses the needs of multiple administrative stakeholders including Human Resources (HR) Executives, Payroll Officers, Finance Directors, and System Administrators:
- **Workforce Lifecycle Management:** Comprehensive recording, updating, search-filtering, and soft/hard lifecycle tracking of corporate personnel across distinct corporate departments.
- **Advance & Loan Ledger Reconciliation:** Real-time issuance of short-term employee financial advances, multi-month repayment scheduling, automated remaining balance tracking, and auto-settlement during payroll batch execution.
- **Attendance & Absence Compensation Processing:** Standardized recording of monthly paid and unpaid leaves, dynamic computation of per-day salary deductibles utilizing normalized 30-day corporate calendar metrics, and automatic ledger adjustments.
- **Single & Batch Payroll Generation:** Flexible processing engines capable of computing compensation on an individualized single-employee basis or across the entire active workforce simultaneously with transactional atomicity.
- **Audit Trails & System Configuration:** Persistent logging of every administrative action, coupled with customizable company profiles, authorized signatory details, and credential management.

---

## 2.0 SYSTEM ANALYSIS

### 2.1 SOFTWARE REQUIREMENT SPECIFICATION

<div align="justify">
The software requirement specification delineates the functional, computational, and technical criteria essential for deploying the Paytrack payroll application across modern distributed environments. The application mandates a responsive cross-browser web interface capable of executing administrative workforce operations, role-based authentication, and live mathematical salary computations without client-side latency. Core system specifications encompass persistent employee record storage, multi-factor advance repayment tracking, automated prorated leave deduction algorithms, and transactional payroll batch generation with foreign key referential integrity. On the architectural plane, the system requires an event-driven Node.js execution runtime, an Express.js middleware framework handling RESTful JSON payloads, and an ACID-compliant SQLite3 database operating in write-ahead logging mode for resilient concurrent transactions. Security requirements dictate strict input sanitization, HTTP request logging via Morgan, protected administrative endpoints, and tamper-evident audit trails for financial accountability. Finally, document rendering capabilities must support client-side vector payslip generation via jsPDF, high-fidelity browser print media styling, and structured spreadsheet serialization through SheetJS.
</div>

#### Functional Requirements (FR)
- **FR-01 (Authentication & Session Management):** Validate administrator credentials, maintain secure session tokens, and control authorized mutations.
- **FR-02 (Workforce Directory & Profile CRUD):** Persistent storage and dynamic retrieval of employee profiles with department tags and basic salaries.
- **FR-03 (Salary Advance Ledger):** Maintain open and settled loan advances, track remaining balances, and trigger auto-deductions.
- **FR-04 (Leave & Deduction Engine):** Calculate unpaid absence penalties using: $\text{Leave Deduction} = \frac{\text{Basic Salary}}{30} \times \text{Unpaid Days}$.
- **FR-05 (Payroll Arithmetic Computation):** Compute Net Disbursed Salary: $\text{Net} = \text{Basic} + \text{Bonus} - \text{Advance Deduction} - \text{Leave Deduction} - \text{Other Deduction}$.
- **FR-06 (Batch Processing):** Execute atomic monthly salary generation for all active employees without redundant database writes.
- **FR-07 (Payslip Synthesis & Export):** Produce executive dual-column payslips with QR codes, print styling, and PDF/Excel downloads.
- **FR-08 (Visual Analytics):** Render real-time financial KPI cards and Chart.js distribution charts.

---

## 3.0 SYSTEM DESIGN

### 3.1 UML – USE CASE DIAGRAM OF FUNCTIONALITY
The UML Use Case model formalizes the operational boundaries between actors (Admin / HR Officer and Finance Auditor) and system use cases (UC1 to UC7).

*(See Figure 3.1 below)*

```
[System Admin / HR] ---> (UC1: Secure User Authentication & Login)
                    ---> (UC2: Manage Employee Profiles - CRUD)
                    ---> (UC3: Manage Advances & Loan Ledgers)
                    ---> (UC4: Record Leaves & Track Attendance)
                    ---> (UC5: Execute Automated Payroll Processing) <--- [Finance Auditor]
                    ---> (UC6: Generate & Export Payslips - PDF/Print) <--- [Finance Auditor]
                    ---> (UC7: View Analytics & Financial Reports)     <--- [Finance Auditor]
```

### 3.2 FLOW CHART
The system flowchart illustrates the algorithmic sequence followed during payroll computation and transactional reconciliation:
1. **Initialize Run:** Admin specifies billing Month and Year.
2. **Employee Retrieval:** Query active employees from `employees` table.
3. **Advance Reconciliation:** Retrieve outstanding liability where `status = 'Open'` and `remaining_balance > 0`.
4. **Attendance Calculation:** Compute unpaid absence deduction pro-rated to basic daily rate.
5. **Net Evaluation:** Compute $\text{Net} = \text{Basic} + \text{Bonus} - \text{Adv Ded} - \text{Leave Ded} - \text{Other Ded}$.
6. **Validation:** Check if $\text{Net} \ge 0$.
7. **Atomic Commit:** Save `payroll` record, update `advances`, log activity in `activity_logs`.
8. **Document Ready:** Render verified executive payslip.

---

## 4.0 SYSTEM IMPLEMENTATION

### 4.1 LIST OF MODULES
1. **Authentication & Access Control Subsystem**
2. **Workforce Information & Employee Lifecycle Management Module**
3. **Salary Advance & Loan Ledger Subsystem**
4. **Attendance Tracking & Leave Deduction Engine**
5. **Automated Payroll Computation & Bulk Disbursal Engine**
6. **Executive Digital Payslip & QR Verification Generator**
7. **Interactive Financial Analytics & Executive KPI Dashboard**
8. **Security Audit Logging & System Configuration Subsystem**

---

## 5.0 CONCLUSION

The Paytrack Full-Stack Salary & Payroll Management System successfully demonstrates how modern web engineering standards can transform traditional, error-prone manual compensation ledgers into a secure, automated, and real-time enterprise workflow.

---

## 6.0 REFERENCES

1. M. Haverbeke, *Eloquent JavaScript: A Modern Introduction to Programming*, 3rd ed. No Starch Press, 2018.
2. E. Brown, *Web Development with Node and Express: Leveraging the JavaScript Stack*, 2nd ed. O'Reilly Media, 2019.
3. D. Flanagan, *JavaScript: The Definitive Guide*, 7th ed. O'Reilly Media, 2020.
4. R. Fielding, "Architectural Styles and the Design of Network-based Software Architectures," Ph.D. dissertation, UC Irvine, 2000.
5. D. R. Hipp, "SQLite: Small. Fast. Reliable. Choose any three," SQLite Consortium, 2024.
6. J. Long, *better-sqlite3: The fastest and simplest library for SQLite3 in Node.js*, 2024.
7. Chart.js Documentation, *Chart.js: Simple yet flexible JavaScript charting*, 2024.
8. IEEE Standards Association, "IEEE Standard for System and Software Engineering," IEEE Std 12207-2017, 2017.

