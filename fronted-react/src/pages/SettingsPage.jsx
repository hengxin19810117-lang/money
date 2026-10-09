import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI } from '../api/auth';

export default function SettingsPage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await updateProfile({ nickname, avatar });
      if (res.success) {
        setMessage('保存成功');
      } else {
        setMessage(res.message || '保存失败');
      }
    } catch (err) {
      setMessage('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await recordAPI.export({});
      if (res.success) {
        const data = res.data;
        let content, filename, type;

        if (format === 'json') {
          content = JSON.stringify(data, null, 2);
          filename = `财务记录_${new Date().toISOString().split('T')[0]}.json`;
          type = 'application/json';
        } else if (format === 'csv') {
          const headers = ['日期', '类型', '分类', '金额', '备注', '商户', '支付渠道'];
          const rows = data.map(r => [
            r.record_date,
            r.type === 'expense' ? '支出' : '收入',
            r.category_name || '',
            r.amount,
            r.note || '',
            r.merchant || '',
            r.payment_channel || ''
          ]);
          content = [headers, ...rows].map(row => row.join(',')).join('\n');
          filename = `财务记录_${new Date().toISOString().split('T')[0]}.csv`;
          type = 'text/csv';
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('导出失败', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface-container-low transition-all" href="/analytics">
            <span className="material-symbols-outlined">pie_chart</span>
            <span className="font-medium">统计报表</span>
          </a>
          <a className="nav-link active flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-surface-container-low text-primary" href="/settings">
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
          <h2 className="text-2xl font-bold text-text-primary mb-6">个人设置</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">基本信息</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-on-primary-container">person</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-on-primary-container">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{user?.username}</p>
                  <p className="text-xs text-text-muted">点击相机图标更换头像</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-2">昵称</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-card-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-border-focus text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-2">用户名</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="w-full h-10 px-3 bg-surface-card-subtle rounded-lg text-text-muted text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {message && (
                <div className="mt-4 text-sm text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {message}
                </div>
              )}

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="mt-6 w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-on-primary-container transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">save</span>
                )}
                保存修改
              </button>
            </div>

            {/* Export Data */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">数据导出</h3>
              <p className="text-sm text-text-secondary mb-6">将您的记账数据导出为不同格式，方便备份和分析</p>

              <div className="space-y-3">
                <button
                  onClick={() => handleExport('json')}
                  className="w-full h-12 rounded-xl bg-surface-card-subtle text-text-primary font-medium flex items-center justify-between px-4 hover:bg-border-subtle transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">code</span>
                    <span>导出为 JSON</span>
                  </div>
                  <span className="material-symbols-outlined text-text-muted">download</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full h-12 rounded-xl bg-surface-card-subtle text-text-primary font-medium flex items-center justify-between px-4 hover:bg-border-subtle transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">grid_on</span>
                    <span>导出为 CSV</span>
                  </div>
                  <span className="material-symbols-outlined text-text-muted">download</span>
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">账号信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border-subtle">
                  <span className="text-text-secondary">注册时间</span>
                  <span className="text-text-primary">{user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-subtle">
                  <span className="text-text-secondary">最后登录</span>
                  <span className="text-text-primary">{user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString('zh-CN') : '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-text-secondary">账号状态</span>
                  <span className="text-secondary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
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
