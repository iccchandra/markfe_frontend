
// ReconciliationDetail-FINAL.tsx
// ✅ COMPLETE: With enhanced reason codes showing individual beneficiaries

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  FileText,
  RefreshCw,
  Building2,
  XCircle,
  Layers,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Users,
  Search,
} from 'lucide-react';
import {
  useReconciliationDetail,
  useBankWiseSummary,
  useExportReconciliation,
} from '../../hooks/useReconciliation';
import { reconciliationApiService } from '../../services/api/reconciliation.service';
import axios from 'axios';

// Types
interface StageWiseSummary {
  stage: string;
  totalRecords: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  expectedAmount: number;
  paidAmount: number;
  variance: number;
  successRate: string;
}

interface PaymentMethodSummary {
  paymentMethod: string;
  totalRecords: number;
  successCount: number;
  failedCount: number;
  totalAmount: number;
  successRate: string;
}

// ✅ NEW: Beneficiary type for reason codes
interface Beneficiary {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  rejectionReason: string;
  expectedAmount: number;
  expectedAmountInRupees: string;
  bankIIN: string;
  bankName: string;
  stage: string;
}

// ✅ NEW: Enhanced reason code type
interface ReasonCodeWithBeneficiaries {
  code: string;
  description: string;
  count: number;
  beneficiaries: Beneficiary[];
}

