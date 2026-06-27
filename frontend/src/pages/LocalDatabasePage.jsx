import React, { useEffect, useRef, useState } from 'react';
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

const LIMIT = 25;

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

export default function LocalDatabasePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const searchTimeout = useRef();

  const doFetch = (q, p) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: LIMIT });
    if (q) params.set('q', q);
    api.get(`/candidates?${params}`)
      .then((r) => {
        setCandidates(r.data.candidates);
        setTotal(r.data.total);
        setPages(r.data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { doFetch('', 1); }, []);

  const handleSearch = (val) => {
    setQuery(val);
    setPage(1);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => doFetch(val, 1), 350);
  };

  const changePage = (p) => { setPage(p); doFetch(query, p); };

  const openProfile = (c) => {
    if (c.client?._id && c.role?._id) {
      navigate(`/clients/${c.client._id}/roles/${c.role._id}/candidates/${c._id}/edit`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/clients')}
          style={{ padding: '6px 12px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#374151' }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Local Database</h1>
        {!loading && (
          <span style={{ fontSize: 13, color: '#9ca3af', background: '#f3f4f6', padding: '2px 10px', borderRadius: 999 }}>
            {total} candidates
          </span>
        )}
        <input
          type="text"
          placeholder="Search name, phone, company, designation…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            marginLeft: 'auto', width: 300, border: '1px solid #d1d5db', borderRadius: 8,
            padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {loading && <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading…</p>}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 40 }} />
            <col style={{ width: 145 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 48 }} />
            <col style={{ width: 55 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 110 }} />
          </colgroup>
          <thead>
            <tr>
              <th style={TH}>#</th>
              <th style={TH}>Name</th>
              <th style={TH}>Phone</th>
              <th style={TH}>Email</th>
              <th style={TH}>Company</th>
              <th style={TH}>Designation</th>
              <th style={TH}>Exp</th>
              <th style={TH}>CTC</th>
              <th style={{ ...TH, overflow: 'visible' }}>Status</th>
              <th style={TH}>Role</th>
              <th style={TH}>Client</th>
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
                <td style={{ ...TD, color: '#d1d5db' }}>{(page - 1) * LIMIT + i + 1}</td>
                <td style={{ ...TD, fontWeight: 600, color: '#111827' }}>{c.fullName}</td>
                <td style={TD}>{c.phone}</td>
                <td style={{ ...TD, color: '#6b7280' }}>{c.email || '—'}</td>
                <td style={TD}>{c.currentCompany || '—'}</td>
                <td style={TD}>{c.currentDesignation || '—'}</td>
                <td style={TD}>{c.totalExp ?? '—'}</td>
                <td style={TD}>{fmtCTC(c.currentCTC)}</td>
                <td style={{ ...TD, overflow: 'visible' }}><StatusBadge status={c.status} /></td>
                <td style={TD}>{c.role?.title || '—'}</td>
                <td style={TD}>{c.client?.name || '—'}</td>
              </tr>
            ))}
            {!loading && !candidates.length && (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '32px 16px', fontSize: 14, color: '#9ca3af' }}>
                  {query ? 'No results found.' : 'No candidates yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => changePage(page - 1)} disabled={page === 1}
            style={{ padding: '5px 10px', fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
          >‹ Prev</button>
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…'); acc.push(p); return acc; }, [])
            .map((p, idx) => p === '…' ? (
              <span key={`e${idx}`} style={{ fontSize: 12, color: '#9ca3af', padding: '0 2px' }}>…</span>
            ) : (
              <button key={p} onClick={() => changePage(p)}
                style={{ padding: '5px 10px', fontSize: 12, border: '1px solid', borderRadius: 6, cursor: 'pointer', background: p === page ? '#2563eb' : '#fff', color: p === page ? '#fff' : '#374151', borderColor: p === page ? '#2563eb' : '#e5e7eb' }}
              >{p}</button>
            ))}
          <button
            onClick={() => changePage(page + 1)} disabled={page === pages}
            style={{ padding: '5px 10px', fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: page === pages ? 'default' : 'pointer', opacity: page === pages ? 0.4 : 1 }}
          >Next ›</button>
        </div>
      )}
    </div>
  );
}
