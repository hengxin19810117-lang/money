/**
 * 财务小管家 - 统一应用逻辑
 * 数据存储、用户认证、路由导航
 */

// ============================================
// 配置常量
// ============================================
const CONFIG = {
  STORAGE_KEYS: {
    USERS: 'fm_users',
    SESSION: 'fm_session',
    RECORDS: 'fm_records',
    BUDGET: 'fm_budget'
  },
  CATEGORIES: {
    expense: [
      { id: 'dining', name: '餐饮', icon: '🍜', color: '#FFB5BA' },
      { id: 'transit', name: '交通', icon: '🚗', color: '#FFD4E5' },
      { id: 'shopping', name: '购物', icon: '🛒', color: '#FFCCE5' },
      { id: 'housing', name: '居住', icon: '🏠', color: '#FFE4EC' },
      { id: 'entertainment', name: '娱乐', icon: '🎮', color: '#E8D5FF' },
      { id: 'medical', name: '医疗', icon: '💊', color: '#FFF3B0' },
      { id: 'education', name: '教育', icon: '📚', color: '#C5E8FF' },
      { id: 'other', name: '其他', icon: '📌', color: '#D4F0F0' }
    ],
    income: [
      { id: 'salary', name: '工资薪酬', icon: '💰', color: '#98DDCA' },
      { id: 'investment', name: '理财分红', icon: '📈', color: '#98DDCA' },
      { id: 'parttime', name: '兼职副业', icon: '💼', color: '#98DDCA' },
      { id: 'redpacket', name: '人情红包', icon: '🧧', color: '#98DDCA' },
      { id: 'reimburse', name: '公务报销', icon: '🧾', color: '#98DDCA' },
      { id: 'other-in', name: '其他入账', icon: '✨', color: '#98DDCA' }
    ]
  },
  CHANNELS: ['微信支付', '支付宝', '招商银行卡', '现金钱包'],
  DEFAULT_BUDGET: 15000
};

// ============================================
// 数据存储模块
// ============================================
const Storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  }
};

// ============================================
// 用户认证模块
// ============================================
const Auth = {
  // 获取用户列表
  getUsers() {
    return Storage.get(CONFIG.STORAGE_KEYS.USERS) || [];
  },

  // 获取当前会话
  getSession() {
    return Storage.get(CONFIG.STORAGE_KEYS.SESSION) || null;
  },

  // 获取当前用户
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    const users = this.getUsers();
    return users.find(u => u.id === session.userId) || null;
  },

  // 检查是否已登录
  isLoggedIn() {
    return this.getSession() !== null;
  },

  // 用户名是否已存在
  isUsernameExists(username) {
    const users = this.getUsers();
    return users.some(u => u.username.toLowerCase() === username.toLowerCase());
  },

  // 注册用户
  register(username, password) {
    if (this.isUsernameExists(username)) {
      return { success: false, message: '用户名已存在' };
    }

    const users = this.getUsers();
    const newUser = {
      id: 'user_' + Date.now(),
      username: username.trim(),
      password: this.hashPassword(password),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    Storage.set(CONFIG.STORAGE_KEYS.USERS, users);

    return { success: true, message: '注册成功', user: newUser };
  },

  // 登录
  login(username, password, remember = false) {
    const users = this.getUsers();
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() &&
           u.password === this.hashPassword(password)
    );

    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }

    const session = {
      userId: user.id,
      username: user.username,
      loginAt: new Date().toISOString()
    };

    Storage.set(CONFIG.STORAGE_KEYS.SESSION, session);

    if (remember) {
      Storage.set('fm_remember_token', 'true');
    }

    return { success: true, message: '登录成功', user };
  },

  // 登出
  logout() {
    Storage.remove(CONFIG.STORAGE_KEYS.SESSION);
    Storage.remove('fm_remember_token');
  },

  // 简单密码哈希 (实际应用应使用更安全的方法)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
  }
};

