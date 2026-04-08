// ============================================
// pages/admin/UserManagement.tsx — SUPER_ADMIN only
// ============================================
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, UserX, Key, CheckCircle, AlertCircle, UserCog } from 'lucide-react';
import { usersAPI, districtsAPI } from '../../api/services';
import type { User, District } from '../../types/markfed';
import { UserRole } from '../../types/markfed';

const ROLES = [
  { value: UserRole.SUPER_ADMIN, label: 'Super Admin' },
  { value: UserRole.MD, label: 'MD' },
  { value: UserRole.AO_CAO, label: 'AO / CAO' },
  { value: UserRole.DM, label: 'District Manager' },
];

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  district_id: number | null;
  is_active: boolean;
}

const emptyForm: UserForm = { name: '', email: '', password: '', role: UserRole.DM, district_id: null, is_active: true };

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, distRes] = await Promise.all([usersAPI.list(), districtsAPI.list()]);
        setUsers(usersRes.data);
        setDistricts(distRes.data);
      } catch {
        setMessage({ type: 'error', text: 'Failed to load users' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      district_id: user.district_id,
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setMessage({ type: 'error', text: 'Name and email are required' });
      return;
    }
    if (!editingId && form.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    if (form.role === UserRole.DM && !form.district_id) {
      setMessage({ type: 'error', text: 'District is required for DM role' });
      return;
    }

    try {
      if (editingId) {
        const { data } = await usersAPI.update(editingId, {
          name: form.name,
          email: form.email,
          role: form.role,
          district_id: form.role === UserRole.DM ? form.district_id : null,
          is_active: form.is_active,
        });
        setUsers(users.map((u) => (u.id === editingId ? data : u)));
      } else {
        const { data } = await usersAPI.create({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          district_id: form.role === UserRole.DM ? form.district_id : null,
          is_active: form.is_active,
        });
        setUsers([...users, data]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: editingId ? 'User updated' : 'User created' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save user' });
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await usersAPI.deactivate(id);
      setUsers(users.map((u) => (u.id === id ? { ...u, is_active: false } : u)));
    } catch {
      setMessage({ type: 'error', text: 'Failed to deactivate' });
    }
  };

  const handleResetPassword = async (id: number) => {
    if (!window.confirm('Send password reset link?')) return;
    try {
      await usersAPI.resetPassword(id);
      setMessage({ type: 'success', text: 'Password reset link sent' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to send reset link' });
    }
  };

  const getDistrictName = (user: User) => {
    // Backend returns nested district object
    if ((user as any)?.district?.name) return (user as any).district.name;
    if (!user.district_id) return '--';
    return districts.find((d) => d.id === user.district_id)?.name || '--';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <UserCog className="w-7 h-7 text-blue-600" />
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage portal users</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">District</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    u.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-700' :
                    u.role === UserRole.MD ? 'bg-blue-100 text-blue-700' :
                    u.role === UserRole.AO_CAO ? 'bg-cyan-100 text-cyan-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {ROLES.find((r) => r.value === u.role)?.label || u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{getDistrictName(u)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleResetPassword(u.id)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" title="Reset Password">
                      <Key className="w-4 h-4" />
                    </button>
                    {u.is_active && (
                      <button onClick={() => handleDeactivate(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Deactivate">
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {editingId ? 'Edit User' : 'Add New User'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 8 characters"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                {form.role === UserRole.DM && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <select value={form.district_id || ''} onChange={(e) => setForm({ ...form, district_id: parseInt(e.target.value) || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                      <option value="">Select District</option>
                      {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="active" className="text-sm text-gray-700">Active</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
