import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const COLS = [
  { key: 'role',            label: 'Role',           width: 160 },
  { key: 'location',        label: 'Location',       width: 110 },
  { key: 'total',           label: 'Total CVs',      width: 80,  bold: true },
  { key: 'Screened',        label: 'Screened',       width: 80  },
  { key: 'R1',              label: 'R1',             width: 50  },
  { key: 'R2',              label: 'R2',             width: 50  },
  { key: 'R3',              label: 'R3',             width: 50  },
  { key: 'Shortlisted',     label: 'Shortlisted',    width: 90  },
  { key: 'Sent - No Luck',  label: 'Sent-No Luck',   width: 95  },
  { key: 'On Hold',         label: 'On Hold',        width: 75  },
  { key: 'Offered',         label: 'Offered',        width: 70  },
  { key: 'Joined',          label: 'Joined',         width: 65  },
  { key: 'Rejected',        label: 'Rejected',       width: 75  },
];

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
  whiteSpace: 'nowrap',
};

export default function ReportsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/clients').then((r) => setClients(r.data)).catch(() => {});
  }, []);

  const generate = async () => {
    if (!clientId || !from || !to) { setError('Please select a client and both dates.'); return; }
    if (new Date(from) > new Date(to)) { setError('From date cannot be after To date.'); return; }
    setError('');
    setReport(null);
    setLoading(true);
    try {
      const res = await api.get(`/reports?clientId=${clientId}&from=${from}&to=${to}`);
      setReport(res.data.rows);
      setClientName(res.data.clientName);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    window.open(`/api/reports/export?clientId=${clientId}&from=${from}&to=${to}`, '_blank');
  };

  // Totals row
  const totals = report
    ? COLS.reduce((acc, col) => {
        if (col.key === 'role') { acc[col.key] = 'TOTAL'; return acc; }
        if (col.key === 'location') { acc[col.key] = ''; return acc; }
        acc[col.key] = report.reduce((s, r) => s + (Number(r[col.key]) || 0), 0);
        return acc;
      }, {})
    : null;

  const inputCls = {
    border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px',
    fontSize: 14, outline: 'none', background: '#fff',
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
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Generate Report</h1>
      </div>

      {/* Controls */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Client</label>
          <select
            value={clientId}
            onChange={(e) => { setClientId(e.target.value); setReport(null); }}
            style={{ ...inputCls, width: 200 }}
          >
            <option value="">Select client…</option>
            {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>From</label>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setReport(null); }} style={inputCls} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>To</label>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setReport(null); }} style={inputCls} />
        </div>

        <button
          onClick={generate}
          disabled={loading}
          style={{ padding: '9px 20px', fontSize: 14, fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Generating…' : 'Generate'}
        </button>

        {report && (
          <button
            onClick={downloadExcel}
            style={{ padding: '9px 20px', fontSize: 14, fontWeight: 600, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginLeft: 'auto' }}
          >
            Generate Excel
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Report table */}
      {report && (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{clientName}</h2>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>
              {from.split('-').reverse().join('/')} — {to.split('-').reverse().join('/')}
            </span>
            <span style={{ fontSize: 13, color: '#6b7280', background: '#f3f4f6', padding: '1px 10px', borderRadius: 999 }}>
              {report.length} role{report.length !== 1 ? 's' : ''}
            </span>
          </div>

          {report.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9ca3af', padding: '32px 0' }}>No candidates found for this client in the selected date range.</p>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: COLS.reduce((s, c) => s + c.width, 0) }}>
                  <colgroup>
                    {COLS.map((c) => <col key={c.key} style={{ width: c.width }} />)}
                  </colgroup>
                  <thead>
                    <tr>
                      {COLS.map((c) => <th key={c.key} style={TH}>{c.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((row, i) => (
                      <tr key={i} onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        {COLS.map((c) => (
                          <td key={c.key} style={{
                            ...TD,
                            fontWeight: c.bold || c.key === 'role' ? 600 : 400,
                            color: c.bold ? '#2563eb' : c.key === 'role' ? '#111827' : '#374151',
                          }}>
                            {row[c.key] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                      {COLS.map((c) => (
                        <td key={c.key} style={{ ...TD, fontWeight: 700, color: c.bold ? '#2563eb' : '#111827', borderBottom: 'none' }}>
                          {totals[c.key] === 0 && c.key !== 'role' && c.key !== 'location' ? '0' : (totals[c.key] || '')}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