// ============================================
// 记账记录模块
// ============================================
const Records = {
  // 获取所有记录
  getAll() {
    return Storage.get(CONFIG.STORAGE_KEYS.RECORDS) || [];
  },

  // 获取当前用户的记录
  getByUser(userId) {
    const records = this.getAll();
    return records.filter(r => r.userId === userId);
  },

  // 添加记录
  add(record) {
    const records = this.getAll();
    const newRecord = {
      id: 'rec_' + Date.now(),
      ...record,
      createdAt: new Date().toISOString()
    };
    records.push(newRecord);
    Storage.set(CONFIG.STORAGE_KEYS.RECORDS, records);
    return newRecord;
  },

  // 更新记录
  update(id, updates) {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    Storage.set(CONFIG.STORAGE_KEYS.RECORDS, records);
    return records[index];
  },

  // 删除记录
  delete(id) {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    Storage.set(CONFIG.STORAGE_KEYS.RECORDS, filtered);
    return true;
  },

  // 按日期筛选
  getByDateRange(userId, startDate, endDate) {
    const records = this.getByUser(userId);
    return records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
  },

  // 获取今日记录
  getToday(userId) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return this.getByDateRange(userId, startOfDay, endOfDay);
  },

  // 获取本月记录
  getThisMonth(userId) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    return this.getByDateRange(userId, startOfMonth, endOfMonth);
  },

  // 计算支出/收入总计
  getSummary(records) {
    const expense = records
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const income = records
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    return { expense, income, total: income - expense };
  },

  // 按分类汇总
  getByCategory(records, type = 'expense') {
    const filtered = records.filter(r => r.type === type);
    const grouped = {};

    filtered.forEach(r => {
      if (!grouped[r.categoryId]) {
        grouped[r.categoryId] = {
          categoryId: r.categoryId,
          categoryName: r.categoryName,
          icon: r.icon,
          color: r.color,
          total: 0,
          count: 0
        };
      }
      grouped[r.categoryId].total += parseFloat(r.amount);
      grouped[r.categoryId].count += 1;
    });

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }
};

// ============================================
// 预算模块
// ============================================
const Budget = {
  get() {
    return Storage.get(CONFIG.STORAGE_KEYS.BUDGET) || { amount: CONFIG.DEFAULT_BUDGET };
  },

  set(amount) {
    Storage.set(CONFIG.STORAGE_KEYS.BUDGET, { amount });
  },

  getRemaining(userId) {
    const budget = this.get();
    const monthRecords = Records.getThisMonth(userId);
    const summary = Records.getSummary(monthRecords);
    return budget.amount - summary.expense;
  },

  getUsagePercent(userId) {
    const budget = this.get();
    const monthRecords = Records.getThisMonth(userId);
    const summary = Records.getSummary(monthRecords);
    if (budget.amount === 0) return 0;
    return Math.min(100, (summary.expense / budget.amount) * 100);
  }
};

