// ============================================
// pages/reports/ReconciliationDashboard.tsx — Financial Reconciliation Dashboard
// ============================================
import React, { useState, useEffect } from 'react';
import {
  BarChart3, Loader2, XCircle, TrendingUp, Wallet, ArrowDownRight, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { seasonsAPI, reconciliationAPI } from '../../api/services';
import { formatAmount, num } from '../../types/markfed';
import type { Season } from '../../types/markfed';

// ─── Status config for bills ────────────────────
const BILL_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:               { label: 'Draft',            color: 'bg-yellow-500' },
  submitted:           { label: 'Submitted',        color: 'bg-blue-500' },
  warehouse_certified: { label: 'WH Certified',    color: 'bg-blue-400' },
  dm_verified:         { label: 'DM Verified',      color: 'bg-orange-500' },
  verified:            { label: 'Verified',          color: 'bg-orange-500' },
  manager_approved:    { label: 'Approved',          color: 'bg-green-500' },
  approved:            { label: 'Approved',          color: 'bg-green-500' },
  rejected:            { label: 'Rejected',          color: 'bg-red-500' },
};

export const ReconciliationDashboard: React.FC = () => {
  const { user } = useAuth();

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data sections
  const [variance, setVariance] = useState<any>(null);
  const [commodityData, setCommodityData] = useState<any[]>([]);
  const [billsData, setBillsData] = useState<any>(null);
  const [billsTab, setBillsTab] = useState<'unloading' | 'transport' | 'gunny'>('unloading');

  // ─── Load seasons ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await seasonsAPI.list();
        const list: Season[] = Array.isArray(res.data) ? res.data : [];
        setSeasons(list);
        const active = list.find((s) => s.is_active) || list[0];
        if (active) setSelectedSeasonId(active.id);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load seasons');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Load reconciliation data ─────────────────────
  useEffect(() => {
    if (!selectedSeasonId) return;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [varRes, commRes, billsRes] = await Promise.all([
          reconciliationAPI.variance(selectedSeasonId),
          reconciliationAPI.commodity(selectedSeasonId),
          reconciliationAPI.bills(selectedSeasonId),
        ]);
        setVariance(varRes.data);
        const commData = commRes.data;
        setCommodityData(Array.isArray(commData) ? commData : commData?.data || []);
        setBillsData(billsRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load reconciliation data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedSeasonId]);

  // ─── Progress bar helper ──────────────────────────
  const ProgressCard: React.FC<{
    label: string; amount: number; total: number; color: string; icon: React.ReactNode;
  }> = ({ label, amount, total, color, icon }) => {
    const pct = total > 0 ? Math.min((amount / total) * 100, 100) : 0;
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-semibold text-gray-600">{label}</h3>
          </div>
          <span className="text-xs font-medium text-gray-400">{pct.toFixed(1)}%</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-3">{formatAmount(amount)}</p>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">of {formatAmount(total)}</p>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────
  if (loading && !variance) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  const sanctioned = num(variance?.total_sanctioned_rs || variance?.total_sanctioned_cr) * (variance?.total_sanctioned_cr ? 10000000 : 1);
  const drawn = num(variance?.total_drawn_rs || variance?.total_drawn_cr) * (variance?.total_drawn_cr && !variance?.total_drawn_rs ? 10000000 : 1);
  const utilised = num(variance?.total_utilised_rs);
  const balance = num(variance?.balance_rs) || (drawn - utilised);

  // Bills by category
  const unloadingBills = billsData?.unloading || billsData?.unloading_bills || [];
  const transportBills = billsData?.transport || billsData?.transport_bills || [];
  const gunnyBills = billsData?.gunny || billsData?.gunny_bills || [];

  const currentBills = billsTab === 'unloading' ? unloadingBills
    : billsTab === 'transport' ? transportBills
    : gunnyBills;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          Reconciliation Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Financial variance analysis and bill status tracking
        </p>
      </div>

      {/* Season Selector */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="max-w-xs">
          <label className="block text-xs font-medium text-gray-600 mb-1">Season</label>
          <select value={selectedSeasonId} onChange={(e) => setSelectedSeasonId(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.season_name}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* ─── Section 1: Financial Variance ───────────── */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Variance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProgressCard
            label="Sanctioned"
            amount={sanctioned}
            total={sanctioned}
            color="bg-blue-500"
            icon={<Wallet className="w-5 h-5 text-blue-500" />}
          />
          <ProgressCard
            label="Drawn"
            amount={drawn}
            total={sanctioned}
            color="bg-purple-500"
            icon={<ArrowDownRight className="w-5 h-5 text-purple-500" />}
          />
          <ProgressCard
            label="Utilised"
            amount={utilised}
            total={drawn}
            color="bg-green-500"
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          />
          <ProgressCard
            label="Balance"
            amount={balance}
            total={drawn}
            color="bg-orange-500"
            icon={<ArrowUpRight className="w-5 h-5 text-orange-500" />}
          />
        </div>
      </div>

      {/* ─── Section 2: Commodity Achievement ────────── */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Commodity Achievement</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commodity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Allotted Qty (MTs)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Procured Qty (MTs)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Achievement %</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Funds Gap (Rs.)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {commodityData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No commodity data available
                    </td>
                  </tr>
                ) : (
                  commodityData.map((c: any, idx: number) => {
                    const allotted = num(c.allotted_qty_mts);
                    const procured = num(c.procured_qty_mts);
                    const achievement = allotted > 0 ? (procured / allotted) * 100 : 0;
                    const fundsGap = num(c.funds_gap_rs);

                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.commodity_name || c.name}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {allotted.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {procured.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-2">
                              <div className={`h-2 rounded-full ${
                                achievement >= 100 ? 'bg-green-500' : achievement >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                              }`} style={{ width: `${Math.min(achievement, 100)}%` }} />
                            </div>
                            <span className={`font-semibold ${
                              achievement >= 100 ? 'text-green-700' : achievement >= 50 ? 'text-blue-700' : 'text-orange-700'
                            }`}>{achievement.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={fundsGap > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                            {formatAmount(Math.abs(fundsGap))}
                            {fundsGap > 0 && ' deficit'}
                          </span>
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

      {/* ─── Section 3: Bills Status ─────────────────── */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bills Status</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-6">
              {([
                { id: 'unloading' as const, label: 'Unloading', data: unloadingBills },
                { id: 'transport' as const, label: 'Transport', data: transportBills },
                { id: 'gunny' as const, label: 'Gunny', data: gunnyBills },
              ]).map((tab) => (
                <button key={tab.id}
                  onClick={() => setBillsTab(tab.id)}
                  className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    billsTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab.label}
                  {Array.isArray(tab.data) && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      billsTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.data.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bills content */}
          <div className="p-6">
            {Array.isArray(currentBills) && currentBills.length > 0 ? (
              <div className="space-y-3">
                {currentBills.map((item: any, idx: number) => {
                  const statusKey = item.status || 'draft';
                  const cfg = BILL_STATUS_CONFIG[statusKey] || { label: statusKey, color: 'bg-gray-500' };
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                        <span className="text-sm font-medium text-gray-700">{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{num(item.count).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-400">bills</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-700">{formatAmount(num(item.total_amount))}</p>
                          <p className="text-xs text-gray-400">amount</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                No bill status data available for {billsTab}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationDashboard;
