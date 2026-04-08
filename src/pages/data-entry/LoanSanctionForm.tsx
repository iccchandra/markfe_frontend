// ============================================
// pages/data-entry/LoanSanctionForm.tsx — Loan Sanction (Multi-Row)
// AO_CAO & SUPER_ADMIN can edit — one row per bank/source
// ============================================
import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit3, Check, X, AlertCircle, CheckCircle, Landmark,
  ShieldCheck, XCircle, Send,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { loanSanctionAPI, seasonsAPI, banksAPI } from '../../api/services';
import type { LoanSanction, Season, Bank, ApprovalStatus } from '../../types/markfed';
import { UserRole, formatAmount, num } from '../../types/markfed';

// ─── Status badge config ─────────────────────────
const STATUS_BADGE: Record<ApprovalStatus, { label: string; cls: string }> = {
  draft:     { label: 'Draft',     cls: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
  approved:  { label: 'Approved',  cls: 'bg-green-100 text-green-700' },
  rejected:  { label: 'Rejected',  cls: 'bg-red-100 text-red-700' },
};

interface EditableRow extends LoanSanction {
  isNew?: boolean;
  isEditing?: boolean;
}

const emptyRow = (seasonId: number): EditableRow => ({
  season_id: seasonId,
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
  isNew: true,
  isEditing: true,
});

export const LoanSanctionForm: React.FC = () => {
  const { canEditField, hasRole } = useAuth();
  const canEdit = canEditField('loan_sanction');
  const canApprove = hasRole(UserRole.MD, UserRole.SUPER_ADMIN);

  const [season, setSeason] = useState<Season | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load active season, banks, and existing loan rows
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
          const { data } = await loanSanctionAPI.list(activeSeason.id);
          const loanRows: LoanSanction[] = Array.isArray(data) ? data : (data as any)?.data || [];
          setRows(loanRows.map((r: any) => ({
            ...r,
            total_sanctioned_cr: num(r.total_sanctioned_cr),
            total_drawn_cr: num(r.total_drawn_cr),
            isEditing: false,
            isNew: false,
          })));
        } catch {
          // No existing rows — start empty
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load season data. Please try again.' });
      }
    };
    load();
  }, []);

  // ─── Aggregated totals ─────────────────────────
  const totalSanctioned = rows.reduce((sum, r) => sum + (r.total_sanctioned_cr || 0), 0);
  const totalDrawn = rows.reduce((sum, r) => sum + (r.total_drawn_cr || 0), 0);
  const balanceAvailable = totalSanctioned - totalDrawn;

  // ─── Row handlers ──────────────────────────────
  const handleAddRow = () => {
    if (!season) return;
    setRows([...rows, emptyRow(season.id)]);
  };

  const handleEditRow = (index: number) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], isEditing: true };
    setRows(updated);
  };

  const handleCancelEdit = (index: number) => {
    if (rows[index].isNew) {
      setRows(rows.filter((_, i) => i !== index));
    } else {
      const updated = [...rows];
      updated[index] = { ...updated[index], isEditing: false };
      setRows(updated);
    }
  };

  const handleFieldChange = (index: number, field: keyof LoanSanction, value: any) => {
    const updated = [...rows];
    (updated[index] as any)[field] = value;
    setRows(updated);
  };

  const handleBankChange = (index: number, bankId: number | undefined) => {
    const bank = banks.find((b) => b.id === bankId);
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      bank_id: bankId,
      bank_name: bank?.name || '',
    };
    setRows(updated);
  };

  const handleTransferBankChange = (index: number, bankId: number | undefined) => {
    const bank = banks.find((b) => b.id === bankId);
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      transfer_bank_id: bankId,
      transfer_bank_name: bank?.name || '',
    };
    setRows(updated);
  };

  const validateRow = (row: EditableRow): string | null => {
    if (!row.go_reference.trim()) return 'GO Reference is required';
    if (!row.bank_id && !row.bank_name.trim()) return 'Bank is required';
    if (!row.bank_account_no.trim()) return 'Account No is required';
    if (!row.sanction_date) return 'Sanction Date is required';
    if (row.total_sanctioned_cr <= 0) return 'Sanctioned amount must be > 0';
    if (row.total_drawn_cr > row.total_sanctioned_cr) return 'Drawn amount cannot exceed sanctioned amount';
    if (new Date(row.sanction_date) > new Date()) return 'Sanction date cannot be in the future';
    return null;
  };

  const handleSaveRow = async (index: number) => {
    const row = rows[index];
    if (!season) return;

    const error = validateRow(row);
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    const payload: Partial<LoanSanction> = {
      season_id: season.id,
      go_reference: row.go_reference,
      bank_name: row.bank_name,
      bank_id: row.bank_id,
      bank_account_no: row.bank_account_no,
      sanction_date: row.sanction_date,
      total_sanctioned_cr: row.total_sanctioned_cr,
      total_drawn_cr: row.total_drawn_cr,
      transfer_bank_name: row.transfer_bank_name,
      transfer_bank_id: row.transfer_bank_id,
      kotak_account_no: row.kotak_account_no,
    };

    setSaving(true);
    setMessage(null);
    try {
      if (row.isNew) {
        const { data } = await loanSanctionAPI.create(season.id, payload);
        const updated = [...rows];
        updated[index] = {
          ...data,
          total_sanctioned_cr: num(data.total_sanctioned_cr),
          total_drawn_cr: num(data.total_drawn_cr),
          isEditing: false,
          isNew: false,
        };
        setRows(updated);
      } else {
        await loanSanctionAPI.update(season.id, row.id!, payload);
        const updated = [...rows];
        updated[index] = { ...updated[index], isEditing: false, isNew: false };
        setRows(updated);
      }
      setMessage({ type: 'success', text: 'Row saved' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save row' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRow = async (index: number) => {
    const row = rows[index];
    if (row.isNew) {
      setRows(rows.filter((_, i) => i !== index));
      return;
    }

    if (!window.confirm('Delete this loan sanction entry?')) return;
    if (!season) return;

    try {
      await loanSanctionAPI.delete(season.id, row.id!);
      setRows(rows.filter((_, i) => i !== index));
      setMessage({ type: 'success', text: 'Row deleted' });
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete row' });
    }
  };

  const handleSubmitRow = async (index: number) => {
    const row = rows[index];
    if (!season || !row.id) return;
    if (!window.confirm('Submit this loan sanction for approval?')) return;

    try {
      await loanSanctionAPI.submit(season.id, row.id);
      const updated = [...rows];
      (updated[index] as any).status = 'submitted';
      setRows(updated);
      setMessage({ type: 'success', text: 'Submitted for approval' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to submit' });
    }
  };

  const handleApproveRow = async (index: number) => {
    const row = rows[index];
    if (!season || !row.id) return;
    if (!window.confirm('Approve this loan sanction entry?')) return;

    try {
      await loanSanctionAPI.approve(season.id, row.id);
      const updated = [...rows];
      (updated[index] as any).status = 'approved';
      setRows(updated);
      setMessage({ type: 'success', text: 'Approved' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to approve' });
    }
  };

  const handleRejectRow = async (index: number) => {
    const row = rows[index];
    if (!season || !row.id) return;
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;

    try {
      await loanSanctionAPI.reject(season.id, row.id, reason);
      const updated = [...rows];
      (updated[index] as any).status = 'rejected';
      (updated[index] as any).rejection_reason = reason;
      setRows(updated);
      setMessage({ type: 'success', text: 'Rejected' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reject' });
    }
  };

  // ─── Helpers ───────────────────────────────────
  const getBankName = (row: EditableRow, field: 'bank' | 'transfer_bank') => {
    if (field === 'bank') {
      return (row as any)?.bank?.name || row.bank_name || '';
    }
    return (row as any)?.transfer_bank?.name || row.transfer_bank_name || '';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Landmark className="w-7 h-7 text-blue-600" />
            Loan Sanction
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            GO &amp; Bank Details &mdash; one row per bank/source
            {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
          </p>
          <div className="flex gap-1 mt-2">
            {['all', 'draft', 'submitted', 'approved', 'rejected'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${statusFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {canEdit && (
          <button onClick={handleAddRow}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30">
            <Plus className="w-4 h-4" /> Add Loan Entry
          </button>
        )}
      </div>

      {/* Summary Bar */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Total Sanctioned</p>
            <p className="text-lg font-bold text-blue-600">{formatAmount((totalSanctioned) * 10000000)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Drawn</p>
            <p className="text-lg font-bold text-green-600">{formatAmount((totalDrawn) * 10000000)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Balance Available</p>
            <p className={`text-lg font-bold ${balanceAvailable < 0 ? 'text-red-600' : 'text-orange-600'}`}>
              {formatAmount((balanceAvailable) * 10000000)}
            </p>
          </div>
        </div>
      </div>

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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 text-left font-semibold text-gray-600">GO Reference</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600">Bank</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600">Account No</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600">Sanction Date</th>
              <th className="px-3 py-3 text-right font-semibold text-gray-600">Sanctioned (Cr)</th>
              <th className="px-3 py-3 text-right font-semibold text-gray-600">Drawn (Cr)</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600">Transfer Bank</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600">Kotak Acct No</th>
              <th className="px-3 py-3 text-center font-semibold text-gray-600">Status</th>
              {(canEdit || canApprove) && (
                <th className="px-3 py-3 text-center font-semibold text-gray-600 w-36">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.filter(r => r.isNew || statusFilter === 'all' || ((r as any).status || 'draft') === statusFilter).map((row, index) => {
              const rowStatus: ApprovalStatus = (row as any).status || 'draft';
              const isRowLocked = rowStatus === 'submitted' || rowStatus === 'approved';

              return (
                <tr key={row.id || `new-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                  {/* GO Reference */}
                  <td className="px-3 py-3">
                    {row.isEditing ? (
                      <input
                        type="text"
                        value={row.go_reference}
                        onChange={(e) => handleFieldChange(index, 'go_reference', e.target.value)}
                        placeholder="GO No. 558 Dt. 04.12.2025"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-medium">{row.go_reference}</span>
                    )}
                  </td>

                  {/* Bank */}
                  <td className="px-3 py-3">
                    {row.isEditing ? (
                      <select
                        value={row.bank_id ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleBankChange(index, val ? Number(val) : undefined);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Bank</option>
                        {banks.map((bank) => (
                          <option key={bank.id} value={bank.id}>{bank.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{getBankName(row, 'bank')}</span>
                    )}
                  </td>

                  {/* Account No */}
                  <td className="px-3 py-3">
                    {row.isEditing ? (
                      <input
                        type="text"
                        value={row.bank_account_no}
                        onChange={(e) => handleFieldChange(index, 'bank_account_no', e.target.value)}
                        maxLength={30}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-mono text-xs">{row.bank_account_no}</span>
                    )}
                  </td>

                  {/* Sanction Date */}
                  <td className="px-3 py-3">
                    {row.isEditing ? (
                      <input
                        type="date"
                        value={row.sanction_date}
                        onChange={(e) => handleFieldChange(index, 'sanction_date', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span>{row.sanction_date}</span>
                    )}
                  </td>

                  {/* Sanctioned Amount */}
                  <td className="px-3 py-3 text-right">
                    {row.isEditing ? (
                      <input
                        type="number"
                        value={row.total_sanctioned_cr || ''}
                        onChange={(e) => handleFieldChange(index, 'total_sanctioned_cr', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-mono">{formatAmount((row.total_sanctioned_cr) * 10000000)}</span>
                    )}
                  </td>

                  {/* Drawn Amount */}
                  <td className="px-3 py-3 text-right">
                    {row.isEditing ? (
                      <div>
                        <input
                          type="number"
                          value={row.total_drawn_cr || ''}
                          onChange={(e) => handleFieldChange(index, 'total_drawn_cr', parseFloat(e.target.value) || 0)}
                          min={0}
                          step={0.01}
                          max={row.total_sanctioned_cr || undefined}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500"
                        />
                        {row.total_drawn_cr > row.total_sanctioned_cr && row.total_sanctioned_cr > 0 && (
                          <p className="text-red-500 text-xs mt-0.5">Exceeds sanctioned</p>
                        )}
                      </div>
                    ) : (
                      <span className="font-mono">{formatAmount((row.total_drawn_cr) * 10000000)}</span>
                    )}
                  </td>

                  {/* Transfer Bank */}
                  <td className="px-3 py-3">
                    {row.isEditing ? (
                      <select
                        value={row.transfer_bank_id ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleTransferBankChange(index, val ? Number(val) : undefined);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Bank</option>
                        {banks.map((bank) => (
                          <option key={bank.id} value={bank.id}>{bank.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{getBankName(row, 'transfer_bank')}</span>
                    )}
                  </td>

                  {/* Kotak Account No */}
                  <td className="px-3 py-3">
                    {row.isEditing ? (
                      <input
                        type="text"
                        value={row.kotak_account_no}
                        onChange={(e) => handleFieldChange(index, 'kotak_account_no', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-mono text-xs">{row.kotak_account_no}</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-3 py-3 text-center">
                    {!row.isNew && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[rowStatus].cls}`}>
                        {STATUS_BADGE[rowStatus].label}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  {(canEdit || canApprove) && (
                    <td className="px-3 py-3 text-center">
                      {row.isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSaveRow(index)}
                            disabled={saving}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelEdit(index)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          {canEdit && (rowStatus === 'draft' || rowStatus === 'rejected' || !rowStatus) && (
                            <>
                              <button
                                onClick={() => handleEditRow(index)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRow(index)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {row.id && (
                                <button
                                  onClick={() => handleSubmitRow(index)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Submit"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                          {canApprove && rowStatus === 'submitted' && (
                            <>
                              <button
                                onClick={() => handleApproveRow(index)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                title="Approve"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectRow(index)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={(canEdit || canApprove) ? 10 : 9} className="px-4 py-8 text-center text-gray-400">
                  No loan sanction entries yet. Click "+ Add Loan Entry" to begin.
                </td>
              </tr>
            )}

            {/* Totals row */}
            {rows.length > 0 && (
              <tr className="bg-blue-50 font-semibold">
                <td className="px-3 py-3 text-right" colSpan={4}>TOTAL</td>
                <td className="px-3 py-3 text-right font-mono">{formatAmount((totalSanctioned) * 10000000)}</td>
                <td className="px-3 py-3 text-right font-mono">{formatAmount((totalDrawn) * 10000000)}</td>
                <td colSpan={(canEdit || canApprove) ? 4 : 3}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom spacing */}
      {canEdit && (
        <div className="mt-4"></div>
      )}
    </div>
  );
};

export default LoanSanctionForm;
