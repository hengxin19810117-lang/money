import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI, categoryAPI } from '../api/auth';

const EXPENSE_CATEGORIES = [
  { id: 'cat_dining', name: '餐饮', icon: 'restaurant', color: '#f8a5ab' },
  { id: 'cat_transit', name: '交通', icon: 'commute', color: '#ffc2d5' },
  { id: 'cat_shopping', name: '购物', icon: 'shopping_bag', color: '#ffb3d1' },
  { id: 'cat_entertainment', name: '娱乐', icon: 'sports_esports', color: '#d4bfff' },
  { id: 'cat_health', name: '医疗', icon: 'medical_services', color: '#ff9a9a' },
  { id: 'cat_education', name: '教育', icon: 'school', color: '#a8d8ff' },
  { id: 'cat_housing', name: '居住', icon: 'home', color: '#a8d8b9' },
  { id: 'cat_other', name: '其他', icon: 'more_horiz', color: '#d0d8e4' },
];

const INCOME_CATEGORIES = [
  { id: 'cat_salary', name: '工资', icon: 'payments', color: '#6fcfb8' },
  { id: 'cat_bonus', name: '奖金', icon: 'card_giftcard', color: '#98ddca' },
  { id: 'cat_investment', name: '投资', icon: 'trending_up', color: '#b8f0e0' },
  { id: 'cat_gift', name: '礼金', icon: 'volunteer_activism', color: '#d4f4e8' },
  { id: 'cat_other_income', name: '其他', icon: 'more_horiz', color: '#e0e8f0' },
];

export default function DashboardPage() {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [note, setNote] = useState('');
  const [merchant, setMerchant] = useState('');
  const [paymentChannel, setPaymentChannel] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayRecords, setTodayRecords] = useState([]);
  const [categories, setCategories] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    loadTodayRecords();
    loadCategories();
  }, []);

  const loadTodayRecords = async () => {
    try {
      const res = await recordAPI.getToday();
      if (res.success) {
        setTodayRecords(res.data);
      }
    } catch (err) {
      console.error('获取今日记录失败', err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.list();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('获取分类失败', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category) return;

    setLoading(true);
    try {
      const res = await recordAPI.create({
        type,
        amount: parseFloat(amount),
        categoryId: category,
        note,
        merchant,
        paymentChannel,
        recordDate: new Date().toISOString().split('T')[0],
      });

      if (res.success) {
        setAmount('');
        setCategory(null);
        setNote('');
        setMerchant('');
        loadTodayRecords();
      }
    } catch (err) {
      console.error('记账失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const todayExpense = todayRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const todayIncome = todayRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + parseFloat(r.amount), 0);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border-subtle bg-white">
        <div className="p-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl">account_balance_wallet</span>
            </div>
            <div>
              <h1 className="font-bold text-text-primary text-lg leading-tight">财务小管家</h1>
              <p className="text-xs text-text-muted">轻量高效记账</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a className="nav-link active flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-surface-container-low text-primary" href="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium">首页</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface-container-low transition-all" href="/transactions">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-medium">账单明细</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface-container-low transition-all" href="/analytics">
            <span className="material-symbols-outlined">pie_chart</span>
            <span className="font-medium">统计报表</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface-container-low transition-all" href="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-medium">个人设置</span>
          </a>
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-red-50 hover:text-error transition-all">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">你好，{user?.nickname || user?.username}</h2>
              <p className="text-text-secondary mt-1">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-text-muted">今日支出</p>
                <p className="text-lg font-bold text-error">¥{todayExpense.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">今日收入</p>
                <p className="text-lg font-bold text-secondary">¥{todayIncome.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Record Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">记一笔</h3>

              {/* Type Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setType('expense'); setCategory(null); }}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${type === 'expense' ? 'bg-error text-white' : 'bg-surface-card-subtle text-text-secondary'}`}
                >
                  支出
                </button>
                <button
                  onClick={() => { setType('income'); setCategory(null); }}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${type === 'income' ? 'bg-secondary text-white' : 'bg-surface-card-subtle text-text-secondary'}`}
                >
                  收入
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Amount */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-text-primary block mb-2">金额</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-text-muted">¥</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full h-14 pl-10 pr-4 text-2xl font-bold bg-surface-card-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-border-focus"
                      required
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-text-primary block mb-2">分类</label>
                  <div className="grid grid-cols-4 gap-2">
                    {currentCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${category === cat.id ? 'ring-2 ring-offset-2' : ''}`}
                        style={{
                          backgroundColor: cat.color + '20',
                          color: type === 'expense' ? '#a05a63' : '#2d8b74',
                          ringColor: cat.color
                        }}
                      >
                        <span className="material-symbols-outlined text-xl" style={{ color: cat.color }}>{cat.icon}</span>
                        <span className="text-xs font-medium">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Amounts */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-text-primary block mb-2">快捷金额</label>
                  <div className="flex gap-2">
                    {[10, 50, 100, 200, 500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toString())}
                        className="flex-1 py-2 rounded-lg bg-surface-card-subtle text-text-secondary text-sm font-medium hover:bg-border-subtle transition-all"
                      >
                        ¥{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note & Merchant */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-2">备注</label>
                    <input
                      type="text"
                      placeholder="选填"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full h-10 px-3 bg-surface-card-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-border-focus text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-2">商户</label>
                    <input
                      type="text"
                      placeholder="选填"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      className="w-full h-10 px-3 bg-surface-card-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-border-focus text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!amount || !category || loading}
                  className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: type === 'expense' ? '#a05a63' : '#2d8b74' }}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined">add</span>
                  )}
                  <span>保存</span>
                </button>
              </form>
            </div>

            {/* Today's Records */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">今日记账</h3>
                <a href="/transactions" className="text-xs text-primary hover:underline">查看全部</a>
              </div>

              <div className="space-y-3">
                {todayRecords.length === 0 ? (
                  <div className="text-center py-8 text-text-muted">
                    <span className="material-symbols-outlined text-4xl">receipt_long</span>
                    <p className="mt-2 text-sm">今日暂无记账记录</p>
                  </div>
                ) : (
                  todayRecords.slice(0, 5).map((record) => {
                    const cat = currentCategories.find(c => c.id === record.category_id) || {};
                    return (
                      <div key={record.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-card-subtle">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (cat.color || '#d0d8e4') + '20' }}>
                          <span className="material-symbols-outlined" style={{ color: cat.color }}>{cat.icon || 'receipt'}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{cat.name || '未知分类'}</p>
                          <p className="text-xs text-text-muted">{record.note || '-'}</p>
                        </div>
                        <p className={`text-sm font-bold ${record.type === 'expense' ? 'text-error' : 'text-secondary'}`}>
                          {record.type === 'expense' ? '-' : '+'}¥{parseFloat(record.amount).toFixed(2)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
