// ============================================
// pages/admin/CommoditiesManagement.tsx — SUPER_ADMIN only
// ============================================
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, CheckCircle, AlertCircle, Wheat } from 'lucide-react';
import { commoditiesAPI } from '../../api/services';

interface Commodity {
  id: number;
  name: string;
  code: string;
  category: string;
  is_active: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'cereal', label: 'Cereal' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'oilseed', label: 'Oilseed' },
];

export const CommoditiesManagement: React.FC = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', code: '', category: 'cereal', is_active: true });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await commoditiesAPI.list();
        setCommodities(Array.isArray(data) ? data : (data as any)?.data || []);
      } catch { setMessage({ type: 'error', text: 'Failed to load commodities' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', code: '', category: 'cereal', is_active: true });
    setShowModal(true);
  };

  const openEdit = (c: Commodity) => {
    setEditingId(c.id);
    setForm({ name: c.name, code: c.code, category: c.category || 'cereal', is_active: c.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setMessage({ type: 'error', text: 'Name is required' }); return; }
    if (!form.code.trim()) { setMessage({ type: 'error', text: 'Code is required' }); return; }
    try {
      if (editingId) {
        const { data } = await commoditiesAPI.update(editingId, form);
        setCommodities(commodities.map((c) => (c.id === editingId ? data : c)));
      } else {
        const { data } = await commoditiesAPI.create(form);
        setCommodities([...commodities, data]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: editingId ? 'Commodity updated' : 'Commodity created' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save' }); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Wheat className="w-7 h-7 text-blue-600" />Commodities Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage commodities for procurement seasons</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30"><Plus className="w-4 h-4" />Add Commodity</button>
      </div>

      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">#</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Code</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-600">Active</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">Actions</th>
          </tr></thead>
          <tbody>
            {commodities.map((c, idx) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono text-gray-600">{c.code}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 capitalize">{c.category}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.is_active ? 'Yes' : 'No'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {commodities.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No commodities found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Commodity' : 'Add Commodity'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. Paddy (Common)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. PADDY" maxLength={20} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700">Active</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
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

export default CommoditiesManagement;
