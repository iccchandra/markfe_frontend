// ============================================
// pages/release-orders/GenerateROForm.tsx
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Save, X, Calculator, AlertCircle, CheckCircle, Search
} from 'lucide-react';

interface ROFormData {
  roDate: string;
  validityDays: string;
  buyerId: string;
  buyerName: string;
  buyerGST: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerEmail: string;
  commodity: string;
  godownId: string;
  godownName: string;
  lotNumber: string;
  quantityMT: string;
  ratePerMT: string;
  gstRate: string;
  advancePercent: string;
  balancePercent: string;
  emdAmount: string;
  sdAmount: string;
  tdsRate: string;
  paymentMode: string;
  bankName: string;
  utrNumber: string;
  paymentDate: string;
  remarks: string;
}

export const GenerateROForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [calculations, setCalculations] = useState({
    roValue: 0,
    gstAmount: 0,
    totalValue: 0,
    advanceAmount: 0,
    balanceAmount: 0,
    tdsAmount: 0,
    netPayable: 0
  });

  const [formData, setFormData] = useState<ROFormData>({
    roDate: new Date().toISOString().split('T')[0],
    validityDays: '30',
    buyerId: '',
    buyerName: '',
    buyerGST: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerEmail: '',
    commodity: '',
    godownId: '',
    godownName: '',
    lotNumber: '',
    quantityMT: '',
    ratePerMT: '',
    gstRate: '5',
    advancePercent: '85',
    balancePercent: '15',
    emdAmount: '',
    sdAmount: '',
    tdsRate: '0.1',
    paymentMode: 'NEFT',
    bankName: '',
    utrNumber: '',
    paymentDate: '',
    remarks: ''
  });

  const commodities = ['JOWAR', 'Paddy', 'Sunflower', 'Maize', 'Cotton', 'Wheat', 'Rice'];
  const godowns = [
    { id: 'GD001', name: 'CWC DUBBA, Nizamabad' },
    { id: 'GD002', name: 'TGSWC NACHUPALLY, Adilabad' },
    { id: 'GD003', name: 'PACS Sangareddy' },
    { id: 'GD004', name: 'DCMS Medak' }
  ];
  const paymentModes = ['NEFT', 'RTGS', 'IMPS', 'Cheque', 'DD'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Trigger calculation if relevant fields change
    if (['quantityMT', 'ratePerMT', 'gstRate', 'advancePercent', 'balancePercent', 'tdsRate'].includes(name)) {
      setTimeout(() => calculateAmounts({ ...formData, [name]: value }), 100);
    }
  };

  const calculateAmounts = (data: ROFormData) => {
    const quantity = parseFloat(data.quantityMT) || 0;
    const rate = parseFloat(data.ratePerMT) || 0;
    const gstRate = parseFloat(data.gstRate) || 0;
    const advancePercent = parseFloat(data.advancePercent) || 0;
    const balancePercent = parseFloat(data.balancePercent) || 0;
    const tdsRate = parseFloat(data.tdsRate) || 0;

    const roValue = quantity * rate;
    const gstAmount = (roValue * gstRate) / 100;
    const totalValue = roValue + gstAmount;
    const advanceAmount = (totalValue * advancePercent) / 100;
    const balanceAmount = (totalValue * balancePercent) / 100;
    const tdsAmount = (totalValue * tdsRate) / 100;
    const netPayable = totalValue - tdsAmount;

    setCalculations({
      roValue,
      gstAmount,
      totalValue,
      advanceAmount,
      balanceAmount,
      tdsAmount,
      netPayable
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.buyerName.trim()) newErrors.buyerName = 'Buyer name is required';
    if (!formData.commodity) newErrors.commodity = 'Commodity is required';
    if (!formData.godownName) newErrors.godownName = 'Godown is required';
    if (!formData.quantityMT.trim()) newErrors.quantityMT = 'Quantity is required';
    if (!formData.ratePerMT.trim()) newErrors.ratePerMT = 'Rate is required';
    if (!formData.roDate) newErrors.roDate = 'RO date is required';

    if (formData.buyerPhone && !/^[6-9]\d{9}$/.test(formData.buyerPhone)) {
      newErrors.buyerPhone = 'Invalid phone number';
    }

    if (formData.buyerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
      newErrors.buyerEmail = 'Invalid email address';
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
      
      console.log('RO Generated:', { ...formData, calculations });
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/release-orders');
      }, 2000);
    } catch (error) {
      console.error('Error generating RO:', error);
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
              <p className="font-semibold text-green-900">Release Order Generated!</p>
              <p className="text-sm text-green-700">RO Number: RO/2026/{Math.floor(Math.random() * 1000)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-600" />
          Generate Release Order
        </h1>
        <p className="text-gray-500 mt-1">Create a new release order for commodity disposal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* RO Basic Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">RO Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RO Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="roDate"
                value={formData.roDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validity (Days)
              </label>
              <input
                type="number"
                name="validityDays"
                value={formData.validityDays}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lot Number
              </label>
              <input
                type="text"
                name="lotNumber"
                value={formData.lotNumber}
                onChange={handleChange}
                placeholder="LOT-3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Buyer Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buyer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="buyerName"
                value={formData.buyerName}
                onChange={handleChange}
                placeholder="M/s Santhoshi Parvathi Enterprises"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.buyerName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.buyerName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.buyerName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <input
                type="text"
                name="buyerGST"
                value={formData.buyerGST}
                onChange={handleChange}
                placeholder="36ABCDE1234F1Z5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="buyerPhone"
                value={formData.buyerPhone}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={10}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="buyerAddress"
                value={formData.buyerAddress}
                onChange={handleChange}
                placeholder="Complete address"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Commodity Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Commodity Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Godown Location <span className="text-red-500">*</span>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (MT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="quantityMT"
                value={formData.quantityMT}
                onChange={handleChange}
                placeholder="64.38"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.quantityMT ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate per MT (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="ratePerMT"
                value={formData.ratePerMT}
                onChange={handleChange}
                placeholder="51901"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.ratePerMT ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Rate (%)
              </label>
              <select
                name="gstRate"
                value={formData.gstRate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TDS Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="tdsRate"
                value={formData.tdsRate}
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
            <h2 className="text-lg font-bold text-gray-900">Amount Calculation</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">RO Value</div>
              <div className="text-xl font-bold text-gray-900">
                ₹{calculations.roValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">GST @ {formData.gstRate}%</div>
              <div className="text-xl font-bold text-green-600">
                +₹{calculations.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">TDS @ {formData.tdsRate}%</div>
              <div className="text-xl font-bold text-red-600">
                -₹{calculations.tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Total Value</div>
              <div className="text-2xl font-bold text-blue-600">
                ₹{calculations.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Advance ({formData.advancePercent}%)</div>
              <div className="text-xl font-bold text-purple-600">
                ₹{calculations.advanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Balance ({formData.balancePercent}%)</div>
              <div className="text-xl font-bold text-orange-600">
                ₹{calculations.balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {paymentModes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="ICICI Bank"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UTR / Reference Number
              </label>
              <input
                type="text"
                name="utrNumber"
                value={formData.utrNumber}
                onChange={handleChange}
                placeholder="ICICR420251217005046161"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EMD Amount
              </label>
              <input
                type="number"
                step="0.01"
                name="emdAmount"
                value={formData.emdAmount}
                onChange={handleChange}
                placeholder="140624"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Deposit
              </label>
              <input
                type="number"
                step="0.01"
                name="sdAmount"
                value={formData.sdAmount}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks / Special Conditions
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              placeholder="Enter any special conditions or remarks..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/release-orders')}
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
                <FileText className="w-4 h-4" />
                Generate Release Order
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateROForm;