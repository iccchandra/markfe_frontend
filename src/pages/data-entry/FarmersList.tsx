// ============================================
// pages/data-entry/FarmersList.tsx — District Farmers List Page
// Shows all districts with farmer procurement data summary
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Eye, Pencil, ShieldCheck, XCircle, Loader2 } from 'lucide-react';
import { seasonsAPI, districtsAPI, farmersAPI } from '../../api/services';
import type { Season, District, DistrictFarmers } from '../../types/markfed';
import { UserRole, formatAmount, calcCostOfProcuredQty, num, ApprovalStatus } from '../../types/markfed';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'bg-gray-100 text-gray-500' },
  draft:     { label: 'Draft',     cls: 'bg-yellow-100 text-yellow-700' },
  submitted: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
  approved:  { label: 'Approved',  cls: 'bg-green-100 text-green-700' },
  rejected:  { label: 'Rejected',  cls: 'bg-red-100 text-red-700' },
};

export const FarmersList: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const canApprove = hasRole(UserRole.AO_CAO) || hasRole(UserRole.MD) || hasRole(UserRole.SUPER_ADMIN);

  const [season, setSeason] = useState<Season | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [farmersRecords, setFarmersRecords] = useState<DistrictFarmers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [seasonRes, distRes] = await Promise.all([
          seasonsAPI.active(),
          districtsAPI.list(),
        ]);
        setSeason(seasonRes.data);
        setDistricts(distRes.data);

        // Load all farmers records for the active season
        try {
          const farmAllRes = await farmersAPI.listAll(seasonRes.data.id);
          const farmAll = Array.isArray(farmAllRes.data)
            ? farmAllRes.data
            : (farmAllRes.data as any)?.data || [];
          setFarmersRecords(farmAll);
        } catch {
          // No data yet — leave empty
          setFarmersRecords([]);
        }
      } catch {
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const mspRate = num(season?.msp_rate);

  // Build rows: one per district, matched with farmers record
  const rows = useMemo(() => {
    let filteredDistricts = districts;

    // DM users only see their own district
    if (user?.role === UserRole.DM && user.district_id) {
      filteredDistricts = districts.filter((d) => d.id === user.district_id);
    }

    return filteredDistricts.map((district) => {
      const record = farmersRecords.find((f) => f.district_id === district.id);
      const qty = num(record?.quantity_procured_qtl);
      const cost = calcCostOfProcuredQty(qty, mspRate);
      const status: string = record?.status || 'pending';

      return {
        district,
        record,
        pacsCount: num(record?.pacs_count),
        farmersCount: num(record?.farmers_count),
        qty,
        cost,
        paymentReleased: num(record?.payment_released_to_farmers_rs),
        status,
      };
    });
  }, [districts, farmersRecords, mspRate, user]);

  const handleApprove = async (districtId: number) => {
    if (!season) return;
    if (!window.confirm('Approve this farmers data?')) return;
    try {
      await farmersAPI.approve(season.id, districtId);
      // Refresh records
      const farmAllRes = await farmersAPI.listAll(season.id);
      const farmAll = Array.isArray(farmAllRes.data)
        ? farmAllRes.data
        : (farmAllRes.data as any)?.data || [];
      setFarmersRecords(farmAll);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (districtId: number) => {
    if (!season) return;
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    try {
      await farmersAPI.reject(season.id, districtId, reason);
      // Refresh records
      const farmAllRes = await farmersAPI.listAll(season.id);
      const farmAll = Array.isArray(farmAllRes.data)
        ? farmAllRes.data
        : (farmAllRes.data as any)?.data || [];
      setFarmersRecords(farmAll);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-500">Loading farmers data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-7 h-7 text-green-600" />
          District Farmers Data
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Procurement &amp; Payment Tracking
          {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
          {mspRate > 0 && <span className="text-gray-400 ml-2">(MSP: Rs.{mspRate}/Qtl)</span>}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  District Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PACS Count
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Farmers Count
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Qty Procured (Qtl)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cost of Procured
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment Released
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No districts found.
                  </td>
                </tr>
              ) : (
                rows.map(({ district, record, pacsCount, farmersCount, qty, cost, paymentReleased, status }) => {
                  const badge = STATUS_BADGE[status] || STATUS_BADGE.pending;

                  return (
                    <tr key={district.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {district.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {pacsCount > 0 ? pacsCount.toLocaleString('en-IN') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {farmersCount > 0 ? farmersCount.toLocaleString('en-IN') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {qty > 0 ? qty.toLocaleString('en-IN', { maximumFractionDigits: 3 }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {cost > 0 ? formatAmount(cost) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {paymentReleased > 0 ? formatAmount(paymentReleased) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* No data yet — Add */}
                          {status === 'pending' && (
                            <button
                              onClick={() => navigate(`/data-entry/farmers/${district.id}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                              title="Add Data"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add
                            </button>
                          )}

                          {/* Draft or Rejected — Edit */}
                          {(status === 'draft' || status === 'rejected') && (
                            <button
                              onClick={() => navigate(`/data-entry/farmers/${district.id}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              title="Edit Data"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          )}

                          {/* Submitted — View + Approve/Reject for approvers */}
                          {status === 'submitted' && (
                            <>
                              <button
                                onClick={() => navigate(`/data-entry/farmers/${district.id}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                                title="View Data"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                              {canApprove && (
                                <>
                                  <button
                                    onClick={() => handleApprove(district.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                    title="Approve"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(district.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                    title="Reject"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </>
                          )}

                          {/* Approved — View only */}
                          {status === 'approved' && (
                            <button
                              onClick={() => navigate(`/data-entry/farmers/${district.id}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                              title="View Data"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FarmersList;
