import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.success) navigate('/dashboard');
      else setError(res.message || '登录失败');
    } catch (err) { setError(err.message || '网络错误'); }
    finally { setLoading(false); }
  };

  const fillDemo = () => { setUsername('demo'); setPassword('123456'); };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Floating decorations */}
      <span className="fixed top-20 left-20 text-4xl floating-decoration opacity-60" style={{ animationDelay: '0s' }}>🌸</span>
      <span className="fixed top-40 right-32 text-3xl floating-decoration opacity-40" style={{ animationDelay: '1s' }}>⭐</span>
      <span className="fixed bottom-32 left-40 text-3xl floating-decoration opacity-50" style={{ animationDelay: '2s' }}>💫</span>
      <span className="fixed bottom-20 right-20 text-4xl floating-decoration opacity-30" style={{ animationDelay: '0.5s' }}>✨</span>

      <div className="w-full max-w-5xl glass-effect rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] relative z-10">
        {/* Left Brand Column */}
        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between relative" style={{ background: 'linear-gradient(180deg, rgba(255,154,158,0.15) 0%, rgba(161,140,209,0.15) 100%)' }}>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-pink-400/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-purple-400/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 8px 32px rgba(255, 154, 158, 0.5)' }}>
                <span className="material-symbols-outlined text-white text-2xl">wallet</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white tracking-tight text-gradient">财务小管家</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-pink-400 to-purple-400 text-white">PRO</span>
                </div>
                <p className="text-xs text-white/60 mt-0.5">轻量高效记账，3秒记一笔 ✨</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl glass-effect">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl">⚡</div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">3秒极速记账</span>
                  <span className="text-[11px] text-white/50">8大高频日常分类</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl glass-effect">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl">🔒</div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">断网离线可用</span>
                  <span className="text-[11px] text-white/50">本地存储，联网自动同步</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 flex items-center justify-between text-white/40 text-[11px]">
            <span className="flex items-center gap-1">🛡️ 端对端离线保护</span>
            <span>•</span>
            <span>SHA-256 加密</span>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="lg:col-span-7 p-8 lg:p-14 flex flex-col justify-between relative" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">欢迎回来 🌟</h1>
            <p className="text-sm text-white/60 mt-2">请输入您的账号密码开启记账工作台</p>

            <div className="mt-6 p-4 rounded-2xl glass-effect flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2 text-white/70">
                <span className="text-xl">🎯</span>
                <span>体验账号: <strong className="text-white font-semibold">demo</strong> / 密码: <strong className="text-white font-semibold">123456</strong></span>
              </div>
              <button onClick={fillDemo} className="px-3 py-1.5 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-1" style={{ background: 'linear-gradient(135deg, #ff9a9e, #ff6b9d)' }} type="button">
                <span>⚡</span> 一键填入
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block mb-2">👤 用户名</label>
                <div className="relative flex items-center rounded-2xl glass-effect focus-within:ring-2 focus-within:ring-pink-400 transition-all">
                  <div className="pl-4 pr-3 text-white/50">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <input className="w-full h-14 bg-transparent text-white text-base placeholder:text-white/30 focus:outline-none" placeholder="请输入用户名" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block mb-2">🔒 密码</label>
                <div className="relative flex items-center rounded-2xl glass-effect focus-within:ring-2 focus-within:ring-pink-400 transition-all">
                  <div className="pl-4 pr-3 text-white/50">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                  <input className="w-full h-14 bg-transparent text-white text-base placeholder:text-white/30 focus:outline-none" type="password" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              {error && (
                <div className="text-pink-400 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{error}</span>
                </div>
              )}

              <button className="w-full h-14 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #ff9a9e, #ff6b9d, #a18cd1)' }} type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span>验证中...</span>
                    <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>立即登录</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 text-center flex items-center justify-center gap-2 text-sm">
              <span className="text-white/60">还没有财务小管家账号？</span>
              <Link className="text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-0.5" to="/register">
                <span>立即注册体验</span>
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
