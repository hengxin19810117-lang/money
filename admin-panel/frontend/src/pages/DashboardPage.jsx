import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/admin';
import Layout from '../components/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.getDashboard();
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('获取数据失败', err);
    } finally {
      setLoading(false);
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

  // 合并趋势数据，填充缺失日期
  const mergeTrendData = (dataArray, type) => {
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const item = dataArray.find(d => d.date === dateStr);
      result.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        [type]: item ? item.count : 0
      });
    }
    return result;
  };

  const userTrendData = data ? mergeTrendData(data.userTrend || [], '用户') : [];
  const recordTrendData = data ? mergeTrendData(data.recordTrend || [], '记录') : [];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">仪表盘</h1>
        <p className="text-white/60 mt-1">系统数据概览</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">总用户数</p>
              <p className="text-3xl font-bold text-white mt-1">{data?.totalUsers || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">people</span>
            </div>
          </div>
          <button onClick={() => navigate('/users')} className="text-pink-400 text-sm mt-4 hover:underline">查看详情 →</button>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">总记录数</p>
              <p className="text-3xl font-bold text-white mt-1">{data?.totalRecords || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">receipt_long</span>
            </div>
          </div>
          <button onClick={() => navigate('/records')} className="text-pink-400 text-sm mt-4 hover:underline">查看详情 →</button>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">本月新增用户</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{data?.monthlyNewUsers?.[0]?.count || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">person_add</span>
            </div>
          </div>
          <p className="text-white/40 text-xs mt-4">较上月</p>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">本月记账数</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{data?.monthlyRecords?.[0]?.count || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">edit_note</span>
            </div>
          </div>
          <p className="text-white/40 text-xs mt-4">本月</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">📈 近7日用户增长趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30,30,50,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="用户" stroke="#ff9a9e" strokeWidth={2} dot={{ fill: '#ff9a9e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">📊 近7日记账趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recordTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30,30,50,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="记录" stroke="#a18cd1" strokeWidth={2} dot={{ fill: '#a18cd1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
