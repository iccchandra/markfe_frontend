// ============================================
// pages/transportation/TransportTripsList.tsx — Transport Trips with approval workflow
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Loader2, Plus, Eye, Edit2, CheckCircle, XCircle, ShieldCheck, Send, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  seasonsAPI, districtsAPI, commoditiesAPI, transportTripsAPI,
} from '../../api/services';
import { UserRole, formatAmount, num } from '../../types/markfed';
import type { Season, District } from '../../types/markfed';

// ─── Status config ──────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  draft:      { label: 'Draft',      bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-300' },
  submitted:  { label: 'Submitted',  bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-300' },
  verified:   { label: 'Verified',   bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-300' },
  approved:   { label: 'Approved',   bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-300' },
  rejected:   { label: 'Rejected',   bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-300' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

export const TransportTripsList: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const canSubmit = hasRole(UserRole.DM, UserRole.SUPER_ADMIN);
  const canVerify = hasRole(UserRole.AO_CAO, UserRole.SUPER_ADMIN);
  const canApprove = hasRole(UserRole.MD, UserRole.SUPER_ADMIN);

  // Data
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
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

  // Modals
  const [verifyModal, setVerifyModal] = useState<{ id: number; trip: any } | null>(null);
  const [approveModal, setApproveModal] = useState<{ id: number; trip: any } | null>(null);
  const [rejectModal, setRejectModal] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Verify form
  const [verifyFields, setVerifyFields] = useState({
    google_maps_distance_km: 0,
    amount_verified: 0,
    bags_received: 0,
    weight_received_qtl: 0,
  });

  // Approve form
  const [approveFields, setApproveFields] = useState({
    amount_verified: 0,
  });

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

  // ─── Load trips on filter change ──────────────────
  useEffect(() => {
    if (!selectedSeasonId) return;
    const loadTrips = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (commodityFilter) params.commodity_id = commodityFilter;
        if (districtFilter) params.district_id = districtFilter;
        if (statusFilter !== 'all') params.status = statusFilter;
        const res = await transportTripsAPI.list(selectedSeasonId, params);
        const raw = res.data;
        setTrips(Array.isArray(raw) ? raw : (raw as any)?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load trips');
      } finally {
        setLoading(false);
      }
    };
    loadTrips();
  }, [selectedSeasonId, commodityFilter, districtFilter, statusFilter]);

  // ─── Helpers ──────────────────────────────────────
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  const getDistanceVariance = (claimed: number, google: number) => {
    if (!google || !claimed) return null;
    const diff = claimed - google;
    const pct = (diff / google) * 100;
    return { diff, pct };
  };

  // ─── Action handlers ──────────────────────────────
  const handleSubmit = async (tripId: number) => {
    if (!window.confirm('Submit this trip for verification?')) return;
    setActionLoading(tripId);
    setMessage(null);
    try {
      await transportTripsAPI.submit(selectedSeasonId, tripId);
      setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'submitted' } : t)));
      setMessage({ type: 'success', text: 'Trip submitted for verification' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to submit' });
    } finally {
      setActionLoading(null);
    }
  };

  const openVerifyModal = (trip: any) => {
    setVerifyFields({
      google_maps_distance_km: num(trip.google_maps_distance_km),
      amount_verified: num(trip.amount_claimed),
      bags_received: num(trip.bags_sent),
      weight_received_qtl: num(trip.weight_qtl),
    });
    setVerifyModal({ id: trip.id, trip });
  };

  const handleVerify = async () => {
    if (!verifyModal) return;
    setActionLoading(verifyModal.id);
    setMessage(null);
    try {
      await transportTripsAPI.verify(selectedSeasonId, verifyModal.id, verifyFields);
      setTrips((prev) => prev.map((t) => (t.id === verifyModal.id ? { ...t, status: 'verified', ...verifyFields } : t)));
      setMessage({ type: 'success', text: 'Trip verified' });
      setVerifyModal(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to verify' });
    } finally {
      setActionLoading(null);
    }
  };

  const openApproveModal = (trip: any) => {
    setApproveFields({
      amount_verified: num(trip.amount_verified || trip.amount_claimed),
    });
    setApproveModal({ id: trip.id, trip });
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    setActionLoading(approveModal.id);
    setMessage(null);
    try {
      await transportTripsAPI.approve(selectedSeasonId, approveModal.id, approveFields);
      setTrips((prev) => prev.map((t) => (t.id === approveModal.id ? { ...t, status: 'approved', ...approveFields } : t)));
      setMessage({ type: 'success', text: 'Trip approved' });
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
      await transportTripsAPI.reject(selectedSeasonId, rejectModal, rejectReason.trim());
      setTrips((prev) => prev.map((t) => (t.id === rejectModal ? { ...t, status: 'rejected' } : t)));
      setMessage({ type: 'success', text: 'Trip rejected' });
      setRejectModal(null);
      setRejectReason('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reject' });
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Render ───────────────────────────────────────
  if (loading && trips.length === 0) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error && trips.length === 0) {
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
            <Truck className="w-7 h-7 text-blue-600" />
            Transport Trips
          </h1>
          <button
            onClick={() => navigate('/transportation/trips/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Trip
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage transportation trips with distance verification
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Season</label>
            <select value={selectedSeasonId} onChange={(e) => setSelectedSeasonId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              {seasons.map((s) => <option key={s.id} value={s.id}>{s.season_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Commodity</label>
            <select value={commodityFilter} onChange={(e) => setCommodityFilter(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value={0}>All Commodities</option>
              {commodities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
            <select value={districtFilter} onChange={(e) => setDistrictFilter(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value={0}>All Districts</option>
              {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
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
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trip ID</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">From Centre</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">To Godown</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Bags</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Wt (Qtl)</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Dist (km)</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amt Claimed</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amt Verified</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-12 text-center text-gray-400">
                    No transport trips found. Click "Add New Trip" to create one.
                  </td>
                </tr>
              ) : (
                trips.map((trip, idx) => {
                  const tripStatus = trip.status || 'draft';
                  const isActionLoading = actionLoading === trip.id;
                  const distClaimed = num(trip.distance_claimed_km);
                  const distGoogle = num(trip.google_maps_distance_km);
                  const variance = getDistanceVariance(distClaimed, distGoogle);
                  const highVariance = variance && Math.abs(variance.pct) > 10;

                  return (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">{trip.trip_id_ext || `#${trip.id}`}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{formatDate(trip.trip_date)}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{trip.from_centre || '--'}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{trip.godown?.name || trip.to_godown_name || '--'}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{trip.vehicle_no || '--'}</td>
                      <td className="px-3 py-3 text-sm text-right text-gray-700">{num(trip.bags_sent).toLocaleString('en-IN')}</td>
                      <td className="px-3 py-3 text-sm text-right text-gray-700">{num(trip.weight_qtl).toFixed(2)}</td>
                      <td className="px-3 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-gray-700">{distClaimed.toFixed(1)}</span>
                          {highVariance && (
                            <span className="inline-flex items-center gap-0.5 text-red-600" title={`Google: ${distGoogle.toFixed(1)} km (${variance!.pct.toFixed(1)}% diff)`}>
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-right font-medium text-gray-900">{formatAmount(num(trip.amount_claimed))}</td>
                      <td className="px-3 py-3 text-sm text-right font-medium text-green-700">{num(trip.amount_verified) > 0 ? formatAmount(num(trip.amount_verified)) : '--'}</td>
                      <td className="px-3 py-3 text-center"><StatusBadge status={tripStatus} /></td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {/* View */}
                          <button onClick={() => navigate(`/transportation/trips/${trip.id}`)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            <Eye className="w-3 h-3" /> View
                          </button>

                          {/* Edit */}
                          {(tripStatus === 'draft' || tripStatus === 'rejected') && (
                            <button onClick={() => navigate(`/transportation/trips/${trip.id}`)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          )}

                          {/* Submit (DM) */}
                          {tripStatus === 'draft' && canSubmit && (
                            <button onClick={() => handleSubmit(trip.id)} disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                              {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                              Submit
                            </button>
                          )}

                          {/* Verify (AO_CAO) */}
                          {tripStatus === 'submitted' && canVerify && (
                            <button onClick={() => openVerifyModal(trip)} disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50">
                              <ShieldCheck className="w-3 h-3" /> Verify
                            </button>
                          )}

                          {/* Approve (MD) */}
                          {tripStatus === 'verified' && canApprove && (
                            <button onClick={() => openApproveModal(trip)} disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50">
                              <CheckCircle className="w-3 h-3" /> Approve
                            </button>
                          )}

                          {/* Reject */}
                          {['submitted', 'verified'].includes(tripStatus) && (canVerify || canApprove) && (
                            <button onClick={() => { setRejectModal(trip.id); setRejectReason(''); }} disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">
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

      {/* ─── Verify Modal ────────────────────────────── */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Verify Trip</h3>
            <p className="text-sm text-gray-500 mb-4">
              Verify trip {verifyModal.trip.trip_id_ext || `#${verifyModal.trip.id}`}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Google Maps Distance (km)</label>
                <input type="number" step="0.1" value={verifyFields.google_maps_distance_km}
                  onChange={(e) => setVerifyFields((f) => ({ ...f, google_maps_distance_km: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
                {verifyFields.google_maps_distance_km > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Claimed: {num(verifyModal.trip.distance_claimed_km).toFixed(1)} km
                    {(() => {
                      const v = getDistanceVariance(num(verifyModal.trip.distance_claimed_km), verifyFields.google_maps_distance_km);
                      if (!v) return null;
                      const isHigh = Math.abs(v.pct) > 10;
                      return (
                        <span className={isHigh ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                          {' '}({v.pct > 0 ? '+' : ''}{v.pct.toFixed(1)}%)
                        </span>
                      );
                    })()}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount Verified (Rs.)</label>
                <input type="number" step="0.01" value={verifyFields.amount_verified}
                  onChange={(e) => setVerifyFields((f) => ({ ...f, amount_verified: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bags Received</label>
                <input type="number" value={verifyFields.bags_received}
                  onChange={(e) => setVerifyFields((f) => ({ ...f, bags_received: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Weight Received (Qtl)</label>
                <input type="number" step="0.01" value={verifyFields.weight_received_qtl}
                  onChange={(e) => setVerifyFields((f) => ({ ...f, weight_received_qtl: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
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

      {/* ─── Approve Modal ───────────────────────────── */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Approve Trip</h3>
            <p className="text-sm text-gray-500 mb-4">
              Approve trip {approveModal.trip.trip_id_ext || `#${approveModal.trip.id}`}
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Final Approved Amount (Rs.)</label>
              <input type="number" step="0.01" value={approveFields.amount_verified}
                onChange={(e) => setApproveFields((f) => ({ ...f, amount_verified: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
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

      {/* ─── Reject Modal ────────────────────────────── */}
      {rejectModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Trip</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for rejection.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..." rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
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

export default TransportTripsList;
