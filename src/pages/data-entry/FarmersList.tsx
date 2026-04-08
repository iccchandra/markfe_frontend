// ============================================
// pages/data-entry/FarmersList.tsx — District Farmers List Page
// Shows ALL farmer records (multiple per district per season)
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Loader2, Plus, Eye, Edit2, Trash2, Send, CheckCircle, XCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { seasonsAPI, districtsAPI, farmersAPI } from '../../api/services';
import type { Season, District, DistrictFarmers } from '../../types/markfed';
import { UserRole, formatAmount, num, ApprovalStatus, flattenPacs, flattenPacsType } from '../../types/markfed';

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

export const FarmersList: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const isDM = user?.role === UserRole.DM;
  const canApprove = hasRole(UserRole.AO_CAO, UserRole.MD, UserRole.SUPER_ADMIN);

  // Data
  const [season, setSeason] = useState<Season | null>(null);
  const [records, setRecords] = useState<DistrictFarmers[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Action state
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectModalRecordId, setRejectModalRecordId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // District name map for display
  const districtMap = useMemo(() => {
    const map: Record<number, string> = {};
    districts.forEach((d) => { map[d.id] = d.name; });
    return map;
  }, [districts]);

  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, distRes] = await Promise.all([
          seasonsAPI.active(),
          districtsAPI.list(),
        ]);

        const activeSeason = seasonRes.data;
        const districtList: District[] = distRes.data;
        setSeason(activeSeason);
        setDistricts(districtList);

        // Load farmers records - filtered by district for DM users
        let farmRecords: DistrictFarmers[] = [];
        if (isDM && user?.district_id) {
          const farmRes = await farmersAPI.listByDistrict(activeSeason.id, user.district_id);
          const raw = farmRes.data;
          farmRecords = Array.isArray(raw) ? raw : (raw as any)?.data || [];
        } else {
          const farmRes = await farmersAPI.listAll(activeSeason.id);
          const raw = farmRes.data;
          farmRecords = Array.isArray(raw) ? raw : (raw as any)?.data || [];
        }

        setRecords(farmRecords);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // ─── Summary: total across all records, grouped by district ───
  const summaryByDistrict = useMemo(() => {
    const map: Record<number, { districtName: string; totalQty: number; totalPayment: number; count: number }> = {};
    records.forEach((r) => {
      const did = r.district_id;
      if (!map[did]) {
        map[did] = {
          districtName: r.district_name || districtMap[did] || `District #${did}`,
          totalQty: 0,
          totalPayment: 0,
          count: 0,
        };
      }
      map[did].totalQty += num(r.quantity_procured_qtl);
      map[did].totalPayment += num(r.payment_released_to_farmers_rs);
      map[did].count += 1;
    });
    return Object.values(map).sort((a, b) => a.districtName.localeCompare(b.districtName));
  }, [records, districtMap]);

  const grandTotalPayment = useMemo(
    () => summaryByDistrict.reduce((sum, s) => sum + s.totalPayment, 0),
    [summaryByDistrict]
  );

  // ─── Action handlers ──────────────────────────────
  const handleSubmit = async (recordId: number) => {
    if (!season) return;
    if (!window.confirm('Submit this farmers record for review?')) return;
    setActionLoading(recordId);
    setMessage(null);
    try {
      await farmersAPI.submit(season.id, recordId);
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, status: 'submitted' as ApprovalStatus } : r))
      );
      setMessage({ type: 'success', text: 'Record submitted for review' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to submit' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (recordId: number) => {
    if (!season) return;
    if (!window.confirm('Approve this farmers record?')) return;
    setActionLoading(recordId);
    setMessage(null);
    try {
      await farmersAPI.approve(season.id, recordId);
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, status: 'approved' as ApprovalStatus } : r))
      );
      setMessage({ type: 'success', text: 'Record approved successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to approve' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!season || !rejectModalRecordId) return;
    if (!rejectReason.trim()) return;
    setActionLoading(rejectModalRecordId);
    setMessage(null);
    try {
      await farmersAPI.reject(season.id, rejectModalRecordId, rejectReason.trim());
      setRecords((prev) =>
        prev.map((r) => (r.id === rejectModalRecordId ? { ...r, status: 'rejected' as ApprovalStatus } : r))
      );
      setMessage({ type: 'success', text: 'Record rejected' });
      setRejectModalRecordId(null);
      setRejectReason('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reject' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (recordId: number) => {
    if (!season) return;
    if (!window.confirm('Delete this farmers record? This cannot be undone.')) return;
    setActionLoading(recordId);
    setMessage(null);
    try {
      await farmersAPI.delete(season.id, recordId);
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      setMessage({ type: 'success', text: 'Record deleted' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to delete' });
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Helpers ───────────────────────────────────────
  const getDistrictName = (r: DistrictFarmers) =>
    r.district_name || districtMap[r.district_id] || `District #${r.district_id}`;

  // ─── Render ────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading farmers data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-7 h-7 text-green-600" />
            District Farmers Data
          </h1>
          <button
            onClick={() => navigate('/data-entry/farmers/new')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/30 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Farmers Record
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Procurement &amp; Payment Tracking
          {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
        </p>
        <div className="flex gap-1 mt-2">
          {['all', 'draft', 'submitted', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${statusFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
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

      {/* Summary Bar */}
      {summaryByDistrict.length > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Summary by District</h3>
            <div className="text-sm font-bold text-green-700">
              Grand Total Payment: {formatAmount(grandTotalPayment)}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {summaryByDistrict.map((s) => (
              <div
                key={s.districtName}
                className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs"
              >
                <span className="font-semibold text-gray-700">{s.districtName}</span>
                <span className="text-gray-400 mx-1">|</span>
                <span className="text-green-600 font-medium">{formatAmount(s.totalPayment)}</span>
                <span className="text-gray-400 mx-1">|</span>
                <span className="text-gray-500">{s.count} record{s.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  District
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PACS/DCMS/FPO Name
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Farmers Count
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Qty Procured (Qtl)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment Released
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
              {records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    No farmers records found. Click "Add New Farmers Record" to create one.
                  </td>
                </tr>
              ) : (
                records.filter(r => statusFilter === 'all' || (r.status || 'draft') === statusFilter).map((record, idx) => {
                  const recordId = record.id!;
                  const status = record.status || 'draft';
                  const pacsName = flattenPacs(record) || '-';
                  const pacsType = flattenPacsType(record) || '-';
                  const farmersCount = num(record.farmers_count);
                  const qty = num(record.quantity_procured_qtl);
                  const paymentReleased = num(record.payment_released_to_farmers_rs);
                  const isActionLoading = actionLoading === recordId;

                  return (
                    <tr key={recordId} className="hover:bg-gray-50 transition-colors">
                      {/* # */}
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {idx + 1}
                      </td>

                      {/* District */}
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {getDistrictName(record)}
                      </td>

                      {/* PACS/DCMS/FPO Name */}
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {pacsName}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {pacsType !== '-' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {pacsType}
                          </span>
                        ) : '-'}
                      </td>

                      {/* Farmers Count */}
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {farmersCount > 0 ? farmersCount.toLocaleString('en-IN') : '-'}
                      </td>

                      {/* Qty Procured */}
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {qty > 0 ? qty.toLocaleString('en-IN', { maximumFractionDigits: 3 }) : '-'}
                      </td>

                      {/* Payment Released */}
                      <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium">
                        {paymentReleased > 0 ? formatAmount(paymentReleased) : '-'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* View — always available */}
                          <button
                            onClick={() => navigate(`/data-entry/farmers/${recordId}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>

                          {/* Edit — draft or rejected */}
                          {(status === 'draft' || status === 'rejected') && (
                            <button
                              onClick={() => navigate(`/data-entry/farmers/${recordId}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                          )}

                          {/* Delete — draft only */}
                          {status === 'draft' && (
                            <button
                              onClick={() => handleDelete(recordId)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {isActionLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              Delete
                            </button>
                          )}

                          {/* Submit — draft or rejected (DM action) */}
                          {(status === 'draft' || status === 'rejected') && (
                            <button
                              onClick={() => handleSubmit(recordId)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Submit for Review"
                            >
                              {isActionLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              Submit
                            </button>
                          )}

                          {/* Approve / Reject — submitted, approver roles only */}
                          {status === 'submitted' && canApprove && (
                            <>
                              <button
                                onClick={() => handleApprove(recordId)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {isActionLoading ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalRecordId(recordId);
                                  setRejectReason('');
                                }}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </>
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
      {rejectModalRecordId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Farmers Record</h3>
            <p className="text-sm text-gray-500 mb-4">
              Provide a reason for rejecting this farmers record
              {(() => {
                const rec = records.find((r) => r.id === rejectModalRecordId);
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
                onClick={() => {
                  setRejectModalRecordId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === rejectModalRecordId}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectModalRecordId ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                ) : null}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmersList;
