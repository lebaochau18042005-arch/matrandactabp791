// ─── AppLayout – Main authenticated layout wrapper ─────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useAppContext, xpToLevel, levelName } from '../contexts/AppContext';
import {
  Home, BookOpen, Play, Brain, Map, Users, BarChart3, Settings,
  Globe, Bell, Menu, X, ChevronRight, Star, Zap, LogOut, Award,
  Library, Layers, Tv2, MessageSquare,
} from 'lucide-react';
import LevelUpModal from '../components/LevelUpModal';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  group?: string;
  items: NavItem[];
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

// ─── Role labels / badge colors ────────────────────────────────────────────────
const ROLE_LABELS: Record<UserRole, string> = {
  admin:   'Quản Trị Viên',
  teacher: 'Giáo Viên',
  student: 'Học Sinh',
  guest:   'Khách',
};

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  admin:   'bg-red-500',
  teacher: 'bg-blue-500',
  student: 'bg-emerald-500',
  guest:   'bg-slate-500',
};

const ROLE_BADGE_STYLES: Record<UserRole, React.CSSProperties> = {
  admin:   { background: '#ef4444' },
  teacher: { background: '#3b82f6' },
  student: { background: '#10b981' },
  guest:   { background: '#64748b' },
};

// ─── Nav definitions by role ────────────────────────────────────────────────────
function getNavGroups(role: UserRole): NavGroup[] {
  switch (role) {
    case 'student':
      return [{
        items: [
          { label: 'Trang Chủ',           path: '/',              icon: <Home      size={18} /> },
          { label: 'Nhiệm Vụ Của Tôi',    path: '/tasks',         icon: <BookOpen  size={18} /> },
          { label: 'Thư Viện Mô Phỏng',   path: '/simulations',   icon: <Library   size={18} /> },
          { label: 'Trợ Lí AI',           path: '/ai-assistant',  icon: <Brain     size={18} /> },
          { label: 'Phòng Lab Bản Đồ',    path: '/map-lab',       icon: <Map       size={18} /> },
          { label: 'Cộng Đồng',           path: '/community',     icon: <Users     size={18} /> },
          { label: 'Cài Đặt',             path: '/settings',      icon: <Settings  size={18} /> },
        ],
      }];

    case 'teacher':
      return [
        {
          group: 'CHÍNH',
          items: [
            { label: 'Trang Chủ',        path: '/',              icon: <Home      size={18} /> },
            { label: 'Bảng Lớp',         path: '/teacher',       icon: <Layers    size={18} /> },
          ],
        },
        {
          group: 'HỌC LIỆU',
          items: [
            { label: 'Thư Viện Mô Phỏng', path: '/simulations',   icon: <Library   size={18} /> },
            { label: 'Soạn Bài Giảng',    path: '/lesson-builder', icon: <BookOpen  size={18} /> },
            { label: 'Trợ Lí AI',          path: '/ai-assistant',  icon: <Brain     size={18} /> },
            { label: 'Quiz Trực Tiếp',     path: '/quiz-live',     icon: <Tv2       size={18} /> },
          ],
        },
        {
          group: 'QUẢN LÍ',
          items: [
            { label: 'Báo Cáo',           path: '/reports',       icon: <BarChart3    size={18} /> },
            { label: 'Cộng Đồng',         path: '/community',     icon: <MessageSquare size={18} /> },
            { label: 'Cài Đặt',           path: '/settings',      icon: <Settings     size={18} /> },
          ],
        },
      ];

    case 'admin':
      return [{
        items: [
          { label: 'Tổng Quan',           path: '/admin',         icon: <Home      size={18} /> },
          { label: 'Người Dùng',          path: '/admin/users',   icon: <Users     size={18} /> },
          { label: 'Mô Phỏng',           path: '/simulations',   icon: <Globe     size={18} /> },
          { label: 'Báo Cáo',            path: '/reports',       icon: <BarChart3 size={18} /> },
          { label: 'Cài Đặt',            path: '/settings',      icon: <Settings  size={18} /> },
        ],
      }];

    case 'guest':
    default:
      return [{
        items: [
          { label: 'Thư Viện Mô Phỏng',  path: '/simulations',   icon: <Library   size={18} /> },
          { label: 'Cộng Đồng',          path: '/community',     icon: <Users     size={18} /> },
          { label: 'Đăng Nhập',          path: '/login',         icon: <LogOut    size={18} /> },
        ],
      }];
  }
}

