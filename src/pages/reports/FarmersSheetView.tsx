// ============================================
// pages/reports/FarmersSheetView.tsx — District Farmers Sheet (Read-Only)
// Consolidated farmers view
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { farmersAPI, drawdownsAPI, seasonsAPI, districtsAPI, exportAPI } from '../../api/services';
import type { DistrictFarmers, Season, District, DistrictDrawdown } from '../../types/markfed';
import { UserRole, calcCostOfProcuredQty, formatIndianCurrency, num, flattenDistrict, flattenPacs } from '../../types/markfed';

interface FarmersRow {
  district_id: number;
  district_name: string;
  pacs_count: number;
  pacs_entity_name: string;
  farmers_count: number;
  quantity_procured_qtl: number;
  cost_of_procured_qty_rs: number; // auto
  amount_received_from_ho: number; // auto
  payment_released_to_farmers_rs: number;
  balance_to_farmers: number; // auto
  balance_from_hod: number; // auto
  remarks: string;
}

export const FarmersSheetView: React.FC = () => {
  const { user } = useAuth();
  const [season, setSeason] = useState<Season | null>(null);
  const [rows, setRows] = useState<FarmersRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [seasonRes, distRes] = await Promise.all([seasonsAPI.active(), districtsAPI.list()]);
        const activeSeason = seasonRes.data;
        setSeason(activeSeason);

        const districtMap = new Map<number, string>();
        distRes.data.forEach((d: District) => districtMap.set(d.id, d.name));

        const [farmersRes, ddRes] = await Promise.allSettled([
          farmersAPI.listAll(activeSeason.id),
          drawdownsAPI.list(activeSeason.id),
        ]);

        const farmers: DistrictFarmers[] = farmersRes.status === 'fulfilled' ? farmersRes.value.data : [];
        const drawdowns: DistrictDrawdown[] = ddRes.status === 'fulfilled' ? ddRes.value.data : [];

        // Sum drawdowns by district
        const drawdownByDistrict = new Map<number, number>();
        drawdowns.forEach((dd: any) => {
          drawdownByDistrict.set(dd.district_id, (drawdownByDistrict.get(dd.district_id) || 0) + num(dd.amount_withdrawn_rs));
        });

        const farmersRows: FarmersRow[] = farmers.map((f: any) => {
          const qty = num(f.quantity_procured_qtl);
          const cost = calcCostOfProcuredQty(qty, num(activeSeason.msp_rate));
          const received = drawdownByDistrict.get(f.district_id) || 0;
          const released = num(f.payment_released_to_farmers_rs);
          return {
            district_id: f.district_id,
            district_name: flattenDistrict(f) || districtMap.get(f.district_id) || `District ${f.district_id}`,
            pacs_count: num(f.pacs_count),
            pacs_entity_name: flattenPacs(f),
            farmers_count: num(f.farmers_count),
            quantity_procured_qtl: qty,
            cost_of_procured_qty_rs: cost,
            amount_received_from_ho: received,
            payment_released_to_farmers_rs: released,
            balance_to_farmers: received - released,
            balance_from_hod: cost - received,
            remarks: f.remarks || '',
          };
        });

        setRows(farmersRows);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        pacs_count: acc.pacs_count + r.pacs_count,
        farmers_count: acc.farmers_count + r.farmers_count,
        quantity_procured_qtl: acc.quantity_procured_qtl + r.quantity_procured_qtl,
        cost_of_procured_qty_rs: acc.cost_of_procured_qty_rs + r.cost_of_procured_qty_rs,
        amount_received_from_ho: acc.amount_received_from_ho + r.amount_received_from_ho,
        payment_released_to_farmers_rs: acc.payment_released_to_farmers_rs + r.payment_released_to_farmers_rs,
        balance_to_farmers: acc.balance_to_farmers + r.balance_to_farmers,
        balance_from_hod: acc.balance_from_hod + r.balance_from_hod,
      }),
      {
        pacs_count: 0, farmers_count: 0, quantity_procured_qtl: 0,
        cost_of_procured_qty_rs: 0, amount_received_from_ho: 0,
        payment_released_to_farmers_rs: 0, balance_to_farmers: 0, balance_from_hod: 0,
      }
    );
  }, [rows]);

  const handleExportExcel = async () => {
    if (!season) return;
    try {
      const res = await exportAPI.excel(season.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Farmers_Sheet_${season.season_name}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Export failed'); }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileSpreadsheet className="w-7 h-7 text-green-600" />
            District Farmers Sheet Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Farmer procurement & payment tracking
            {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs whitespace-nowrap">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-3 py-2 text-left border-r">District</th>
              <th className="px-3 py-2 text-right border-r bg-green-50">PACS Count</th>
              <th className="px-3 py-2 text-left border-r bg-green-50">PACS Name</th>
              <th className="px-3 py-2 text-right border-r bg-green-50">Farmers</th>
              <th className="px-3 py-2 text-right border-r bg-green-50">Qty (Qtl)</th>
              <th className="px-3 py-2 text-right border-r bg-gray-200">Cost (Auto)</th>
              <th className="px-3 py-2 text-right border-r bg-gray-200">Received (Auto)</th>
              <th className="px-3 py-2 text-right border-r bg-green-50">Released</th>
              <th className="px-3 py-2 text-right border-r bg-gray-200">Bal Farmers (Auto)</th>
              <th className="px-3 py-2 text-right border-r bg-gray-200">Bal HOD (Auto)</th>
              <th className="px-3 py-2 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b hover:bg-gray-50 ${isMyDistrict(row.district_id) ? 'bg-yellow-50' : ''}`}
              >
                <td className="px-3 py-2 font-semibold border-r">{row.district_name}</td>
                <td className="px-3 py-2 text-right border-r">{row.pacs_count}</td>
                <td className="px-3 py-2 border-r max-w-[140px] truncate">{row.pacs_entity_name}</td>
                <td className="px-3 py-2 text-right border-r">{row.farmers_count.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2 text-right border-r">{row.quantity_procured_qtl.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</td>
                <td className="px-3 py-2 text-right border-r bg-gray-50">{numCell(row.cost_of_procured_qty_rs)}</td>
                <td className="px-3 py-2 text-right border-r bg-gray-50">{numCell(row.amount_received_from_ho)}</td>
                <td className="px-3 py-2 text-right border-r">{numCell(row.payment_released_to_farmers_rs)}</td>
                <td className={`px-3 py-2 text-right border-r bg-gray-50 ${row.balance_to_farmers < 0 ? 'text-red-600' : ''}`}>
                  {numCell(row.balance_to_farmers)}
                </td>
                <td className={`px-3 py-2 text-right border-r bg-gray-50 ${row.balance_from_hod > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {numCell(row.balance_from_hod)}
                </td>
                <td className="px-3 py-2 max-w-[120px] truncate">{row.remarks}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-400">
                  No farmers data available.
                </td>
              </tr>
            )}
            {rows.length > 0 && (
              <tr className="bg-green-50 font-bold border-t-2 border-green-300">
                <td className="px-3 py-2 border-r">TOTAL</td>
                <td className="px-3 py-2 text-right border-r">{totals.pacs_count}</td>
                <td className="px-3 py-2 border-r"></td>
                <td className="px-3 py-2 text-right border-r">{totals.farmers_count.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2 text-right border-r">{totals.quantity_procured_qtl.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</td>
                <td className="px-3 py-2 text-right border-r">{numCell(totals.cost_of_procured_qty_rs)}</td>
                <td className="px-3 py-2 text-right border-r">{numCell(totals.amount_received_from_ho)}</td>
                <td className="px-3 py-2 text-right border-r">{numCell(totals.payment_released_to_farmers_rs)}</td>
                <td className="px-3 py-2 text-right border-r">{numCell(totals.balance_to_farmers)}</td>
                <td className="px-3 py-2 text-right border-r">{numCell(totals.balance_from_hod)}</td>
                <td className="px-3 py-2"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
          DM fields
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded" />
          Auto-calculated
        </div>
        <span className="text-gray-400">MSP Rate: Rs. {num(season?.msp_rate)}/Qtl</span>
      </div>
    </div>
  );
};

export default FarmersSheetView;
