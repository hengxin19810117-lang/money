import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/admin';
import Layout from '../components/Layout';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetail();
  }, [id]);

  const loadUserDetail = async () => {
    try {
      const res = await adminAPI.getUserById(id);
      if (res.success) {
        setUser(res.data);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('获取用户详情失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!user) return;
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    if (!confirm(`确定要${newStatus === 'active' ? '启用' : '禁用'}该用户吗？`)) return;

    try {
      const res = await adminAPI.updateUserStatus(id, newStatus);
      if (res.success) {
        setUser({ ...user, status: newStatus });
      }
    } catch (err) {
      console.error('更新状态失败', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <span className="material-symbols-outlined text-6xl text-pink-400 animate-spin">progress_activity</span>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20">
          <span className="text-6xl">😢</span>
          <p className="text-white/60 mt-4">用户不存在</p>
          <button onClick={() => navigate('/users')} className="mt-4 px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
            返回用户列表
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <button onClick={() => navigate('/users')} className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-all">
        <span className="material-symbols-outlined">arrow_back</span>
        返回用户列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="glass-effect rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-white text-4xl">person</span>
            </div>
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <p className="text-white/50 text-sm mt-1">ID: {user.id}</p>
            <span className={`inline-block mt-3 px-4 py-1 rounded-full text-sm ${user.status === 'active' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'}`}>
              {user.status === 'active' ? '正常' : '已禁用'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/50">注册时间</span>
              <span className="text-white">{user.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/50">最后登录</span>
              <span className="text-white">{user.last_login_at ? new Date(user.last_login_at).toLocaleString('zh-CN') : '从未登录'}</span>
            </div>
          </div>

          <button onClick={handleStatusChange} className={`mt-6 w-full py-3 rounded-xl font-medium transition-all ${user.status === 'active' ? 'bg-red-400/20 text-red-400 hover:bg-red-400/30' : 'bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30'}`}>
            {user.status === 'active' ? '禁用该用户' : '启用该用户'}
          </button>
        </div>

        {/* User Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">💰 记账统计</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-400/10 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm">总支出</p>
                <p className="text-2xl font-bold text-pink-400 mt-1">¥{stats?.total_expense?.toFixed(2) || '0.00'}</p>
                <p className="text-white/40 text-xs mt-1">{stats?.expense_count || 0} 笔记录</p>
              </div>
              <div className="bg-emerald-400/10 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm">总收入</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">¥{stats?.total_income?.toFixed(2) || '0.00'}</p>
                <p className="text-white/40 text-xs mt-1">{stats?.income_count || 0} 笔记录</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">📊 财务摘要</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-white/60">总记录数</span>
                <span className="text-white font-medium">{(stats?.expense_count || 0) + (stats?.income_count || 0)} 笔</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/60">结余</span>
                <span className={`font-bold ${(stats?.total_income || 0) - (stats?.total_expense || 0) >= 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                  ¥{((stats?.total_income || 0) - (stats?.total_expense || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
