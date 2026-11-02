const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
let dbPath = path.join(__dirname, 'paytrack.db');

if (isVercel) {
  const tmpPath = path.join('/tmp', 'paytrack.db');
  if (!fs.existsSync(tmpPath)) {
    try {
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, tmpPath);
      }
    } catch (e) {
      console.warn('Could not copy db to /tmp:', e);
    }
  }
  dbPath = tmpPath;
}

const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'Admin',
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      mobile TEXT,
      department TEXT NOT NULL,
      designation TEXT NOT NULL,
      joining_date TEXT NOT NULL,
      basic_salary REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'Active',
      address TEXT,
      avatar_color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS advances (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      advance_amount REAL NOT NULL,
      remaining_balance REAL NOT NULL,
      advance_date TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'Open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS leaves (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      paid_leaves REAL DEFAULT 0,
      unpaid_leaves REAL DEFAULT 0,
      leave_deduction REAL DEFAULT 0,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payroll (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      basic_salary REAL NOT NULL DEFAULT 0,
      advance_deduction REAL NOT NULL DEFAULT 0,
      leave_deduction REAL NOT NULL DEFAULT 0,
      bonus REAL NOT NULL DEFAULT 0,
      other_deduction REAL NOT NULL DEFAULT 0,
      net_salary REAL NOT NULL DEFAULT 0,
      payment_status TEXT DEFAULT 'Pending',
      payment_date TEXT,
      payment_method TEXT,
      payment_ref TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      user TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS company_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    db.prepare(`
      INSERT INTO users (id, username, password, role, name)
      VALUES (?, ?, ?, ?, ?)
    `).run('usr_admin', 'admin', 'admin123', 'Super Admin', 'System Administrator');
  }

  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM company_settings').get().count;
  if (settingsCount === 0) {
    const insertSetting = db.prepare('INSERT OR REPLACE INTO company_settings (key, value) VALUES (?, ?)');
    const defaultSettings = [
      ['company_name', 'Nexus Technologies Pvt Ltd'],
      ['tagline', 'Enterprise Cloud & AI Solutions'],
      ['tax_id', 'GSTIN29AABCU9603R1ZM'],
      ['email', 'payroll@nexustech.io'],
      ['phone', '+91 (080) 4123-8900'],
      ['address', 'Tech Park, 4th Floor, Outer Ring Road, Bangalore - 560103'],
      ['currency_symbol', '₹'],
      ['currency_code', 'INR']
    ];
    for (const [k, v] of defaultSettings) {
      insertSetting.run(k, v);
    }
  }

  const empCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  if (empCount === 0) {
    const employees = [
      {
        id: 'emp_101',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@nexustech.io',
        mobile: '+91 98765 43210',
        department: 'Engineering',
        designation: 'Lead Full Stack Architect',
        joining_date: '2023-03-15',
        basic_salary: 85000,
        status: 'Active',
        address: 'Indiranagar, Bangalore, Karnataka',
        avatar_color: '#6366f1'
      },
      {
        id: 'emp_102',
        name: 'Priya Sundaram',
        email: 'priya.s@nexustech.io',
        mobile: '+91 98450 11223',
        department: 'Product & Design',
        designation: 'Principal UI/UX Designer',
        joining_date: '2023-06-01',
        basic_salary: 72000,
        status: 'Active',
        address: 'Koramangala, Bangalore, Karnataka',
        avatar_color: '#ec4899'
      },
      {
        id: 'emp_103',
        name: 'Rohan Deshmukh',
        email: 'rohan.d@nexustech.io',
        mobile: '+91 97654 32109',
        department: 'Engineering',
        designation: 'Senior Backend Developer',
        joining_date: '2023-08-10',
        basic_salary: 65000,
        status: 'Active',
        address: 'HSR Layout, Bangalore, Karnataka',
        avatar_color: '#10b981'
      },
      {
        id: 'emp_104',
        name: 'Ananya Verma',
        email: 'ananya.v@nexustech.io',
        mobile: '+91 99123 45678',
        department: 'Marketing',
        designation: 'Growth & Marketing Lead',
        joining_date: '2024-01-15',
        basic_salary: 58000,
        status: 'Active',
        address: 'Whitefield, Bangalore, Karnataka',
        avatar_color: '#f59e0b'
      },
      {
        id: 'emp_105',
        name: 'Vikramaditya Rao',
        email: 'vikram.rao@nexustech.io',
        mobile: '+91 98234 56789',
        department: 'Sales',
        designation: 'Enterprise Account Executive',
        joining_date: '2023-11-20',
        basic_salary: 60000,
        status: 'Active',
        address: 'JP Nagar, Bangalore, Karnataka',
        avatar_color: '#8b5cf6'
      },
      {
        id: 'emp_106',
        name: 'Neha Kapoor',
        email: 'neha.k@nexustech.io',
        mobile: '+91 97112 23344',
        department: 'Human Resources',
        designation: 'HR Operations Manager',
        joining_date: '2023-04-05',
        basic_salary: 52000,
        status: 'Active',
        address: 'Malleshwaram, Bangalore, Karnataka',
        avatar_color: '#06b6d4'
      },
      {
        id: 'emp_107',
        name: 'Karthik Subramanian',
        email: 'karthik.s@nexustech.io',
        mobile: '+91 96554 43322',
        department: 'Finance',
        designation: 'Financial Analyst',
        joining_date: '2024-02-01',
        basic_salary: 50000,
        status: 'Active',
        address: 'Electronic City, Bangalore, Karnataka',
        avatar_color: '#14b8a6'
      },
      {
        id: 'emp_108',
        name: 'Meera Iyer',
        email: 'meera.iyer@nexustech.io',
        mobile: '+91 95443 32211',
        department: 'Operations',
        designation: 'QA Lead Engineer',
        joining_date: '2023-09-12',
        basic_salary: 48000,
        status: 'Active',
        address: 'Marathahalli, Bangalore, Karnataka',
        avatar_color: '#3b82f6'
      }
    ];

    const insertEmp = db.prepare(`
      INSERT INTO employees (id, name, email, mobile, department, designation, joining_date, basic_salary, status, address, avatar_color)
      VALUES (@id, @name, @email, @mobile, @department, @designation, @joining_date, @basic_salary, @status, @address, @avatar_color)
    `);

    for (const emp of employees) {
      insertEmp.run(emp);
    }

    // Seed initial advances
    const advances = [
      { id: 'adv_201', employee_id: 'emp_101', advance_amount: 20000, remaining_balance: 10000, advance_date: '2026-07-10', reason: 'Home relocation expenses' },
      { id: 'emp_202', employee_id: 'emp_103', advance_amount: 15000, remaining_balance: 5000, advance_date: '2026-08-01', reason: 'Medical advance for family' },
      { id: 'emp_203', employee_id: 'emp_105', advance_amount: 12000, remaining_balance: 12000, advance_date: '2026-08-15', reason: 'Emergency travel' }
    ];

    const insertAdv = db.prepare(`
      INSERT INTO advances (id, employee_id, advance_amount, remaining_balance, advance_date, reason)
      VALUES (@id, @employee_id, @advance_amount, @remaining_balance, @advance_date, @reason)
    `);
    for (const adv of advances) {
      insertAdv.run(adv);
    }

    // Seed leaves
    const leaves = [
      { id: 'lv_301', employee_id: 'emp_102', month: 'August', year: 2026, paid_leaves: 2, unpaid_leaves: 1, leave_deduction: 2400, reason: 'Personal work' },
      { id: 'lv_302', employee_id: 'emp_104', month: 'August', year: 2026, paid_leaves: 1, unpaid_leaves: 2, leave_deduction: 3866, reason: 'Flu & viral fever' },
      { id: 'lv_303', employee_id: 'emp_108', month: 'August', year: 2026, paid_leaves: 3, unpaid_leaves: 0, leave_deduction: 0, reason: 'Approved annual leave' }
    ];

    const insertLeave = db.prepare(`
      INSERT INTO leaves (id, employee_id, month, year, paid_leaves, unpaid_leaves, leave_deduction, reason)
      VALUES (@id, @employee_id, @month, @year, @paid_leaves, @unpaid_leaves, @leave_deduction, @reason)
    `);
    for (const lv of leaves) {
      insertLeave.run(lv);
    }

    // Seed previous payroll runs for rich trend charts
    const payrollRecords = [
      { id: 'pr_july_101', employee_id: 'emp_101', month: 'July', year: 2026, basic_salary: 85000, advance_deduction: 10000, leave_deduction: 0, bonus: 5000, other_deduction: 1000, net_salary: 79000, payment_status: 'Paid', payment_date: '2026-07-31', payment_method: 'Bank Transfer (NEFT)', payment_ref: 'NEFT98234101', notes: 'Monthly salary credited' },
      { id: 'pr_july_102', employee_id: 'emp_102', month: 'July', year: 2026, basic_salary: 72000, advance_deduction: 0, leave_deduction: 0, bonus: 3000, other_deduction: 500, net_salary: 74500, payment_status: 'Paid', payment_date: '2026-07-31', payment_method: 'Bank Transfer (IMPS)', payment_ref: 'IMPS44912002', notes: 'Design milestone bonus included' },
      { id: 'pr_july_103', employee_id: 'emp_103', month: 'July', year: 2026, basic_salary: 65000, advance_deduction: 10000, leave_deduction: 0, bonus: 2000, other_deduction: 500, net_salary: 56500, payment_status: 'Paid', payment_date: '2026-07-31', payment_method: 'Bank Transfer (NEFT)', payment_ref: 'NEFT98234103', notes: 'Advance installment deducted' },
      { id: 'pr_july_104', employee_id: 'emp_104', month: 'July', year: 2026, basic_salary: 58000, advance_deduction: 0, leave_deduction: 1933, bonus: 4000, other_deduction: 500, net_salary: 59567, payment_status: 'Paid', payment_date: '2026-07-31', payment_method: 'Bank Transfer (IMPS)', payment_ref: 'IMPS44912004', notes: 'Campaign performance incentive' },
      { id: 'pr_july_105', employee_id: 'emp_105', month: 'July', year: 2026, basic_salary: 60000, advance_deduction: 0, leave_deduction: 0, bonus: 8000, other_deduction: 500, net_salary: 67500, payment_status: 'Paid', payment_date: '2026-07-31', payment_method: 'Bank Transfer (NEFT)', payment_ref: 'NEFT98234105', notes: 'Sales deal closure commission' },
      { id: 'pr_july_106', employee_id: 'emp_106', month: 'July', year: 2026, basic_salary: 52000, advance_deduction: 0, leave_deduction: 0, bonus: 1500, other_deduction: 500, net_salary: 53000, payment_status: 'Paid', payment_date: '2026-07-31', payment_method: 'Bank Transfer (IMPS)', payment_ref: 'IMPS44912006', notes: 'Standard monthly salary' },
      
      // Current month (August 2026) records - some paid, some pending
      { id: 'pr_aug_101', employee_id: 'emp_101', month: 'August', year: 2026, basic_salary: 85000, advance_deduction: 10000, leave_deduction: 0, bonus: 4000, other_deduction: 1000, net_salary: 78000, payment_status: 'Pending', payment_date: null, payment_method: null, payment_ref: null, notes: 'Generated for August cycle' },
      { id: 'pr_aug_102', employee_id: 'emp_102', month: 'August', year: 2026, basic_salary: 72000, advance_deduction: 0, leave_deduction: 2400, bonus: 2500, other_deduction: 500, net_salary: 71600, payment_status: 'Paid', payment_date: '2026-08-25', payment_method: 'Bank Transfer (NEFT)', payment_ref: 'NEFT88129033', notes: 'Processed early' },
      { id: 'pr_aug_103', employee_id: 'emp_103', month: 'August', year: 2026, basic_salary: 65000, advance_deduction: 5000, leave_deduction: 0, bonus: 3000, other_deduction: 500, net_salary: 62500, payment_status: 'Pending', payment_date: null, payment_method: null, payment_ref: null, notes: 'Pending finance release' }
    ];

    const insertPayroll = db.prepare(`
      INSERT INTO payroll (id, employee_id, month, year, basic_salary, advance_deduction, leave_deduction, bonus, other_deduction, net_salary, payment_status, payment_date, payment_method, payment_ref, notes)
      VALUES (@id, @employee_id, @month, @year, @basic_salary, @advance_deduction, @leave_deduction, @bonus, @other_deduction, @net_salary, @payment_status, @payment_date, @payment_method, @payment_ref, @notes)
    `);
    for (const pr of payrollRecords) {
      insertPayroll.run(pr);
    }

    // Seed activity logs
    const logActivity = db.prepare(`
      INSERT INTO activity_logs (id, action_type, description, user, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    logActivity.run('log_01', 'SYSTEM_INIT', 'Paytrack Enterprise Salary System initialized', 'system', '2026-08-01 09:00:00');
    logActivity.run('log_02', 'EMPLOYEE_IMPORT', 'Imported initial active workforce roster (8 employees)', 'admin', '2026-08-01 09:05:00');
    logActivity.run('log_03', 'PAYROLL_GENERATED', 'Generated salary batch for August 2026', 'admin', '2026-08-25 14:30:00');
    logActivity.run('log_04', 'PAYMENT_PROCESSED', 'Disbursed salary payment of ₹71,600 to Priya Sundaram via NEFT', 'admin', '2026-08-25 16:45:00');
  }
}

function logAction(actionType, description, user = 'admin') {
  const id = 'log_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  db.prepare(`
    INSERT INTO activity_logs (id, action_type, description, user)
    VALUES (?, ?, ?, ?)
  `).run(id, actionType, description, user);
}

initDatabase();

module.exports = {
  db,
  logAction,
  initDatabase
};
