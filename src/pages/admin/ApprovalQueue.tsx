// ============================================
// pages/admin/ApprovalQueue.tsx — Approval queue for submitted records
// ============================================
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ClipboardCheck, Check, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { seasonsAPI, utilizationAPI, farmersAPI } from '../../api/services';
import type { Season, ApprovalStatus } from '../../types/markfed';
import { formatAmount, num } from '../../types/markfed';

interface PendingRecord {
  id: number;
  module: 'utilization' | 'farmers';
  district_id: number;
  district_name: string;
  amount: number;
  remarks: string;
  status: ApprovalStatus;
  submitted_at: string;
}

const statusBadge = (status: ApprovalStatus) => {
  const map: Record<string, { cls: string; label: string }> = {
    draft: { cls: 'bg-gray-100 text-gray-500', label: 'Draft' },
    submitted: { cls: 'bg-yellow-100 text-yellow-700', label: 'Submitted' },
    approved: { cls: 'bg-green-100 text-green-700', label: 'Approved' },
    rejected: { cls: 'bg-red-100 text-red-700', label: 'Rejected' },
  };
  const m = map[status] || map.draft;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m.cls}`}>{m.label}</span>;
};

export const ApprovalQueue: React.FC = () => {
  const navigate = useNavigate();
  const [season, setSeason] = useState<Season | null>(null);
  const [records, setRecords] = useState<PendingRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('submitted');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<PendingRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRecords = async (seasonId: number) => {
    try {
      const [utilRes, farmRes] = await Promise.allSettled([
        utilizationAPI.listAll(seasonId),
        farmersAPI.listAll(seasonId),
      ]);

      const pending: PendingRecord[] = [];

      if (utilRes.status === 'fulfilled') {
        const utilData = Array.isArray(utilRes.value.data) ? utilRes.value.data : (utilRes.value.data as any)?.data || [];
        utilData.forEach((u: any) => {
          const entries = u.entries || [];
          const total = entries.reduce((s: number, e: any) => s + num(e.amount_rs), 0);
          pending.push({
            id: u.id,
            module: 'utilization',
            district_id: u.district_id,
            district_name: u.district?.name || `District ${u.district_id}`,
            amount: total,
            remarks: u.remarks || '',
            status: u.status || 'draft',
            submitted_at: u.submitted_at || u.last_saved_at || '',
          });
        });
      }

      if (farmRes.status === 'fulfilled') {
        const farmData = Array.isArray(farmRes.value.data) ? farmRes.value.data : (farmRes.value.data as any)?.data || [];
        farmData.forEach((f: any) => {
          pending.push({
            id: f.id,
            module: 'farmers',
            district_id: f.district_id,
            district_name: f.district?.name || `District ${f.district_id}`,
            amount: num(f.payment_released_to_farmers_rs),
            remarks: f.remarks || '',
            status: f.status || 'draft',
            submitted_at: f.submitted_at || f.last_saved_at || '',
          });
        });
      }

      setRecords(pending);
    } catch { /* error */ }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data: activeSeason } = await seasonsAPI.active();
        setSeason(activeSeason);
        await loadRecords(activeSeason.id);
      } catch { setMessage({ type: 'error', text: 'Failed to load active season' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleApprove = async (rec: PendingRecord) => {
    if (!season) return;
    const key = `${rec.module}-${rec.id}-approve`;
    setActionLoading(key);
    try {
      if (rec.module === 'utilization') {
        await utilizationAPI.approve(season.id, rec.id);
      } else {
        await farmersAPI.approve(season.id, rec.id);
      }
      await loadRecords(season.id);
      setMessage({ type: 'success', text: `${rec.module === 'utilization' ? 'Utilization' : 'Farmers'} approved for ${rec.district_name}` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Approve failed' }); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!season || !rejectModal) return;
    if (!rejectReason.trim()) { setMessage({ type: 'error', text: 'Rejection reason is required' }); return; }
    const key = `${rejectModal.module}-${rejectModal.id}-reject`;
    setActionLoading(key);
    try {
      if (rejectModal.module === 'utilization') {
        await utilizationAPI.reject(season.id, rejectModal.id, rejectReason);
      } else {
        await farmersAPI.reject(season.id, rejectModal.id, rejectReason);
      }
      await loadRecords(season.id);
      setRejectModal(null);
      setMessage({ type: 'success', text: `${rejectModal.module === 'utilization' ? 'Utilization' : 'Farmers'} rejected` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Reject failed' }); }
    finally { setActionLoading(null); }
  };

  const handleView = (rec: PendingRecord) => {
    if (rec.module === 'utilization') {
      navigate(`/data-entry/utilization/${rec.id}`);
    } else {
      navigate(`/data-entry/farmers/${rec.id}`);
    }
  };

  const filtered = records.filter(r => filter === 'all' || r.status === filter);
  const submittedCount = records.filter(r => r.status === 'submitted').length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardCheck className="w-7 h-7 text-blue-600" />
            Approval Queue
            {submittedCount > 0 && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">{submittedCount} pending</span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {season ? `Season: ${season.season_name}` : 'No active season'}
          </p>
        </div>
        <div className="flex gap-1">
          {(['submitted', 'approved', 'rejected', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message.text}
        </div>
      )}

      {!season ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">No active season found.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Module</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">District</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Remarks</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Submitted</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((rec) => (
                <tr key={`${rec.module}-${rec.id}`} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${rec.module === 'utilization' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}`}>
                      {rec.module === 'utilization' ? 'Utilization' : 'Farmers'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{rec.district_name}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(rec.amount)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate">{rec.remarks || '-'}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(rec.status)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{rec.submitted_at ? new Date(rec.submitted_at).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleView(rec)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      {rec.status === 'submitted' && (
                        <>
                          <button onClick={() => handleApprove(rec)}
                            disabled={actionLoading === `${rec.module}-${rec.id}-approve`}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setRejectModal(rec); setRejectReason(''); }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  {filter === 'submitted' ? 'No pending approvals' : 'No records found'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {rejectModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setRejectModal(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">Reject {rejectModal.module === 'utilization' ? 'Utilization' : 'Farmers'} — {rejectModal.district_name}</h2>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Reason for rejection..." />
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setRejectModal(null)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                <button onClick={handleReject} disabled={!!actionLoading} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">Reject</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApprovalQueue;
