import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

export default function AdminClients() {
  const showToast = useToast();
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch { showToast('Failed to load clients', 'error'); }
  };

  useEffect(() => { fetchClients(); }, []);

  const openAdd = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); reset(c); setModalOpen(true); };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await api.put(`/clients/${editing._id}`, data);
        showToast('Client updated', 'success');
      } else {
        await api.post('/clients', data);
        showToast('Client created', 'success');
      }
      setModalOpen(false);
      fetchClients();
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/clients/${deleteTarget._id}`);
      showToast('Client deactivated', 'success');
      fetchClients();
    } catch { showToast('Error', 'error'); }
    setDeleteTarget(null);
  };

  const inputCls = 'border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Admin — Clients</h1>
        <button onClick={openAdd} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">+ Add</button>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border-b px-3 py-2">Name</th>
            <th className="border-b px-3 py-2">Industry</th>
            <th className="border-b px-3 py-2">Contact</th>
            <th className="border-b px-3 py-2">Status</th>
            <th className="border-b px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c._id} className="hover:bg-gray-50">
              <td className="border-b px-3 py-2">{c.name}</td>
              <td className="border-b px-3 py-2">{c.industry || '—'}</td>
              <td className="border-b px-3 py-2">{c.contactPerson || '—'}</td>
              <td className="border-b px-3 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.active ? 'Active' : 'Inactive'}</span>
              </td>
              <td className="border-b px-3 py-2">
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">Edit</button>
                  <button onClick={() => setDeleteTarget(c)} className="px-3 py-1.5 rounded text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Client' : 'Add Client'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input {...register('name', { required: 'Required' })} className={inputCls} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Industry</label><input {...register('industry')} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label><input {...register('contactPerson')} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label><input type="email" {...register('contactEmail')} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label><input {...register('contactPhone')} className={inputCls} /></div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} message={`Deactivate "${deleteTarget?.name}"?`} />
    </div>
  );
}
