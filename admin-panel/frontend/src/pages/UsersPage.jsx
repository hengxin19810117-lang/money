import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/admin';
import Layout from '../components/Layout';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ username: '', startDate: '', endDate: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page, pageSize: 20, ...filters });
      if (res.success) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('获取用户列表失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(1);
  };

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    if (!confirm(`确定要${newStatus === 'active' ? '启用' : '禁用'}该用户吗？`)) return;

    try {
      const res = await adminAPI.updateUserStatus(userId, newStatus);
      if (res.success) loadUsers(pagination.page);
    } catch (err) {
      console.error('更新状态失败', err);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">用户管理</h1>
          <p className="text-white/60 mt-1">管理所有注册用户</p>
        </div>
        <div className="text-white/40 text-sm">共 {pagination.total || 0} 位用户</div>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-2xl p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-white/60 block mb-2">用户名搜索</label>
            <input
              type="text"
              placeholder="输入用户名..."
              value={filters.username}
              onChange={(e) => setFilters({ ...filters, username: e.target.value })}
              className="w-full h-10 px-4 bg-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <div className="w-40">
            <label className="text-xs text-white/60 block mb-2">注册开始日期</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full h-10 px-4 bg-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <div className="w-40">
            <label className="text-xs text-white/60 block mb-2">注册结束日期</label>
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
          <button type="button" onClick={() => { setFilters({ username: '', startDate: '', endDate: '' }); loadUsers(1); }} className="h-10 px-6 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all">
            重置
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="glass-effect rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-pink-400 animate-spin">progress_activity</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            <span className="text-5xl">👤</span>
            <p className="mt-4">暂无用户数据</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">用户</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">注册时间</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">最后登录</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">状态</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">person</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-white/40 text-xs">ID: {user.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70 text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}</td>
                  <td className="px-6 py-4 text-white/70 text-sm">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('zh-CN') : '从未登录'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'}`}>
                      {user.status === 'active' ? '正常' : '已禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/users/${user.id}`)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-all">
                        详情
                      </button>
                      <button onClick={() => handleStatusChange(user.id, user.status)} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${user.status === 'active' ? 'bg-red-400/20 text-red-400 hover:bg-red-400/30' : 'bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30'}`}>
                        {user.status === 'active' ? '禁用' : '启用'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 flex items-center justify-center gap-4 border-t border-white/10">
            <button onClick={() => loadUsers(pagination.page - 1)} disabled={pagination.page <= 1} className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-50 transition-all">
              上一页
            </button>
            <span className="text-white/60">{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => loadUsers(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-50 transition-all">
              下一页
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
