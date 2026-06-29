import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function NavCard({ icon, title, description, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hover ? '#d1fae5' : '#f3f4f6'}`,
        borderRadius: 18,
        padding: '28px 24px',
        cursor: 'pointer',
        boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.09)' : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.18s',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minHeight: 160,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%',
          background: '#f0fdf4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 22, color: '#22c55e', fontWeight: 400, marginTop: 4 }}>→</span>
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1e3a5f', marginBottom: 5 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>{description}</div>
      </div>
    </div>
  );
}

function ClientsCard() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [hoveredRole, setHoveredRole] = useState(null);

  useEffect(() => {
    api.get('/clients').then((r) => setClients(r.data)).catch(() => {});
  }, []);

  const pickClient = (client) => {
    if (selected?._id === client._id) return;
    setSelected(client);
    setRoles([]);
    setRolesLoading(true);
    api.get(`/roles?clientId=${client._id}`)
      .then((r) => setRoles(r.data))
      .catch(() => {})
      .finally(() => setRolesLoading(false));
  };

  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${hover ? '#d1fae5' : '#f3f4f6'}`,
      borderRadius: 18,
      boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.09)' : '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'border 0.18s, box-shadow 0.18s',
      overflow: 'hidden',
    }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Card header */}
      <div
        onClick={() => navigate('/clients')}
        style={{ padding: '28px 24px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            background: '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>
            🏢
          </div>
          <span style={{ fontSize: 22, color: '#22c55e', marginTop: 4 }}>→</span>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1e3a5f', marginBottom: 5 }}>Clients</div>
          <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>Manage and view<br />all clients</div>
        </div>
      </div>

      {/* Client list */}
      {clients.length > 0 && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 20px 8px' }}>
            Select a client
          </div>
          {clients.map((c) => {
            const isActive = selected?._id === c._id;
            return (
              <div
                key={c._id}
                onClick={() => pickClient(c)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 20px', cursor: 'pointer',
                  background: isActive ? '#eff6ff' : 'transparent',
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#2563eb' : '#374151',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span>{c.name}</span>
                {isActive && <span style={{ color: '#2563eb', fontSize: 14 }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Roles list */}
      {selected && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 20px 8px' }}>
            {selected.name} — Roles
          </div>
          {rolesLoading && <p style={{ padding: '8px 20px', fontSize: 13, color: '#9ca3af', margin: 0 }}>Loading…</p>}
          {!rolesLoading && !roles.length && (
            <p style={{ padding: '8px 20px', fontSize: 13, color: '#9ca3af', margin: 0 }}>No roles found.</p>
          )}
          {roles.map((r) => (
            <div
              key={r._id}
              onClick={() => navigate(`/clients/${selected._id}/roles/${r._id}/candidates`)}
              onMouseEnter={() => setHoveredRole(r._id)}
              onMouseLeave={() => setHoveredRole(null)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 20px', cursor: 'pointer',
                background: hoveredRole === r._id ? '#f0fdf4' : 'transparent',
                fontSize: 14, color: hoveredRole === r._id ? '#16a34a' : '#374151',
                transition: 'background 0.12s',
              }}
            >
              <span>{r.title}</span>
              <span style={{ color: '#22c55e', fontSize: 14 }}>→</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100%', background: '#f4f7fb', padding: '32px 32px 0' }}>

      {/* Welcome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: '#e8f5e9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0,
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="2.5" fill="#7ab648" />
            <rect x="16" y="2" width="10" height="10" rx="2.5" fill="#7ab648" opacity="0.6" />
            <rect x="2" y="16" width="10" height="10" rx="2.5" fill="#7ab648" opacity="0.6" />
            <rect x="16" y="16" width="10" height="10" rx="2.5" fill="#7ab648" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'there'}!
          </div>
          <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 2 }}>What would you like to do today?</div>
        </div>
      </div>

      {/* 4 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32, alignItems: 'start' }}>
        <ClientsCard />
        <NavCard
          icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" fill="#7ab648" opacity="0.7"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6" stroke="#7ab648" strokeWidth="2" strokeLinecap="round"/><circle cx="17" cy="9" r="2" fill="#22c55e"/><path d="M20 7l1.5 1.5L24 6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          title="Selection Tracker"
          description="Track offered & joined candidates"
          onClick={() => navigate('/selection-tracker')}
        />
        <NavCard
          icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="7" rx="8" ry="4" fill="#1e3a5f" opacity="0.15"/><path d="M4 7v5c0 2.21 3.58 4 8 4s8-1.79 8-4V7" stroke="#1e3a5f" strokeWidth="1.8"/><path d="M4 12v5c0 2.21 3.58 4 8 4s8-1.79 8-4v-5" stroke="#1e3a5f" strokeWidth="1.8"/><ellipse cx="12" cy="7" rx="8" ry="4" stroke="#1e3a5f" strokeWidth="1.8"/></svg>}
          title="Local Database"
          description="Search all candidates in database"
          onClick={() => navigate('/local-database')}
        />
        <NavCard
          icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 0 1 0 20" stroke="#e5e7eb" strokeWidth="2"/><path d="M12 2a10 10 0 0 0 0 20" stroke="#22c55e" strokeWidth="2" strokeDasharray="20 40"/><circle cx="12" cy="12" r="4" fill="#22c55e" opacity="0.3"/><circle cx="12" cy="12" r="2" fill="#16a34a"/></svg>}
          title="Generate Report"
          description="Generate client activity summary"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Illustration */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0, pointerEvents: 'none', marginRight: -32 }}>
        <svg viewBox="0 0 620 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '55%', maxWidth: 560, opacity: 0.92 }}>
          {/* Background blobs */}
          <ellipse cx="360" cy="200" rx="240" ry="120" fill="#e8f5e9" opacity="0.6" />
          <ellipse cx="480" cy="220" rx="130" ry="80" fill="#dbeafe" opacity="0.4" />
          {/* Cards behind */}
          <rect x="80" y="60" width="130" height="170" rx="14" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="1.5" />
          <rect x="230" y="30" width="180" height="210" rx="14" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5" />
          <rect x="430" y="60" width="140" height="170" rx="14" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="1.5" />
          {/* Center card content */}
          <circle cx="320" cy="90" r="28" fill="#dbeafe" />
          <circle cx="320" cy="82" r="12" fill="#93c5fd" />
          <rect x="280" y="118" width="80" height="6" rx="3" fill="#e5e7eb" />
          <rect x="290" y="130" width="60" height="5" rx="2.5" fill="#f3f4f6" />
          <rect x="275" y="145" width="90" height="5" rx="2.5" fill="#f3f4f6" />
          {/* Stars center */}
          <text x="295" y="165" fontSize="12" fill="#fbbf24">★★★</text>
          <text x="295" y="180" fontSize="9" fill="#d1d5db">★★</text>
          {/* Left card */}
          <circle cx="145" cy="120" r="22" fill="#e5e7eb" />
          <circle cx="145" cy="114" r="9" fill="#d1d5db" />
          <rect x="115" y="148" width="60" height="5" rx="2.5" fill="#f3f4f6" />
          <rect x="120" y="158" width="50" height="4" rx="2" fill="#f3f4f6" />
          {/* Right card */}
          <circle cx="500" cy="120" r="22" fill="#e5e7eb" />
          <circle cx="500" cy="114" r="9" fill="#d1d5db" />
          <rect x="470" y="148" width="60" height="5" rx="2.5" fill="#f3f4f6" />
          <text x="472" y="172" fontSize="11" fill="#fbbf24">★★★</text>
          {/* Magnifier */}
          <circle cx="295" cy="120" r="40" fill="none" stroke="#1e3a5f" strokeWidth="6" opacity="0.8" />
          <line x1="325" y1="150" x2="355" y2="180" stroke="#1e3a5f" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
          {/* Checkmarks on center card */}
          <circle cx="280" cy="193" r="8" fill="#22c55e" />
          <path d="M276 193l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="292" y="190" width="38" height="4" rx="2" fill="#d1fae5" />
          <rect x="292" y="198" width="30" height="4" rx="2" fill="#d1fae5" />
          {/* Plant */}
          <rect x="72" y="218" width="22" height="28" rx="4" fill="#3b82f6" opacity="0.6" />
          <ellipse cx="83" cy="205" rx="16" ry="22" fill="#7ab648" />
          <ellipse cx="68" cy="214" rx="12" ry="16" fill="#5a9e3a" />
          <ellipse cx="98" cy="212" rx="12" ry="16" fill="#5a9e3a" />
          {/* Bar chart */}
          <rect x="530" y="210" width="16" height="40" rx="3" fill="#3b82f6" opacity="0.7" />
          <rect x="550" y="195" width="16" height="55" rx="3" fill="#3b82f6" opacity="0.85" />
          <rect x="570" y="178" width="16" height="72" rx="3" fill="#22c55e" />
          {/* Graph line */}
          <polyline points="430,230 460,210 490,220 530,190" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="530" cy="190" r="5" fill="#22c55e" />
        </svg>
      </div>
    </div>
  );
}
