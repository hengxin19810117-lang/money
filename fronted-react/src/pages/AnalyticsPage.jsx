import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI } from '../api/auth';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
const COLORS = ['#ff9a9e', '#ffc2d5', '#ffb3d1', '#d4bfff', '#a8d8ff', '#98ddca', '#ffd93d', '#6bcb77'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, [year, month, day, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      let statsRes, trendRes;
      if (viewMode === 'year') {
        statsRes = await recordAPI.getYearlyStats({ year });
        trendRes = { success: true, data: [] };
      } else if (viewMode === 'month') {
        statsRes = await recordAPI.getMonthlyStats({ year, month });
        trendRes = await recordAPI.getDailyTrend({ year, month });
      } else {
        statsRes = await recordAPI.getDailyTrend({ year, month, day });
        trendRes = await recordAPI.getDailyTrend({ year, month, day });
      }
      if (statsRes.success) setStats(statsRes.data);
      if (trendRes.success) setTrend(trendRes.data);
    } catch (err) { console.error('获取统计失败', err); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const expenseData = viewMode === 'day'
    ? [{ type: 'expense', total_amount: trend.reduce((sum, t) => sum + parseFloat(t.expense || 0), 0) }]
    : stats.filter(s => s.type === 'expense');
  const incomeData = viewMode === 'day'
    ? [{ type: 'income', total_amount: trend.reduce((sum, t) => sum + parseFloat(t.income || 0), 0) }]
    : stats.filter(s => s.type === 'income');

  const totalExpense = expenseData.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
  const totalIncome = incomeData.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);

  const pieData = (viewMode === 'day' ? stats : expenseData).slice(0, 5).map(s => ({
    name: s.category_name || (s.record_date ? s.record_date.slice(-2) + '日' : '支出'),
    value: parseFloat(s.total_amount || s.expense || 0),
    color: s.category_color || '#f8a5ab'
  }));

  const trendData = viewMode === 'year'
    ? Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const exp = stats.filter(s => s.type === 'expense' && s.month === m).reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
        const inc = stats.filter(s => s.type === 'income' && s.month === m).reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
        return { name: `${m}月`, expense: exp, income: inc };
      })
    : viewMode === 'day'
      ? [{ name: `${day}日`, expense: trend.reduce((sum, t) => sum + parseFloat(t.expense || 0), 0), income: trend.reduce((sum, t) => sum + parseFloat(t.income || 0), 0) }]
      : trend.map(t => ({ name: t.record_date?.slice(-2) + '日', expense: parseFloat(t.expense || 0), income: parseFloat(t.income || 0) }));

  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col glass-effect relative">
        <div className="absolute -top-4 -right-4 text-3xl floating-decoration" style={{ animationDelay: '0.3s' }}>💫</div>

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
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all" href="/transactions">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-medium">账单明细</span>
          </a>
          <a className="nav-link active flex items-center gap-3 px-4 py-3 rounded-2xl transition-all" href="/analytics">
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
        <span className="fixed top-40 left-10 text-2xl floating-decoration opacity-40" style={{ animationDelay: '1s' }}>✨</span>

        <div className="p-6 lg:p-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">统计报表 <span className="text-purple-400">📊</span></h2>
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
                      {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1).map(d => <option key={d} value={d} className="bg-gray-800">{String(d).padStart(2, '0')}</option>)}
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
              {viewMode === 'year' && `${year}年 全年数据 🌟`}
              {viewMode === 'month' && `${year}年 ${month}月 共${getDaysInMonth(year, month)}天 📅`}
              {viewMode === 'day' && `${year}年 ${month}月 ${day}日 ✨`}
            </span>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="glass-effect rounded-2xl p-6 text-center">
              <p className="text-white/60 text-sm">{viewMode === 'year' ? '本年支出' : viewMode === 'month' ? '本月支出' : '今日支出'}</p>
              <p className="text-2xl font-bold text-pink-400 mt-1">💸 ¥{totalExpense.toFixed(2)}</p>
            </div>
            <div className="glass-effect rounded-2xl p-6 text-center">
              <p className="text-white/60 text-sm">{viewMode === 'year' ? '本年收入' : viewMode === 'month' ? '本月收入' : '今日收入'}</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">💰 ¥{totalIncome.toFixed(2)}</p>
            </div>
            <div className="glass-effect rounded-2xl p-6 text-center">
              <p className="text-white/60 text-sm">{viewMode === 'year' ? '本年结余' : viewMode === 'month' ? '本月结余' : '今日结余'}</p>
              <p className={`text-2xl font-bold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                {totalIncome - totalExpense >= 0 ? '🎉' : '⚠️'} ¥{(totalIncome - totalExpense).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {viewMode === 'year' ? '📊 年度支出分类' : viewMode === 'month' ? '🥧 支出分类占比' : '📈 收支概览'}
              </h3>
              {viewMode === 'day' ? (
                <div className="h-64 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <p className="text-white/60 text-sm">今日结余</p>
                    <p className={`text-4xl font-bold mt-2 ${totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                      ¥{(totalIncome - totalExpense).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-8 mt-6">
                    <div className="text-center">
                      <p className="text-xs text-white/60">支出</p>
                      <p className="text-xl font-bold text-pink-400">¥{totalExpense.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white/60">收入</p>
                      <p className="text-xl font-bold text-emerald-400">¥{totalIncome.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ) : pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'rgba(30, 30, 50, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-white/40">
                  <span className="text-6xl">📭</span>
                  <p className="mt-4">暂无数据</p>
                </div>
              )}
              {viewMode !== 'day' && pieData.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs text-white/70">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Ranking */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {viewMode === 'year' ? '🏆 年度支出 Top 5' : viewMode === 'month' ? '🥇 支出 Top 3' : '💳 今日支出构成'}
              </h3>
              {viewMode === 'day' ? (
                <div className="text-center py-8">
                  <p className="text-5xl">💸</p>
                  <p className="text-4xl font-bold text-pink-400 mt-4">¥{totalExpense.toFixed(2)}</p>
                  <p className="text-white/60 text-sm mt-2">今日支出总额</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenseData.slice(0, viewMode === 'year' ? 5 : 3).map((item, index) => (
                    <div key={item.category_id || index} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-600'}`}>
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: (item.category_color || '#d0d8e4') + '30' }}>
                        {getCategoryEmoji(item.category_id)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{item.category_name || `${item.month}月`}</p>
                        <p className="text-xs text-white/50">{item.record_count || 0}笔</p>
                      </div>
                      <p className="text-lg font-bold text-pink-400">¥{parseFloat(item.total_amount || 0).toFixed(2)}</p>
                    </div>
                  ))}
                  {expenseData.length === 0 && (
                    <div className="text-center py-8 text-white/40">
                      <span className="text-5xl">📭</span>
                      <p className="mt-4">暂无数据</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Trend Chart */}
            <div className="glass-effect rounded-2xl p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {viewMode === 'year' ? '📈 月度趋势' : viewMode === 'month' ? '📉 日度趋势' : '⚖️ 收支对比'}
              </h3>
              {viewMode === 'day' ? (
                <div className="grid grid-cols-2 gap-4 h-64">
                  <div className="rounded-2xl p-6 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,107,107,0.1))' }}>
                    <span className="text-4xl">📉</span>
                    <p className="text-white/60 text-sm mt-2">支出</p>
                    <p className="text-3xl font-bold text-pink-400 mt-2">¥{trend.reduce((sum, t) => sum + parseFloat(t.expense || 0), 0).toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl p-6 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))' }}>
                    <span className="text-4xl">📈</span>
                    <p className="text-white/60 text-sm mt-2">收入</p>
                    <p className="text-3xl font-bold text-emerald-400 mt-2">¥{trend.reduce((sum, t) => sum + parseFloat(t.income || 0), 0).toFixed(2)}</p>
                  </div>
                </div>
              ) : trendData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#ffffff80' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#ffffff80' }} />
                      <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'rgba(30, 30, 50, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                      <Bar dataKey="expense" name="支出" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="income" name="收入" fill="#2d8b74" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-white/40">
                  <span className="text-5xl">📭</span>
                  <p className="mt-4">暂无趋势数据</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function getCategoryEmoji(categoryId) {
  const emojiMap = {
    'cat_dining': '🍜', 'cat_transit': '🚗', 'cat_shopping': '🛍️',
    'cat_entertainment': '🎮', 'cat_health': '💊', 'cat_education': '📚',
    'cat_housing': '🏠', 'cat_other': '📦', 'cat_salary': '💵',
    'cat_bonus': '🎁', 'cat_investment': '📈', 'cat_gift': '💝',
    'cat_other_income': '💰',
  };
  return emojiMap[categoryId] || '📝';
}
