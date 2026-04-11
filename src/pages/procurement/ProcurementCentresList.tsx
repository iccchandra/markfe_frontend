// ============================================
// pages/procurement/ProcurementCentresList.tsx — Procurement Centres Management
// Season + Commodity selector, table of centres, Add/Edit modal
// ============================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2, Plus, Edit2, Trash2, MapPin, CheckCircle, XCircle, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  seasonsAPI, seasonCommoditiesAPI, districtsAPI, procurementCentresAPI,
} from '../../api/services';
import { UserRole } from '../../types/markfed';

// ─── Types ──────────────────────────────────────
interface ProcurementCentre {
  id: number;
  season_commodity_id: number;
  district_id: number;
  district_name?: string;
  centre_name: string;
  centre_type: 'PACS' | 'DCMS' | 'FPO';
  is_proposed: boolean;
  is_opened: boolean;
  opened_date: string | null;
  closed_date: string | null;
}

interface FormData {
  centre_name: string;
  centre_type: 'PACS' | 'DCMS' | 'FPO';
  district_id: number;
  is_proposed: boolean;
  is_opened: boolean;
  opened_date: string;
  closed_date: string;
}

const emptyForm: FormData = {
  centre_name: '',
  centre_type: 'PACS',
  district_id: 0,
  is_proposed: false,
  is_opened: false,
  opened_date: '',
  closed_date: '',
};

