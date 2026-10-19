import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { setError('用户名需为3-20位字母或数字'); return false; }
    if (password.length < 6 || password.length > 20) { setError('密码长度需在6-20位之间'); return false; }
    if (password !== confirmPassword) { setError('两次输入的密码不一致'); return false; }
    if (!agreeTerms) { setError('请先阅读并同意《服务条款》'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await register({ username, password });
      if (res.success) navigate('/login');
      else setError(res.message || '注册失败');
    } catch (err) { setError(err.message || '网络错误'); }
    finally { setLoading(false); }
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
  const strengthColors = ['bg-pink-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-emerald-400'];
  const strengthLabels = ['太弱', '较弱', '中等', '较强', '很强'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Floating decorations */}
      <span className="fixed top-16 right-16 text-4xl floating-decoration opacity-50" style={{ animationDelay: '0.3s' }}>🌸</span>
      <span className="fixed top-48 left-24 text-3xl floating-decoration opacity-40" style={{ animationDelay: '1.5s' }}>✨</span>
      <span className="fixed bottom-24 right-40 text-3xl floating-decoration opacity-60" style={{ animationDelay: '0.8s' }}>⭐</span>
      <span className="fixed bottom-40 left-16 text-4xl floating-decoration opacity-30" style={{ animationDelay: '2s' }}>💫</span>

      <div className="w-full max-w-5xl glass-effect rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] relative z-10">
        {/* Left Brand Column */}
        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between relative" style={{ background: 'linear-gradient(180deg, rgba(161,140,209,0.15) 0%, rgba(255,154,158,0.15) 100%)' }}>
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-purple-400/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-pink-400/20 blur-3xl pointer-events-none"></div>

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

            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/9] w-full mt-2">
              <img className="w-full h-full object-cover" alt="财务管理工作台" src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=340&fit=crop" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,46,0.8) 0%, transparent 100%)' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                <p className="text-white text-sm font-medium leading-snug">掌控每一笔收支，让理财成为每日治愈时光 🌟</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl glass-effect">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl">📊</div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">多维直观报表</span>
                  <span className="text-[11px] text-white/50">收支对比、预算进度、超支预警</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Register Form */}
        <div className="lg:col-span-7 p-8 lg:p-14 flex flex-col justify-between relative" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">创建账号 🌸</h1>
            <p className="text-sm text-white/60 mt-2">开始使用财务小管家，轻松管理每一分钱</p>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block mb-2">👤 用户名</label>
                <div className="relative flex items-center rounded-2xl glass-effect focus-within:ring-2 focus-within:ring-pink-400 transition-all">
                  <div className="pl-4 pr-3 text-white/50">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <input className="w-full h-14 bg-transparent text-white text-base placeholder:text-white/30 focus:outline-none" placeholder="3-20位字母或数字" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block mb-2">🔒 密码</label>
                <div className="relative flex items-center rounded-2xl glass-effect focus-within:ring-2 focus-within:ring-pink-400 transition-all">
                  <div className="pl-4 pr-3 text-white/50">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                  <input className="w-full h-14 bg-transparent text-white text-base placeholder:text-white/30 focus:outline-none" type="password" placeholder="6-20位密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {password && (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength - 1] : 'bg-white/20'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-white/50">{strengthLabels[strength - 1] || ''}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block mb-2">🔐 确认密码</label>
                <div className="relative flex items-center rounded-2xl glass-effect focus-within:ring-2 focus-within:ring-pink-400 transition-all">
                  <div className="pl-4 pr-3 text-white/50">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                  <input className="w-full h-14 bg-transparent text-white text-base placeholder:text-white/30 focus:outline-none" type="password" placeholder="再次输入密码" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" id="agreeTerms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 w-5 h-5 rounded-lg border-white/30 bg-white/10 text-pink-400 focus:ring-pink-400 cursor-pointer" />
                <label htmlFor="agreeTerms" className="text-sm text-white/70 cursor-pointer">
                  我已阅读并完全同意<a href="#" className="text-pink-400 hover:underline" onClick={(e) => { e.preventDefault(); alert('服务条款内容'); }}>《服务条款》</a>
                </label>
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
                    <span>注册中...</span>
                    <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>立即注册</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 text-center flex items-center justify-center gap-2 text-sm">
              <span className="text-white/60">已有账号？</span>
              <Link className="text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-0.5" to="/login">
                <span>立即登录</span>
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
