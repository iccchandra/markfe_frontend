// ============================================
// pages/procurement/DistrictProductionForm.tsx — District Production Entry Form
// Route: /procurement/production/:scId/:districtId
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, Send, Loader2, CheckCircle, XCircle, AlertCircle, ArrowLeft, BarChart3,
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

interface FormState {
  sown_area_acres: number | '';
  yield_per_acre_qtl: number | '';
}

export const DistrictProductionForm: React.FC = () => {
  const { scId: scIdParam, districtId: districtIdParam } = useParams<{ scId: string; districtId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const scId = parseInt(scIdParam || '0');
  const districtId = parseInt(districtIdParam || '0');
  const isDM = user?.role === UserRole.DM;

  // Data
  const [districtName, setDistrictName] = useState<string>('');
  const [commodityName, setCommodityName] = useState<string>('');
  const [seasonName, setSeasonName] = useState<string>('');
  const [recordId, setRecordId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('draft');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [submittedAt, setSubmittedAt] = useState<string>('');
  const [verifiedAt, setVerifiedAt] = useState<string>('');
  const [approvedAt, setApprovedAt] = useState<string>('');

  // Form
  const [form, setForm] = useState<FormState>({ sown_area_acres: '', yield_per_acre_qtl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Computed fields
  const sownArea = typeof form.sown_area_acres === 'number' ? form.sown_area_acres : 0;
  const yieldPerAcre = typeof form.yield_per_acre_qtl === 'number' ? form.yield_per_acre_qtl : 0;
  const expectedProdQtl = sownArea * yieldPerAcre;
  const expectedProdMts = expectedProdQtl / 10;

  // Editing state
  const isLocked = status === 'submitted' || status === 'dm_verified' || status === 'manager_approved';
  const canEdit = isDM && !isLocked;

  // ─── Load data ───────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [distRes] = await Promise.all([
          districtsAPI.list(),
        ]);
        const dist = distRes.data.find((d: any) => d.id === districtId);
        setDistrictName(dist?.name || `District #${districtId}`);

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
              // season name is non-critical
            }
          }
        } catch {
          // season commodity info is non-critical
        }

        // Load existing record
        try {
          const res = await districtProductionAPI.get(scId, districtId);
          const data = res.data;
          if (data && data.id) {
            setRecordId(data.id);
            setForm({
              sown_area_acres: num(data.sown_area_acres) || '',
              yield_per_acre_qtl: num(data.yield_per_acre_qtl) || '',
            });
            setStatus(data.status || 'draft');
            setRejectionReason(data.rejection_reason || '');
            setSubmittedAt(data.submitted_at || '');
            setVerifiedAt(data.verified_at || '');
            setApprovedAt(data.approved_at || '');
          }
        } catch {
          // No existing record — form stays empty for new entry
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scId, districtId]);

  // ─── Handlers ────────────────────────────────────
  const handleFieldChange = (field: keyof FormState, value: string) => {
    const parsed = value === '' ? '' : parseFloat(value);
    setForm((prev) => ({ ...prev, [field]: parsed }));
  };

  const handleSave = async (submit: boolean = false) => {
    if (!scId || !districtId) return;

    if (sownArea <= 0 || yieldPerAcre <= 0) {
      setMessage({ type: 'error', text: 'Please enter valid sown area and yield per acre values' });
      return;
    }

    if (submit && !window.confirm('Submit this data for verification? It cannot be edited until it is returned.')) {
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        district_id: districtId,
        sown_area_acres: sownArea,
        yield_per_acre_qtl: yieldPerAcre,
        expected_production_qtl: expectedProdQtl,
        expected_production_mts: expectedProdMts,
      };

      const res = await districtProductionAPI.upsert(scId, payload);
      const savedId = res.data?.id || recordId;
      setRecordId(savedId);

      if (submit && savedId) {
        await districtProductionAPI.submit(scId, savedId);
        setStatus('submitted');
        setMessage({ type: 'success', text: 'Data submitted for verification' });
      } else {
        setStatus('draft');
        setMessage({ type: 'success', text: 'Draft saved successfully' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
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
        onClick={() => navigate('/procurement/production')}
        className="mb-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Production List
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-green-600" />
            District Production Data
          </h1>
          {recordId && <StatusBadge status={status} />}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {districtName}
          {seasonName && <span className="text-blue-600 font-medium"> | {seasonName}</span>}
          {commodityName && <span className="text-green-600 font-medium"> | {commodityName}</span>}
        </p>
      </div>

      {/* District Info */}
      <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg inline-flex items-center gap-2">
        <span className="text-sm font-semibold text-green-700">District: {districtName}</span>
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
          This record has been {status === 'manager_approved' ? 'approved' : status}. Data shown below is read-only.
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
          {/* Sown Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sown Area (acres)
            </label>
            <input
              type="number"
              value={form.sown_area_acres}
              onChange={(e) => handleFieldChange('sown_area_acres', e.target.value)}
              disabled={!canEdit}
              min={0}
              step={0.01}
              placeholder="Enter sown area in acres"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* Yield per Acre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yield per Acre (qtl)
            </label>
            <input
              type="number"
              value={form.yield_per_acre_qtl}
              onChange={(e) => handleFieldChange('yield_per_acre_qtl', e.target.value)}
              disabled={!canEdit}
              min={0}
              step={0.01}
              placeholder="Enter yield per acre in quintals"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* Expected Production (qtl) - Auto-calculated */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Production (qtl)
              <span className="text-xs text-gray-400 ml-1">(auto-calculated)</span>
            </label>
            <input
              type="text"
              value={expectedProdQtl > 0 ? expectedProdQtl.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-medium"
            />
            <p className="text-xs text-gray-400 mt-1">= Sown Area x Yield per Acre</p>
          </div>

          {/* Expected Production (MTs) - Auto-calculated */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Production (MTs)
              <span className="text-xs text-gray-400 ml-1">(auto-calculated)</span>
            </label>
            <input
              type="text"
              value={expectedProdMts > 0 ? expectedProdMts.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-medium"
            />
            <p className="text-xs text-gray-400 mt-1">= Quintals / 10</p>
          </div>
        </div>

        {/* Approval Trail */}
        {recordId && (submittedAt || verifiedAt || approvedAt) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Approval Trail</h3>
            <div className="space-y-2">
              {submittedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Submitted</span>
                  <span className="text-gray-500">{formatDate(submittedAt)}</span>
                </div>
              )}
              {verifiedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Verified</span>
                  <span className="text-gray-500">{formatDate(verifiedAt)}</span>
                </div>
              )}
              {approvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>
                  <span className="text-gray-500">{formatDate(approvedAt)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auto-Calculated Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Sown Area</p>
              <p className="text-lg font-bold text-blue-600">{sownArea > 0 ? sownArea.toLocaleString('en-IN') : '--'} <span className="text-xs font-normal">acres</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Yield/Acre</p>
              <p className="text-lg font-bold text-purple-600">{yieldPerAcre > 0 ? yieldPerAcre.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '--'} <span className="text-xs font-normal">qtl</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Production (qtl)</p>
              <p className="text-lg font-bold text-green-600">{expectedProdQtl > 0 ? expectedProdQtl.toLocaleString('en-IN') : '--'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Production (MTs)</p>
              <p className="text-lg font-bold text-orange-600">{expectedProdMts > 0 ? expectedProdMts.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '--'}</p>
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
              Save as Draft
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

export default DistrictProductionForm;
