// ============================================
// pages/procurement/ProcurementTrackingForm.tsx — Procurement Tracking Entry Form
// Route: /procurement/tracking/:scId/new  OR  /procurement/tracking/:scId/:id
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, Send, Loader2, CheckCircle, XCircle, AlertCircle, ArrowLeft, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  seasonsAPI, seasonCommoditiesAPI, districtsAPI, procurementTrackingAPI,
} from '../../api/services';
import { UserRole, num } from '../../types/markfed';

// ─── Status Badge ───────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  draft:            { label: 'Draft',     bg: 'bg-yellow-100', text: 'text-yellow-800' },
  submitted:        { label: 'Submitted', bg: 'bg-blue-100',   text: 'text-blue-800' },
  dm_verified:      { label: 'Verified',  bg: 'bg-orange-100', text: 'text-orange-800' },
  verified:         { label: 'Verified',  bg: 'bg-orange-100', text: 'text-orange-800' },
  manager_approved: { label: 'Approved',  bg: 'bg-green-100',  text: 'text-green-800' },
  approved:         { label: 'Approved',  bg: 'bg-green-100',  text: 'text-green-800' },
  rejected:         { label: 'Rejected',  bg: 'bg-red-100',    text: 'text-red-800' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};

interface FormState {
  tracking_date: string;
  district_id: number;
  qty_procured_qtl: number | '';
  value_cr: number | '';
  farmers_benefitted: number | '';
  funds_released_cr: number | '';
}

const emptyForm: FormState = {
  tracking_date: new Date().toISOString().split('T')[0],
  district_id: 0,
  qty_procured_qtl: '',
  value_cr: '',
  farmers_benefitted: '',
  funds_released_cr: '',
};

