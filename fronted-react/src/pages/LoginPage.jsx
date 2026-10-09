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
      if (res.success) {
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

  const fillDemo = () => {
    setUsername('demo');
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-surface-card rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Brand Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-surface-container-low via-surface-card to-cat-dining/20 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-primary-container/25 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-container to-cat-dining flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-on-primary-container text-2xl">wallet</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-text-primary tracking-tight">财务小管家</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-container text-on-primary-container">PRO</span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">轻量高效记账，3秒记一笔</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card/90 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-cat-income flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-lg">bolt</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary">3秒极速记账</span>
                  <span className="text-[11px] text-text-muted">8大高频日常分类</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card/90 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-cat-transit flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">wifi_off</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary">断网离线可用</span>
                  <span className="text-[11px] text-text-muted">本地存储，联网自动同步</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 flex items-center justify-between text-text-muted text-[11px]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-secondary">verified</span>
              端对端离线保护
            </span>
            <span>•</span>
            <span>SHA-256 加密</span>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="lg:col-span-7 p-8 lg:p-14 flex flex-col justify-between bg-surface-card relative">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight mt-2">欢迎回来</h1>
            <p className="text-sm text-text-secondary mt-1">请输入您的账号密码开启记账工作台</p>

            {/* Demo Credentials */}
            <div className="mt-5 p-3.5 rounded-xl bg-surface-card-subtle flex items-center justify-between text-[12px] shadow-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="material-symbols-outlined text-secondary text-lg">smart_outlet</span>
                <span>体验账号: <strong className="text-text-primary font-semibold">demo</strong> / 密码: <strong className="text-text-primary font-semibold">123456</strong></span>
              </div>
              <button onClick={fillDemo} className="px-2.5 py-1 rounded-lg bg-surface-card hover:bg-secondary-container/40 text-text-primary text-[11px] font-medium transition-all shadow-sm active:scale-95 flex items-center gap-1" type="button">
                <span className="material-symbols-outlined text-sm">bolt</span>
                一键填入
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary" htmlFor="username">用户名</label>
                <div className="relative flex items-center rounded-xl bg-surface-card shadow-sm focus-within:ring-2 focus-within:ring-border-focus border border-border-subtle">
                  <div className="pl-3.5 pr-2 text-text-muted">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </div>
                  <input
                    className="w-full h-11 bg-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none"
                    id="username"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary" htmlFor="password">密码</label>
                <div className="relative flex items-center rounded-xl bg-surface-card shadow-sm focus-within:ring-2 focus-within:ring-border-focus border border-border-subtle">
                  <div className="pl-3.5 pr-2 text-text-muted">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </div>
                  <input
                    className="w-full h-11 bg-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none"
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-error text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-container via-cat-dining to-primary-container text-on-primary-container font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span>验证中...</span>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  </>
                ) : (
                  <>
                    <span>立即登录</span>
                    <span className="material-symbols-outlined text-lg">login</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 text-center flex items-center justify-center gap-2 text-sm">
              <span className="text-text-secondary">还没有财务小管家账号？</span>
              <Link className="text-xs font-semibold text-primary hover:text-on-primary-container transition-colors flex items-center gap-0.5" to="/register">
                <span>立即注册体验</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
