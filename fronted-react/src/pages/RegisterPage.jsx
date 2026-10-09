import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('用户名需为3-20位字母或数字');
      return false;
    }
    if (password.length < 6 || password.length > 20) {
      setError('密码长度需在6-20位之间');
      return false;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await register({ username, password });
      if (res.success) {
        navigate('/login');
      } else {
        setError(res.message || '注册失败');
      }
    } catch (err) {
      setError(err.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthColors = ['bg-error', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

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

            <div className="relative rounded-xl overflow-hidden shadow-sm aspect-[16/9] w-full mt-2">
              <img className="w-full h-full object-cover" alt="财务管理工作台" src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=340&fit=crop" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                <p className="text-white text-sm font-medium leading-snug">掌控每一笔收支，让理财成为每日治愈时光</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card/90 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-cat-income flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-lg">pie_chart</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary">多维直观报表</span>
                  <span className="text-[11px] text-text-muted">收支对比、预算进度、超支预警</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Register Form */}
        <div className="lg:col-span-7 p-8 lg:p-14 flex flex-col justify-between bg-surface-card relative">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight mt-2">创建账号</h1>
            <p className="text-sm text-text-secondary mt-1">开始使用财务小管家，轻松管理每一分钱</p>

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
                    placeholder="3-20位字母或数字"
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
                    placeholder="6-20位密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {password && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded ${i <= strength ? strengthColors[strength - 1] : 'bg-border-subtle'}`} />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary" htmlFor="confirmPassword">确认密码</label>
                <div className="relative flex items-center rounded-xl bg-surface-card shadow-sm focus-within:ring-2 focus-within:ring-border-focus border border-border-subtle">
                  <div className="pl-3.5 pr-2 text-text-muted">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </div>
                  <input
                    className="w-full h-11 bg-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none"
                    id="confirmPassword"
                    type="password"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>注册中...</span>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  </>
                ) : (
                  <>
                    <span>立即注册</span>
                    <span className="material-symbols-outlined text-lg">how_to_reg</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 text-center flex items-center justify-center gap-2 text-sm">
              <span className="text-text-secondary">已有账号？</span>
              <Link className="text-xs font-semibold text-primary hover:text-on-primary-container transition-colors flex items-center gap-0.5" to="/login">
                <span>立即登录</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
