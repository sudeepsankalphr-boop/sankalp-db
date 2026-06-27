import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CARD = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

const TITLE = {
  fontSize: 11,
  fontWeight: 700,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  margin: 0,
};

// ─── Panel 1: Clients ─────────────────────────────────────────────────────────

function ClientsPanel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    api.get('/clients').then((r) => setClients(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pickClient = (client) => {
    setSelected(client);
    setRoles([]);
    setRolesLoading(true);
    api.get(`/roles?clientId=${client._id}`)
      .then((r) => setRoles(r.data))
      .catch(() => {})
      .finally(() => setRolesLoading(false));
  };

  return (
    <div ref={cardRef} style={{ ...CARD, position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
          borderRadius: 12,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
      >
        <div>
          <h2 style={TITLE}>Clients</h2>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0 0' }}>
            {selected ? selected.name : 'Select a client'}
          </p>
        </div>
        <span style={{ color: '#9ca3af', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 300,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          padding: '8px 0',
        }}>
          <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, margin: '4px 16px 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select a client
          </p>
          {clients.map((c) => (
            <button
              key={c._id}
              onClick={() => pickClient(c)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
                color: selected?._id === c._id ? '#1d4ed8' : '#374151',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#1d4ed8'; }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = selected?._id === c._id ? '#1d4ed8' : '#374151';
              }}
            >
              {c.name}
            </button>
          ))}
          {!clients.length && (
            <p style={{ padding: '8px 16px', fontSize: 13, color: '#9ca3af', margin: 0 }}>No clients found</p>
          )}

          {selected && (
            <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 4, paddingTop: 4 }}>
              <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, margin: '8px 16px 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {selected.name} — Roles
              </p>
              {rolesLoading && <p style={{ padding: '8px 16px', fontSize: 13, color: '#9ca3af', margin: 0 }}>Loading…</p>}
              {!rolesLoading && !roles.length && (
                <p style={{ padding: '8px 16px', fontSize: 13, color: '#9ca3af', margin: 0 }}>No roles found.</p>
              )}
              {roles.map((r) => (
                <button
                  key={r._id}
                  onClick={() => { navigate(`/clients/${selected._id}/roles/${r._id}/candidates`); setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#374151', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#1d4ed8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#374151'; }}
                >
                  <span>{r.title}</span>
                  <span style={{ color: '#d1d5db', fontSize: 12 }}>→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Panel 2: Selection Tracker (nav card) ────────────────────────────────────

function SelectionTracker() {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate('/selection-tracker')}
      style={{ ...CARD, cursor: 'pointer' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#c7d2fe';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={TITLE}>Selection Tracker</h2>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0 0' }}>Offered & Joined candidates</p>
        </div>
        <span style={{ color: '#c7d2fe', fontSize: 18 }}>→</span>
      </div>
    </div>
  );
}

// ─── Panel 3: Local Database (nav card) ──────────────────────────────────────

function LocalDatabase() {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate('/local-database')}
      style={{ ...CARD, cursor: 'pointer' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#c7d2fe';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={TITLE}>Local Database</h2>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0 0' }}>All candidates, searchable</p>
        </div>
        <span style={{ color: '#c7d2fe', fontSize: 18 }}>→</span>
      </div>
    </div>
  );
}

// ─── Panel 4: Generate Report (nav card) ─────────────────────────────────────

function GenerateReport() {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate('/reports')}
      style={{ ...CARD, cursor: 'pointer' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#c7d2fe';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={TITLE}>Generate Report</h2>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0 0' }}>Client activity summary</p>
        </div>
        <span style={{ color: '#c7d2fe', fontSize: 18 }}>→</span>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1100,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: 24,
      }}>
        <ClientsPanel />
        <SelectionTracker />
        <LocalDatabase />
        <GenerateReport />
      </div>
    </div>
  );
}
