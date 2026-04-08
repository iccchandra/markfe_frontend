// ============================================
// pages/data-entry/FarmersForm.tsx — District Farmers Sheet Cols 27-37
// DM fills farmer procurement & payment data
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { Save, Send, AlertCircle, CheckCircle, Users, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { farmersAPI, drawdownsAPI, pacsAPI, districtsAPI, seasonsAPI } from '../../api/services';
import type { DistrictFarmers, District, Season, PACSEntity, DistrictDrawdown, ApprovalStatus } from '../../types/markfed';
import { UserRole, calcCostOfProcuredQty, formatIndianCurrency, num } from '../../types/markfed';

const STATUS_BADGE: Record<ApprovalStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
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
  const { user, canEditField, hasRole } = useAuth();
  const canEditBase = canEditField('farmers');
  const canApprove = hasRole(UserRole.AO_CAO) || hasRole(UserRole.MD) || hasRole(UserRole.SUPER_ADMIN);

  const [season, setSeason] = useState<Season | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [pacsEntities, setPacsEntities] = useState<PACSEntity[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(0);
  const [form, setForm] = useState<DistrictFarmers>(emptyFarmers);
  const [drawdowns, setDrawdowns] = useState<DistrictDrawdown[]>([]);
  const [status, setStatus] = useState<ApprovalStatus>('draft');
  const [rejectionReason, setRejectionReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canEdit = canEditBase && (status === 'draft' || status === 'rejected');
  const isLocked = status === 'submitted' || status === 'approved';

  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, distRes] = await Promise.all([seasonsAPI.active(), districtsAPI.list()]);
        setSeason(seasonRes.data);
        setDistricts(distRes.data);

        if (user?.role === UserRole.DM && user.district_id) {
          setSelectedDistrictId(user.district_id);
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load data' });
      }
    };
    load();
  }, [user]);

  // Load data when district changes
  useEffect(() => {
    if (!season || !selectedDistrictId) return;

    const load = async () => {
      try {
        const [farmersRes, ddRes, pacsRes] = await Promise.allSettled([
          farmersAPI.get(season.id, selectedDistrictId),
          drawdownsAPI.getByDistrict(season.id, selectedDistrictId),
          pacsAPI.list(selectedDistrictId),
        ]);

        if (farmersRes.status === 'fulfilled') {
          const raw = farmersRes.value.data;
          setForm({
            ...emptyFarmers,
            ...raw,
            season_id: season.id,
            district_id: selectedDistrictId,
            pacs_count: num(raw.pacs_count),
            farmers_count: num(raw.farmers_count),
            quantity_procured_qtl: num(raw.quantity_procured_qtl),
            cost_of_procured_qty_rs: num(raw.cost_of_procured_qty_rs),
            payment_released_to_farmers_rs: num(raw.payment_released_to_farmers_rs),
            remarks: raw.remarks || '',
          });
          setStatus(raw.status || 'draft');
          setRejectionReason(raw.rejection_reason || '');
        } else {
          setForm({ ...emptyFarmers, season_id: season.id, district_id: selectedDistrictId });
          setStatus('draft');
          setRejectionReason('');
        }

        setDrawdowns(
          ddRes.status === 'fulfilled'
            ? ddRes.value.data.map((d: any) => ({ ...d, amount_withdrawn_rs: num(d.amount_withdrawn_rs) }))
            : []
        );
        setPacsEntities(pacsRes.status === 'fulfilled' ? pacsRes.value.data : []);
      } catch { /* handled */ }
    };
    load();
  }, [season, selectedDistrictId]);

  // Auto calculations
  const mspRate = num(season?.msp_rate);
  const costOfProcuredQty = useMemo(() => calcCostOfProcuredQty(form.quantity_procured_qtl, mspRate), [form.quantity_procured_qtl, mspRate]);
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

  const handleSave = async () => {
    if (!season || !selectedDistrictId) return;
    setSaving(true);
    setMessage(null);
    try {
      await farmersAPI.upsert(season.id, selectedDistrictId, {
        ...form,
        cost_of_procured_qty_rs: costOfProcuredQty,
      } as any);
      setMessage({ type: 'success', text: 'Draft saved' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!season || !selectedDistrictId) return;
    if (form.quantity_procured_qtl <= 0) {
      setMessage({ type: 'error', text: 'Quantity procured must be > 0' });
      return;
    }
    if (form.pacs_count < 1) {
      setMessage({ type: 'error', text: 'PACS count must be at least 1' });
      return;
    }
    if (!window.confirm('Submit farmers data for review?')) return;
    setSaving(true);
    try {
      await farmersAPI.upsert(season.id, selectedDistrictId, { ...form, cost_of_procured_qty_rs: costOfProcuredQty } as any);
      await farmersAPI.submit(season.id, selectedDistrictId);
      setStatus('submitted');
      setMessage({ type: 'success', text: 'Data submitted for review' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to submit' });
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!season || !selectedDistrictId) return;
    if (!window.confirm('Approve this farmers data?')) return;
    setSaving(true);
    try {
      await farmersAPI.approve(season.id, selectedDistrictId);
      setStatus('approved');
      setMessage({ type: 'success', text: 'Approved' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to approve' });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!season || !selectedDistrictId) return;
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    setSaving(true);
    try {
      await farmersAPI.reject(season.id, selectedDistrictId, reason);
      setStatus('rejected');
      setRejectionReason(reason);
      setMessage({ type: 'success', text: 'Rejected' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reject' });
    } finally {
      setSaving(false);
    }
  };

  const districtName = districts.find((d) => d.id === selectedDistrictId)?.name || '';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-7 h-7 text-green-600" />
          District Farmers Data
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Farmers Sheet Columns 27-37 | Procurement & Payment Tracking
          {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
        </p>
      </div>

      {/* Status Badge */}
      {selectedDistrictId > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[status].cls}`}>
            {STATUS_BADGE[status].label}
          </span>
          {status === 'rejected' && rejectionReason && (
            <span className="text-sm text-red-600">Reason: {rejectionReason}</span>
          )}
        </div>
      )}

      {/* District Selector */}
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
          Please select a district.
        </div>
      ) : (
        <>
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
              {/* Col 27: District (display only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-green-500 text-xs mr-1">Col 27</span>
                  Maize Procurement District
                </label>
                <input
                  type="text"
                  value={districtName}
                  disabled
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500"
                />
              </div>

              {/* Col 28: PACS Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-green-500 text-xs mr-1">Col 28</span>
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

              {/* Col 29: PACS Entity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-green-500 text-xs mr-1">Col 29</span>
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

              {/* Col 30: Farmers Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-green-500 text-xs mr-1">Col 30</span>
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

              {/* Col 31: Qty Procured */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-green-500 text-xs mr-1">Col 31</span>
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

              {/* Col 34: Payment Released */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-green-500 text-xs mr-1">Col 34</span>
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
              </div>

              {/* Col 37: Remarks */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-green-500 text-xs mr-1">Col 37</span>
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
                  <p className="text-xs text-gray-500">
                    <span className="text-gray-400 text-xs">Col 32</span>
                  </p>
                  <p className="text-xs text-gray-500">Cost of Procured Qty</p>
                  <p className="text-base font-bold text-gray-800">Rs. {formatIndianCurrency(costOfProcuredQty)}</p>
                  <p className="text-[10px] text-gray-400">Qty x Rs.{mspRate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    <span className="text-gray-400 text-xs">Col 33</span>
                  </p>
                  <p className="text-xs text-gray-500">Amt Received from HO</p>
                  <p className="text-base font-bold text-blue-600">Rs. {formatIndianCurrency(amountReceivedFromHO)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    <span className="text-gray-400 text-xs">Col 35</span>
                  </p>
                  <p className="text-xs text-gray-500">Balance to Farmers</p>
                  <p className={`text-base font-bold ${balanceToRelease < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    Rs. {formatIndianCurrency(balanceToRelease)}
                  </p>
                  <p className="text-[10px] text-gray-400">Col33 - Col34</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    <span className="text-gray-400 text-xs">Col 36</span>
                  </p>
                  <p className="text-xs text-gray-500">Balance from HOD</p>
                  <p className={`text-base font-bold ${balanceDueFromHOD < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Rs. {formatIndianCurrency(balanceDueFromHOD)}
                  </p>
                  <p className="text-[10px] text-gray-400">Col32 - Col33</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              {canEdit && (
                <>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg disabled:opacity-50">
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                  <button onClick={handleSubmit} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg shadow-green-500/30 disabled:opacity-50">
                    <Send className="w-4 h-4" /> Submit for Review
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
        </>
      )}
    </div>
  );
};

export default FarmersForm;
