import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#ff9a9e', '#ffc2d5', '#ffb3d1', '#d4bfff', '#a8d8ff', '#98ddca', '#ffd93d', '#6bcb77'];

export default function StatisticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const res = await adminAPI.getStatistics();
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('获取统计数据失败', err);
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

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">统计报表</h1>
        <p className="text-white/60 mt-1">全局业务数据分析</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 支出排名 */}
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">💸 支出分类排名 Top 10</h3>
          <div className="space-y-3">
            {data?.expenseRanking?.slice(0, 10).map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-600'}`}>
                  {index + 1}
                </div>
                <span className="text-2xl">{item.icon || '📝'}</span>
                <div className="flex-1">
                  <p className="text-white font-medium">{item.name || '未知分类'}</p>
                  <p className="text-white/40 text-xs">{item.record_count} 笔记录</p>
                </div>
                <p className="text-pink-400 font-bold">¥{parseFloat(item.total_amount || 0).toFixed(2)}</p>
              </div>
            ))}
            {(!data?.expenseRanking || data.expenseRanking.length === 0) && (
              <p className="text-center text-white/40 py-8">暂无数据</p>
            )}
          </div>
        </div>

        {/* 收入排名 */}
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">💰 收入分类排名 Top 10</h3>
          <div className="space-y-3">
            {data?.incomeRanking?.slice(0, 10).map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-600'}`}>
                  {index + 1}
                </div>
                <span className="text-2xl">{item.icon || '📝'}</span>
                <div className="flex-1">
                  <p className="text-white font-medium">{item.name || '未知分类'}</p>
                  <p className="text-white/40 text-xs">{item.record_count} 笔记录</p>
                </div>
                <p className="text-emerald-400 font-bold">¥{parseFloat(item.total_amount || 0).toFixed(2)}</p>
              </div>
            ))}
            {(!data?.incomeRanking || data.incomeRanking.length === 0) && (
              <p className="text-center text-white/40 py-8">暂无数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 月度新增用户 */}
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">📈 月度新增用户</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyNewUsers || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30,30,50,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                <Bar dataKey="count" name="新增用户" fill="#ff9a9e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 月度记账记录数 */}
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">📊 月度记账记录数</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyRecords || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30,30,50,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                <Bar dataKey="count" name="记录数" fill="#a18cd1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 支出分类占比 */}
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">🥧 支出分类占比</h3>
          {data?.expenseRatio && data.expenseRatio.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.expenseRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total_amount"
                    nameKey="name"
                  >
                    {data.expenseRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `¥${parseFloat(value).toFixed(2)}`} contentStyle={{ backgroundColor: 'rgba(30,30,50,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-white/40 py-16">暂无数据</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {data?.expenseRatio?.map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-white/70">{item.name || '未知'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 收入分类占比 */}
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">🥧 收入分类占比</h3>
          {data?.incomeRatio && data.incomeRatio.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.incomeRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total_amount"
                    nameKey="name"
                  >
                    {data.incomeRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `¥${parseFloat(value).toFixed(2)}`} contentStyle={{ backgroundColor: 'rgba(30,30,50,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-white/40 py-16">暂无数据</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {data?.incomeRatio?.map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-white/70">{item.name || '未知'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
