// ============================================
// pages/transportation/TransportTripForm.tsx — Create/Edit Transport Trip
// Route: /transportation/trips/new  OR  /transportation/trips/:id
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, Send, AlertCircle, CheckCircle, Truck, XCircle, ArrowLeft, Loader2, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  seasonsAPI, districtsAPI, commoditiesAPI, godownsAPI, htContractorsAPI,
  transportTripsAPI,
} from '../../api/services';
import { UserRole, formatAmount, num } from '../../types/markfed';
import type { Season, District } from '../../types/markfed';

// ─── Status Badge ────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  draft:     { label: 'Draft',     bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-300' },
  submitted: { label: 'Submitted', bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-300' },
  verified:  { label: 'Verified',  bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-300' },
  approved:  { label: 'Approved',  bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-300' },
  rejected:  { label: 'Rejected',  bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-300' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

interface TripForm {
  commodity_id: number;
  district_id: number;
  contractor_id: number;
  trip_id_ext: string;
  trip_date: string;
  from_centre: string;
  to_godown_id: number;
  vehicle_no: string;
  bags_sent: number;
  weight_qtl: number;
  distance_claimed_km: number;
  rate_per_km: number;
  rate_per_qtl: number;
  // Verification (read-only for non-verifiers)
  google_maps_distance_km: number;
  amount_verified: number;
  bags_received: number;
  weight_received_qtl: number;
  // Payment
  payment_released: number;
  payment_utr: string;
}

const emptyForm: TripForm = {
  commodity_id: 0,
  district_id: 0,
  contractor_id: 0,
  trip_id_ext: '',
  trip_date: '',
  from_centre: '',
  to_godown_id: 0,
  vehicle_no: '',
  bags_sent: 0,
  weight_qtl: 0,
  distance_claimed_km: 0,
  rate_per_km: 0,
  rate_per_qtl: 0,
  google_maps_distance_km: 0,
  amount_verified: 0,
  bags_received: 0,
  weight_received_qtl: 0,
  payment_released: 0,
  payment_utr: '',
};

export const TransportTripForm: React.FC = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const isCreateMode = !idParam || idParam === 'new';
  const recordId = isCreateMode ? null : parseInt(idParam);

  const isDM = hasRole(UserRole.DM);
  const isVerifier = hasRole(UserRole.AO_CAO, UserRole.SUPER_ADMIN);
  const isApprover = hasRole(UserRole.MD, UserRole.SUPER_ADMIN);
  const isAdmin = hasRole(UserRole.SUPER_ADMIN);

  // Reference data
  const [season, setSeason] = useState<Season | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [godowns, setGodowns] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);

  // Form
  const [form, setForm] = useState<TripForm>(emptyForm);
  const [status, setStatus] = useState<string>('draft');
  const [rejectionReason, setRejectionReason] = useState('');

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canEditBase = isCreateMode || status === 'draft' || status === 'rejected';
  const isLocked = status === 'submitted' || status === 'verified' || status === 'approved';

  // ─── Auto-calculated ─────────────────────────────
  const amountClaimed = useMemo(() => {
    // Prefer weight * rate_per_qtl; fallback to distance * rate_per_km
    if (form.weight_qtl > 0 && form.rate_per_qtl > 0) {
      return form.weight_qtl * form.rate_per_qtl;
    }
    if (form.distance_claimed_km > 0 && form.rate_per_km > 0) {
      return form.distance_claimed_km * form.rate_per_km;
    }
    return 0;
  }, [form.weight_qtl, form.rate_per_qtl, form.distance_claimed_km, form.rate_per_km]);

  const balanceToRelease = useMemo(() => {
    const base = form.amount_verified > 0 ? form.amount_verified : amountClaimed;
    return base - form.payment_released;
  }, [amountClaimed, form.amount_verified, form.payment_released]);

  const distanceVariance = useMemo(() => {
    if (!form.google_maps_distance_km || !form.distance_claimed_km) return null;
    const diff = form.distance_claimed_km - form.google_maps_distance_km;
    const pct = (diff / form.google_maps_distance_km) * 100;
    return { diff, pct };
  }, [form.distance_claimed_km, form.google_maps_distance_km]);

  const highVariance = distanceVariance && Math.abs(distanceVariance.pct) > 10;

  // ─── Load initial data ────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, distRes, commRes, contractorRes] = await Promise.all([
          seasonsAPI.active(),
          districtsAPI.list(),
          commoditiesAPI.list(),
          htContractorsAPI.list(),
        ]);
        setSeason(seasonRes.data);
        setDistricts(distRes.data);
        setCommodities(commRes.data);
        setContractors(contractorRes.data);

        // DM pre-select
        if (isCreateMode && user?.role === UserRole.DM && user.district_id) {
          setForm((prev) => ({ ...prev, district_id: user.district_id! }));
        }

        // Load existing record
        if (!isCreateMode && recordId && seasonRes.data) {
          try {
            const tripRes = await transportTripsAPI.get(seasonRes.data.id, recordId);
            const raw = tripRes.data;
            setForm({
              commodity_id: num(raw.commodity_id),
              district_id: num(raw.district_id),
              contractor_id: num(raw.contractor_id),
              trip_id_ext: raw.trip_id_ext || '',
              trip_date: raw.trip_date ? raw.trip_date.split('T')[0] : '',
              from_centre: raw.from_centre || '',
              to_godown_id: num(raw.to_godown_id),
              vehicle_no: raw.vehicle_no || '',
              bags_sent: num(raw.bags_sent),
              weight_qtl: num(raw.weight_qtl),
              distance_claimed_km: num(raw.distance_claimed_km),
              rate_per_km: num(raw.rate_per_km),
              rate_per_qtl: num(raw.rate_per_qtl),
              google_maps_distance_km: num(raw.google_maps_distance_km),
              amount_verified: num(raw.amount_verified),
              bags_received: num(raw.bags_received),
              weight_received_qtl: num(raw.weight_received_qtl),
              payment_released: num(raw.payment_released),
              payment_utr: raw.payment_utr || '',
            });
            setStatus(raw.status || 'draft');
            setRejectionReason(raw.rejection_reason || '');
          } catch (err: any) {
            setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load trip' });
          }
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isCreateMode, recordId]);

  // ─── Load godowns when district changes ───────────
  useEffect(() => {
    if (!form.district_id) { setGodowns([]); return; }
    const loadGodowns = async () => {
      try {
        const res = await godownsAPI.list(form.district_id);
        setGodowns(res.data);
      } catch { setGodowns([]); }
    };
    loadGodowns();
  }, [form.district_id]);

  // ─── Handlers ─────────────────────────────────────
  const handleChange = (field: keyof TripForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (submit: boolean = false) => {
    if (!season) return;

    if (!form.commodity_id || !form.district_id) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (submit && !window.confirm('Submit this trip?')) return;

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        commodity_id: form.commodity_id,
        district_id: form.district_id,
        contractor_id: form.contractor_id,
        trip_id_ext: form.trip_id_ext,
        trip_date: form.trip_date,
        from_centre: form.from_centre,
        to_godown_id: form.to_godown_id,
        vehicle_no: form.vehicle_no,
        bags_sent: form.bags_sent,
        weight_qtl: form.weight_qtl,
        distance_claimed_km: form.distance_claimed_km,
        rate_per_km: form.rate_per_km,
        rate_per_qtl: form.rate_per_qtl,
        amount_claimed: amountClaimed,
      };

      if (isCreateMode) {
        const res = await transportTripsAPI.create(season.id, payload);
        const newId = res.data.id;

        if (submit && newId) {
          await transportTripsAPI.submit(season.id, newId);
          setStatus('submitted');
          setMessage({ type: 'success', text: 'Trip created and submitted' });
        } else {
          setMessage({ type: 'success', text: 'Trip created as draft' });
        }
        if (newId) navigate(`/transportation/trips/${newId}`, { replace: true });
      } else if (recordId) {
        await transportTripsAPI.update(season.id, recordId, payload);

        if (submit) {
          await transportTripsAPI.submit(season.id, recordId);
          setStatus('submitted');
          setMessage({ type: 'success', text: 'Trip submitted' });
        } else {
          setMessage({ type: 'success', text: 'Draft saved' });
          setTimeout(() => setMessage(null), 3000);
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/transportation/trips')}
        className="mb-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trips
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Truck className="w-7 h-7 text-blue-600" />
            {isCreateMode ? 'New Transport Trip' : 'Transport Trip'}
          </h1>
          {!isCreateMode && <StatusBadge status={status} />}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {isCreateMode ? 'Create a new transport trip' : `Trip: ${form.trip_id_ext || '--'}`}
          {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
        </p>
      </div>

      {/* Banners */}
      {status === 'rejected' && rejectionReason && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div><p className="font-semibold">Rejected</p><p className="mt-0.5">Reason: {rejectionReason}</p></div>
        </div>
      )}

      {isLocked && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          This trip has been {status}. Base fields are read-only.
        </div>
      )}

      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* ─── Trip Details ────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commodity <span className="text-red-500">*</span></label>
            <select value={form.commodity_id} onChange={(e) => handleChange('commodity_id', parseInt(e.target.value))}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
              <option value={0}>-- Select --</option>
              {commodities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
            {isDM && !isAdmin ? (
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700">
                {districts.find((d) => d.id === form.district_id)?.name || `District #${form.district_id}`}
              </div>
            ) : (
              <select value={form.district_id} onChange={(e) => handleChange('district_id', parseInt(e.target.value))}
                disabled={!canEditBase}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
                <option value={0}>-- Select --</option>
                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contractor</label>
            <select value={form.contractor_id} onChange={(e) => handleChange('contractor_id', parseInt(e.target.value))}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
              <option value={0}>-- Select --</option>
              {contractors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip ID (External)</label>
            <input type="text" value={form.trip_id_ext} onChange={(e) => handleChange('trip_id_ext', e.target.value)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Date</label>
            <input type="date" value={form.trip_date} onChange={(e) => handleChange('trip_date', e.target.value)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Centre</label>
            <input type="text" value={form.from_centre} onChange={(e) => handleChange('from_centre', e.target.value)}
              disabled={!canEditBase} placeholder="e.g. PACS Khaderabad"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Godown</label>
            <select value={form.to_godown_id} onChange={(e) => handleChange('to_godown_id', parseInt(e.target.value))}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
              <option value={0}>-- Select --</option>
              {godowns.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle No</label>
            <input type="text" value={form.vehicle_no} onChange={(e) => handleChange('vehicle_no', e.target.value)}
              disabled={!canEditBase} placeholder="e.g. TS12UA-8171"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bags Sent</label>
            <input type="number" value={form.bags_sent || ''} min={0}
              onChange={(e) => handleChange('bags_sent', parseInt(e.target.value) || 0)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Qtl)</label>
            <input type="number" step="0.01" value={form.weight_qtl || ''} min={0}
              onChange={(e) => handleChange('weight_qtl', parseFloat(e.target.value) || 0)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance Claimed (km)</label>
            <input type="number" step="0.1" value={form.distance_claimed_km || ''} min={0}
              onChange={(e) => handleChange('distance_claimed_km', parseFloat(e.target.value) || 0)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate per km (Rs.)</label>
            <input type="number" step="0.01" value={form.rate_per_km || ''} min={0}
              onChange={(e) => handleChange('rate_per_km', parseFloat(e.target.value) || 0)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Qtl (Rs.)</label>
            <input type="number" step="0.01" value={form.rate_per_qtl || ''} min={0}
              onChange={(e) => handleChange('rate_per_qtl', parseFloat(e.target.value) || 0)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>
        </div>

        {/* Auto-calc bar */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Auto-Calculated</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Amount Claimed</p>
              <p className="text-base font-bold text-gray-800">{formatAmount(amountClaimed)}</p>
              <p className="text-[10px] text-gray-400">Wt x Rate/Qtl or Dist x Rate/km</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount Verified</p>
              <p className="text-base font-bold text-green-600">{form.amount_verified > 0 ? formatAmount(form.amount_verified) : '--'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance to Release</p>
              <p className={`text-base font-bold ${balanceToRelease < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                {formatAmount(balanceToRelease)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Verification Section ────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Distance (km)</label>
            <input type="number" step="0.1" value={form.google_maps_distance_km || ''} min={0}
              onChange={(e) => handleChange('google_maps_distance_km', parseFloat(e.target.value) || 0)}
              disabled={!(isVerifier || isAdmin)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50" />
            {highVariance && (
              <p className="flex items-center gap-1 text-xs text-red-600 mt-1 font-semibold">
                <AlertTriangle className="w-3 h-3" />
                Distance variance: {distanceVariance!.pct > 0 ? '+' : ''}{distanceVariance!.pct.toFixed(1)}% ({distanceVariance!.diff.toFixed(1)} km)
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Verified (Rs.)</label>
            <input type="number" step="0.01" value={form.amount_verified || ''} min={0}
              onChange={(e) => handleChange('amount_verified', parseFloat(e.target.value) || 0)}
              disabled={!(isVerifier || isAdmin)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bags Received</label>
            <input type="number" value={form.bags_received || ''} min={0}
              onChange={(e) => handleChange('bags_received', parseInt(e.target.value) || 0)}
              disabled={!(isVerifier || isAdmin)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight Received (Qtl)</label>
            <input type="number" step="0.01" value={form.weight_received_qtl || ''} min={0}
              onChange={(e) => handleChange('weight_received_qtl', parseFloat(e.target.value) || 0)}
              disabled={!(isVerifier || isAdmin)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50" />
          </div>
        </div>
      </div>

      {/* ─── Payment Section ─────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Released (Rs.)</label>
            <input type="number" step="0.01" value={form.payment_released || ''} min={0}
              onChange={(e) => handleChange('payment_released', parseFloat(e.target.value) || 0)}
              disabled={!(isApprover || isAdmin)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment UTR</label>
            <input type="text" value={form.payment_utr} onChange={(e) => handleChange('payment_utr', e.target.value)}
              disabled={!(isApprover || isAdmin)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Balance to Release</label>
            <div className={`px-3 py-2 rounded-lg border text-sm font-bold ${
              balanceToRelease < 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              {formatAmount(balanceToRelease)}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Actions ─────────────────────────────────── */}
      <div className="flex justify-end gap-3 mb-10">
        {canEditBase && (
          <>
            <button onClick={() => handleSave(false)} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isCreateMode ? 'Save as Draft' : 'Save Draft'}
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TransportTripForm;