// ============================================
// 路由模块
// ============================================
const Router = {
  // 路由映射
  routes: {
    'login': 'pages/login.html',
    'register': 'pages/register.html',
    'dashboard': 'pages/dashboard.html',
    'transactions': 'pages/transactions.html',
    'analytics': 'pages/analytics.html',
    'settings': 'pages/settings.html'
  },

  // 获取当前路径
  getCurrentPath() {
    const hash = window.location.hash.slice(1);
    return hash || 'login';
  },

  // 导航到指定页面
  navigate(path) {
    if (this.routes[path]) {
      window.location.hash = path;
    } else {
      console.error('Unknown route:', path);
    }
  },

  // 初始化路由监听
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());

    // 检查登录状态并路由
    this.handleRoute();
  },

  // 处理路由
  handleRoute() {
    const path = this.getCurrentPath();

    // 已登录用户访问登录/注册页，重定向到 dashboard
    if (Auth.isLoggedIn() && (path === 'login' || path === 'register')) {
      this.navigate('dashboard');
      return;
    }

    // 未登录用户访问其他页面，重定向到登录页
    if (!Auth.isLoggedIn() && !['login', 'register'].includes(path)) {
      this.navigate('login');
      return;
    }

    // 更新导航高亮
    this.updateNavActive(path);
  },

  // 更新导航高亮状态
  updateNavActive(currentPath) {
    document.querySelectorAll('.nav-item').forEach(item => {
      const itemPath = item.getAttribute('data-path');
      if (itemPath === currentPath) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
};

// ============================================
// UI 工具模块
// ============================================
const UI = {
  // 显示 Toast 消息
  showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // 触发动画
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 自动移除
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  },

  // 格式化金额
  formatAmount(amount, showSign = true) {
    const num = parseFloat(amount);
    const sign = showSign && num > 0 ? '+' : '';
    return `${sign}¥ ${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  },

  // 格式化时间
  formatTime(dateStr) {
    const date = new Date(dateStr);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  // 获取日期字符串
  getDateString(date = new Date()) {
    return date.toISOString().split('T')[0];
  },

  // 获取今日日期字符串
  getTodayString() {
    return this.getDateString(new Date());
  },

  // 获取当前年月
  getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  },

  // 获取星期几
  getWeekday() {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return weekdays[new Date().getDay()];
  },

  // 生成金额快捷按钮 HTML
  getQuickAmountButtons() {
    const amounts = [10, 20, 50, 100, 500];
    return amounts.map(a =>
      `<button class="px-3 py-1 rounded-full bg-surface-card hover:bg-surface-container-high text-on-surface font-mono text-sm transition-all shadow-sm" onclick="setAmount(${a})">¥${a}</button>`
    ).join('');
  },

  // 生成分类网格 HTML
  getCategoryGrid(type = 'expense') {
    const categories = CONFIG.CATEGORIES[type];
    return categories.map(cat => `
      <button class="category-btn" data-cat="${cat.id}" onclick="selectCategory('${cat.id}', '${cat.name}', '${cat.color}')">
        <div class="category-icon" style="background-color: ${cat.color};">${cat.icon}</div>
        <span class="category-name">${cat.name}</span>
      </button>
    `).join('');
  },

  // 生成交易列表项 HTML
  getTxItemHTML(record) {
    const isExpense = record.type === 'expense';
    return `
      <div class="tx-item" id="${record.id}">
        <div class="tx-item-left">
          <div class="tx-icon" style="background-color: ${record.color};">${record.icon}</div>
          <div class="tx-info">
            <div class="tx-title">
              ${record.categoryName}
              <span class="tx-note">· ${record.note || '无备注'}</span>
            </div>
            <div class="tx-meta">${UI.formatDate(record.date)} ${UI.formatTime(record.createdAt)} · ${record.channel}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="tx-amount ${isExpense ? 'expense' : 'income'}">${isExpense ? '-' : '+'}¥ ${parseFloat(record.amount).toFixed(2)}</span>
          <div class="tx-actions">
            <button class="p-1 text-text-muted hover:text-error transition-colors" onclick="deleteRecord('${record.id}')" title="删除">
              <span class="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // 生成空状态 HTML
  getEmptyStateHTML(icon, title, description) {
    return `
      <div class="empty-state">
        <div class="empty-icon">
          <span class="material-symbols-outlined">${icon}</span>
        </div>
        <div class="empty-title">${title}</div>
        <div class="empty-desc">${description}</div>
      </div>
    `;
  }
};

// ============================================
// 全局函数 (供页面调用)
// ============================================

// 导航到页面
function navigateTo(path) {
  Router.navigate(path);
}

// 登出
function logout() {
  Auth.logout();
  UI.showToast('已安全退出', 'info');
  navigateTo('login');
}

// 设置金额
function setAmount(val) {
  const input = document.getElementById('amount-input');
  if (input) {
    input.value = Number(val).toFixed(2);
    input.focus();
  }
}

// 选择分类
let selectedCategory = null;
function selectCategory(id, name, color) {
  const iconMap = {};
  CONFIG.CATEGORIES.expense.forEach(c => iconMap[c.id] = c.icon);
  CONFIG.CATEGORIES.income.forEach(c => iconMap[c.id] = c.icon);

  selectedCategory = {
    id,
    name,
    color,
    icon: iconMap[id] || '📌'
  };

  // 更新 UI
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.cat === id) {
      btn.classList.add('active');
    }
  });
}

// 提交记账
function submitTransaction() {
  const user = Auth.getCurrentUser();
  if (!user) {
    navigateTo('login');
    return;
  }

  const amountInput = document.getElementById('amount-input');
  const noteInput = document.getElementById('tx-note');
  const dateInput = document.getElementById('tx-date');

  const amount = parseFloat(amountInput?.value);
  if (!amount || amount <= 0) {
    UI.showToast('请输入有效的记账金额', 'error');
    amountInput?.focus();
    return;
  }

  if (!selectedCategory) {
    UI.showToast('请选择分类', 'error');
    return;
  }

  const type = document.getElementById('tab-expense')?.classList.contains('active') ? 'expense' : 'income';
  const note = noteInput?.value.trim() || '';
  const date = dateInput?.value || UI.getTodayString();
  const channel = document.querySelector('.channel-pill.active')?.textContent?.trim() || '微信支付';

  const record = Records.add({
    userId: user.id,
    type,
    amount,
    categoryId: selectedCategory.id,
    categoryName: selectedCategory.name,
    icon: selectedCategory.icon,
    color: selectedCategory.color,
    note,
    date,
    channel
  });

  UI.showToast(`成功记录: ${selectedCategory.name} ¥${amount.toFixed(2)}`, 'success');

  // 清空表单
  if (amountInput) amountInput.value = '';
  if (noteInput) {
    noteInput.value = '';
    const counter = document.getElementById('note-counter');
    if (counter) counter.textContent = '0/50字';
  }
  if (dateInput) dateInput.value = UI.getTodayString();

  // 刷新列表
  if (typeof loadTodayRecords === 'function') {
    loadTodayRecords();
  }
  if (typeof updateTodaySummary === 'function') {
    updateTodaySummary();
  }
}

