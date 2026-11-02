const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { db, logAction, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const user = db.prepare('SELECT id, username, role, name, password FROM users WHERE username = ?').get(username.trim());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  logAction('USER_LOGIN', `User ${user.username} signed into the admin console`, user.username);
  const { password: _, ...userProfile } = user;
  res.json({ success: true, user: userProfile, message: 'Signed in successfully.' });
});

app.get('/api/auth/me', (req, res) => {
  const user = db.prepare('SELECT id, username, role, name, created_at FROM users LIMIT 1').get();
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, user });
});

app.put('/api/auth/password', (req, res) => {
  const { currentUsername, newUsername, currentPassword, newPassword } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(currentUsername);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Current user not found.' });
  }

  if (currentPassword && user.password !== currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password does not match.' });
  }

  const updatedUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : user.username;
  const updatedPassword = (newPassword && newPassword.trim()) ? newPassword.trim() : user.password;

  db.prepare('UPDATE users SET username = ?, password = ? WHERE id = ?').run(updatedUsername, updatedPassword, user.id);
  logAction('PASSWORD_CHANGED', `Admin credentials updated for user ${updatedUsername}`);

  res.json({ success: true, message: 'Credentials updated successfully.', username: updatedUsername });
});

// ----------------------------------------------------
// DASHBOARD & ANALYTICS
// ----------------------------------------------------
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
    const activeEmployees = db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'").get().count;
    const inactiveEmployees = totalEmployees - activeEmployees;

    const totalBaseSalary = db.prepare("SELECT COALESCE(SUM(basic_salary), 0) as total FROM employees WHERE status = 'Active'").get().total;

    const advanceStats = db.prepare(`
      SELECT 
        COALESCE(SUM(advance_amount), 0) as total_distributed,
        COALESCE(SUM(remaining_balance), 0) as total_outstanding
      FROM advances
    `).get();

    const payrollStats = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN net_salary ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN payment_status = 'Pending' THEN net_salary ELSE 0 END), 0) as total_pending,
        COALESCE(SUM(net_salary), 0) as total_payroll,
        COUNT(*) as run_count
      FROM payroll
    `).get();

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const currentYear = new Date().getFullYear();

    const currentMonthLeaves = db.prepare(`
      SELECT COALESCE(SUM(leave_deduction), 0) as total_deduction,
             COALESCE(SUM(unpaid_leaves), 0) as total_unpaid_days
      FROM leaves 
      WHERE month = ? AND year = ?
    `).get(currentMonth, currentYear);

    // Department Distribution
    const departmentDistribution = db.prepare(`
      SELECT department, COUNT(*) as count, SUM(basic_salary) as total_salary
      FROM employees
      GROUP BY department
      ORDER BY count DESC
    `).all();

    // Monthly trends (Last 6 distinct months from payroll)
    const monthlyTrends = db.prepare(`
      SELECT month, year,
             SUM(basic_salary) as basic,
             SUM(net_salary) as net,
             SUM(CASE WHEN payment_status = 'Paid' THEN net_salary ELSE 0 END) as paid,
             SUM(CASE WHEN payment_status = 'Pending' THEN net_salary ELSE 0 END) as pending,
             COUNT(*) as employees_count
      FROM payroll
      GROUP BY year, month
      ORDER BY created_at ASC
      LIMIT 6
    `).all();

    // Recent activity logs
    const recentActivities = db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 6').all();

    // Recent payroll rows
    const recentPayroll = db.prepare(`
      SELECT p.*, e.name as employee_name, e.department, e.designation, e.avatar_color
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      ORDER BY p.created_at DESC
      LIMIT 6
    `).all();

    res.json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalBaseSalary,
        totalAdvanceDistributed: advanceStats.total_distributed,
        totalAdvanceOutstanding: advanceStats.total_outstanding,
        totalPaidSalary: payrollStats.total_paid,
        totalPendingSalary: payrollStats.total_pending,
        totalPayroll: payrollStats.total_payroll,
        payrollRunCount: payrollStats.run_count,
        currentMonthLeaveDeduction: currentMonthLeaves.total_deduction,
        currentMonthUnpaidDays: currentMonthLeaves.total_unpaid_days,
        currentMonth: `${currentMonth} ${currentYear}`
      },
      departmentDistribution,
      monthlyTrends,
      recentActivities,
      recentPayroll
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics.' });
  }
});

// ----------------------------------------------------
// EMPLOYEES CRUD
// ----------------------------------------------------
app.get('/api/employees', (req, res) => {
  const { search, department, status } = req.query;
  let query = 'SELECT * FROM employees WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ? OR mobile LIKE ? OR designation LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  if (department && department !== 'All') {
    query += ' AND department = ?';
    params.push(department);
  }
  if (status && status !== 'All') {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY name ASC';
  const employees = db.prepare(query).all(...params);

  // Attach active advance info
  const empWithDetails = employees.map(emp => {
    const activeAdvance = db.prepare('SELECT COALESCE(SUM(remaining_balance), 0) as balance FROM advances WHERE employee_id = ?').get(emp.id).balance;
    const lastPayroll = db.prepare('SELECT month, year, net_salary, payment_status FROM payroll WHERE employee_id = ? ORDER BY created_at DESC LIMIT 1').get(emp.id);
    return {
      ...emp,
      activeAdvance,
      lastPayroll: lastPayroll || null
    };
  });

  res.json({ success: true, employees: empWithDetails });
});

app.get('/api/employees/:id', (req, res) => {
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found.' });

  const advances = db.prepare('SELECT * FROM advances WHERE employee_id = ? ORDER BY advance_date DESC').all(emp.id);
  const leaves = db.prepare('SELECT * FROM leaves WHERE employee_id = ? ORDER BY created_at DESC').all(emp.id);
  const payroll = db.prepare('SELECT * FROM payroll WHERE employee_id = ? ORDER BY created_at DESC').all(emp.id);

  res.json({
    success: true,
    employee: emp,
    advances,
    leaves,
    payroll
  });
});

app.post('/api/employees', (req, res) => {
  const { name, email, mobile, department, designation, joining_date, basic_salary, status, address, avatar_color } = req.body;
  if (!name || !department || !designation) {
    return res.status(400).json({ success: false, message: 'Name, Department, and Designation are required.' });
  }

  const trimmedName = name.trim();
  const trimmedEmail = (email || '').trim();
  const trimmedMobile = (mobile || '').trim();

  // Check if employee with same email already exists
  if (trimmedEmail) {
    const existingEmail = db.prepare('SELECT id, name, department FROM employees WHERE LOWER(TRIM(email)) = LOWER(?)').get(trimmedEmail);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `Employee already exists with email '${trimmedEmail}' (${existingEmail.name} - ${existingEmail.department}).`
      });
    }
  }

  // Check if employee with same mobile number already exists
  if (trimmedMobile) {
    const existingMobile = db.prepare('SELECT id, name, department FROM employees WHERE TRIM(mobile) = ?').get(trimmedMobile);
    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: `Employee already exists with mobile number '${trimmedMobile}' (${existingMobile.name} - ${existingMobile.department}).`
      });
    }
  }

  // Check if employee with same name already exists
  const existingName = db.prepare('SELECT id, name, department, designation FROM employees WHERE LOWER(TRIM(name)) = LOWER(?)').get(trimmedName);
  if (existingName) {
    return res.status(409).json({
      success: false,
      message: `Employee '${existingName.name}' already exists in ${existingName.department} (${existingName.designation}).`
    });
  }

  // Normalize joining date to YYYY-MM-DD
  let normalizedJoiningDate = joining_date || new Date().toISOString().slice(0, 10);
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(normalizedJoiningDate)) {
    const parts = normalizedJoiningDate.split(/[\/\-]/);
    normalizedJoiningDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  const id = uid('emp');
  const palette = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#14b8a6', '#3b82f6'];
  const assignedColor = avatar_color || palette[Math.floor(Math.random() * palette.length)];

  db.prepare(`
    INSERT INTO employees (id, name, email, mobile, department, designation, joining_date, basic_salary, status, address, avatar_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    trimmedName,
    trimmedEmail,
    trimmedMobile,
    department.trim(),
    designation.trim(),
    normalizedJoiningDate,
    Number(basic_salary) || 0,
    status || 'Active',
    (address || '').trim(),
    assignedColor
  );

  logAction('EMPLOYEE_CREATED', `Added new employee ${trimmedName} (${designation.trim()}, ${department.trim()})`);
  res.status(201).json({ success: true, message: 'Employee created successfully.', id });
});

