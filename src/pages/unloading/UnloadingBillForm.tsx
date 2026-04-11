// ============================================
// pages/unloading/UnloadingBillForm.tsx — Create/Edit Unloading Bill
// Route: /unloading/bills/new  OR  /unloading/bills/:id
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, Send, AlertCircle, CheckCircle, Package, XCircle, ArrowLeft, Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  seasonsAPI, districtsAPI, commoditiesAPI, godownsAPI, htContractorsAPI,
  unloadingBillsAPI,
} from '../../api/services';
import { UserRole, formatAmount, num } from '../../types/markfed';
import type { Season, District } from '../../types/markfed';

// ─── Status Badge ────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  draft:               { label: 'Draft',            bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-300' },
  warehouse_certified: { label: 'WH Certified',    bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-300' },
  dm_verified:         { label: 'DM Verified',      bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-300' },
  manager_approved:    { label: 'Manager Approved', bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-300' },
  rejected:            { label: 'Rejected',         bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-300' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

interface BillForm {
  commodity_id: number;
  district_id: number;
  godown_id: number;
  contractor_id: number;
  invoice_no: string;
  bill_date: string;
  num_bags_claimed: number;
  rate_per_bag: number;
  qty_mts: number;
  asor_charges: number;
  // DM verification
  dm_verified_bags: number;
  dm_verified_rate: number;
  dm_net_amount: number;
  dm_total: number;
  // Manager verification
  mgr_verified_bags: number;
  mgr_verified_rate: number;
  mgr_net_amount: number;
  mgr_total: number;
  // Payment
  payment_released: number;
  tds_amount: number;
}

const emptyForm: BillForm = {
  commodity_id: 0,
  district_id: 0,
  godown_id: 0,
  contractor_id: 0,
  invoice_no: '',
  bill_date: '',
  num_bags_claimed: 0,
  rate_per_bag: 0,
  qty_mts: 0,
  asor_charges: 0,
  dm_verified_bags: 0,
  dm_verified_rate: 0,
  dm_net_amount: 0,
  dm_total: 0,
  mgr_verified_bags: 0,
  mgr_verified_rate: 0,
  mgr_net_amount: 0,
  mgr_total: 0,
  payment_released: 0,
  tds_amount: 0,
};

export const UnloadingBillForm: React.FC = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const isCreateMode = !idParam || idParam === 'new';
  const recordId = isCreateMode ? null : parseInt(idParam);

  const isDM = hasRole(UserRole.DM);
  const isManager = hasRole(UserRole.AO_CAO, UserRole.MD);
  const isAdmin = hasRole(UserRole.SUPER_ADMIN);

  // Reference data
  const [season, setSeason] = useState<Season | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [godowns, setGodowns] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);

  // Form state
  const [form, setForm] = useState<BillForm>(emptyForm);
  const [status, setStatus] = useState<string>('draft');
  const [rejectionReason, setRejectionReason] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isLocked = status === 'manager_approved' || status === 'warehouse_certified' || status === 'dm_verified';
  const canEditBase = isCreateMode || status === 'draft' || status === 'rejected';

  // ─── Auto-calculated fields ───────────────────────
  const billAmount = useMemo(() => form.num_bags_claimed * form.rate_per_bag, [form.num_bags_claimed, form.rate_per_bag]);
  const totalBillClaimed = useMemo(() => billAmount + form.asor_charges, [billAmount, form.asor_charges]);
  const balanceToRelease = useMemo(() => totalBillClaimed - form.payment_released - form.tds_amount, [totalBillClaimed, form.payment_released, form.tds_amount]);

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

        // Pre-select district for DM
        if (isCreateMode && user?.role === UserRole.DM && user.district_id) {
          setForm((prev) => ({ ...prev, district_id: user.district_id! }));
        }

        // Load existing record for edit mode
        if (!isCreateMode && recordId && seasonRes.data) {
          try {
            const billRes = await unloadingBillsAPI.get(seasonRes.data.id, recordId);
            const raw = billRes.data;
            setForm({
              commodity_id: num(raw.commodity_id),
              district_id: num(raw.district_id),
              godown_id: num(raw.godown_id),
              contractor_id: num(raw.contractor_id),
              invoice_no: raw.invoice_no || '',
              bill_date: raw.bill_date ? raw.bill_date.split('T')[0] : '',
              num_bags_claimed: num(raw.num_bags_claimed),
              rate_per_bag: num(raw.rate_per_bag),
              qty_mts: num(raw.qty_mts),
              asor_charges: num(raw.asor_charges),
              dm_verified_bags: num(raw.dm_verified_bags),
              dm_verified_rate: num(raw.dm_verified_rate),
              dm_net_amount: num(raw.dm_net_amount),
              dm_total: num(raw.dm_total),
              mgr_verified_bags: num(raw.mgr_verified_bags),
              mgr_verified_rate: num(raw.mgr_verified_rate),
              mgr_net_amount: num(raw.mgr_net_amount),
              mgr_total: num(raw.mgr_total),
              payment_released: num(raw.payment_released),
              tds_amount: num(raw.tds_amount),
            });
            setStatus(raw.status || 'draft');
            setRejectionReason(raw.rejection_reason || '');
          } catch (err: any) {
            setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load bill' });
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
  const handleChange = (field: keyof BillForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (submit: boolean = false) => {
    if (!season) return;

    if (!form.commodity_id || !form.district_id || !form.godown_id || !form.contractor_id) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (submit && form.num_bags_claimed <= 0) {
      setMessage({ type: 'error', text: 'Number of bags must be greater than 0' });
      return;
    }

    if (submit && !window.confirm('Submit this bill?')) return;

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        commodity_id: form.commodity_id,
        district_id: form.district_id,
        godown_id: form.godown_id,
        contractor_id: form.contractor_id,
        invoice_no: form.invoice_no,
        bill_date: form.bill_date,
        num_bags_claimed: form.num_bags_claimed,
        rate_per_bag: form.rate_per_bag,
        qty_mts: form.qty_mts,
        asor_charges: form.asor_charges,
        bill_amount: billAmount,
        total_bill_claimed: totalBillClaimed,
        payment_released: form.payment_released,
        tds_amount: form.tds_amount,
        balance_to_release: balanceToRelease,
      };

      if (isCreateMode) {
        const res = await unloadingBillsAPI.create(season.id, payload);
        const newId = res.data.id;
        setMessage({ type: 'success', text: submit ? 'Bill created and submitted' : 'Bill created as draft' });
        if (newId) navigate(`/unloading/bills/${newId}`, { replace: true });
      } else if (recordId) {
        await unloadingBillsAPI.update(season.id, recordId, payload);
        setMessage({ type: 'success', text: submit ? 'Bill submitted' : 'Draft saved' });
        if (!submit) setTimeout(() => setMessage(null), 3000);
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
      <button onClick={() => navigate('/unloading/bills')}
        className="mb-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Bills
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-7 h-7 text-blue-600" />
            {isCreateMode ? 'New Unloading Bill' : 'Unloading Bill'}
          </h1>
          {!isCreateMode && <StatusBadge status={status} />}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {isCreateMode ? 'Create a new unloading bill' : `Invoice: ${form.invoice_no || '--'}`}
          {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
        </p>
      </div>

      {/* Rejection banner */}
      {status === 'rejected' && rejectionReason && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div><p className="font-semibold">Rejected</p><p className="mt-0.5">Reason: {rejectionReason}</p></div>
        </div>
      )}

      {isLocked && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          This bill has been {status.replace('_', ' ')}. Base fields are read-only.
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

      {/* ─── Basic Info Section ─────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Commodity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commodity <span className="text-red-500">*</span></label>
            <select value={form.commodity_id} onChange={(e) => handleChange('commodity_id', parseInt(e.target.value))}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
              <option value={0}>-- Select --</option>
              {commodities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* District */}
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

          {/* Godown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Godown <span className="text-red-500">*</span></label>
            <select value={form.godown_id} onChange={(e) => handleChange('godown_id', parseInt(e.target.value))}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
              <option value={0}>-- Select --</option>
              {godowns.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            {godowns.length === 0 && form.district_id > 0 && (
              <p className="text-xs text-amber-600 mt-1">No godowns found for this district</p>
            )}
          </div>

          {/* Contractor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contractor <span className="text-red-500">*</span></label>
            <select value={form.contractor_id} onChange={(e) => handleChange('contractor_id', parseInt(e.target.value))}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
              <option value={0}>-- Select --</option>
              {contractors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Invoice No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
            <input type="text" value={form.invoice_no} onChange={(e) => handleChange('invoice_no', e.target.value)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          {/* Bill Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
            <input type="date" value={form.bill_date} onChange={(e) => handleChange('bill_date', e.target.value)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          {/* Bags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. of Bags Claimed</label>
            <input type="number" value={form.num_bags_claimed || ''} min={0}
              onChange={(e) => handleChange('num_bags_claimed', parseInt(e.target.value) || 0)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          {/* Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Bag (Rs.)</label>
            <input type="number" step="0.01" value={form.rate_per_bag || ''} min={0}
              onChange={(e) => handleChange('rate_per_bag', parseFloat(e.target.value) || 0)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          {/* Qty MTs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (MTs)</label>
            <input type="number" step="0.001" value={form.qty_mts || ''} min={0}
              onChange={(e) => handleChange('qty_mts', parseFloat(e.target.value) || 0)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>

          {/* ASOR Charges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ASOR Charges (Rs.)</label>
            <input type="number" step="0.01" value={form.asor_charges || ''} min={0}
              onChange={(e) => handleChange('asor_charges', parseFloat(e.target.value) || 0)}
              disabled={!canEditBase}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>
        </div>

        {/* Auto-calc bar */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Auto-Calculated</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Bill Amount</p>
              <p className="text-base font-bold text-gray-800">{formatAmount(billAmount)}</p>
              <p className="text-[10px] text-gray-400">Bags x Rate</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Bill Claimed</p>
              <p className="text-base font-bold text-blue-600">{formatAmount(totalBillClaimed)}</p>
              <p className="text-[10px] text-gray-400">Bill + ASOR</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance to Release</p>
              <p className={`text-base font-bold ${balanceToRelease < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatAmount(balanceToRelease)}
              </p>
              <p className="text-[10px] text-gray-400">Claimed - Paid - TDS</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DM Verification Section ─────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">DM Verification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DM Verified Bags</label>
            <input type="number" value={form.dm_verified_bags || ''} min={0}
              onChange={(e) => handleChange('dm_verified_bags', parseInt(e.target.value) || 0)}
              disabled={!(isDM || isAdmin) || !['warehouse_certified'].includes(status)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DM Verified Rate</label>
            <input type="number" step="0.01" value={form.dm_verified_rate || ''} min={0}
              onChange={(e) => handleChange('dm_verified_rate', parseFloat(e.target.value) || 0)}
              disabled={!(isDM || isAdmin) || !['warehouse_certified'].includes(status)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DM Net Amount</label>
            <input type="number" value={form.dm_net_amount || ''} readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DM Total</label>
            <input type="number" value={form.dm_total || ''} readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
      </div>

      {/* ─── Manager Verification Section ────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager Verification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Verified Bags</label>
            <input type="number" value={form.mgr_verified_bags || ''} min={0}
              onChange={(e) => handleChange('mgr_verified_bags', parseInt(e.target.value) || 0)}
              disabled={!(isManager || isAdmin) || !['dm_verified'].includes(status)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Verified Rate</label>
            <input type="number" step="0.01" value={form.mgr_verified_rate || ''} min={0}
              onChange={(e) => handleChange('mgr_verified_rate', parseFloat(e.target.value) || 0)}
              disabled={!(isManager || isAdmin) || !['dm_verified'].includes(status)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Net Amount</label>
            <input type="number" value={form.mgr_net_amount || ''} readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Total</label>
            <input type="number" value={form.mgr_total || ''} readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
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
              disabled={!(isManager || isAdmin)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TDS Amount (Rs.)</label>
            <input type="number" step="0.01" value={form.tds_amount || ''} min={0}
              onChange={(e) => handleChange('tds_amount', parseFloat(e.target.value) || 0)}
              disabled={!(isManager || isAdmin)}
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

export default UnloadingBillForm;
