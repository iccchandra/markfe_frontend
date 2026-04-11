// ============================================
// pages/reports/DPRReport.tsx — Daily Progress Report Summary
// ============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Loader2, Download, ChevronDown, ChevronRight, XCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { seasonsAPI, dprAPI, exportAPI } from '../../api/services';
import { formatAmount, num } from '../../types/markfed';
import type { Season } from '../../types/markfed';

export const DPRReport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(0);
  const [summary, setSummary] = useState<any>(null);
  const [commodityDetail, setCommodityDetail] = useState<Record<number, any[]>>({});
  const [expandedCommodity, setExpandedCommodity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // ─── Load DPR summary when season changes ─────────
  useEffect(() => {
    if (!selectedSeasonId) return;
    const loadSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await dprAPI.summary(selectedSeasonId);
        setSummary(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load DPR summary');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [selectedSeasonId]);

  // ─── Toggle commodity detail ──────────────────────
  const toggleCommodity = async (commodityId: number) => {
    if (expandedCommodity === commodityId) {
      setExpandedCommodity(null);
      return;
    }

    setExpandedCommodity(commodityId);

    // Load detail if not already loaded
    if (!commodityDetail[commodityId]) {
      setDetailLoading(commodityId);
      try {
        const res = await dprAPI.commodity(selectedSeasonId, commodityId);
        const data = res.data;
        const districts = Array.isArray(data) ? data : data?.districts || data?.data || [];
        setCommodityDetail((prev) => ({ ...prev, [commodityId]: districts }));
      } catch {
        setCommodityDetail((prev) => ({ ...prev, [commodityId]: [] }));
      } finally {
        setDetailLoading(null);
      }
    }
  };

  // ─── Export DPR ───────────────────────────────────
  const handleExportDPR = async () => {
    if (!selectedSeasonId) return;
    setExporting(true);
    try {
      const res = await exportAPI.dpr(selectedSeasonId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DPR_Report_Season_${selectedSeasonId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export DPR');
    } finally {
      setExporting(false);
    }
  };

  const formatCr = (val: number) => {
    if (!val) return '0.00';
    return (val / 10000000).toFixed(2);
  };

  // ─── Render ───────────────────────────────────────
  if (loading && !summary) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  const commodities = summary?.commodities || summary?.data || [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            Daily Progress Report (DPR)
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={handleExportDPR} disabled={exporting || !selectedSeasonId}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export DPR
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Comprehensive procurement progress across all commodities
        </p>
      </div>

      {/* Season Selector */}
      <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commodity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">MSP (Rs./Qtl)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Funding Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Centres (Open/Prop)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Farmers</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty Procured (MTs)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Value (Cr)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Funds Released (Cr)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {Array.isArray(commodities) && commodities.length > 0 ? (
                commodities.map((c: any) => (
                  <React.Fragment key={c.commodity_id || c.id}>
                    {/* Commodity summary row */}
                    <tr className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleCommodity(c.commodity_id || c.id)}>
                      <td className="px-4 py-3">
                        {expandedCommodity === (c.commodity_id || c.id)
                          ? <ChevronDown className="w-4 h-4 text-gray-500" />
                          : <ChevronRight className="w-4 h-4 text-gray-500" />}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{c.commodity_name || c.name}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{num(c.msp_rate).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.funding_source || '--'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          c.status === 'active' || c.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {c.status || (c.is_active ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700">
                        {num(c.centres_opened).toLocaleString('en-IN')}/{num(c.centres_proposed).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{num(c.total_farmers).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{num(c.qty_procured_mts).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-blue-700">{formatCr(num(c.value_rs))}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-green-700">{formatCr(num(c.funds_released_rs))}</td>
                    </tr>

                    {/* Expanded district-wise breakdown */}
                    {expandedCommodity === (c.commodity_id || c.id) && (
                      <tr>
                        <td colSpan={10} className="px-0 py-0">
                          <div className="bg-blue-50/50 border-t border-b border-blue-100">
                            {detailLoading === (c.commodity_id || c.id) ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                <span className="ml-2 text-sm text-gray-500">Loading district data...</span>
                              </div>
                            ) : (
                              <table className="min-w-full">
                                <thead>
                                  <tr className="bg-blue-100/50">
                                    <th className="px-6 py-2 text-left text-xs font-semibold text-blue-700 uppercase">District</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 uppercase">Centres</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 uppercase">Farmers</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 uppercase">Qty (MTs)</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 uppercase">Value (Cr)</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 uppercase">Funds (Cr)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-100">
                                  {(commodityDetail[c.commodity_id || c.id] || []).length === 0 ? (
                                    <tr>
                                      <td colSpan={6} className="px-6 py-4 text-center text-gray-400 text-sm">
                                        No district-level data available
                                      </td>
                                    </tr>
                                  ) : (
                                    (commodityDetail[c.commodity_id || c.id] || []).map((d: any, i: number) => (
                                      <tr key={i} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-2 text-sm text-gray-700 font-medium">{d.district_name || d.name}</td>
                                        <td className="px-4 py-2 text-sm text-right text-gray-600">{num(d.centres_opened).toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-2 text-sm text-right text-gray-600">{num(d.farmers).toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-2 text-sm text-right text-gray-700 font-medium">{num(d.qty_mts).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-2 text-sm text-right text-blue-600">{formatCr(num(d.value_rs))}</td>
                                        <td className="px-4 py-2 text-sm text-right text-green-600">{formatCr(num(d.funds_released_rs))}</td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    No DPR data available for this season
                  </td>
                </tr>
              )}
            </tbody>

            {/* Totals footer */}
            {Array.isArray(commodities) && commodities.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">
                    {commodities.reduce((s: number, c: any) => s + num(c.centres_opened), 0).toLocaleString('en-IN')}/
                    {commodities.reduce((s: number, c: any) => s + num(c.centres_proposed), 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                    {commodities.reduce((s: number, c: any) => s + num(c.total_farmers), 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                    {commodities.reduce((s: number, c: any) => s + num(c.qty_procured_mts), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-blue-700">
                    {formatCr(commodities.reduce((s: number, c: any) => s + num(c.value_rs), 0))}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-green-700">
                    {formatCr(commodities.reduce((s: number, c: any) => s + num(c.funds_released_rs), 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default DPRReport;
