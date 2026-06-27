import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

export default function AdminUsers() {
  const showToast = useToast();
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch { showToast('Failed to load users', 'error'); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => { setEditing(null); reset({ role: 'recruiter', active: true }); setModalOpen(true); };
  const openEdit = (u) => { setEditing(u); reset({ name: u.name, email: u.email, role: u.role, active: u.active }); setModalOpen(true); };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await api.put(`/admin/users/${editing._id}`, data);
        showToast('User updated', 'success');
      } else {
        if (!data.password) { showToast('Password required for new users', 'error'); return; }
        await api.post('/admin/users', data);
        showToast('User created', 'success');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      showToast('User deactivated', 'success');
      fetchUsers();
    } catch { showToast('Error', 'error'); }
    setDeleteTarget(null);
  };

  const inputCls = 'border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Admin — Users</h1>
        <button onClick={openAdd} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">+ Add User</button>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border-b px-3 py-2">Name</th>
            <th className="border-b px-3 py-2">Email</th>
            <th className="border-b px-3 py-2">Role</th>
            <th className="border-b px-3 py-2">Status</th>
            <th className="border-b px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50">
              <td className="border-b px-3 py-2">{u.name}</td>
              <td className="border-b px-3 py-2">{u.email}</td>
              <td className="border-b px-3 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
              </td>
              <td className="border-b px-3 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.active ? 'Active' : 'Inactive'}</span>
              </td>
              <td className="border-b px-3 py-2">
                <div className="flex gap-2">
                  <button onClick={() => openEdit(u)} className="px-3 py-1.5 rounded text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">Edit</button>
                  <button onClick={() => setDeleteTarget(u)} className="px-3 py-1.5 rounded text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100">Deactivate</button>
                </div>
              </td>
            </tr>
          ))}
          {!users.length && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users found</td></tr>}
        </tbody>
      </table>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input {...register('name', { required: 'Required' })} className={inputCls} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" {...register('email', { required: 'Required' })} className={inputCls} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" {...register('password')} className={inputCls} autoComplete="new-password" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select {...register('role')} className={inputCls}>
              <option value="recruiter">Recruiter</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" {...register('active')} className="rounded" />
            <label htmlFor="active" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} message={`Deactivate user "${deleteTarget?.name}"?`} />
    </div>
  );
}
