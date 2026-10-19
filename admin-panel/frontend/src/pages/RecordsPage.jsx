import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import Layout from '../components/Layout';

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: '', type: '', categoryId: '', startDate: '', endDate: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getRecords({ page, pageSize: 20, ...filters });
      if (res.success) {
        setRecords(res.data.records);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('获取记录列表失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadRecords(1);
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">记账记录</h1>
          <p className="text-white/60 mt-1">查看所有用户的记账记录</p>
        </div>
        <div className="text-white/40 text-sm">共 {pagination.total || 0} 条记录</div>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-2xl p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="w-32">
            <label className="text-xs text-white/60 block mb-2">类型</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full h-10 px-4 bg-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="" className="bg-gray-800">全部</option>
              <option value="expense" className="bg-gray-800">支出</option>
              <option value="income" className="bg-gray-800">收入</option>
            </select>
          </div>
          <div className="w-36">
            <label className="text-xs text-white/60 block mb-2">开始日期</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full h-10 px-4 bg-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <div className="w-36">
            <label className="text-xs text-white/60 block mb-2">结束日期</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full h-10 px-4 bg-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <button type="submit" className="h-10 px-6 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium hover:opacity-90 transition-all">
            搜索
          </button>
          <button type="button" onClick={() => { setFilters({ userId: '', type: '', categoryId: '', startDate: '', endDate: '' }); loadRecords(1); }} className="h-10 px-6 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all">
            重置
          </button>
        </form>
      </div>

      {/* Records Table */}
      <div className="glass-effect rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-pink-400 animate-spin">progress_activity</span>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            <span className="text-5xl">📋</span>
            <p className="mt-4">暂无记录数据</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">用户</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">日期</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">分类</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">类型</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">金额</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">备注</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="px-6 py-4">
                    <span className="text-white/70 text-sm">{record.user_username || '未知用户'}</span>
                  </td>
                  <td className="px-6 py-4 text-white/70 text-sm">{record.record_date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span>{record.category_icon || '📝'}</span>
                      <span className="text-white text-sm">{record.category_name || '未知分类'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.type === 'expense' ? 'bg-pink-400/20 text-pink-400' : 'bg-emerald-400/20 text-emerald-400'}`}>
                      {record.type === 'expense' ? '支出' : '收入'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${record.type === 'expense' ? 'text-pink-400' : 'text-emerald-400'}`}>
                      {record.type === 'expense' ? '-' : '+'}¥{parseFloat(record.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/50 text-sm">{record.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 flex items-center justify-center gap-4 border-t border-white/10">
            <button onClick={() => loadRecords(pagination.page - 1)} disabled={pagination.page <= 1} className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-50 transition-all">
              上一页
            </button>
            <span className="text-white/60">{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => loadRecords(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-50 transition-all">
              下一页
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
