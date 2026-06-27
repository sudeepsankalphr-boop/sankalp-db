import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_COLORS = {
  'Sent - No Luck': { background: '#f3f4f6', color: '#6b7280' },
  Screened:    { background: '#eff6ff', color: '#1d4ed8' },
  R1:          { background: '#eef2ff', color: '#4338ca' },
  R2:          { background: '#f5f3ff', color: '#6d28d9' },
  R3:          { background: '#faf5ff', color: '#7e22ce' },
  Shortlisted: { background: '#fefce8', color: '#a16207' },
  Rejected:    { background: '#fef2f2', color: '#dc2626' },
  Offered:     { background: '#fff7ed', color: '#c2410c' },
  Joined:      { background: '#f0fdf4', color: '#15803d' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { background: '#f3f4f6', color: '#374151' };
  return (
    <span style={{ ...s, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

function fmtCTC(v) {
  if (v == null) return '—';
  const n = Number(v);
  if (isNaN(n)) return '—';
  if (n > 50) return '50+';
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(2)));
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const TH = {
  borderBottom: '2px solid #e5e7eb',
  padding: '9px 12px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: '#6b7280',
  background: '#f9fafb',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const TD = {
  borderBottom: '1px solid #f3f4f6',
  padding: '10px 12px',
  fontSize: 13,
  color: '#374151',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export default function SelectionTrackerPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/candidates?limit=200&sort=updated&status=Offered,Joined')
      .then((r) => {
        setCandidates(r.data.candidates);
        setTotal(r.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openProfile = (c) => {
    if (c.client?._id && c.role?._id) {
      navigate(`/clients/${c.client._id}/roles/${c.role._id}/candidates/${c._id}/edit`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/clients')}
          style={{ padding: '6px 12px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#374151' }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Selection Tracker</h1>
        {!loading && (
          <span style={{ fontSize: 13, color: '#9ca3af', background: '#f3f4f6', padding: '2px 10px', borderRadius: 999 }}>
            {total} candidates
          </span>
        )}
      </div>

      {loading ? (
        <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading…</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 40 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 115 }} />
              <col style={{ width: 145 }} />
              <col style={{ width: 145 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 50 }} />
              <col style={{ width: 60 }} />
              <col style={{ width: 80 }} />
            </colgroup>
            <thead>
              <tr>
                <th style={TH}>#</th>
                <th style={TH}>Name</th>
                <th style={TH}>Phone</th>
                <th style={TH}>Company</th>
                <th style={TH}>Role</th>
                <th style={TH}>Client</th>
                <th style={{ ...TH, overflow: 'visible' }}>Status</th>
                <th style={TH}>Exp</th>
                <th style={TH}>CTC</th>
                <th style={TH}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr
                  key={c._id}
                  onClick={() => openProfile(c)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.cursor = 'pointer'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ ...TD, color: '#d1d5db' }}>{i + 1}</td>
                  <td style={{ ...TD, fontWeight: 600, color: '#111827' }}>{c.fullName}</td>
                  <td style={TD}>{c.phone}</td>
                  <td style={TD}>{c.currentCompany || '—'}</td>
                  <td style={TD}>{c.role?.title || '—'}</td>
                  <td style={TD}>{c.client?.name || '—'}</td>
                  <td style={{ ...TD, overflow: 'visible' }}><StatusBadge status={c.status} /></td>
                  <td style={TD}>{c.totalExp ?? '—'}</td>
                  <td style={TD}>{fmtCTC(c.currentCTC)}</td>
                  <td style={TD}>{timeAgo(c.updatedAt)}</td>
                </tr>
              ))}
              {!candidates.length && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px 16px', fontSize: 14, color: '#9ca3af' }}>
                    No Offered or Joined candidates yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