export const ProcurementTrackingForm: React.FC = () => {
  const { scId: scIdParam, id: idParam } = useParams<{ scId: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const scId = parseInt(scIdParam || '0');
  const isCreateMode = !idParam || idParam === 'new';
  const recordId = isCreateMode ? null : parseInt(idParam);
  const isDM = user?.role === UserRole.DM;

  // Data
  const [districts, setDistricts] = useState<any[]>([]);
  const [seasonName, setSeasonName] = useState<string>('');
  const [commodityName, setCommodityName] = useState<string>('');
  const [status, setStatus] = useState<string>('draft');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Form
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    district_id: isDM && user?.district_id ? user.district_id : 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Computed
  const qtyQtl = typeof form.qty_procured_qtl === 'number' ? form.qty_procured_qtl : 0;
  const qtyMts = qtyQtl / 10;
  const valueCr = typeof form.value_cr === 'number' ? form.value_cr : 0;
  const fundsReleasedCr = typeof form.funds_released_cr === 'number' ? form.funds_released_cr : 0;
  const balanceCr = valueCr - fundsReleasedCr;

  // Editing state
  const isLocked = status === 'submitted' || status === 'verified' || status === 'dm_verified' || status === 'approved' || status === 'manager_approved';
  const canEdit = !isLocked;

  // District name map
  const districtMap = useMemo(() => {
    const map: Record<number, string> = {};
    districts.forEach((d) => { map[d.id] = d.name; });
    return map;
  }, [districts]);

  // ─── Load data ───────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const distRes = await districtsAPI.list();
        setDistricts(distRes.data);

        // Load season-commodity info
        try {
          const scRes = await seasonCommoditiesAPI.get(0, scId);
          const sc = scRes.data;
          setCommodityName(sc?.commodity?.name || sc?.commodity_name || '');
          if (sc?.season_id) {
            try {
              const seasonList = await seasonsAPI.list();
              const season = seasonList.data.find((s: any) => s.id === sc.season_id);
              setSeasonName(season?.season_name || '');
            } catch {
              // non-critical
            }
          }
        } catch {
          // non-critical
        }

        // Load existing record for edit mode
        if (!isCreateMode && recordId) {
          try {
            const res = await procurementTrackingAPI.get(scId, recordId);
            const data = res.data;
            setForm({
              tracking_date: data.tracking_date ? data.tracking_date.split('T')[0] : '',
              district_id: data.district_id || 0,
              qty_procured_qtl: num(data.qty_procured_qtl) || '',
              value_cr: num(data.value_cr) || '',
              farmers_benefitted: num(data.farmers_benefitted) || '',
              funds_released_cr: num(data.funds_released_cr) || '',
            });
            setStatus(data.status || 'draft');
            setRejectionReason(data.rejection_reason || '');
          } catch (err: any) {
            setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load record' });
          }
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scId, isCreateMode, recordId, isDM, user]);

  // ─── Handlers ────────────────────────────────────
  const handleFieldChange = (field: keyof FormState, value: string) => {
    if (field === 'tracking_date') {
      setForm((prev) => ({ ...prev, [field]: value }));
    } else if (field === 'district_id') {
      setForm((prev) => ({ ...prev, [field]: parseInt(value) }));
    } else {
      const parsed = value === '' ? '' : parseFloat(value);
      setForm((prev) => ({ ...prev, [field]: parsed }));
    }
  };

  const handleSave = async (submit: boolean = false) => {
    if (!scId) return;

    if (!form.district_id) {
      setMessage({ type: 'error', text: 'Please select a district' });
      return;
    }
    if (!form.tracking_date) {
      setMessage({ type: 'error', text: 'Please select a tracking date' });
      return;
    }
    if (qtyQtl <= 0) {
      setMessage({ type: 'error', text: 'Please enter quantity procured' });
      return;
    }

    if (submit && !window.confirm('Submit this record for verification? It cannot be edited until it is returned.')) {
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        tracking_date: form.tracking_date,
        district_id: form.district_id,
        qty_procured_qtl: qtyQtl,
        qty_procured_mts: qtyMts,
        value_cr: valueCr,
        farmers_benefitted: typeof form.farmers_benefitted === 'number' ? form.farmers_benefitted : 0,
        funds_released_cr: fundsReleasedCr,
      };

      let savedId = recordId;

      if (isCreateMode) {
        const res = await procurementTrackingAPI.create(scId, payload);
        savedId = res.data?.id;
        if (submit && savedId) {
          await procurementTrackingAPI.submit(scId, savedId);
          setStatus('submitted');
          setMessage({ type: 'success', text: 'Record created and submitted for verification' });
        } else {
          setMessage({ type: 'success', text: 'Record created as draft' });
        }
        // Navigate to the edit page for the newly created record
        if (savedId) {
          navigate(`/procurement/tracking/${scId}/${savedId}`, { replace: true });
        }
      } else if (savedId) {
        await procurementTrackingAPI.update(scId, savedId, payload);
        if (submit) {
          await procurementTrackingAPI.submit(scId, savedId);
          setStatus('submitted');
          setMessage({ type: 'success', text: 'Record submitted for verification' });
        } else {
          setMessage({ type: 'success', text: 'Draft saved successfully' });
          setTimeout(() => setMessage(null), 3000);
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/procurement/tracking')}
        className="mb-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tracking List
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-green-600" />
            {isCreateMode ? 'New Procurement Entry' : 'Procurement Tracking'}
          </h1>
          {!isCreateMode && <StatusBadge status={status} />}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {isCreateMode ? 'Create a new procurement tracking entry' : 'View / edit procurement record'}
          {seasonName && <span className="text-blue-600 font-medium"> | {seasonName}</span>}
          {commodityName && <span className="text-green-600 font-medium"> | {commodityName}</span>}
        </p>
      </div>

      {/* Rejection banner */}
      {status === 'rejected' && rejectionReason && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Rejected</p>
            <p className="mt-0.5">{rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Locked banner */}
      {isLocked && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          This record has been {status === 'manager_approved' || status === 'approved' ? 'approved' : status}. Data shown below is read-only.
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
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tracking Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Date</label>
            <input
              type="date"
              value={form.tracking_date}
              onChange={(e) => handleFieldChange('tracking_date', e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
            />
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
                onChange={(e) => handleFieldChange('district_id', e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
              >
                <option value={0}>-- Select District --</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Qty Procured (qtl) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qty Procured (qtl)</label>
            <input
              type="number"
              value={form.qty_procured_qtl}
              onChange={(e) => handleFieldChange('qty_procured_qtl', e.target.value)}
              disabled={!canEdit}
              min={0}
              step={0.01}
              placeholder="Enter quantity in quintals"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* Qty Procured (MTs) - Auto-calculated */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qty Procured (MTs)
              <span className="text-xs text-gray-400 ml-1">(auto-calculated)</span>
            </label>
            <input
              type="text"
              value={qtyMts > 0 ? qtyMts.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-medium"
            />
            <p className="text-xs text-gray-400 mt-1">= Quintals / 10</p>
          </div>

          {/* Value (Cr) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value (Cr)
              <span className="text-xs text-gray-400 ml-1">(qty x MSP)</span>
            </label>
            <input
              type="number"
              value={form.value_cr}
              onChange={(e) => handleFieldChange('value_cr', e.target.value)}
              disabled={!canEdit}
              min={0}
              step={0.01}
              placeholder="Total value in crores"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* Farmers Benefitted */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farmers Benefitted</label>
            <input
              type="number"
              value={form.farmers_benefitted}
              onChange={(e) => handleFieldChange('farmers_benefitted', e.target.value)}
              disabled={!canEdit}
              min={0}
              step={1}
              placeholder="Number of farmers"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* Funds Released (Cr) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funds Released (Cr)
              <span className="text-xs text-gray-400 ml-1">(actual payments, can be partial)</span>
            </label>
            <input
              type="number"
              value={form.funds_released_cr}
              onChange={(e) => handleFieldChange('funds_released_cr', e.target.value)}
              disabled={!canEdit}
              min={0}
              step={0.01}
              placeholder="Funds released in crores"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* Balance Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Balance (Cr)
              <span className="text-xs text-gray-400 ml-1">(value - funds released)</span>
            </label>
            <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${
              balanceCr < 0
                ? 'bg-red-50 border-red-200 text-red-700'
                : balanceCr === 0
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-orange-50 border-orange-200 text-orange-700'
            }`}>
              {(valueCr > 0 || fundsReleasedCr > 0)
                ? balanceCr.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + ' Cr'
                : '--'
              }
            </div>
          </div>
        </div>

        {/* Business Rule Note */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <AlertCircle className="w-4 h-4 inline mr-1" />
          <strong>Note:</strong> Procurement is credit first. Value = qty x MSP rate. Funds released tracks actual payments to farmers (can be partial).
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Qty Procured</p>
              <p className="text-lg font-bold text-blue-600">
                {qtyMts > 0 ? qtyMts.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '--'}
                <span className="text-xs font-normal ml-1">MTs</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Value</p>
              <p className="text-lg font-bold text-green-600">
                {valueCr > 0 ? valueCr.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '--'}
                <span className="text-xs font-normal ml-1">Cr</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Funds Released</p>
              <p className="text-lg font-bold text-purple-600">
                {fundsReleasedCr > 0 ? fundsReleasedCr.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '--'}
                <span className="text-xs font-normal ml-1">Cr</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance</p>
              <p className={`text-lg font-bold ${balanceCr < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                {(valueCr > 0 || fundsReleasedCr > 0)
                  ? balanceCr.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                  : '--'
                }
                <span className="text-xs font-normal ml-1">Cr</span>
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isCreateMode ? 'Save as Draft' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/30 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Save & Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcurementTrackingForm;
