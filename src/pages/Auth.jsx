import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

export default function Auth() {
  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login, register, isLoggedIn } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  // If already logged in, redirect
  useEffect(() => {
    if (isLoggedIn) navigate(from, { replace: true });
  }, [isLoggedIn, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        await register(name, email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#06060c', fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes float-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-form { animation: float-up 0.6s ease forwards; }
        @keyframes orb-pulse {
          0%,100% { opacity: 0.15; transform: scale(1); }
          50%      { opacity: 0.25; transform: scale(1.05); }
        }
      `}</style>

      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(103,80,165,0.15), rgba(6,6,12,0.8))' }}>
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(103,80,165,0.3), transparent 70%)', animation: 'orb-pulse 6s ease-in-out infinite' }} />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(123,82,112,0.2), transparent 70%)', animation: 'orb-pulse 8s ease-in-out infinite reverse' }} />
          {/* Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(103,80,165,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(103,80,165,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6750a5, #bba2fd)' }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>
            Web<span style={{ color: '#bba2fd' }}>Insight</span>
          </span>
        </div>

        {/* Center quote */}
        <div className="relative z-10">
          <div className="text-6xl mb-6" style={{ color: 'rgba(103,80,165,0.4)', fontWeight: 800, lineHeight: 1 }}>"</div>
          <h2 className="mb-4" style={{ fontWeight: 800, fontSize: '32px', letterSpacing: '-1px', lineHeight: 1.2, color: 'rgba(255,255,255,0.9)' }}>
            Every pixel matters.<br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>We make sure none slip through.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
            AI-powered collaborative design review for modern teams.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {['Click-to-pin feedback', 'AI insights', 'Issue tracking', 'Team collaboration'].map((f) => (
            <span key={f} className="px-3 py-1.5 rounded-full text-xs"
              style={{ background: 'rgba(103,80,165,0.18)', border: '1px solid rgba(103,80,165,0.25)', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="auth-form w-full max-w-md">

          {/* Back to landing */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-10 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Back to home
          </button>

          {/* Tab toggle */}
          <div className="flex rounded-2xl p-1 mb-8"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: mode === m ? 'linear-gradient(135deg, #6750a5, #9b7fd4)' : 'transparent',
                  color: mode === m ? 'white' : 'rgba(255,255,255,0.35)',
                }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 style={{ fontWeight: 800, fontSize: '28px', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
              {mode === 'login'
                ? 'Sign in to continue to your workspace.'
                : 'Start reviewing websites with AI in minutes.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6"
              style={{ background: 'rgba(168,54,75,0.15)', border: '1px solid rgba(168,54,75,0.3)' }}>
              <span className="material-symbols-outlined text-red-400" style={{ fontSize: '16px' }}>error</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#f87171' }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(103,80,165,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            )}

            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(103,80,165,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                  required
                  className="w-full px-4 py-3.5 rounded-xl outline-none transition-all pr-12"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(103,80,165,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all mt-6"
              style={{
                background: loading ? 'rgba(103,80,165,0.4)' : 'linear-gradient(135deg, #6750a5, #9b7fd4)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                boxShadow: loading ? 'none' : '0 0 30px rgba(103,80,165,0.35)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center mt-8" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ color: '#bba2fd', fontWeight: 600 }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}