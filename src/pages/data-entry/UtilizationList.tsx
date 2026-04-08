// ============================================
// pages/data-entry/UtilizationList.tsx — Fund Utilization List Page
// Shows all districts with utilization status, navigates to form
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Loader2, Plus, Eye, Edit2, CheckCircle, XCircle, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { seasonsAPI, districtsAPI, utilizationAPI, drawdownsAPI } from '../../api/services';
import type { Season, District, DistrictUtilization, DistrictDrawdown } from '../../types/markfed';
import { UserRole, formatAmount, num, ApprovalStatus, calcTotalUtilization } from '../../types/markfed';

// ─── Status Badge ────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  draft:     { label: 'Draft',     bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-300' },
  submitted: { label: 'Submitted', bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-300' },
  approved:  { label: 'Approved',  bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-300' },
  rejected:  { label: 'Rejected',  bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-300' },
  pending:   { label: 'Pending',   bg: 'bg-gray-100',   text: 'text-gray-500',   border: 'border-gray-300' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

// ─── Row type ────────────────────────────────────
interface DistrictRow {
  districtId: number;
  districtName: string;
  totalUtilized: number;
  fundsReceived: number;
  balance: number;
  status: string; // ApprovalStatus | 'pending'
  utilizationRecord: DistrictUtilization | null;
}

export const UtilizationList: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const canApprove = hasRole(UserRole.AO_CAO, UserRole.MD, UserRole.SUPER_ADMIN);

  // Data
  const [season, setSeason] = useState<Season | null>(null);
  const [rows, setRows] = useState<DistrictRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Approve/Reject state
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectModalDistrictId, setRejectModalDistrictId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDistrictId, setAddDistrictId] = useState<number>(0);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, distRes] = await Promise.all([
          seasonsAPI.active(),
          districtsAPI.list(),
        ]);

        const activeSeason = seasonRes.data;
        const districts: District[] = distRes.data;
        setSeason(activeSeason);
        setAllDistricts(districts);

        // Load utilization and drawdown data
        const [utilRes, ddRes] = await Promise.allSettled([
          utilizationAPI.listAll(activeSeason.id),
          drawdownsAPI.list(activeSeason.id),
        ]);

        // Parse utilization records (may be paginated)
        let utilRecords: DistrictUtilization[] = [];
        if (utilRes.status === 'fulfilled') {
          const raw = utilRes.value.data;
          utilRecords = Array.isArray(raw) ? raw : (raw as any)?.data || [];
        }

        // Parse drawdowns (may be paginated)
        let drawdowns: DistrictDrawdown[] = [];
        if (ddRes.status === 'fulfilled') {
          const raw = ddRes.value.data;
          drawdowns = Array.isArray(raw) ? raw : (raw as any)?.data || [];
        }

        // Build a map: district_id -> sum of drawdowns
        const fundsReceivedMap: Record<number, number> = {};
        drawdowns.forEach((dd) => {
          const did = dd.district_id;
          fundsReceivedMap[did] = (fundsReceivedMap[did] || 0) + num(dd.amount_withdrawn_rs);
        });

        // Build a map: district_id -> utilization record
        const utilMap: Record<number, DistrictUtilization> = {};
        utilRecords.forEach((u) => {
          utilMap[u.district_id] = u;
        });

        // Filter districts for DM users
        const visibleDistricts = user?.role === UserRole.DM && user.district_id
          ? districts.filter((d) => d.id === user.district_id)
          : districts;

        // Build rows
        const builtRows: DistrictRow[] = visibleDistricts.map((d) => {
          const utilRecord = utilMap[d.id] || null;
          const totalUtilized = utilRecord ? calcTotalUtilization(utilRecord) : 0;
          const fundsReceived = fundsReceivedMap[d.id] || 0;
          const balance = fundsReceived - totalUtilized;
          const status = utilRecord?.status || 'pending';

          return {
            districtId: d.id,
            districtName: d.name,
            totalUtilized,
            fundsReceived,
            balance,
            status,
            utilizationRecord: utilRecord,
          };
        });

        setRows(builtRows);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // ─── Approve / Reject handlers ─────────────────
  const handleApprove = async (districtId: number) => {
    if (!season) return;
    if (!window.confirm('Approve this utilization record?')) return;
    setActionLoading(districtId);
    setMessage(null);
    try {
      await utilizationAPI.approve(season.id, districtId);
      setRows((prev) =>
        prev.map((r) =>
          r.districtId === districtId ? { ...r, status: 'approved' } : r
        )
      );
      setMessage({ type: 'success', text: 'Record approved successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to approve' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!season || !rejectModalDistrictId) return;
    if (!rejectReason.trim()) return;
    setActionLoading(rejectModalDistrictId);
    setMessage(null);
    try {
      await utilizationAPI.reject(season.id, rejectModalDistrictId, rejectReason.trim());
      setRows((prev) =>
        prev.map((r) =>
          r.districtId === rejectModalDistrictId ? { ...r, status: 'rejected' } : r
        )
      );
      setMessage({ type: 'success', text: 'Record rejected' });
      setRejectModalDistrictId(null);
      setRejectReason('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reject' });
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Navigate helpers ──────────────────────────
  const goToForm = (districtId: number) => navigate(`/data-entry/utilization/${districtId}`);

  const handleAddNew = () => {
    // DM users go directly to their district form
    if (user?.role === UserRole.DM && user.district_id) {
      goToForm(user.district_id);
      return;
    }
    setShowAddModal(true);
  };

  const handleAddConfirm = () => {
    if (addDistrictId > 0) {
      setShowAddModal(false);
      goToForm(addDistrictId);
    }
  };

  // Districts without data (for add modal)
  const districtsWithoutData = useMemo(() => {
    const existingDistrictIds = new Set(rows.filter((r) => r.status !== 'pending').map((r) => r.districtId));
    return allDistricts.filter((d) => !existingDistrictIds.has(d.id));
  }, [rows, allDistricts]);

  // ─── Render ────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <PieChart className="w-7 h-7 text-green-600" />
            Fund Utilization
          </h1>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/30 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Fund Utilization
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          District-wise utilization of funds
          {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
        </p>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  District
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Utilized
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Funds Received
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No districts found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.districtId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {row.districtName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {row.status !== 'pending' ? formatAmount(row.totalUtilized) : '--'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {row.fundsReceived > 0 ? formatAmount(row.fundsReceived) : '--'}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${row.balance < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                      {row.status !== 'pending' || row.fundsReceived > 0
                        ? formatAmount(row.balance)
                        : '--'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* No data — Add button */}
                        {row.status === 'pending' && (
                          <button
                            onClick={() => goToForm(row.districtId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add
                          </button>
                        )}

                        {/* Draft or Rejected — Edit button */}
                        {(row.status === 'draft' || row.status === 'rejected') && (
                          <button
                            onClick={() => goToForm(row.districtId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                        )}

                        {/* Submitted — View + Approve/Reject */}
                        {row.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => goToForm(row.districtId)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            {canApprove && (
                              <>
                                <button
                                  onClick={() => handleApprove(row.districtId)}
                                  disabled={actionLoading === row.districtId}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === row.districtId ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectModalDistrictId(row.districtId);
                                    setRejectReason('');
                                  }}
                                  disabled={actionLoading === row.districtId}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {/* Approved — View only */}
                        {row.status === 'approved' && (
                          <button
                            onClick={() => goToForm(row.districtId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalDistrictId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Utilization</h3>
            <p className="text-sm text-gray-500 mb-4">
              Provide a reason for rejecting the utilization record for{' '}
              <strong>{rows.find((r) => r.districtId === rejectModalDistrictId)?.districtName}</strong>.
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
                onClick={() => {
                  setRejectModalDistrictId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === rejectModalDistrictId}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectModalDistrictId ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                ) : null}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add District Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Select District</h3>
            <p className="text-sm text-gray-500 mb-4">
              Choose a district to add fund utilization data.
            </p>
            <select
              value={addDistrictId}
              onChange={(e) => setAddDistrictId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value={0}>-- Select a district --</option>
              {districtsWithoutData.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
              {/* Also show districts with data so admin can navigate to any */}
              {allDistricts
                .filter((d) => !districtsWithoutData.find((dw) => dw.id === d.id))
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (has data)
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddDistrictId(0);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddConfirm}
                disabled={addDistrictId === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4" />
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UtilizationList;
