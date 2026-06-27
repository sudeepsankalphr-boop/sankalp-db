import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

const STATUS_OPTIONS = ['open', 'closed', 'on_hold'];

export default function AdminRoles() {
  const showToast = useToast();
  const [roles, setRoles] = useState([]);
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [clientFilter, setClientFilter] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchAll = async () => {
    try {
      const [rolesRes, clientsRes, locsRes] = await Promise.all([
        api.get(clientFilter ? `/roles?clientId=${clientFilter}` : '/roles'),
        api.get('/clients'),
        api.get('/locations'),
      ]);
      setRoles(rolesRes.data);
      setClients(clientsRes.data);
      setLocations(locsRes.data);
    } catch { showToast('Failed to load data', 'error'); }
  };

  useEffect(() => { fetchAll(); }, [clientFilter]);

  const openAdd = () => { setEditing(null); reset({ status: 'open', openings: 1 }); setModalOpen(true); };
  const openEdit = (r) => {
    setEditing(r);
    reset({ title: r.title, client: r.client?._id || '', location: r.location?._id || '', openings: r.openings, status: r.status, jd: r.jd || '' });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await api.put(`/roles/${editing._id}`, data);
        showToast('Role updated', 'success');
      } else {
        await api.post('/roles', data);
        showToast('Role created', 'success');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/roles/${deleteTarget._id}`);
      showToast('Role deleted', 'success');
      fetchAll();
    } catch { showToast('Error', 'error'); }
    setDeleteTarget(null);
  };

  const inputCls = 'border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Admin — Roles</h1>
        <button onClick={openAdd} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">+ Add</button>
      </div>
      <div className="mb-4">
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Clients</option>
          {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border-b px-3 py-2">Title</th>
            <th className="border-b px-3 py-2">Client</th>
            <th className="border-b px-3 py-2">Location</th>
            <th className="border-b px-3 py-2">Openings</th>
            <th className="border-b px-3 py-2">Status</th>
            <th className="border-b px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r._id} className="hover:bg-gray-50">
              <td className="border-b px-3 py-2">{r.title}</td>
              <td className="border-b px-3 py-2">{r.client?.name || '—'}</td>
              <td className="border-b px-3 py-2">{r.location?.name || '—'}</td>
              <td className="border-b px-3 py-2">{r.openings}</td>
              <td className="border-b px-3 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'open' ? 'bg-green-100 text-green-700' : r.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
              </td>
              <td className="border-b px-3 py-2">
                <div className="flex gap-2">
                  <button onClick={() => openEdit(r)} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">Edit</button>
                  <button onClick={() => setDeleteTarget(r)} className="px-3 py-1.5 rounded text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100">Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {!roles.length && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No roles found</td></tr>}
        </tbody>
      </table>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Role' : 'Add Role'} wide>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input {...register('title', { required: 'Required' })} className={inputCls} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select {...register('client', { required: 'Required' })} className={inputCls}>
                <option value="">Select client</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client.message}</p>}
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select {...register('location')} className={inputCls}>
                <option value="">Select location</option>
                {locations.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Openings</label><input type="number" min="1" {...register('openings')} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')} className={inputCls}>{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
            <textarea rows={4} {...register('jd')} className={inputCls} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} message={`Delete role "${deleteTarget?.title}"?`} />
    </div>
  );
}
