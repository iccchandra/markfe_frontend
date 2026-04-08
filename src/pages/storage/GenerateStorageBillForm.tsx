// ============================================
// pages/storage/GenerateStorageBillForm.tsx
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Warehouse, Save, X, Calculator, AlertCircle, CheckCircle, Calendar
} from 'lucide-react';

interface StorageBillFormData {
  billDate: string;
  billMonth: string;
  billYear: string;
  godownId: string;
  godownName: string;
  godownLocation: string;
  commodity: string;
  numberOfBags: string;
  numberOfDays: string;
  ratePerBagPerMonth: string;
  grossAmount: string;
  discountPercent: string;
  discountAmount: string;
  cgstPercent: string;
  sgstPercent: string;
  cgstAmount: string;
  sgstAmount: string;
  totalGST: string;
  netAmount: string;
  previousBalance: string;
  totalPayable: string;
  paymentStatus: string;
  remarks: string;
}

export const GenerateStorageBillForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<StorageBillFormData>({
    billDate: new Date().toISOString().split('T')[0],
    billMonth: 'January',
    billYear: '2026',
    godownId: '',
    godownName: '',
    godownLocation: '',
    commodity: '',
    numberOfBags: '',
    numberOfDays: '',
    ratePerBagPerMonth: '6.94',
    grossAmount: '0',
    discountPercent: '10',
    discountAmount: '0',
    cgstPercent: '9',
    sgstPercent: '9',
    cgstAmount: '0',
    sgstAmount: '0',
    totalGST: '0',
    netAmount: '0',
    previousBalance: '0',
    totalPayable: '0',
    paymentStatus: 'Pending',
    remarks: ''
  });

  const godowns = [
    { id: 'GD001', name: 'CWC DUBBA', location: 'Nizamabad' },
    { id: 'GD002', name: 'TGSWC NACHUPALLY', location: 'Adilabad' },
    { id: 'GD003', name: 'PACS Sangareddy', location: 'Sangareddy' },
    { id: 'GD004', name: 'DCMS Medak', location: 'Medak' }
  ];

  const commodities = ['JOWAR', 'Paddy', 'Sunflower', 'Maize', 'Cotton', 'Wheat', 'Rice'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2024', '2025', '2026'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-fill godown details
    if (name === 'godownName') {
      const godown = godowns.find(g => g.name === value);
      if (godown) {
        setFormData(prev => ({
          ...prev,
          godownId: godown.id,
          godownLocation: godown.location
        }));
      }
    }

    // Trigger calculation
    if (['numberOfBags', 'numberOfDays', 'ratePerBagPerMonth', 'discountPercent', 'cgstPercent', 'sgstPercent', 'previousBalance'].includes(name)) {
      setTimeout(() => calculateAmounts({ ...formData, [name]: value }), 100);
    }
  };

  const calculateAmounts = (data: typeof formData) => {
    const bags = parseFloat(data.numberOfBags) || 0;
    const days = parseFloat(data.numberOfDays) || 0;
    const rate = parseFloat(data.ratePerBagPerMonth) || 0;
    const discountPct = parseFloat(data.discountPercent) || 0;
    const cgstPct = parseFloat(data.cgstPercent) || 0;
    const sgstPct = parseFloat(data.sgstPercent) || 0;
    const prevBalance = parseFloat(data.previousBalance) || 0;

    // Calculate gross amount (bags × rate × days / 30)
    const grossAmount = (bags * rate * days) / 30;
    
    // Calculate discount
    const discountAmount = (grossAmount * discountPct) / 100;
    const amountAfterDiscount = grossAmount - discountAmount;
    
    // Calculate GST
    const cgstAmount = (amountAfterDiscount * cgstPct) / 100;
    const sgstAmount = (amountAfterDiscount * sgstPct) / 100;
    const totalGST = cgstAmount + sgstAmount;
    
    // Calculate net amount
    const netAmount = amountAfterDiscount + totalGST;
    
    // Calculate total payable
    const totalPayable = netAmount + prevBalance;

    setFormData(prev => ({
      ...prev,
      grossAmount: grossAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      cgstAmount: cgstAmount.toFixed(2),
      sgstAmount: sgstAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      netAmount: netAmount.toFixed(2),
      totalPayable: totalPayable.toFixed(2)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.godownName) newErrors.godownName = 'Godown is required';
    if (!formData.commodity) newErrors.commodity = 'Commodity is required';
    if (!formData.numberOfBags) newErrors.numberOfBags = 'Number of bags is required';
    if (!formData.numberOfDays) newErrors.numberOfDays = 'Number of days is required';

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
      
      const billNo = `${formData.billYear.slice(2)}${(months.indexOf(formData.billMonth) + 1).toString().padStart(2, '0')}KNR${Math.floor(Math.random() * 900000 + 100000)}`;
      
      console.log('Storage Bill Generated:', { ...formData, billNo });
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/storage/billing');
      }, 2000);
    } catch (error) {
      console.error('Error generating bill:', error);
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
              <p className="font-semibold text-green-900">Storage Bill Generated!</p>
              <p className="text-sm text-green-700">Bill created successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Warehouse className="w-7 h-7 text-blue-600" />
          Generate Storage Bill
        </h1>
        <p className="text-gray-500 mt-1">Create monthly storage billing for godowns</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bill Period */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Billing Period</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Month <span className="text-red-500">*</span>
              </label>
              <select
                name="billMonth"
                value={formData.billMonth}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Year <span className="text-red-500">*</span>
              </label>
              <select
                name="billYear"
                value={formData.billYear}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="billDate"
                value={formData.billDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Godown & Commodity Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Godown & Commodity Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Godown Name <span className="text-red-500">*</span>
              </label>
              <select
                name="godownName"
                value={formData.godownName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.godownName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Select Godown</option>
                {godowns.map(g => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
              {errors.godownName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.godownName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="godownLocation"
                value={formData.godownLocation}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commodity <span className="text-red-500">*</span>
              </label>
              <select
                name="commodity"
                value={formData.commodity}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.commodity ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Select Commodity</option>
                {commodities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.commodity && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.commodity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Godown ID
              </label>
              <input
                type="text"
                name="godownId"
                value={formData.godownId}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Storage Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Storage Calculation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Bags <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="numberOfBags"
                value={formData.numberOfBags}
                onChange={handleChange}
                placeholder="206249"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.numberOfBags ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.numberOfBags && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.numberOfBags}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Days <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="numberOfDays"
                value={formData.numberOfDays}
                onChange={handleChange}
                placeholder="25"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.numberOfDays ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.numberOfDays && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.numberOfDays}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate per Bag/Month (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="ratePerBagPerMonth"
                value={formData.ratePerBagPerMonth}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="discountPercent"
                value={formData.discountPercent}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CGST (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="cgstPercent"
                value={formData.cgstPercent}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SGST (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="sgstPercent"
                value={formData.sgstPercent}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Bill Calculation</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Gross Amount</div>
              <div className="text-xl font-bold text-gray-900">
                ₹{parseFloat(formData.grossAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Discount @ {formData.discountPercent}%</div>
              <div className="text-xl font-bold text-green-600">
                -₹{parseFloat(formData.discountAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">GST @ 18%</div>
              <div className="text-sm text-gray-600 mb-1">
                CGST: ₹{parseFloat(formData.cgstAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-600">
                SGST: ₹{parseFloat(formData.sgstAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Net Amount</div>
              <div className="text-2xl font-bold text-blue-600">
                ₹{parseFloat(formData.netAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-2">Previous Balance</div>
              <input
                type="number"
                step="0.01"
                name="previousBalance"
                value={formData.previousBalance}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Total Payable</div>
              <div className="text-3xl font-bold text-purple-600">
                ₹{parseFloat(formData.totalPayable || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status & Remarks */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Payment & Notes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks / Notes
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Enter any additional notes or remarks..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/storage/billing')}
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
                Generating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Generate Storage Bill
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateStorageBillForm;