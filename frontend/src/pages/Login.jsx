import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/clients' : '/clients', { replace: true });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2f7', padding: '24px' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: 960, borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', background: '#fff' }}>

        {/* Left panel */}
        <div style={{ flex: 1, background: 'linear-gradient(145deg, #eef4ff 0%, #dce8f8 100%)', padding: '48px 40px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <img src={logo} alt="Sankalp HR Services" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8 }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.1 }}>Sankalp</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#7ab648', lineHeight: 1.2 }}>HR Services</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e3a5f', margin: '0 0 8px' }}>Recruitment HRMS</h2>
            <p style={{ fontSize: 15, color: '#5a7a9a', margin: 0, lineHeight: 1.6 }}>
              Streamline your hiring.<br />Find the right talent.
            </p>
          </div>

          {/* Illustration */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <svg viewBox="0 0 380 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 340 }}>
              {/* Background shape */}
              <ellipse cx="190" cy="200" rx="170" ry="30" fill="#c8daf0" opacity="0.4" />
              {/* Desk */}
              <rect x="60" y="155" width="260" height="12" rx="4" fill="#b8cfe8" />
              <rect x="80" y="167" width="10" height="30" rx="3" fill="#9ab8d4" />
              <rect x="290" y="167" width="10" height="30" rx="3" fill="#9ab8d4" />
              {/* Monitor */}
              <rect x="155" y="75" width="130" height="85" rx="8" fill="#1e3a5f" />
              <rect x="160" y="80" width="120" height="70" rx="5" fill="#eef4ff" />
              <rect x="205" y="160" width="30" height="8" rx="2" fill="#1e3a5f" />
              <rect x="195" y="167" width="50" height="4" rx="2" fill="#9ab8d4" />
              {/* Screen content */}
              <circle cx="200" cy="105" r="14" fill="#b8cfe8" />
              <circle cx="200" cy="99" r="6" fill="#7a9fc0" />
              <rect x="218" y="92" width="50" height="5" rx="2" fill="#1e3a5f" opacity="0.4" />
              <rect x="218" y="101" width="38" height="4" rx="2" fill="#b8cfe8" />
              <rect x="218" y="109" width="44" height="4" rx="2" fill="#b8cfe8" />
              {/* Stars */}
              <text x="218" y="124" fontSize="10" fill="#f5a623">★★★</text>
              {/* Person left (woman) */}
              <circle cx="108" cy="95" r="16" fill="#f5c8a0" />
              <rect x="88" y="111" width="40" height="50" rx="8" fill="#7ab648" />
              {/* Hair */}
              <path d="M92 95 Q108 75 124 95" fill="#3d2b1f" />
              {/* Laptop */}
              <rect x="80" y="148" width="55" height="8" rx="2" fill="#9ab8d4" />
              <rect x="83" y="138" width="49" height="12" rx="2" fill="#c8daf0" />
              {/* Person right (man) */}
              <circle cx="300" cy="90" r="16" fill="#f5c8a0" />
              <rect x="280" y="106" width="40" height="55" rx="8" fill="#2563eb" />
              {/* Magnifier */}
              <circle cx="265" cy="118" r="16" fill="none" stroke="#1e3a5f" strokeWidth="4" />
              <line x1="276" y1="129" x2="286" y2="140" stroke="#1e3a5f" strokeWidth="4" strokeLinecap="round" />
              {/* Plant */}
              <rect x="48" y="158" width="14" height="18" rx="3" fill="#2563eb" opacity="0.7" />
              <ellipse cx="55" cy="148" rx="10" ry="14" fill="#7ab648" />
              <ellipse cx="45" cy="155" rx="8" ry="10" fill="#5a9e3a" />
              <ellipse cx="65" cy="152" rx="8" ry="10" fill="#5a9e3a" />
            </svg>
          </div>

          {/* Feature icons */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {[
              { icon: '👥', title: 'Manage Candidates', sub: 'Efficiently' },
              { icon: '📊', title: 'Track Progress', sub: 'in Real-time' },
              { icon: '📄', title: 'Generate Reports', sub: 'with Insights' },
            ].map((f) => (
              <div key={f.title} style={{ flex: 1, textAlign: 'center', padding: '12px 6px', background: 'rgba(255,255,255,0.6)', borderRadius: 12 }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{f.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1e3a5f', lineHeight: 1.3 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#7a9fc0' }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 420, flexShrink: 0, padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f', margin: '0 0 6px' }}>Welcome Back!</h1>
          <p style={{ fontSize: 14, color: '#7a9fc0', margin: '0 0 36px' }}>Sign in to your account to continue</p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16 }}>✉</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px 12px 40px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff' }}
                onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
              />
            </div>

            {/* Password */}
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16 }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 44px 12px 40px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff' }}
                onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16, padding: 0 }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>

            {/* Remember me + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                Remember me
              </label>
              <span style={{ fontSize: 13, color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
            </div>

            {/* Sign In button */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20, transition: 'background 0.2s' }}
            >
              🔒 {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 13, color: '#9ca3af' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* Google button */}
          <button
            type="button"
            style={{ width: '100%', padding: '13px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Sign in with Google
          </button>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', margin: 0 }}>
            © 2026 Sankalp HR Services. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
