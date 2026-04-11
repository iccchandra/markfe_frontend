// ============================================
// pages/admin/SeasonCommoditiesManagement.tsx — SUPER_ADMIN only
// ============================================
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, CheckCircle, AlertCircle, Layers } from 'lucide-react';
import { seasonCommoditiesAPI, seasonsAPI, commoditiesAPI } from '../../api/services';

interface Season {
  id: number;
  season_name: string;
  is_active: boolean;
}

interface Commodity {
  id: number;
  name: string;
  code: string;
}

interface SeasonCommodity {
  id: number;
  season_id: number;
  commodity_id: number;
  commodity_name?: string;
  commodity?: { name: string; code: string };
  msp_rate: number;
  funding_source: string;
  procurement_start_date: string;
  procurement_end_date: string;
  status: string;
  allotted_qty_goi: number;
  allotted_qty_state: number;
}

const FUNDING_OPTIONS = [
  { value: 'goi', label: 'GOI' },
  { value: 'state_pool', label: 'State Pool' },
  { value: 'goi_and_state', label: 'GOI & State' },
];

const STATUS_BADGE: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not Started',
  active: 'Active',
  closed: 'Closed',
};

export const SeasonCommoditiesManagement: React.FC = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [seasonCommodities, setSeasonCommodities] = useState<SeasonCommodity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    commodity_id: 0,
    msp_rate: 0,
    funding_source: 'goi',
    procurement_start_date: '',
    procurement_end_date: '',
    status: 'not_started',
    allotted_qty_goi: 0,
    allotted_qty_state: 0,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load seasons and commodities on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [seasonsRes, commoditiesRes] = await Promise.all([
          seasonsAPI.list(),
          commoditiesAPI.list(),
        ]);
        const seasonsList = Array.isArray(seasonsRes.data) ? seasonsRes.data : (seasonsRes.data as any)?.data || [];
        const commoditiesList = Array.isArray(commoditiesRes.data) ? commoditiesRes.data : (commoditiesRes.data as any)?.data || [];
        setSeasons(seasonsList);
        setCommodities(commoditiesList);
        // Auto-select active season
        const activeSeason = seasonsList.find((s: Season) => s.is_active);
        if (activeSeason) setSelectedSeasonId(activeSeason.id);
        else if (seasonsList.length > 0) setSelectedSeasonId(seasonsList[0].id);
      } catch { setMessage({ type: 'error', text: 'Failed to load seasons' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Load season commodities when season changes
  useEffect(() => {
    if (!selectedSeasonId) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await seasonCommoditiesAPI.list(selectedSeasonId);
        setSeasonCommodities(Array.isArray(data) ? data : (data as any)?.data || []);
      } catch { setMessage({ type: 'error', text: 'Failed to load season commodities' }); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedSeasonId]);

  const getCommodityName = (sc: SeasonCommodity) => {
    if (sc.commodity_name) return sc.commodity_name;
    if (sc.commodity?.name) return sc.commodity.name;
    const found = commodities.find((c) => c.id === sc.commodity_id);
    return found?.name || `ID ${sc.commodity_id}`;
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({
      commodity_id: commodities.length > 0 ? commodities[0].id : 0,
      msp_rate: 0,
      funding_source: 'goi',
      procurement_start_date: '',
      procurement_end_date: '',
      status: 'not_started',
      allotted_qty_goi: 0,
      allotted_qty_state: 0,
    });
    setShowModal(true);
  };

  const openEdit = (sc: SeasonCommodity) => {
    setEditingId(sc.id);
    setForm({
      commodity_id: sc.commodity_id,
      msp_rate: sc.msp_rate,
      funding_source: sc.funding_source || 'goi',
      procurement_start_date: sc.procurement_start_date || '',
      procurement_end_date: sc.procurement_end_date || '',
      status: sc.status || 'not_started',
      allotted_qty_goi: sc.allotted_qty_goi || 0,
      allotted_qty_state: sc.allotted_qty_state || 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedSeasonId) return;
    if (!form.commodity_id) { setMessage({ type: 'error', text: 'Commodity is required' }); return; }
    try {
      const payload = { ...form };
      if (editingId) {
        const { data } = await seasonCommoditiesAPI.update(selectedSeasonId, editingId, payload);
        setSeasonCommodities(seasonCommodities.map((sc) => (sc.id === editingId ? data : sc)));
      } else {
        const { data } = await seasonCommoditiesAPI.create(selectedSeasonId, payload);
        setSeasonCommodities([...seasonCommodities, data]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: editingId ? 'Updated' : 'Created' });
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Layers className="w-7 h-7 text-blue-600" />Season Commodities</h1>
          <p className="text-sm text-gray-500 mt-1">Manage commodities, MSP rates, and procurement targets per season</p>
        </div>
        <button onClick={openAdd} disabled={!selectedSeasonId} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 disabled:opacity-50"><Plus className="w-4 h-4" />Add Season Commodity</button>
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Commodity</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">MSP Rate</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Funding Source</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Start Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">End Date</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Allotted GOI</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Allotted State</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">Actions</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                ) : seasonCommodities.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No commodities configured for this season</td></tr>
                ) : seasonCommodities.map((sc) => (
                  <tr key={sc.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{getCommodityName(sc)}</td>
                    <td className="px-4 py-3 text-right font-mono">{sc.msp_rate?.toLocaleString('en-IN') || '-'}</td>
                    <td className="px-4 py-3">
                      {FUNDING_OPTIONS.find((f) => f.value === sc.funding_source)?.label || sc.funding_source || '-'}
                    </td>
                    <td className="px-4 py-3">{sc.procurement_start_date || '-'}</td>
                    <td className="px-4 py-3">{sc.procurement_end_date || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[sc.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABEL[sc.status] || sc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{sc.allotted_qty_goi?.toLocaleString('en-IN') || '0'}</td>
                    <td className="px-4 py-3 text-right font-mono">{sc.allotted_qty_state?.toLocaleString('en-IN') || '0'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openEdit(sc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Season Commodity' : 'Add Season Commodity'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
                  <select value={form.commodity_id} onChange={(e) => setForm({ ...form, commodity_id: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value={0}>-- Select Commodity --</option>
                    {commodities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MSP Rate (Rs/Qtl)</label>
                    <input type="number" value={form.msp_rate || ''} onChange={(e) => setForm({ ...form, msp_rate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Funding Source</label>
                    <select value={form.funding_source} onChange={(e) => setForm({ ...form, funding_source: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                      {FUNDING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Procurement Start Date</label>
                    <input type="date" value={form.procurement_start_date} onChange={(e) => setForm({ ...form, procurement_start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Procurement End Date</label>
                    <input type="date" value={form.procurement_end_date} onChange={(e) => setForm({ ...form, procurement_end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="not_started">Not Started</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allotted Qty (GOI) MTs</label>
                    <input type="number" value={form.allotted_qty_goi || ''} onChange={(e) => setForm({ ...form, allotted_qty_goi: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allotted Qty (State) MTs</label>
                    <input type="number" value={form.allotted_qty_state || ''} onChange={(e) => setForm({ ...form, allotted_qty_state: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
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

export default SeasonCommoditiesManagement;
