// ============================================
// pages/reports/FarmersSheetView.tsx — District Farmers Sheet (Read-Only)
// Per-PACS entity rows, grouped by district with sub-totals
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { farmersAPI, drawdownsAPI, seasonsAPI, districtsAPI, exportAPI } from '../../api/services';
import type { DistrictFarmers, Season, District, DistrictDrawdown } from '../../types/markfed';
import { UserRole, calcCostOfProcuredQty, formatAmount, num, flattenDistrict, flattenPacs, flattenPacsType } from '../../types/markfed';

interface PacsRow {
  id: number;
  district_id: number;
  district_name: string;
  pacs_name: string;
  pacs_type: string;
  farmers_count: number;
  quantity_procured_qtl: number;
  cost_rs: number;
  received_rs: number;
  released_rs: number;
  balance_farmers_rs: number;
  balance_hod_rs: number;
  remarks: string;
}

interface DistrictGroup {
  district_id: number;
  district_name: string;
  rows: PacsRow[];
  subtotal: {
    farmers_count: number;
    quantity_procured_qtl: number;
    cost_rs: number;
    received_rs: number;
    released_rs: number;
    balance_farmers_rs: number;
    balance_hod_rs: number;
  };
}

export const FarmersSheetView: React.FC = () => {
  const { user } = useAuth();
  const [season, setSeason] = useState<Season | null>(null);
  const [groups, setGroups] = useState<DistrictGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [seasonRes, distRes] = await Promise.all([seasonsAPI.active(), districtsAPI.list()]);
        const activeSeason = seasonRes.data;
        setSeason(activeSeason);
        const mspRate = num(activeSeason.msp_rate);

        const districtMap = new Map<number, string>();
        distRes.data.forEach((d: District) => districtMap.set(d.id, d.name));

        const [farmersRes, ddRes] = await Promise.allSettled([
          farmersAPI.listAll(activeSeason.id),
          drawdownsAPI.list(activeSeason.id),
        ]);

        const farmersRaw = farmersRes.status === 'fulfilled' ? farmersRes.value.data : [];
        const farmers: DistrictFarmers[] = Array.isArray(farmersRaw) ? farmersRaw : (farmersRaw as any)?.data || [];
        const ddRaw = ddRes.status === 'fulfilled' ? ddRes.value.data : [];
        const drawdowns: DistrictDrawdown[] = Array.isArray(ddRaw) ? ddRaw : (ddRaw as any)?.data || [];

        const drawdownByDistrict = new Map<number, number>();
        drawdowns.forEach((dd: any) => {
          drawdownByDistrict.set(dd.district_id, (drawdownByDistrict.get(dd.district_id) || 0) + num(dd.amount_withdrawn_rs));
        });

        // Build per-PACS rows grouped by district
        const districtGroupMap = new Map<number, DistrictGroup>();

        farmers.forEach((f: any) => {
          const did = f.district_id;
          const dName = flattenDistrict(f) || districtMap.get(did) || `District ${did}`;
          const qty = num(f.quantity_procured_qtl);
          const cost = calcCostOfProcuredQty(qty, mspRate);
          const received = drawdownByDistrict.get(did) || 0;
          const released = num(f.payment_released_to_farmers_rs);

          const row: PacsRow = {
            id: f.id,
            district_id: did,
            district_name: dName,
            pacs_name: flattenPacs(f) || '-',
            pacs_type: flattenPacsType(f) || '-',
            farmers_count: num(f.farmers_count),
            quantity_procured_qtl: qty,
            cost_rs: cost,
            received_rs: received,
            released_rs: released,
            balance_farmers_rs: received - released,
            balance_hod_rs: cost - received,
            remarks: f.remarks || '',
          };

          if (!districtGroupMap.has(did)) {
            districtGroupMap.set(did, {
              district_id: did,
              district_name: dName,
              rows: [],
              subtotal: { farmers_count: 0, quantity_procured_qtl: 0, cost_rs: 0, received_rs: 0, released_rs: 0, balance_farmers_rs: 0, balance_hod_rs: 0 },
            });
          }
          const group = districtGroupMap.get(did)!;
          group.rows.push(row);
          group.subtotal.farmers_count += row.farmers_count;
          group.subtotal.quantity_procured_qtl += row.quantity_procured_qtl;
          group.subtotal.cost_rs += row.cost_rs;
          group.subtotal.released_rs += row.released_rs;
          group.subtotal.balance_farmers_rs += row.balance_farmers_rs;
          group.subtotal.balance_hod_rs += row.balance_hod_rs;
          // received is same for all rows in a district (total drawdowns)
          group.subtotal.received_rs = received;
        });

        let groupList = Array.from(districtGroupMap.values()).sort((a, b) => a.district_name.localeCompare(b.district_name));

        // DM sees only their district
        if (user?.role === UserRole.DM && user.district_id) {
          groupList = groupList.filter(g => g.district_id === user.district_id);
        }
        setGroups(groupList);
      } catch { /* error */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const grandTotal = useMemo(() => {
    return groups.reduce((acc, g) => ({
      pacs_count: acc.pacs_count + g.rows.length,
      farmers_count: acc.farmers_count + g.subtotal.farmers_count,
      quantity_procured_qtl: acc.quantity_procured_qtl + g.subtotal.quantity_procured_qtl,
      cost_rs: acc.cost_rs + g.subtotal.cost_rs,
      received_rs: acc.received_rs + g.subtotal.received_rs,
      released_rs: acc.released_rs + g.subtotal.released_rs,
      balance_farmers_rs: acc.balance_farmers_rs + g.subtotal.balance_farmers_rs,
      balance_hod_rs: acc.balance_hod_rs + g.subtotal.balance_hod_rs,
    }), { pacs_count: 0, farmers_count: 0, quantity_procured_qtl: 0, cost_rs: 0, received_rs: 0, released_rs: 0, balance_farmers_rs: 0, balance_hod_rs: 0 });
  }, [groups]);

  const handleExportExcel = async () => {
    if (!season) return;
    try {
      const dmDistrictId = user?.role === UserRole.DM ? user.district_id : undefined;
      const res = await exportAPI.excel(season.id, dmDistrictId || undefined);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Farmers_Sheet_${season.season_name}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Export failed'); }
  };

  const numCell = (val: number) => <span className="font-mono text-xs">{formatAmount(val)}</span>;
  const balHod = (val: number) => (
    <span className={val > 0 ? 'text-red-600' : 'text-green-600'}>
      {numCell(Math.abs(val))} {val > 0 ? '(Due)' : val < 0 ? '(Surplus)' : ''}
    </span>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
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
            Per PACS/DCMS/FPO entity — grouped by district
            {season && <span className="text-blue-600 font-medium"> | {season.season_name}</span>}
          </p>
        </div>
        <button onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg">
          <Download className="w-4 h-4" /> Export Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs whitespace-nowrap">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-3 py-2 text-left border-r">District</th>
              <th className="px-3 py-2 text-left border-r bg-green-50">PACS/DCMS/FPO</th>
              <th className="px-3 py-2 text-center border-r bg-green-50">Type</th>
              <th className="px-3 py-2 text-right border-r bg-green-50">Farmers</th>
              <th className="px-3 py-2 text-right border-r bg-green-50">Qty (Qtl)</th>
              <th className="px-3 py-2 text-right border-r bg-gray-200">Cost (Auto)</th>
              <th className="px-3 py-2 text-right border-r bg-gray-200">Received (Auto)</th>
              <th className="px-3 py-2 text-right border-r bg-green-50">Released</th>
              <th className="px-3 py-2 text-right border-r bg-gray-200">Bal Farmers</th>
              <th className="px-3 py-2 text-right border-r bg-gray-200">Bal HOD</th>
              <th className="px-3 py-2 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">No farmers data available.</td></tr>
            )}
            {groups.map((group, groupIdx) => {
              const groupBg = groupIdx % 2 === 0 ? 'bg-white' : 'bg-blue-50/30';
              return (
              <React.Fragment key={group.district_id}>
                {/* Per-PACS rows */}
                {group.rows.map((row, i) => (
                  <tr key={row.id} className={`border-b hover:bg-gray-100 ${groupBg}`}>
                    <td className="px-3 py-2 font-semibold border-r">
                      {i === 0 ? row.district_name : ''}
                    </td>
                    <td className="px-3 py-2 border-r">{row.pacs_name}</td>
                    <td className="px-3 py-2 text-center border-r">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {row.pacs_type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right border-r">{row.farmers_count.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-right border-r">{row.quantity_procured_qtl.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</td>
                    <td className="px-3 py-2 text-right border-r bg-gray-50">{numCell(row.cost_rs)}</td>
                    <td className="px-3 py-2 text-right border-r bg-gray-50">{i === 0 ? numCell(row.received_rs) : ''}</td>
                    <td className="px-3 py-2 text-right border-r">{numCell(row.released_rs)}</td>
                    <td className="px-3 py-2 text-right border-r bg-gray-50">{i === 0 ? numCell(row.balance_farmers_rs) : ''}</td>
                    <td className="px-3 py-2 text-right border-r bg-gray-50">{i === 0 ? balHod(row.balance_hod_rs) : ''}</td>
                    <td className="px-3 py-2 max-w-[120px] truncate">{row.remarks}</td>
                  </tr>
                ))}
                {/* District sub-total (only if more than 1 entity) */}
                {group.rows.length > 1 && (
                  <tr className={`font-semibold border-b ${groupIdx % 2 === 0 ? 'bg-green-50/50' : 'bg-blue-50/60'}`}>
                    <td className="px-3 py-1.5 border-r text-right text-[10px] text-gray-500" colSpan={3}>
                      Sub Total — {group.district_name} ({group.rows.length} entities)
                    </td>
                    <td className="px-3 py-1.5 text-right border-r">{group.subtotal.farmers_count.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-1.5 text-right border-r">{group.subtotal.quantity_procured_qtl.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</td>
                    <td className="px-3 py-1.5 text-right border-r">{numCell(group.subtotal.cost_rs)}</td>
                    <td className="px-3 py-1.5 text-right border-r">{numCell(group.subtotal.received_rs)}</td>
                    <td className="px-3 py-1.5 text-right border-r">{numCell(group.subtotal.released_rs)}</td>
                    <td className="px-3 py-1.5 text-right border-r">{numCell(group.subtotal.balance_farmers_rs)}</td>
                    <td className="px-3 py-1.5 text-right border-r">{balHod(group.subtotal.balance_hod_rs)}</td>
                    <td className="px-3 py-1.5"></td>
                  </tr>
                )}
              </React.Fragment>
            );
            })}
            {/* Grand Total */}
            {groups.length > 0 && (
              <tr className="bg-green-100 font-bold border-t-2 border-green-400">
                <td className="px-3 py-2 border-r" colSpan={3}>GRAND TOTAL ({grandTotal.pacs_count} entities)</td>
                <td className="px-3 py-2 text-right border-r">{grandTotal.farmers_count.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2 text-right border-r">{grandTotal.quantity_procured_qtl.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</td>
                <td className="px-3 py-2 text-right border-r">{numCell(grandTotal.cost_rs)}</td>
                <td className="px-3 py-2 text-right border-r">{numCell(grandTotal.received_rs)}</td>
                <td className="px-3 py-2 text-right border-r">{numCell(grandTotal.released_rs)}</td>
                <td className="px-3 py-2 text-right border-r">{numCell(grandTotal.balance_farmers_rs)}</td>
                <td className="px-3 py-2 text-right border-r">{balHod(grandTotal.balance_hod_rs)}</td>
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
