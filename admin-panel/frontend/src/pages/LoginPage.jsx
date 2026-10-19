import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/admin';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminAPI.login({ username, password });
      if (res.success) {
        localStorage.setItem('admin_token', res.data.token);
        localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
        navigate('/dashboard');
      } else {
        setError(res.message || '登录失败');
      }
    } catch (err) {
      setError(err.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-effect rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center mx-auto mb-4" style={{ boxShadow: '0 8px 32px rgba(255, 154, 158, 0.5)' }}>
            <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="text-2xl font-bold text-gradient">后台管理系统</h1>
          <p className="text-white/60 mt-2">财务小管家 - 运营管理后台</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-white/70 block mb-2">用户名</label>
            <div className="relative flex items-center rounded-xl glass-effect focus-within:ring-2 focus-within:ring-pink-400">
              <div className="pl-4 pr-3 text-white/50">
                <span className="material-symbols-outlined">person</span>
              </div>
              <input
                className="w-full h-12 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                placeholder="请输入管理员用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-white/70 block mb-2">密码</label>
            <div className="relative flex items-center rounded-xl glass-effect focus-within:ring-2 focus-within:ring-pink-400">
              <div className="pl-4 pr-3 text-white/50">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <input
                className="w-full h-12 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-pink-400 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #ff9a9e, #ff6b9d, #a18cd1)' }}
          >
            {loading ? (
              <>
                <span>验证中...</span>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">login</span>
                <span>登录</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          默认账号: admin / admin123
        </p>
      </div>
    </div>
  );
}
