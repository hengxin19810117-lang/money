import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI } from '../api/auth';

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

  useEffect(() => {
    loadRecords();
  }, [page, year, month, day, viewMode, filters]);

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
        setRecords(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('获取记录失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      const res = await recordAPI.delete(id);
      if (res.success) {
        loadRecords();
      }
    } catch (err) {
      console.error('删除失败', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          <a className="nav-link active flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-surface-container-low text-primary" href="/transactions">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">账单明细</h2>
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
              {viewMode === 'year' && `${year}年 全年账单`}
              {viewMode === 'month' && `${year}年 ${month}月 账单明细`}
              {viewMode === 'day' && `${year}年 ${month}月 ${day}日 账单明细`}
            </span>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex gap-4">
            <select
              value={filters.type}
              onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
              className="px-4 py-2 rounded-lg bg-surface-card-subtle text-text-primary focus:outline-none"
            >
              <option value="">全部类型</option>
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>
          </div>

          {/* Records List */}
          <div className="bg-white rounded-2xl shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-text-muted">
                <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                <p className="mt-2">加载中...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                <span className="material-symbols-outlined text-4xl">receipt_long</span>
                <p className="mt-2">暂无记账记录</p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {records.map((record) => (
                  <div key={record.id} className="p-4 flex items-center gap-4 hover:bg-surface-card-subtle transition-all">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: (record.category_color || '#d0d8e4') + '20' }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: record.category_color }}>{record.category_icon || 'receipt'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{record.category_name || '未知分类'}</p>
                      <p className="text-xs text-text-muted">{record.note || '-'}</p>
                      <p className="text-xs text-text-muted">{record.record_date}</p>
                    </div>
                    <p className={`text-lg font-bold ${record.type === 'expense' ? 'text-error' : 'text-secondary'}`}>
                      {record.type === 'expense' ? '-' : '+'}¥{parseFloat(record.amount).toFixed(2)}
                    </p>
                    <button onClick={() => handleDelete(record.id)} className="p-2 text-text-muted hover:text-error transition-all">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-surface-card-subtle text-text-secondary disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-text-secondary">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-surface-card-subtle text-text-secondary disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
