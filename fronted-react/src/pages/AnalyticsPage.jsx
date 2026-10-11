import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI } from '../api/auth';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

// Helper to get days in a month
const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();

export default function AnalyticsPage() {
  const [stats, setStats] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'year', 'month', 'day'
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [year, month, day, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      let statsRes, trendRes;

      if (viewMode === 'year') {
        // 按年查看：获取每月汇总
        statsRes = await recordAPI.getYearlyStats({ year });
        trendRes = { success: true, data: [] }; // 年度趋势不需要日度数据
      } else if (viewMode === 'month') {
        // 按月查看：获取分类统计和每日趋势
        statsRes = await recordAPI.getMonthlyStats({ year, month });
        trendRes = await recordAPI.getDailyTrend({ year, month });
      } else {
        // 按日查看：获取当日分类统计
        statsRes = await recordAPI.getMonthlyStats({ year, month, day });
        trendRes = { success: true, data: [] };
      }

      if (statsRes.success) setStats(statsRes.data);
      if (trendRes.success) setTrend(trendRes.data);
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
  const expenseData = stats.filter(s => s.type === 'expense');
  const incomeData = stats.filter(s => s.type === 'income');

  // 计算总计
  const totalExpense = expenseData.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
  const totalIncome = incomeData.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);

  // 饼图数据
  const pieData = expenseData.slice(0, 5).map(s => ({
    name: s.category_name || s.month + '月',
    value: parseFloat(s.total_amount || 0),
    color: s.category_color || '#d0d8e4'
  }));

  const COLORS = ['#f8a5ab', '#ffc2d5', '#ffb3d1', '#d4bfff', '#a8d8ff', '#98ddca', '#ffd93d', '#6bcb77'];

  // 趋势图数据
  const trendData = viewMode === 'year'
    ? Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const exp = stats.filter(s => s.type === 'expense' && s.month === m).reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
        const inc = stats.filter(s => s.type === 'income' && s.month === m).reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
        return { name: `${m}月`, expense: exp, income: inc };
      })
    : trend.map(t => ({
        name: viewMode === 'month' ? t.record_date?.slice(-2) + '日' : t.record_date,
        expense: parseFloat(t.expense || 0),
        income: parseFloat(t.income || 0)
      }));

  const years = [2024, 2025, 2026, 2027];

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
            <div className="flex items-center gap-3">
              {/* Combined Time Selector */}
              <div className="flex items-center gap-2 bg-surface-card-subtle rounded-lg px-3 py-2">
                <span className="material-symbols-outlined text-text-muted text-lg">calendar_today</span>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="bg-transparent text-text-primary text-sm focus:outline-none cursor-pointer"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span className="text-text-muted">年</span>

                {viewMode !== 'year' && (
                  <>
                    <select
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                      className="bg-transparent text-text-primary text-sm focus:outline-none cursor-pointer"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span className="text-text-muted">月</span>
                  </>
                )}

                {viewMode === 'day' && (
                  <>
                    <select
                      value={day}
                      onChange={(e) => setDay(parseInt(e.target.value))}
                      className="bg-transparent text-text-primary text-sm focus:outline-none cursor-pointer"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span className="text-text-muted">日</span>
                  </>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-surface-card-subtle rounded-lg p-1">
                <button
                  onClick={() => setViewMode('year')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'year' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  年
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'month' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  月
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'day' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  日
                </button>
              </div>
            </div>
          </div>

          {/* Date Range Indicator */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-6 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary mr-2">date_range</span>
            <span className="text-text-secondary text-sm">
              {viewMode === 'year' && `${year}年 全年数据`}
              {viewMode === 'month' && `${year}年 ${month}月 共${getDaysInMonth(year, month)}天`}
              {viewMode === 'day' && `${year}年 ${month}月 ${day}日`}
            </span>
          </div>

          <div className="flex items-center justify-end -mt-4 mb-4">
            {/* Placeholder to balance the layout */}
          </div>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}日</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-text-muted text-sm">
                {viewMode === 'year' ? '本年支出' : viewMode === 'month' ? '本月支出' : '今日支出'}
              </p>
              <p className="text-2xl font-bold text-error mt-1">¥{totalExpense.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-text-muted text-sm">
                {viewMode === 'year' ? '本年收入' : viewMode === 'month' ? '本月收入' : '今日收入'}
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">¥{totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-text-muted text-sm">
                {viewMode === 'year' ? '本年结余' : viewMode === 'month' ? '本月结余' : '今日结余'}
              </p>
              <p className={`text-2xl font-bold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-secondary' : 'text-error'}`}>
                ¥{(totalIncome - totalExpense).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                {viewMode === 'year' ? '年度支出分类' : viewMode === 'month' ? '支出分类占比' : '今日支出分类'}
              </h3>
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

            {/* Top Ranking */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                {viewMode === 'year' ? '年度支出 Top 5' : viewMode === 'month' ? '支出 Top 3' : '支出分类'}
              </h3>
              <div className="space-y-4">
                {expenseData.slice(0, viewMode === 'year' ? 5 : 3).map((item, index) => (
                  <div key={item.category_id || index} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}>
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (item.category_color || '#d0d8e4') + '20' }}>
                      <span className="material-symbols-outlined" style={{ color: item.category_color }}>{item.category_icon || 'receipt'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{item.category_name || `${item.month}月`}</p>
                      <p className="text-xs text-text-muted">{item.record_count || 0}笔</p>
                    </div>
                    <p className="text-lg font-bold text-error">¥{parseFloat(item.total_amount || 0).toFixed(2)}</p>
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

            {/* Trend Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                {viewMode === 'year' ? '月度趋势' : viewMode === 'month' ? '日度趋势' : '趋势'}
              </h3>
              {trendData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
                  <p className="mt-2">暂无趋势数据</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
