// BeneficiaryTimeline.tsx - Adapted for pay_records_integrated table

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Download,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  User,
  CreditCard,
  Building,
  MapPin,
  Clock
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3002';

// Interfaces
interface TimelineEvent {
  id: string;
  date: string;
  type: 'PAYMENT' | 'PENNY_DROP' | 'FAILURE';
  title: string;
  description: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paymentMode: 'AADHAAR';
  stage?: string;
  amount?: number;
  responseCode?: string;
  rejectionReason?: string;
  details?: Record<string, any>;
}

interface PaymentHistory {
  stage: string;
  stageName: string;
  records: Array<{
    recordId: string;
    uploadedAmount: number;
    paidAmount: number;
    status: string;
    responseCode: string;
    rejectionReason?: string;
    uploadDate: string;
    paymentDate?: string;
  }>;
  totalAmount: number;
  paidAmount: number;
  successCount: number;
  failureCount: number;
}

interface BeneficiaryData {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  bankName: string;
  bankIIN: string;
  paymentMode: 'AADHAAR';
  
  aadhaarPayment: {
    currentStage: string;
    stages: string[];
    totalTransactions: number;
    successCount: number;
    failureCount: number;
    pendingCount: number;
    totalDisbursed: number;
    totalPaidSoFar: number;
    pennyDropStatus: string;
    accountHolderName?: string;
    lastPaymentDate?: string;
    rejectionReason?: string;
    responseCode?: string;
  };
  
  totalAmount: number;
  totalPaid: number;
  failedAmount: number;
  
  timeline: TimelineEvent[];
  paymentHistory: PaymentHistory[];
}

