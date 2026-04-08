// ============================================
// pages/admin/ApprovalQueue.tsx — SUPER_ADMIN / MD approval queue
// ============================================
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ClipboardCheck, Check, X } from 'lucide-react';
import { reconciliationAPI, seasonsAPI, utilizationAPI, farmersAPI } from '../../api/services';
import type { Season, ApprovalStatus } from '../../types/markfed';

interface DistrictStatus {
  district_id: number;
  district_name: string;
  utilization_status: ApprovalStatus;
  farmers_status: ApprovalStatus;
}

const statusBadge = (status: ApprovalStatus) => {
  switch (status) {
    case 'draft':
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Draft</span>;
    case 'submitted':
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Submitted</span>;
    case 'approved':
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Approved</span>;
    case 'rejected':
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rejected</span>;
    default:
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">{status || '-'}</span>;
  }
};

export const ApprovalQueue: React.FC = () => {
  const [season, setSeason] = useState<Season | null>(null);
  const [statuses, setStatuses] = useState<DistrictStatus[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{ districtId: number; module: 'utilization' | 'farmers' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadStatuses = async (seasonId: number) => {
    try {
      const { data } = await reconciliationAPI.status(seasonId);
      setStatuses(data as DistrictStatus[]);
    } catch { /* empty */ }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data: activeSeason } = await seasonsAPI.active();
        setSeason(activeSeason);
        await loadStatuses(activeSeason.id);
      } catch { setMessage({ type: 'error', text: 'Failed to load active season' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleApprove = async (districtId: number, module: 'utilization' | 'farmers') => {
    if (!season) return;
    const key = `${module}-${districtId}-approve`;
    setActionLoading(key);
    try {
      if (module === 'utilization') {
        await utilizationAPI.approve(season.id, districtId);
      } else {
        await farmersAPI.approve(season.id, districtId);
      }
      await loadStatuses(season.id);
      setMessage({ type: 'success', text: `${module === 'utilization' ? 'Utilization' : 'Farmers'} approved for district` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Approve failed' }); }
    finally { setActionLoading(null); }
  };

  const openRejectModal = (districtId: number, module: 'utilization' | 'farmers') => {
    setRejectModal({ districtId, module });
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!season || !rejectModal) return;
    if (!rejectReason.trim()) { setMessage({ type: 'error', text: 'Rejection reason is required' }); return; }
    const key = `${rejectModal.module}-${rejectModal.districtId}-reject`;
    setActionLoading(key);
    try {
      if (rejectModal.module === 'utilization') {
        await utilizationAPI.reject(season.id, rejectModal.districtId, rejectReason);
      } else {
        await farmersAPI.reject(season.id, rejectModal.districtId, rejectReason);
      }
      await loadStatuses(season.id);
      setRejectModal(null);
      setMessage({ type: 'success', text: `${rejectModal.module === 'utilization' ? 'Utilization' : 'Farmers'} rejected` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Reject failed' }); }
    finally { setActionLoading(null); }
  };

  const renderActions = (districtId: number, status: ApprovalStatus, module: 'utilization' | 'farmers') => {
    if (status !== 'submitted') return null;
    const approveKey = `${module}-${districtId}-approve`;
    const rejectKey = `${module}-${districtId}-reject`;
    return (
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => handleApprove(districtId, module)}
          disabled={actionLoading === approveKey}
          className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
          title="Approve"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => openRejectModal(districtId, module)}
          disabled={actionLoading === rejectKey}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
          title="Reject"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><ClipboardCheck className="w-7 h-7 text-blue-600" />Approval Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            {season ? `Season: ${season.season_name} — ${season.crop}` : 'No active season'}
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message.text}
        </div>
      )}

      {!season ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">No active season found. Please create and activate a season first.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">District</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Utilization Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 w-28">Utilization Actions</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Farmers Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 w-28">Farmers Actions</th>
            </tr></thead>
            <tbody>
              {statuses.map((s) => (
                <tr key={s.district_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.district_name}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(s.utilization_status)}</td>
                  <td className="px-4 py-3 text-center">{renderActions(s.district_id, s.utilization_status, 'utilization')}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(s.farmers_status)}</td>
                  <td className="px-4 py-3 text-center">{renderActions(s.district_id, s.farmers_status, 'farmers')}</td>
                </tr>
              ))}
              {statuses.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No district submissions found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {rejectModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setRejectModal(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">Reject {rejectModal.module === 'utilization' ? 'Utilization' : 'Farmers'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for rejection</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Please provide a reason..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
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
