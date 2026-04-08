// ============================================
// pages/reports/MDSheetView.tsx — Consolidated MD Sheet (Read-Only)
// Drawdown cols + dynamic utilization heads
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  loanSanctionAPI, drawdownsAPI, utilizationAPI, utilizationHeadsAPI,
  seasonsAPI, districtsAPI, exportAPI,
} from '../../api/services';
import type { LoanSanction, DistrictDrawdown, DistrictUtilization, Season, District, UtilizationHead } from '../../types/markfed';
import { UserRole, calcTotalUtilization, formatIndianCurrency, num, flattenDistrict } from '../../types/markfed';

interface MDRow {
  district_id: number;
  district_name: string;
  amount_withdrawn_rs: number;
  withdrawn_date: string;
  transfer_date: string;
  utr_no: string;
  utilValues: Record<number, number>; // head_id -> amount
  total_amount_rs: number;
  remarks: string;
}

export const MDSheetView: React.FC = () => {
  const { user } = useAuth();
  const [season, setSeason] = useState<Season | null>(null);
  const [loan, setLoan] = useState<LoanSanction | null>(null);
  const [heads, setHeads] = useState<UtilizationHead[]>([]);
  const [rows, setRows] = useState<MDRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [seasonRes, distRes, headsRes] = await Promise.all([
          seasonsAPI.active(),
          districtsAPI.list(),
          utilizationHeadsAPI.list({ is_active: true }),
        ]);
        const activeSeason = seasonRes.data;
        setSeason(activeSeason);

        const activeHeads: UtilizationHead[] = Array.isArray(headsRes.data)
          ? headsRes.data.sort((a: UtilizationHead, b: UtilizationHead) => a.display_order - b.display_order)
          : (headsRes.data as any)?.data?.sort((a: UtilizationHead, b: UtilizationHead) => a.display_order - b.display_order) || [];
        setHeads(activeHeads);

        const districtMap = new Map<number, string>();
        distRes.data.forEach((d: District) => districtMap.set(d.id, d.name));

        const [loanRes, ddRes, utilRes] = await Promise.allSettled([
          loanSanctionAPI.list(activeSeason.id),
          drawdownsAPI.list(activeSeason.id),
          utilizationAPI.listAll(activeSeason.id),
        ]);

        if (loanRes.status === 'fulfilled') {
          const loanRows: LoanSanction[] = Array.isArray(loanRes.value.data)
            ? loanRes.value.data
            : (loanRes.value.data as any)?.data || [];
          if (loanRows.length > 0) {
            const totalSanctioned = loanRows.reduce((s, r) => s + num(r.total_sanctioned_cr), 0);
            const totalDrawn = loanRows.reduce((s, r) => s + num(r.total_drawn_cr), 0);
            setLoan({
              ...loanRows[0],
              total_sanctioned_cr: totalSanctioned,
              total_drawn_cr: totalDrawn,
            });
          }
        }

        const drawdowns: DistrictDrawdown[] = ddRes.status === 'fulfilled' ? ddRes.value.data : [];
        const utilizations: DistrictUtilization[] = utilRes.status === 'fulfilled'
          ? (Array.isArray(utilRes.value.data) ? utilRes.value.data : (utilRes.value.data as any)?.data || [])
          : [];

        // Build utilization map by district
        const utilMap = new Map<number, DistrictUtilization>();
        utilizations.forEach((u) => utilMap.set(u.district_id, u));

        const mdRows: MDRow[] = drawdowns.map((dd: any) => {
          const util = utilMap.get(dd.district_id);

          // Build values from dynamic entries or legacy fields
          const utilValues: Record<number, number> = {};
          const dynEntries = (util as any)?.dynamic_entries || util?.entries || [];
          if (dynEntries.length > 0) {
            dynEntries.forEach((e: any) => {
              utilValues[e.utilization_head_id] = num(e.amount_rs);
            });
          } else if (util) {
            // Legacy field mapping — match by head code to legacy field name
            activeHeads.forEach((h) => {
              const legacyKey = h.code + '_rs';
              const altKey = h.code.replace(/_payment$/, '_payment_rs')
                || h.code + '_rs';
              utilValues[h.id] = num((util as any)[legacyKey]) || num((util as any)[altKey]) || 0;
            });
          }

          const totalUtil = Object.values(utilValues).reduce((s, v) => s + v, 0);

          return {
            district_id: dd.district_id,
            district_name: flattenDistrict(dd) || districtMap.get(dd.district_id) || `District ${dd.district_id}`,
            amount_withdrawn_rs: num(dd.amount_withdrawn_rs),
            withdrawn_date: dd.withdrawn_date,
            transfer_date: dd.transfer_date,
            utr_no: dd.utr_no,
            utilValues,
            total_amount_rs: totalUtil,
            remarks: util?.remarks || '',
          };
        });

        setRows(mdRows);
      } catch {
        // Error loading
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totals = useMemo(() => {
    const headTotals: Record<number, number> = {};
    heads.forEach((h) => { headTotals[h.id] = 0; });
    let amountTotal = 0;
    let grandTotal = 0;

    rows.forEach((r) => {
      amountTotal += r.amount_withdrawn_rs;
      grandTotal += r.total_amount_rs;
      heads.forEach((h) => {
        headTotals[h.id] = (headTotals[h.id] || 0) + (r.utilValues[h.id] || 0);
      });
    });

    return { amountTotal, headTotals, grandTotal };
  }, [rows, heads]);

  const handleExportExcel = async () => {
    if (!season) return;
    try {
      const res = await exportAPI.excel(season.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `MD_Sheet_${season.season_name}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    }
  };

  const handleExportPDF = async () => {
    if (!season) return;
    try {
      const res = await exportAPI.pdf(season.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `MD_Sheet_${season.season_name}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    }
  };

  const isMyDistrict = (districtId: number) =>
    user?.role === UserRole.DM && user.district_id === districtId;

  const numCell = (val: number) => (
    <span className="font-mono text-xs">{formatIndianCurrency(val)}</span>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const utilColCount = heads.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileSpreadsheet className="w-7 h-7 text-blue-600" />
            MD Sheet Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Consolidated view — Drawdowns + {utilColCount} Utilization Heads
            {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Loan Header Info */}
      {loan && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">GO Ref:</span>
            <span className="ml-1 font-semibold">{loan.go_reference}</span>
          </div>
          <div>
            <span className="text-gray-500">Bank:</span>
            <span className="ml-1 font-semibold">{loan.bank?.name || loan.bank_name}</span>
          </div>
          <div>
            <span className="text-gray-500">Sanctioned:</span>
            <span className="ml-1 font-semibold">{loan.total_sanctioned_cr} Cr</span>
          </div>
          <div>
            <span className="text-gray-500">Drawn:</span>
            <span className="ml-1 font-semibold">{loan.total_drawn_cr} Cr</span>
          </div>
        </div>
      )}

      {/* Wide scrollable table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs whitespace-nowrap">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-2 py-1 border-r" rowSpan={2}>District</th>
              <th className="px-2 py-1 bg-blue-50 border-r text-blue-700" colSpan={4}>Drawdown / Transfer (AO-CAO)</th>
              <th className="px-2 py-1 bg-green-50 border-r text-green-700" colSpan={utilColCount}>Utilization (DM)</th>
              <th className="px-2 py-1 bg-gray-200 border-r" colSpan={1}>Auto</th>
              <th className="px-2 py-1" rowSpan={2}>Remarks</th>
            </tr>
            <tr className="bg-gray-50 border-b text-gray-600">
              <th className="px-2 py-1 bg-blue-50/50 border-r text-right">Amt Withdrawn</th>
              <th className="px-2 py-1 bg-blue-50/50 border-r">W. Date</th>
              <th className="px-2 py-1 bg-blue-50/50 border-r">T. Date</th>
              <th className="px-2 py-1 bg-blue-50/50 border-r">UTR</th>
              {heads.map((h) => (
                <th key={h.id} className="px-2 py-1 bg-green-50/50 border-r text-right" title={h.name}>
                  {h.name.length > 15 ? h.name.substring(0, 13) + '...' : h.name}
                </th>
              ))}
              <th className="px-2 py-1 bg-gray-100 border-r text-right font-bold">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b hover:bg-gray-50 ${isMyDistrict(row.district_id) ? 'bg-yellow-50' : ''}`}>
                <td className="px-2 py-2 font-semibold border-r">{row.district_name}</td>
                <td className="px-2 py-2 text-right bg-blue-50/30 border-r">{numCell(row.amount_withdrawn_rs)}</td>
                <td className="px-2 py-2 bg-blue-50/30 border-r">{row.withdrawn_date}</td>
                <td className="px-2 py-2 bg-blue-50/30 border-r">{row.transfer_date}</td>
                <td className="px-2 py-2 bg-blue-50/30 border-r font-mono">{row.utr_no}</td>
                {heads.map((h) => (
                  <td key={h.id} className="px-2 py-2 text-right bg-green-50/30 border-r">
                    {numCell(row.utilValues[h.id] || 0)}
                  </td>
                ))}
                <td className="px-2 py-2 text-right bg-gray-100 border-r font-bold">{numCell(row.total_amount_rs)}</td>
                <td className="px-2 py-2 max-w-[120px] truncate">{row.remarks}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6 + utilColCount + 2} className="px-4 py-8 text-center text-gray-400">
                  No data available for this season.
                </td>
              </tr>
            )}
            {rows.length > 0 && (
              <tr className="bg-blue-50 font-bold border-t-2 border-blue-300">
                <td className="px-2 py-2 border-r">TOTAL</td>
                <td className="px-2 py-2 text-right border-r">{numCell(totals.amountTotal)}</td>
                <td className="px-2 py-2 border-r" colSpan={3}></td>
                {heads.map((h) => (
                  <td key={h.id} className="px-2 py-2 text-right border-r">{numCell(totals.headTotals[h.id] || 0)}</td>
                ))}
                <td className="px-2 py-2 text-right border-r bg-gray-100">{numCell(totals.grandTotal)}</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded" />
          AO/CAO fields
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
          DM fields
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded" />
          Auto-calculated
        </div>
        {user?.role === UserRole.DM && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded" />
            Your district
          </div>
        )}
      </div>
    </div>
  );
};

export default MDSheetView;
