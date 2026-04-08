// ============================================
// pages/data-entry/FarmersForm.tsx — District Farmers Data Form
// Supports creating new records and editing existing records by ID
// Route: /data-entry/farmers/new  OR  /data-entry/farmers/:id
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Send, AlertCircle, CheckCircle, Users, ShieldCheck, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { farmersAPI, drawdownsAPI, pacsAPI, districtsAPI, seasonsAPI } from '../../api/services';
import type { DistrictFarmers, District, Season, PACSEntity, DistrictDrawdown, ApprovalStatus } from '../../types/markfed';
import { UserRole, calcCostOfProcuredQty, formatAmount, num } from '../../types/markfed';

// ─── Status Badge ────────────────────────────────
const STATUS_CONFIG: Record<ApprovalStatus, { label: string; bg: string; text: string; border: string }> = {
  draft:     { label: 'Draft',     bg: 'bg-gray-100',   text: 'text-gray-600',  border: 'border-gray-300' },
  submitted: { label: 'Submitted', bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-300' },
  approved:  { label: 'Approved',  bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-300' },
  rejected:  { label: 'Rejected',  bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-300' },
};

const StatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

const emptyFarmers: DistrictFarmers = {
  season_id: 0,
  district_id: 0,
  pacs_count: 0,
  pacs_entity_id: null,
  farmers_count: 0,
  quantity_procured_qtl: 0,
  cost_of_procured_qty_rs: 0,
  payment_released_to_farmers_rs: 0,
  remarks: '',
};

export const FarmersForm: React.FC = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, canEditField, hasRole } = useAuth();
  const canEditBase = canEditField('farmers');
  const canApprove = hasRole(UserRole.AO_CAO) || hasRole(UserRole.MD) || hasRole(UserRole.SUPER_ADMIN);

  const isCreateMode = !idParam || idParam === 'new';
  const recordId = isCreateMode ? null : parseInt(idParam);

  // Core data
  const [season, setSeason] = useState<Season | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [pacsEntities, setPacsEntities] = useState<PACSEntity[]>([]);
  const [drawdowns, setDrawdowns] = useState<DistrictDrawdown[]>([]);

  // Selected district (for create mode, user picks; for edit mode, loaded from record)
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(0);
  const [districtName, setDistrictName] = useState<string>('');

  // Form
  const [form, setForm] = useState<DistrictFarmers>(emptyFarmers);
  const [status, setStatus] = useState<ApprovalStatus>('draft');
  const [rejectionReason, setRejectionReason] = useState('');

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editing is disabled when the record is submitted or approved
  const isLocked = status === 'submitted' || status === 'approved';
  const canEdit = canEditBase && !isLocked;

  // DM users are locked to their district
  const isDM = user?.role === UserRole.DM;
  const dmDistrictId = isDM ? user?.district_id || 0 : 0;

  // ─── Load initial data (season, districts) ─────
  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, distRes] = await Promise.all([seasonsAPI.active(), districtsAPI.list()]);
        const activeSeason = seasonRes.data;
        const districtList: District[] = distRes.data;
        setSeason(activeSeason);
        setDistricts(districtList);

        // For DM in create mode, pre-select their district
        if (isCreateMode && isDM && dmDistrictId) {
          setSelectedDistrictId(dmDistrictId);
          const dist = districtList.find((d) => d.id === dmDistrictId);
          setDistrictName(dist?.name || `District #${dmDistrictId}`);
        }

        // For edit mode, load the existing record
        if (!isCreateMode && recordId && activeSeason) {
          try {
            const farmersRes = await farmersAPI.get(activeSeason.id, recordId);
            const raw = farmersRes.data;

            // Set district from loaded record
            setSelectedDistrictId(raw.district_id);
            const dist = districtList.find((d: District) => d.id === raw.district_id);
            setDistrictName(dist?.name || raw.district_name || `District #${raw.district_id}`);

            setForm({
              ...emptyFarmers,
              ...raw,
              season_id: activeSeason.id,
              district_id: raw.district_id,
              pacs_count: num(raw.pacs_count),
              farmers_count: num(raw.farmers_count),
              quantity_procured_qtl: num(raw.quantity_procured_qtl),
              cost_of_procured_qty_rs: num(raw.cost_of_procured_qty_rs),
              payment_released_to_farmers_rs: num(raw.payment_released_to_farmers_rs),
              remarks: raw.remarks || '',
            });
            setStatus((raw.status as ApprovalStatus) || 'draft');
            setRejectionReason(raw.rejection_reason || '');
          } catch (err: any) {
            setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load farmers record' });
          }
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isCreateMode, recordId, isDM, dmDistrictId]);

  // ─── Load PACS entities and drawdowns when district changes ─────
  useEffect(() => {
    if (!season || !selectedDistrictId) {
      setPacsEntities([]);
      setDrawdowns([]);
      return;
    }

    const loadDistrictData = async () => {
      try {
        const [ddRes, pacsRes] = await Promise.allSettled([
          drawdownsAPI.getByDistrict(season.id, selectedDistrictId),
          pacsAPI.list(selectedDistrictId),
        ]);

        setDrawdowns(
          ddRes.status === 'fulfilled'
            ? ddRes.value.data.map((d: any) => ({ ...d, amount_withdrawn_rs: num(d.amount_withdrawn_rs) }))
            : []
        );
        setPacsEntities(pacsRes.status === 'fulfilled' ? pacsRes.value.data : []);
      } catch {
        setDrawdowns([]);
        setPacsEntities([]);
      }
    };
    loadDistrictData();
  }, [season, selectedDistrictId]);

  // ─── District selection handler (create mode) ─────
  const handleDistrictChange = (distId: number) => {
    setSelectedDistrictId(distId);
    const dist = districts.find((d) => d.id === distId);
    setDistrictName(dist?.name || '');
    // Reset PACS entity selection when district changes
    setForm((prev) => ({ ...prev, pacs_entity_id: null }));
  };

  // ─── Auto calculations ─────────────────────────────
  const mspRate = num(season?.msp_rate);
  const costOfProcuredQty = useMemo(
    () => calcCostOfProcuredQty(form.quantity_procured_qtl, mspRate),
    [form.quantity_procured_qtl, mspRate]
  );
  const amountReceivedFromHO = useMemo(
    () => drawdowns.reduce((sum, d) => sum + (d.amount_withdrawn_rs || 0), 0),
    [drawdowns]
  );
  const balanceToRelease = amountReceivedFromHO - form.payment_released_to_farmers_rs;
  const balanceDueFromHOD = costOfProcuredQty - amountReceivedFromHO;
  const overPayment = form.payment_released_to_farmers_rs > amountReceivedFromHO && amountReceivedFromHO > 0;

  const handleChange = (field: keyof DistrictFarmers, value: number | string | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (submit: boolean = false) => {
    if (!season) return;

    // Validate district is selected
    if (!selectedDistrictId) {
      setMessage({ type: 'error', text: 'Please select a district' });
      return;
    }

    if (submit) {
      if (form.quantity_procured_qtl <= 0) {
        setMessage({ type: 'error', text: 'Quantity procured must be > 0' });
        return;
      }
      if (form.pacs_count < 1) {
        setMessage({ type: 'error', text: 'PACS count must be at least 1' });
        return;
      }
      if (!window.confirm('Submit farmers data for review?')) return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        district_id: selectedDistrictId,
        pacs_count: form.pacs_count,
        pacs_entity_id: form.pacs_entity_id,
        farmers_count: form.farmers_count,
        quantity_procured_qtl: form.quantity_procured_qtl,
        cost_of_procured_qty_rs: costOfProcuredQty,
        payment_released_to_farmers_rs: form.payment_released_to_farmers_rs,
        remarks: form.remarks,
      };

      if (isCreateMode) {
        // Create new record
        const res = await farmersAPI.create(season.id, payload);
        const newId = res.data.id;

        if (submit && newId) {
          await farmersAPI.submit(season.id, newId);
          setStatus('submitted');
          setMessage({ type: 'success', text: 'Record created and submitted for review' });
        } else {
          setMessage({ type: 'success', text: 'Record created as draft' });
        }

        // Navigate to the newly created record
        if (newId) {
          navigate(`/data-entry/farmers/${newId}`, { replace: true });
        }
      } else if (recordId) {
        // Update existing record
        await farmersAPI.update(season.id, recordId, payload);

        if (submit) {
          await farmersAPI.submit(season.id, recordId);
          setStatus('submitted');
          setMessage({ type: 'success', text: 'Data submitted successfully for review' });
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

  const handleApprove = async () => {
    if (!season || !recordId) return;
    if (!window.confirm('Approve this farmers data?')) return;
    setSaving(true);
    try {
      await farmersAPI.approve(season.id, recordId);
      setStatus('approved');
      setMessage({ type: 'success', text: 'Approved' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to approve' });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!season || !recordId) return;
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    setSaving(true);
    try {
      await farmersAPI.reject(season.id, recordId, reason);
      setStatus('rejected');
      setRejectionReason(reason);
      setMessage({ type: 'success', text: 'Rejected' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reject' });
    } finally {
      setSaving(false);
    }
  };

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
      {/* Back to List */}
      <button
        onClick={() => navigate('/data-entry/farmers')}
        className="mb-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to List
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-7 h-7 text-green-600" />
            {isCreateMode ? 'New Farmers Record' : 'District Farmers Data'}
          </h1>
          {!isCreateMode && <StatusBadge status={status} />}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {isCreateMode ? 'Create a new farmers procurement record' : 'Procurement & Payment Tracking'}
          {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
          {mspRate > 0 && <span className="text-gray-400 ml-2">(MSP: Rs.{mspRate}/Qtl)</span>}
        </p>
      </div>

      {/* District selector (create mode) or display (edit mode) */}
      {isCreateMode ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
          {isDM ? (
            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg inline-flex items-center gap-2">
              <span className="text-sm font-semibold text-green-700">District: {districtName}</span>
            </div>
          ) : (
            <select
              value={selectedDistrictId}
              onChange={(e) => handleDistrictChange(parseInt(e.target.value))}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value={0}>-- Select a district --</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg inline-flex items-center gap-2">
          <span className="text-sm font-semibold text-green-700">District: {districtName}</span>
        </div>
      )}

      {/* Rejection reason banner */}
      {status === 'rejected' && rejectionReason && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Rejected</p>
            <p className="mt-0.5">Reason: {rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Locked banner */}
      {isLocked && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          This record has been {status}. Data shown below is read-only.
        </div>
      )}

      {/* Over-payment warning */}
      {overPayment && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          Payment released exceeds amount received from HO
        </div>
      )}

      {message && (
        <div
          className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* District (display only — for edit mode) */}
          {!isCreateMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maize Procurement District
              </label>
              <input
                type="text"
                value={districtName}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500"
              />
            </div>
          )}

          {/* PACS Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. of PACS/DCMS/FPO
            </label>
            <input
              type="number"
              value={form.pacs_count || ''}
              onChange={(e) => handleChange('pacs_count', parseInt(e.target.value) || 0)}
              disabled={!canEdit}
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* PACS Entity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name of PACS/DCMS/FPO
            </label>
            <select
              value={form.pacs_entity_id || ''}
              onChange={(e) => handleChange('pacs_entity_id', e.target.value ? parseInt(e.target.value) : null)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            >
              <option value="">Select PACS/DCMS/FPO</option>
              {pacsEntities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>

          {/* Farmers Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Farmers Benefited
            </label>
            <input
              type="number"
              value={form.farmers_count || ''}
              onChange={(e) => handleChange('farmers_count', parseInt(e.target.value) || 0)}
              disabled={!canEdit}
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* Qty Procured */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Qty Procured (Qtls)
            </label>
            <input
              type="number"
              value={form.quantity_procured_qtl || ''}
              onChange={(e) => handleChange('quantity_procured_qtl', parseFloat(e.target.value) || 0)}
              disabled={!canEdit}
              min={0}
              step={0.001}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* Payment Released */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Released to Farmers (Rs.)
            </label>
            <input
              type="number"
              value={form.payment_released_to_farmers_rs || ''}
              onChange={(e) => handleChange('payment_released_to_farmers_rs', parseFloat(e.target.value) || 0)}
              disabled={!canEdit}
              min={0}
              step={0.01}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            />
            {(form.payment_released_to_farmers_rs || 0) > 0 && (
              <p className="text-[10px] text-blue-500 mt-0.5 text-right">= {formatAmount(form.payment_released_to_farmers_rs)}</p>
            )}
          </div>

          {/* Remarks */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              value={form.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              disabled={!canEdit}
              maxLength={500}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Auto-Calculated Fields */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Auto-Calculated Fields</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Cost of Procured Qty</p>
              <p className="text-base font-bold text-gray-800">{formatAmount(costOfProcuredQty)}</p>
              <p className="text-[10px] text-gray-400">Qty x Rs.{mspRate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amt Received from HO</p>
              <p className="text-base font-bold text-blue-600">{formatAmount(amountReceivedFromHO)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance to Farmers</p>
              <p className={`text-base font-bold ${balanceToRelease < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                {formatAmount(balanceToRelease)}
              </p>
              <p className="text-[10px] text-gray-400">Received - Released</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance from HOD</p>
              <p className={`text-base font-bold ${balanceDueFromHOD < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(balanceDueFromHOD)}
              </p>
              <p className="text-[10px] text-gray-400">Cost - Received</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          {canEdit && (
            <>
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
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg shadow-green-500/30 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit for Review
              </button>
            </>
          )}
          {canApprove && status === 'submitted' && (
            <>
              <button onClick={handleApprove} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg disabled:opacity-50">
                <ShieldCheck className="w-4 h-4" /> Approve
              </button>
              <button onClick={handleReject} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg disabled:opacity-50">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmersForm;
