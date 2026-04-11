// ============================================
// pages/admin/ContractorsManagement.tsx — SUPER_ADMIN only
// ============================================
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, CheckCircle, AlertCircle, HardHat } from 'lucide-react';
import { htContractorsAPI } from '../../api/services';

interface Contractor {
  id: number;
  firm_name: string;
  contractor_name: string;
  registration_type: string;
  pan_number: string;
  gst_number: string;
  contact_phone: string;
  is_active: boolean;
}

export const ContractorsManagement: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    firm_name: '',
    contractor_name: '',
    registration_type: '',
    pan_number: '',
    gst_number: '',
    contact_phone: '',
    is_active: true,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await htContractorsAPI.list();
        setContractors(Array.isArray(data) ? data : (data as any)?.data || []);
      } catch { setMessage({ type: 'error', text: 'Failed to load contractors' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ firm_name: '', contractor_name: '', registration_type: '', pan_number: '', gst_number: '', contact_phone: '', is_active: true });
    setShowModal(true);
  };

  const openEdit = (c: Contractor) => {
    setEditingId(c.id);
    setForm({
      firm_name: c.firm_name || '',
      contractor_name: c.contractor_name || '',
      registration_type: c.registration_type || '',
      pan_number: c.pan_number || '',
      gst_number: c.gst_number || '',
      contact_phone: c.contact_phone || '',
      is_active: c.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.firm_name.trim()) { setMessage({ type: 'error', text: 'Firm name is required' }); return; }
    if (!form.contractor_name.trim()) { setMessage({ type: 'error', text: 'Contractor name is required' }); return; }
    try {
      if (editingId) {
        const { data } = await htContractorsAPI.update(editingId, form);
        setContractors(contractors.map((c) => (c.id === editingId ? data : c)));
      } else {
        const { data } = await htContractorsAPI.create(form);
        setContractors([...contractors, data]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: editingId ? 'Contractor updated' : 'Contractor created' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) { setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save' }); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><HardHat className="w-7 h-7 text-blue-600" />H&T Contractors Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage handling and transport contractor firms</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30"><Plus className="w-4 h-4" />Add Contractor</button>
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
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Firm Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Contractor Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Registration Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">PAN</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">GST</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Active</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">Actions</th>
            </tr></thead>
            <tbody>
              {contractors.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.firm_name}</td>
                  <td className="px-4 py-3">{c.contractor_name}</td>
                  <td className="px-4 py-3">{c.registration_type || '-'}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{c.pan_number || '-'}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{c.gst_number || '-'}</td>
                  <td className="px-4 py-3">{c.contact_phone || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.is_active ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {contractors.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No contractors found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Contractor' : 'Add Contractor'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name</label>
                  <input type="text" value={form.firm_name} onChange={(e) => setForm({ ...form, firm_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. ABC Transport Pvt. Ltd." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contractor Name</label>
                  <input type="text" value={form.contractor_name} onChange={(e) => setForm({ ...form, contractor_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. Ramesh Kumar" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type</label>
                  <input type="text" value={form.registration_type} onChange={(e) => setForm({ ...form, registration_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. Proprietorship / Partnership / LLP" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                    <input type="text" value={form.pan_number} onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. ABCDE1234F" maxLength={10} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input type="text" value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. 36ABCDE1234F1Z5" maxLength={15} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. 9876543210" maxLength={15} />
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

export default ContractorsManagement;
