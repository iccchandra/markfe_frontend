// ============================================
// pages/gunny-bags/CreatePOForm.tsx
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Save, X, Calculator, AlertCircle, CheckCircle, Plus, Trash2
} from 'lucide-react';

interface POItem {
  bagType: string;
  specification: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface POFormData {
  poDate: string;
  vendorId: string;
  vendorName: string;
  vendorGST: string;
  vendorPhone: string;
  vendorEmail: string;
  deliveryLocation: string;
  deliveryDate: string;
  paymentTerms: string;
  advancePercent: string;
  gstRate: string;
  qualitySpecs: string;
  packingSpecs: string;
  penaltyClause: string;
  remarks: string;
}

export const CreatePOForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<POFormData>({
    poDate: new Date().toISOString().split('T')[0],
    vendorId: '',
    vendorName: '',
    vendorGST: '',
    vendorPhone: '',
    vendorEmail: '',
    deliveryLocation: '',
    deliveryDate: '',
    paymentTerms: 'Net 30',
    advancePercent: '20',
    gstRate: '18',
    qualitySpecs: 'As per BIS standards',
    packingSpecs: 'In bundles of 100',
    penaltyClause: '@0.5% per day for delay',
    remarks: ''
  });

  const [items, setItems] = useState<POItem[]>([
    { bagType: '', specification: '', quantity: 0, rate: 0, amount: 0 }
  ]);

  const bagTypes = [
    { type: 'Jute Bags', specs: ['50 KG 400 GSM', '100 KG 450 GSM'] },
    { type: 'HDPE Bags', specs: ['50 KG White', '50 KG Colored', '25 KG White'] },
    { type: 'PP Bags', specs: ['25 KG Woven', '50 KG Laminated', '50 KG Plain'] },
    { type: 'Cotton Bags', specs: ['100 KG Natural', '50 KG Bleached'] }
  ];

  const vendors = [
    { id: 'V001', name: 'M/s Jute Products Ltd', gst: '36ABCDE1234F1Z5', phone: '9876543210' },
    { id: 'V002', name: 'M/s Polymer Bags Inc', gst: '36FGHIJ5678K1Z5', phone: '9876543211' },
    { id: 'V003', name: 'M/s Cotton Bags Co', gst: '36KLMNO9012P1Z5', phone: '9876543212' }
  ];

  const paymentTermsOptions = ['Immediate', 'Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-fill vendor details
    if (name === 'vendorName') {
      const vendor = vendors.find(v => v.name === value);
      if (vendor) {
        setFormData(prev => ({
          ...prev,
          vendorId: vendor.id,
          vendorGST: vendor.gst,
          vendorPhone: vendor.phone
        }));
      }
    }
  };

  const handleItemChange = (index: number, field: keyof POItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { bagType: '', specification: '', quantity: 0, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculations = {
    subtotal: items.reduce((sum, item) => sum + item.amount, 0),
    get gst() {
      return (this.subtotal * parseFloat(formData.gstRate || '0')) / 100;
    },
    get total() {
      return this.subtotal + this.gst;
    },
    get advance() {
      return (this.total * parseFloat(formData.advancePercent || '0')) / 100;
    },
    get balance() {
      return this.total - this.advance;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorName) newErrors.vendorName = 'Vendor is required';
    if (!formData.deliveryLocation) newErrors.deliveryLocation = 'Delivery location is required';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';
    
    if (items.every(item => !item.bagType)) {
      newErrors.items = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('PO Created:', { ...formData, items, calculations });
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/gunny-bags/procurement');
      }, 2000);
    } catch (error) {
      console.error('Error creating PO:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Purchase Order Created!</p>
              <p className="text-sm text-green-700">PO Number: PO/2026/GB/{Math.floor(Math.random() * 1000)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-7 h-7 text-blue-600" />
          Create Purchase Order - Gunny Bags
        </h1>
        <p className="text-gray-500 mt-1">Generate a new procurement order for gunny bags</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PO Basic Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Purchase Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="poDate"
                value={formData.poDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {paymentTermsOptions.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advance Payment (%)
              </label>
              <input
                type="number"
                name="advancePercent"
                value={formData.advancePercent}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Vendor Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Vendor Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <select
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.vendorName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Select Vendor</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>
              {errors.vendorName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.vendorName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <input
                type="text"
                name="vendorGST"
                value={formData.vendorGST}
                onChange={handleChange}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                name="vendorPhone"
                value={formData.vendorPhone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="vendorEmail"
                value={formData.vendorEmail}
                onChange={handleChange}
                placeholder="vendor@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {errors.items && (
            <p className="mb-4 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.items}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bag Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Specification</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rate (₹/bag)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount (₹)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <select
                        value={item.bagType}
                        onChange={(e) => handleItemChange(index, 'bagType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Select Type</option>
                        {bagTypes.map(bt => (
                          <option key={bt.type} value={bt.type}>{bt.type}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.specification}
                        onChange={(e) => handleItemChange(index, 'specification', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={!item.bagType}
                      >
                        <option value="">Select Spec</option>
                        {item.bagType && bagTypes.find(bt => bt.type === item.bagType)?.specs.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.rate || ''}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-gray-900">
                        {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Subtotal</div>
              <div className="text-xl font-bold text-gray-900">
                ₹{calculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">GST @ {formData.gstRate}%</div>
              <div className="text-xl font-bold text-green-600">
                +₹{calculations.gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-blue-600">
                ₹{calculations.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Advance ({formData.advancePercent}%)</div>
              <div className="text-xl font-bold text-purple-600">
                ₹{calculations.advance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Balance on Delivery</div>
              <div className="text-xl font-bold text-orange-600">
                ₹{calculations.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & Terms */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery & Terms</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={handleChange}
                placeholder="Godown address"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.deliveryLocation ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.deliveryDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Specifications
              </label>
              <input
                type="text"
                name="qualitySpecs"
                value={formData.qualitySpecs}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packing Specifications
              </label>
              <input
                type="text"
                name="packingSpecs"
                value={formData.packingSpecs}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penalty Clause
              </label>
              <input
                type="text"
                name="penaltyClause"
                value={formData.penaltyClause}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Terms & Conditions
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Enter any special terms, conditions, or remarks..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/gunny-bags/procurement')}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating PO...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Purchase Order
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePOForm;