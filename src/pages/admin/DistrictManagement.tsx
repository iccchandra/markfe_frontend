// ============================================
// pages/admin/DistrictManagement.tsx — SUPER_ADMIN only
// ============================================
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { districtsAPI } from '../../api/services';
import type { District } from '../../types/markfed';

export const DistrictManagement: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', code: '', is_active: true });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await districtsAPI.list();
        setDistricts(data);
      } catch { setMessage({ type: 'error', text: 'Failed to load' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const openAdd = () => { setEditingId(null); setForm({ name: '', code: '', is_active: true }); setShowModal(true); };
  const openEdit = (d: District) => { setEditingId(d.id); setForm({ name: d.name, code: d.code, is_active: d.is_active }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) { setMessage({ type: 'error', text: 'Name and code required' }); return; }
    try {
      if (editingId) {
        const { data } = await districtsAPI.update(editingId, form);
        setDistricts(districts.map((d) => (d.id === editingId ? data : d)));
      } else {
        const { data } = await districtsAPI.create(form);
        setDistricts([...districts, data]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: editingId ? 'Updated' : 'Created' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed' }); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><MapPin className="w-7 h-7 text-blue-600" />District Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage procurement districts</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30"><Plus className="w-4 h-4" />Add District</button>
      </div>

      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Code</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">Actions</th>
          </tr></thead>
          <tbody>
            {districts.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 font-mono text-gray-600">{d.code}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.is_active ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => openEdit(d)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit District' : 'Add District'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. Nalgonda" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. NLG" maxLength={10} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DistrictManagement;
