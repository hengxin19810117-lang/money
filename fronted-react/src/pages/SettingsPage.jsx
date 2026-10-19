import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI } from '../api/auth';
import * as XLSX from 'xlsx';

export default function SettingsPage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => { setAvatar(event.target.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await updateProfile({ avatar });
      setMessage(res.success ? '✨ 保存成功' : res.message || '保存失败');
    } catch (err) { setMessage('保存失败'); }
    finally { setLoading(false); }
  };

  const handleExport = async (format) => {
    try {
      const res = await recordAPI.export({});
      if (res.success) {
        const data = res.data || [];

        if (format === 'excel') {
          // Excel 导出
          const worksheetData = [
            ['日期', '类型', '分类', '金额', '备注', '商户', '支付渠道'],
            ...data.map(r => [
              r.record_date || '',
              r.type === 'expense' ? '支出' : '收入',
              r.category_name || '',
              parseFloat(r.amount) || 0,
              r.note || '',
              r.merchant || '',
              r.payment_channel || ''
            ])
          ];
          const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, '财务记录');

          // 设置金额列格式
          worksheet['!cols'] = [
            { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 12 },
            { wch: 20 }, { wch: 15 }, { wch: 12 }
          ];

          const filename = `财务记录_${new Date().toISOString().split('T')[0]}.xlsx`;
          XLSX.writeFile(workbook, filename);
        } else if (format === 'json') {
          const content = JSON.stringify(data, null, 2);
          const blob = new Blob([content], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `财务记录_${new Date().toISOString().split('T')[0]}.json`; a.click();
          URL.revokeObjectURL(url);
        } else if (format === 'csv') {
          const headers = ['日期', '类型', '分类', '金额', '备注', '商户', '支付渠道'];
          const rows = data.map(r => [r.record_date, r.type === 'expense' ? '支出' : '收入', r.category_name || '', r.amount, r.note || '', r.merchant || '', r.payment_channel || '']);
          const content = [headers, ...rows].map(row => row.join(',')).join('\n');
          const blob = new Blob([content], { type: 'text/csv;charset=utf-8;\bom=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `财务记录_${new Date().toISOString().split('T')[0]}.csv`; a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (err) { console.error('导出失败', err); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col glass-effect relative">
        <div className="absolute -top-4 -right-4 text-3xl floating-decoration" style={{ animationDelay: '0.4s' }}>🌸</div>

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
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all" href="/analytics">
            <span className="material-symbols-outlined">pie_chart</span>
            <span className="font-medium">统计报表</span>
          </a>
          <a className="nav-link active flex items-center gap-3 px-4 py-3 rounded-2xl transition-all" href="/settings">
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
        <span className="fixed top-20 right-20 text-3xl floating-decoration opacity-50" style={{ animationDelay: '0.8s' }}>💫</span>

        <div className="p-6 lg:p-8 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-6">个人设置 <span className="text-pink-400">⚙️</span></h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">👤 基本信息</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #ff9a9e, #a18cd1)' }}>
                    {avatar ? (
                      <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-white">person</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #ff9a9e, #ff6b9d)' }}>
                    <span className="material-symbols-outlined text-white text-sm">photo_camera</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-white/50">点击相机图标更换头像</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-2">👤 用户名</label>
                  <input type="text" value={user?.username || ''} disabled className="w-full h-11 px-4 bg-white/5 rounded-xl text-white/50 text-sm cursor-not-allowed" />
                </div>
              </div>

              {message && (
                <div className="mt-4 text-sm text-emerald-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {message}
                </div>
              )}

              <button onClick={handleSaveProfile} disabled={loading} className="mt-6 w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #ff9a9e, #ff6b9d)' }}>
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span>💾</span>
                )}
                {loading ? '保存中...' : '保存修改'}
              </button>
            </div>

            {/* Export Data */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">📤 数据导出</h3>
              <p className="text-sm text-white/50 mb-6">将您的记账数据导出为不同格式，方便备份和分析</p>

              <div className="space-y-3">
                <button onClick={() => handleExport('excel')} className="w-full h-14 rounded-2xl text-white font-medium flex items-center justify-between px-5 hover:bg-white/20 transition-all" style={{ background: 'linear-gradient(135deg, #2d8b74, #25a066)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📗</span>
                    <span>导出为 Excel</span>
                  </div>
                  <span className="material-symbols-outlined text-white/70">download</span>
                </button>
                <button onClick={() => handleExport('csv')} className="w-full h-14 rounded-2xl bg-white/10 text-white font-medium flex items-center justify-between px-5 hover:bg-white/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <span>导出为 CSV</span>
                  </div>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button onClick={() => handleExport('json')} className="w-full h-14 rounded-2xl bg-white/10 text-white font-medium flex items-center justify-between px-5 hover:bg-white/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <span>导出为 JSON</span>
                  </div>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">🔐 账号信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-white/60">📅 注册时间</span>
                  <span className="text-white">{user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-white/60">🕐 最后登录</span>
                  <span className="text-white">{user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString('zh-CN') : '-'}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-white/60">✅ 账号状态</span>
                  <span className="text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    正常
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