export const BeneficiaryTimeline: React.FC = () => {
  const [searchParams] = useSearchParams();
  const beneficiaryId = searchParams.get('beneficiaryId');
  const navigate = useNavigate();
  
  const [beneficiary, setBeneficiary] = useState<BeneficiaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'history'>('timeline');

  useEffect(() => {
    if (beneficiaryId) {
      fetchBeneficiaryTimeline();
    } else {
      setError('Beneficiary ID is missing');
      setLoading(false);
    }
  }, [beneficiaryId]);

  const fetchBeneficiaryTimeline = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/payreports/pay-records/beneficiary-timeline`,
        {
          params: { beneficiaryId }
        }
      );
      setBeneficiary(response.data);
    } catch (err: any) {
      console.error('Failed to fetch beneficiary timeline:', err);
      setError(err.response?.data?.message || 'Failed to load beneficiary data');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string): { icon: React.ReactNode; color: string } => {
    const config: Record<string, { icon: React.ReactNode; color: string }> = {
      'PENNY_DROP': { icon: <DollarSign className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
      'PAYMENT': { icon: <DollarSign className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
      'FAILURE': { icon: <XCircle className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
    };
    return config[type] || config['PAYMENT'];
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { style: string; label: string }> = {
      'SUCCESS': { style: 'bg-green-100 text-green-800 border-green-300', label: 'Success' },
      'FAILED': { style: 'bg-red-100 text-red-800 border-red-300', label: 'Failed' },
      'PENDING': { style: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
    };
    const { style, label } = config[status] || config['PENDING'];
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>{label}</span>;
  };

  const getStageBadge = (stage: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-bold';
    const stageColors: Record<string, string> = {
      BL: 'bg-blue-200 text-blue-800',
      RL: 'bg-purple-200 text-purple-800',
      RC: 'bg-orange-200 text-orange-800',
      COMPLETED: 'bg-green-200 text-green-800',
    };

    return (
      <span className={`${baseClasses} ${stageColors[stage] || 'bg-gray-200 text-gray-800'}`}>
        {stage}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '₹0';
    if (amount === 1 || amount === 0.01) return '₹1'; // Penny drop
    if (amount < 1) return `${Math.round(amount * 100)} paisa`;
    
    // For amounts in Lakhs
    if (amount < 100) {
      return `₹${amount.toFixed(2)}L`;
    }
    
    // For larger amounts
    const crores = amount / 100;
    return `₹${crores.toFixed(2)} Cr`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleBackNavigation = () => {
    navigate(-1); // Go back to previous page
  };

  const handleExport = () => {
    console.log('Exporting timeline...');
    // TODO: Implement PDF export
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error || !beneficiary) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Beneficiary Not Found</h2>
          <p className="text-red-600 mb-4">{error || 'Unable to load beneficiary data'}</p>
          <button
            onClick={handleBackNavigation}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = beneficiary.totalAmount > 0 
    ? (beneficiary.totalPaid / beneficiary.totalAmount) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackNavigation}
              className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Timeline</h1>
              <p className="text-gray-600 mt-1">Complete payment history for beneficiary</p>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        {/* Beneficiary Info Card */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          {/* Payment Mode Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white font-semibold">
              <CreditCard className="w-4 h-4" />
              Aadhaar Payment System (APBS)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5" />
                <h3 className="text-sm font-semibold opacity-90">Personal Details</h3>
              </div>
              <div className="space-y-2">
                <p className="font-mono text-xs opacity-80">{beneficiary.beneficiaryId}</p>
                <p className="font-bold text-xl">{beneficiary.name}</p>
                <p className="text-sm opacity-90">{beneficiary.aadhaarNumber}</p>
              </div>
            </div>

            {/* Bank Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-5 h-5" />
                <h3 className="text-sm font-semibold opacity-90">Bank Details</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 opacity-80" />
                  <p className="font-mono text-sm">{beneficiary.accountNumber}</p>
                </div>
                <p className="text-sm opacity-90">{beneficiary.bankName}</p>
                
                {/* Verified Name */}
                {beneficiary.aadhaarPayment?.accountHolderName && (
                  <div className="mt-2 bg-white/20 rounded px-3 py-2">
                    <p className="text-xs opacity-80">Verified Name</p>
                    <p className="font-semibold">{beneficiary.aadhaarPayment.accountHolderName}</p>
                  </div>
                )}
                
                {/* Penny Drop Status */}
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    beneficiary.aadhaarPayment.pennyDropStatus === 'SUCCESS'
                      ? 'bg-green-500/30'
                      : 'bg-red-500/30'
                  }`}>
                    Penny Drop: {beneficiary.aadhaarPayment.pennyDropStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5" />
                <h3 className="text-sm font-semibold opacity-90">Payment Summary</h3>
              </div>
              <div className="space-y-3">
                {/* Current Stage */}
                <div className="bg-blue-500/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Current Stage</span>
                  </div>
                  <p className="font-bold text-lg">{beneficiary.aadhaarPayment.currentStage}</p>
                  <p className="text-xs opacity-75">
                    Stages: {beneficiary.aadhaarPayment.stages.join(', ')}
                  </p>
                </div>
                
                {/* Total Progress */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-bold">
                      {formatCurrency(beneficiary.totalPaid)}
                    </span>
                    <span className="text-sm opacity-80">
                      / {formatCurrency(beneficiary.totalAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2.5">
                    <div 
                      className="bg-white h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs opacity-80 mt-1">{progressPercentage.toFixed(1)}% Complete</p>
                </div>

                {/* Transaction Stats */}
                <div className="bg-white/20 rounded px-3 py-2 text-xs">
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <span className="font-bold">{beneficiary.aadhaarPayment.successCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="font-bold text-red-300">{beneficiary.aadhaarPayment.failureCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-bold text-yellow-300">{beneficiary.aadhaarPayment.pendingCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline ({beneficiary.timeline.length})
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Payment History ({beneficiary.paymentHistory.length})
            </div>
          </button>
        </div>

        {/* Timeline Content */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Timeline</h2>
                <p className="text-sm text-gray-600">Chronological payment history</p>
              </div>
            </div>
            
            <div className="relative">
              {/* Timeline Vertical Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline Events */}
              <div className="space-y-6">
                {beneficiary.timeline.map((event) => {
                  const { icon, color } = getEventIcon(event.type);
                  const isPennyDrop = event.type === 'PENNY_DROP';
                  
                  return (
                    <div key={event.id} className="relative pl-20">
                      {/* Icon Circle */}
                      <div className={`absolute left-0 top-0 w-16 h-16 rounded-full ${color} flex items-center justify-center shadow-md border-4 border-white z-10`}>
                        {icon}
                      </div>
                      
                      {/* Event Content Card */}
                      <div className={`rounded-lg p-5 border-2 transition-all hover:shadow-md ${
                        event.status === 'SUCCESS'
                          ? 'bg-green-50 border-green-200 hover:border-green-300'
                          : event.status === 'FAILED'
                          ? 'bg-red-50 border-red-200 hover:border-red-300'
                          : 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'
                      }`}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusBadge(event.status)}
                              {isPennyDrop && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                  Penny Drop
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{event.title}</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xs text-gray-500 font-medium">{formatDate(event.date)}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatTime(event.date)}</p>
                          </div>
                        </div>
                        
                        {/* Metadata */}
                        {(event.stage || event.amount || event.responseCode) && (
                          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                            {event.stage && (
                              <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Stage:</span>
                                {getStageBadge(event.stage)}
                              </div>
                            )}
                            {event.amount && (
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-bold text-green-600">
                                  {formatCurrency(event.amount)}
                                </span>
                              </div>
                            )}
                            {event.responseCode && (
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Code:</span>
                                <span className="font-mono font-semibold text-gray-900">{event.responseCode}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {event.status === 'FAILED' && event.rejectionReason && (
                          <div className="mt-4 pt-4 border-t border-red-200 bg-red-50 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-red-700 mb-1">Failure Reason:</p>
                                <p className="text-sm text-red-900">{event.rejectionReason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {beneficiary.timeline.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No timeline events found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment History by Stage</h2>
                <p className="text-sm text-gray-600">Grouped by payment stages</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {beneficiary.paymentHistory.map((stage) => (
                <div key={stage.stage} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Stage Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStageBadge(stage.stage)}
                        <h3 className="font-bold text-gray-900">{stage.stageName}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total: {formatCurrency(stage.totalAmount)}</p>
                        <p className="text-sm text-gray-600">Paid: {formatCurrency(stage.paidAmount)}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-green-600">✓ {stage.successCount} Success</span>
                      <span className="text-red-600">✗ {stage.failureCount} Failed</span>
                    </div>
                  </div>

                  {/* Payment Records */}
                  <div className="divide-y divide-gray-200">
                    {stage.records.map((record, index) => (
                      <div key={record.recordId} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusBadge(record.status)}
                              <span className="text-xs text-gray-500">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-600">Uploaded</p>
                                <p className="font-semibold">{formatCurrency(record.uploadedAmount)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Paid</p>
                                <p className="font-semibold text-green-600">{formatCurrency(record.paidAmount)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Upload Date</p>
                                <p>{formatDate(record.uploadDate)}</p>
                              </div>
                              {record.paymentDate && (
                                <div>
                                  <p className="text-xs text-gray-600">Payment Date</p>
                                  <p>{formatDate(record.paymentDate)}</p>
                                </div>
                              )}
                            </div>
                            {record.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                                <p className="text-xs text-red-700">
                                  <strong>Reason:</strong> {record.rejectionReason}
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                  <strong>Code:</strong> {record.responseCode}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {beneficiary.paymentHistory.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No payment history found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Events</h3>
            <p className="text-4xl font-bold text-indigo-600">{beneficiary.timeline.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Amount</h3>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(beneficiary.totalAmount)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Paid</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(beneficiary.totalPaid)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Failed</h3>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(beneficiary.failedAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryTimeline;