// ============================================
// pages/procurement/DistrictProductionList.tsx — District Production Data
// DM enters, AO_CAO verifies, MD approves
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, BarChart3, Edit2, Send, CheckCircle, XCircle, ShieldCheck, Eye,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  seasonsAPI, seasonCommoditiesAPI, districtsAPI, districtProductionAPI,
} from '../../api/services';
import { UserRole, num } from '../../types/markfed';

// ─── Status Badge ───────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  draft:            { label: 'Draft',          bg: 'bg-yellow-100', text: 'text-yellow-800' },
  submitted:        { label: 'Submitted',      bg: 'bg-blue-100',   text: 'text-blue-800' },
  dm_verified:      { label: 'DM Verified',    bg: 'bg-orange-100', text: 'text-orange-800' },
  manager_approved: { label: 'Approved',        bg: 'bg-green-100',  text: 'text-green-800' },
  rejected:         { label: 'Rejected',        bg: 'bg-red-100',    text: 'text-red-800' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};

interface ProductionRecord {
  id: number;
  season_commodity_id: number;
  district_id: number;
  district_name?: string;
  sown_area_acres: number;
  yield_per_acre_qtl: number;
  expected_production_qtl: number;
  expected_production_mts: number;
  status: string;
  rejection_reason?: string;
  submitted_at?: string;
  verified_at?: string;
  approved_at?: string;
}

export const DistrictProductionList: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const isDM = user?.role === UserRole.DM;
  const isAOCAO = hasRole(UserRole.AO_CAO);
  const isMDorAdmin = hasRole(UserRole.MD, UserRole.SUPER_ADMIN);
  const canVerify = isAOCAO || hasRole(UserRole.SUPER_ADMIN);
  const canApprove = isMDorAdmin;

  // Selector state
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(0);
  const [seasonCommodities, setSeasonCommodities] = useState<any[]>([]);
  const [selectedScId, setSelectedScId] = useState<number>(0);
  const [districts, setDistricts] = useState<any[]>([]);

  // Data
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Actions
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectModalId, setRejectModalId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // ─── Load records when season-commodity changes ──
  useEffect(() => {
    if (!selectedScId) {
      setRecords([]);
      return;
    }
    const loadRecords = async () => {
      setTableLoading(true);
      try {
        const res = await districtProductionAPI.list(selectedScId);
        const list = Array.isArray(res.data) ? res.data : [];
        setRecords(list);
      } catch {
        setRecords([]);
        setMessage({ type: 'error', text: 'Failed to load production data' });
      } finally {
        setTableLoading(false);
      }
    };
    loadRecords();
  }, [selectedScId]);

  // ─── Summary totals ─────────────────────────────
  const totals = useMemo(() => {
    return records.reduce(
      (acc, r) => ({
        sown: acc.sown + num(r.sown_area_acres),
        prodQtl: acc.prodQtl + num(r.expected_production_qtl),
        prodMts: acc.prodMts + num(r.expected_production_mts),
      }),
      { sown: 0, prodQtl: 0, prodMts: 0 }
    );
  }, [records]);

  // ─── Action handlers ─────────────────────────────
  const handleSubmit = async (recordId: number) => {
    if (!selectedScId) return;
    if (!window.confirm('Submit this production record for verification?')) return;
    setActionLoading(recordId);
    setMessage(null);
    try {
      await districtProductionAPI.submit(selectedScId, recordId);
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, status: 'submitted' } : r))
      );
      setMessage({ type: 'success', text: 'Record submitted for verification' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to submit' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async (recordId: number) => {
    if (!selectedScId) return;
    if (!window.confirm('Verify this production record?')) return;
    setActionLoading(recordId);
    setMessage(null);
    try {
      await districtProductionAPI.verify(selectedScId, recordId);
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, status: 'dm_verified' } : r))
      );
      setMessage({ type: 'success', text: 'Record verified successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to verify' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (recordId: number) => {
    if (!selectedScId) return;
    if (!window.confirm('Approve this production record?')) return;
    setActionLoading(recordId);
    setMessage(null);
    try {
      await districtProductionAPI.approve(selectedScId, recordId);
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, status: 'manager_approved' } : r))
      );
      setMessage({ type: 'success', text: 'Record approved successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to approve' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedScId || !rejectModalId) return;
    if (!rejectReason.trim()) return;
    setActionLoading(rejectModalId);
    setMessage(null);
    try {
      await districtProductionAPI.reject(selectedScId, rejectModalId, rejectReason.trim());
      setRecords((prev) =>
        prev.map((r) => (r.id === rejectModalId ? { ...r, status: 'rejected' } : r))
      );
      setMessage({ type: 'success', text: 'Record rejected' });
      setRejectModalId(null);
      setRejectReason('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reject' });
    } finally {
      setActionLoading(null);
    }
  };

  const getDistrictName = (r: ProductionRecord) =>
    r.district_name || districtMap[r.district_id] || `District #${r.district_id}`;

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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-green-600" />
          District Production Data
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Sown area and expected production estimates by district
        </p>
      </div>

      {/* Season + Commodity Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
      </div>

      {/* Summary Cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Districts</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{records.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Sown Area</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totals.sown.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">acres</span></p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Expected Production</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totals.prodQtl.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">qtl</span></p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Expected Production</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{totals.prodMts.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">MTs</span></p>
          </div>
        </div>
      )}

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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">District</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Sown Area (acres)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Yield/Acre (qtl)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Expected Prod. (qtl)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Expected Prod. (MTs)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tableLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading production data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    {selectedScId
                      ? 'No production data found.'
                      : 'Select a season and commodity to view data.'}
                  </td>
                </tr>
              ) : (
                records.map((record, idx) => {
                  const status = record.status || 'draft';
                  const isActing = actionLoading === record.id;

                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{getDistrictName(record)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{num(record.sown_area_acres).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{num(record.yield_per_acre_qtl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700 font-medium">{num(record.expected_production_qtl).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700 font-medium">{num(record.expected_production_mts).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Edit - DM can edit if draft or rejected */}
                          {isDM && (status === 'draft' || status === 'rejected') && (
                            <button
                              onClick={() => navigate(`/procurement/production/${selectedScId}/${record.district_id}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                          )}

                          {/* View - non-DM or non-editable status */}
                          {(!isDM || (status !== 'draft' && status !== 'rejected')) && (
                            <button
                              onClick={() => navigate(`/procurement/production/${selectedScId}/${record.district_id}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          )}

                          {/* Submit - DM, draft only */}
                          {isDM && status === 'draft' && (
                            <button
                              onClick={() => handleSubmit(record.id)}
                              disabled={isActing}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                              Submit
                            </button>
                          )}

                          {/* Verify - AO_CAO, submitted only */}
                          {canVerify && status === 'submitted' && (
                            <button
                              onClick={() => handleVerify(record.id)}
                              disabled={isActing}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                              Verify
                            </button>
                          )}

                          {/* Approve - MD/SUPER_ADMIN, dm_verified only */}
                          {canApprove && status === 'dm_verified' && (
                            <button
                              onClick={() => handleApprove(record.id)}
                              disabled={isActing}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Approve
                            </button>
                          )}

                          {/* Reject - AO_CAO/MD, submitted or dm_verified */}
                          {(canVerify || canApprove) && (status === 'submitted' || status === 'dm_verified') && (
                            <button
                              onClick={() => { setRejectModalId(record.id); setRejectReason(''); }}
                              disabled={isActing}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Production Data</h3>
            <p className="text-sm text-gray-500 mb-4">
              Provide a reason for rejecting this record
              {(() => {
                const rec = records.find((r) => r.id === rejectModalId);
                return rec ? ` for ${getDistrictName(rec)}` : '';
              })()}.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectModalId(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === rejectModalId}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectModalId && <Loader2 className="w-4 h-4 animate-spin inline mr-1" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictProductionList;