app.put('/api/employees/:id', (req, res) => {
  const { name, email, mobile, department, designation, joining_date, basic_salary, status, address, avatar_color } = req.body;
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found.' });

  const targetName = (name ? name.trim() : emp.name);
  const targetEmail = (email !== undefined ? email.trim() : (emp.email || ''));
  const targetMobile = (mobile !== undefined ? mobile.trim() : (emp.mobile || ''));

  if (targetEmail) {
    const duplicateEmail = db.prepare('SELECT id, name, department FROM employees WHERE LOWER(TRIM(email)) = LOWER(?) AND id != ?').get(targetEmail, emp.id);
    if (duplicateEmail) {
      return res.status(409).json({ success: false, message: `Another employee already exists with email '${targetEmail}' (${duplicateEmail.name}).` });
    }
  }

  if (targetMobile) {
    const duplicateMobile = db.prepare('SELECT id, name, department FROM employees WHERE TRIM(mobile) = ? AND id != ?').get(targetMobile, emp.id);
    if (duplicateMobile) {
      return res.status(409).json({ success: false, message: `Another employee already exists with mobile '${targetMobile}' (${duplicateMobile.name}).` });
    }
  }

  if (targetName) {
    const duplicateName = db.prepare('SELECT id, name, department FROM employees WHERE LOWER(TRIM(name)) = LOWER(?) AND id != ?').get(targetName, emp.id);
    if (duplicateName) {
      return res.status(409).json({ success: false, message: `Another employee '${duplicateName.name}' already exists in ${duplicateName.department}.` });
    }
  }

  let normalizedJoiningDate = joining_date || emp.joining_date;
  if (normalizedJoiningDate && /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(normalizedJoiningDate)) {
    const parts = normalizedJoiningDate.split(/[\/\-]/);
    normalizedJoiningDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  db.prepare(`
    UPDATE employees 
    SET name = ?, email = ?, mobile = ?, department = ?, designation = ?, 
        joining_date = ?, basic_salary = ?, status = ?, address = ?, avatar_color = ?
    WHERE id = ?
  `).run(
    targetName,
    targetEmail,
    targetMobile,
    department ? department.trim() : emp.department,
    designation ? designation.trim() : emp.designation,
    normalizedJoiningDate,
    basic_salary !== undefined ? Number(basic_salary) : emp.basic_salary,
    status || emp.status,
    address !== undefined ? address.trim() : emp.address,
    avatar_color || emp.avatar_color,
    emp.id
  );

  logAction('EMPLOYEE_UPDATED', `Updated profile of employee ${emp.name}`);
  res.json({ success: true, message: 'Employee updated successfully.' });
});

app.delete('/api/employees/:id', (req, res) => {
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found.' });

  db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  logAction('EMPLOYEE_DELETED', `Deleted employee ${emp.name} along with historical records.`);
  res.json({ success: true, message: 'Employee deleted successfully.' });
});

// ----------------------------------------------------
// ADVANCES CRUD
// ----------------------------------------------------
app.get('/api/advances', (req, res) => {
  const advances = db.prepare(`
    SELECT a.*, e.name as employee_name, e.department, e.designation, e.avatar_color
    FROM advances a
    JOIN employees e ON a.employee_id = e.id
    ORDER BY a.advance_date DESC
  `).all();
  res.json({ success: true, advances });
});

app.post('/api/advances', (req, res) => {
  const { employee_id, advance_amount, remaining_balance, advance_date, reason } = req.body;
  if (!employee_id || !advance_amount) {
    return res.status(400).json({ success: false, message: 'Employee and advance amount are required.' });
  }

  const amt = Number(advance_amount) || 0;
  const rem = remaining_balance !== undefined && remaining_balance !== '' ? Number(remaining_balance) : amt;
  const id = uid('adv');

  let normalizedAdvDate = advance_date || new Date().toISOString().slice(0, 10);
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(normalizedAdvDate)) {
    const parts = normalizedAdvDate.split(/[\/\-]/);
    normalizedAdvDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  db.prepare(`
    INSERT INTO advances (id, employee_id, advance_amount, remaining_balance, advance_date, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, employee_id, amt, rem, normalizedAdvDate, (reason || '').trim());

  const emp = db.prepare('SELECT name FROM employees WHERE id = ?').get(employee_id);
  logAction('ADVANCE_ISSUED', `Issued salary advance of ₹${amt.toLocaleString()} to ${emp ? emp.name : 'employee'}`);

  res.status(201).json({ success: true, message: 'Advance recorded successfully.', id });
});

app.put('/api/advances/:id', (req, res) => {
  const { advance_amount, remaining_balance, advance_date, reason } = req.body;
  const adv = db.prepare('SELECT * FROM advances WHERE id = ?').get(req.params.id);
  if (!adv) return res.status(404).json({ success: false, message: 'Advance record not found.' });

  let normalizedAdvDate = advance_date || adv.advance_date;
  if (normalizedAdvDate && /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(normalizedAdvDate)) {
    const parts = normalizedAdvDate.split(/[\/\-]/);
    normalizedAdvDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  db.prepare(`
    UPDATE advances
    SET advance_amount = ?, remaining_balance = ?, advance_date = ?, reason = ?
    WHERE id = ?
  `).run(
    Number(advance_amount) || adv.advance_amount,
    remaining_balance !== undefined ? Number(remaining_balance) : adv.remaining_balance,
    normalizedAdvDate,
    reason !== undefined ? reason.trim() : adv.reason,
    adv.id
  );

  res.json({ success: true, message: 'Advance record updated.' });
});

app.delete('/api/advances/:id', (req, res) => {
  const adv = db.prepare('SELECT * FROM advances WHERE id = ?').get(req.params.id);
  if (!adv) return res.status(404).json({ success: false, message: 'Advance not found.' });

  db.prepare('DELETE FROM advances WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Advance record deleted.' });
});

// ----------------------------------------------------
// LEAVES CRUD
// ----------------------------------------------------
app.get('/api/leaves', (req, res) => {
  const leaves = db.prepare(`
    SELECT l.*, e.name as employee_name, e.department, e.designation, e.basic_salary, e.avatar_color
    FROM leaves l
    JOIN employees e ON l.employee_id = e.id
    ORDER BY l.created_at DESC
  `).all();
  res.json({ success: true, leaves });
});

app.post('/api/leaves', (req, res) => {
  const { employee_id, month, year, paid_leaves, unpaid_leaves, leave_deduction, reason } = req.body;
  if (!employee_id || !month) {
    return res.status(400).json({ success: false, message: 'Employee and Month are required.' });
  }

  const emp = db.prepare('SELECT basic_salary, name FROM employees WHERE id = ?').get(employee_id);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found.' });

  const paid = Number(paid_leaves) || 0;
  const unpaid = Number(unpaid_leaves) || 0;
  let deduction = Number(leave_deduction);

  // Auto-calculate deduction if unpaid days provided and deduction not explicitly forced
  if (isNaN(deduction) || deduction === 0) {
    const perDayRate = (emp.basic_salary || 0) / 30;
    deduction = Math.round(unpaid * perDayRate);
  }

  const id = uid('lv');
  const yr = Number(year) || new Date().getFullYear();

  db.prepare(`
    INSERT INTO leaves (id, employee_id, month, year, paid_leaves, unpaid_leaves, leave_deduction, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, employee_id, month, yr, paid, unpaid, deduction, (reason || '').trim());

  logAction('LEAVE_RECORDED', `Recorded ${paid + unpaid} leave days for ${emp.name} (${month} ${yr})`);
  res.status(201).json({ success: true, message: 'Leave record added.', id });
});

app.put('/api/leaves/:id', (req, res) => {
  const { month, year, paid_leaves, unpaid_leaves, leave_deduction, reason } = req.body;
  const lv = db.prepare('SELECT * FROM leaves WHERE id = ?').get(req.params.id);
  if (!lv) return res.status(404).json({ success: false, message: 'Leave record not found.' });

  db.prepare(`
    UPDATE leaves
    SET month = ?, year = ?, paid_leaves = ?, unpaid_leaves = ?, leave_deduction = ?, reason = ?
    WHERE id = ?
  `).run(
    month || lv.month,
    year || lv.year,
    paid_leaves !== undefined ? Number(paid_leaves) : lv.paid_leaves,
    unpaid_leaves !== undefined ? Number(unpaid_leaves) : lv.unpaid_leaves,
    leave_deduction !== undefined ? Number(leave_deduction) : lv.leave_deduction,
    reason !== undefined ? reason.trim() : lv.reason,
    lv.id
  );

  res.json({ success: true, message: 'Leave record updated.' });
});

app.delete('/api/leaves/:id', (req, res) => {
  const lv = db.prepare('SELECT * FROM leaves WHERE id = ?').get(req.params.id);
  if (!lv) return res.status(404).json({ success: false, message: 'Leave record not found.' });

  db.prepare('DELETE FROM leaves WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Leave record deleted.' });
});

// ----------------------------------------------------
// PAYROLL ENGINE
// ----------------------------------------------------
app.get('/api/payroll', (req, res) => {
  const { month, year, status } = req.query;
  let query = `
    SELECT p.*, e.name as employee_name, e.department, e.designation, e.avatar_color, e.mobile, e.email
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    WHERE 1=1
  `;
  const params = [];
  if (month && month !== 'All') {
    query += ' AND p.month = ?';
    params.push(month);
  }
  if (year) {
    query += ' AND p.year = ?';
    params.push(Number(year));
  }
  if (status && status !== 'All') {
    query += ' AND p.payment_status = ?';
    params.push(status);
  }

  query += ' ORDER BY p.created_at DESC';
  const payroll = db.prepare(query).all(...params);
  res.json({ success: true, payroll });
});

app.post('/api/payroll/calculate-preview', (req, res) => {
  const { employee_id, month, year, bonus = 0, other_deduction = 0 } = req.body;
  if (!employee_id || !month) {
    return res.status(400).json({ success: false, message: 'Employee and Month are required.' });
  }

  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found.' });

  const yr = Number(year) || new Date().getFullYear();
  const basicSalary = Number(emp.basic_salary) || 0;

  // Total outstanding advances for this employee
  const outstandingAdvance = db.prepare('SELECT COALESCE(SUM(remaining_balance), 0) as total FROM advances WHERE employee_id = ?').get(employee_id).total;

  // Leave deduction for this month
  const leaveRec = db.prepare('SELECT COALESCE(SUM(leave_deduction), 0) as total FROM leaves WHERE employee_id = ? AND month = ? AND year = ?').get(employee_id, month, yr);
  const leaveDeduction = leaveRec ? leaveRec.total : 0;

  const bonusVal = Number(bonus) || 0;
  const otherDedVal = Number(other_deduction) || 0;

  // Let advance deduction equal the outstanding advance balance (up to basic salary limit)
  const advanceDeduction = Math.min(outstandingAdvance, basicSalary);
  const netSalary = Math.max(0, basicSalary + bonusVal - advanceDeduction - leaveDeduction - otherDedVal);

  res.json({
    success: true,
    preview: {
      employee_id,
      employee_name: emp.name,
      department: emp.department,
      designation: emp.designation,
      month,
      year: yr,
      basic_salary: basicSalary,
      advance_deduction: advanceDeduction,
      total_outstanding_advance: outstandingAdvance,
      leave_deduction: leaveDeduction,
      bonus: bonusVal,
      other_deduction: otherDedVal,
      net_salary: netSalary
    }
  });
});

app.post('/api/payroll/generate', (req, res) => {
  const { employee_id, month, year, bonus = 0, other_deduction = 0, custom_advance_deduction, notes } = req.body;
  if (!employee_id || !month) {
    return res.status(400).json({ success: false, message: 'Employee and Month are required.' });
  }

  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found.' });

  const yr = Number(year) || new Date().getFullYear();
  const basicSalary = Number(emp.basic_salary) || 0;

  // Outstanding advances
  const outstandingAdvances = db.prepare(`
    SELECT * FROM advances 
    WHERE employee_id = ? AND remaining_balance > 0 
    ORDER BY advance_date ASC
  `).all(employee_id);

  const totalOutstanding = outstandingAdvances.reduce((sum, a) => sum + (Number(a.remaining_balance) || 0), 0);

  // Determine advance deduction to apply
  let advanceDeduction = custom_advance_deduction !== undefined && custom_advance_deduction !== ''
    ? Number(custom_advance_deduction)
    : Math.min(totalOutstanding, basicSalary);

  // Leave deduction
  const leaveRec = db.prepare('SELECT COALESCE(SUM(leave_deduction), 0) as total FROM leaves WHERE employee_id = ? AND month = ? AND year = ?').get(employee_id, month, yr);
  const leaveDeduction = leaveRec ? leaveRec.total : 0;

  const bonusVal = Number(bonus) || 0;
  const otherDedVal = Number(other_deduction) || 0;
  const netSalary = Math.max(0, basicSalary + bonusVal - advanceDeduction - leaveDeduction - otherDedVal);

  // Check if payroll already exists for this employee & month/year
  const existing = db.prepare('SELECT * FROM payroll WHERE employee_id = ? AND month = ? AND year = ?').get(employee_id, month, yr);

  const executeTransaction = db.transaction(() => {
    let payrollId;
    if (existing) {
      payrollId = existing.id;
      db.prepare(`
        UPDATE payroll 
        SET basic_salary = ?, advance_deduction = ?, leave_deduction = ?, bonus = ?, 
            other_deduction = ?, net_salary = ?, notes = ?
        WHERE id = ?
      `).run(basicSalary, advanceDeduction, leaveDeduction, bonusVal, otherDedVal, netSalary, notes || existing.notes, existing.id);
    } else {
      payrollId = uid('pr');
      db.prepare(`
        INSERT INTO payroll (id, employee_id, month, year, basic_salary, advance_deduction, leave_deduction, bonus, other_deduction, net_salary, payment_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
      `).run(payrollId, employee_id, month, yr, basicSalary, advanceDeduction, leaveDeduction, bonusVal, otherDedVal, netSalary, notes || null);

      // Deduct from advances if new record
      let toDeduct = advanceDeduction;
      for (const adv of outstandingAdvances) {
        if (toDeduct <= 0) break;
        const deductAmt = Math.min(adv.remaining_balance, toDeduct);
        const newBalance = adv.remaining_balance - deductAmt;
        db.prepare('UPDATE advances SET remaining_balance = ? WHERE id = ?').run(newBalance, adv.id);
        toDeduct -= deductAmt;
      }
    }
    return payrollId;
  });

  const payrollId = executeTransaction();
  logAction('PAYROLL_GENERATED', `Generated salary (₹${netSalary.toLocaleString()}) for ${emp.name} for ${month} ${yr}`);

  res.status(201).json({
    success: true,
    message: existing ? 'Salary record updated successfully.' : 'Salary generated successfully.',
    id: payrollId,
    netSalary
  });
});

app.post('/api/payroll/generate-all', (req, res) => {
  const { month, year } = req.body;
  if (!month) return res.status(400).json({ success: false, message: 'Month is required.' });

  const yr = Number(year) || new Date().getFullYear();
  const activeEmployees = db.prepare("SELECT * FROM employees WHERE status = 'Active'").all();

  let generatedCount = 0;
  const generateBatch = db.transaction(() => {
    for (const emp of activeEmployees) {
      const existing = db.prepare('SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?').get(emp.id, month, yr);
      if (existing) continue; // Skip if already generated

      const basicSalary = Number(emp.basic_salary) || 0;
      const advances = db.prepare('SELECT * FROM advances WHERE employee_id = ? AND remaining_balance > 0 ORDER BY advance_date ASC').all(emp.id);
      const totalAdv = advances.reduce((s, a) => s + (Number(a.remaining_balance) || 0), 0);
      const advanceDed = Math.min(totalAdv, basicSalary);

      const leaveRec = db.prepare('SELECT COALESCE(SUM(leave_deduction), 0) as total FROM leaves WHERE employee_id = ? AND month = ? AND year = ?').get(emp.id, month, yr);
      const leaveDed = leaveRec ? leaveRec.total : 0;

      const netSalary = Math.max(0, basicSalary - advanceDed - leaveDed);

      const prId = uid('pr');
      db.prepare(`
        INSERT INTO payroll (id, employee_id, month, year, basic_salary, advance_deduction, leave_deduction, bonus, other_deduction, net_salary, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'Pending')
      `).run(prId, emp.id, month, yr, basicSalary, advanceDed, leaveDed, netSalary);

      // Deduct advance
      let toDeduct = advanceDed;
      for (const adv of advances) {
        if (toDeduct <= 0) break;
        const deductAmt = Math.min(adv.remaining_balance, toDeduct);
        db.prepare('UPDATE advances SET remaining_balance = ? WHERE id = ?').run(adv.remaining_balance - deductAmt, adv.id);
        toDeduct -= deductAmt;
      }

      generatedCount++;
    }
  });

  generateBatch();
  logAction('BATCH_PAYROLL', `Bulk generated salaries for ${generatedCount} employees for ${month} ${yr}`);
  res.json({ success: true, message: `Successfully generated payroll for ${generatedCount} employees.` });
});

app.put('/api/payroll/:id/pay', (req, res) => {
  const { payment_method = 'Bank Transfer (NEFT)', payment_ref = '', notes = '' } = req.body;
  const payroll = db.prepare(`
    SELECT p.*, e.name as employee_name
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!payroll) return res.status(404).json({ success: false, message: 'Payroll record not found.' });

  const paymentDate = new Date().toISOString().slice(0, 10);
  const ref = payment_ref || `PAY-${Date.now().toString(36).toUpperCase()}`;

  db.prepare(`
    UPDATE payroll 
    SET payment_status = 'Paid', payment_date = ?, payment_method = ?, payment_ref = ?, notes = ?
    WHERE id = ?
  `).run(paymentDate, payment_method, ref, notes || payroll.notes, payroll.id);

  logAction('PAYMENT_DISBURSED', `Marked salary of ₹${payroll.net_salary.toLocaleString()} as Paid for ${payroll.employee_name} (${payroll.month} ${payroll.year}) via ${payment_method}`);
  res.json({ success: true, message: 'Payment status updated to Paid.', paymentDate, paymentRef: ref });
});

app.delete('/api/payroll/:id', (req, res) => {
  const pr = db.prepare('SELECT * FROM payroll WHERE id = ?').get(req.params.id);
  if (!pr) return res.status(404).json({ success: false, message: 'Payroll record not found.' });

  db.prepare('DELETE FROM payroll WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Payroll record deleted.' });
});

app.get('/api/payroll/:id/payslip', (req, res) => {
  const payroll = db.prepare(`
    SELECT p.*, e.name as employee_name, e.email, e.mobile, e.department, e.designation, e.joining_date, e.address, e.avatar_color
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!payroll) return res.status(404).json({ success: false, message: 'Payroll record not found.' });

  const companyRows = db.prepare('SELECT key, value FROM company_settings').all();
  const company = {};
  companyRows.forEach(r => { company[r.key] = r.value; });

  const leaveInfo = db.prepare('SELECT paid_leaves, unpaid_leaves, leave_deduction FROM leaves WHERE employee_id = ? AND month = ? AND year = ?').get(payroll.employee_id, payroll.month, payroll.year) || { paid_leaves: 0, unpaid_leaves: 0, leave_deduction: 0 };

  res.json({
    success: true,
    payslip: {
      ...payroll,
      leaveInfo,
      company
    }
  });
});

// ----------------------------------------------------
// REPORTS & ACTIVITY LOGS
// ----------------------------------------------------
app.get('/api/reports', (req, res) => {
  const { month, year, department, status } = req.query;
  let query = `
    SELECT p.*, e.name as employee_name, e.department, e.designation, e.mobile
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    WHERE 1=1
  `;
  const params = [];
  if (month && month !== 'All') {
    query += ' AND p.month = ?';
    params.push(month);
  }
  if (year && year !== 'All') {
    query += ' AND p.year = ?';
    params.push(Number(year));
  }
  if (department && department !== 'All') {
    query += ' AND e.department = ?';
    params.push(department);
  }
  if (status && status !== 'All') {
    query += ' AND p.payment_status = ?';
    params.push(status);
  }

  query += ' ORDER BY p.year DESC, p.month DESC, e.name ASC';
  const rows = db.prepare(query).all(...params);

  const summary = {
    totalRecords: rows.length,
    totalBasic: rows.reduce((s, r) => s + (Number(r.basic_salary) || 0), 0),
    totalBonus: rows.reduce((s, r) => s + (Number(r.bonus) || 0), 0),
    totalAdvanceDeductions: rows.reduce((s, r) => s + (Number(r.advance_deduction) || 0), 0),
    totalLeaveDeductions: rows.reduce((s, r) => s + (Number(r.leave_deduction) || 0), 0),
    totalOtherDeductions: rows.reduce((s, r) => s + (Number(r.other_deduction) || 0), 0),
    totalNetDisbursed: rows.reduce((s, r) => s + (Number(r.net_salary) || 0), 0),
    paidCount: rows.filter(r => r.payment_status === 'Paid').length,
    pendingCount: rows.filter(r => r.payment_status === 'Pending').length
  };

  res.json({ success: true, rows, summary });
});

app.get('/api/logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50').all();
  res.json({ success: true, logs });
});