export const ProcurementCentresList: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isDM = user?.role === UserRole.DM;
  const isSuperAdmin = hasRole(UserRole.SUPER_ADMIN);
  const canAdd = isDM || isSuperAdmin;

  // Selector state
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(0);
  const [seasonCommodities, setSeasonCommodities] = useState<any[]>([]);
  const [selectedScId, setSelectedScId] = useState<number>(0);
  const [districts, setDistricts] = useState<any[]>([]);
  const [districtFilter, setDistrictFilter] = useState<number>(0);

  // Data
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // District name map
  const districtMap = useMemo(() => {
    const map: Record<number, string> = {};
    districts.forEach((d) => { map[d.id] = d.name; });
    return map;
  }, [districts]);

  // ─── Initial load ────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, distRes] = await Promise.all([
          seasonsAPI.list(),
          districtsAPI.list(),
        ]);
        const seasonList = seasonRes.data;
        setSeasons(seasonList);
        setDistricts(distRes.data);

        // Select active season by default
        const active = seasonList.find((s: any) => s.is_active) || seasonList[0];
        if (active) {
          setSelectedSeasonId(active.id);
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load initial data' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Load season-commodities when season changes ─
  useEffect(() => {
    if (!selectedSeasonId) {
      setSeasonCommodities([]);
      setSelectedScId(0);
      return;
    }
    const loadSC = async () => {
      try {
        const res = await seasonCommoditiesAPI.list(selectedSeasonId);
        const list = Array.isArray(res.data) ? res.data : [];
        setSeasonCommodities(list);
        if (list.length > 0) {
          setSelectedScId(list[0].id);
        } else {
          setSelectedScId(0);
        }
      } catch {
        setSeasonCommodities([]);
        setSelectedScId(0);
      }
    };
    loadSC();
  }, [selectedSeasonId]);

  // ─── Load centres when season-commodity changes ──
  useEffect(() => {
    if (!selectedScId) {
      setCentres([]);
      return;
    }
    const loadCentres = async () => {
      setTableLoading(true);
      try {
        const res = await procurementCentresAPI.list(selectedScId);
        const list = Array.isArray(res.data) ? res.data : [];
        setCentres(list);
      } catch {
        setCentres([]);
        setMessage({ type: 'error', text: 'Failed to load procurement centres' });
      } finally {
        setTableLoading(false);
      }
    };
    loadCentres();
  }, [selectedScId]);

  // ─── Filtered centres ────────────────────────────
  const filteredCentres = useMemo(() => {
    if (!districtFilter) return centres;
    return centres.filter((c) => c.district_id === districtFilter);
  }, [centres, districtFilter]);

  // ─── Formatters ──────────────────────────────────
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ─── Modal handlers ──────────────────────────────
  const openAddModal = useCallback(() => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      district_id: isDM && user?.district_id ? user.district_id : 0,
    });
    setShowModal(true);
  }, [isDM, user]);

  const openEditModal = useCallback((centre: ProcurementCentre) => {
    setEditingId(centre.id);
    setForm({
      centre_name: centre.centre_name,
      centre_type: centre.centre_type,
      district_id: centre.district_id,
      is_proposed: centre.is_proposed,
      is_opened: centre.is_opened,
      opened_date: centre.opened_date || '',
      closed_date: centre.closed_date || '',
    });
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }, []);

  const handleFormChange = useCallback((field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    if (!selectedScId) return;
    if (!form.centre_name.trim()) {
      setMessage({ type: 'error', text: 'Centre name is required' });
      return;
    }
    if (!form.district_id) {
      setMessage({ type: 'error', text: 'Please select a district' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        centre_name: form.centre_name.trim(),
        centre_type: form.centre_type,
        district_id: form.district_id,
        is_proposed: form.is_proposed,
        is_opened: form.is_opened,
        opened_date: form.opened_date || null,
        closed_date: form.closed_date || null,
      };

      if (editingId) {
        const res = await procurementCentresAPI.update(selectedScId, editingId, payload);
        setCentres((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...res.data } : c))
        );
        setMessage({ type: 'success', text: 'Centre updated successfully' });
      } else {
        const res = await procurementCentresAPI.create(selectedScId, payload);
        setCentres((prev) => [...prev, res.data]);
        setMessage({ type: 'success', text: 'Centre added successfully' });
      }
      closeModal();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save centre' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (centreId: number) => {
    if (!selectedScId) return;
    if (!window.confirm('Delete this procurement centre? This cannot be undone.')) return;
    setActionLoading(centreId);
    setMessage(null);
    try {
      await procurementCentresAPI.delete(selectedScId, centreId);
      setCentres((prev) => prev.filter((c) => c.id !== centreId));
      setMessage({ type: 'success', text: 'Centre deleted' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to delete centre' });
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Render ──────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="w-7 h-7 text-green-600" />
            Procurement Centres
          </h1>
          {canAdd && selectedScId > 0 && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/30 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Centre
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Manage procurement centres for the selected season and commodity
        </p>
      </div>

      {/* Season + Commodity Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
          <select
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value={0}>-- Select Season --</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.season_name} {s.is_active ? '(Active)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
          <select
            value={selectedScId}
            onChange={(e) => setSelectedScId(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={seasonCommodities.length === 0}
          >
            <option value={0}>-- Select Commodity --</option>
            {seasonCommodities.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.commodity?.name || sc.commodity_name || `Commodity #${sc.commodity_id}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by District</label>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value={0}>All Districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Centre Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">District</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Proposed?</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Opened?</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Opened Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Closed Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tableLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading centres...
                  </td>
                </tr>
              ) : filteredCentres.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    {selectedScId
                      ? 'No procurement centres found. Click "Add Centre" to create one.'
                      : 'Select a season and commodity to view centres.'}
                  </td>
                </tr>
              ) : (
                filteredCentres.map((centre, idx) => (
                  <tr key={centre.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{centre.centre_name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {centre.centre_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {centre.district_name || districtMap[centre.district_id] || `#${centre.district_id}`}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {centre.is_proposed ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {centre.is_opened ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(centre.opened_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(centre.closed_date)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(centre)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(centre.id)}
                          disabled={actionLoading === centre.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {actionLoading === centre.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Centre' : 'Add Procurement Centre'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Centre Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Centre Name</label>
                <input
                  type="text"
                  value={form.centre_name}
                  onChange={(e) => handleFormChange('centre_name', e.target.value)}
                  placeholder="Enter centre name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.centre_type}
                  onChange={(e) => handleFormChange('centre_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="PACS">PACS</option>
                  <option value="DCMS">DCMS</option>
                  <option value="FPO">FPO</option>
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                {isDM && user?.district_id ? (
                  <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-semibold text-green-700">
                      {districtMap[user.district_id] || user.district_name || `District #${user.district_id}`}
                    </span>
                  </div>
                ) : (
                  <select
                    value={form.district_id}
                    onChange={(e) => handleFormChange('district_id', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value={0}>-- Select District --</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_proposed}
                    onChange={(e) => handleFormChange('is_proposed', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Proposed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_opened}
                    onChange={(e) => handleFormChange('is_opened', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Opened</span>
                </label>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opened Date</label>
                  <input
                    type="date"
                    value={form.opened_date}
                    onChange={(e) => handleFormChange('opened_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closed Date</label>
                  <input
                    type="date"
                    value={form.closed_date}
                    onChange={(e) => handleFormChange('closed_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update' : 'Add Centre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementCentresList;
