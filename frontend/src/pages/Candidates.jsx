import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const STATUSES = ['Sent - No Luck', 'Screened', 'R1', 'R2', 'R3', 'Shortlisted', 'On Hold', 'Rejected', 'Offered', 'Joined'];

function fmtDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function fmtCTC(v) {
  if (v == null) return '—';
  const n = Number(v);
  if (isNaN(n)) return '—';
  if (n > 50) return '50+';
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(2)));
}

function CvCell({ candidate, onPreview }) {
  const [broken, setBroken] = React.useState(false);
  const isImage = /\.(jpg|jpeg|png|webp)(\?|$)/i.test(candidate.cvUrl);

  if (!broken && isImage) {
    return (
      <div
        style={{ width: 40, height: 50, overflow: 'hidden', flexShrink: 0 }}
        className="rounded cursor-pointer border border-gray-200 hover:opacity-80 transition-opacity"
        onClick={onPreview}
      >
        <img
          src={candidate.cvUrl}
          alt="CV"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setBroken(true)}
        />
      </div>
    );
  }
  return (
    <a href={candidate.cvUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">
      Download
    </a>
  );
}

export default function Candidates() {
  const { clientId, roleId } = useParams();
  const { user } = useAuth();
  const showToast = useToast();
  const [data, setData] = useState({ candidates: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const [role, setRole] = useState(null);
  const [client, setClient] = useState(null);
  const importRef = useRef();
  const searchTimeout = useRef();

  const fetchMeta = async () => {
    try {
      const [clientsRes, rolesRes] = await Promise.all([
        api.get('/clients'),
        api.get(`/roles?clientId=${clientId}`),
      ]);
      setClient(clientsRes.data.find((c) => c._id === clientId));
      setRole(rolesRes.data.find((r) => r._id === roleId));
    } catch {}
  };

  const fetchCandidates = async (p = page, q = search, s = statusFilter) => {
    try {
      const params = new URLSearchParams({ roleId, page: p, limit: 20 });
      if (q) params.set('q', q);
      if (s) params.set('status', s);
      const res = await api.get(`/candidates?${params}`);
      setData(res.data);
    } catch (err) {
      showToast('Failed to load candidates', 'error');
    }
  };

  useEffect(() => { fetchMeta(); }, []);
  useEffect(() => { fetchCandidates(page, search, statusFilter); }, [page, statusFilter]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setPage(1); fetchCandidates(1, val, statusFilter); }, 400);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/candidates/${deleteTarget._id}`);
      showToast('Candidate deleted', 'success');
      fetchCandidates();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting candidate', 'error');
    }
    setDeleteTarget(null);
  };

  const handleExport = () => {
    const params = new URLSearchParams({ roleId, clientId });
    window.open(`/api/candidates/export?${params}`, '_blank');
  };

  const handleBulkDownload = () => {
    window.open(`/api/candidates/bulk-download?roleId=${roleId}`, '_blank');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/candidates/import?roleId=${roleId}&clientId=${clientId}`, formData);
      showToast(`Imported ${res.data.inserted} candidates, skipped ${res.data.skipped}`, 'success');
      fetchCandidates();
    } catch (err) {
      showToast(err.response?.data?.message || 'Import failed', 'error');
    }
    e.target.value = '';
  };

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Clients', to: '/clients' },
        { label: client?.name || '...', to: `/clients/${clientId}/roles` },
        { label: role?.title || '...' },
      ]} />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-semibold text-gray-800">Candidates — {role?.title}</h1>
        <div className="flex gap-2 flex-wrap">
          <Link to={`/clients/${clientId}/roles/${roleId}/candidates/add`} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
            + Add Candidate
          </Link>
          <button onClick={handleExport} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200">Export Excel</button>
          <button onClick={() => importRef.current?.click()} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200">Import Excel</button>
          <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <button onClick={handleBulkDownload} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200">Download All CVs</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm text-gray-500 self-center">{data.total} total</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
      <table className="border-collapse text-sm" style={{ width: '100%', tableLayout: 'fixed', minWidth: 1580 }}>
        <colgroup>
          <col style={{ width: 40 }} />
          <col style={{ width: 145 }} />
          <col style={{ width: 115 }} />
          <col style={{ width: 160 }} />
          <col style={{ width: 125 }} />
          <col style={{ width: 130 }} />
          <col style={{ width: 95 }} />
          <col style={{ width: 48 }} />
          <col style={{ width: 72 }} />
          <col style={{ width: 72 }} />
          <col style={{ width: 88 }} />
          <col style={{ width: 100 }} />
          <col style={{ width: 190 }} />
          <col style={{ width: 88 }} />
          <col style={{ width: 58 }} />
          <col style={{ width: 120 }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border-b px-2 py-2 text-gray-400 font-normal text-xs">#</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Name</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Phone</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Email</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Company</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Designation</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Location</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Exp</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Cur CTC</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Exp CTC</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Notice</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Status</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Remarks</th>
            <th className="border-b px-2 py-2 text-xs font-semibold">Added On</th>
            <th className="border-b px-2 py-2 text-xs font-semibold text-center">CV</th>
            <th className="border-b px-2 py-2 text-xs font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.candidates.map((c, i) => (
            <tr key={c._id} className="hover:bg-gray-50">
              <td className="border-b px-2 py-2 text-gray-400 text-xs" style={{ verticalAlign: 'middle' }}>{(page - 1) * 20 + i + 1}</td>
              <td className="border-b px-2 py-2 font-medium" style={{ verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.fullName}</td>
              <td className="border-b px-2 py-2" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{c.phone}</td>
              <td className="border-b px-2 py-2 text-xs text-gray-500" style={{ verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || '—'}</td>
              <td className="border-b px-2 py-2" style={{ verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.currentCompany || '—'}</td>
              <td className="border-b px-2 py-2" style={{ verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.currentDesignation || '—'}</td>
              <td className="border-b px-2 py-2" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.location?.name || '—'}</td>
              <td className="border-b px-2 py-2" style={{ verticalAlign: 'middle' }}>{c.totalExp ?? '—'}</td>
              <td className="border-b px-2 py-2" style={{ verticalAlign: 'middle' }}>{fmtCTC(c.currentCTC)}</td>
              <td className="border-b px-2 py-2" style={{ verticalAlign: 'middle' }}>{fmtCTC(c.expectedCTC)}</td>
              <td className="border-b px-2 py-2 text-xs" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{c.noticePeriod || '—'}</td>
              <td className="border-b px-2 py-2" style={{ verticalAlign: 'middle' }}>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap">{c.status}</span>
              </td>
              <td className="border-b px-2 py-2" style={{ verticalAlign: 'middle' }}>
                <span className="text-xs text-gray-600 line-clamp-2">{c.remarks || '—'}</span>
              </td>
              <td className="border-b px-2 py-2 text-xs text-gray-500" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{fmtDate(c.editableDate || c.createdAt)}</td>
              <td className="border-b px-2 py-2 text-center" style={{ verticalAlign: 'middle' }}>
                {c.cvUrl ? (
                  <CvCell candidate={c} onPreview={() => setCvPreview(c)} />
                ) : <span className="text-gray-300 text-xs">—</span>}
              </td>
              <td className="border-b px-2 py-2 text-right" style={{ verticalAlign: 'middle' }}>
                <div className="flex gap-1 justify-end">
                  <Link
                    to={`/clients/${clientId}/roles/${roleId}/candidates/${c._id}/edit`}
                    className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Del
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!data.candidates.length && (
            <tr><td colSpan={16} className="text-center py-8 text-gray-400">No candidates found</td></tr>
          )}
        </tbody>
      </table>
      </div>

      <Pagination page={page} pages={data.pages} onChange={(p) => setPage(p)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Delete candidate "${deleteTarget?.fullName}"? Their CV will also be removed.`}
      />

      <Modal open={!!cvPreview} onClose={() => setCvPreview(null)} title={cvPreview?.fullName} wide>
        {cvPreview?.cvUrl && (
          <img
            src={cvPreview.cvUrl}
            alt={`CV of ${cvPreview.fullName}`}
            style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
          />
        )}
      </Modal>
    </div>
  );
}
