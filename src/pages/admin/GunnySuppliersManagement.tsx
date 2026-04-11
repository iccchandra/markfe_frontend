// ============================================
// pages/admin/GunnySuppliersManagement.tsx — SUPER_ADMIN only
// ============================================
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { gunnySuppliersAPI, districtsAPI } from '../../api/services';

interface District {
  id: number;
  name: string;
}

interface GunnySupplier {
  id: number;
  supplier_name: string;
  tender_id: string;
  district_id: number;
  district_name?: string;
  district?: { name: string };
  emd_amount: number;
  emd_utr: string;
  security_deposit: number;
  security_deposit_utr: string;
  is_active: boolean;
}

export const GunnySuppliersManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<GunnySupplier[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    supplier_name: '',
    tender_id: '',
    district_id: 0,
    emd_amount: 0,
    emd_utr: '',
    security_deposit: 0,
    security_deposit_utr: '',
    is_active: true,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [suppliersRes, districtsRes] = await Promise.all([
          gunnySuppliersAPI.list(),
          districtsAPI.list(),
        ]);
        setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : (suppliersRes.data as any)?.data || []);
        setDistricts(Array.isArray(districtsRes.data) ? districtsRes.data : (districtsRes.data as any)?.data || []);
      } catch { setMessage({ type: 'error', text: 'Failed to load data' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const getDistrictName = (s: GunnySupplier) => {
    if (s.district_name) return s.district_name;
    if (s.district?.name) return s.district.name;
    const found = districts.find((d) => d.id === s.district_id);
    return found?.name || '-';
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ supplier_name: '', tender_id: '', district_id: 0, emd_amount: 0, emd_utr: '', security_deposit: 0, security_deposit_utr: '', is_active: true });
    setShowModal(true);
  };

  const openEdit = (s: GunnySupplier) => {
    setEditingId(s.id);
    setForm({
      supplier_name: s.supplier_name || '',
      tender_id: s.tender_id || '',
      district_id: s.district_id || 0,
      emd_amount: s.emd_amount || 0,
      emd_utr: s.emd_utr || '',
      security_deposit: s.security_deposit || 0,
      security_deposit_utr: s.security_deposit_utr || '',
      is_active: s.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.supplier_name.trim()) { setMessage({ type: 'error', text: 'Supplier name is required' }); return; }
    try {
      const payload = { ...form, district_id: form.district_id || undefined };
      if (editingId) {
        const { data } = await gunnySuppliersAPI.update(editingId, payload);
        setSuppliers(suppliers.map((s) => (s.id === editingId ? data : s)));
      } else {
        const { data } = await gunnySuppliersAPI.create(payload);
        setSuppliers([...suppliers, data]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: editingId ? 'Supplier updated' : 'Supplier created' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save' }); }
  };

  const formatCurrency = (val: number) => {
    if (!val) return '-';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Package className="w-7 h-7 text-blue-600" />Gunny Suppliers Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage gunny bag supplier master data</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30"><Plus className="w-4 h-4" />Add Supplier</button>
      </div>

      {message && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Supplier Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Tender ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">District</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">EMD Amount</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Security Deposit</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Active</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">Actions</th>
            </tr></thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.supplier_name}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{s.tender_id || '-'}</td>
                  <td className="px-4 py-3">{getDistrictName(s)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(s.emd_amount)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(s.security_deposit)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.is_active ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No suppliers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                  <input type="text" value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. XYZ Jute Industries" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tender ID</label>
                    <input type="text" value={form.tender_id} onChange={(e) => setForm({ ...form, tender_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. MKFD/GUNNY/2025-01" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <select value={form.district_id} onChange={(e) => setForm({ ...form, district_id: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                      <option value={0}>-- Select --</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">EMD Amount</label>
                    <input type="number" value={form.emd_amount || ''} onChange={(e) => setForm({ ...form, emd_amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">EMD UTR</label>
                    <input type="text" value={form.emd_utr} onChange={(e) => setForm({ ...form, emd_utr: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="UTR reference" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                    <input type="number" value={form.security_deposit || ''} onChange={(e) => setForm({ ...form, security_deposit: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit UTR</label>
                    <input type="text" value={form.security_deposit_utr} onChange={(e) => setForm({ ...form, security_deposit_utr: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="UTR reference" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700">Active</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GunnySuppliersManagement;
