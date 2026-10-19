import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI } from '../api/auth';

const getCategoryEmoji = (categoryId) => {
  const emojiMap = {
    'cat_dining': '🍜', 'cat_transit': '🚗', 'cat_shopping': '🛍️',
    'cat_entertainment': '🎮', 'cat_health': '💊', 'cat_education': '📚',
    'cat_housing': '🏠', 'cat_other': '📦', 'cat_salary': '💵',
    'cat_bonus': '🎁', 'cat_investment': '📈', 'cat_gift': '💝',
    'cat_other_income': '💰',
  };
  return emojiMap[categoryId] || '📝';
};

export default function TransactionsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [filters, setFilters] = useState({ type: '', categoryId: '' });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadRecords(); }, [page, year, month, day, viewMode, filters]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      let startDate, endDate;
      if (viewMode === 'day') {
        startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        endDate = startDate;
      } else if (viewMode === 'month') {
        startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      } else {
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
      }
      const res = await recordAPI.list({ page, pageSize: 10, startDate, endDate, ...filters });
      if (res.success && res.data) {
        // Node.js backend returns { records, pagination }
        // Java backend returns { content, totalPages }
        const recordsData = res.data.content || res.data.records || [];
        const pagination = res.data.pagination || {};
        setRecords(Array.isArray(recordsData) ? recordsData : []);
        setTotalPages(pagination.totalPages || res.data.totalPages || 1);
      }
    } catch (err) { console.error('获取记录失败', err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      const res = await recordAPI.delete(id);
      if (res.success) loadRecords();
    } catch (err) { console.error('删除失败', err); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col glass-effect relative">
        <div className="absolute -top-4 -right-4 text-3xl floating-decoration" style={{ animationDelay: '0.2s' }}>🌸</div>

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
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all" href="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium">首页</span>
          </a>
          <a className="nav-link active flex items-center gap-3 px-4 py-3 rounded-2xl transition-all" href="/transactions">
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
        <span className="fixed top-20 right-20 text-3xl floating-decoration opacity-50" style={{ animationDelay: '0.5s' }}>⭐</span>

        <div className="p-6 lg:p-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">账单明细 <span className="text-pink-400">📋</span></h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 glass-effect rounded-xl px-3 py-2">
                <span className="material-symbols-outlined text-white/60 text-lg">calendar_today</span>
                <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-transparent text-white text-sm focus:outline-none cursor-pointer">
                  {years.map(y => <option key={y} value={y} className="bg-gray-800">{y}</option>)}
                </select>
                <span className="text-white/60">年</span>
                {viewMode !== 'year' && (
                  <>
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="bg-transparent text-white text-sm focus:outline-none cursor-pointer">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m} className="bg-gray-800">{String(m).padStart(2, '0')}</option>)}
                    </select>
                    <span className="text-white/60">月</span>
                  </>
                )}
                {viewMode === 'day' && (
                  <>
                    <select value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="bg-transparent text-white text-sm focus:outline-none cursor-pointer">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d} className="bg-gray-800">{String(d).padStart(2, '0')}</option>)}
                    </select>
                    <span className="text-white/60">日</span>
                  </>
                )}
              </div>
              <div className="flex glass-effect rounded-xl p-1">
                {['year', 'month', 'day'].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === mode ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white' : 'text-white/70 hover:text-white'}`}>
                    {mode === 'year' ? '年' : mode === 'month' ? '月' : '日'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-4 mb-6 flex items-center justify-center">
            <span className="material-symbols-outlined text-pink-400 mr-2">date_range</span>
            <span className="text-white/80 text-sm">
              {viewMode === 'year' && `${year}年 全年账单 🌟`}
              {viewMode === 'month' && `${year}年 ${month}月 账单明细 📅`}
              {viewMode === 'day' && `${year}年 ${month}月 ${day}日 账单明细 ✨`}
            </span>
          </div>

          <div className="glass-effect rounded-2xl p-4 mb-6 flex gap-4">
            <select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }} className="px-4 py-2 rounded-xl bg-white/10 text-white focus:outline-none">
              <option value="" className="bg-gray-800">全部类型</option>
              <option value="expense" className="bg-gray-800">💸 支出</option>
              <option value="income" className="bg-gray-800">💰 收入</option>
            </select>
          </div>

          <div className="glass-effect rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-pink-400 animate-spin">progress_activity</span>
                <p className="mt-4 text-white/60">加载中...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-6xl">📭</span>
                <p className="mt-4 text-white/60">暂无记账记录</p>
                <p className="text-white/40 text-sm mt-1">快去记一笔吧~</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {records.map((record) => (
                  <div key={record.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: (record.category_color || '#d0d8e4') + '30' }}>
                      {getCategoryEmoji(record.category_id)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{record.category_name || '未知分类'}</p>
                      <p className="text-xs text-white/50">{record.note || '-'}</p>
                      <p className="text-xs text-white/40">{record.record_date}</p>
                    </div>
                    <p className={`text-lg font-bold ${record.type === 'expense' ? 'text-pink-400' : 'text-emerald-400'}`}>
                      {record.type === 'expense' ? '-' : '+'}¥{parseFloat(record.amount).toFixed(2)}
                    </p>
                    <button onClick={() => handleDelete(record.id)} className="p-2 text-white/40 hover:text-pink-400 transition-all">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="p-4 flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl glass-effect text-white/70 hover:text-white disabled:opacity-50 transition-all">
                  ← 上一页
                </button>
                <span className="px-4 py-2 text-white/60">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl glass-effect text-white/70 hover:text-white disabled:opacity-50 transition-all">
                  下一页 →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
