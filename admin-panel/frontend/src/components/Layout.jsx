import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const menuItems = [
    { path: '/dashboard', label: '仪表盘', icon: 'dashboard' },
    { path: '/users', label: '用户管理', icon: 'people' },
    { path: '/records', label: '记账记录', icon: 'receipt_long' },
    { path: '/statistics', label: '统计报表', icon: 'bar_chart' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col glass-effect relative">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 20px rgba(255, 154, 158, 0.5)' }}>
              <span className="material-symbols-outlined text-white text-xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-gradient">后台管理</h1>
              <p className="text-xs text-white/60">财务小管家</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-gradient-to-r from-pink-400/30 to-purple-400/30 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">person</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">{adminUser.username || 'Admin'}</p>
              <p className="text-xs text-white/50">管理员</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-pink-400 hover:bg-pink-400/10 transition-all">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
