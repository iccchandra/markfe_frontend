import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  Download,
  Filter,
  Search,
  Loader2,
  XCircle,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { mdApprovalApi } from '../../services/mdapproval.api.service';

// Import the RENAMED types
import type { 
  MdApprovalFailedBeneficiary, 
  MdApprovalNotPresentedBeneficiary 
} from '../../services/mdapproval.api.service';

interface BeneficiaryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  type: 'FAILED' | 'NOT_PRESENTED';
  count: number;
}

// Define local union type
type BeneficiaryItem = MdApprovalFailedBeneficiary | MdApprovalNotPresentedBeneficiary;

export const BeneficiaryDetailsModal: React.FC<BeneficiaryDetailsModalProps> = ({
  isOpen,
  onClose,
  date,
  type,
  count,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  useEffect(() => {
    if (isOpen && date) {
      fetchBeneficiaries();
    }
  }, [isOpen, date, type, filterStage, filterDistrict]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setFilterStage('');
      setFilterDistrict('');
      setBeneficiaries([]);
      setError(null);
    }
  }, [isOpen]);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        date,
        ...(filterStage && { stage: filterStage }),
        ...(filterDistrict && { district: filterDistrict }),
      };

      if (type === 'FAILED') {
        const data = await mdApprovalApi.getFailedBeneficiaries(filters);
        if (data.success) {
          setBeneficiaries(data.items as BeneficiaryItem[]);
        } else {
          setError('Failed to load data');
        }
      } else {
        const data = await mdApprovalApi.getNotPresentedBeneficiaries(filters);
        if (data.success) {
          setBeneficiaries(data.items as BeneficiaryItem[]);
        } else {
          setError('Failed to load data');
        }
      }
    } catch (err: any) {
      console.error('Error fetching beneficiaries:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const filters = {
        date,
        ...(filterStage && { stage: filterStage }),
        ...(filterDistrict && { district: filterDistrict }),
      };

      const url = type === 'FAILED'
        ? mdApprovalApi.exportFailedBeneficiaries(filters)
        : mdApprovalApi.exportNotPresentedBeneficiaries(filters);

      window.location.href = url;
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    const crores = amount / 10000000;
    return `₹${crores.toFixed(2)} Cr`;
  };

  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar) return 'N/A';
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      PENNY_DROP: 'bg-gray-100 text-gray-800',
      BL: 'bg-blue-100 text-blue-800',
      RL: 'bg-purple-100 text-purple-800',
      RC: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const filteredBeneficiaries = beneficiaries.filter((b: BeneficiaryItem) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      b.applicantName.toLowerCase().includes(query) ||
      b.beneficiaryId.toLowerCase().includes(query) ||
      b.aadhaarNumber.includes(query) ||
      b.district.toLowerCase().includes(query) ||
      b.mandal.toLowerCase().includes(query)
    );
  });

  // Get unique stages and districts for filters
  const uniqueStages = Array.from(new Set(beneficiaries.map((b: BeneficiaryItem) => b.stage)));
  const uniqueDistricts = Array.from(new Set(beneficiaries.map((b: BeneficiaryItem) => b.district)));

  if (!isOpen) return null;

  const modalTitle = type === 'FAILED' ? 'Failed Payments' : 'Not Presented to Bank';
  const modalIcon =
    type === 'FAILED' ? (
      <XCircle className="w-6 h-6 text-red-600" />
    ) : (
      <AlertTriangle className="w-6 h-6 text-orange-600" />
    );
  const headerBgColor = type === 'FAILED' ? 'bg-red-50' : 'bg-orange-50';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 ${headerBgColor}`}>
              <div>
                <div className="flex items-center gap-3">
                  {modalIcon}
                  <h2 className="text-xl font-bold text-gray-900">{modalTitle}</h2>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExport}
                  disabled={loading || beneficiaries.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading beneficiaries...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-900">Error Loading Data</h3>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div
                    className={`${
                      type === 'FAILED'
                        ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                        : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                    } rounded-lg p-4 border`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm ${
                            type === 'FAILED' ? 'text-red-700' : 'text-orange-700'
                          } font-medium`}
                        >
                          Total {modalTitle}
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            type === 'FAILED' ? 'text-red-900' : 'text-orange-900'
                          } mt-1`}
                        >
                          {filteredBeneficiaries.length.toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`p-2 ${
                          type === 'FAILED' ? 'bg-red-200' : 'bg-orange-200'
                        } rounded-lg`}
                      >
                        <Users className={`h-5 w-5 ${type === 'FAILED' ? 'text-red-700' : 'text-orange-700'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Filter className="h-4 w-4 text-gray-600" />
                      <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Filter by Stage
                        </label>
                        <select
                          value={filterStage}
                          onChange={(e) => setFilterStage(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Stages</option>
                          <option value="PENNY_DROP">PENNY_DROP</option>
                          <option value="BL">BL</option>
                          <option value="RL">RL</option>
                          <option value="RC">RC</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Filter by District
                        </label>
                        <select
                          value={filterDistrict}
                          onChange={(e) => setFilterDistrict(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Districts</option>
                          {uniqueDistricts.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Search
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Name, ID, Aadhaar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Beneficiaries Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Beneficiaries ({filteredBeneficiaries.length})
                      </h3>
                    </div>

                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Beneficiary ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Aadhaar
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              District
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mandal
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stage
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            {type === 'FAILED' && (
                              <>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bank
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Failure Reason
                                </th>
                              </>
                            )}
                            {type === 'NOT_PRESENTED' && (
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Days Since Approval
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredBeneficiaries.map((beneficiary: BeneficiaryItem, index: number) => (
                            <tr key={`${beneficiary.beneficiaryId}-${index}`} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                                {beneficiary.beneficiaryId}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                {beneficiary.applicantName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                                {maskAadhaar(beneficiary.aadhaarNumber)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                {beneficiary.district}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                {beneficiary.mandal}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(
                                    beneficiary.stage
                                  )}`}
                                >
                                  {beneficiary.stage}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-900">
                                {formatCurrency(beneficiary.amountInRupees)}
                              </td>
                              {type === 'FAILED' && (
                                <>
                                  <td className="px-4 py-3 text-xs text-gray-900">
                                    <div>
                                      <p className="font-medium">{(beneficiary as MdApprovalFailedBeneficiary).bankName}</p>
                                      <p className="text-xs text-gray-500">{(beneficiary as MdApprovalFailedBeneficiary).bankIIN}</p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-xs">
                                    <div>
                                      <p className="font-medium text-red-600">
                                        {(beneficiary as MdApprovalFailedBeneficiary).responseCode}
                                      </p>
                                      <p className="text-xs text-gray-600 max-w-xs line-clamp-2">
                                        {(beneficiary as MdApprovalFailedBeneficiary).rejectionReason}
                                      </p>
                                    </div>
                                  </td>
                                </>
                              )}
                              {type === 'NOT_PRESENTED' && (
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-orange-600 font-medium">
                                  {(beneficiary as MdApprovalNotPresentedBeneficiary).daysSinceApproval} days
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {filteredBeneficiaries.length === 0 && (
                        <div className="text-center py-8">
                          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            No beneficiaries found matching your criteria
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryDetailsModal;