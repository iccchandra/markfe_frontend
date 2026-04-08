// ============================================
// pages/admin/PACSManagement.tsx — SUPER_ADMIN only
// ============================================
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { pacsAPI, districtsAPI } from '../../api/services';
import type { PACSEntity, District } from '../../types/markfed';

const ENTITY_TYPES = ['PACS', 'DCMS', 'FPO'] as const;

export const PACSManagement: React.FC = () => {
  const [entities, setEntities] = useState<PACSEntity[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [filterDistrict, setFilterDistrict] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', district_id: 0, type: 'PACS' as PACSEntity['type'], is_active: true });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEntities = async (districtId?: number) => {
    try {
      const { data } = await pacsAPI.list(districtId || undefined);
      setEntities(data);
    } catch { /* empty */ }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await districtsAPI.list();
        setDistricts(data);
        await loadEntities();
      } catch { setMessage({ type: 'error', text: 'Failed to load' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => { loadEntities(filterDistrict || undefined); }, [filterDistrict]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', district_id: filterDistrict || 0, type: 'PACS', is_active: true });
    setShowModal(true);
  };

  const openEdit = (e: PACSEntity) => {
    setEditingId(e.id);
    setForm({ name: e.name, district_id: e.district_id, type: e.type, is_active: e.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.district_id) { setMessage({ type: 'error', text: 'Name and district required' }); return; }
    try {
      if (editingId) {
        const { data } = await pacsAPI.update(editingId, form);
        setEntities(entities.map((e) => (e.id === editingId ? data : e)));
      } else {
        const { data } = await pacsAPI.create(form);
        setEntities([...entities, data]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: editingId ? 'Updated' : 'Created' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed' }); }
  };

  const getDistrictName = (id: number) => districts.find((d) => d.id === id)?.name || '';

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Building2 className="w-7 h-7 text-blue-600" />PACS / DCMS / FPO</h1>
          <p className="text-sm text-gray-500 mt-1">Manage procurement entities</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30"><Plus className="w-4 h-4" />Add Entity</button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select value={filterDistrict} onChange={(e) => setFilterDistrict(parseInt(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
          <option value={0}>All Districts</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
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
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">District</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">Actions</th>
          </tr></thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.type === 'PACS' ? 'bg-blue-100 text-blue-700' : e.type === 'DCMS' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>{e.type}</span></td>
                <td className="px-4 py-3 text-gray-600">{getDistrictName(e.district_id)}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{e.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3 text-center"><button onClick={() => openEdit(e)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button></td>
              </tr>
            ))}
            {entities.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No entities found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Entity' : 'Add Entity'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PACSEntity['type'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <select value={form.district_id || ''} onChange={(e) => setForm({ ...form, district_id: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="">Select District</option>
                    {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
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

export default PACSManagement;
