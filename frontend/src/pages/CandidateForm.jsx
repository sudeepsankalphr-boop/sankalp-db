import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import Breadcrumb from '../components/Breadcrumb';
import { useToast } from '../components/Toast';

const STATUSES = ['Sent - No Luck', 'Screened', 'R1', 'R2', 'R3', 'Shortlisted', 'On Hold', 'Rejected', 'Offered', 'Joined'];
const NOTICE_PERIODS = ['Immediate', '15 Days', '30 Days', '45 Days', '60 Days', '60+ Days'];

function toDateInput(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return '';
  return d.toISOString().split('T')[0];
}

function buildCtcOptions() {
  const opts = [];
  for (let v = 0; v <= 10; v += 0.25) opts.push(Math.round(v * 100) / 100);
  for (let v = 10.5; v <= 20; v += 0.5) opts.push(Math.round(v * 10) / 10);
  for (let v = 21; v <= 30; v += 1) opts.push(v);
  return opts;
}

const CTC_OPTIONS = buildCtcOptions();
const EXP_OPTIONS = Array.from({ length: 30 }, (_, i) => i + 1);

function formatCTC(v) {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (isNaN(n)) return '';
  if (n > 50) return '50+';
  if (Number.isInteger(n)) return String(n);
  return String(parseFloat(n.toFixed(2)));
}

function formatExp(v) {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (isNaN(n)) return '';
  return String(Math.round(n));
}

