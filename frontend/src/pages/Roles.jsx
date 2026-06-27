import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Breadcrumb from '../components/Breadcrumb';
import { useToast } from '../components/Toast';

const STATUS_OPTIONS = ['open', 'closed', 'on_hold'];

export default function Roles() {
  const { clientId } = useParams();
  const { user } = useAuth();
  const showToast = useToast();
  const [roles, setRoles] = useState([]);
  const [client, setClient] = useState(null);
  const [locations, setLocations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = async () => {
    try {
      const [rolesRes, clientsRes, locsRes] = await Promise.all([
        api.get(`/roles?clientId=${clientId}`),
        api.get('/clients'),
        api.get('/locations'),
      ]);
      setRoles(rolesRes.data);
      setClient(clientsRes.data.find((c) => c._id === clientId) || null);
      setLocations(locsRes.data);
    } catch (err) {
      showToast('Failed to load data', 'error');
    }
  };

  useEffect(() => { fetchData(); }, [clientId]);

  const openAdd = () => { setEditing(null); reset({ client: clientId, status: 'open', openings: 1 }); setModalOpen(true); };
  const openEdit = (r) => {
    setEditing(r);
    reset({ title: r.title, location: r.location?._id || '', openings: r.openings, status: r.status, jd: r.jd || '', client: r.client?._id || clientId });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, client: clientId };
      if (editing) {
        await api.put(`/roles/${editing._id}`, payload);
        showToast('Role updated', 'success');
      } else {
        await api.post('/roles', payload);
        showToast('Role created', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving role', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/roles/${deleteTarget._id}`);
      showToast('Role deleted', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting role', 'error');
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Clients', to: '/clients' }, { label: client?.name || '...' }]} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Roles — {client?.name}</h1>
        {user?.role === 'admin' && (
          <button onClick={openAdd} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
            + Add Role
          </button>
        )}
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border-b px-3 py-2">Title</th>
            <th className="border-b px-3 py-2">Location</th>
            <th className="border-b px-3 py-2">Openings</th>
            <th className="border-b px-3 py-2">Status</th>
            <th className="border-b px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r._id} className="hover:bg-gray-50">
              <td className="border-b px-3 py-2 font-medium">{r.title}</td>
              <td className="border-b px-3 py-2">{r.location?.name || '—'}</td>
              <td className="border-b px-3 py-2">{r.openings}</td>
              <td className="border-b px-3 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'open' ? 'bg-green-100 text-green-700' : r.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {r.status}
                </span>
              </td>
              <td className="border-b px-3 py-2">
                <div className="flex gap-2">
                  <Link to={`/clients/${clientId}/roles/${r._id}/candidates`} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200">
                    Candidates
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <button onClick={() => openEdit(r)} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">Edit</button>
                      <button onClick={() => setDeleteTarget(r)} className="px-3 py-1.5 rounded text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100">Delete</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {!roles.length && (
            <tr><td colSpan={5} className="text-center py-8 text-gray-400">No roles found</td></tr>
          )}
        </tbody>
      </table>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Role' : 'Add Role'} wide>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input {...register('title', { required: 'Required' })} className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select {...register('location')} className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="">Select location</option>
                {locations.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Openings</label>
              <input type="number" min="1" {...register('openings')} className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
            <textarea rows={4} {...register('jd')} className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Delete role "${deleteTarget?.title}"?`}
      />
    </div>
  );
}
