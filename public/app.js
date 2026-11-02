/* ============================================================
   PAYTRACK - FULL-STACK CLIENT APPLICATION LOGIC
   ============================================================ */

// App State
const state = {
  user: null,
  activePage: 'dashboard',
  employees: [],
  advances: [],
  leaves: [],
  payroll: [],
  stats: null,
  settings: {},
  employeeViewMode: 'table', // 'table' | 'cards'
  charts: {
    trendsChart: null,
    deptChart: null
  }
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DEPARTMENTS = ["Engineering", "Product & Design", "Marketing", "Sales", "Human Resources", "Finance", "Operations"];

function currentMonth() {
  return MONTHS[new Date().getMonth()];
}
function currentYear() {
  return new Date().getFullYear();
}
function money(val, currency = '₹') {
  const num = Number(val) || 0;
  return `${currency} ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// ----------------------------------------------------
// UNIFIED DATE UTILITIES (Consistent DD/MM/YYYY Format)
// ----------------------------------------------------
function formatDate(dateInput) {
  if (!dateInput) return '—';
  let d;
  if (typeof dateInput === 'string') {
    const clean = dateInput.trim();
    if (!clean || clean === '—') return '—';
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, day] = clean.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
      return clean;
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
      return clean.replace(/-/g, '/');
    } else if (clean.includes(' ') && !clean.includes('T')) {
      d = new Date(clean.replace(' ', 'T'));
    } else {
      d = new Date(clean);
    }
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) return dateInput;

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  let d;
  if (typeof dateInput === 'string') {
    const clean = dateInput.trim();
    if (!clean || clean === '—') return '—';
    if (clean.includes(' ') && !clean.includes('T')) {
      d = new Date(clean.replace(' ', 'T'));
    } else {
      d = new Date(clean);
    }
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) return dateInput;

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${dd}/${mm}/${yyyy}, ${timeStr}`;
}

function toInputDate(val) {
  if (!val) return new Date().toISOString().slice(0, 10);
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return new Date().toISOString().slice(0, 10);
}

function normalizeDate(val) {
  return toInputDate(val);
}

// ----------------------------------------------------
// API CLIENT WRAPPER
// ----------------------------------------------------
async function apiFetch(endpoint, options = {}) {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const res = await fetch(endpoint, config);
    const data = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data.message || `API error: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`Fetch Error [${endpoint}]:`, err);
    showToast('error', 'Request Failed', err.message);
    throw err;
  }
}

// ----------------------------------------------------
// TOAST NOTIFICATIONS
// ----------------------------------------------------
function showToast(type = 'info', title = '', message = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-msg">${escapeHtml(message)}</div>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ----------------------------------------------------
// THEME & INITIALIZATION
// ----------------------------------------------------
function initTheme() {
  const saved = localStorage.getItem('paytrack_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('paytrack_theme', next);
  if (state.activePage === 'dashboard') {
    renderDashboardCharts();
  }
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------
async function handleLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const btn = document.getElementById('loginBtn');

  if (!username || !password) {
    showToast('warning', 'Missing Fields', 'Please enter both username and password.');
    return;
  }

  try {
    btn.disabled = true;
    btn.innerHTML = `<span>Signing In...</span>`;

    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { username, password }
    });

    state.user = data.user;
    sessionStorage.setItem('paytrack_session', JSON.stringify(data.user));

    showToast('success', 'Authentication Successful', `Welcome, ${data.user.name || data.user.username}!`);
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appShell').style.display = 'grid';

    document.getElementById('sidebarUserName').textContent = data.user.name || data.user.username;
    document.getElementById('sidebarUserRole').textContent = data.user.role || 'Admin';
    document.getElementById('sidebarUserAvatar').textContent = (data.user.name || data.user.username).charAt(0).toUpperCase();

    await loadInitialAppData();
    navigateTo('dashboard');
  } catch (err) {
    // Toast already shown
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>Sign In to Dashboard</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
  }
}

function handleLogout() {
  sessionStorage.removeItem('paytrack_session');
  state.user = null;
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  showToast('info', 'Signed Out', 'You have been safely signed out.');
}

// ----------------------------------------------------
// ROUTING & NAVIGATION
// ----------------------------------------------------
function navigateTo(page) {
  state.activePage = page;
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  const titles = {
    dashboard: 'Dashboard Overview',
    employees: 'Employee Workforce Directory',
    advances: 'Employee Advance Ledger',
    leaves: 'Attendance & Leave Deductions',
    payroll: 'Payroll Disbursal Engine',
    payslips: 'Executive Payslip Documents',
    reports: 'Payroll Analytics & Reports',
    logs: 'Security & Activity Audit Log',
    settings: 'Company Profile & Settings'
  };

  document.getElementById('headerPageTitle').textContent = titles[page] || 'Dashboard';
  
  const pageRenderers = {
    dashboard: renderDashboardView,
    employees: renderEmployeesView,
    advances: renderAdvancesView,
    leaves: renderLeavesView,
    payroll: renderPayrollView,
    payslips: renderPayslipsView,
    reports: renderReportsView,
    logs: renderLogsView,
    settings: renderSettingsView
  };

  const container = document.getElementById('pageContent');
  container.innerHTML = '';
  if (pageRenderers[page]) {
    pageRenderers[page]();
  }
}

document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

function toggleMobileSidebar() {
  document.getElementById('appSidebar').classList.toggle('open');
}

// ----------------------------------------------------
// DATA LOADING
// ----------------------------------------------------
async function loadInitialAppData() {
  try {
    const [empData, settsData] = await Promise.all([
      apiFetch('/api/employees'),
      apiFetch('/api/settings')
    ]);
    state.employees = empData.employees || [];
    state.settings = settsData.settings || {};
    document.getElementById('sidebarEmpCount').textContent = state.employees.length;
  } catch (e) {
    console.error('Initial load failed', e);
  }
}

// ============================================================
// VIEW 1: DASHBOARD
// ============================================================
async function renderDashboardView() {
  const container = document.getElementById('pageContent');
  container.innerHTML = `<div class="empty-placeholder"><p>Loading metrics & analytics...</p></div>`;

  try {
    const data = await apiFetch('/api/dashboard/stats');
    state.stats = data.stats;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Payroll Dashboard</h1>
          <p>Financial overview, active roster, and live monthly arithmetic</p>
        </div>
        <div class="page-actions-group">
          <div style="display:inline-flex; align-items:center; gap:6px; background:var(--bg-card); border:1px solid var(--border-subtle); padding:6px 12px; border-radius:8px; font-size:12px; color:var(--text-secondary); font-weight:500;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Date: <b style="color:var(--text-primary); font-family:var(--font-mono, monospace);">${formatDate(new Date())}</b></span>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="openBulkSalaryModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span>Run Monthly Batch</span>
          </button>
          <button class="btn btn-primary btn-sm" onclick="openEmployeeModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-head">
            <div class="stat-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <span class="stat-tag">${data.stats.activeEmployees} Active</span>
          </div>
          <div class="stat-label">Total Workforce</div>
          <div class="stat-value">${data.stats.totalEmployees}</div>
          <div class="stat-subtext">${data.stats.inactiveEmployees} inactive / on-leave</div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-card-head">
            <div class="stat-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span class="stat-tag">Active Roster</span>
          </div>
          <div class="stat-label">Monthly Base Salary</div>
          <div class="stat-value">${money(data.stats.totalBaseSalary)}</div>
          <div class="stat-subtext">Sum of active employee base pay</div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-card-head">
            <div class="stat-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            </div>
            <span class="stat-tag">Outstanding</span>
          </div>
          <div class="stat-label">Active Advances</div>
          <div class="stat-value">${money(data.stats.totalAdvanceOutstanding)}</div>
          <div class="stat-subtext">Total distributed: ${money(data.stats.totalAdvanceDistributed)}</div>
        </div>

        <div class="stat-card stat-purple">
          <div class="stat-card-head">
            <div class="stat-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span class="stat-tag">Processed</span>
          </div>
          <div class="stat-label">Paid Net Salary</div>
          <div class="stat-value">${money(data.stats.totalPaidSalary)}</div>
          <div class="stat-subtext">Pending release: ${money(data.stats.totalPendingSalary)}</div>
        </div>
      </div>

      <!-- Analytics Charts Row -->
      <div class="analytics-row">
        <div class="chart-card">
          <div class="chart-card-head">
            <div>
              <h3>Monthly Payroll Expenditure Trend</h3>
              <p class="form-hint">Disbursed vs Pending net salaries</p>
            </div>
          </div>
          <div class="chart-container-wrap">
            <canvas id="payrollTrendsChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-head">
            <div>
              <h3>Department Headcount & Cost</h3>
              <p class="form-hint">Workforce distribution</p>
            </div>
          </div>
          <div class="chart-container-wrap">
            <canvas id="departmentDonutChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Payroll & Activity Row -->
      <div class="analytics-row">
        <div class="table-card-container" style="margin-bottom:0;">
          <div class="table-toolbar">
            <div class="page-title-group">
              <h3 style="font-size:15px;">Recent Salary Disbursals</h3>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="navigateTo('payroll')">View All Payroll →</button>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Payroll Month</th>
                  <th>Disbursed Date</th>
                  <th class="num">Net Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${(data.recentPayroll && data.recentPayroll.length > 0) ? data.recentPayroll.map(p => `
                  <tr>
                    <td>
                      <div class="table-user-cell">
                        <div class="table-avatar" style="background:${p.avatar_color || '#6366f1'}">${(p.employee_name||'E').charAt(0)}</div>
                        <div class="table-user-info">
                          <span class="table-user-name">${escapeHtml(p.employee_name)}</span>
                          <span class="table-user-sub">${escapeHtml(p.designation)}</span>
                        </div>
                      </div>
                    </td>
                    <td><b>${p.month} ${p.year}</b></td>
                    <td class="mono" style="font-size:12px;">${p.payment_date ? formatDate(p.payment_date) : '<span class="text-muted">Pending</span>'}</td>
                    <td class="num font-bold">${money(p.net_salary)}</td>
                    <td>
                      <span class="status-pill ${p.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}">
                        <span class="status-dot"></span>${p.payment_status}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="viewPayslipModal('${p.id}')">Payslip</button>
                    </td>
                  </tr>
                `).join('') : `<tr><td colspan="6" style="text-align:center; padding:30px;">No payroll runs yet.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <div class="chart-card" style="padding:20px;">
          <div class="chart-card-head" style="margin-bottom:14px;">
            <h3>Live Audit Feed</h3>
            <button class="btn btn-ghost btn-sm" onclick="navigateTo('logs')">All Logs</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${(data.recentActivities && data.recentActivities.length > 0) ? data.recentActivities.map(l => `
              <div style="display:flex; gap:10px; align-items:flex-start; font-size:12.5px; border-bottom:1px solid var(--border-subtle); padding-bottom:10px;">
                <div style="width:22px; height:22px; border-radius:50%; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:10px; font-weight:700;">✓</div>
                <div style="flex:1;">
                  <div style="color:var(--text-primary); font-weight:500;">${escapeHtml(l.description)}</div>
                  <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${formatDateTime(l.created_at)} • by ${escapeHtml(l.user)}</div>
                </div>
              </div>
            `).join('') : '<p style="color:var(--text-muted); font-size:12px;">No recent activity.</p>'}
          </div>
        </div>
      </div>
    `;

    renderDashboardCharts(data.monthlyTrends, data.departmentDistribution);
  } catch (e) {
    container.innerHTML = `<div class="empty-placeholder"><h4>Failed to load dashboard</h4><p>${e.message}</p></div>`;
  }
}

function renderDashboardCharts(trends = [], departments = []) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)';

  // 1. Trends Bar Chart
  const trendCtx = document.getElementById('payrollTrendsChart');
  if (trendCtx) {
    if (state.charts.trendsChart) state.charts.trendsChart.destroy();
    
    const labels = trends.map(t => `${t.month.slice(0,3)} ${t.year}`);
    const paidData = trends.map(t => t.paid);
    const pendingData = trends.map(t => t.pending);

    state.charts.trendsChart = new Chart(trendCtx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['June 2026', 'July 2026', 'August 2026'],
        datasets: [
          {
            label: 'Paid Disbursal (₹)',
            data: paidData.length ? paidData : [180000, 320000, 71600],
            backgroundColor: '#059669',
            borderRadius: 6,
            maxBarThickness: 28
          },
          {
            label: 'Pending Disbursal (₹)',
            data: pendingData.length ? pendingData : [0, 0, 140500],
            backgroundColor: '#d97706',
            borderRadius: 6,
            maxBarThickness: 28
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'top',
            align: 'end',
            labels: { 
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: 'circle',
              color: textColor, 
              font: { family: 'Inter', size: 11, weight: '500' } 
            } 
          },
          tooltip: {
            backgroundColor: isDark ? '#192338' : '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            padding: 10,
            cornerRadius: 6,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderWidth: isDark ? 1 : 0
          }
        },
        scales: {
          x: { 
            grid: { color: gridColor, drawBorder: false }, 
            ticks: { color: textColor, font: { family: 'Inter', size: 11 } } 
          },
          y: { 
            grid: { color: gridColor, drawBorder: false }, 
            ticks: { 
              color: textColor, 
              font: { family: 'JetBrains Mono', size: 10 },
              callback: v => '₹' + (v/1000) + 'k' 
            } 
          }
        }
      }
    });
  }

  // 2. Department Donut Chart
  const deptCtx = document.getElementById('departmentDonutChart');
  if (deptCtx) {
    if (state.charts.deptChart) state.charts.deptChart.destroy();

    const deptLabels = departments.map(d => d.department);
    const deptCounts = departments.map(d => d.count);
    const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0284c7', '#dc2626', '#64748b'];

    state.charts.deptChart = new Chart(deptCtx, {
      type: 'doughnut',
      data: {
        labels: deptLabels.length ? deptLabels : ['Engineering', 'Design', 'Marketing', 'Sales'],
        datasets: [{
          data: deptCounts.length ? deptCounts : [3, 1, 1, 1],
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: isDark ? '#131b2e' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { 
              boxWidth: 8,
              boxHeight: 8,
              usePointStyle: true,
              pointStyle: 'circle',
              color: textColor, 
              font: { size: 11, family: 'Inter' } 
            } 
          },
          tooltip: {
            backgroundColor: isDark ? '#192338' : '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            padding: 10,
            cornerRadius: 6,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderWidth: isDark ? 1 : 0
          }
        }
      }
    });
  }
}

// ============================================================
// VIEW 2: EMPLOYEES
// ============================================================
async function renderEmployeesView(filterDept = 'All', filterStatus = 'All', search = '') {
  const container = document.getElementById('pageContent');

  let query = `/api/employees?department=${encodeURIComponent(filterDept)}&status=${encodeURIComponent(filterStatus)}`;
  if (search) query += `&search=${encodeURIComponent(search)}`;

  try {
    const data = await apiFetch(query);
    state.employees = data.employees || [];

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Workforce Directory</h1>
          <p>Manage employee records, designations, salaries, and profiles</p>
        </div>
        <div class="page-actions-group">
          <div class="btn-group" style="display:flex; background:var(--bg-tertiary); border-radius:8px; padding:3px;">
            <button class="btn btn-sm ${state.employeeViewMode === 'table' ? 'btn-secondary' : 'btn-ghost'}" onclick="setEmployeeView('table')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <span>Table</span>
            </button>
            <button class="btn btn-sm ${state.employeeViewMode === 'cards' ? 'btn-secondary' : 'btn-ghost'}" onclick="setEmployeeView('cards')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>Cards</span>
            </button>
          </div>
          <button class="btn btn-accent btn-sm" onclick="openEmployeeModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      <!-- Department Filter Pills -->
      <div class="table-card-container">
        <div class="table-toolbar">
          <div class="toolbar-filter-pills">
            <span class="filter-pill ${filterDept === 'All' ? 'active' : ''}" onclick="renderEmployeesView('All', '${filterStatus}', '${escapeHtml(search)}')">All (${state.employees.length})</span>
            ${DEPARTMENTS.map(d => `
              <span class="filter-pill ${filterDept === d ? 'active' : ''}" onclick="renderEmployeesView('${d}', '${filterStatus}', '${escapeHtml(search)}')">${d}</span>
            `).join('')}
          </div>

          <div style="display:flex; gap:10px;">
            <select style="width:130px; padding:6px 10px; font-size:12px;" onchange="renderEmployeesView('${filterDept}', this.value, '${escapeHtml(search)}')">
              <option value="All" ${filterStatus === 'All' ? 'selected' : ''}>All Status</option>
              <option value="Active" ${filterStatus === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${filterStatus === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>

        ${state.employees.length === 0 ? `
          <div class="empty-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <h4>No Employees Found</h4>
            <p>No records match your criteria. Click "Add New Employee" to register a team member.</p>
          </div>
        ` : (state.employeeViewMode === 'table' ? renderEmployeeTableViewHtml(state.employees) : renderEmployeeCardViewHtml(state.employees))}
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<div class="empty-placeholder"><p>Error loading employees: ${e.message}</p></div>`;
  }
}

