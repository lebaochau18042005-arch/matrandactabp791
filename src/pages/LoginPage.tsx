import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// ─── Floating orb config ───────────────────────────────────────────────────────
const ORBS = [
  { size: 420, top: '-10%',  left: '-8%',   color: 'rgba(20,184,166,0.12)',  delay: '0s',   dur: '8s'  },
  { size: 300, top: '60%',   left: '-5%',   color: 'rgba(99,102,241,0.14)',  delay: '-3s',  dur: '10s' },
  { size: 260, top: '20%',   right: '-6%',  color: 'rgba(168,85,247,0.10)',  delay: '-2s',  dur: '9s'  },
  { size: 180, top: '70%',   right: '5%',   color: 'rgba(20,184,166,0.09)',  delay: '-5s',  dur: '7s'  },
  { size: 140, top: '45%',   left: '28%',   color: 'rgba(251,191,36,0.06)',  delay: '-1s',  dur: '11s' },
  { size: 100, top: '10%',   left: '40%',   color: 'rgba(99,102,241,0.08)',  delay: '-4s',  dur: '6s'  },
  { size: 200, top: '80%',   left: '50%',   color: 'rgba(20,184,166,0.07)',  delay: '-6s',  dur: '12s' },
  { size: 120, top: '35%',   right: '20%',  color: 'rgba(239,68,68,0.05)',   delay: '-2s',  dur: '8s'  },
];

