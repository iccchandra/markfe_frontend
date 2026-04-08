// ============================================
// pages/data-entry/LoanSanctionForm.tsx — MD Sheet Cols 1-8
// AO_CAO & SUPER_ADMIN can edit
// ============================================
import React, { useState, useEffect } from 'react';
import { Save, Send, AlertCircle, CheckCircle, Landmark, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { loanSanctionAPI, seasonsAPI, banksAPI } from '../../api/services';
import type { LoanSanction, Season, Bank, ApprovalStatus } from '../../types/markfed';
import { UserRole, formatCrores, num } from '../../types/markfed';

// ─── Status badge config ─────────────────────────
const STATUS_BADGE: Record<ApprovalStatus, { label: string; bg: string; text: string; border: string }> = {
  draft:     { label: 'Draft',     bg: 'bg-gray-100',  text: 'text-gray-700',  border: 'border-gray-300' },
  submitted: { label: 'Submitted', bg: 'bg-blue-100',  text: 'text-blue-700',  border: 'border-blue-300' },
  approved:  { label: 'Approved',  bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  rejected:  { label: 'Rejected',  bg: 'bg-red-100',   text: 'text-red-700',   border: 'border-red-300' },
};

const initialForm: LoanSanction = {
  season_id: 0,
  go_reference: '',
  bank_name: '',
  bank_id: undefined,
  bank_account_no: '',
  sanction_date: '',
  total_sanctioned_cr: 0,
  total_drawn_cr: 0,
  transfer_bank_name: '',
  transfer_bank_id: undefined,
  kotak_account_no: '',
};

export const LoanSanctionForm: React.FC = () => {
  const { user, canEditField, hasRole } = useAuth();
  const canEdit = canEditField('loan_sanction');

  const [season, setSeason] = useState<Season | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [form, setForm] = useState<LoanSanction>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const status: ApprovalStatus = form.status || 'draft';
  const isLocked = status === 'submitted' || status === 'approved';

  // Approvers: MD and SUPER_ADMIN can approve/reject
  const canApprove = hasRole(UserRole.MD, UserRole.SUPER_ADMIN);

  // Load active season, banks, and existing loan data
  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, banksRes] = await Promise.all([
          seasonsAPI.active(),
          banksAPI.list({ is_active: true }),
        ]);
        const activeSeason = seasonRes.data;
        setSeason(activeSeason);
        const bankData = banksRes.data;
        setBanks(Array.isArray(bankData) ? bankData : (bankData as any)?.data || []);

        try {
          const { data: existing } = await loanSanctionAPI.get(activeSeason.id);
          setForm({
            ...initialForm,
            ...existing,
            season_id: activeSeason.id,
            total_sanctioned_cr: num(existing.total_sanctioned_cr),
            total_drawn_cr: num(existing.total_drawn_cr),
          });
          if (existing.updated_at) setLastSaved(existing.updated_at);
        } catch {
          // No existing record — start fresh
          setForm({ ...initialForm, season_id: activeSeason.id });
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load season data. Please try again.' });
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof LoanSanction, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (bankId: number | undefined) => {
    const bank = banks.find((b) => b.id === bankId);
    setForm((prev) => ({
      ...prev,
      bank_id: bankId,
      bank_name: bank?.name || '',
    }));
  };

  const handleTransferBankChange = (bankId: number | undefined) => {
    const bank = banks.find((b) => b.id === bankId);
    setForm((prev) => ({
      ...prev,
      transfer_bank_id: bankId,
      transfer_bank_name: bank?.name || '',
    }));
  };

  const validate = (): string | null => {
    if (!form.go_reference.trim()) return 'GO Reference is required';
    if (!form.bank_id && !form.bank_name.trim()) return 'Bank Name is required';
    if (!form.bank_account_no.trim()) return 'Bank Account No is required';
    if (!form.sanction_date) return 'Sanction Date is required';
    if (form.total_sanctioned_cr <= 0) return 'Sanctioned amount must be > 0';
    if (form.total_drawn_cr > form.total_sanctioned_cr)
      return 'Drawn amount cannot exceed sanctioned amount';
    if (new Date(form.sanction_date) > new Date())
      return 'Sanction date cannot be in the future';
    return null;
  };

  const handleSaveDraft = async () => {
    if (!season) return;
    setSaving(true);
    setMessage(null);
    try {
      await loanSanctionAPI.upsert(season.id, form);
      setLastSaved(new Date().toISOString());
      setMessage({ type: 'success', text: 'Draft saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save draft' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }
    if (!season) return;

    if (!window.confirm('Submit loan sanction data for approval? You will not be able to edit until it is returned.')) return;

    setSaving(true);
    setMessage(null);
    try {
      // Save latest data first, then submit
      await loanSanctionAPI.upsert(season.id, form);
      await loanSanctionAPI.submit(season.id);
      setForm((prev) => ({ ...prev, status: 'submitted' as ApprovalStatus }));
      setLastSaved(new Date().toISOString());
      setMessage({ type: 'success', text: 'Data submitted for approval' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Submission failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!season) return;
    if (!window.confirm('Approve this loan sanction data?')) return;

    setSaving(true);
    setMessage(null);
    try {
      await loanSanctionAPI.approve(season.id);
      setForm((prev) => ({ ...prev, status: 'approved' as ApprovalStatus }));
      setMessage({ type: 'success', text: 'Loan sanction approved' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Approval failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!season) return;
    if (!rejectReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for rejection' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await loanSanctionAPI.reject(season.id, rejectReason.trim());
      setForm((prev) => ({
        ...prev,
        status: 'rejected' as ApprovalStatus,
        rejection_reason: rejectReason.trim(),
      }));
      setShowRejectModal(false);
      setRejectReason('');
      setMessage({ type: 'success', text: 'Loan sanction rejected and returned for revision' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Rejection failed' });
    } finally {
      setSaving(false);
    }
  };

  // Fields are disabled when locked or when user does not have edit permission
  const fieldsDisabled = !canEdit || isLocked;

  const badge = STATUS_BADGE[status];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Landmark className="w-7 h-7 text-blue-600" />
            Loan Sanction
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            MD Sheet Columns 1-8 | GO & Bank Details
            {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {status === 'approved' && <ShieldCheck className="w-3.5 h-3.5" />}
            {status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
            {badge.label}
          </span>
          {lastSaved && (
            <span className="text-xs text-gray-400">
              Last saved: {new Date(lastSaved).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Rejection Banner */}
      {status === 'rejected' && form.rejection_reason && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Rejected — please revise and resubmit</p>
            <p className="mt-1">{form.rejection_reason}</p>
          </div>
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
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Col 1: GO Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-blue-500 text-xs mr-1">Col 1</span>
              Total Loan Approved as per GO No.
            </label>
            <input
              type="text"
              value={form.go_reference}
              onChange={(e) => handleChange('go_reference', e.target.value)}
              disabled={fieldsDisabled}
              placeholder="e.g., GO No. 558 Dt. 04.12.2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Col 2: Bank Name (from API) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-blue-500 text-xs mr-1">Col 2</span>
              Loan Sanctioned By (Bank)
            </label>
            <select
              value={form.bank_id ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                handleBankChange(val ? Number(val) : undefined);
              }}
              disabled={fieldsDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50"
            >
              <option value="">Select Bank</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>{bank.name}</option>
              ))}
            </select>
          </div>

          {/* Col 3: Account No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-blue-500 text-xs mr-1">Col 3</span>
              Bank Account No.
            </label>
            <input
              type="text"
              value={form.bank_account_no}
              onChange={(e) => handleChange('bank_account_no', e.target.value)}
              disabled={fieldsDisabled}
              maxLength={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50"
            />
          </div>

          {/* Col 4: Sanction Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-blue-500 text-xs mr-1">Col 4</span>
              Date of Sanction of Loan
            </label>
            <input
              type="date"
              value={form.sanction_date}
              onChange={(e) => handleChange('sanction_date', e.target.value)}
              disabled={fieldsDisabled}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50"
            />
          </div>

          {/* Col 5: Total Sanctioned */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-blue-500 text-xs mr-1">Col 5</span>
              Total Amount Sanctioned (in Crores)
            </label>
            <input
              type="number"
              value={form.total_sanctioned_cr || ''}
              onChange={(e) => handleChange('total_sanctioned_cr', parseFloat(e.target.value) || 0)}
              disabled={fieldsDisabled}
              min={0}
              step={0.01}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50"
            />
          </div>

          {/* Col 6: Total Drawn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-blue-500 text-xs mr-1">Col 6</span>
              Total Loan Amount Drawn by HOD (in Crores)
            </label>
            <input
              type="number"
              value={form.total_drawn_cr || ''}
              onChange={(e) => handleChange('total_drawn_cr', parseFloat(e.target.value) || 0)}
              disabled={fieldsDisabled}
              min={0}
              step={0.01}
              max={form.total_sanctioned_cr || undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50"
            />
            {form.total_drawn_cr > form.total_sanctioned_cr && form.total_sanctioned_cr > 0 && (
              <p className="text-red-500 text-xs mt-1">Drawn amount exceeds sanctioned amount</p>
            )}
          </div>

          {/* Col 7: Transfer Bank Name (from API) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-blue-500 text-xs mr-1">Col 7</span>
              Amount Transferred to (Bank Name)
            </label>
            <select
              value={form.transfer_bank_id ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                handleTransferBankChange(val ? Number(val) : undefined);
              }}
              disabled={fieldsDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50"
            >
              <option value="">Select Bank</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>{bank.name}</option>
              ))}
            </select>
          </div>

          {/* Col 8: Kotak Account No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-blue-500 text-xs mr-1">Col 8</span>
              Received Kotak Bank Account No.
            </label>
            <input
              type="text"
              value={form.kotak_account_no}
              onChange={(e) => handleChange('kotak_account_no', e.target.value)}
              disabled={fieldsDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Total Sanctioned</p>
              <p className="text-lg font-bold text-blue-600">{formatCrores(form.total_sanctioned_cr)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Drawn</p>
              <p className="text-lg font-bold text-green-600">{formatCrores(form.total_drawn_cr)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance Available</p>
              <p className="text-lg font-bold text-orange-600">
                {formatCrores(form.total_sanctioned_cr - form.total_drawn_cr)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          {/* Editor actions: Save Draft + Submit (only when draft or rejected) */}
          {canEdit && !isLocked && (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Submit for Approval
              </button>
            </>
          )}

          {/* Approver actions: Approve + Reject (only when submitted) */}
          {canApprove && status === 'submitted' && (
            <>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-red-300 hover:bg-red-50 text-red-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/30 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Loan Sanction</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason. The submitter will be able to revise and resubmit.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={saving || !rejectReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanSanctionForm;
