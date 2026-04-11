// ============================================
// pages/unloading/UnloadingBillsList.tsx — Unloading Bills List with 4-level approval
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Loader2, Plus, Eye, Edit2, CheckCircle, XCircle, ShieldCheck, Send,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  seasonsAPI, districtsAPI, commoditiesAPI, unloadingBillsAPI,
} from '../../api/services';
import { UserRole, formatAmount, num } from '../../types/markfed';
import type { Season, District } from '../../types/markfed';

// ─── Status config for 4-level workflow ─────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  draft:               { label: 'Draft',              bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-300' },
  warehouse_certified: { label: 'WH Certified',      bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-300' },
  dm_verified:         { label: 'DM Verified',        bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-300' },
  manager_approved:    { label: 'Manager Approved',   bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-300' },
  rejected:            { label: 'Rejected',           bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-300' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

export const UnloadingBillsList: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  // Role checks
  const canCertify = hasRole(UserRole.DM, UserRole.SUPER_ADMIN);
  const canVerify = hasRole(UserRole.DM, UserRole.SUPER_ADMIN);
  const canApprove = hasRole(UserRole.AO_CAO, UserRole.MD, UserRole.SUPER_ADMIN);

  // Data
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(0);
  const [commodityFilter, setCommodityFilter] = useState<number>(0);
  const [districtFilter, setDistrictFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Action state
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal state for verify / approve
  const [verifyModal, setVerifyModal] = useState<{ id: number; bill: any } | null>(null);
  const [approveModal, setApproveModal] = useState<{ id: number; bill: any } | null>(null);
  const [rejectModal, setRejectModal] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Verify form fields
  const [verifyFields, setVerifyFields] = useState({
    dm_verified_bags: 0,
    dm_verified_rate: 0,
    dm_net_amount: 0,
    dm_total: 0,
  });

  // Approve form fields
  const [approveFields, setApproveFields] = useState({
    mgr_verified_bags: 0,
    mgr_verified_rate: 0,
    mgr_net_amount: 0,
    mgr_total: 0,
  });

  // District map for display
  const districtMap = useMemo(() => {
    const map: Record<number, string> = {};
    districts.forEach((d) => { map[d.id] = d.name; });
    return map;
  }, [districts]);

  const commodityMap = useMemo(() => {
    const map: Record<number, string> = {};
    commodities.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [commodities]);

  // ─── Initial load ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, distRes, commRes] = await Promise.all([
          seasonsAPI.list(),
          districtsAPI.list(),
          commoditiesAPI.list(),
        ]);
        const seasonList: Season[] = Array.isArray(seasonRes.data) ? seasonRes.data : [];
        setSeasons(seasonList);
        setDistricts(distRes.data);
        setCommodities(commRes.data);

        const active = seasonList.find((s) => s.is_active) || seasonList[0];
        if (active) {
          setActiveSeason(active);
          setSelectedSeasonId(active.id);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Reload bills when season/filters change ──────
  useEffect(() => {
    if (!selectedSeasonId) return;
    const loadBills = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (commodityFilter) params.commodity_id = commodityFilter;
        if (districtFilter) params.district_id = districtFilter;
        const res = await unloadingBillsAPI.list(selectedSeasonId, params);
        const raw = res.data;
        setBills(Array.isArray(raw) ? raw : (raw as any)?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load bills');
      } finally {
        setLoading(false);
      }
    };
    loadBills();
  }, [selectedSeasonId, commodityFilter, districtFilter]);

  // ─── Filtered bills ───────────────────────────────
  const filteredBills = useMemo(() => {
    if (statusFilter === 'all') return bills;
    return bills.filter((b) => (b.status || 'draft') === statusFilter);
  }, [bills, statusFilter]);

  // ─── Action handlers ──────────────────────────────
  const handleCertify = async (billId: number) => {
    if (!window.confirm('Certify this bill?')) return;
    setActionLoading(billId);
    setMessage(null);
    try {
      await unloadingBillsAPI.certify(selectedSeasonId, billId);
      setBills((prev) => prev.map((b) => (b.id === billId ? { ...b, status: 'warehouse_certified' } : b)));
      setMessage({ type: 'success', text: 'Bill certified successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to certify' });
    } finally {
      setActionLoading(null);
    }
  };

  const openVerifyModal = (bill: any) => {
    setVerifyFields({
      dm_verified_bags: num(bill.num_bags_claimed),
      dm_verified_rate: num(bill.rate_per_bag),
      dm_net_amount: num(bill.bill_amount),
      dm_total: num(bill.bill_amount),
    });
    setVerifyModal({ id: bill.id, bill });
  };

  const handleVerify = async () => {
    if (!verifyModal) return;
    setActionLoading(verifyModal.id);
    setMessage(null);
    try {
      await unloadingBillsAPI.verify(selectedSeasonId, verifyModal.id, verifyFields);
      setBills((prev) => prev.map((b) => (b.id === verifyModal.id ? { ...b, status: 'dm_verified', ...verifyFields } : b)));
      setMessage({ type: 'success', text: 'Bill verified by DM' });
      setVerifyModal(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to verify' });
    } finally {
      setActionLoading(null);
    }
  };

  const openApproveModal = (bill: any) => {
    setApproveFields({
      mgr_verified_bags: num(bill.dm_verified_bags || bill.num_bags_claimed),
      mgr_verified_rate: num(bill.dm_verified_rate || bill.rate_per_bag),
      mgr_net_amount: num(bill.dm_net_amount || bill.bill_amount),
      mgr_total: num(bill.dm_total || bill.bill_amount),
    });
    setApproveModal({ id: bill.id, bill });
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    setActionLoading(approveModal.id);
    setMessage(null);
    try {
      await unloadingBillsAPI.approve(selectedSeasonId, approveModal.id, approveFields);
      setBills((prev) => prev.map((b) => (b.id === approveModal.id ? { ...b, status: 'manager_approved', ...approveFields } : b)));
      setMessage({ type: 'success', text: 'Bill approved by manager' });
      setApproveModal(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to approve' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionLoading(rejectModal);
    setMessage(null);
    try {
      await unloadingBillsAPI.reject(selectedSeasonId, rejectModal, rejectReason.trim());
      setBills((prev) => prev.map((b) => (b.id === rejectModal ? { ...b, status: 'rejected', rejection_reason: rejectReason.trim() } : b)));
      setMessage({ type: 'success', text: 'Bill rejected' });
      setRejectModal(null);
      setRejectReason('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reject' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  // ─── Render ───────────────────────────────────────
  if (loading && bills.length === 0) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error && bills.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" /> {error}
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
            <Package className="w-7 h-7 text-blue-600" />
            Unloading Bills
          </h1>
          <button
            onClick={() => navigate('/unloading/bills/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Bill
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Manage unloading bills with 4-level approval workflow
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Season selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Season</label>
            <select
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>{s.season_name}</option>
              ))}
            </select>
          </div>
          {/* Commodity filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Commodity</label>
            <select
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>All Commodities</option>
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {/* District filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          {/* Status filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="warehouse_certified">WH Certified</option>
              <option value="dm_verified">DM Verified</option>
              <option value="manager_approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Godown</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contractor</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Bags</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate/Bag</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    No unloading bills found. Click "Add New Bill" to create one.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill, idx) => {
                  const billStatus = bill.status || 'draft';
                  const isActionLoading = actionLoading === bill.id;

                  return (
                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{bill.invoice_no || '--'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(bill.bill_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bill.godown?.name || bill.godown_name || '--'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bill.contractor?.name || bill.contractor_name || '--'}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{num(bill.num_bags_claimed).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{num(bill.rate_per_bag).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatAmount(num(bill.bill_amount))}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={billStatus} /></td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* View */}
                          <button
                            onClick={() => navigate(`/unloading/bills/${bill.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>

                          {/* Edit - draft or rejected */}
                          {(billStatus === 'draft' || billStatus === 'rejected') && (
                            <button
                              onClick={() => navigate(`/unloading/bills/${bill.id}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          )}

                          {/* Certify - from draft */}
                          {billStatus === 'draft' && canCertify && (
                            <button
                              onClick={() => handleCertify(bill.id)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                              Certify
                            </button>
                          )}

                          {/* Verify - from warehouse_certified (DM) */}
                          {billStatus === 'warehouse_certified' && canVerify && (
                            <button
                              onClick={() => openVerifyModal(bill)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <ShieldCheck className="w-3 h-3" /> Verify
                            </button>
                          )}

                          {/* Approve - from dm_verified (AO_CAO/MD) */}
                          {billStatus === 'dm_verified' && canApprove && (
                            <button
                              onClick={() => openApproveModal(bill)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-3 h-3" /> Approve
                            </button>
                          )}

                          {/* Reject - any approver from non-terminal status */}
                          {['warehouse_certified', 'dm_verified'].includes(billStatus) && (canCertify || canApprove) && (
                            <button
                              onClick={() => { setRejectModal(bill.id); setRejectReason(''); }}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3" /> Reject
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

      {/* ─── Verify Modal (DM) ──────────────────────── */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">DM Verification</h3>
            <p className="text-sm text-gray-500 mb-4">
              Verify bill #{verifyModal.bill.invoice_no}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Verified Bags</label>
                <input type="number" value={verifyFields.dm_verified_bags}
                  onChange={(e) => {
                    const bags = parseFloat(e.target.value) || 0;
                    setVerifyFields((f) => ({
                      ...f,
                      dm_verified_bags: bags,
                      dm_net_amount: bags * f.dm_verified_rate,
                      dm_total: bags * f.dm_verified_rate,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Verified Rate/Bag</label>
                <input type="number" step="0.01" value={verifyFields.dm_verified_rate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    setVerifyFields((f) => ({
                      ...f,
                      dm_verified_rate: rate,
                      dm_net_amount: f.dm_verified_bags * rate,
                      dm_total: f.dm_verified_bags * rate,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Net Amount</label>
                <input type="number" value={verifyFields.dm_net_amount} readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">DM Total</label>
                <input type="number" value={verifyFields.dm_total}
                  onChange={(e) => setVerifyFields((f) => ({ ...f, dm_total: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setVerifyModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleVerify} disabled={actionLoading === verifyModal.id}
                className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50">
                {actionLoading === verifyModal.id && <Loader2 className="w-4 h-4 animate-spin inline mr-1" />}
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Approve Modal (Manager) ────────────────── */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manager Approval</h3>
            <p className="text-sm text-gray-500 mb-4">
              Approve bill #{approveModal.bill.invoice_no}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Verified Bags</label>
                <input type="number" value={approveFields.mgr_verified_bags}
                  onChange={(e) => {
                    const bags = parseFloat(e.target.value) || 0;
                    setApproveFields((f) => ({
                      ...f,
                      mgr_verified_bags: bags,
                      mgr_net_amount: bags * f.mgr_verified_rate,
                      mgr_total: bags * f.mgr_verified_rate,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Verified Rate/Bag</label>
                <input type="number" step="0.01" value={approveFields.mgr_verified_rate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    setApproveFields((f) => ({
                      ...f,
                      mgr_verified_rate: rate,
                      mgr_net_amount: f.mgr_verified_bags * rate,
                      mgr_total: f.mgr_verified_bags * rate,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Net Amount</label>
                <input type="number" value={approveFields.mgr_net_amount} readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Manager Total</label>
                <input type="number" value={approveFields.mgr_total}
                  onChange={(e) => setApproveFields((f) => ({ ...f, mgr_total: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setApproveModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleApprove} disabled={actionLoading === approveModal.id}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50">
                {actionLoading === approveModal.id && <Loader2 className="w-4 h-4 animate-spin inline mr-1" />}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reject Modal ───────────────────────────── */}
      {rejectModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Bill</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for rejection.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleReject} disabled={!rejectReason.trim() || actionLoading === rejectModal}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">
                {actionLoading === rejectModal && <Loader2 className="w-4 h-4 animate-spin inline mr-1" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnloadingBillsList;
