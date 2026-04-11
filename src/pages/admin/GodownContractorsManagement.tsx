// ============================================
// pages/admin/GodownContractorsManagement.tsx — SUPER_ADMIN only
// ============================================
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, CheckCircle, AlertCircle, Link2 } from 'lucide-react';
import { godownContractorsAPI, godownsAPI, htContractorsAPI, seasonsAPI } from '../../api/services';

interface Season {
  id: number;
  season_name: string;
  is_active: boolean;
}

interface Godown {
  id: number;
  godown_name: string;
}

interface Contractor {
  id: number;
  firm_name: string;
  contractor_name: string;
}

interface GodownContractor {
  id: number;
  godown_id: number;
  contractor_id: number;
  season_id: number;
  assigned_date: string;
  godown_name?: string;
  godown?: { godown_name: string };
  contractor_firm?: string;
  contractor?: { firm_name: string };
  season_name?: string;
}

export const GodownContractorsManagement: React.FC = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [assignments, setAssignments] = useState<GodownContractor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    godown_id: 0,
    contractor_id: 0,
    assigned_date: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load reference data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [seasonsRes, godownsRes, contractorsRes] = await Promise.all([
          seasonsAPI.list(),
          godownsAPI.list(),
          htContractorsAPI.list(),
        ]);
        const seasonsList = Array.isArray(seasonsRes.data) ? seasonsRes.data : (seasonsRes.data as any)?.data || [];
        setSeasons(seasonsList);
        setGodowns(Array.isArray(godownsRes.data) ? godownsRes.data : (godownsRes.data as any)?.data || []);
        setContractors(Array.isArray(contractorsRes.data) ? contractorsRes.data : (contractorsRes.data as any)?.data || []);
        // Auto-select active season
        const activeSeason = seasonsList.find((s: Season) => s.is_active);
        if (activeSeason) setSelectedSeasonId(activeSeason.id);
        else if (seasonsList.length > 0) setSelectedSeasonId(seasonsList[0].id);
      } catch { setMessage({ type: 'error', text: 'Failed to load reference data' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Load assignments when season changes
  useEffect(() => {
    if (!selectedSeasonId) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await godownContractorsAPI.list(selectedSeasonId);
        setAssignments(Array.isArray(data) ? data : (data as any)?.data || []);
      } catch { setMessage({ type: 'error', text: 'Failed to load assignments' }); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedSeasonId]);

  const getGodownName = (gc: GodownContractor) => {
    if (gc.godown_name) return gc.godown_name;
    if (gc.godown?.godown_name) return gc.godown.godown_name;
    const found = godowns.find((g) => g.id === gc.godown_id);
    return found?.godown_name || `Godown #${gc.godown_id}`;
  };

  const getContractorFirm = (gc: GodownContractor) => {
    if (gc.contractor_firm) return gc.contractor_firm;
    if (gc.contractor?.firm_name) return gc.contractor.firm_name;
    const found = contractors.find((c) => c.id === gc.contractor_id);
    return found?.firm_name || `Contractor #${gc.contractor_id}`;
  };

  const getSeasonName = (gc: GodownContractor) => {
    if (gc.season_name) return gc.season_name;
    const found = seasons.find((s) => s.id === gc.season_id);
    return found?.season_name || '-';
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({
      godown_id: godowns.length > 0 ? godowns[0].id : 0,
      contractor_id: contractors.length > 0 ? contractors[0].id : 0,
      assigned_date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openEdit = (gc: GodownContractor) => {
    setEditingId(gc.id);
    setForm({
      godown_id: gc.godown_id,
      contractor_id: gc.contractor_id,
      assigned_date: gc.assigned_date || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedSeasonId) return;
    if (!form.godown_id) { setMessage({ type: 'error', text: 'Godown is required' }); return; }
    if (!form.contractor_id) { setMessage({ type: 'error', text: 'Contractor is required' }); return; }
    try {
      if (editingId) {
        const { data } = await godownContractorsAPI.update(selectedSeasonId, editingId, form);
        setAssignments(assignments.map((a) => (a.id === editingId ? data : a)));
      } else {
        const { data } = await godownContractorsAPI.create(selectedSeasonId, form);
        setAssignments([...assignments, data]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: editingId ? 'Assignment updated' : 'Assignment created' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save' }); }
  };

  if (loading && seasons.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Link2 className="w-7 h-7 text-blue-600" />Godown-Contractor Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Assign H&T contractors to godowns for each season</p>
        </div>
        <button onClick={openAdd} disabled={!selectedSeasonId} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 disabled:opacity-50"><Plus className="w-4 h-4" />Add Assignment</button>
      </div>

      {/* Season Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Season</label>
        <select
          value={selectedSeasonId || ''}
          onChange={(e) => setSelectedSeasonId(Number(e.target.value) || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[250px]"
        >
          <option value="">-- Select Season --</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>{s.season_name}{s.is_active ? ' (Active)' : ''}</option>
          ))}
        </select>
      </div>

      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message.text}
        </div>
      )}

      {selectedSeasonId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Godown Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Contractor Firm</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Season</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Assigned Date</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : assignments.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No assignments for this season</td></tr>
              ) : assignments.map((gc) => (
                <tr key={gc.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{getGodownName(gc)}</td>
                  <td className="px-4 py-3">{getContractorFirm(gc)}</td>
                  <td className="px-4 py-3">{getSeasonName(gc)}</td>
                  <td className="px-4 py-3">{gc.assigned_date || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(gc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Assignment' : 'Add Assignment'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Godown</label>
                  <select value={form.godown_id} onChange={(e) => setForm({ ...form, godown_id: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value={0}>-- Select Godown --</option>
                    {godowns.map((g) => (
                      <option key={g.id} value={g.id}>{g.godown_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contractor</label>
                  <select value={form.contractor_id} onChange={(e) => setForm({ ...form, contractor_id: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value={0}>-- Select Contractor --</option>
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>{c.firm_name} ({c.contractor_name})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Date</label>
                  <input type="date" value={form.assigned_date} onChange={(e) => setForm({ ...form, assigned_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
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

export default GodownContractorsManagement;