// Shared combobox: opens on click, filterable, commits on blur/enter
function NumericCombobox({ value, onChange, options, formatDisplay, threshold, thresholdMsg, onPopup, placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const display = open ? query : (value != null ? formatDisplay(value) : '');

  const filtered = query === ''
    ? options
    : options.filter(o => formatDisplay(o).startsWith(query));

  const commit = (numVal) => {
    if (numVal == null) { onChange(null); return; }
    const n = Number(numVal);
    if (isNaN(n)) { onChange(null); return; }
    if (threshold != null && n > threshold) {
      onPopup(thresholdMsg,
        () => { onChange(null); setQuery(''); },
        () => { onChange(n); setQuery(''); }
      );
    } else {
      onChange(n);
      setQuery('');
    }
  };

  const handleBlur = () => {
    // Delay to let onMouseDown on an option fire first
    setTimeout(() => {
      if (wrapRef.current?.contains(document.activeElement)) return;
      setOpen(false);
      if (query !== '') {
        const n = parseFloat(query);
        if (!isNaN(n)) commit(n);
        else setQuery('');
      }
    }, 150);
  };

  const selectOption = (opt) => {
    setOpen(false);
    commit(opt);
    inputRef.current?.blur();
  };

  const inputCls = 'border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={display}
        placeholder={placeholder || ''}
        onFocus={() => { setQuery(''); setOpen(true); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const n = parseFloat(query);
            if (!isNaN(n)) commit(n);
            setOpen(false);
          }
          if (e.key === 'Escape') setOpen(false);
        }}
        className={inputCls}
        autoComplete="off"
      />
      {open && (
        <ul style={{
          position: 'absolute', zIndex: 200, top: '100%', left: 0, right: 0,
          maxHeight: 200, overflowY: 'auto', background: 'white',
          border: '1px solid #e5e7eb', borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginTop: 2, padding: 0, listStyle: 'none',
        }}>
          {filtered.length === 0 && (
            <li style={{ padding: '8px 12px', fontSize: 13, color: '#9ca3af' }}>No match — press Enter to use typed value</li>
          )}
          {filtered.map((opt) => (
            <li
              key={opt}
              onMouseDown={(e) => { e.preventDefault(); selectOption(opt); }}
              style={{ padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#374151' }}
              className="hover:bg-blue-50"
            >
              {formatDisplay(opt)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FunPopup({ open, message, onYes, onNo }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div style={{ background: 'white', borderRadius: 12, padding: '32px 36px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 24, lineHeight: 1.4 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onYes}
            className="px-5 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            Yes
          </button>
          <button
            onClick={onNo}
            className="px-5 py-2 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200"
          >
            No, save anyway
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CandidateForm() {
  const { clientId, roleId, candidateId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const isEdit = Boolean(candidateId);

  const [locations, setLocations] = useState([]);
  const [client, setClient] = useState(null);
  const [role, setRole] = useState(null);
  const [cvWarning, setCvWarning] = useState('');

  // Custom numeric fields managed outside react-hook-form
  const [totalExp, setTotalExp] = useState(null);
  const [currentCTC, setCurrentCTC] = useState(null);
  const [expectedCTC, setExpectedCTC] = useState(null);

  // Fun popup state
  const [popup, setPopup] = useState(null); // { message, onYes, onNo }

  const openPopup = (message, onYes, onNo) => setPopup({ message, onYes, onNo });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { status: 'Screened', noticePeriod: '', editableDate: toDateInput(new Date()) },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locsRes, clientsRes, rolesRes] = await Promise.all([
          api.get('/locations'),
          api.get('/clients'),
          api.get(`/roles?clientId=${clientId}`),
        ]);
        setLocations(locsRes.data);
        setClient(clientsRes.data.find((c) => c._id === clientId));
        setRole(rolesRes.data.find((r) => r._id === roleId));

        if (isEdit) {
          const res = await api.get(`/candidates?roleId=${roleId}`);
          const c = res.data.candidates.find((x) => x._id === candidateId);
          if (c) {
            reset({
              fullName: c.fullName,
              phone: c.phone,
              email: c.email || '',
              currentCompany: c.currentCompany || '',
              currentDesignation: c.currentDesignation || '',
              location: c.location?._id || '',
              status: c.status || 'Screened',
              noticePeriod: c.noticePeriod || '',
              editableDate: toDateInput(c.editableDate || c.createdAt),
              remarks: c.remarks || '',
            });
            setTotalExp(c.totalExp ?? null);
            setCurrentCTC(c.currentCTC ?? null);
            setExpectedCTC(c.expectedCTC ?? null);
          }
        }
      } catch (err) {
        showToast('Failed to load form data', 'error');
      }
    };
    fetchData();
  }, [candidateId]);

  const onSubmit = async (rhsData) => {
    const formData = new FormData();

    Object.entries(rhsData).forEach(([key, val]) => {
      if (key === 'cv') return;
      if (val !== undefined && val !== null && val !== '') formData.append(key, val);
    });

    if (totalExp != null) formData.set('totalExp', totalExp);
    if (currentCTC != null) formData.set('currentCTC', currentCTC);
    if (expectedCTC != null) formData.set('expectedCTC', expectedCTC);

    formData.set('role', roleId);
    formData.set('client', clientId);

    if (rhsData.cv?.[0]) formData.append('cv', rhsData.cv[0]);

    try {
      if (isEdit) {
        await api.put(`/candidates/${candidateId}`, formData);
        showToast('Candidate updated', 'success');
      } else {
        await api.post('/candidates', formData);
        showToast('Candidate added', 'success');
      }
      navigate(`/clients/${clientId}/roles/${roleId}/candidates`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving candidate', 'error');
    }
  };

  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    setCvWarning(file && file.size > 5 * 1024 * 1024 ? 'File is over 5MB and will be compressed.' : '');
  };

  const inputCls = 'border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Clients', to: '/clients' },
        { label: client?.name || '...', to: `/clients/${clientId}/roles` },
        { label: role?.title || '...', to: `/clients/${clientId}/roles/${roleId}/candidates` },
        { label: isEdit ? 'Edit Candidate' : 'Add Candidate' },
      ]} />

      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        {isEdit ? 'Edit Candidate' : 'Add Candidate'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full Name *</label>
            <input {...register('fullName', { required: 'Required' })} className={inputCls} />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Phone *</label>
            <input {...register('phone', { required: 'Required' })} className={inputCls} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" {...register('email')} className={inputCls} placeholder="Optional" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Current Company</label>
            <input {...register('currentCompany')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Current Designation</label>
            <input {...register('currentDesignation')} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Location</label>
            <select {...register('location')} className={inputCls}>
              <option value="">Select location</option>
              {locations.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Experience (yrs)</label>
            <NumericCombobox
              value={totalExp}
              onChange={setTotalExp}
              options={EXP_OPTIONS}
              formatDisplay={formatExp}
              threshold={30}
              thresholdMsg="Are you kidding me bro? 😭"
              onPopup={openPopup}
              placeholder="Select or type"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Current CTC (LPA)</label>
            <NumericCombobox
              value={currentCTC}
              onChange={setCurrentCTC}
              options={CTC_OPTIONS}
              formatDisplay={formatCTC}
              threshold={30}
              thresholdMsg="Are you joking with me bro 💀"
              onPopup={openPopup}
              placeholder="Select or type"
            />
          </div>
          <div>
            <label className={labelCls}>Expected CTC (LPA)</label>
            <NumericCombobox
              value={expectedCTC}
              onChange={setExpectedCTC}
              options={CTC_OPTIONS}
              formatDisplay={formatCTC}
              threshold={20}
              thresholdMsg="Are you kidding me bro? 😭"
              onPopup={openPopup}
              placeholder="Select or type"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Status</label>
            <select {...register('status')} className={inputCls}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Notice Period</label>
            <select {...register('noticePeriod')} className={inputCls}>
              <option value="">Select</option>
              {NOTICE_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Added On</label>
            <input type="date" {...register('editableDate')} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Remarks</label>
          <textarea rows={3} {...register('remarks')} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>CV (PDF — stored as image preview)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            {...register('cv')}
            onChange={handleCvChange}
            className="border rounded px-3 py-2 w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {cvWarning && <p className="text-yellow-600 text-xs mt-1">{cvWarning}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Candidate' : 'Add Candidate'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>

      <FunPopup
        open={!!popup}
        message={popup?.message}
        onYes={() => { popup.onYes(); setPopup(null); }}
        onNo={() => { popup.onNo(); setPopup(null); }}
      />
    </div>
  );
}
