// ============================================
// pages/admin/GodownsManagement.tsx — SUPER_ADMIN only
// ============================================
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, CheckCircle, AlertCircle, Warehouse } from 'lucide-react';
import { godownsAPI, districtsAPI } from '../../api/services';

interface District {
  id: number;
  name: string;
}

interface Godown {
  id: number;
  godown_name: string;
  godown_type: string;
  district_id: number;
  district_name?: string;
  district?: { name: string };
  capacity_mts: number;
  agreement_date: string;
  address: string;
  is_active: boolean;
}

const GODOWN_TYPE_OPTIONS = [
  { value: 'CWC', label: 'CWC' },
  { value: 'TGSWC', label: 'TGSWC' },
  { value: 'markfed_hired', label: 'Markfed Hired' },
  { value: 'amc_hired', label: 'AMC Hired' },
];

export const GodownsManagement: React.FC = () => {
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    godown_name: '',
    godown_type: 'CWC',
    district_id: 0,
    capacity_mts: 0,
    agreement_date: '',
    address: '',
    is_active: true,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [godownsRes, districtsRes] = await Promise.all([
          godownsAPI.list(),
          districtsAPI.list(),
        ]);
        setGodowns(Array.isArray(godownsRes.data) ? godownsRes.data : (godownsRes.data as any)?.data || []);
        setDistricts(Array.isArray(districtsRes.data) ? districtsRes.data : (districtsRes.data as any)?.data || []);
      } catch { setMessage({ type: 'error', text: 'Failed to load data' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const getDistrictName = (g: Godown) => {
    if (g.district_name) return g.district_name;
    if (g.district?.name) return g.district.name;
    const found = districts.find((d) => d.id === g.district_id);
    return found?.name || '-';
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ godown_name: '', godown_type: 'CWC', district_id: districts.length > 0 ? districts[0].id : 0, capacity_mts: 0, agreement_date: '', address: '', is_active: true });
    setShowModal(true);
  };

  const openEdit = (g: Godown) => {
    setEditingId(g.id);
    setForm({
      godown_name: g.godown_name,
      godown_type: g.godown_type,
      district_id: g.district_id,
      capacity_mts: g.capacity_mts || 0,
      agreement_date: g.agreement_date || '',
      address: g.address || '',
      is_active: g.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.godown_name.trim()) { setMessage({ type: 'error', text: 'Godown name is required' }); return; }
    if (!form.district_id) { setMessage({ type: 'error', text: 'District is required' }); return; }
    try {
      if (editingId) {
        const { data } = await godownsAPI.update(editingId, form);
        setGodowns(godowns.map((g) => (g.id === editingId ? data : g)));
      } else {
        const { data } = await godownsAPI.create(form);
        setGodowns([...godowns, data]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: editingId ? 'Godown updated' : 'Godown created' });
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Warehouse className="w-7 h-7 text-blue-600" />Godowns Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage godown/warehouse master data</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30"><Plus className="w-4 h-4" />Add Godown</button>
      </div>

      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">District</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Capacity (MTs)</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Agreement Date</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Active</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">Actions</th>
            </tr></thead>
            <tbody>
              {godowns.map((g) => (
                <tr key={g.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{g.godown_name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {GODOWN_TYPE_OPTIONS.find((o) => o.value === g.godown_type)?.label || g.godown_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getDistrictName(g)}</td>
                  <td className="px-4 py-3 text-right font-mono">{g.capacity_mts?.toLocaleString('en-IN') || '-'}</td>
                  <td className="px-4 py-3">{g.agreement_date || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${g.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{g.is_active ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(g)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {godowns.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No godowns found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Godown' : 'Add Godown'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Godown Name</label>
                  <input type="text" value={form.godown_name} onChange={(e) => setForm({ ...form, godown_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. CWC Warehouse Hyderabad" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Godown Type</label>
                    <select value={form.godown_type} onChange={(e) => setForm({ ...form, godown_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                      {GODOWN_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <select value={form.district_id} onChange={(e) => setForm({ ...form, district_id: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                      <option value={0}>-- Select --</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (MTs)</label>
                    <input type="number" value={form.capacity_mts || ''} onChange={(e) => setForm({ ...form, capacity_mts: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agreement Date</label>
                    <input type="date" value={form.agreement_date} onChange={(e) => setForm({ ...form, agreement_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Full address" />
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

export default GodownsManagement;
