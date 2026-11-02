# Paytrack — Modern Full-Stack Salary & Payroll Management System

An enterprise-grade, full-stack salary and payroll management web application built with **HTML5, Modern CSS3 Design System, Vanilla JavaScript, Node.js, Express, and SQLite3**.

---

## 🌟 Key Features

### 🎨 Modern Frontend UI/UX Design System
- **Dark & Light Mode Switcher**: Seamless theme toggling with persistent user preference stored in `localStorage`.
- **Glassmorphism & Micro-animations**: Modern backdrop blur, layered shadows, fluid gradients, and card entrance transitions.
- **Interactive Analytics (Chart.js)**:
  - Monthly Payroll Expenditure Bar chart (Paid vs Pending disbursals).
  - Department Headcount & Cost Donut chart.
- **Workforce Directory**:
  - Live search with instant filtering by name, email, mobile, or designation.
  - Department filter pills (*Engineering, Product & Design, Marketing, Sales, HR, Finance, Operations*).
  - Switchable view: **Modern Data Grid Table** or **Visual Avatar Employee Cards Grid**.
  - Detailed Employee Profile modal with active advance tracker and historical payroll records.
- **Advance Salary & Loan Tracker**:
  - Repayment progress bars for active debtors.
  - Automatic advance reconciliation during payroll generation.
- **Attendance & Leave Deductions**:
  - Unpaid absence calculation based on employee per-day salary rate `(Basic / 30) * Unpaid Days`.
- **Payroll Arithmetic Engine**:
  - Single & Bulk monthly salary batch generation.
  - Live arithmetic breakdown preview: `Basic + Bonus - Advance Ded - Leave Ded - Other Ded = Net Disbursed`.
  - 1-Click "Disburse Salary" modal with NEFT, IMPS, UPI, Cheque, and Cash voucher support.
- **Executive Payslip Documents**:
  - Company branding, Tax/GSTIN details, dual-column Earnings vs Deductions table.
  - QR verification seal, Net Disbursed callout, and Authorised Signature block.
  - 1-Click **Browser Print** (`@media print` styled) and **Official PDF Download** via jsPDF.
- **Reports & Export**:
  - Export to Excel (`.xlsx` format using SheetJS).
  - Export to PDF (jsPDF Landscape summary report).
- **Quick Salary Calculator**:
  - Floating instant calculator modal accessible from the top header anytime.
- **Toast Notifications**:
  - Non-intrusive alert toasts with animated status indicators.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Full-Stack Server
```bash
npm start
```
*Or for automatic restart on file changes:*
```bash
npm run dev
```

### 3. Open in Browser
Open [http://localhost:5000](http://localhost:5000) in your web browser.

---

## 🔐 Default Credentials

| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` | `admin123` | Super Admin |

*(You can customize admin credentials and company profile anytime from the Settings tab in the application).*

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Modern CSS3 (Custom Properties & Glassmorphism), Vanilla JavaScript ES6+, Chart.js, jsPDF, SheetJS (XLSX).
- **Backend**: Node.js, Express.js REST API, Morgan HTTP Logger, CORS.
- **Database**: SQLite3 via `better-sqlite3` with foreign key constraints, WAL mode, and auto-seeding.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user and initialize session |
| `GET` | `/api/dashboard/stats` | KPI metrics, monthly trend charts & activity feed |
| `GET` | `/api/employees` | List employees with search, department & status filters |
| `POST` | `/api/employees` | Create new employee profile |
| `PUT` | `/api/employees/:id` | Update employee information |
| `DELETE` | `/api/employees/:id` | Delete employee and cascade records |
| `GET` | `/api/advances` | List advance records with balance progress |
| `POST` | `/api/advances` | Disburse new salary advance |
| `GET` | `/api/leaves` | List monthly employee leaves and deductions |
| `POST` | `/api/leaves` | Record employee leave entry |
| `GET` | `/api/payroll` | List payroll runs |
| `POST` | `/api/payroll/calculate-preview` | Live arithmetic formula computation preview |
| `POST` | `/api/payroll/generate` | Generate salary with automatic advance & leave deduction |
| `POST` | `/api/payroll/generate-all` | Bulk generate salaries for all active employees |
| `PUT` | `/api/payroll/:id/pay` | Mark salary as Disbursed (Paid) with payment details |
| `GET` | `/api/payroll/:id/payslip` | Retrieve full payslip and company data for an employee |
| `GET` | `/api/reports` | Financial report data with summary totals |
| `GET` | `/api/logs` | Security and activity audit trail |
| `PUT` | `/api/settings` | Update company profile details |
| `POST` | `/api/settings/reset-demo` | Restore default demo workforce and records |
