// ============================================
// pages/data-entry/UtilizationForm.tsx — Dynamic Utilization Heads
// DM fills utilization per their district
// ============================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Save, Send, AlertCircle, CheckCircle, PieChart, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { utilizationAPI, utilizationHeadsAPI, drawdownsAPI, districtsAPI, seasonsAPI } from '../../api/services';
import type { UtilizationHead, Season, District, DistrictDrawdown, ApprovalStatus } from '../../types/markfed';
import { UserRole, formatIndianCurrency, num } from '../../types/markfed';

// ─── Status Badge ────────────────────────────────
const STATUS_CONFIG: Record<ApprovalStatus, { label: string; bg: string; text: string; border: string }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
  submitted: { label: 'Submitted', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  approved: { label: 'Approved', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
};

const StatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

// ─── Form State ──────────────────────────────────
interface FormState {
  remarks: string;
  values: Record<number, number>; // utilization_head.id -> amount_rs
}

const emptyForm: FormState = { remarks: '', values: {} };

export const UtilizationForm: React.FC = () => {
  const { user, canEditField } = useAuth();
  const baseCanEdit = canEditField('utilization');

  // Core data
  const [season, setSeason] = useState<Season | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(0);
  const [heads, setHeads] = useState<UtilizationHead[]>([]);
  const [drawdowns, setDrawdowns] = useState<DistrictDrawdown[]>([]);

  // Form
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<ApprovalStatus>('draft');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editing is disabled when the record is submitted or approved
  const isLocked = status === 'submitted' || status === 'approved';
  const canEdit = baseCanEdit && !isLocked;

  // ─── Load season, districts, utilization heads on mount ───
  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, distRes, headsRes] = await Promise.all([
          seasonsAPI.active(),
          districtsAPI.list(),
          utilizationHeadsAPI.list({ is_active: true }),
        ]);
        setSeason(seasonRes.data);
        setDistricts(distRes.data);

        // Sort heads by display_order
        const sortedHeads = [...headsRes.data].sort((a, b) => a.display_order - b.display_order);
        setHeads(sortedHeads);

        // DM is locked to their district
        if (user?.role === UserRole.DM && user.district_id) {
          setSelectedDistrictId(user.district_id);
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load initial data' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // ─── Load utilization + drawdown data when district changes ───
  useEffect(() => {
    if (!season || !selectedDistrictId) return;

    const load = async () => {
      try {
        const [utilRes, ddRes] = await Promise.allSettled([
          utilizationAPI.get(season.id, selectedDistrictId),
          drawdownsAPI.getByDistrict(season.id, selectedDistrictId),
        ]);

        if (utilRes.status === 'fulfilled') {
          const raw = utilRes.value.data;

          // Build values map from entries array
          const values: Record<number, number> = {};
          if (raw.entries && raw.entries.length > 0) {
            for (const entry of raw.entries) {
              values[entry.utilization_head_id] = num(entry.amount_rs);
            }
          }

          setForm({ remarks: raw.remarks || '', values });
          setStatus((raw.status as ApprovalStatus) || 'draft');
          setRejectionReason(raw.rejection_reason || '');
        } else {
          setForm(emptyForm);
          setStatus('draft');
          setRejectionReason('');
        }

        if (ddRes.status === 'fulfilled') {
          setDrawdowns(
            ddRes.value.data.map((d: any) => ({ ...d, amount_withdrawn_rs: num(d.amount_withdrawn_rs) }))
          );
        } else {
          setDrawdowns([]);
        }
      } catch {
        /* handled by allSettled */
      }
    };
    load();
  }, [season, selectedDistrictId]);

  // ─── Computed values ───────────────────────────────
  const totalUtilised = useMemo(
    () => Object.values(form.values).reduce((sum, v) => sum + (v || 0), 0),
    [form.values]
  );

  const amountReceivedFromHOD = useMemo(
    () => drawdowns.reduce((sum, d) => sum + (d.amount_withdrawn_rs || 0), 0),
    [drawdowns]
  );

  const balance = amountReceivedFromHOD - totalUtilised;
  const overUtilised = totalUtilised > amountReceivedFromHOD && amountReceivedFromHOD > 0;

  // ─── Handlers ──────────────────────────────────────
  const handleValueChange = useCallback((headId: number, value: number) => {
    setForm((prev) => ({
      ...prev,
      values: { ...prev.values, [headId]: value },
    }));
  }, []);

  const handleRemarksChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, remarks: value }));
  }, []);

  const handleSave = async (submit: boolean = false) => {
    if (!season || !selectedDistrictId) return;

    if (submit) {
      const allZero = heads.every((h) => !form.values[h.id] || form.values[h.id] === 0);
      if (allZero) {
        setMessage({ type: 'error', text: 'Please fill at least one utilization field' });
        return;
      }
      if (!window.confirm('Submit utilization data? This will be sent for review and cannot be edited until it is returned.')) return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        remarks: form.remarks,
        entries: heads.map((h) => ({
          utilization_head_id: h.id,
          amount_rs: form.values[h.id] || 0,
        })),
      };

      await utilizationAPI.upsert(season.id, selectedDistrictId, payload);

      if (submit) {
        await utilizationAPI.submit(season.id, selectedDistrictId);
        setStatus('submitted');
        setMessage({ type: 'success', text: 'Data submitted successfully for review' });
      } else {
        setMessage({ type: 'success', text: 'Draft saved successfully' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const districtName = districts.find((d) => d.id === selectedDistrictId)?.name || '';

  // ─── Render ────────────────────────────────────────
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <PieChart className="w-7 h-7 text-green-600" />
            Fund Utilization
          </h1>
          {selectedDistrictId > 0 && <StatusBadge status={status} />}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          District-wise utilization of funds
          {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
        </p>
      </div>

      {/* District Selector (SUPER_ADMIN) or Display (DM) */}
      {user?.role === UserRole.SUPER_ADMIN ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select District</label>
          <select
            value={selectedDistrictId || ''}
            onChange={(e) => setSelectedDistrictId(parseInt(e.target.value))}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose District --</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      ) : (
        selectedDistrictId > 0 && (
          <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg inline-block">
            <span className="text-sm font-semibold text-green-700">District: {districtName}</span>
          </div>
        )
      )}

      {!selectedDistrictId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          Please select a district to fill utilization data.
        </div>
      ) : (
        <>
          {/* Rejection reason banner */}
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
              This record has been {status} and cannot be edited.
            </div>
          )}

          {/* Drawdown Info (read-only) */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Funds Received from HOD</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Received</p>
                <p className="text-lg font-bold text-blue-600">Rs. {formatIndianCurrency(amountReceivedFromHOD)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Drawdown Entries</p>
                <p className="text-sm text-gray-700">
                  {drawdowns.length > 0
                    ? drawdowns.map((d) => `Rs.${formatIndianCurrency(d.amount_withdrawn_rs)} (UTR: ${d.utr_no})`).join(', ')
                    : 'No drawdowns recorded for this district'}
                </p>
              </div>
            </div>
          </div>

          {/* Over-utilization warning */}
          {overUtilised && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              Total utilization exceeds received amount from HOD
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

          {/* Utilization Form — dynamic fields */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {heads.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No utilization heads configured. Contact the administrator.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heads.map((head) => (
                  <div key={head.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {head.entry_role === UserRole.DM && (
                        <span className="text-green-500 text-xs mr-1">DM</span>
                      )}
                      {head.name}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
                      <input
                        type="number"
                        value={form.values[head.id] || ''}
                        onChange={(e) => handleValueChange(head.id, parseFloat(e.target.value) || 0)}
                        disabled={!canEdit}
                        min={0}
                        step={0.01}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                ))}

                {/* Remarks */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={form.remarks}
                    onChange={(e) => handleRemarksChange(e.target.value)}
                    disabled={!canEdit}
                    maxLength={500}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            )}

            {/* Auto-Calculated Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Total Utilised</p>
                  <p className="text-lg font-bold text-green-600">Rs. {formatIndianCurrency(totalUtilised)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Received from HOD</p>
                  <p className="text-lg font-bold text-blue-600">Rs. {formatIndianCurrency(amountReceivedFromHOD)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Balance with DM</p>
                  <p className={`text-lg font-bold ${balance < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    Rs. {formatIndianCurrency(balance)}
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
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/30 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit for Review
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UtilizationForm;
