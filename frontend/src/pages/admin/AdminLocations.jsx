import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

export default function AdminLocations() {
  const showToast = useToast();
  const [locations, setLocations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      setLocations(res.data);
    } catch { showToast('Failed to load locations', 'error'); }
  };

  useEffect(() => { fetchLocations(); }, []);

  const openAdd = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (l) => { setEditing(l); reset(l); setModalOpen(true); };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await api.put(`/locations/${editing._id}`, data);
        showToast('Location updated', 'success');
      } else {
        await api.post('/locations', data);
        showToast('Location created', 'success');
      }
      setModalOpen(false);
      fetchLocations();
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/locations/${deleteTarget._id}`);
      showToast('Location deactivated', 'success');
      fetchLocations();
    } catch { showToast('Error', 'error'); }
    setDeleteTarget(null);
  };

  const inputCls = 'border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Admin — Locations</h1>
        <button onClick={openAdd} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">+ Add</button>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border-b px-3 py-2">Name</th>
            <th className="border-b px-3 py-2">State</th>
            <th className="border-b px-3 py-2">Status</th>
            <th className="border-b px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((l) => (
            <tr key={l._id} className="hover:bg-gray-50">
              <td className="border-b px-3 py-2">{l.name}</td>
              <td className="border-b px-3 py-2">{l.state || '—'}</td>
              <td className="border-b px-3 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${l.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{l.active ? 'Active' : 'Inactive'}</span>
              </td>
              <td className="border-b px-3 py-2">
                <div className="flex gap-2">
                  <button onClick={() => openEdit(l)} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">Edit</button>
                  <button onClick={() => setDeleteTarget(l)} className="px-3 py-1.5 rounded text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100">Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {!locations.length && <tr><td colSpan={4} className="text-center py-8 text-gray-400">No locations found</td></tr>}
        </tbody>
      </table>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Location' : 'Add Location'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input {...register('name', { required: 'Required' })} className={inputCls} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">State</label><input {...register('state')} className={inputCls} /></div>
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