export const ReconciliationDetail: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'bankWise' | 'reasonCodes' | 'stageWise' | 'paymentMethods' | 'records'
  >('overview');

  const [stageWiseSummary, setStageWiseSummary] = useState<StageWiseSummary[]>([]);
  const [paymentMethodSummary, setPaymentMethodSummary] = useState<PaymentMethodSummary[]>([]);
  const [loadingStageWise, setLoadingStageWise] = useState(false);
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);

  // ✅ NEW: State for enhanced reason codes
  const [reasonCodesWithBeneficiaries, setReasonCodesWithBeneficiaries] = useState<ReasonCodeWithBeneficiaries[]>([]);
  const [loadingReasonCodes, setLoadingReasonCodes] = useState(false);
  const [expandedReasonCodes, setExpandedReasonCodes] = useState<Set<string>>(new Set());
  const [reasonCodeSearch, setReasonCodeSearch] = useState('');

  const {
    reconciliation: batch,
    detail,
    loading,
    error,
    refetch,
  } = useReconciliationDetail(batchId || '');

  const {
    summary: bankWiseSummary,
    loading: bankWiseLoading,
  } = useBankWiseSummary(batchId || '');

  const { exportReconciliation, exporting } = useExportReconciliation();

  const fetchStageWiseSummary = async () => {
    if (!batchId || stageWiseSummary.length > 0) return;
    
    try {
      setLoadingStageWise(true);
      const response = await axios.get(`http://localhost:3002/reconciliation/${batchId}/stage-wise`);
      setStageWiseSummary(response.data);
    } catch (err) {
      console.error('Error fetching stage-wise summary:', err);
    } finally {
      setLoadingStageWise(false);
    }
  };

  const fetchPaymentMethodSummary = async () => {
    if (!batchId || paymentMethodSummary.length > 0) return;
    
    try {
      setLoadingPaymentMethod(true);
      const response = await axios.get(`http://localhost:3002/reconciliation/${batchId}/payment-methods`);
      setPaymentMethodSummary(response.data);
    } catch (err) {
      console.error('Error fetching payment method summary:', err);
    } finally {
      setLoadingPaymentMethod(false);
    }
  };

  // ✅ NEW: Fetch reason codes with beneficiary details
  const fetchReasonCodesWithBeneficiaries = async () => {
    if (!batchId || reasonCodesWithBeneficiaries.length > 0) return;
    
    try {
      setLoadingReasonCodes(true);
      const response = await axios.get(`http://localhost:3002/reconciliation/${batchId}/reason-codes/detailed`);
      setReasonCodesWithBeneficiaries(response.data);
    } catch (err) {
      console.error('Error fetching reason codes:', err);
    } finally {
      setLoadingReasonCodes(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'stageWise') {
      fetchStageWiseSummary();
    } else if (activeTab === 'paymentMethods') {
      fetchPaymentMethodSummary();
    } else if (activeTab === 'reasonCodes') {
      fetchReasonCodesWithBeneficiaries();
    }
  }, [activeTab]);

  const formatAmount = (amount: number): string => {
    return reconciliationApiService.formatAmountInCrores(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = async () => {
    if (!batch) return;
    await exportReconciliation(
      batch.id,
      `Reconciliation_${batch.batchId}_${Date.now()}.xlsx`
    );
  };

  // ✅ NEW: Toggle expand/collapse for reason codes
  const toggleReasonCodeExpand = (code: string) => {
    setExpandedReasonCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  // ✅ NEW: Export beneficiaries to CSV
  const exportBeneficiariesToCSV = (code: string, beneficiaries: Beneficiary[]) => {
    const headers = [
      'Beneficiary ID',
      'Name',
      'Aadhaar',
      'Account Number',
      'Amount (₹)',
      'Bank IIN',
      'Bank Name',
      'Stage',
      'Reason'
    ];
    
    const rows = beneficiaries.map(b => [
      b.beneficiaryId,
      b.name,
      b.aadhaarNumber,
      b.accountNumber,
      b.expectedAmountInRupees,
      b.bankIIN,
      b.bankName,
      b.stage,
      b.rejectionReason,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reason-code-${code}-beneficiaries-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !batch) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reconciliation details...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Reconciliation batch not found'}</p>
          <button
            onClick={() => navigate('/reconciliation')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Reconciliation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reconciliation')}
              className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reconciliation Details</h1>
              <p className="text-gray-600 mt-1">Batch {batch.batchId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>

        {/* Summary Cards - Only 2 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard
            label="Amount Paid"
            value={formatAmount(batch.totalAmountPaid)}
            icon={<DollarSign className="w-5 h-5 text-green-600" />}
            color="bg-green-50"
            subtext={`of ${formatAmount(batch.totalAmountExpected)}`}
          />
          <SummaryCard
            label="Status"
            value={batch.status}
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            color="bg-green-50"
            subtext={
              batch.processedDate
                ? `Completed ${new Date(batch.processedDate).toLocaleDateString('en-IN')}`
                : 'In progress'
            }
          />
        </div>

        {/* Batch Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Batch Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem label="Batch ID" value={batch.batchId} mono />
            <InfoItem label="Upload Date" value={formatDate(batch.uploadDate)} />
            <InfoItem label="Uploaded By" value={batch.uploadedBy} />
            {batch.processedDate && (
              <InfoItem label="Processed Date" value={formatDate(batch.processedDate)} />
            )}
            <InfoItem 
              label="Status" 
              value={
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  reconciliationApiService.getStatusConfig(batch.status).bgClass
                } ${reconciliationApiService.getStatusConfig(batch.status).textClass} ${
                  reconciliationApiService.getStatusConfig(batch.status).borderClass
                }`}>
                  {batch.status}
                </span>
              } 
            />
            {batch.fileName && <InfoItem label="File Name" value={batch.fileName} />}
            {batch.responseType && (
              <InfoItem label="Response Type" value={batch.responseType} />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: FileText },
              { key: 'bankWise', label: 'Bank-Wise', icon: Building2 },
              { key: 'stageWise', label: 'Stage-Wise', icon: Layers },
              { key: 'reasonCodes', label: 'Failures', icon: XCircle },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && detail && (
              <OverviewTab batch={batch} detail={detail} formatAmount={formatAmount} />
            )}

            {activeTab === 'bankWise' && (
              <BankWiseTab
                bankWiseSummary={bankWiseSummary}
                loading={bankWiseLoading}
              />
            )}

            {activeTab === 'stageWise' && (
              <StageWiseTab
                stageWiseSummary={stageWiseSummary}
                loading={loadingStageWise}
                formatAmount={formatAmount}
              />
            )}

            {activeTab === 'paymentMethods' && (
              <PaymentMethodsTab
                paymentMethodSummary={paymentMethodSummary}
                loading={loadingPaymentMethod}
                formatAmount={formatAmount}
              />
            )}

            {/* ✅ ENHANCED: Reason Codes Tab with Beneficiary Details */}
            {activeTab === 'reasonCodes' && (
              <ReasonCodesWithBeneficiariesTab
                reasonCodes={reasonCodesWithBeneficiaries}
                loading={loadingReasonCodes}
                expandedCodes={expandedReasonCodes}
                searchQuery={reasonCodeSearch}
                onToggleExpand={toggleReasonCodeExpand}
                onExport={exportBeneficiariesToCSV}
                onSearchChange={setReasonCodeSearch}
                batch={batch}
              />
            )}

            {activeTab === 'records' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Individual Records</h3>
                <p className="text-sm text-gray-600">
                  View detailed reconciliation records for individual beneficiaries
                </p>
                <button
                  onClick={() => navigate(`/reconciliation/${batchId}/records`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  View All Records
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================================
// TAB COMPONENTS
// ========================================================================

const OverviewTab: React.FC<{
  batch: any;
  detail: any;
  formatAmount: (amount: number) => string;
}> = ({ batch, detail, formatAmount }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatsSection title="Bank Payment Statistics">
        <StatRow label="Bank Records Received" value={batch.totalBankRecords.toLocaleString()} />
        <StatRow
          label="Payments Successful"
          value={batch.bankPaymentSuccess.toLocaleString()}
          highlight="success"
        />
        <StatRow
          label="Payments Failed"
          value={batch.bankPaymentFailed.toLocaleString()}
          highlight="error"
        />
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">Success Rate</p>
          <p className="text-lg font-bold text-gray-900">
            {((batch.bankPaymentSuccess / batch.totalBankRecords) * 100).toFixed(2)}%
          </p>
        </div>
      </StatsSection>

      <StatsSection title="Financial Reconciliation">
        <div className="space-y-3">
          <AmountCard label="Total Expected Amount" amount={formatAmount(batch.totalAmountExpected)} />
          <AmountCard
            label="Total Paid Amount"
            amount={formatAmount(batch.totalAmountPaid)}
            color="green"
          />
          <AmountCard
            label="Amount Variance"
            amount={formatAmount(batch.amountVariance)}
            color="red"
          />
        </div>
      </StatsSection>
    </div>

    {detail.stats && (
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Detailed Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Records" value={detail.stats.total.toLocaleString()} color="blue" />
          <MetricCard label="Matched" value={detail.stats.matched.toLocaleString()} color="green" />
          <MetricCard label="Mismatched" value={detail.stats.mismatched.toLocaleString()} color="yellow" />
          <MetricCard label="Critical Issues" value={detail.stats.criticalIssues.toLocaleString()} color="red" />
        </div>
      </div>
    )}
  </div>
);

const BankWiseTab: React.FC<{
  bankWiseSummary: any[];
  loading: boolean;
}> = ({ bankWiseSummary, loading }) => (
  <div className="space-y-6">
    <h3 className="text-sm font-semibold text-gray-700">Bank-Wise Reconciliation Summary</h3>
    {loading ? (
      <LoadingSpinner message="Loading bank summary..." />
    ) : bankWiseSummary.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Bank IIN</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Bank Name</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Total</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Success</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Failed</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Amount (₹)</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Success Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bankWiseSummary.map((bank) => (
              <tr key={bank.bankIIN} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{bank.bankIIN}</td>
                <td className="py-3 px-4 text-gray-900">{bank.bankName}</td>
                <td className="py-3 px-4 text-right text-gray-900">{bank.totalRecords.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-green-600 font-semibold">{bank.successCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-red-600 font-semibold">{bank.failedCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">₹{bank.totalAmountInRupees}</td>
                <td className="py-3 px-4 text-right">
                  <span className="font-semibold">{bank.successRate}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState message="No bank-wise data available" />
    )}
  </div>
);

const StageWiseTab: React.FC<{
  stageWiseSummary: StageWiseSummary[];
  loading: boolean;
  formatAmount: (amount: number) => string;
}> = ({ stageWiseSummary, loading, formatAmount }) => (
  <div className="space-y-6">
    <h3 className="text-sm font-semibold text-gray-700">Stage-Wise Payment Analysis</h3>
    <p className="text-sm text-gray-600">Breakdown by beneficiary stage (BL/RL/RC/COMPLETED)</p>
    
    {loading ? (
      <LoadingSpinner message="Loading stage-wise summary..." />
    ) : stageWiseSummary.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Stage</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Total</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Success</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Failed</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Expected</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Paid</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Variance</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Success Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stageWiseSummary.map((stage) => (
              <tr key={stage.stage} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                    {stage.stage}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-gray-900">{stage.totalRecords.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-green-600 font-semibold">{stage.successCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-red-600 font-semibold">{stage.failedCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-mono text-gray-900">{formatAmount(stage.expectedAmount)}</td>
                <td className="py-3 px-4 text-right font-mono text-green-600 font-semibold">{formatAmount(stage.paidAmount)}</td>
                <td className="py-3 px-4 text-right font-mono text-amber-600">{formatAmount(stage.variance)}</td>
                <td className="py-3 px-4 text-right">
                  <span className="font-semibold">{stage.successRate}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState message="No stage-wise data available" />
    )}
  </div>
);

const PaymentMethodsTab: React.FC<{
  paymentMethodSummary: PaymentMethodSummary[];
  loading: boolean;
  formatAmount: (amount: number) => string;
}> = ({ paymentMethodSummary, loading, formatAmount }) => (
  <div className="space-y-6">
    <h3 className="text-sm font-semibold text-gray-700">Payment Method Distribution</h3>
    <p className="text-sm text-gray-600">Breakdown by payment method (APBS/BANK/IOB)</p>
    
    {loading ? (
      <LoadingSpinner message="Loading payment methods..." />
    ) : paymentMethodSummary.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Payment Method</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Total Records</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Success</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Failed</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Total Amount</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Success Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paymentMethodSummary.map((method) => (
              <tr key={method.paymentMethod} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    method.paymentMethod === 'APBS' ? 'bg-blue-100 text-blue-700' :
                    method.paymentMethod === 'BANK' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {method.paymentMethod}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-gray-900">{method.totalRecords.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-green-600 font-semibold">{method.successCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-red-600 font-semibold">{method.failedCount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-mono text-gray-900">{formatAmount(method.totalAmount)}</td>
                <td className="py-3 px-4 text-right">
                  <span className="font-semibold">{method.successRate}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState message="No payment method data available" />
    )}
  </div>
);
// ✅ NEW: Enhanced Reason Codes Tab with Beneficiary Details
const ReasonCodesWithBeneficiariesTab: React.FC<{
  reasonCodes: ReasonCodeWithBeneficiaries[];
  loading: boolean;
  expandedCodes: Set<string>;
  searchQuery: string;
  onToggleExpand: (code: string) => void;
  onExport: (code: string, beneficiaries: Beneficiary[]) => void;
  onSearchChange: (query: string) => void;
  batch: any;
}> = ({ reasonCodes, loading, expandedCodes, searchQuery, onToggleExpand, onExport, onSearchChange, batch }) => {
  const filterBeneficiaries = (beneficiaries: Beneficiary[]) => {
    if (!searchQuery) return beneficiaries;
    
    const query = searchQuery.toLowerCase();
    return beneficiaries.filter(b =>
      b.beneficiaryId.toLowerCase().includes(query) ||
      b.name.toLowerCase().includes(query) ||
      b.aadhaarNumber.includes(query) ||
      b.accountNumber.includes(query)
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading failure details..." />;
  }

  if (reasonCodes.length === 0) {
    return <EmptyState message="No failure reasons available" />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Failure Reasons with Beneficiary Details
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Click to expand and see affected beneficiaries
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search beneficiaries..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Reason Code Groups */}
      <div className="space-y-4">
        {reasonCodes.map((group) => {
          const isExpanded = expandedCodes.has(group.code);
          const filteredBeneficiaries = filterBeneficiaries(group.beneficiaries);
          const showingCount = searchQuery ? filteredBeneficiaries.length : group.count;

          return (
            <div
              key={group.code}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div
                onClick={() => onToggleExpand(group.code)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-700 font-bold text-lg">
                        {group.code}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900 truncate">
                        {group.description}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{showingCount} beneficiaries</span>
                        {searchQuery && showingCount !== group.count && (
                          <span className="text-gray-400">
                            (of {group.count} total)
                          </span>
                        )}
                      </div>
                      <div>
                        {((group.count / batch.bankPaymentFailed) * 100).toFixed(1)}% of failures
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExpanded && filteredBeneficiaries.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExport(group.code, filteredBeneficiaries);
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Export to CSV"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Beneficiary List */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {filteredBeneficiaries.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No beneficiaries found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Beneficiary
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Aadhaar
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Account
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Bank
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Stage
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Amount (₹)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredBeneficiaries.map((beneficiary) => (
                            <tr
                              key={beneficiary.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {beneficiary.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: {beneficiary.beneficiaryId}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-900">
                                {beneficiary.aadhaarNumber}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-900">
                                {beneficiary.accountNumber}
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-gray-900">
                                  {beneficiary.bankName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {beneficiary.bankIIN}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                  {beneficiary.stage}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                {parseFloat(beneficiary.expectedAmountInRupees).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========================================================================
// HELPER COMPONENTS
// ========================================================================

const SummaryCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtext: string;
}> = ({ label, value, icon, color, subtext }) => (
  <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-6`}>
    <div className="flex items-start justify-between mb-3">
      <div className="p-2 rounded-lg bg-white">{icon}</div>
    </div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-xs text-gray-500">{subtext}</p>
  </div>
);

const InfoItem: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}> = ({ label, value, mono }) => (
  <div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className={`font-semibold text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
  </div>
);

const StatsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const StatRow: React.FC<{
  label: string;
  value: string;
  highlight?: 'success' | 'error' | 'warning' | 'critical';
}> = ({ label, value, highlight }) => {
  const colorClass =
    highlight === 'success' ? 'text-green-600' :
    highlight === 'error' ? 'text-red-600' :
    highlight === 'critical' ? 'text-red-700 font-bold' :
    highlight === 'warning' ? 'text-yellow-600' :
    'text-gray-900';

  return (
    <div className="flex justify-between items-center">
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
};

const AmountCard: React.FC<{
  label: string;
  amount: string;
  color?: 'green' | 'red';
}> = ({ label, amount, color }) => (
  <div className={`rounded p-3 ${
    color === 'green' ? 'bg-gray-50' :
    color === 'red' ? 'bg-red-50 border border-red-200' :
    'bg-gray-50'
  }`}>
    <p className="text-xs text-gray-600">{label}</p>
    <p className={`text-lg font-bold ${
      color === 'green' ? 'text-green-600' :
      color === 'red' ? 'text-red-600' :
      'text-gray-900'
    }`}>{amount}</p>
  </div>
);

const MetricCard: React.FC<{
  label: string;
  value: string;
  color: string;
}> = ({ label, value, color }) => (
  <div className={`bg-${color}-50 rounded p-4`}>
    <p className="text-xs text-gray-600">{label}</p>
    <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
  </div>
);

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-8">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
    <p className="text-gray-600">{message}</p>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-center text-gray-500 py-8">{message}</p>
);

export default ReconciliationDetail;