// ----------------------------------------------------
// SETTINGS
// ----------------------------------------------------
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM company_settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json({ success: true, settings });
});

app.put('/api/settings', (req, res) => {
  const settings = req.body;
  const updateStmt = db.prepare('INSERT OR REPLACE INTO company_settings (key, value) VALUES (?, ?)');
  const updateMany = db.transaction(() => {
    for (const [k, v] of Object.entries(settings)) {
      updateStmt.run(k, String(v));
    }
  });
  updateMany();
  logAction('SETTINGS_UPDATED', 'Updated enterprise company profile settings');
  res.json({ success: true, message: 'Settings saved successfully.' });
});

app.post('/api/settings/reset-demo', (req, res) => {
  try {
    db.exec(`
      DELETE FROM activity_logs;
      DELETE FROM payroll;
      DELETE FROM leaves;
      DELETE FROM advances;
      DELETE FROM employees;
      DELETE FROM company_settings;
      DELETE FROM users;
    `);
    initDatabase();
    logAction('DEMO_RESET', 'Restored sample enterprise database and default records');
    res.json({ success: true, message: 'Database reset to default demo dataset successfully.' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset database.' });
  }
});

// Catch-all route to serve the Single Page App
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  🚀 Paytrack Full-Stack Server running at:`);
    console.log(`     http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