function setEmployeeView(mode) {
  state.employeeViewMode = mode;
  renderEmployeesView();
}

function renderEmployeeTableViewHtml(employees) {
  return `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Joined</th>
            <th class="num">Base Salary</th>
            <th class="num">Active Advance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${employees.map(e => `
            <tr>
              <td>
                <div class="table-user-cell">
                  <div class="table-avatar" style="background:${e.avatar_color || '#6366f1'}">${e.name.charAt(0)}</div>
                  <div class="table-user-info">
                    <span class="table-user-name">${escapeHtml(e.name)}</span>
                    <span class="table-user-sub">${escapeHtml(e.email || e.mobile || 'No contact')}</span>
                  </div>
                </div>
              </td>
              <td><span class="emp-dept-badge">${escapeHtml(e.department)}</span></td>
              <td>${escapeHtml(e.designation)}</td>
              <td class="mono text-muted" style="font-size:12px;">${formatDate(e.joining_date)}</td>
              <td class="num font-bold">${money(e.basic_salary)}</td>
              <td class="num">${e.activeAdvance > 0 ? `<span style="color:var(--warning); font-weight:600;">${money(e.activeAdvance)}</span>` : '<span class="text-muted">₹ 0</span>'}</td>
              <td>
                <span class="status-pill ${e.status === 'Active' ? 'status-active' : 'status-inactive'}">
                  <span class="status-dot"></span>${e.status}
                </span>
              </td>
              <td>
                <div style="display:flex; gap:6px;">
                  <button class="btn btn-secondary btn-sm" onclick="viewEmployeeProfileModal('${e.id}')" title="View Full Profile">Profile</button>
                  <button class="btn btn-ghost btn-sm" onclick="openEmployeeModal('${e.id}')" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="deleteEmployeePrompt('${e.id}', '${escapeHtml(e.name)}')" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderEmployeeCardViewHtml(employees) {
  return `
    <div style="padding:20px;">
      <div class="employee-card-grid">
        ${employees.map(e => `
          <div class="emp-profile-card">
            <div class="emp-card-top">
              <div class="emp-avatar-lg" style="background:${e.avatar_color || '#6366f1'}">${e.name.charAt(0)}</div>
              <div class="emp-title-details">
                <h3>${escapeHtml(e.name)}</h3>
                <div class="emp-desig-tag">${escapeHtml(e.designation)}</div>
                <div class="emp-dept-badge">${escapeHtml(e.department)}</div>
              </div>
              <span class="status-pill ${e.status === 'Active' ? 'status-active' : 'status-inactive'}">${e.status}</span>
            </div>

            <div class="emp-contact-list">
              <div class="emp-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>${escapeHtml(e.email || '—')}</span>
              </div>
              <div class="emp-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>${escapeHtml(e.mobile || '—')}</span>
              </div>
              <div class="emp-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Joined: <b>${formatDate(e.joining_date)}</b></span>
              </div>
            </div>

            <div class="emp-salary-strip">
              <span class="emp-salary-label">Base Monthly</span>
              <span class="emp-salary-val">${money(e.basic_salary)}</span>
            </div>

            <div class="emp-card-actions">
              <button class="btn btn-secondary btn-sm btn-block" onclick="viewEmployeeProfileModal('${e.id}')">Profile & Ledger</button>
              <button class="btn btn-ghost btn-sm" onclick="openEmployeeModal('${e.id}')" title="Edit">Edit</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// INLINE MODAL ERROR UTILITY
// ----------------------------------------------------
function showModalError(msg) {
  let errBox = document.getElementById('modalInlineError');
  if (!errBox) {
    errBox = document.createElement('div');
    errBox.id = 'modalInlineError';
    const form = document.querySelector('.modal-body form') || document.querySelector('.modal-body');
    if (form) {
      form.prepend(errBox);
    }
  }
  errBox.innerHTML = `
    <div style="display:flex; align-items:flex-start; gap:10px; padding:12px 14px; background:rgba(239, 68, 68, 0.12); border:1px solid rgba(239, 68, 68, 0.35); border-radius:10px; color:#ef4444; font-size:13px; font-weight:500; margin-bottom:16px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="flex-shrink:0; margin-top:1px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <div style="flex:1; line-height:1.4;">${escapeHtml(msg)}</div>
    </div>
  `;
}

// ----------------------------------------------------
// EMPLOYEE CRUD MODALS
// ----------------------------------------------------
function openEmployeeModal(id = null) {
  const emp = id ? state.employees.find(e => e.id === id) : null;
  const title = emp ? 'Edit Employee Profile' : 'Register New Employee';
  const sub = emp ? `Update information for ${emp.name}` : 'Fill in employee details to add to workforce';

  const bodyHtml = `
    <form id="empForm">
      <div class="form-grid-2">
        <div class="form-group">
          <label>Full Name *</label>
          <input id="emp_name" type="text" value="${emp ? escapeHtml(emp.name) : ''}" placeholder="e.g. Rahul Sharma" required />
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input id="emp_email" type="email" value="${emp ? escapeHtml(emp.email || '') : ''}" placeholder="e.g. rahul@company.com" />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Mobile Number</label>
          <input id="emp_mobile" type="tel" value="${emp ? escapeHtml(emp.mobile || '') : ''}" placeholder="e.g. +91 98765 43210" />
        </div>
        <div class="form-group">
          <label>Department *</label>
          <select id="emp_department">
            ${DEPARTMENTS.map(d => `<option value="${d}" ${emp && emp.department === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Designation *</label>
          <input id="emp_designation" type="text" value="${emp ? escapeHtml(emp.designation) : ''}" placeholder="e.g. Senior Software Engineer" required />
        </div>
        <div class="form-group">
          <label>Joining Date <span style="font-size:11px; font-weight:normal; color:var(--text-muted);">(DD/MM/YYYY)</span></label>
          <input id="emp_joining_date" type="date" value="${emp ? toInputDate(emp.joining_date) : toInputDate(new Date())}" />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Basic Salary (₹ / month) *</label>
          <input id="emp_basic_salary" type="number" min="0" value="${emp ? emp.basic_salary : 50000}" required />
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="emp_status">
            <option value="Active" ${!emp || emp.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${emp && emp.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Residential Address</label>
        <textarea id="emp_address" rows="2" placeholder="Full residential address...">${emp ? escapeHtml(emp.address || '') : ''}</textarea>
      </div>
    </form>
  `;

  openGlobalModal(title, sub, bodyHtml, [
    { label: 'Cancel', cls: 'btn-secondary', onClick: closeGlobalModal },
    { label: emp ? 'Save Changes' : 'Add Employee', cls: 'btn-primary', onClick: () => saveEmployeeSubmit(id) }
  ]);
}

async function saveEmployeeSubmit(id) {
  const name = document.getElementById('emp_name').value.trim();
  const department = document.getElementById('emp_department').value;
  const designation = document.getElementById('emp_designation').value.trim();
  const basic_salary = Number(document.getElementById('emp_basic_salary').value) || 0;
  const email = document.getElementById('emp_email').value.trim();
  const mobile = document.getElementById('emp_mobile').value.trim();
  const rawDate = document.getElementById('emp_joining_date').value;
  const status = document.getElementById('emp_status').value;
  const address = document.getElementById('emp_address').value.trim();

  // Clear previous inline error if present
  const prevErr = document.getElementById('modalInlineError');
  if (prevErr) prevErr.remove();

  if (!name || !department || !designation) {
    showToast('warning', 'Validation', 'Please fill in all required fields (Name, Department, Designation).');
    showModalError('Please fill in all required fields (Name, Department, Designation).');
    return;
  }

  // Frontend check for duplicate employee
  if (!id) {
    const duplicate = state.employees.find(e => {
      const matchName = e.name && e.name.toLowerCase().trim() === name.toLowerCase();
      const matchEmail = email && e.email && e.email.toLowerCase().trim() === email.toLowerCase();
      const matchMobile = mobile && e.mobile && e.mobile.trim() === mobile;
      return matchName || matchEmail || matchMobile;
    });

    if (duplicate) {
      let errMsg = `Employee already exists: '${duplicate.name}' is already registered in ${duplicate.department}.`;
      if (email && duplicate.email && duplicate.email.toLowerCase().trim() === email.toLowerCase()) {
        errMsg = `Employee already exists with email '${email}' (${duplicate.name} - ${duplicate.department}).`;
      } else if (mobile && duplicate.mobile && duplicate.mobile.trim() === mobile) {
        errMsg = `Employee already exists with mobile number '${mobile}' (${duplicate.name} - ${duplicate.department}).`;
      }
      showToast('warning', 'Employee Already Exists', errMsg);
      showModalError(errMsg);
      return;
    }
  } else {
    // When editing, check if updating to another employee's details
    const collision = state.employees.find(e => {
      if (e.id === id) return false;
      const matchName = e.name && e.name.toLowerCase().trim() === name.toLowerCase();
      const matchEmail = email && e.email && e.email.toLowerCase().trim() === email.toLowerCase();
      const matchMobile = mobile && e.mobile && e.mobile.trim() === mobile;
      return matchName || matchEmail || matchMobile;
    });

    if (collision) {
      const errMsg = `Another employee already exists with these details (${collision.name} - ${collision.department}).`;
      showToast('warning', 'Employee Already Exists', errMsg);
      showModalError(errMsg);
      return;
    }
  }

  const payload = {
    name,
    email,
    mobile,
    department,
    designation,
    joining_date: normalizeDate(rawDate),
    basic_salary,
    status,
    address
  };

  try {
    if (id) {
      await apiFetch(`/api/employees/${id}`, { method: 'PUT', body: payload });
      showToast('success', 'Updated', `Updated employee record for ${name}`);
    } else {
      await apiFetch('/api/employees', { method: 'POST', body: payload });
      showToast('success', 'Created', `Registered new employee ${name}`);
    }
    closeGlobalModal();
    await loadInitialAppData();
    renderEmployeesView();
  } catch (e) {
    showModalError(e.message || 'Failed to save employee record.');
  }
}

async function deleteEmployeePrompt(id, name) {
  if (!confirm(`Are you sure you want to delete ${name}? This will remove all associated advance, leave, and payroll records.`)) return;
  try {
    await apiFetch(`/api/employees/${id}`, { method: 'DELETE' });
    showToast('info', 'Deleted', `Employee ${name} removed.`);
    await loadInitialAppData();
    renderEmployeesView();
  } catch (e) {}
}

async function viewEmployeeProfileModal(id) {
  try {
    const data = await apiFetch(`/api/employees/${id}`);
    const emp = data.employee;
    const advances = data.advances || [];
    const payroll = data.payroll || [];

    const totalAdv = advances.reduce((s, a) => s + (Number(a.remaining_balance) || 0), 0);

    const bodyHtml = `
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px; background:var(--bg-tertiary); padding:16px; border-radius:12px;">
        <div class="emp-avatar-lg" style="background:${emp.avatar_color || '#6366f1'}; width:56px; height:56px; font-size:22px;">${emp.name.charAt(0)}</div>
        <div style="flex:1;">
          <h2 style="font-size:20px; margin-bottom:2px;">${escapeHtml(emp.name)}</h2>
          <div style="font-size:13px; color:var(--text-secondary);">${escapeHtml(emp.designation)} • <span class="emp-dept-badge">${escapeHtml(emp.department)}</span></div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted);">Base Salary</div>
          <div style="font-size:18px; font-weight:700; color:var(--primary); font-family:var(--font-mono);">${money(emp.basic_salary)}</div>
        </div>
      </div>

      <div class="form-grid-2" style="margin-bottom:20px; font-size:13px;">
        <div><b>Email:</b> ${escapeHtml(emp.email || '—')}</div>
        <div><b>Mobile:</b> ${escapeHtml(emp.mobile || '—')}</div>
        <div><b>Joined Date:</b> <span class="mono">${formatDate(emp.joining_date)}</span></div>
        <div><b>Outstanding Advances:</b> <span style="color:var(--warning); font-weight:700;">${money(totalAdv)}</span></div>
        <div style="grid-column:1/-1;"><b>Address:</b> ${escapeHtml(emp.address || '—')}</div>
      </div>

      <h4 style="font-size:14px; margin-bottom:8px;">Recent Payroll Disbursals</h4>
      <div class="table-responsive" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:8px; margin-bottom:16px;">
        <table class="data-table" style="font-size:12px;">
          <thead>
            <tr><th>Month</th><th class="num">Net Salary</th><th>Status</th><th>Disbursed Date</th></tr>
          </thead>
          <tbody>
            ${payroll.length ? payroll.map(p => `
              <tr>
                <td><b>${p.month} ${p.year}</b></td>
                <td class="num">${money(p.net_salary)}</td>
                <td><span class="status-pill ${p.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}">${p.payment_status}</span></td>
                <td class="mono">${p.payment_date ? formatDate(p.payment_date) : '—'}</td>
              </tr>
            `).join('') : `<tr><td colspan="4" style="text-align:center;">No previous payroll runs.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    openGlobalModal('Employee Profile & History', `Detailed ledger for ${emp.name}`, bodyHtml, [
      { label: 'Close', cls: 'btn-secondary', onClick: closeGlobalModal },
      { label: 'Generate Salary for Employee', cls: 'btn-primary', onClick: () => { closeGlobalModal(); openGenerateSalaryModal(emp.id); } }
    ], true);
  } catch (e) {}
}

// ============================================================
// VIEW 3: ADVANCES
// ============================================================
async function renderAdvancesView() {
  const container = document.getElementById('pageContent');
  container.innerHTML = `<div class="empty-placeholder"><p>Loading advances...</p></div>`;

  try {
    const data = await apiFetch('/api/advances');
    state.advances = data.advances || [];

    const totalDistributed = state.advances.reduce((s, a) => s + (Number(a.advance_amount) || 0), 0);
    const totalRemaining = state.advances.reduce((s, a) => s + (Number(a.remaining_balance) || 0), 0);
    const totalRepaid = totalDistributed - totalRemaining;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Advance Salary Ledger</h1>
          <p>Track employee loans, repayments, and automatic salary deductions</p>
        </div>
        <div class="page-actions-group">
          <button class="btn btn-accent btn-sm" onclick="openAdvanceModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Record New Advance</span>
          </button>
        </div>
      </div>

      <!-- Advance KPI Row -->
      <div class="stats-grid">
        <div class="stat-card stat-warning">
          <div class="stat-label">Total Advances Disbursed</div>
          <div class="stat-value">${money(totalDistributed)}</div>
          <div class="stat-subtext">${state.advances.length} loans recorded</div>
        </div>
        <div class="stat-card stat-danger">
          <div class="stat-label">Outstanding Balance</div>
          <div class="stat-value">${money(totalRemaining)}</div>
          <div class="stat-subtext">Will auto-deduct during salary generation</div>
        </div>
        <div class="stat-card stat-success">
          <div class="stat-label">Repaid / Reconciled</div>
          <div class="stat-value">${money(totalRepaid)}</div>
          <div class="stat-subtext">${Math.round((totalRepaid / (totalDistributed || 1)) * 100)}% recovery rate</div>
        </div>
      </div>

      <div class="table-card-container">
        <div class="table-toolbar">
          <h3 style="font-size:15px;">Active Advances & Loans</h3>
        </div>

        ${state.advances.length === 0 ? `
          <div class="empty-placeholder">
            <h4>No Advances Recorded</h4>
            <p>No active loan or salary advances. Click "Record New Advance" to add one.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date Issued</th>
                  <th class="num">Principal (₹)</th>
                  <th class="num">Remaining (₹)</th>
                  <th>Repayment Status</th>
                  <th>Reason / Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${state.advances.map(a => {
                  const repaidPct = Math.round(((a.advance_amount - a.remaining_balance) / a.advance_amount) * 100);
                  const isSettled = a.remaining_balance <= 0;
                  return `
                    <tr>
                      <td>
                        <div class="table-user-cell">
                          <div class="table-avatar" style="background:${a.avatar_color || '#6366f1'}">${(a.employee_name||'E').charAt(0)}</div>
                          <div class="table-user-info">
                            <span class="table-user-name">${escapeHtml(a.employee_name)}</span>
                            <span class="table-user-sub">${escapeHtml(a.department)}</span>
                          </div>
                        </div>
                      </td>
                      <td class="mono" style="font-size:12px;">${formatDate(a.advance_date)}</td>
                      <td class="num">${money(a.advance_amount)}</td>
                      <td class="num font-bold ${a.remaining_balance > 0 ? 'text-warning' : 'text-muted'}">${money(a.remaining_balance)}</td>
                      <td>
                        <div class="advance-progress-wrap">
                          <div style="display:flex; justify-content:space-between; font-size:10.5px;">
                            <span>${isSettled ? 'Settled' : `${repaidPct}% Paid`}</span>
                          </div>
                          <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width:${isSettled ? 100 : repaidPct}%; background:${isSettled ? 'var(--success)' : ''};"></div>
                          </div>
                        </div>
                      </td>
                      <td style="max-width:200px; text-overflow:ellipsis; overflow:hidden;">${escapeHtml(a.reason || '—')}</td>
                      <td>
                        <div style="display:flex; gap:6px;">
                          <button class="btn btn-secondary btn-sm" onclick="openAdvanceModal('${a.id}')">Edit</button>
                          <button class="btn btn-danger btn-sm" onclick="deleteAdvanceSubmit('${a.id}')">Delete</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  } catch (e) {}
}

function openAdvanceModal(id = null) {
  const adv = id ? state.advances.find(a => a.id === id) : null;
  const title = adv ? 'Edit Advance Loan' : 'Record Salary Advance';

  const bodyHtml = `
    <form id="advForm">
      <div class="form-group">
        <label>Select Employee *</label>
        <select id="adv_empId" ${adv ? 'disabled' : ''}>
          ${state.employees.map(e => `
            <option value="${e.id}" ${adv && adv.employee_id === e.id ? 'selected' : ''}>${escapeHtml(e.name)} (${escapeHtml(e.department)})</option>
          `).join('')}
        </select>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Advance Amount (₹) *</label>
          <input id="adv_amount" type="number" min="1" value="${adv ? adv.advance_amount : 10000}" required />
        </div>
        <div class="form-group">
          <label>Date Issued * <span style="font-size:11px; font-weight:normal; color:var(--text-muted);">(DD/MM/YYYY)</span></label>
          <input id="adv_date" type="date" value="${adv ? toInputDate(adv.advance_date) : toInputDate(new Date())}" />
        </div>
      </div>

      <div class="form-group">
        <label>Remaining Balance (₹)</label>
        <input id="adv_remaining" type="number" min="0" value="${adv ? adv.remaining_balance : ''}" placeholder="Defaults to full advance amount" />
        <span class="form-hint">Leave blank to default to the full principal.</span>
      </div>

      <div class="form-group">
        <label>Reason / Purpose</label>
        <textarea id="adv_reason" rows="2" placeholder="e.g. Medical emergency, relocation, festival advance...">${adv ? escapeHtml(adv.reason || '') : ''}</textarea>
      </div>
    </form>
  `;

  openGlobalModal(title, 'Advance record will be deducted automatically from payroll', bodyHtml, [
    { label: 'Cancel', cls: 'btn-secondary', onClick: closeGlobalModal },
    { label: adv ? 'Update Advance' : 'Disburse Advance', cls: 'btn-primary', onClick: () => saveAdvanceSubmit(id) }
  ]);
}

async function saveAdvanceSubmit(id) {
  const employee_id = document.getElementById('adv_empId').value;
  const advance_amount = Number(document.getElementById('adv_amount').value) || 0;
  const advance_date = document.getElementById('adv_date').value;
  const remaining_balance = document.getElementById('adv_remaining').value;
  const reason = document.getElementById('adv_reason').value.trim();

  if (!employee_id || !advance_amount) {
    showToast('warning', 'Validation', 'Please select an employee and specify advance amount.');
    return;
  }

  const payload = {
    employee_id,
    advance_amount,
    advance_date: normalizeDate(advance_date),
    remaining_balance: remaining_balance !== '' ? Number(remaining_balance) : advance_amount,
    reason
  };

  try {
    if (id) {
      await apiFetch(`/api/advances/${id}`, { method: 'PUT', body: payload });
      showToast('success', 'Updated', 'Advance record updated.');
    } else {
      await apiFetch('/api/advances', { method: 'POST', body: payload });
      showToast('success', 'Recorded', 'Salary advance registered.');
    }
    closeGlobalModal();
    renderAdvancesView();
  } catch (e) {}
}

async function deleteAdvanceSubmit(id) {
  if (!confirm('Are you sure you want to delete this advance record?')) return;
  try {
    await apiFetch(`/api/advances/${id}`, { method: 'DELETE' });
    showToast('info', 'Deleted', 'Advance record removed.');
    renderAdvancesView();
  } catch (e) {}
}

// ============================================================
// VIEW 4: LEAVES & ABSENCES
// ============================================================
async function renderLeavesView() {
  const container = document.getElementById('pageContent');
  container.innerHTML = `<div class="empty-placeholder"><p>Loading leave records...</p></div>`;

  try {
    const data = await apiFetch('/api/leaves');
    state.leaves = data.leaves || [];

    const totalDeductions = state.leaves.reduce((s, l) => s + (Number(l.leave_deduction) || 0), 0);
    const totalUnpaidDays = state.leaves.reduce((s, l) => s + (Number(l.unpaid_leaves) || 0), 0);

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Attendance & Leave Records</h1>
          <p>Record paid leaves, unpaid absences, and calculate salary deductions</p>
        </div>
        <div class="page-actions-group">
          <button class="btn btn-accent btn-sm" onclick="openLeaveModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Record Leave Entry</span>
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Leave Records</div>
          <div class="stat-value">${state.leaves.length}</div>
        </div>
        <div class="stat-card stat-danger">
          <div class="stat-label">Total Unpaid Absences</div>
          <div class="stat-value">${totalUnpaidDays} Days</div>
        </div>
        <div class="stat-card stat-warning">
          <div class="stat-label">Total Leave Deductions</div>
          <div class="stat-value">${money(totalDeductions)}</div>
        </div>
      </div>

      <div class="table-card-container">
        <div class="table-toolbar">
          <h3 style="font-size:15px;">Monthly Leave Ledger</h3>
        </div>

        ${state.leaves.length === 0 ? `
          <div class="empty-placeholder">
            <h4>No Leave Records Found</h4>
            <p>Click "Record Leave Entry" to add monthly employee leaves.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month & Year</th>
                  <th class="num">Paid Days</th>
                  <th class="num">Unpaid Days</th>
                  <th class="num">Deduction (₹)</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${state.leaves.map(l => `
                  <tr>
                    <td>
                      <div class="table-user-cell">
                        <div class="table-avatar" style="background:${l.avatar_color || '#6366f1'}">${(l.employee_name||'E').charAt(0)}</div>
                        <div class="table-user-info">
                          <span class="table-user-name">${escapeHtml(l.employee_name)}</span>
                          <span class="table-user-sub">${escapeHtml(l.department)}</span>
                        </div>
                      </div>
                    </td>
                    <td><b>${l.month} ${l.year}</b></td>
                    <td class="num">${l.paid_leaves}</td>
                    <td class="num ${l.unpaid_leaves > 0 ? 'text-danger font-bold' : ''}">${l.unpaid_leaves}</td>
                    <td class="num font-bold text-danger">${money(l.leave_deduction)}</td>
                    <td>${escapeHtml(l.reason || '—')}</td>
                    <td>
                      <div style="display:flex; gap:6px;">
                        <button class="btn btn-secondary btn-sm" onclick="openLeaveModal('${l.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteLeaveSubmit('${l.id}')">Delete</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  } catch (e) {}
}

function openLeaveModal(id = null) {
  const lv = id ? state.leaves.find(l => l.id === id) : null;
  const title = lv ? 'Edit Leave Record' : 'Record Monthly Leave';

  const bodyHtml = `
    <form id="leaveForm">
      <div class="form-group">
        <label>Select Employee *</label>
        <select id="lv_empId" onchange="autoCalcLeaveDeduction()" ${lv ? 'disabled' : ''}>
          ${state.employees.map(e => `
            <option value="${e.id}" data-salary="${e.basic_salary}" ${lv && lv.employee_id === e.id ? 'selected' : ''}>${escapeHtml(e.name)} (Base: ${money(e.basic_salary)})</option>
          `).join('')}
        </select>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Month *</label>
          <select id="lv_month">
            ${MONTHS.map(m => `<option value="${m}" ${lv ? (lv.month === m ? 'selected' : '') : (m === currentMonth() ? 'selected' : '')}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Year *</label>
          <input id="lv_year" type="number" value="${lv ? lv.year : currentYear()}" />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Paid Leave (Days)</label>
          <input id="lv_paid" type="number" min="0" value="${lv ? lv.paid_leaves : 0}" />
        </div>
        <div class="form-group">
          <label>Unpaid Absence (Days)</label>
          <input id="lv_unpaid" type="number" min="0" value="${lv ? lv.unpaid_leaves : 0}" oninput="autoCalcLeaveDeduction()" />
        </div>
      </div>

      <div class="form-group">
        <label>Salary Deduction (₹)</label>
        <input id="lv_deduction" type="number" min="0" value="${lv ? lv.leave_deduction : 0}" />
        <span class="form-hint">Auto-calculated as: (Basic Salary / 30) × Unpaid Days</span>
      </div>

      <div class="form-group">
        <label>Reason / Note</label>
        <input id="lv_reason" type="text" value="${lv ? escapeHtml(lv.reason || '') : ''}" placeholder="e.g. Medical leave, personal emergency" />
      </div>
    </form>
  `;

  openGlobalModal(title, 'Absence entries will be subtracted in the payroll calculation', bodyHtml, [
    { label: 'Cancel', cls: 'btn-secondary', onClick: closeGlobalModal },
    { label: lv ? 'Save Changes' : 'Record Leave', cls: 'btn-primary', onClick: () => saveLeaveSubmit(id) }
  ]);

  if (!lv) setTimeout(autoCalcLeaveDeduction, 100);
}

function autoCalcLeaveDeduction() {
  const select = document.getElementById('lv_empId');
  if (!select) return;
  const selectedOpt = select.options[select.selectedIndex];
  const salary = Number(selectedOpt ? selectedOpt.dataset.salary : 0) || 0;
  const unpaid = Number(document.getElementById('lv_unpaid').value) || 0;
  const perDay = salary / 30;
  document.getElementById('lv_deduction').value = Math.round(unpaid * perDay);
}

async function saveLeaveSubmit(id) {
  const employee_id = document.getElementById('lv_empId').value;
  const month = document.getElementById('lv_month').value;
  const year = Number(document.getElementById('lv_year').value) || currentYear();
  const paid_leaves = Number(document.getElementById('lv_paid').value) || 0;
  const unpaid_leaves = Number(document.getElementById('lv_unpaid').value) || 0;
  const leave_deduction = Number(document.getElementById('lv_deduction').value) || 0;
  const reason = document.getElementById('lv_reason').value.trim();

  const payload = { employee_id, month, year, paid_leaves, unpaid_leaves, leave_deduction, reason };

  try {
    if (id) {
      await apiFetch(`/api/leaves/${id}`, { method: 'PUT', body: payload });
      showToast('success', 'Updated', 'Leave record updated.');
    } else {
      await apiFetch('/api/leaves', { method: 'POST', body: payload });
      showToast('success', 'Recorded', 'Leave record registered.');
    }
    closeGlobalModal();
    renderLeavesView();
  } catch (e) {}
}

async function deleteLeaveSubmit(id) {
  if (!confirm('Delete this leave record?')) return;
  try {
    await apiFetch(`/api/leaves/${id}`, { method: 'DELETE' });
    showToast('info', 'Deleted', 'Leave record removed.');
    renderLeavesView();
  } catch (e) {}
}

// ============================================================
// VIEW 5: PAYROLL ENGINE
// ============================================================
async function renderPayrollView(filterMonth = 'All', filterYear = currentYear(), filterStatus = 'All') {
  const container = document.getElementById('pageContent');
  container.innerHTML = `<div class="empty-placeholder"><p>Loading payroll runs...</p></div>`;

  let query = `/api/payroll?month=${encodeURIComponent(filterMonth)}&year=${filterYear}&status=${encodeURIComponent(filterStatus)}`;

  try {
    const data = await apiFetch(query);
    state.payroll = data.payroll || [];

    const totalNet = state.payroll.reduce((s, p) => s + (Number(p.net_salary) || 0), 0);
    const paidSum = state.payroll.filter(p => p.payment_status === 'Paid').reduce((s, p) => s + (Number(p.net_salary) || 0), 0);
    const pendingSum = state.payroll.filter(p => p.payment_status === 'Pending').reduce((s, p) => s + (Number(p.net_salary) || 0), 0);

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Payroll Generation Engine</h1>
          <p>Compute automated monthly salaries with advance & leave reconciliation</p>
        </div>
        <div class="page-actions-group">
          <button class="btn btn-secondary btn-sm" onclick="openBulkSalaryModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span>Bulk Generate All</span>
          </button>
          <button class="btn btn-accent btn-sm" onclick="openGenerateSalaryModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Generate Salary</span>
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Monthly Payroll</div>
          <div class="stat-value">${money(totalNet)}</div>
          <div class="stat-subtext">${state.payroll.length} records generated</div>
        </div>
        <div class="stat-card stat-success">
          <div class="stat-label">Disbursed (Paid)</div>
          <div class="stat-value">${money(paidSum)}</div>
          <div class="stat-subtext">Bank transfers & UPI credits</div>
        </div>
        <div class="stat-card stat-warning">
          <div class="stat-label">Pending Release</div>
          <div class="stat-value">${money(pendingSum)}</div>
          <div class="stat-subtext">Awaiting payment disbursement</div>
        </div>
      </div>

      <div class="table-card-container">
        <div class="table-toolbar">
          <div class="toolbar-filter-pills">
            <span class="filter-pill ${filterMonth === 'All' ? 'active' : ''}" onclick="renderPayrollView('All', ${filterYear}, '${filterStatus}')">All Months</span>
            ${MONTHS.slice(0, 8).map(m => `
              <span class="filter-pill ${filterMonth === m ? 'active' : ''}" onclick="renderPayrollView('${m}', ${filterYear}, '${filterStatus}')">${m.slice(0,3)}</span>
            `).join('')}
          </div>

          <div style="display:flex; gap:8px;">
            <select style="width:130px; padding:6px 10px; font-size:12px;" onchange="renderPayrollView('${filterMonth}', ${filterYear}, this.value)">
              <option value="All" ${filterStatus === 'All' ? 'selected' : ''}>All Status</option>
              <option value="Paid" ${filterStatus === 'Paid' ? 'selected' : ''}>Paid</option>
              <option value="Pending" ${filterStatus === 'Pending' ? 'selected' : ''}>Pending</option>
            </select>
          </div>
        </div>

        ${state.payroll.length === 0 ? `
          <div class="empty-placeholder">
            <h4>No Payroll Records Found</h4>
            <p>Click "Generate Salary" or "Bulk Generate All" to run payroll for your workforce.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th class="num">Basic</th>
                  <th class="num">Advance Ded.</th>
                  <th class="num">Leave Ded.</th>
                  <th class="num">Bonus</th>
                  <th class="num">Net Disbursed</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${state.payroll.map(p => `
                  <tr>
                    <td>
                      <div class="table-user-cell">
                        <div class="table-avatar" style="background:${p.avatar_color || '#6366f1'}">${(p.employee_name||'E').charAt(0)}</div>
                        <div class="table-user-info">
                          <span class="table-user-name">${escapeHtml(p.employee_name)}</span>
                          <span class="table-user-sub">${escapeHtml(p.department)}</span>
                        </div>
                      </div>
                    </td>
                    <td><b>${p.month} ${p.year}</b></td>
                    <td class="num">${money(p.basic_salary)}</td>
                    <td class="num ${p.advance_deduction > 0 ? 'text-danger' : 'text-muted'}">− ${money(p.advance_deduction)}</td>
                    <td class="num ${p.leave_deduction > 0 ? 'text-danger' : 'text-muted'}">− ${money(p.leave_deduction)}</td>
                    <td class="num ${p.bonus > 0 ? 'text-success' : 'text-muted'}">+ ${money(p.bonus)}</td>
                    <td class="num font-bold text-primary" style="font-size:14.5px;">${money(p.net_salary)}</td>
                    <td>
                      <span class="status-pill ${p.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}">
                        <span class="status-dot"></span>${p.payment_status}
                      </span>
                      ${p.payment_date ? `<div class="mono text-muted" style="font-size:11px; margin-top:3px;">${formatDate(p.payment_date)}</div>` : ''}
                    </td>
                    <td>
                      <div style="display:flex; gap:6px;">
                        ${p.payment_status === 'Pending' ? `
                          <button class="btn btn-success btn-sm" onclick="openDisburseModal('${p.id}', '${escapeHtml(p.employee_name)}', ${p.net_salary})">Disburse</button>
                        ` : ''}
                        <button class="btn btn-secondary btn-sm" onclick="viewPayslipModal('${p.id}')">Payslip</button>
                        <button class="btn btn-danger btn-sm" onclick="deletePayrollSubmit('${p.id}')" title="Delete">✕</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  } catch (e) {}
}

// ----------------------------------------------------
// GENERATE SALARY MODAL & ARITHMETIC PREVIEW
// ----------------------------------------------------
function openGenerateSalaryModal(preselectedEmpId = null) {
  const bodyHtml = `
    <form id="genSalaryForm">
      <div class="form-group">
        <label>Employee *</label>
        <select id="gs_empId" onchange="refreshSalaryPreview()">
          ${state.employees.map(e => `
            <option value="${e.id}" ${preselectedEmpId === e.id ? 'selected' : ''}>${escapeHtml(e.name)} (${escapeHtml(e.designation)})</option>
          `).join('')}
        </select>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Month *</label>
          <select id="gs_month" onchange="refreshSalaryPreview()">
            ${MONTHS.map(m => `<option value="${m}" ${m === currentMonth() ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Year *</label>
          <input id="gs_year" type="number" value="${currentYear()}" oninput="refreshSalaryPreview()" />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Performance Bonus (₹)</label>
          <input id="gs_bonus" type="number" min="0" value="0" oninput="refreshSalaryPreview()" />
        </div>
        <div class="form-group">
          <label>Other Deductions (₹)</label>
          <input id="gs_otherDed" type="number" min="0" value="0" oninput="refreshSalaryPreview()" />
        </div>
      </div>

      <!-- Live Calculation Breakdown Card -->
      <div class="hero-formula-card" id="salaryPreviewCard" style="margin-top:16px;">
        <div class="formula-header">
          <span class="formula-tag">LIVE ARITHMETIC PREVIEW</span>
          <span class="formula-badge">AUTO-CALC</span>
        </div>
        <div class="formula-math" id="salaryPreviewDetails">
          <p>Calculating preview...</p>
        </div>
      </div>
    </form>
  `;

  openGlobalModal('Generate Monthly Salary', 'Auto-deducts outstanding advances and unexcused leaves', bodyHtml, [
    { label: 'Cancel', cls: 'btn-secondary', onClick: closeGlobalModal },
    { label: 'Confirm & Generate Salary', cls: 'btn-primary', onClick: submitGenerateSalary }
  ]);

  setTimeout(refreshSalaryPreview, 100);
}

async function refreshSalaryPreview() {
  const employee_id = document.getElementById('gs_empId').value;
  const month = document.getElementById('gs_month').value;
  const year = Number(document.getElementById('gs_year').value) || currentYear();
  const bonus = Number(document.getElementById('gs_bonus').value) || 0;
  const other_deduction = Number(document.getElementById('gs_otherDed').value) || 0;

  try {
    const data = await apiFetch('/api/payroll/calculate-preview', {
      method: 'POST',
      body: { employee_id, month, year, bonus, other_deduction }
    });

    const p = data.preview;
    document.getElementById('salaryPreviewDetails').innerHTML = `
      <div class="f-row"><span>Basic Salary</span><span class="f-num">${money(p.basic_salary)}</span></div>
      <div class="f-row minus"><span>− Advance Repayment (${money(p.total_outstanding_advance)} balance)</span><span class="f-num">− ${money(p.advance_deduction)}</span></div>
      <div class="f-row minus"><span>− Leave Deductions</span><span class="f-num">− ${money(p.leave_deduction)}</span></div>
      <div class="f-row plus"><span>+ Performance Bonus</span><span class="f-num">+ ${money(p.bonus)}</span></div>
      <div class="f-row minus"><span>− Other Deductions</span><span class="f-num">− ${money(p.other_deduction)}</span></div>
      <div class="f-row total"><span>Net Payable Salary</span><span class="f-num total-val">${money(p.net_salary)}</span></div>
    `;
  } catch (e) {}
}

async function submitGenerateSalary() {
  const employee_id = document.getElementById('gs_empId').value;
  const month = document.getElementById('gs_month').value;
  const year = Number(document.getElementById('gs_year').value) || currentYear();
  const bonus = Number(document.getElementById('gs_bonus').value) || 0;
  const other_deduction = Number(document.getElementById('gs_otherDed').value) || 0;

  try {
    const res = await apiFetch('/api/payroll/generate', {
      method: 'POST',
      body: { employee_id, month, year, bonus, other_deduction }
    });
    showToast('success', 'Payroll Generated', res.message);
    closeGlobalModal();
    renderPayrollView();
  } catch (e) {}
}

function openBulkSalaryModal() {
  const bodyHtml = `
    <div class="form-group">
      <label>Target Month *</label>
      <select id="bulk_month">
        ${MONTHS.map(m => `<option value="${m}" ${m === currentMonth() ? 'selected' : ''}>${m}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Year *</label>
      <input id="bulk_year" type="number" value="${currentYear()}" />
    </div>
    <p class="form-hint">This will run the automatic arithmetic calculation for all <b>${state.employees.filter(e=>e.status==='Active').length} active employees</b>, automatically adjusting advance loan repayments and leave deductions.</p>
  `;

  openGlobalModal('Bulk Generate Monthly Payroll', 'Process all active employees in one batch', bodyHtml, [
    { label: 'Cancel', cls: 'btn-secondary', onClick: closeGlobalModal },
    { label: 'Run Bulk Batch', cls: 'btn-accent', onClick: executeBulkSalarySubmit }
  ]);
}

async function executeBulkSalarySubmit() {
  const month = document.getElementById('bulk_month').value;
  const year = Number(document.getElementById('bulk_year').value) || currentYear();

  try {
    const res = await apiFetch('/api/payroll/generate-all', {
      method: 'POST',
      body: { month, year }
    });
    showToast('success', 'Bulk Batch Complete', res.message);
    closeGlobalModal();
    renderPayrollView();
  } catch (e) {}
}

function openDisburseModal(id, name, amount) {
  const bodyHtml = `
    <div style="background:var(--bg-tertiary); padding:14px; border-radius:10px; margin-bottom:16px; font-size:13.5px;">
      Disbursing Net Salary of <b style="color:var(--primary); font-size:16px;">${money(amount)}</b> to <b>${escapeHtml(name)}</b>.
    </div>

    <div class="form-group">
      <label>Payment Method *</label>
      <select id="pay_method">
        <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
        <option value="Bank Transfer (IMPS)">Bank Transfer (IMPS)</option>
        <option value="UPI Payment (Instant)">UPI Payment (Instant)</option>
        <option value="Cheque">Cheque</option>
        <option value="Cash Voucher">Cash Voucher</option>
      </select>
    </div>

    <div class="form-group">
      <label>Transaction / Reference Number</label>
      <input id="pay_ref" type="text" placeholder="e.g. UTR-9823418290 or CHQ-00129" value="TXN-${Date.now().toString(36).toUpperCase()}" />
    </div>

    <div class="form-group">
      <label>Disbursal Remarks</label>
      <input id="pay_notes" type="text" placeholder="Optional notes..." value="Salary disbursed successfully" />
    </div>
  `;

  openGlobalModal('Mark Salary as Disbursed', 'Record transaction and mark status as Paid', bodyHtml, [
    { label: 'Cancel', cls: 'btn-secondary', onClick: closeGlobalModal },
    { label: 'Confirm Disbursal', cls: 'btn-success', onClick: () => executeDisburseSubmit(id) }
  ]);
}

async function executeDisburseSubmit(id) {
  const payment_method = document.getElementById('pay_method').value;
  const payment_ref = document.getElementById('pay_ref').value.trim();
  const notes = document.getElementById('pay_notes').value.trim();

  try {
    await apiFetch(`/api/payroll/${id}/pay`, {
      method: 'PUT',
      body: { payment_method, payment_ref, notes }
    });
    showToast('success', 'Disbursed', 'Payment marked as Paid.');
    closeGlobalModal();
    renderPayrollView();
  } catch (e) {}
}

async function deletePayrollSubmit(id) {
  if (!confirm('Are you sure you want to delete this payroll record?')) return;
  try {
    await apiFetch(`/api/payroll/${id}`, { method: 'DELETE' });
    showToast('info', 'Deleted', 'Payroll record deleted.');
    renderPayrollView();
  } catch (e) {}
}

// ============================================================
// VIEW 6: PAYSLIPS & PRINT / PDF
// ============================================================
async function renderPayslipsView() {
  const container = document.getElementById('pageContent');
  container.innerHTML = `<div class="empty-placeholder"><p>Loading payslip records...</p></div>`;

  try {
    const data = await apiFetch('/api/payroll');
    state.payroll = data.payroll || [];

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Executive Payslip Generator</h1>
          <p>Official salary certificates, tax summaries, print layouts & PDF exports</p>
        </div>
      </div>

      <div class="table-card-container" style="padding:20px; max-width:500px; margin-bottom:24px;">
        <div class="form-group">
          <label>Select Employee & Month</label>
          <select id="ps_select" onchange="renderSelectedPayslip(this.value)">
            <option value="">— Select a payroll record —</option>
            ${state.payroll.map(p => `
              <option value="${p.id}">${escapeHtml(p.employee_name)} — ${p.month} ${p.year} (${money(p.net_salary)})</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div id="payslipPreviewArea"></div>
    `;

    if (state.payroll.length > 0) {
      document.getElementById('ps_select').value = state.payroll[0].id;
      renderSelectedPayslip(state.payroll[0].id);
    }
  } catch (e) {}
}

async function renderSelectedPayslip(id) {
  const holder = document.getElementById('payslipPreviewArea');
  if (!id) {
    holder.innerHTML = '';
    return;
  }

  try {
    const data = await apiFetch(`/api/payroll/${id}/payslip`);
    const p = data.payslip;
    const comp = p.company || {};

    holder.innerHTML = `
      <div class="page-actions-group" style="margin-bottom:16px; justify-content:flex-end; max-width:760px; margin-left:auto; margin-right:auto;">
        <button class="btn btn-secondary" onclick="window.print()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          <span>Print Payslip</span>
        </button>
        <button class="btn btn-accent" onclick="downloadPayslipPDF('${p.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Download Official PDF</span>
        </button>
      </div>

      <div id="printablePayslip">
        <div class="payslip-container-card">
          <div class="payslip-top-accent"></div>

          <!-- Header -->
          <div class="payslip-header-block">
            <div class="company-payslip-info">
              <h2>${escapeHtml(comp.company_name || 'Paytrack Technologies Pvt Ltd')}</h2>
              <p>${escapeHtml(comp.tagline || 'Enterprise Cloud & Payroll Systems')}</p>
              <p>${escapeHtml(comp.address || 'Tech Park, Bangalore - 560103')}</p>
              <p><b>Tax / GSTIN ID:</b> ${escapeHtml(comp.tax_id || 'GSTIN29AABCU9603R1ZM')}</p>
            </div>
            <div class="payslip-doc-meta">
              <span class="payslip-doc-badge">OFFICIAL PAYSLIP</span>
              <div class="payslip-period-text">${p.month} ${p.year}</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Ref: ${p.payment_ref || p.id}</div>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="payslip-details-grid">
            <div class="payslip-detail-item">
              <span>Employee Name</span>
              <b>${escapeHtml(p.employee_name)}</b>
            </div>
            <div class="payslip-detail-item">
              <span>Employee ID</span>
              <span class="mono">${p.employee_id}</span>
            </div>
            <div class="payslip-detail-item">
              <span>Department</span>
              ${escapeHtml(p.department)}
            </div>
            <div class="payslip-detail-item">
              <span>Designation</span>
              ${escapeHtml(p.designation)}
            </div>
            <div class="payslip-detail-item">
              <span>Payment Status</span>
              <span class="status-pill ${p.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}">${p.payment_status} ${p.payment_date ? `(${formatDate(p.payment_date)})` : ''}</span>
            </div>
            <div class="payslip-detail-item">
              <span>Payment Method</span>
              ${escapeHtml(p.payment_method || 'Bank Transfer (NEFT)')}
            </div>
          </div>

          <!-- Table Breakdown -->
          <table class="payslip-breakdown-table">
            <thead>
              <tr>
                <th>Earnings / Credits</th>
                <th class="num">Amount (₹)</th>
                <th>Deductions / Recoveries</th>
                <th class="num">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Monthly Salary</td>
                <td class="num">${money(p.basic_salary)}</td>
                <td>Advance Loan Deduction</td>
                <td class="num neg">− ${money(p.advance_deduction)}</td>
              </tr>
              <tr>
                <td>Performance Bonus & Allowances</td>
                <td class="num pos">+ ${money(p.bonus)}</td>
                <td>Unpaid Leave Deductions</td>
                <td class="num neg">− ${money(p.leave_deduction)}</td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td>Other Statutory Deductions</td>
                <td class="num neg">− ${money(p.other_deduction)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Net Disbursed Highlight Block -->
          <div class="payslip-net-block">
            <div>
              <div class="payslip-net-title">Total Net Take-Home Salary</div>
              <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">Disbursed directly to designated employee bank account</div>
            </div>
            <div class="payslip-net-amount">${money(p.net_salary)}</div>
          </div>

          <!-- Signatures & Verification -->
          <div class="payslip-signatures-row">
            <div class="qr-verification-seal">
              <div class="qr-box">VERIFIED<br/>PAYTRACK</div>
              <div>
                <b>Digitally Generated</b><br/>
                <span>Security Token Verified</span>
              </div>
            </div>

            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Authorised Signatory</div>
            </div>
          </div>

        </div>
      </div>
    `;
  } catch (e) {}
}

async function viewPayslipModal(id) {
  navigateTo('payslips');
  setTimeout(() => {
    const sel = document.getElementById('ps_select');
    if (sel) {
      sel.value = id;
      renderSelectedPayslip(id);
    }
  }, 100);
}

function downloadPayslipPDF(id) {
  const p = state.payroll.find(x => x.id === id);
  if (!p) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PAYTRACK SALARY SLIP', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${p.month} ${p.year}`, 196, 18, { align: 'right' });

  let y = 45;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 14, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const infoRows = [
    ['Employee Name:', p.employee_name, 'Department:', p.department],
    ['Designation:', p.designation, 'Payment Status:', `${p.payment_status} ${p.payment_date ? `(${formatDate(p.payment_date)})` : ''}`],
    ['Payment Method:', p.payment_method || 'Bank Transfer', 'Reference #:', p.payment_ref || p.id]
  ];

  infoRows.forEach(r => {
    doc.text(r[0], 14, y);
    doc.text(String(r[1]), 50, y);
    doc.text(r[2], 115, y);
    doc.text(String(r[3]), 155, y);
    y += 7;
  });

  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, 196, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Salary Breakdown', 14, y);
  y += 8;

  const lines = [
    ['Basic Monthly Salary', money(p.basic_salary)],
    ['Performance Bonus', `+ ${money(p.bonus)}`],
    ['Advance Repayment Deduction', `− ${money(p.advance_deduction)}`],
    ['Leave & Absence Deduction', `− ${money(p.leave_deduction)}`],
    ['Other Deductions', `− ${money(p.other_deduction)}`]
  ];

  doc.setFont('helvetica', 'normal');
  lines.forEach(l => {
    doc.text(l[0], 14, y);
    doc.text(l[1], 196, y, { align: 'right' });
    y += 7;
  });

  y += 4;
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Net Take-Home Salary:', 14, y);
  doc.text(money(p.net_salary), 196, y, { align: 'right' });

  y += 24;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('This is a system generated document and does not require a physical signature.', 14, y);

  doc.save(`Payslip_${(p.employee_name || 'employee').replace(/\s+/g, '_')}_${p.month}_${p.year}.pdf`);
  showToast('success', 'PDF Ready', 'Payslip downloaded successfully.');
}

// ============================================================
// VIEW 7: REPORTS & EXPORT
// ============================================================
async function renderReportsView() {
  const container = document.getElementById('pageContent');
  container.innerHTML = `<div class="empty-placeholder"><p>Loading reports...</p></div>`;

  try {
    const data = await apiFetch('/api/reports');
    const rows = data.rows || [];
    const sum = data.summary || {};

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Financial Reports & Exports</h1>
          <p>Multi-dimensional filtering, workforce expenditure, Excel (.xlsx) & PDF exports</p>
        </div>
        <div class="page-actions-group">
          <button class="btn btn-secondary btn-sm" onclick="exportReportsExcel()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
            <span>Export to Excel (.xlsx)</span>
          </button>
          <button class="btn btn-accent btn-sm" onclick="exportReportsPDF()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Disbursed Net</div>
          <div class="stat-value">${money(sum.totalNetDisbursed)}</div>
        </div>
        <div class="stat-card stat-success">
          <div class="stat-label">Paid Records</div>
          <div class="stat-value">${sum.paidCount || 0}</div>
        </div>
        <div class="stat-card stat-warning">
          <div class="stat-label">Pending Records</div>
          <div class="stat-value">${sum.pendingCount || 0}</div>
        </div>
        <div class="stat-card stat-purple">
          <div class="stat-label">Total Recoveries</div>
          <div class="stat-value">${money((sum.totalAdvanceDeductions || 0) + (sum.totalLeaveDeductions || 0))}</div>
        </div>
      </div>

      <div class="table-card-container">
        <div class="table-toolbar">
          <h3 style="font-size:15px;">Historical Payroll Audit Ledger</h3>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="reportTableData">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Month & Year</th>
                <th class="num">Basic</th>
                <th class="num">Advance Ded.</th>
                <th class="num">Leave Ded.</th>
                <th class="num">Bonus</th>
                <th class="num">Net Disbursed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(r => `
                <tr>
                  <td><b>${escapeHtml(r.employee_name)}</b></td>
                  <td><span class="emp-dept-badge">${escapeHtml(r.department)}</span></td>
                  <td>${r.month} ${r.year}</td>
                  <td class="num">${money(r.basic_salary)}</td>
                  <td class="num neg">− ${money(r.advance_deduction)}</td>
                  <td class="num neg">− ${money(r.leave_deduction)}</td>
                  <td class="num pos">+ ${money(r.bonus)}</td>
                  <td class="num font-bold">${money(r.net_salary)}</td>
                  <td><span class="status-pill ${r.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}">${r.payment_status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (e) {}
}

function exportReportsExcel() {
  const table = document.getElementById('reportTableData');
  if (!table) return;
  const wb = XLSX.utils.table_to_book(table, { sheet: "Payroll Report" });
  XLSX.writeFile(wb, `Paytrack_Payroll_Report_${Date.now()}.xlsx`);
  showToast('success', 'Excel Exported', 'Report downloaded as .xlsx');
}

function exportReportsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Paytrack — Comprehensive Payroll Summary Report', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatDateTime(new Date())}`, 14, 25);

  const headers = ['Employee', 'Department', 'Period', 'Basic Salary', 'Advance Ded.', 'Leave Ded.', 'Bonus', 'Net Disbursal', 'Status'];
  const colX = [14, 55, 95, 125, 155, 185, 210, 240, 270];

  let y = 35;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  headers.forEach((h, i) => doc.text(h, colX[i], y));
  y += 4;
  doc.line(14, y, 285, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  state.payroll.forEach(p => {
    if (y > 185) {
      doc.addPage({ orientation: 'landscape' });
      y = 20;
    }
    const vals = [
      p.employee_name || '—',
      p.department || '—',
      `${p.month} ${p.year}`,
      money(p.basic_salary),
      money(p.advance_deduction),
      money(p.leave_deduction),
      money(p.bonus),
      money(p.net_salary),
      p.payment_status
    ];
    vals.forEach((v, i) => doc.text(String(v), colX[i], y));
    y += 7;
  });

  doc.save('Paytrack_Executive_Report.pdf');
  showToast('success', 'PDF Ready', 'Report downloaded.');
}

// ============================================================
// VIEW 8: AUDIT LOGS
// ============================================================
async function renderLogsView() {
  const container = document.getElementById('pageContent');
  container.innerHTML = `<div class="empty-placeholder"><p>Loading audit trail...</p></div>`;

  try {
    const data = await apiFetch('/api/logs');
    const logs = data.logs || [];

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Security & Activity Audit Log</h1>
          <p>Chronological record of payroll runs, employee updates, and system operations</p>
        </div>
      </div>

      <div class="table-card-container">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Description</th>
                <th>User / Initiator</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td><span class="status-pill status-active">${escapeHtml(l.action_type)}</span></td>
                  <td><b>${escapeHtml(l.description)}</b></td>
                  <td class="mono">${escapeHtml(l.user)}</td>
                  <td class="mono text-muted" style="font-size:12px;">${formatDateTime(l.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (e) {}
}

// ============================================================
// VIEW 9: SETTINGS
// ============================================================
async function renderSettingsView() {
  const container = document.getElementById('pageContent');
  try {
    const data = await apiFetch('/api/settings');
    const s = data.settings || {};

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>System & Company Settings</h1>
          <p>Configure company branding on payslips, credentials, and demo data</p>
        </div>
      </div>

      <div class="form-grid-2">
        <!-- Company Profile Card -->
        <div class="table-card-container" style="padding:24px;">
          <h3 style="font-size:16px; margin-bottom:16px;">Enterprise Company Profile</h3>
          <form onsubmit="event.preventDefault(); saveCompanySettingsSubmit();">
            <div class="form-group">
              <label>Company Legal Name</label>
              <input id="set_compName" value="${escapeHtml(s.company_name || '')}" />
            </div>
            <div class="form-group">
              <label>Tagline / Industry</label>
              <input id="set_tagline" value="${escapeHtml(s.tagline || '')}" />
            </div>
            <div class="form-group">
              <label>Tax ID / GSTIN / CIN</label>
              <input id="set_taxId" value="${escapeHtml(s.tax_id || '')}" />
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label>Official Email</label>
                <input id="set_email" value="${escapeHtml(s.email || '')}" />
              </div>
              <div class="form-group">
                <label>Contact Phone</label>
                <input id="set_phone" value="${escapeHtml(s.phone || '')}" />
              </div>
            </div>
            <div class="form-group">
              <label>Registered Office Address</label>
              <textarea id="set_address" rows="2">${escapeHtml(s.address || '')}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Save Company Profile</button>
          </form>
        </div>

        <!-- Security & Admin Password -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <div class="table-card-container" style="padding:24px;">
            <h3 style="font-size:16px; margin-bottom:16px;">Admin Authentication Credentials</h3>
            <form onsubmit="event.preventDefault(); updateAdminCredentialsSubmit();">
              <div class="form-group">
                <label>Current Username</label>
                <input id="pwd_currUser" value="${escapeHtml(state.user ? state.user.username : 'admin')}" />
              </div>
              <div class="form-group">
                <label>New Username (Optional)</label>
                <input id="pwd_newUser" placeholder="Leave blank to keep current" />
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input id="pwd_newPass" type="password" placeholder="Enter new strong password" />
              </div>
              <button type="submit" class="btn btn-accent">Update Credentials</button>
            </form>
          </div>

          <!-- Demo Reset Card -->
          <div class="table-card-container" style="padding:24px;">
            <h3 style="font-size:16px; margin-bottom:8px; color:var(--warning);">Reset & Seed Demo Dataset</h3>
            <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">Resets database and loads sample records (8 employees, advance loans, leaves, and previous payroll runs).</p>
            <button class="btn btn-danger btn-sm" onclick="resetDemoDataSubmit()">Restore Default Demo Data</button>
          </div>
        </div>
      </div>
    `;
  } catch (e) {}
}

async function saveCompanySettingsSubmit() {
  const payload = {
    company_name: document.getElementById('set_compName').value.trim(),
    tagline: document.getElementById('set_tagline').value.trim(),
    tax_id: document.getElementById('set_taxId').value.trim(),
    email: document.getElementById('set_email').value.trim(),
    phone: document.getElementById('set_phone').value.trim(),
    address: document.getElementById('set_address').value.trim()
  };

  try {
    await apiFetch('/api/settings', { method: 'PUT', body: payload });
    showToast('success', 'Saved', 'Company profile updated.');
  } catch (e) {}
}

async function updateAdminCredentialsSubmit() {
  const currentUsername = document.getElementById('pwd_currUser').value.trim();
  const newUsername = document.getElementById('pwd_newUser').value.trim();
  const newPassword = document.getElementById('pwd_newPass').value;

  try {
    const res = await apiFetch('/api/auth/password', {
      method: 'PUT',
      body: { currentUsername, newUsername, newPassword }
    });
    showToast('success', 'Security Updated', res.message);
    if (state.user) state.user.username = res.username;
    document.getElementById('sidebarUserName').textContent = res.username;
  } catch (e) {}
}

async function resetDemoDataSubmit() {
  if (!confirm('This will wipe any custom records and restore the default sample dataset. Continue?')) return;
  try {
    await apiFetch('/api/settings/reset-demo', { method: 'POST' });
    showToast('success', 'Reset Complete', 'Default dataset restored.');
    await loadInitialAppData();
    renderSettingsView();
  } catch (e) {}
}

// ============================================================
// QUICK SALARY CALCULATOR MODAL
// ============================================================
function openQuickCalculatorModal() {
  const bodyHtml = `
    <div class="form-group">
      <label>Basic Salary (₹)</label>
      <input id="calc_basic" type="number" value="60000" oninput="runQuickCalc()" />
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label>Performance Bonus (₹)</label>
        <input id="calc_bonus" type="number" value="5000" oninput="runQuickCalc()" />
      </div>
      <div class="form-group">
        <label>Advance Deduction (₹)</label>
        <input id="calc_adv" type="number" value="10000" oninput="runQuickCalc()" />
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label>Unpaid Absence Days</label>
        <input id="calc_unpaid" type="number" value="1" oninput="runQuickCalc()" />
      </div>
      <div class="form-group">
        <label>Other Deductions (₹)</label>
        <input id="calc_other" type="number" value="500" oninput="runQuickCalc()" />
      </div>
    </div>

    <div class="hero-formula-card" style="margin-top:16px;">
      <div class="formula-header">
        <span class="formula-tag">INSTANT ARITHMETIC</span>
        <span class="formula-badge">FORMULA RESULT</span>
      </div>
      <div class="formula-math" id="calc_results"></div>
    </div>
  `;

  openGlobalModal('Quick Salary Calculator', 'Instant arithmetic computation tool', bodyHtml, [
    { label: 'Close', cls: 'btn-secondary', onClick: closeGlobalModal }
  ]);

  setTimeout(runQuickCalc, 50);
}

function runQuickCalc() {
  const basic = Number(document.getElementById('calc_basic').value) || 0;
  const bonus = Number(document.getElementById('calc_bonus').value) || 0;
  const adv = Number(document.getElementById('calc_adv').value) || 0;
  const unpaid = Number(document.getElementById('calc_unpaid').value) || 0;
  const other = Number(document.getElementById('calc_other').value) || 0;

  const leaveDed = Math.round((basic / 30) * unpaid);
  const net = Math.max(0, basic + bonus - adv - leaveDed - other);

  document.getElementById('calc_results').innerHTML = `
    <div class="f-row"><span>Basic Salary</span><span class="f-num">${money(basic)}</span></div>
    <div class="f-row plus"><span>+ Bonus</span><span class="f-num">+ ${money(bonus)}</span></div>
    <div class="f-row minus"><span>− Advance Repayment</span><span class="f-num">− ${money(adv)}</span></div>
    <div class="f-row minus"><span>− Leave Deduction (${unpaid} days)</span><span class="f-num">− ${money(leaveDed)}</span></div>
    <div class="f-row minus"><span>− Other Deductions</span><span class="f-num">− ${money(other)}</span></div>
    <div class="f-row total"><span>Net Disbursed Take-Home</span><span class="f-num total-val">${money(net)}</span></div>
  `;
}

// ============================================================
// GLOBAL SEARCH
// ============================================================
let searchTimer = null;
function handleGlobalSearch(term) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (!term.trim()) return;
    navigateTo('employees');
    setTimeout(() => {
      renderEmployeesView('All', 'All', term.trim());
    }, 100);
  }, 350);
}

// ============================================================
// MODAL CONTROLLER
// ============================================================
function openGlobalModal(title, subtitle, bodyHtml, buttons = [], isLarge = false) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalSubtitle').textContent = subtitle || '';
  document.getElementById('modalBody').innerHTML = bodyHtml;

  const card = document.getElementById('globalModalCard');
  if (isLarge) card.classList.add('modal-lg');
  else card.classList.remove('modal-lg');

  const footer = document.getElementById('modalFooter');
  footer.innerHTML = '';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = `btn ${b.cls || 'btn-secondary'}`;
    btn.textContent = b.label;
    btn.onclick = b.onClick;
    footer.appendChild(btn);
  });

  document.getElementById('globalModalOverlay').style.display = 'flex';
}

function closeGlobalModal() {
  document.getElementById('globalModalOverlay').style.display = 'none';
}

document.getElementById('globalModalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'globalModalOverlay') closeGlobalModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeGlobalModal();
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const search = document.getElementById('globalSearchInput');
    if (search) {
      search.focus();
      search.select();
    }
  }
});

// ============================================================
// AUTO-INITIALIZE ON DOM LOAD
// ============================================================
window.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  
  // Check if session exists in sessionStorage
  const sessionRaw = sessionStorage.getItem('paytrack_session');
  if (sessionRaw) {
    try {
      state.user = JSON.parse(sessionRaw);
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('appShell').style.display = 'grid';
      document.getElementById('sidebarUserName').textContent = state.user.name || state.user.username;
      document.getElementById('sidebarUserRole').textContent = state.user.role || 'Admin';
      document.getElementById('sidebarUserAvatar').textContent = (state.user.name || state.user.username).charAt(0).toUpperCase();
      await loadInitialAppData();
      navigateTo('dashboard');
    } catch (e) {
      sessionStorage.removeItem('paytrack_session');
    }
  }
});