// 删除记录
function deleteRecord(id) {
  if (confirm('确定要删除这条记录吗？')) {
    Records.delete(id);
    UI.showToast('记录已删除', 'info');

    // 刷新列表
    if (typeof loadTodayRecords === 'function') {
      loadTodayRecords();
    }
    if (typeof updateTodaySummary === 'function') {
      updateTodaySummary();
    }
  }
}

// 重置表单
function resetForm() {
  const amountInput = document.getElementById('amount-input');
  const noteInput = document.getElementById('tx-note');

  if (amountInput) amountInput.value = '';
  if (noteInput) {
    noteInput.value = '';
    const counter = document.getElementById('note-counter');
    if (counter) counter.textContent = '0/50字';
  }

  selectCategory('dining', '餐饮', '#FFB5BA');
  UI.showToast('表单已清空', 'info');
}

// 更新备注计数
function updateNoteCounter(el) {
  const counter = document.getElementById('note-counter');
  if (counter) {
    counter.textContent = `${el.value.length}/50字`;
  }
}

// 切换收支类型
function switchType(type) {
  const expenseTab = document.getElementById('tab-expense');
  const incomeTab = document.getElementById('tab-income');
  const expenseGrid = document.getElementById('expense-category-grid');
  const incomeGrid = document.getElementById('income-category-grid');
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-btn-text');
  const catLabel = document.getElementById('category-section-label');

  if (type === 'expense') {
    expenseTab?.classList.add('active');
    incomeTab?.classList.remove('active');
    expenseGrid?.classList.remove('hidden');
    incomeGrid?.classList.add('hidden');
    if (catLabel) catLabel.textContent = '支出分类';
    if (submitBtn) submitBtn.style.backgroundColor = '#FFB5BA';
    if (submitText) submitText.textContent = '立即记一笔 (支出)';
    selectCategory('dining', '餐饮', '#FFB5BA');
  } else {
    incomeTab?.classList.add('active');
    expenseTab?.classList.remove('active');
    expenseGrid?.classList.add('hidden');
    incomeGrid?.classList.remove('hidden');
    if (catLabel) catLabel.textContent = '收入来源';
    if (submitBtn) submitBtn.style.backgroundColor = '#98DDCA';
    if (submitText) submitText.textContent = '立即记一笔 (入账)';
    selectCategory('salary', '工资薪酬', '#98DDCA');
  }
}

// 选择支付渠道
function setChannel(el) {
  document.querySelectorAll('.channel-pill').forEach(btn => {
    btn.classList.remove('bg-primary-container', 'text-on-primary-container');
    btn.classList.add('bg-surface-card-subtle', 'text-text-secondary');
  });
  el.classList.remove('bg-surface-card-subtle', 'text-text-secondary');
  el.classList.add('bg-primary-container', 'text-on-primary-container');
}

// 初始化支付渠道
function initChannels() {
  const container = document.getElementById('channel-pills');
  if (!container) return;

  container.innerHTML = CONFIG.CHANNELS.map((ch, i) => `
    <button class="channel-pill px-3 py-1 rounded-full text-xs font-medium ${i === 0 ? 'bg-primary-container text-on-primary-container' : 'bg-surface-card-subtle text-text-secondary hover:bg-surface-container-high'}" onclick="setChannel(this)">
      ${ch}
    </button>
  `).join('');
}

// ============================================
// 应用初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // 初始化路由
  Router.init();
});

// 导出模块供外部使用
window.App = {
  CONFIG,
  Storage,
  Auth,
  Records,
  Budget,
  Router,
  UI,
  navigateTo,
  logout,
  setAmount,
  selectCategory,
  submitTransaction,
  deleteRecord,
  resetForm,
  updateNoteCounter,
  switchType,
  setChannel,
  initChannels
};
