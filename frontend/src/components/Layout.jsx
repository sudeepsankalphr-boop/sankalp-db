import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastProvider } from './Toast';
import logo from '../assets/logo.jpeg';

const NAV_ITEMS = [
  {
    to: '/clients',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    to: '/clients',
    label: 'Clients',
    end: false,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4"/><path d="M3 21c0-4 2.7-7 6-7h6c3.3 0 6 3 6 7"/>
      </svg>
    ),
  },
  {
    to: '/selection-tracker',
    label: 'Selection Tracker',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    to: '/local-database',
    label: 'Local Database',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Generate Report',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
  },
];

const ADMIN_ITEMS = [
  {
    to: '/admin/users',
    label: 'Users',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
      </svg>
    ),
  },
  {
    to: '/admin/clients',
    label: 'Settings',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

function SidebarLink({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '10px 14px',
        borderRadius: 10,
        margin: '1px 10px',
        fontSize: 14,
        fontWeight: isActive ? 600 : 400,
        color: isActive ? '#2563eb' : '#6b7280',
        background: isActive ? '#eff6ff' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.14s',
        borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
      })}
    >
      <span style={{ flexShrink: 0, opacity: 0.85 }}>{icon}</span>
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <ToastProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f4f7fb' }}>

        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? 220 : 0,
          flexShrink: 0,
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.2s ease',
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        }}>
          {/* Logo */}
          <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/clients')}>
              <img src={logo} alt="Sankalp" style={{ width: 46, height: 46, objectFit: 'contain', mixBlendMode: 'multiply', flexShrink: 0 }} />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1e3a5f' }}>Sankalp</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7ab648' }}>HR Services</div>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
            {NAV_ITEMS.map((item) => (
              <SidebarLink key={item.label} {...item} />
            ))}
            {user?.role === 'admin' && (
              <>
                <div style={{ margin: '10px 22px 4px', fontSize: 10, fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Admin
                </div>
                {ADMIN_ITEMS.map((item) => (
                  <SidebarLink key={item.label} {...item} />
                ))}
              </>
            )}
          </nav>

          {/* Bottom promo card */}
          <div style={{ margin: '0 12px 14px', background: 'linear-gradient(135deg, #f0fdf4, #eff6ff)', borderRadius: 14, padding: '14px 12px', flexShrink: 0 }}>
            <svg width="80" height="56" viewBox="0 0 80 56" fill="none" style={{ display: 'block', margin: '0 auto 8px' }}>
              <rect x="8" y="8" width="26" height="34" rx="4" fill="#dbeafe"/>
              <circle cx="21" cy="20" r="7" fill="#93c5fd"/>
              <rect x="12" y="31" width="18" height="3" rx="1.5" fill="#bfdbfe"/>
              <rect x="40" y="12" width="26" height="34" rx="4" fill="#dcfce7"/>
              <circle cx="53" cy="24" r="7" fill="#86efac"/>
              <rect x="44" y="35" width="18" height="3" rx="1.5" fill="#bbf7d0"/>
              <circle cx="35" cy="36" r="9" fill="none" stroke="#2563eb" strokeWidth="3"/>
              <line x1="41" y1="43" x2="48" y2="50" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', textAlign: 'center' }}>Streamline your hiring.</div>
            <div style={{ fontSize: 11, color: '#7a9fc0', textAlign: 'center', marginTop: 2 }}>Find the right talent.</div>
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', padding: '8px 14px', fontSize: 10, color: '#d1d5db', flexShrink: 0 }}>
            © 2026 Sankalp HR Services. All rights reserved.
          </div>
        </aside>

        {/* Right panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Top bar */}
          <header style={{
            height: 60, background: '#fff', borderBottom: '1px solid #f0f0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', flexShrink: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#6b7280', display: 'flex', alignItems: 'center' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{user?.name}</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}> ({user?.role})</span>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #7ab648)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {initials}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </header>

          <main style={{ flex: 1, overflowY: 'auto', background: '#f4f7fb' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
