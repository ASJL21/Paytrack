import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.makedirs('report_images', exist_ok=True)
plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif']

# Figure 2.1: 3-Tier Architecture
def make_fig_arch():
    fig, ax = plt.subplots(figsize=(9, 5.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    # Tier 1: Client Layer
    box1 = patches.FancyBboxPatch((0.5, 4.8), 9.0, 1.8, boxstyle="round,pad=0.2", fc="#E8F4F8", ec="#2B6CB0", lw=2)
    ax.add_patch(box1)
    ax.text(5.0, 6.2, "PRESENTATION TIER (CLIENT-SIDE BROWSER)", ha='center', va='center', fontsize=12, fontweight='bold', color='#1A365D')
    ax.text(5.0, 5.5, "HTML5 Single Page Layout  |  CSS3 Glassmorphic Responsive System (Dark/Light)\nVanilla JavaScript ES6+ (DOM Engine)  |  Chart.js (Visual Analytics)  |  SheetJS & jsPDF", ha='center', va='center', fontsize=9.5, color='#2D3748')

    # Arrow 1 <-> 2
    ax.annotate('', xy=(5.0, 4.5), xytext=(5.0, 4.8), arrowprops=dict(arrowstyle="<->", lw=2, color="#2B6CB0"))
    ax.text(5.3, 4.65, "HTTP / REST API (JSON)", fontsize=9, color="#2B6CB0", fontweight='bold')

    # Tier 2: Application / Server Layer
    box2 = patches.FancyBboxPatch((0.5, 2.4), 9.0, 1.8, boxstyle="round,pad=0.2", fc="#F0FFF4", ec="#2F855A", lw=2)
    ax.add_patch(box2)
    ax.text(5.0, 3.8, "APPLICATION & BUSINESS LOGIC TIER (SERVER-SIDE)", ha='center', va='center', fontsize=12, fontweight='bold', color='#22543D')
    ax.text(5.0, 3.1, "Node.js V8 Runtime  |  Express.js RESTful API Framework\nAuthentication & Security Controller  |  Payroll Arithmetic Formula Engine\nAdvance Reconciliation Service  |  Leave & Deductions Processor  |  Morgan Logger", ha='center', va='center', fontsize=9.5, color='#2D3748')

    # Arrow 2 <-> 3
    ax.annotate('', xy=(5.0, 2.1), xytext=(5.0, 2.4), arrowprops=dict(arrowstyle="<->", lw=2, color="#2F855A"))
    ax.text(5.3, 2.25, "Synchronous SQLite Bindings / WAL", fontsize=9, color="#2F855A", fontweight='bold')

    # Tier 3: Database Layer
    box3 = patches.FancyBboxPatch((0.5, 0.3), 9.0, 1.6, boxstyle="round,pad=0.2", fc="#FFFAF0", ec="#DD6B20", lw=2)
    ax.add_patch(box3)
    ax.text(5.0, 1.5, "DATA STORAGE TIER (PERSISTENCE LAYER)", ha='center', va='center', fontsize=12, fontweight='bold', color='#7B341E')
    ax.text(5.0, 0.9, "SQLite3 Relational Database (`paytrack.db` with WAL Mode & Foreign Keys ON)\nTables: `users`, `employees`, `advances`, `leaves`, `payroll`, `activity_logs`, `company_settings`", ha='center', va='center', fontsize=9.5, color='#2D3748')

    plt.tight_layout()
    fig.savefig('report_images/fig_2_1_architecture.png', bbox_inches='tight')
    plt.close()

# Figure 3.1: UML Use Case Diagram
def make_fig_usecase():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    # Boundary box
    system_box = patches.FancyBboxPatch((2.2, 0.4), 5.6, 7.6, boxstyle="round,pad=0.2", fc="#F7FAFC", ec="#4A5568", lw=2)
    ax.add_patch(system_box)
    ax.text(5.0, 7.6, "System Boundary: Paytrack Management System", ha='center', va='center', fontsize=12, fontweight='bold', color='#1A202C')

    # Actors
    # Admin
    ax.plot([1.0], [5.8], 'o', markersize=14, color='#3182CE', mfc='white', mew=2)
    ax.plot([1.0, 1.0], [5.6, 5.0], color='#3182CE', lw=2)
    ax.plot([0.6, 1.4], [5.4, 5.4], color='#3182CE', lw=2)
    ax.plot([1.0, 0.7], [5.0, 4.4], color='#3182CE', lw=2)
    ax.plot([1.0, 1.3], [5.0, 4.4], color='#3182CE', lw=2)
    ax.text(1.0, 4.1, "System Admin\n(HR / Payroll)", ha='center', va='top', fontsize=10, fontweight='bold', color='#2B6CB0')

    # Finance Officer
    ax.plot([9.0], [3.8], 'o', markersize=14, color='#38A169', mfc='white', mew=2)
    ax.plot([9.0, 9.0], [3.6, 3.0], color='#38A169', lw=2)
    ax.plot([8.6, 9.4], [3.4, 3.4], color='#38A169', lw=2)
    ax.plot([9.0, 8.7], [3.0, 2.4], color='#38A169', lw=2)
    ax.plot([9.0, 9.3], [3.0, 2.4], color='#38A169', lw=2)
    ax.text(9.0, 2.1, "Finance Auditor /\nManagement", ha='center', va='top', fontsize=10, fontweight='bold', color='#276749')

    # Use cases
    cases = [
        ("UC1: Secure User Authentication & Login", 6.8),
        ("UC2: Manage Employee Profiles (CRUD)", 5.8),
        ("UC3: Manage Advances & Loan Ledgers", 4.8),
        ("UC4: Record Leaves & Track Attendance", 3.8),
        ("UC5: Execute Automated Payroll Processing", 2.8),
        ("UC6: Generate & Export Payslips (PDF/Print)", 1.8),
        ("UC7: View Analytics & Financial Reports", 0.9)
    ]

    for title, y in cases:
        ellipse = patches.FancyBboxPatch((2.6, y - 0.32), 4.8, 0.64, boxstyle="round,pad=0.3", fc="#EBF8FF", ec="#3182CE", lw=1.5)
        ax.add_patch(ellipse)
        ax.text(5.0, y, title, ha='center', va='center', fontsize=9.5, fontweight='bold', color='#2C5282')

        # Connect Admin to all cases
        ax.plot([1.4, 2.6], [5.2, y], color='#4A5568', lw=1.2, ls='--')

    # Connect Finance Auditor to UC5, UC6, UC7
    for y in [2.8, 1.8, 0.9]:
        ax.plot([7.4, 8.6], [y, 3.2], color='#2F855A', lw=1.2, ls='--')

    plt.tight_layout()
    fig.savefig('report_images/fig_3_1_usecase.png', bbox_inches='tight')
    plt.close()

# Figure 3.2: System Flowchart
def make_fig_flowchart():
    fig, ax = plt.subplots(figsize=(9, 8.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 12)
    ax.axis('off')

    steps = [
        ("START: Payroll Calculation Run", 11.2, "oval", "#E2E8F0", "#4A5568"),
        ("Select Month, Year & Target Employee (or Batch)", 9.9, "rect", "#EBF8FF", "#3182CE"),
        ("Retrieve Employee Record & Basic Salary (B)", 8.6, "rect", "#EBF8FF", "#3182CE"),
        ("Query Active Advances: Fetch Outstanding Balance (A)", 7.3, "rect", "#FEFCBF", "#D69E2E"),
        ("Query Monthly Leaves: Calculate Unpaid Leave Deduction (L)\nFormula: L = (B / 30) * Unpaid_Days", 6.0, "rect", "#FEFCBF", "#D69E2E"),
        ("Compute Live Formula Breakdown:\nNet = Basic + Bonus - Advance_Ded - Leave_Ded - Other_Ded", 4.6, "rect", "#EBF8FF", "#3182CE"),
        ("Validate: Is Net Salary >= 0?", 3.2, "diamond", "#FED7D7", "#E53E3E"),
        ("Commit Payroll Record to Database & Deduct Advance Balance", 1.8, "rect", "#C6F6D5", "#38A169"),
        ("END: Generate Verified Executive Payslip & Log Audit", 0.6, "oval", "#E2E8F0", "#4A5568")
    ]

    for text, y, shape, fc, ec in steps:
        if shape == "oval":
            patch = patches.FancyBboxPatch((2.2, y - 0.35), 5.6, 0.7, boxstyle="round,pad=0.3", fc=fc, ec=ec, lw=2)
        elif shape == "diamond":
            patch = patches.Polygon([[5.0, y + 0.55], [7.7, y], [5.0, y - 0.55], [2.3, y]], closed=True, fc=fc, ec=ec, lw=2)
        else:
            patch = patches.FancyBboxPatch((2.0, y - 0.45), 6.0, 0.9, boxstyle="square,pad=0.2", fc=fc, ec=ec, lw=1.8)
        
        ax.add_patch(patch)
        ax.text(5.0, y, text, ha='center', va='center', fontsize=9.2, fontweight='bold', color='#1A202C')

    # Arrows connecting steps
    arrow_ys = [10.85, 9.45, 8.15, 6.85, 5.55, 4.15, 2.75, 1.35]
    for top_y in arrow_ys:
        ax.annotate('', xy=(5.0, top_y - 0.55), xytext=(5.0, top_y), arrowprops=dict(arrowstyle="->", lw=1.8, color="#2D3748"))

    # Diamond "No" loop
    ax.text(7.9, 3.2, "No (Error)", fontsize=8.5, color="#E53E3E", fontweight='bold')
    ax.annotate('', xy=(8.3, 4.6), xytext=(7.7, 3.2), arrowprops=dict(arrowstyle="->", lw=1.5, color="#E53E3E", connectionstyle="arc3,rad=-0.3"))
    ax.text(5.2, 2.45, "Yes (Valid)", fontsize=8.5, color="#38A169", fontweight='bold')

    plt.tight_layout()
    fig.savefig('report_images/fig_3_2_flowchart.png', bbox_inches='tight')
    plt.close()

# Figure 3.3: Database Schema (ER Diagram)
def make_fig_er():
    fig, ax = plt.subplots(figsize=(10, 7), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    # Tables: employees (center), users, advances, leaves, payroll, activity_logs
    # Employees (Center Primary Entity)
    emp_box = patches.FancyBboxPatch((3.5, 2.5), 3.0, 2.8, boxstyle="square,pad=0.1", fc="#EBF8FF", ec="#2B6CB0", lw=2)
    ax.add_patch(emp_box)
    ax.text(5.0, 5.1, "employees (Parent)", ha='center', va='center', fontsize=11, fontweight='bold', color='#1A365D')
    ax.plot([3.5, 6.5], [4.8, 4.8], color="#2B6CB0", lw=1)
    emp_fields = "• id (PK, TEXT)\n• name (TEXT)\n• email, mobile\n• department, designation\n• basic_salary (REAL)\n• status (Active/Inactive)\n• joining_date, address"
    ax.text(3.7, 3.65, emp_fields, ha='left', va='center', fontsize=8.5, color='#2D3748')

    # Advances (Top Right)
    adv_box = patches.FancyBboxPatch((7.2, 4.4), 2.6, 2.2, boxstyle="square,pad=0.1", fc="#FEFCBF", ec="#D69E2E", lw=1.8)
    ax.add_patch(adv_box)
    ax.text(8.5, 6.4, "advances", ha='center', va='center', fontsize=10, fontweight='bold', color='#744210')
    ax.plot([7.2, 9.8], [6.15, 6.15], color="#D69E2E", lw=1)
    ax.text(7.35, 5.25, "• id (PK)\n• employee_id (FK)\n• advance_amount\n• remaining_balance\n• status (Open/Settled)", ha='left', va='center', fontsize=8, color='#2D3748')

    # Leaves (Bottom Right)
    leave_box = patches.FancyBboxPatch((7.2, 1.4), 2.6, 2.2, boxstyle="square,pad=0.1", fc="#FEFCBF", ec="#D69E2E", lw=1.8)
    ax.add_patch(leave_box)
    ax.text(8.5, 3.4, "leaves", ha='center', va='center', fontsize=10, fontweight='bold', color='#744210')
    ax.plot([7.2, 9.8], [3.15, 3.15], color="#D69E2E", lw=1)
    ax.text(7.35, 2.25, "• id (PK)\n• employee_id (FK)\n• month, year\n• paid_leaves\n• unpaid_leaves\n• leave_deduction", ha='left', va='center', fontsize=8, color='#2D3748')

    # Payroll (Bottom Left)
    pay_box = patches.FancyBboxPatch((0.2, 0.4), 2.8, 3.0, boxstyle="square,pad=0.1", fc="#C6F6D5", ec="#276749", lw=1.8)
    ax.add_patch(pay_box)
    ax.text(1.6, 3.2, "payroll", ha='center', va='center', fontsize=10, fontweight='bold', color='#22543D')
    ax.plot([0.2, 3.0], [2.95, 2.95], color="#276749", lw=1)
    ax.text(0.35, 1.65, "• id (PK)\n• employee_id (FK)\n• month, year\n• basic_salary\n• advance_deduction\n• leave_deduction\n• bonus, other_ded\n• net_salary\n• payment_status, date", ha='left', va='center', fontsize=7.8, color='#2D3748')

    # Users (Top Left)
    user_box = patches.FancyBboxPatch((0.2, 4.6), 2.7, 2.0, boxstyle="square,pad=0.1", fc="#EDF2F7", ec="#4A5568", lw=1.8)
    ax.add_patch(user_box)
    ax.text(1.55, 6.4, "users", ha='center', va='center', fontsize=10, fontweight='bold', color='#1A202C')
    ax.plot([0.2, 2.9], [6.15, 6.15], color="#4A5568", lw=1)
    ax.text(0.35, 5.35, "• id (PK)\n• username (UNIQUE)\n• password (hash/auth)\n• role, name\n• created_at", ha='left', va='center', fontsize=8, color='#2D3748')

    # Relationships Lines
    # employees -> advances (1 to N)
    ax.annotate('', xy=(7.2, 5.5), xytext=(6.5, 4.3), arrowprops=dict(arrowstyle="->", lw=1.8, color="#2B6CB0"))
    ax.text(6.8, 4.9, "1 : N", fontsize=9, fontweight='bold', color="#2B6CB0")

    # employees -> leaves (1 to N)
    ax.annotate('', xy=(7.2, 2.5), xytext=(6.5, 3.2), arrowprops=dict(arrowstyle="->", lw=1.8, color="#2B6CB0"))
    ax.text(6.8, 2.9, "1 : N", fontsize=9, fontweight='bold', color="#2B6CB0")

    # employees -> payroll (1 to N)
    ax.annotate('', xy=(3.0, 2.2), xytext=(3.5, 3.2), arrowprops=dict(arrowstyle="->", lw=1.8, color="#2B6CB0"))
    ax.text(3.1, 2.8, "1 : N", fontsize=9, fontweight='bold', color="#2B6CB0")

    plt.tight_layout()
    fig.savefig('report_images/fig_3_3_er_diagram.png', bbox_inches='tight')
    plt.close()

# Figure 4.1 to 4.4: UI Mockups / Visual Interfaces
def make_fig_ui_dashboard():
    fig, ax = plt.subplots(figsize=(9, 5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')
    
    # Outer frame
    frame = patches.FancyBboxPatch((0.2, 0.2), 9.6, 5.6, boxstyle="square,pad=0.1", fc="#0F172A", ec="#38BDF8", lw=2)
    ax.add_patch(frame)
    # Header bar
    hbar = patches.Rectangle((0.2, 5.2), 9.6, 0.6, fc="#1E293B")
    ax.add_patch(hbar)
    ax.text(0.5, 5.5, "Paytrack — Modern Full-Stack Payroll Portal", color="#38BDF8", fontsize=11, fontweight='bold', va='center')
    ax.text(9.5, 5.5, "Admin Console [Active: Oct 2026]", color="#94A3B8", fontsize=9, ha='right', va='center')

    # Metric cards
    cards = [
        ("Total Workforce", "24 Employees", "#3B82F6", 0.5),
        ("Monthly Disbursal", "$ 112,450.00", "#10B981", 2.8),
        ("Active Advances", "$ 8,200.00", "#F59E0B", 5.1),
        ("Pending Approvals", "3 Records", "#EF4444", 7.4)
    ]
    for title, val, color, x in cards:
        c_box = patches.FancyBboxPatch((x, 3.8), 2.1, 1.2, boxstyle="round,pad=0.1", fc="#1E293B", ec=color, lw=1.5)
        ax.add_patch(c_box)
        ax.text(x + 0.15, 4.65, title, color="#94A3B8", fontsize=8, va='center')
        ax.text(x + 0.15, 4.15, val, color="#F8FAFC", fontsize=11, fontweight='bold', va='center')

    # Chart 1: Bar Chart Simulation
    ch1 = patches.FancyBboxPatch((0.5, 0.5), 5.3, 3.1, boxstyle="round,pad=0.1", fc="#1E293B", ec="#334155", lw=1)
    ax.add_patch(ch1)
    ax.text(0.7, 3.3, "Monthly Payroll Expenditure Trend (Disbursed vs Pending)", color="#E2E8F0", fontsize=9, fontweight='bold')
    # Bar graphic
    months = ["Jun", "Jul", "Aug", "Sep", "Oct"]
    for i, m in enumerate(months):
        bx = 0.9 + i * 0.95
        ax.add_patch(patches.Rectangle((bx, 0.8), 0.35, 1.2 + (i * 0.25), fc="#3B82F6"))
        ax.add_patch(patches.Rectangle((bx + 0.38, 0.8), 0.35, 0.4 + (i * 0.1), fc="#EF4444"))
        ax.text(bx + 0.35, 0.65, m, color="#94A3B8", fontsize=7.5, ha='center')

    # Chart 2: Donut Chart Simulation
    ch2 = patches.FancyBboxPatch((6.0, 0.5), 3.5, 3.1, boxstyle="round,pad=0.1", fc="#1E293B", ec="#334155", lw=1)
    ax.add_patch(ch2)
    ax.text(6.2, 3.3, "Department Headcount Distribution", color="#E2E8F0", fontsize=9, fontweight='bold')
    circle = patches.Circle((7.75, 1.8), 1.0, fc="#0F172A", ec="#10B981", lw=8)
    ax.add_patch(circle)
    ax.text(7.75, 1.8, "Eng: 42%\nDes: 25%\nMkt: 18%\nOps: 15%", color="#F8FAFC", fontsize=7.5, ha='center', va='center')

    plt.tight_layout()
    fig.savefig('report_images/fig_4_1_ui_dashboard.png', bbox_inches='tight')
    plt.close()

def make_fig_ui_directory():
    fig, ax = plt.subplots(figsize=(9, 4.8), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    frame = patches.FancyBboxPatch((0.2, 0.2), 9.6, 5.6, boxstyle="square,pad=0.1", fc="#FFFFFF", ec="#CBD5E1", lw=2)
    ax.add_patch(frame)

    # Top search bar
    ax.add_patch(patches.FancyBboxPatch((0.5, 4.8), 4.5, 0.6, boxstyle="round,pad=0.1", fc="#F8FAFC", ec="#94A3B8", lw=1))
    ax.text(0.7, 5.1, "Search employee by name, designation, department...", color="#64748B", fontsize=8.5, va='center')
    ax.add_patch(patches.FancyBboxPatch((5.2, 4.8), 2.2, 0.6, boxstyle="round,pad=0.1", fc="#EEF2FF", ec="#6366F1", lw=1))
    ax.text(6.3, 5.1, "Filter: Engineering v", color="#4F46E5", fontsize=8.5, ha='center', va='center')
    ax.add_patch(patches.FancyBboxPatch((7.6, 4.8), 2.0, 0.6, boxstyle="round,pad=0.1", fc="#2563EB", ec="#1D4ED8", lw=1))
    ax.text(8.6, 5.1, "+ Add Employee", color="#FFFFFF", fontsize=8.5, fontweight='bold', ha='center', va='center')

    # Table representation
    ax.add_patch(patches.Rectangle((0.5, 4.2), 9.1, 0.45, fc="#F1F5F9"))
    headers = ["Employee", "Department", "Designation", "Basic Salary", "Advance Balance", "Status", "Actions"]
    xs = [0.6, 2.5, 4.2, 5.8, 7.2, 8.4, 9.2]
    for h, x in zip(headers, xs):
        ax.text(x, 4.42, h, color="#334155", fontsize=8, fontweight='bold', va='center')

    rows = [
        ("Sarah Jenkins", "Engineering", "Lead Architect", "$ 8,500.00", "$ 1,200.00", "Active"),
        ("Marcus Vance", "Engineering", "Senior Backend Eng", "$ 7,200.00", "$ 0.00", "Active"),
        ("Elena Rostova", "Product & Design", "UI/UX Principal", "$ 6,800.00", "$ 500.00", "Active"),
        ("David Kalu", "Finance", "Senior Accountant", "$ 5,500.00", "$ 0.00", "Active"),
        ("Rachel Adams", "Marketing", "Growth Strategist", "$ 4,900.00", "$ 300.00", "Active"),
        ("Liam Patel", "Operations", "DevOps Specialist", "$ 6,200.00", "$ 0.00", "Active")
    ]
    for idx, (emp, dept, des, sal, adv, stat) in enumerate(rows):
        ry = 3.6 - (idx * 0.55)
        bg = "#FFFFFF" if idx % 2 == 0 else "#F8FAFC"
        ax.add_patch(patches.Rectangle((0.5, ry - 0.2), 9.1, 0.5, fc=bg))
        ax.text(0.6, ry, emp, color="#0F172A", fontsize=8, fontweight='bold', va='center')
        ax.text(2.5, ry, dept, color="#475569", fontsize=8, va='center')
        ax.text(4.2, ry, des, color="#475569", fontsize=8, va='center')
        ax.text(5.8, ry, sal, color="#0F172A", fontsize=8, fontweight='bold', va='center')
        ax.text(7.2, ry, adv, color="#D97706" if adv != "$ 0.00" else "#64748B", fontsize=8, va='center')
        ax.text(8.4, ry, stat, color="#16A34A", fontsize=8, fontweight='bold', va='center')
        ax.text(9.2, ry, "[Edit] [View]", color="#2563EB", fontsize=7.5, va='center')

    plt.tight_layout()
    fig.savefig('report_images/fig_4_2_ui_directory.png', bbox_inches='tight')
    plt.close()

def make_fig_ui_payslip():
    fig, ax = plt.subplots(figsize=(8.5, 6), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 9)
    ax.axis('off')

    # Outer Sheet
    sheet = patches.FancyBboxPatch((0.5, 0.4), 9.0, 8.2, boxstyle="square,pad=0.1", fc="#FFFFFF", ec="#0F172A", lw=2)
    ax.add_patch(sheet)

    # Payslip Header
    ax.text(5.0, 8.1, "PAYTRACK TECHNOLOGIES PRIVATE LIMITED", ha='center', va='center', fontsize=12, fontweight='bold', color='#0F172A')
    ax.text(5.0, 7.7, "Official Monthly Salary & Compensation Statement | October 2026", ha='center', va='center', fontsize=9, color='#475569')
    ax.plot([0.8, 9.2], [7.4, 7.4], color="#CBD5E1", lw=1.5)

    # Employee Bio
    ax.text(0.9, 7.0, "Employee ID: EMP-1049\nName: Sarah Jenkins\nDepartment: Engineering\nDesignation: Lead Architect", fontsize=8.5, color='#1E293B', va='top')
    ax.text(5.5, 7.0, "Pay Period: Oct 01 - Oct 31, 2026\nBank Account: XXXX-XXXX-4921\nPAN / Tax ID: ABCDE1234F\nPayment Mode: NEFT / Direct Deposit", fontsize=8.5, color='#1E293B', va='top')

    # Earnings & Deductions Tables
    ax.add_patch(patches.Rectangle((0.8, 4.4), 4.1, 0.4, fc="#F1F5F9"))
    ax.text(1.0, 4.6, "EARNINGS / CREDITS", color="#0F172A", fontsize=8.5, fontweight='bold', va='center')
    ax.text(4.7, 4.6, "AMOUNT ($)", color="#0F172A", fontsize=8.5, fontweight='bold', ha='right', va='center')

    ax.add_patch(patches.Rectangle((5.1, 4.4), 4.1, 0.4, fc="#F1F5F9"))
    ax.text(5.3, 4.6, "DEDUCTIONS / DEBITS", color="#0F172A", fontsize=8.5, fontweight='bold', va='center')
    ax.text(9.0, 4.6, "AMOUNT ($)", color="#0F172A", fontsize=8.5, fontweight='bold', ha='right', va='center')

    # Rows
    ax.text(1.0, 4.0, "Basic Salary\nPerformance Bonus\nHouse Rent Allowance (HRA)\nSpecial Allowance", fontsize=8, color="#334155")
    ax.text(4.7, 4.0, "6,000.00\n1,000.00\n1,000.00\n500.00", fontsize=8, color="#0F172A", ha='right', fontweight='bold')

    ax.text(5.3, 4.0, "Advance Salary Recovery\nUnpaid Leave Deduction (1 day)\nTax / Statutory Deductions\nHealth Insurance", fontsize=8, color="#334155")
    ax.text(9.0, 4.0, "500.00\n200.00\n450.00\n150.00", fontsize=8, color="#EF4444", ha='right', fontweight='bold')

    ax.plot([0.8, 9.2], [2.7, 2.7], color="#CBD5E1", lw=1.5)
    # Total row
    ax.text(1.0, 2.45, "Total Gross Earnings: $ 8,500.00", fontsize=8.5, color="#16A34A", fontweight='bold')
    ax.text(5.3, 2.45, "Total Deductions: $ 1,300.00", fontsize=8.5, color="#DC2626", fontweight='bold')

    # Net Salary Highlight Box
    net_box = patches.FancyBboxPatch((0.8, 1.2), 8.4, 0.85, boxstyle="round,pad=0.1", fc="#EFF6FF", ec="#2563EB", lw=1.5)
    ax.add_patch(net_box)
    ax.text(1.1, 1.62, "NET SALARY PAYABLE: $ 7,200.00", fontsize=11, fontweight='bold', color="#1E40AF", va='center')
    ax.text(9.0, 1.62, "Seven Thousand Two Hundred Dollars Only", fontsize=8, fontstyle='italic', color="#1E40AF", ha='right', va='center')

    # Signatures & Verification
    ax.text(1.0, 0.7, "[QR Security Verification Seal Verified]", fontsize=8, color="#64748B")
    ax.text(8.8, 0.7, "Authorised Signatory\nChief Financial Officer", fontsize=8, ha='right', color="#1E293B", fontweight='bold')

    plt.tight_layout()
    fig.savefig('report_images/fig_4_4_ui_payslip.png', bbox_inches='tight')
    plt.close()

if __name__ == '__main__':
    make_fig_arch()
    make_fig_usecase()
    make_fig_flowchart()
    make_fig_er()
    make_fig_ui_dashboard()
    make_fig_ui_directory()
    make_fig_ui_payslip()
    print("All figures generated successfully in report_images/!")

def make_fig_ui_payroll():
    fig, ax = plt.subplots(figsize=(9, 5.2), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    frame = patches.FancyBboxPatch((0.2, 0.2), 9.6, 5.6, boxstyle="square,pad=0.1", fc="#0F172A", ec="#6366F1", lw=2)
    ax.add_patch(frame)

    # Header
    ax.text(0.5, 5.4, "Payroll Calculation & Bulk Disbursal Center — October 2026", color="#E0E7FF", fontsize=11, fontweight='bold', va='center')

    # Top Control Bar
    ax.add_patch(patches.FancyBboxPatch((0.5, 4.4), 2.5, 0.6, boxstyle="round,pad=0.1", fc="#1E293B", ec="#475569", lw=1))
    ax.text(1.75, 4.7, "Pay Period: Oct 2026 v", color="#F8FAFC", fontsize=8.5, ha='center', va='center')

    ax.add_patch(patches.FancyBboxPatch((3.2, 4.4), 2.8, 0.6, boxstyle="round,pad=0.1", fc="#4F46E5", ec="#4338CA", lw=1))
    ax.text(4.6, 4.7, "[⚡] Run Bulk Batch Payroll", color="#FFFFFF", fontsize=8.5, fontweight='bold', ha='center', va='center')

    ax.add_patch(patches.FancyBboxPatch((6.2, 4.4), 3.4, 0.6, boxstyle="round,pad=0.1", fc="#10B981", ec="#059669", lw=1))
    ax.text(7.9, 4.7, "[✓] Disburse All Pending (NEFT/IMPS)", color="#FFFFFF", fontsize=8.5, fontweight='bold', ha='center', va='center')

    # Breakdown Table
    ax.add_patch(patches.Rectangle((0.5, 3.8), 9.1, 0.45, fc="#1E293B"))
    headers = ["Employee", "Basic Sal", "Bonus (+)", "Adv Ded (-)", "Leave Ded (-)", "Net Salary", "Status"]
    xs = [0.6, 2.2, 3.6, 5.0, 6.4, 7.8, 9.1]
    for h, x in zip(headers, xs):
        ax.text(x, 4.02, h, color="#94A3B8", fontsize=8, fontweight='bold', va='center')

    rows = [
        ("Sarah Jenkins", "$ 6,000.00", "$ 1,000.00", "$ 500.00", "$ 200.00", "$ 7,200.00", "Disbursed (NEFT)"),
        ("Marcus Vance", "$ 7,200.00", "$ 500.00", "$ 0.00", "$ 0.00", "$ 7,700.00", "Pending Disbursal"),
        ("Elena Rostova", "$ 6,800.00", "$ 400.00", "$ 500.00", "$ 226.67", "$ 6,473.33", "Disbursed (UPI)"),
        ("David Kalu", "$ 5,500.00", "$ 300.00", "$ 0.00", "$ 0.00", "$ 5,800.00", "Disbursed (IMPS)"),
        ("Rachel Adams", "$ 4,900.00", "$ 250.00", "$ 300.00", "$ 163.33", "$ 4,686.67", "Pending Disbursal")
    ]
    for idx, (emp, b, bon, adv, lv, net, st) in enumerate(rows):
        ry = 3.3 - (idx * 0.55)
        ax.add_patch(patches.Rectangle((0.5, ry - 0.2), 9.1, 0.5, fc="#1E293B" if idx % 2 == 0 else "#0F172A"))
        ax.text(0.6, ry, emp, color="#F8FAFC", fontsize=8, fontweight='bold', va='center')
        ax.text(2.2, ry, b, color="#E2E8F0", fontsize=8, va='center')
        ax.text(3.6, ry, bon, color="#10B981", fontsize=8, va='center')
        ax.text(5.0, ry, adv, color="#F59E0B", fontsize=8, va='center')
        ax.text(6.4, ry, lv, color="#EF4444", fontsize=8, va='center')
        ax.text(7.8, ry, net, color="#38BDF8", fontsize=8.5, fontweight='bold', va='center')
        color_st = "#10B981" if "Disbursed" in st else "#F59E0B"
        ax.text(9.1, ry, st, color=color_st, fontsize=7.5, fontweight='bold', va='center')

    plt.tight_layout()
    fig.savefig('report_images/fig_4_3_ui_payroll.png', bbox_inches='tight')
    plt.close()

make_fig_ui_payroll()
print("fig_4_3_ui_payroll.png generated successfully!")
