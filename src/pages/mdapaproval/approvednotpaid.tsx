import React, { useEffect, useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MapPin,
  FileX,
} from 'lucide-react';
import paymentVerificationService from '../../services/payment-verification.service';
import { ApprovedNotPaidItem, Pagination, PaymentStatusDetail } from '../../types/payment.types';
/**
 * Approved Not Paid Component - SIMPLIFIED
 * Shows ONLY records that were NOT PRESENTED to bank
 * (No payment record exists in pay_records_integrated)
 */

interface TableRowProps {
  item: ApprovedNotPaidItem;
  index: number;
}

const TableRow: React.FC<TableRowProps> = ({ item, index }) => {
  const getDaysColorClass = (days: number) => {
    if (days > 30) return 'bg-red-100 text-red-800';
    if (days > 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <tr className="hover:bg-gray-50 border-b transition">
      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{item.beneficiaryId}</p>
        <p className="text-xs text-gray-500">{item.applicantName}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-3 h-3 mr-1" />
          <div>
            <p className="font-medium">{item.district}</p>
            <p className="text-xs text-gray-500">{item.mandal}, {item.village}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            item.stage === 'BL'
              ? 'bg-blue-100 text-blue-800'
              : item.stage === 'RL'
              ? 'bg-green-100 text-green-800'
              : item.stage === 'RC'
              ? 'bg-yellow-100 text-yellow-800'
              : item.stage === 'PENNY_DROP'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {item.stage}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        ₹{item.approvedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {new Date(item.dateOfApproval).toLocaleDateString('en-IN')}
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDaysColorClass(item.daysSinceApproval)}`}>
          {item.daysSinceApproval} days
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center text-xs text-orange-600">
          <FileX className="w-4 h-4 mr-1" />
          <span>No payment record</span>
        </div>
      </td>
    </tr>
  );
};

const ApprovedNotPaid: React.FC = () => {
  const [items, setItems] = useState<ApprovedNotPaidItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStage, setFilterStage] = useState<string>('');

  const fetchData = async (page: number = 1, limit: number = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch ONLY not presented records
      const response = await paymentVerificationService.getNotPresented(page, limit);
      
      setItems(response.items);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.page, pagination.limit);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    fetchData(1, newLimit);
  };

  const handleRefresh = () => {
    fetchData(pagination.page, pagination.limit);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting data...');
    alert('Export functionality will be implemented');
  };

  // Filter items based on search and stage
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.beneficiaryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = filterStage === '' || item.stage === filterStage;

    return matchesSearch && matchesStage;
  });

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto mt-8">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
        </div>
        <p className="text-red-700">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileX className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Not Presented to Bank</h2>
              <p className="text-gray-600 mt-1">
                {pagination.total.toLocaleString()} approved records not sent to bank
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-orange-800 mb-1">
              Payment Records Not Found
            </h3>
            <p className="text-sm text-orange-700">
              These beneficiaries were approved by MD but their payment records are missing from the 
              <span className="font-mono bg-orange-100 px-1 rounded mx-1">pay_records_integrated</span> 
              table. They need to be uploaded to the bank for processing.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by ID, name, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Stage Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Stages</option>
              <option value="PENNY_DROP">Penny Drop</option>
              <option value="BL">BL Stage</option>
              <option value="RL">RL Stage</option>
              <option value="RC">RC Stage</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Records Per Page */}
          <div>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Beneficiary
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Approved Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Days Pending
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <TableRow
                  key={`${item.beneficiaryId}-${item.stage}`}
                  item={item}
                  index={(pagination.page - 1) * pagination.limit + index}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <FileX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No records found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || filterStage
                ? 'Try adjusting your filters'
                : 'All approved payments have been presented to the bank'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total.toLocaleString()} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                <span className="px-4 py-1 bg-blue-600 text-white rounded-md">
                  {pagination.page}
                </span>
                <span className="px-2 text-gray-600">of</span>
                <span className="px-2 text-gray-600">{pagination.totalPages}</span>
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedNotPaid;