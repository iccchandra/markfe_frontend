// ============================================
// pages/data-entry/DrawdownsForm.tsx — District Transfers
// Per-district drawdown rows (AO_CAO fills)
// ============================================
import React, { useState, useEffect } from 'react';
import {
  Plus, Save, Trash2, Edit3, Check, X, AlertCircle, CheckCircle, ArrowDownUp,
  ShieldCheck, XCircle, Send,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { drawdownsAPI, districtsAPI, seasonsAPI, loanSanctionAPI } from '../../api/services';
import type { DistrictDrawdown, District, Season, LoanSanction, ApprovalStatus } from '../../types/markfed';
import { UserRole, formatAmount, num, flattenDistrict } from '../../types/markfed';

const STATUS_BADGE: Record<ApprovalStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
};

interface EditableRow extends DistrictDrawdown {
  isNew?: boolean;
  isEditing?: boolean;
}

export const DrawdownsForm: React.FC = () => {
  const { canEditField, hasRole } = useAuth();
  const canEdit = canEditField('drawdowns');
  const canApprove = hasRole(UserRole.MD) || hasRole(UserRole.SUPER_ADMIN);

  const [season, setSeason] = useState<Season | null>(null);
  const [loan, setLoan] = useState<LoanSanction | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, distRes] = await Promise.all([
          seasonsAPI.active(),
          districtsAPI.list(),
        ]);
        setSeason(seasonRes.data);
        setDistricts(distRes.data);

        try {
          const loanRes = await loanSanctionAPI.list(seasonRes.data.id);
          const loanRows: LoanSanction[] = Array.isArray(loanRes.data) ? loanRes.data : (loanRes.data as any)?.data || [];
          if (loanRows.length > 0) {
            const totalSanctioned = loanRows.reduce((s, r) => s + num(r.total_sanctioned_cr), 0);
            const totalDrawn = loanRows.reduce((s, r) => s + num(r.total_drawn_cr), 0);
            setLoan({
              ...loanRows[0],
              total_sanctioned_cr: totalSanctioned,
              total_drawn_cr: totalDrawn,
            });
          }
        } catch { /* no loan records yet */ }

        try {
          const { data: ddData } = await drawdownsAPI.list(seasonRes.data.id);
          const ddList = Array.isArray(ddData) ? ddData : (ddData as any)?.data || [];
          setRows(ddList.map((r: any) => ({
            ...r,
            amount_withdrawn_rs: num(r.amount_withdrawn_rs),
            isEditing: false,
          })));
        } catch { /* no rows yet */ }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load data' });
      }
    };
    load();
  }, []);

  const totalWithdrawn = rows.reduce((sum, r) => sum + (r.amount_withdrawn_rs || 0), 0);
  const loanDrawnRs = (loan?.total_drawn_cr || 0) * 10000000; // Cr to Rs

  const handleAddRow = () => {
    const newRow: EditableRow = {
      season_id: season?.id || 0,
      district_id: 0,
      amount_withdrawn_rs: 0,
      withdrawn_date: '',
      transfer_date: '',
      utr_no: '',
      isNew: true,
      isEditing: true,
    };
    setRows([...rows, newRow]);
  };

  const handleEditRow = (index: number) => {
    const updated = [...rows];
    updated[index].isEditing = true;
    setRows(updated);
  };

  const handleCancelEdit = (index: number) => {
    if (rows[index].isNew) {
      setRows(rows.filter((_, i) => i !== index));
    } else {
      const updated = [...rows];
      updated[index].isEditing = false;
      setRows(updated);
    }
  };

  const handleFieldChange = (index: number, field: keyof DistrictDrawdown, value: any) => {
    if (field !== 'district_id' && !rows[index].district_id) {
      setMessage({ type: 'error', text: 'Please select a district first' });
      return;
    }
    const updated = [...rows];
    (updated[index] as any)[field] = value;
    setRows(updated);
  };

  const handleSaveRow = async (index: number) => {
    const row = rows[index];
    if (!season) return;

    if (!row.district_id) {
      setMessage({ type: 'error', text: 'Please select a district' });
      return;
    }
    if (row.amount_withdrawn_rs <= 0) {
      setMessage({ type: 'error', text: 'Amount must be > 0' });
      return;
    }
    if (!row.withdrawn_date || !row.transfer_date) {
      setMessage({ type: 'error', text: 'Both dates are required' });
      return;
    }
    if (new Date(row.transfer_date) < new Date(row.withdrawn_date)) {
      setMessage({ type: 'error', text: 'Transfer date must be >= withdrawn date' });
      return;
    }
    if (!row.utr_no.trim()) {
      setMessage({ type: 'error', text: 'UTR No. is required' });
      return;
    }

    // Check: sum of all drawdowns should not exceed loan drawn
    if (loanDrawnRs > 0) {
      const otherRowsTotal = rows
        .filter((_, i) => i !== index)
        .reduce((sum, r) => sum + (r.amount_withdrawn_rs || 0), 0);
      if (otherRowsTotal + row.amount_withdrawn_rs > loanDrawnRs) {
        setMessage({ type: 'error', text: `Total drawdowns (${formatAmount(otherRowsTotal + row.amount_withdrawn_rs)}) exceed loan drawn by HOD (${formatAmount(loanDrawnRs)})` });
        return;
      }
    }

    setSaving(true);
    setMessage(null);
    try {
      if (row.isNew) {
        const { data } = await drawdownsAPI.create(season.id, {
          district_id: row.district_id,
          amount_withdrawn_rs: row.amount_withdrawn_rs,
          withdrawn_date: row.withdrawn_date,
          transfer_date: row.transfer_date,
          utr_no: row.utr_no,
        });
        const updated = [...rows];
        updated[index] = { ...data, isEditing: false, isNew: false };
        setRows(updated);
      } else {
        await drawdownsAPI.update(season.id, row.id!, {
          district_id: row.district_id,
          amount_withdrawn_rs: row.amount_withdrawn_rs,
          withdrawn_date: row.withdrawn_date,
          transfer_date: row.transfer_date,
          utr_no: row.utr_no,
        });
        const updated = [...rows];
        updated[index].isEditing = false;
        updated[index].isNew = false;
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

    if (!window.confirm('Delete this drawdown entry?')) return;
    if (!season) return;

    try {
      await drawdownsAPI.delete(season.id, row.id!);
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
    if (!window.confirm('Submit this drawdown for review?')) return;
    try {
      await drawdownsAPI.submit(season.id, row.id);
      const updated = [...rows];
      (updated[index] as any).status = 'submitted';
      setRows(updated);
      setMessage({ type: 'success', text: 'Submitted for review' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to submit' });
    }
  };

  const handleApproveRow = async (index: number) => {
    const row = rows[index];
    if (!season || !row.id) return;
    try {
      await drawdownsAPI.approve(season.id, row.id);
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
      await drawdownsAPI.reject(season.id, row.id, reason);
      const updated = [...rows];
      (updated[index] as any).status = 'rejected';
      setRows(updated);
      setMessage({ type: 'success', text: 'Rejected' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reject' });
    }
  };

  const getDistrictName = (row: EditableRow) => {
    // Try nested district object from backend first, then lookup
    return (row as any)?.district?.name || districts.find((d) => d.id === row.district_id)?.name || '';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ArrowDownUp className="w-7 h-7 text-blue-600" />
            District Transfers (Drawdowns)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Per-district fund transfers
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
      </div>

      {/* Summary Bar */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Loan Drawn by HOD</p>
            <p className="text-lg font-bold text-blue-600">{loan ? formatAmount((loan.total_drawn_cr || 0) * 10000000) : '--'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Transferred to Districts</p>
            <p className="text-lg font-bold text-green-600">{formatAmount(totalWithdrawn)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Balance with HOD</p>
            <p className={`text-lg font-bold ${loanDrawnRs - totalWithdrawn < 0 ? 'text-red-600' : 'text-orange-600'}`}>
              {formatAmount(loanDrawnRs - totalWithdrawn)}
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

      {/* Live Running Total */}
      {totalWithdrawn > 0 && (
        <div className="mb-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700">Running Total</span>
          <span className="text-lg font-bold text-blue-700">{formatAmount(totalWithdrawn)}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                District
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                Amount Withdrawn (in Rs)
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Withdrawn Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Transfer Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                UTR No.
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
              {(canEdit || canApprove) && <th className="px-4 py-3 text-center font-semibold text-gray-600 w-36">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.filter(r => r.isNew || statusFilter === 'all' || (((r as any).status || 'draft') === statusFilter)).map((row, index) => (
              <tr key={row.id || `new-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  {row.isEditing ? (
                    <select
                      value={row.district_id || ''}
                      onChange={(e) => handleFieldChange(index, 'district_id', parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-medium">{getDistrictName(row)}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {row.isEditing ? (
                    <div>
                      <input
                        type="number"
                        value={row.amount_withdrawn_rs || ''}
                        onChange={(e) => handleFieldChange(index, 'amount_withdrawn_rs', parseFloat(e.target.value) || 0)}
                        min={0}
                        placeholder="e.g. 25000000 for 2.5 Cr"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500"
                      />
                      {(row.amount_withdrawn_rs || 0) > 0 && (
                        <p className="text-[10px] text-blue-500 mt-0.5 text-right">= {formatAmount(row.amount_withdrawn_rs)}</p>
                      )}
                    </div>
                  ) : (
                    <span className="font-mono">{formatAmount(row.amount_withdrawn_rs)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.isEditing ? (
                    <input
                      type="date"
                      value={row.withdrawn_date}
                      onChange={(e) => handleFieldChange(index, 'withdrawn_date', e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    row.withdrawn_date
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.isEditing ? (
                    <input
                      type="date"
                      value={row.transfer_date}
                      onChange={(e) => handleFieldChange(index, 'transfer_date', e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    row.transfer_date
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.isEditing ? (
                    <input
                      type="text"
                      value={row.utr_no}
                      onChange={(e) => handleFieldChange(index, 'utr_no', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="font-mono text-xs">{row.utr_no}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {!row.isNew && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[((row as any).status || 'draft') as ApprovalStatus].cls}`}>
                      {STATUS_BADGE[((row as any).status || 'draft') as ApprovalStatus].label}
                    </span>
                  )}
                </td>
                {(canEdit || canApprove) && (
                  <td className="px-4 py-3 text-center">
                    {row.isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleSaveRow(index)} disabled={saving}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleCancelEdit(index)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        {canEdit && ((row as any).status === 'draft' || (row as any).status === 'rejected' || !(row as any).status) && (
                          <>
                            <button onClick={() => handleEditRow(index)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteRow(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {row.id && (
                              <button onClick={() => handleSubmitRow(index)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Submit">
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        {canApprove && (row as any).status === 'submitted' && (
                          <>
                            <button onClick={() => handleApproveRow(index)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve">
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRejectRow(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={(canEdit || canApprove) ? 8 : 6} className="px-4 py-8 text-center text-gray-400">
                  No drawdown entries yet. Click "+ Add District Transfer" to begin.
                </td>
              </tr>
            )}
            {/* Totals row */}
            {rows.length > 0 && (
              <tr className="bg-blue-50 font-semibold">
                <td className="px-4 py-3 text-right">TOTAL</td>
                <td className="px-4 py-3 text-right font-mono">{formatAmount(totalWithdrawn)}</td>
                <td colSpan={(canEdit || canApprove) ? 6 : 4}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Button */}
      {canEdit && (
        <div className="mt-4">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            Add District Transfer
          </button>
        </div>
      )}
    </div>
  );
};

export default DrawdownsForm;
