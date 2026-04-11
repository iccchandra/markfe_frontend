// ============================================
// pages/reports/HistoricalProcurement.tsx — Historical Procurement Data with Chart
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import {
  History, Loader2, XCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { commoditiesAPI, historicalProcurementAPI } from '../../api/services';
import { formatAmount, num } from '../../types/markfed';

export const HistoricalProcurement: React.FC = () => {
  const { user } = useAuth();

  const [commodities, setCommodities] = useState<any[]>([]);
  const [commodityFilter, setCommodityFilter] = useState<number>(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Load commodities ─────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await commoditiesAPI.list();
        setCommodities(res.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load commodities');
      }
    };
    load();
  }, []);

  // ─── Load historical data ────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await historicalProcurementAPI.list(commodityFilter || undefined);
        const raw: any = res.data;
        setData(Array.isArray(raw) ? raw : raw?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load historical data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [commodityFilter]);

  // ─── Summary totals ──────────────────────────────
  const totals = useMemo(() => {
    return data.reduce((acc, row) => ({
      farmers: acc.farmers + num(row.farmers),
      qty_mts: acc.qty_mts + num(row.qty_procured_mts || row.qty_mts),
      value_cr: acc.value_cr + num(row.value_cr || row.value_rs / 10000000),
    }), { farmers: 0, qty_mts: 0, value_cr: 0 });
  }, [data]);

  // ─── Chart data ───────────────────────────────────
  const chartData = useMemo(() => {
    return data.map((row) => ({
      year: row.year || row.season_year,
      crop: row.crop || row.commodity_name,
      qty: num(row.qty_procured_mts || row.qty_mts),
      value: num(row.value_cr || (row.value_rs ? row.value_rs / 10000000 : 0)),
      farmers: num(row.farmers),
    }));
  }, [data]);

  // ─── Render ───────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <History className="w-7 h-7 text-blue-600" />
          Historical Procurement
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Year-wise procurement data for all commodities
        </p>
      </div>

      {/* Filter */}
      <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="max-w-xs">
          <label className="block text-xs font-medium text-gray-600 mb-1">Commodity</label>
          <select value={commodityFilter} onChange={(e) => setCommodityFilter(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            <option value={0}>All Commodities</option>
            {commodities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quantity Procured (MTs) by Year</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'qty') return [value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' MTs', 'Quantity'];
                    if (name === 'value') return [value.toFixed(2) + ' Cr', 'Value'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Year: ${label}`}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="qty" fill="#3b82f6" radius={[4, 4, 0, 0]} name="qty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Crop</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">MSP (Rs./Qtl)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Farmers</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty Procured (MTs)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Value (Cr)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No historical procurement data available
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.year || row.season_year}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.crop || row.commodity_name}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{num(row.msp_rate).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{num(row.farmers).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {num(row.qty_procured_mts || row.qty_mts).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-blue-700">
                        {num(row.value_cr || (row.value_rs ? row.value_rs / 10000000 : 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900" colSpan={3}>TOTAL</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                      {totals.farmers.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                      {totals.qty_mts.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-blue-700">
                      {totals.value_cr.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalProcurement;