// ─── Component ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { user, loginAsGuest, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('student');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('gemini_model') || 'gemini-3.0-pro');

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('gemini_api_key', val.trim());
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedModel(val);
    localStorage.setItem('gemini_model', val);
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate(user.role === 'guest' ? '/simulations' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const cleanEmail = email.trim();
    
    // DEMO BYPASS
    if (cleanEmail === 'giaovien@geohub.vn' || cleanEmail === 'hocsinh@geohub.vn') {
      loginAsDemo(cleanEmail === 'giaovien@geohub.vn' ? 'teacher' : 'student');
      navigate('/dashboard', { replace: true });
      return;
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            }
          }
        });
        if (signUpError) throw signUpError;
        setError('Đăng ký thành công! Hãy kiểm tra email để xác thực.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInError) throw signInError;
        // User state will automatically update via onAuthStateChange in AuthContext
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập Google');
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/simulations', { replace: true });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes floatY {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-22px) scale(1.02); }
        }
        @keyframes floatX {
          0%, 100% { transform: translateX(0px); }
          50%       { transform: translateX(15px); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
        @keyframes spinGlobe {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.08); }
          100% { transform: rotate(360deg) scale(1); }
        }

        .geohub-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 12px 16px;
          color: #f1f5f9;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .geohub-input::placeholder { color: rgba(255,255,255,0.3); }
        .geohub-input:focus {
          border-color: rgba(20,184,166,0.6);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(20,184,166,0.12);
        }

        .demo-btn {
          transition: all 0.22s cubic-bezier(0.16,1,0.3,1) !important;
          cursor: pointer;
        }
        .demo-btn:hover {
          transform: translateY(-2px);
        }
        .demo-btn:active {
          transform: translateY(0px) scale(0.98);
        }

        .login-btn {
          transition: all 0.2s ease !important;
        }
        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(20,184,166,0.4) !important;
        }
        .login-btn:active {
          transform: translateY(0px) scale(0.99);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020617 0%, #0d0d2b 50%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* ── Floating orbs background ── */}
        {ORBS.map((orb, i) => (
          <div key={i} style={{
            position: 'absolute',
            width:  `${orb.size}px`,
            height: `${orb.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 40%, ${orb.color}, transparent 70%)`,
            filter: 'blur(40px)',
            top:   orb.top   ?? 'auto',
            left:  orb.left  ?? 'auto',
            right: orb.right ?? 'auto',
            animation: `floatY ${orb.dur} ease-in-out ${orb.delay} infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* ── Grid overlay ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(20,184,166,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20,184,166,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        {/* ── Left decorative panel (desktop only) ── */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '45%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}
          className="geohub-left-panel"
        >
          {/* Giant globe */}
          <div style={{
            width: '260px', height: '260px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(99,102,241,0.2))',
            border: '1px solid rgba(20,184,166,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 80px rgba(20,184,166,0.15), 0 0 160px rgba(99,102,241,0.1)',
            position: 'relative',
            animation: 'floatY 6s ease-in-out infinite',
          }}>
            {/* Orbit rings */}
            {[130, 160, 195].map((r, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: `${r * 2}px`, height: `${r * 2}px`,
                borderRadius: '50%',
                border: `1px solid rgba(20,184,166,${0.15 - i * 0.04})`,
                animation: `rotateSlow ${10 + i * 4}s linear infinite${i % 2 === 1 ? ' reverse' : ''}`,
              }} />
            ))}
            {/* Globe emoji */}
            <div style={{ fontSize: '100px', animation: 'spinGlobe 20s linear infinite', zIndex: 1 }}>
              🌍
            </div>

            {/* Floating stat cards */}
            {[
              { top: '-16%', right: '-12%', label: '16+ Mô Phỏng', sub: 'Địa lí 3D', color: '#14b8a6' },
              { bottom: '-12%', left: '-8%', label: 'AI Assistant', sub: 'Hỗ trợ học tập',  color: '#6366f1' },
            ].map((c, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: c.top ?? 'auto', bottom: c.bottom ?? 'auto',
                left: c.left ?? 'auto', right: c.right ?? 'auto',
                background: 'rgba(15,23,42,0.85)',
                border: `1px solid ${c.color}55`,
                borderRadius: '14px', padding: '10px 16px',
                backdropFilter: 'blur(12px)',
                boxShadow: `0 8px 30px rgba(0,0,0,0.4), 0 0 20px ${c.color}22`,
                whiteSpace: 'nowrap', zIndex: 2,
                animation: `floatY ${6 + i * 2}s ease-in-out ${-i * 2}s infinite`,
              }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{c.label}</div>
                <div style={{ color: c.color, fontSize: '11px', fontWeight: 500, marginTop: '2px' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* tagline */}
          <div style={{ marginTop: '36px', textAlign: 'center' }}>
            <div style={{
              fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px',
              background: 'linear-gradient(135deg, #5eead4, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Học Địa Lí Sống Động
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '8px', fontWeight: 400 }}>
              Khám phá hành tinh qua mô phỏng tương tác
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            LOGIN CARD
        ══════════════════════════════════════════════════════════════════════ */}
        <div style={{
          position: 'relative', zIndex: 10,
          marginLeft: 'auto', marginRight: 'auto',
          // On desktop, shift to the right half
        }}
          className="geohub-login-card-wrap"
        >
          <div style={{
            width: '420px', maxWidth: 'calc(100vw - 32px)',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '28px',
            padding: '36px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}>

            {/* ── Logo ── */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '64px', height: '64px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
                fontSize: '32px', marginBottom: '14px',
                boxShadow: '0 8px 30px rgba(20,184,166,0.4)',
              }}>
                🌍
              </div>
              <div style={{
                fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.6px',
                background: 'linear-gradient(135deg, #5eead4 30%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                GeoHub LMS
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12.5px', marginTop: '5px', fontWeight: 500 }}>
                Phòng thí nghiệm Địa lí số
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
              {isSignUp && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.3px' }}>
                      HỌ VÀ TÊN
                    </label>
                    <input
                      type="text"
                      required
                      className="geohub-input"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.3px' }}>
                      VAI TRÒ
                    </label>
                    <select
                      className="geohub-input"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      style={{ padding: '10px', fontSize: '13px', appearance: 'none', background: 'rgba(255,255,255,0.06) url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") no-repeat right 12px center', backgroundSize: '10px' }}
                    >
                      <option value="student">Học sinh</option>
                      <option value="teacher">Giáo viên</option>
                    </select>
                  </div>
                </>
              )}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.3px' }}>
                  EMAIL
                </label>
                <input
                  id="geohub-login-email"
                  type="email"
                  required
                  className="geohub-input"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.3px' }}>
                  MẬT KHẨU
                </label>
                <input
                  id="geohub-login-password"
                  type="password"
                  required
                  className="geohub-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
              </div>

              {/* ── AI Configuration (Optional) ── */}
              <div style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '12px', fontWeight: 600, marginBottom: '10px', letterSpacing: '0.3px' }}>
                  <span>🤖</span> CẤU HÌNH GOOGLE GEMINI (Tuỳ chọn)
                </label>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginBottom: '4px' }}>API KEY</label>
                  <input
                    type="password"
                    className="geohub-input"
                    placeholder="AIzaSy... hoặc AQ..."
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    style={{ padding: '10px', fontSize: '13px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginBottom: '4px' }}>MODEL</label>
                  <select
                    className="geohub-input"
                    value={selectedModel}
                    onChange={handleModelChange}
                    style={{ padding: '10px', fontSize: '13px', appearance: 'none', background: 'rgba(255,255,255,0.05) url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") no-repeat right 12px center', backgroundSize: '10px' }}
                  >
                    <option value="gemini-3.0-pro">Gemini 3.0 Pro (Mặc định)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  </select>
                </div>
              </div>

              {/* Error/Success msg */}
              {error && (
                <div style={{
                  background: error.includes('thành công') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${error.includes('thành công') ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.28)'}`,
                  borderRadius: '10px', padding: '10px 14px',
                  color: error.includes('thành công') ? '#34d399' : '#f87171', fontSize: '12.5px',
                  marginBottom: '14px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ fontSize: '16px' }}>{error.includes('thành công') ? '✅' : '⚠️'}</span>
                  {error}
                </div>
              )}

              <button
                id="geohub-login-submit"
                type="submit"
                disabled={loading}
                className="login-btn"
                style={{
                  width: '100%', padding: '13px',
                  background: loading
                    ? 'rgba(20,184,166,0.4)'
                    : 'linear-gradient(135deg, #14b8a6, #0f766e)',
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontWeight: 700, fontSize: '14px',
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 20px rgba(20,184,166,0.3)',
                  letterSpacing: '0.3px',
                  fontFamily: "'Inter', sans-serif",
                  marginBottom: '10px',
                }}
              >
                {loading ? '🔄 Đang xử lý...' : (isSignUp ? '✨ Đăng Ký' : '🚀 Đăng Nhập')}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  style={{
                    background: 'none', border: 'none', color: '#5eead4', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
                </button>
              </div>
            </form>

            {/* ── Divider ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                — hoặc —
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>
            {/* ── OAuth and Guest ── */}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginBottom: '24px' }}>
              <button
                type="button"
                className="demo-btn"
                onClick={handleGoogleLogin}
                style={{
                  width: '100%', padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  color: '#fff', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: 18, height: 18 }} />
                Đăng nhập với Google
              </button>
              <button
                type="button"
                className="demo-btn"
                onClick={handleGuestLogin}
                style={{
                  width: '100%', padding: '12px',
                  background: 'rgba(100,116,139,0.15)',
                  border: '1px solid rgba(100,116,139,0.3)', borderRadius: '12px',
                  color: '#94a3b8', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                👀 Trải nghiệm bằng quyền Khách
              </button>
            </div>

            {/* ── Footer ── */}
            <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '11px', lineHeight: '1.5' }}>
                Demo | <span style={{ color: 'rgba(20,184,166,0.6)', fontWeight: 600 }}>GeoSim AI 3D</span>
                {' '}— Phòng thí nghiệm Địa lí số
              </p>
            </div>
          </div>
        </div>

        {/* ── Responsive layout shifts ── */}
        <style>{`
          .geohub-login-card-wrap {
            margin-left: auto;
            margin-right: auto;
          }

          @media (min-width: 900px) {
            .geohub-login-card-wrap {
              margin-left: auto;
              margin-right: 8%;
            }
          }

          @media (max-width: 899px) {
            .geohub-left-panel {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
