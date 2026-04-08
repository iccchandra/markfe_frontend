// ============================================
// pages/dashboard/MarkfedDashboard.tsx — Maize MSP Dashboard
// Per Spec Section 6.2: Summary cards, district table, quick actions
// ============================================
import React, { useState, useEffect } from 'react';
import {
  Landmark, TrendingUp, PieChart, Wallet, Download, Wheat,
  ArrowRight, Users, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI, seasonsAPI, exportAPI, farmersAPI } from '../../api/services';
import type { DistrictFarmers } from '../../types/markfed';
import { UserRole, formatAmount, num } from '../../types/markfed';
import type { Season, DashboardSummary, DistrictSummaryRow } from '../../types/markfed';

export const MarkfedDashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const [season, setSeason] = useState<Season | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDistrict, setExpandedDistrict] = useState<number | null>(null);
  const [pacsRows, setPacsRows] = useState<DistrictFarmers[]>([]);

  // Load seasons on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [activeRes, listRes] = await Promise.allSettled([
          seasonsAPI.active(),
          seasonsAPI.list(),
        ]);
        const activeSeason = activeRes.status === 'fulfilled' ? activeRes.value.data : null;
        const allSeasons = listRes.status === 'fulfilled' ? listRes.value.data : [];

        setSeasons(allSeasons);
        if (activeSeason) {
          setSeason({
            ...activeSeason,
            msp_rate: num(activeSeason.msp_rate),
            total_sanctioned_cr: num(activeSeason.total_sanctioned_cr),
          });
        }
      } catch { /* fallback */ }
    };
    load();
  }, []);

  // Load dashboard when season changes
  useEffect(() => {
    if (!season) { setLoading(false); return; }
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const { data } = await dashboardAPI.summary(season.id);
        setSummary({
          total_sanctioned_cr: num(data.total_sanctioned_cr),
          total_drawn_cr: num(data.total_drawn_cr),
          total_utilised_rs: num(data.total_utilised_rs),
          total_balance_rs: num(data.total_balance_rs),
          district_wise_summary: (data.district_wise_summary || []).map((d: any) => ({
            ...d,
            amount_received_rs: num(d.amount_received_rs),
            farmers_paid_rs: num(d.farmers_paid_rs),
            gunnies_rs: num(d.gunnies_rs),
            transportation_rs: num(d.transportation_rs),
            unloading_rs: num(d.unloading_rs),
            storage_rs: num(d.storage_rs),
            total_utilised_rs: num(d.total_utilised_rs),
            balance_rs: num(d.balance_rs),
          })),
        });
      } catch {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [season]);

  const handleSeasonChange = (seasonId: number) => {
    const s = seasons.find((x) => x.id === seasonId);
    if (s) setSeason({ ...s, msp_rate: num(s.msp_rate), total_sanctioned_cr: num(s.total_sanctioned_cr) });
  };

  const handleDistrictClick = async (districtId: number) => {
    if (expandedDistrict === districtId) {
      setExpandedDistrict(null);
      setPacsRows([]);
      return;
    }
    if (!season) return;
    setExpandedDistrict(districtId);
    try {
      const res = await farmersAPI.listByDistrict(season.id, districtId);
      const data = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
      setPacsRows(data);
    } catch { setPacsRows([]); }
  };

  const handleExportExcel = async () => {
    if (!season) return;
    try {
      const dmDistrictId = user?.role === UserRole.DM ? user.district_id : undefined;
      const res = await exportAPI.excel(season.id, dmDistrictId || undefined);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `MARKFED_${season.season_name}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Export failed'); }
  };

  // All districts shown — backend returns only approved utilization data
  const allRows: DistrictSummaryRow[] = summary?.district_wise_summary || [];
  const districtRows: DistrictSummaryRow[] = user?.role === UserRole.DM && user.district_id
    ? allRows.filter((d) => d.district_id === user.district_id)
    : allRows;

  // Totals
  const districtTotals = districtRows.reduce(
    (acc, d) => ({
      amount_received_rs: acc.amount_received_rs + d.amount_received_rs,
      farmers_paid_rs: acc.farmers_paid_rs + d.farmers_paid_rs,
      gunnies_rs: acc.gunnies_rs + d.gunnies_rs,
      transportation_rs: acc.transportation_rs + d.transportation_rs,
      unloading_rs: acc.unloading_rs + d.unloading_rs,
      storage_rs: acc.storage_rs + d.storage_rs,
      total_utilised_rs: acc.total_utilised_rs + d.total_utilised_rs,
      balance_rs: acc.balance_rs + d.balance_rs,
    }),
    { amount_received_rs: 0, farmers_paid_rs: 0, gunnies_rs: 0, transportation_rs: 0, unloading_rs: 0, storage_rs: 0, total_utilised_rs: 0, balance_rs: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Wheat className="w-7 h-7 text-green-600" />
            Maize MSP Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {season ? `${season.season_name} | G.O No. ${season.go_number} | MSP @ Rs.${season.msp_rate}/Qtl` : 'No active season'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Season Selector */}
          <select
            value={season?.id || ''}
            onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.season_name}</option>
            ))}
          </select>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards — DM sees district-level, others see global */}
      {user?.role === UserRole.DM ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Landmark className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Funds Received</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{formatAmount(districtTotals.amount_received_rs)}</p>
            <p className="text-xs text-gray-400 mt-1">From HOD to your district</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Utilised</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{formatAmount(districtTotals.total_utilised_rs)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Balance</p>
            <p className={`text-2xl font-bold mt-1 ${districtTotals.balance_rs < 0 ? 'text-red-600' : 'text-orange-600'}`}>
              {formatAmount(districtTotals.balance_rs)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Received - Utilised</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Landmark className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Sanctioned</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatAmount((summary?.total_sanctioned_cr || 0) * 10000000)}</p>
            <p className="text-xs text-gray-400 mt-1">As per G.O No. {season?.go_number}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Drawn by HOD</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatAmount((summary?.total_drawn_cr || 0) * 10000000)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {summary && summary.total_sanctioned_cr > 0 ? `${((summary.total_drawn_cr / summary.total_sanctioned_cr) * 100).toFixed(1)}% of sanctioned` : ''}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Utilised</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{formatAmount(districtTotals.total_utilised_rs)}</p>
            <p className="text-xs text-gray-400 mt-1">Approved only</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Balance</p>
            <p className={`text-2xl font-bold mt-1 ${districtTotals.balance_rs < 0 ? 'text-red-600' : 'text-orange-600'}`}>
              {formatAmount(districtTotals.balance_rs)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Drawn - Utilised</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        {hasRole(UserRole.AO_CAO, UserRole.SUPER_ADMIN) && (
          <button
            onClick={() => navigate('/data-entry/loan')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm"
          >
            <Landmark className="w-4 h-4" />
            Fill Loan Data
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
        {hasRole(UserRole.DM, UserRole.SUPER_ADMIN) && (
          <button
            onClick={() => navigate('/data-entry/utilization')}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm"
          >
            <PieChart className="w-4 h-4" />
            Fill My Utilization
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => navigate('/reports/md-sheet')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg"
        >
          <FileSpreadsheet className="w-4 h-4" />
          View MD Sheet
        </button>
        <button
          onClick={() => navigate('/reports/farmers-sheet')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg"
        >
          <Users className="w-4 h-4" />
          View Farmers Sheet
        </button>
      </div>

      {/* District-wise Utilization Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">District-wise Utilization</h2>
          <span className="text-xs text-gray-400">{districtRows.length} district(s)</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-xs">
              <th className="px-4 py-3 text-left font-semibold">District</th>
              <th className="px-4 py-3 text-right font-semibold">Amt Received</th>
              <th className="px-4 py-3 text-right font-semibold">Farmers Paid</th>
              <th className="px-4 py-3 text-right font-semibold">Gunnies</th>
              <th className="px-4 py-3 text-right font-semibold">Transport</th>
              <th className="px-4 py-3 text-right font-semibold">Unloading</th>
              <th className="px-4 py-3 text-right font-semibold">Storage</th>
              <th className="px-4 py-3 text-right font-semibold bg-gray-100">Total</th>
              <th className="px-4 py-3 text-right font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {districtRows.map((d) => {
              const isMyDistrict = user?.role === UserRole.DM && user.district_id === d.district_id;
              const isExpanded = expandedDistrict === d.district_id;
              return (
                <React.Fragment key={d.district_id}>
                  <tr
                    onClick={() => handleDistrictClick(d.district_id)}
                    className={`border-b hover:bg-gray-100 cursor-pointer ${isMyDistrict ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium">
                      <span className="mr-1 text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                      {d.district_name}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(d.amount_received_rs)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(d.farmers_paid_rs)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(d.gunnies_rs)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(d.transportation_rs)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(d.unloading_rs)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(d.storage_rs)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold bg-gray-50">{formatAmount(d.total_utilised_rs)}</td>
                    <td className={`px-4 py-3 text-right font-mono text-xs ${d.balance_rs < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatAmount(d.balance_rs)}
                    </td>
                  </tr>
                  {/* PACS drilldown rows */}
                  {isExpanded && (
                    <>
                      {pacsRows.length === 0 ? (
                        <tr className="bg-gray-50">
                          <td colSpan={9} className="px-8 py-2 text-xs text-gray-400 italic">No farmer records for this district</td>
                        </tr>
                      ) : (
                        <>
                          <tr className="bg-gray-100">
                            <td className="px-8 py-1.5 text-[10px] font-semibold text-gray-500">PACS/DCMS/FPO</td>
                            <td className="px-4 py-1.5 text-[10px] font-semibold text-gray-500 text-center">Type</td>
                            <td className="px-4 py-1.5 text-[10px] font-semibold text-gray-500 text-right">Farmers</td>
                            <td className="px-4 py-1.5 text-[10px] font-semibold text-gray-500 text-right">Qty (Qtl)</td>
                            <td className="px-4 py-1.5 text-[10px] font-semibold text-gray-500 text-right">Cost</td>
                            <td className="px-4 py-1.5 text-[10px] font-semibold text-gray-500 text-right">Released</td>
                            <td className="px-4 py-1.5 text-[10px] font-semibold text-gray-500 text-right">Status</td>
                            <td colSpan={2} className="px-4 py-1.5 text-[10px] font-semibold text-gray-500">Remarks</td>
                          </tr>
                          {pacsRows.map((p: any) => (
                            <tr key={p.id} className="bg-gray-50/70 border-b border-gray-100">
                              <td className="px-8 py-1.5 text-xs text-gray-700">{p.pacs_entity?.name || '-'}</td>
                              <td className="px-4 py-1.5 text-xs text-center">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">{p.pacs_entity?.type || '-'}</span>
                              </td>
                              <td className="px-4 py-1.5 text-xs text-right">{num(p.farmers_count).toLocaleString('en-IN')}</td>
                              <td className="px-4 py-1.5 text-xs text-right">{num(p.quantity_procured_qtl).toLocaleString('en-IN', { maximumFractionDigits: 3 })}</td>
                              <td className="px-4 py-1.5 text-xs text-right font-mono">{formatAmount(num(p.quantity_procured_qtl) * num(season?.msp_rate))}</td>
                              <td className="px-4 py-1.5 text-xs text-right font-mono">{formatAmount(num(p.payment_released_to_farmers_rs))}</td>
                              <td className="px-4 py-1.5 text-xs text-right">
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  p.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  p.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                  p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-500'
                                }`}>{p.status || 'draft'}</span>
                              </td>
                              <td colSpan={2} className="px-4 py-1.5 text-xs text-gray-500 truncate max-w-[150px]">{p.remarks || '-'}</td>
                            </tr>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </React.Fragment>
              );
            })}
            {districtRows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No utilization data yet. Districts will appear here as data is entered.
                </td>
              </tr>
            )}
            {/* Totals Row */}
            {districtRows.length > 0 && (
              <tr className="bg-blue-50 font-bold border-t-2 border-blue-300">
                <td className="px-4 py-3">TOTAL</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(districtTotals.amount_received_rs)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(districtTotals.farmers_paid_rs)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(districtTotals.gunnies_rs)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(districtTotals.transportation_rs)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(districtTotals.unloading_rs)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatAmount(districtTotals.storage_rs)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs bg-blue-100">{formatAmount(districtTotals.total_utilised_rs)}</td>
                <td className={`px-4 py-3 text-right font-mono text-xs ${districtTotals.balance_rs < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatAmount(districtTotals.balance_rs)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {user?.role === UserRole.DM && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded" />
          Your district is highlighted
        </div>
      )}
    </div>
  );
};

export default MarkfedDashboard;
