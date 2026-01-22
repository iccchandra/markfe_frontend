import React from 'react';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { PayRecord, FilterParams } from '@/services/payRecordsApi.service';
import { useNavigate } from 'react-router-dom';

interface PayRecordsTableProps {
  records: PayRecord[];
  loading: boolean;
  filters: FilterParams;
  onSort: (column: string) => void;
  onRowClick?: (record: PayRecord) => void;
}

export const PayRecordsTable: React.FC<PayRecordsTableProps> = ({
  records,
  loading,
  filters,
  onSort,
  onRowClick,
}) => {
  // FIXED: Move useNavigate inside the component
  const navigate = useNavigate();
  
  const handleBeneficiaryClick = (beneficiaryId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click if onRowClick exists
    navigate(`/beneficiary-timeline?beneficiaryId=${beneficiaryId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string, type: 'payment' | 'pennyDrop') => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    
    const statusColors: Record<string, string> = {
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      NOT_DONE: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`${baseClasses} ${statusColors[status] || statusColors.PENDING}`}>
        {status}
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    
    const stageColors: Record<string, string> = {
      BL: 'bg-blue-100 text-blue-800',
      RL: 'bg-purple-100 text-purple-800',
      RC: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`${baseClasses} ${stageColors[stage] || 'bg-gray-100 text-gray-800'}`}>
        {stage}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    return (
      <span className={`${baseClasses} ${method === 'APBS' ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'}`}>
        {method}
      </span>
    );
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (filters.sortBy !== column) return null;
    return filters.sortOrder === 'ASC' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const columns = [
    { key: 'beneficiaryId', label: 'Beneficiary ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'stage', label: 'Stage', sortable: false },
    { key: 'bankPaymentStatus', label: 'Payment Status', sortable: false },
    { key: 'pennyDropStatus', label: 'Penny Drop', sortable: false },
    { key: 'payment_with', label: 'Method', sortable: false },
    { key: 'bankPaidAmount', label: 'Amount', sortable: true },
    { key: 'bankProcessedDate', label: 'Processed Date', sortable: true },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && onSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.key === 'bankPaidAmount' ? 'text-right' : ''}`}
                >
                  <div className={`flex items-center gap-2 ${column.key === 'bankPaidAmount' ? 'justify-end' : ''}`}>
                    {column.label}
                    {column.sortable && <SortIcon column={column.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => onRowClick?.(record)}
                  className={`hover:bg-gray-50 transition ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => handleBeneficiaryClick(record.beneficiaryId, e)}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors group"
                    >
                      <span>{record.beneficiaryId}</span>
                      <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {record.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStageBadge(record.stage)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.bankPaymentStatus, 'payment')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.pennyDropStatus, 'pennyDrop')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentMethodBadge(record.payment_with)}
                  </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
  {formatCurrency(record.bankPaidAmount / 100)}
</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(record.bankProcessedDate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};