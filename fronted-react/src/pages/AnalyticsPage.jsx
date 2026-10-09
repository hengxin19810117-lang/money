import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI } from '../api/auth';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function AnalyticsPage() {
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, [year, month]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [statsRes, trendRes] = await Promise.all([
        recordAPI.getMonthlyStats({ year, month }),
        recordAPI.getDailyTrend({ year, month })
      ]);

      if (statsRes.success) setMonthlyStats(statsRes.data);
      if (trendRes.success) setDailyTrend(trendRes.data);
    } catch (err) {
      console.error('获取统计失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 分离支出和收入
  const expenseData = monthlyStats.filter(s => s.type === 'expense');
  const incomeData = monthlyStats.filter(s => s.type === 'income');

  // 计算总计
  const totalExpense = expenseData.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
  const totalIncome = incomeData.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

  // 饼图数据
  const pieData = expenseData.slice(0, 5).map(s => ({
    name: s.category_name,
    value: parseFloat(s.total_amount),
    color: s.category_color || '#d0d8e4'
  }));

  const COLORS = ['#f8a5ab', '#ffc2d5', '#ffb3d1', '#d4bfff', '#a8d8ff'];

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
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface-container-low transition-all" href="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium">首页</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface-container-low transition-all" href="/transactions">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-medium">账单明细</span>
          </a>
          <a className="nav-link active flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-surface-container-low text-primary" href="/analytics">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">统计报表</h2>
            <div className="flex gap-2">
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="px-4 py-2 rounded-lg bg-surface-card-subtle text-text-primary"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="px-4 py-2 rounded-lg bg-surface-card-subtle text-text-primary"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-text-muted text-sm">本月支出</p>
              <p className="text-2xl font-bold text-error mt-1">¥{totalExpense.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-text-muted text-sm">本月收入</p>
              <p className="text-2xl font-bold text-secondary mt-1">¥{totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-text-muted text-sm">本月结余</p>
              <p className={`text-2xl font-bold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-secondary' : 'text-error'}`}>
                ¥{(totalIncome - totalExpense).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">支出分类占比</h3>
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-text-muted">
                  <span className="material-symbols-outlined text-4xl">pie_chart</span>
                  <p className="mt-2">暂无数据</p>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-text-secondary">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Ranking */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">支出 Top 3</h3>
              <div className="space-y-4">
                {expenseData.slice(0, 3).map((item, index) => (
                  <div key={item.category_id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (item.category_color || '#d0d8e4') + '20' }}>
                      <span className="material-symbols-outlined" style={{ color: item.category_color }}>{item.category_icon || 'receipt'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{item.category_name}</p>
                      <p className="text-xs text-text-muted">{item.record_count}笔</p>
                    </div>
                    <p className="text-lg font-bold text-error">¥{parseFloat(item.total_amount).toFixed(2)}</p>
                  </div>
                ))}
                {expenseData.length === 0 && (
                  <div className="text-center py-8 text-text-muted">
                    <span className="material-symbols-outlined text-4xl">trending_up</span>
                    <p className="mt-2">暂无数据</p>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Trend */}
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-text-primary mb-4">日度趋势</h3>
              {dailyTrend.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTrend}>
                      <XAxis dataKey="record_date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
                      <Bar dataKey="expense" name="支出" fill="#dc2626" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="income" name="收入" fill="#2d8b74" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-text-muted">
                  <span className="material-symbols-outlined text-4xl">bar_chart</span>
                  <p className="mt-2">暂无数据</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