// ─── XP level thresholds ────────────────────────────────────────────────────────
function xpForLevel(level: number): number {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500];
  if (level <= 10) return thresholds[level] ?? 7500;
  return 7500 + (level - 10) * 1000;
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function AppLayout({ children, title = 'GeoHub' }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const { xp, level } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const role: UserRole = user?.role ?? 'guest';
  const navGroups = getNavGroups(role);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Derived XP values
  const currentLevelXP = xpForLevel(level - 1);
  const nextLevelXP    = xpForLevel(level);
  const progress       = nextLevelXP > currentLevelXP
    ? Math.min(100, Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100))
    : 100;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ─── Sidebar inner content ─────────────────────────────────────────────────
  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Logo area ── */}
      <div style={{
        padding: '20px 16px 16px',
        background: 'linear-gradient(135deg, rgba(20,184,166,0.18) 0%, rgba(99,102,241,0.18) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '80px', height: '80px',
          background: 'radial-gradient(circle, rgba(20,184,166,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', boxShadow: '0 4px 18px rgba(20,184,166,0.45)',
            flexShrink: 0,
          }}>
            🌍
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px', lineHeight: 1 }}>
              GeoHub
            </div>
            <div style={{ color: 'rgba(94,234,212,0.85)', fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.8px', marginTop: '2px' }}>
              HỆ SINH THÁI ĐỊA LÍ SỐ
            </div>
          </div>
        </Link>
      </div>

      {/* ── User info card ── */}
      {user && (
        <div style={{
          margin: '12px 10px 4px',
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '13px',
              flexShrink: 0, boxShadow: '0 2px 10px rgba(20,184,166,0.35)',
            }}>
              {user.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: '#f1f5f9', fontWeight: 600, fontSize: '13px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user.name}
              </div>
              <span style={{
                display: 'inline-block', marginTop: '3px',
                padding: '1px 8px', borderRadius: '20px', fontSize: '10px',
                fontWeight: 600, color: '#fff', letterSpacing: '0.2px',
                ...ROLE_BADGE_STYLES[role],
              }}>
                {ROLE_LABELS[role]}
              </span>
            </div>
          </div>

          {/* XP bar */}
          {role !== 'guest' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', fontWeight: 500 }}>
                  Lv.{level} — {levelName(level)}
                </span>
                <span style={{ color: '#fbbf24', fontSize: '10px', fontWeight: 700 }}>
                  {xp.toLocaleString()} XP
                </span>
              </div>
              <div style={{
                height: '5px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  borderRadius: '10px',
                  background: 'linear-gradient(90deg, #14b8a6, #6366f1)',
                  transition: 'width 0.6s ease',
                  boxShadow: '0 0 8px rgba(20,184,166,0.5)',
                }} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', marginTop: '4px', textAlign: 'right' }}>
                {nextLevelXP - xp > 0
                  ? `còn ${(nextLevelXP - xp).toLocaleString()} XP → Lv.${level + 1}`
                  : 'Đã đạt cấp tối đa!'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Nav groups ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0', scrollbarWidth: 'none' }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '6px' }}>
            {group.group && (
              <div style={{
                color: 'rgba(255,255,255,0.25)', fontSize: '9.5px', fontWeight: 700,
                letterSpacing: '1.4px', padding: '12px 22px 5px',
                textTransform: 'uppercase',
              }}>
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    margin: '2px 8px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    transition: 'background 0.18s ease, color 0.18s ease',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(20,184,166,0.18), rgba(99,102,241,0.08))'
                      : 'transparent',
                    border: isActive
                      ? '1px solid rgba(20,184,166,0.28)'
                      : '1px solid transparent',
                    color: isActive ? '#5eead4' : 'rgba(255,255,255,0.5)',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.88)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)';
                    }
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px', height: '60%', borderRadius: '0 3px 3px 0',
                      background: 'linear-gradient(180deg, #14b8a6, #6366f1)',
                    }} />
                  )}
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: '13.5px', fontWeight: isActive ? 600 : 500, flex: 1 }}>
                    {item.label}
                  </span>
                  {isActive && (
                    <ChevronRight size={13} style={{ opacity: 0.55, flexShrink: 0 }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Workspace Link ── */}
      <div style={{ padding: '0 8px 4px' }}>
        <a
          href="/workspace"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '10px',
            background: 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.2)',
            color: 'rgba(20,184,166,0.8)', textDecoration: 'none',
            fontSize: '12.5px', fontWeight: 600,
            transition: 'all 0.18s ease',
          }}
        >
          <span style={{ fontSize: '15px' }}>⚡</span>
          GeoHub Workspace
        </a>
      </div>

      {/* ── Logout ── */}
      <div style={{ padding: '4px 8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '9px 12px', borderRadius: '10px',
            background: 'transparent', border: '1px solid transparent',
            color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
            transition: 'all 0.18s ease', fontSize: '13.5px', fontWeight: 500,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
            (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
          }}
        >
          <LogOut size={17} />
          Đăng Xuất
        </button>
      </div>
    </div>
  );

  return (
    <>
      <LevelUpModal currentLevel={level} />
      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeInBg {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dropDown {
          from { transform: translateY(-8px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        nav::-webkit-scrollbar { width: 0; }

        @media (max-width: 768px) {
          .geohub-sidebar-desktop { display: none !important; }
          .geohub-hamburger        { display: flex !important; align-items: center; justify-content: center; }
        }
        @media (min-width: 769px) {
          .geohub-hamburger { display: none !important; }
        }
      `}</style>

      <div style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: '#0f172a',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}>

        {/* ══════════════════════════════════════════════════════════════════
            DESKTOP SIDEBAR (240 px, hidden on ≤ 768 px)
        ══════════════════════════════════════════════════════════════════ */}
        <aside
          className="geohub-sidebar-desktop"
          style={{
            width: '240px', flexShrink: 0, height: '100vh',
            background: '#020617',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column',
            position: 'relative', zIndex: 30,
          }}
        >
          <SidebarContent />
        </aside>

        {/* ══════════════════════════════════════════════════════════════════
            MOBILE SLIDE-OVER DRAWER
        ══════════════════════════════════════════════════════════════════ */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(5px)',
                zIndex: 40,
                animation: 'fadeInBg 0.2s ease',
              }}
            />
            {/* Panel */}
            <div style={{
              position: 'fixed', left: 0, top: 0, bottom: 0,
              width: '240px', background: '#020617',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              zIndex: 50,
              animation: 'slideInLeft 0.25s cubic-bezier(0.16,1,0.3,1)',
            }}>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'absolute', top: '14px', right: '14px',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px', padding: '5px', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.7)', zIndex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={15} />
              </button>
              <SidebarContent />
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MAIN AREA  (header + content)
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

          {/* ── Header ── */}
          <header style={{
            height: '60px', flexShrink: 0,
            background: '#0f172a',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center',
            padding: '0 18px', gap: '10px',
          }}>
            {/* Hamburger (shown on mobile via CSS) */}
            <button
              id="geohub-mobile-menu-btn"
              className="geohub-hamburger"
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '7px', cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)',
                transition: 'all 0.15s ease', display: 'none',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Menu size={18} />
            </button>

            {/* Page title */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <Globe size={15} style={{ color: '#14b8a6', flexShrink: 0 }} />
              <h1 style={{
                color: '#f1f5f9', fontSize: '15px', fontWeight: 700,
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {title}
              </h1>
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

              {/* XP badge */}
              {user && role !== 'guest' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '20px',
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.22)',
                }}>
                  <Star size={12} style={{ color: '#fbbf24' }} />
                  <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700 }}>
                    {xp.toLocaleString()}
                  </span>
                  <span style={{ color: 'rgba(251,191,36,0.55)', fontSize: '10px' }}>XP</span>
                </div>
              )}

              {/* Level badge */}
              {user && role !== 'guest' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(99,102,241,0.12))',
                  border: '1px solid rgba(20,184,166,0.22)',
                }}>
                  <Award size={12} style={{ color: '#5eead4' }} />
                  <span style={{ color: '#5eead4', fontSize: '12px', fontWeight: 700 }}>Lv.{level}</span>
                </div>
              )}

              {/* Notification bell */}
              <div style={{ position: 'relative' }}>
                <button
                  id="geohub-notif-btn"
                  onClick={() => setNotifOpen(v => !v)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '8px', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.65)',
                    transition: 'all 0.15s ease', position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)';
                  }}
                >
                  <Bell size={17} />
                  <span style={{
                    position: 'absolute', top: '5px', right: '5px',
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#14b8a6', border: '1.5px solid #0f172a',
                  }} />
                </button>

                {notifOpen && (
                  <div
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                      width: '290px',
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px', overflow: 'hidden',
                      boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                      animation: 'dropDown 0.18s ease',
                      zIndex: 100,
                    }}
                    onClick={() => setNotifOpen(false)}
                  >
                    <div style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <Bell size={14} style={{ color: '#14b8a6' }} />
                      <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '13px' }}>Thông Báo</span>
                      <span style={{
                        marginLeft: 'auto', background: '#14b8a6',
                        color: '#fff', borderRadius: '10px', padding: '1px 7px',
                        fontSize: '10px', fontWeight: 700,
                      }}>3</span>
                    </div>
                    {[
                      { icon: '🌍', text: 'Mô phỏng mới đã được thêm vào thư viện!', time: '5p' },
                      { icon: '⭐', text: 'Bạn vừa đạt huy hiệu Nhà Khám Phá!',      time: '1h' },
                      { icon: '🎯', text: 'Quiz địa lí tuần này đã sẵn sàng.',        time: '3h' },
                    ].map((n, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '12px 18px',
                        borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '17px', flexShrink: 0 }}>{n.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: '12px', lineHeight: '1.4' }}>{n.text}</div>
                          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '3px' }}>{n.time} trước</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User avatar */}
              {user && (
                <button
                  id="geohub-user-avatar-btn"
                  onClick={handleLogout}
                  title={`${user.name} — Nhấn để đăng xuất`}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
                    border: '2px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontWeight: 700, fontSize: '12px',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(20,184,166,0.3)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(20,184,166,0.5)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(20,184,166,0.3)';
                  }}
                >
                  {user.avatar}
                </button>
              )}
            </div>
          </header>

          {/* ── Content ── */}
          <main style={{
            flex: 1, overflowY: 'auto', background: '#0f172a',
          }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
