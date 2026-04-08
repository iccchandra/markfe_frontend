// ============================================
// pages/admin/SeasonManagement.tsx — SUPER_ADMIN only
// ============================================
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { seasonsAPI } from '../../api/services';
import type { Season } from '../../types/markfed';

export const SeasonManagement: React.FC = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    season_name: '', crop: 'Maize', msp_rate: 2400, go_number: '', go_date: '', total_sanctioned_cr: 0, is_active: true,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const { data } = await seasonsAPI.list(); setSeasons(data); }
      catch { setMessage({ type: 'error', text: 'Failed to load' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ season_name: '', crop: 'Maize', msp_rate: 2400, go_number: '', go_date: '', total_sanctioned_cr: 0, is_active: true });
    setShowModal(true);
  };

  const openEdit = (s: Season) => {
    setEditingId(s.id);
    setForm({
      season_name: s.season_name, crop: s.crop, msp_rate: s.msp_rate, go_number: s.go_number,
      go_date: s.go_date, total_sanctioned_cr: s.total_sanctioned_cr, is_active: s.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.season_name.trim() || !form.go_number.trim()) { setMessage({ type: 'error', text: 'Season name and GO number required' }); return; }
    try {
      if (editingId) {
        const { data } = await seasonsAPI.update(editingId, form);
        setSeasons(seasons.map((s) => (s.id === editingId ? data : s)));
      } else {
        const { data } = await seasonsAPI.create(form);
        setSeasons([...seasons, data]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: editingId ? 'Updated' : 'Created' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed' }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Calendar className="w-7 h-7 text-blue-600" />Season Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage procurement seasons and GO details</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30"><Plus className="w-4 h-4" />Add Season</button>
      </div>

      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Season</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Crop</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">MSP (Rs/Qtl)</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">GO No.</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">GO Date</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">Sanctioned (Cr)</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">Actions</th>
          </tr></thead>
          <tbody>
            {seasons.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.season_name}</td>
                <td className="px-4 py-3">{s.crop}</td>
                <td className="px-4 py-3 text-right font-mono">{s.msp_rate.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">{s.go_number}</td>
                <td className="px-4 py-3">{s.go_date}</td>
                <td className="px-4 py-3 text-right font-mono">{s.total_sanctioned_cr}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3 text-center"><button onClick={() => openEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Season' : 'Add Season'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Season Name</label>
                  <input type="text" value={form.season_name} onChange={(e) => setForm({ ...form, season_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. Vanakalam 2025-26" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                    <input type="text" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MSP Rate (Rs/Qtl)</label>
                    <input type="number" value={form.msp_rate || ''} onChange={(e) => setForm({ ...form, msp_rate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GO Number</label>
                    <input type="text" value={form.go_number} onChange={(e) => setForm({ ...form, go_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. 558" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GO Date</label>
                    <input type="date" value={form.go_date} onChange={(e) => setForm({ ...form, go_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Sanctioned (Cr)</label>
                  <input type="number" value={form.total_sanctioned_cr || ''} onChange={(e) => setForm({ ...form, total_sanctioned_cr: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" step={0.01} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="seasonActive" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300 text-blue-600" />
                  <label htmlFor="seasonActive" className="text-sm text-gray-700">Active Season</label>
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

export default SeasonManagement;
