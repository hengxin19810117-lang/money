import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI, categoryAPI } from '../api/auth';

const EXPENSE_CATEGORIES = [
  { id: 'cat_dining', name: '餐饮', icon: 'restaurant', color: '#ff9a9e' },
  { id: 'cat_transit', name: '交通', icon: 'commute', color: '#ffc2d5' },
  { id: 'cat_shopping', name: '购物', icon: 'shopping_bag', color: '#ffb3d1' },
  { id: 'cat_entertainment', name: '娱乐', icon: 'sports_esports', color: '#d4bfff' },
  { id: 'cat_health', name: '医疗', icon: 'medical_services', color: '#ffb3b3' },
  { id: 'cat_education', name: '教育', icon: 'school', color: '#a8d8ff' },
  { id: 'cat_housing', name: '居住', icon: 'home', color: '#b8f0e0' },
  { id: 'cat_other', name: '其他', icon: 'more_horiz', color: '#d0d8e4' },
];

const INCOME_CATEGORIES = [
  { id: 'cat_salary', name: '工资', icon: 'payments', color: '#98ddca' },
  { id: 'cat_bonus', name: '奖金', icon: 'card_giftcard', color: '#a8f0e0' },
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
      <aside className="w-64 flex-shrink-0 flex flex-col border-r glass-effect" style={{ background: 'rgba(30, 30, 50, 0.8)' }}>
        {/* Floating decoration */}
        <div className="absolute -top-4 -right-4 text-4xl floating-decoration" style={{ animationDelay: '0s' }}>🌸</div>

        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 20px rgba(255, 154, 158, 0.5)' }}>
              <span className="material-symbols-outlined text-white text-xl">account_balance_wallet</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-gradient">财务小管家</h1>
              <p className="text-xs text-white/60">✨ 轻量高效记账</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <a className="nav-link active flex items-center gap-3 px-4 py-3 rounded-2xl transition-all" href="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium">首页</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all" href="/transactions">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-medium">账单明细</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all" href="/analytics">
            <span className="material-symbols-outlined">pie_chart</span>
            <span className="font-medium">统计报表</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all" href="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-medium">个人设置</span>
          </a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-pink-400 hover:bg-pink-400/10 transition-all">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Floating decorations */}
        <span className="fixed top-20 right-20 text-3xl floating-decoration opacity-50" style={{ animationDelay: '0.5s' }}>⭐</span>
        <span className="fixed top-40 left-10 text-2xl floating-decoration opacity-30" style={{ animationDelay: '1s' }}>💫</span>

        <div className="p-6 lg:p-8 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">你好，<span className="text-gradient">{user?.nickname || user?.username}</span> 🌟</h2>
              <p className="text-white/60 mt-1">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="glass-effect rounded-2xl px-5 py-3 text-center">
                <p className="text-xs text-white/60">今日支出</p>
                <p className="text-xl font-bold text-pink-400">¥{todayExpense.toFixed(2)}</p>
              </div>
              <div className="glass-effect rounded-2xl px-5 py-3 text-center">
                <p className="text-xs text-white/60">今日收入</p>
                <p className="text-xl font-bold text-emerald-400">¥{todayIncome.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Record Form */}
            <div className="lg:col-span-2 glass-effect rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📝</span>
                <h3 className="text-lg font-bold text-white">记一笔</h3>
              </div>

              {/* Type Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setType('expense'); setCategory(null); }}
                  className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${type === 'expense' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                  style={{ boxShadow: type === 'expense' ? '0 4px 20px rgba(255, 107, 107, 0.4)' : 'none' }}
                >
                  💸 支出
                </button>
                <button
                  onClick={() => { setType('income'); setCategory(null); }}
                  className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${type === 'income' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                  style={{ boxShadow: type === 'income' ? '0 4px 20px rgba(16, 185, 129, 0.4)' : 'none' }}
                >
                  💰 收入
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Amount */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-white/70 block mb-2">💴 金额</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-pink-400">¥</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full h-16 pl-12 pr-4 text-3xl font-bold bg-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-white placeholder-white/30"
                      required
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-white/70 block mb-2">🏷️ 分类</label>
                  <div className="grid grid-cols-4 gap-3">
                    {currentCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${category === cat.id ? 'ring-2 ring-white scale-105' : 'hover:scale-105'}`}
                        style={{
                          backgroundColor: cat.color + '30',
                          ringColor: cat.color
                        }}
                      >
                        <span className="text-2xl">{getCategoryEmoji(cat.id)}</span>
                        <span className="text-xs font-medium text-white">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Amounts */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-white/70 block mb-2">⚡ 快捷金额</label>
                  <div className="flex gap-2">
                    {[10, 50, 100, 200, 500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toString())}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/80 text-sm font-semibold hover:bg-white/20 hover:text-white transition-all"
                      >
                        ¥{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note & Merchant */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-2">📝 备注</label>
                    <input
                      type="text"
                      placeholder="选填"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full h-11 px-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm text-white placeholder-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-2">🏪 商户</label>
                    <input
                      type="text"
                      placeholder="选填"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      className="w-full h-11 px-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm text-white placeholder-white/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!amount || !category || loading}
                  className="w-full h-14 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: type === 'expense' ? 'linear-gradient(135deg, #ff9a9e, #ff6b9d)' : 'linear-gradient(135deg, #98ddca, #2d8b74)' }}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  ) : (
                    <span>{type === 'expense' ? '💸' : '💰'}</span>
                  )}
                  <span>{loading ? '保存中...' : '保存'}</span>
                </button>
              </form>
            </div>

            {/* Today's Records */}
            <div className="glass-effect rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📋</span> 今日记账
                </h3>
                <a href="/transactions" className="text-xs text-pink-400 hover:text-pink-300 transition-colors">查看全部 →</a>
              </div>

              <div className="space-y-3">
                {todayRecords.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    <span className="text-5xl">📭</span>
                    <p className="mt-3 text-sm">今日暂无记账记录</p>
                    <p className="text-xs mt-1">快来记一笔吧~</p>
                  </div>
                ) : (
                  todayRecords.slice(0, 5).map((record) => {
                    const cat = currentCategories.find(c => c.id === record.category_id) || {};
                    return (
                      <div key={record.id} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: (cat.color || '#d0d8e4') + '30' }}>
                          {getCategoryEmoji(cat.id)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{cat.name || '未知分类'}</p>
                          <p className="text-xs text-white/50">{record.note || '-'}</p>
                        </div>
                        <p className={`text-sm font-bold ${record.type === 'expense' ? 'text-pink-400' : 'text-emerald-400'}`}>
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

// Helper function to get emoji for category
function getCategoryEmoji(categoryId) {
  const emojiMap = {
    'cat_dining': '🍜',
    'cat_transit': '🚗',
    'cat_shopping': '🛍️',
    'cat_entertainment': '🎮',
    'cat_health': '💊',
    'cat_education': '📚',
    'cat_housing': '🏠',
    'cat_other': '📦',
    'cat_salary': '💵',
    'cat_bonus': '🎁',
    'cat_investment': '📈',
    'cat_gift': '💝',
    'cat_other_income': '💰',
  };
  return emojiMap[categoryId] || '📝';
}
