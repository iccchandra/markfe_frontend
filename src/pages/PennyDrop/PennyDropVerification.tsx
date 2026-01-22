// ============================================
// pages/PennyDrop/PennyDropVerification.tsx
// ============================================
import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Download,
  RefreshCw,
  Search,
  Filter,
  Eye,
  MoreVertical,
  FileText,
  Info
} from 'lucide-react';
import { PennyDropStatus, Beneficiary } from '../../types';

export const PennyDropVerification: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  useEffect(() => {
    fetchPennyDropData();
  }, []);

  const fetchPennyDropData = async () => {
    try {
      setLoading(true);
      // Mock data - showing penny drop status from uploaded data
      const mockData = [
        {
          id: '1',
          beneficiaryId: 'BEN001',
          name: 'Ramesh Kumar',
          aadhaar: '629716230065',
          bankAccount: '052110118493',
          ifscCode: 'IPOST0000001',
          bankName: 'India Post Payments Bank',
          pennyDropStatus: PennyDropStatus.VERIFIED,
          amount: 500000,
          verificationDate: '2025-01-15',
          responseCode: 'SUCCESS',
          accountHolderName: 'RAMESH KUMAR',
          matched: true,
          category: 'Ready for Payment',
          pennyDropSource: 'Pre-uploaded'
        },
        {
          id: '2',
          beneficiaryId: 'BEN002',
          name: 'Lavudya Mathri',
          aadhaar: '561874982102',
          bankAccount: '187610100057689',
          ifscCode: 'UBIN0018761',
          bankName: 'Union Bank of India',
          pennyDropStatus: PennyDropStatus.VERIFIED,
          amount: 500000,
          verificationDate: '2025-01-15',
          responseCode: 'SUCCESS',
          accountHolderName: 'L MATHRI',
          matched: true,
          category: 'Ready for Payment',
          pennyDropSource: 'Pre-uploaded'
        },
        {
          id: '3',
          beneficiaryId: 'BEN003',
          name: 'Jidugu Veerababu',
          aadhaar: '325509512532',
          bankAccount: '221122040010381',
          ifscCode: 'ICIC0000123',
          bankName: 'ICICI Bank',
          pennyDropStatus: PennyDropStatus.FAILED,
          amount: 500000,
          verificationDate: '2025-01-15',
          responseCode: 'INVALID_ACCOUNT',
          accountHolderName: '',
          matched: false,
          errorMessage: 'Account number does not exist',
          category: 'Rejected',
          pennyDropSource: 'Pre-uploaded'
        },
        {
          id: '4',
          beneficiaryId: 'BEN004',
          name: 'Gantela Pushpalatha',
          aadhaar: '323184321173',
          bankAccount: '21100003183663',
          ifscCode: 'AUSB0000123',
          bankName: 'AU Small Finance Bank',
          pennyDropStatus: PennyDropStatus.PENDING,
          amount: 500000,
          verificationDate: null,
          responseCode: 'NOT_DONE',
          accountHolderName: '',
          matched: null,
          category: 'Needs Penny Drop',
          pennyDropSource: 'Not Done'
        },
        {
          id: '5',
          beneficiaryId: 'BEN005',
          name: 'Ramidi Madevi',
          aadhaar: '598927600521',
          bankAccount: '010161711432',
          ifscCode: 'ICIC0000100',
          bankName: 'ICICI Bank',
          pennyDropStatus: PennyDropStatus.VERIFIED,
          amount: 500000,
          verificationDate: '2025-01-15',
          responseCode: 'SUCCESS',
          accountHolderName: 'RAMIDI M',
          matched: true,
          category: 'Ready for Payment',
          pennyDropSource: 'Pre-uploaded'
        },
        {
          id: '6',
          beneficiaryId: 'BEN006',
          name: 'Srinivasa Rao K',
          aadhaar: '743705427363',
          bankAccount: '20378506750',
          ifscCode: 'FINO0000203',
          bankName: 'Fino Payments Bank',
          pennyDropStatus: PennyDropStatus.PENDING,
          amount: 500000,
          verificationDate: null,
          responseCode: 'NOT_DONE',
          accountHolderName: '',
          matched: null,
          category: 'Needs Penny Drop',
          pennyDropSource: 'Not Done'
        }
      ];
      setBeneficiaries(mockData);
    } catch (error) {
      console.error('Failed to fetch penny drop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: PennyDropStatus) => {
    const styles: Record<PennyDropStatus, string> = {
      [PennyDropStatus.VERIFIED]: 'bg-green-100 text-green-800',
      [PennyDropStatus.FAILED]: 'bg-red-100 text-red-800',
      [PennyDropStatus.PENDING]: 'bg-orange-100 text-orange-800'
    };
    const labels: Record<PennyDropStatus, string> = {
      [PennyDropStatus.VERIFIED]: 'Verified',
      [PennyDropStatus.FAILED]: 'Failed',
      [PennyDropStatus.PENDING]: 'Not Done'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      'Ready for Payment': 'bg-green-100 text-green-800 border-green-300',
      'Needs Penny Drop': 'bg-orange-100 text-orange-800 border-orange-300',
      'Rejected': 'bg-red-100 text-red-800 border-red-300'
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${styles[category]}`}>
        {category}
      </span>
    );
  };

  const getStatusIcon = (status: PennyDropStatus) => {
    switch (status) {
      case PennyDropStatus.VERIFIED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case PennyDropStatus.FAILED:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case PennyDropStatus.PENDING:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const filteredBeneficiaries = beneficiaries.filter(b => {
    let matchesFilter = true;
    if (filter !== 'all') {
      matchesFilter = b.pennyDropStatus === filter;
    }
    const matchesSearch = searchQuery === '' || 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.aadhaar.includes(searchQuery) ||
      b.beneficiaryId.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: beneficiaries.length,
    verified: beneficiaries.filter(b => b.pennyDropStatus === PennyDropStatus.VERIFIED).length,
    failed: beneficiaries.filter(b => b.pennyDropStatus === PennyDropStatus.FAILED).length,
    pending: beneficiaries.filter(b => b.pennyDropStatus === PennyDropStatus.PENDING).length
  };

  const handleExportCategory = (category: string) => {
    const filtered = beneficiaries.filter(b => b.category === category);
    alert(`Exporting ${filtered.length} records in category: ${category}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading penny drop data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Penny Drop Validation & Categorization</h1>
        <p className="mt-2 text-gray-600">Review and categorize beneficiary records by penny drop status</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">System Behavior</h3>
            <p className="text-sm text-blue-800 mt-1">
              This system validates and categorizes records based on existing penny drop data. 
              Records without penny drop need to be sent to external penny drop service.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Records"
          value={stats.total}
          color="bg-gray-50"
          icon="📊"
        />
        <StatCard
          label="Verified (Ready)"
          value={stats.verified}
          color="bg-green-50"
          icon="✓"
          subtext="Ready for payment"
        />
        <StatCard
          label="Failed (Rejected)"
          value={stats.failed}
          color="bg-red-50"
          icon="✗"
          subtext="Cannot process"
        />
        <StatCard
          label="Not Done (Pending)"
          value={stats.pending}
          color="bg-orange-50"
          icon="⏳"
          subtext="Needs penny drop"
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          title="Ready for Payment"
          count={stats.verified}
          description="Records with successful penny drop validation"
          color="bg-green-50 border-green-200"
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          actionLabel="Export Validated Excel"
          onAction={() => handleExportCategory('Ready for Payment')}
        />
        <ActionCard
          title="Needs Penny Drop"
          count={stats.pending}
          description="Records without penny drop - send to external service"
          color="bg-orange-50 border-orange-200"
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          actionLabel="Export Pending Excel"
          onAction={() => handleExportCategory('Needs Penny Drop')}
        />
        <ActionCard
          title="Rejected Records"
          count={stats.failed}
          description="Records with failed penny drop - require correction"
          color="bg-red-50 border-red-200"
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          actionLabel="Export Rejected Excel"
          onAction={() => handleExportCategory('Rejected')}
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, Aadhaar, or Beneficiary ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value={PennyDropStatus.VERIFIED}>Verified (Ready)</option>
            <option value={PennyDropStatus.FAILED}>Failed (Rejected)</option>
            <option value={PennyDropStatus.PENDING}>Not Done (Pending)</option>
          </select>

          {/* Action Buttons */}
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(filteredBeneficiaries.map(b => b.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Beneficiary</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Account Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bank</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Penny Drop Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBeneficiaries.map((beneficiary) => (
                <tr key={beneficiary.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(beneficiary.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, beneficiary.id]);
                        } else {
                          setSelectedRows(selectedRows.filter(id => id !== beneficiary.id));
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{beneficiary.name}</div>
                    <div className="text-sm text-gray-500">{beneficiary.beneficiaryId}</div>
                    <div className="text-xs text-gray-500">{beneficiary.aadhaar}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-gray-900">{beneficiary.bankAccount}</div>
                    <div className="text-xs text-gray-500">{beneficiary.ifscCode}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{beneficiary.bankName}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {getStatusBadge(beneficiary.pennyDropStatus)}
                      <div className="text-xs text-gray-500">{beneficiary.pennyDropSource}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getCategoryBadge(beneficiary.category)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      {getStatusIcon(beneficiary.pennyDropStatus)}
                      <div className="text-sm">
                        {beneficiary.pennyDropStatus === PennyDropStatus.VERIFIED && (
                          <div>
                            <div className="font-medium text-green-900">{beneficiary.accountHolderName}</div>
                            <div className="text-xs text-green-700">Name Matched</div>
                            {beneficiary.verificationDate && (
                              <div className="text-xs text-gray-500">
                                Verified: {new Date(beneficiary.verificationDate).toLocaleDateString('en-IN')}
                              </div>
                            )}
                          </div>
                        )}
                        {beneficiary.pennyDropStatus === PennyDropStatus.FAILED && (
                          <div>
                            <div className="font-medium text-red-900">{beneficiary.errorMessage}</div>
                            <div className="text-xs text-red-700">Requires Correction</div>
                          </div>
                        )}
                        {beneficiary.pennyDropStatus === PennyDropStatus.PENDING && (
                          <div>
                            <div className="font-medium text-orange-900">Penny Drop Not Done</div>
                            <div className="text-xs text-orange-700">Send to External Service</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="More Options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBeneficiaries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No records found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">Showing {filteredBeneficiaries.length} of {stats.total} records</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">Previous</button>
          <button className="px-3 py-1 border border-indigo-300 bg-indigo-50 text-indigo-600 rounded text-sm font-medium">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Components
// ============================================
interface StatCardProps {
  label: string;
  value: number | string;
  color: string;
  icon: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon, subtext }) => {
  return (
    <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-6`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-4xl opacity-30">{icon}</div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-600 mt-1">{subtext}</p>}
    </div>
  );
};

interface ActionCardProps {
  title: string;
  count: number;
  description: string;
  color: string;
  icon: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  count, 
  description, 
  color, 
  icon, 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className={`${color} border-2 rounded-lg p-6`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-white rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 my-2">{count}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <button
        onClick={onAction}
        className="w-full px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        {actionLabel}
      </button>
    </div>
  );
};

export default PennyDropVerification;