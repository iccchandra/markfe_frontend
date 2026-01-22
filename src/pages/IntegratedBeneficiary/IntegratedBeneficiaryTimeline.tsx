// IntegratedBeneficiaryTimeline.tsx - UPDATED FOR NEW BACKEND
// ✅ Updated to use APBS/BANK/IOB payment modes
// ✅ Updated to use flattened beneficiary structure
// ✅ Fixed all field name mappings

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
  Clock,
  AlertTriangle,
  Upload,
  RefreshCw,
  User,
  CreditCard,
  Building,
  Building2,
  MapPin
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3002';

// ============================================================================
// INTERFACES - UPDATED
// ============================================================================

interface TimelineEvent {
  id: string;
  date: string;
  type: 'BATCH_UPLOAD' | 'PENNY_DROP' | 'STAGE_CHANGE' | 'PAYMENT' | 'VERIFICATION' | 'FAILURE' | 'CORRECTION';
  title: string;
  description: string;
  status: 'SUCCESS' | 'FAILED';
  paymentMode: 'APBS' | 'BANK' | 'IOB';
  stage?: string;
  amount?: number;
  responseCode?: string;
  rejectionReason?: string;
  details?: Record<string, any>;
}

interface PaymentHistoryItem {
  recordId: string;
  stage: string;
  stageName: string;
  uploadedAmount: number;
  paidAmount: number;
  status: string;
  responseCode: string;
  rejectionReason?: string;
  uploadDate: string;
  paymentDate?: string;
  paymentMode: 'APBS' | 'BANK' | 'IOB';
}

interface IntegratedBeneficiaryWithTimeline {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  bankName: string;
  bankIIN: string;
  paymentMode: 'APBS' | 'BANK' | 'IOB';
  
  // Flattened structure
  currentStage: string;
  stageAmount: number;
  verificationCost: number;
  totalDisbursed: number;
  totalPaidSoFar: number;
  pennyDropStatus: string;
  accountHolderName?: string;
  lastPaymentDate?: string;
  failureCount: number;
  rejectionReason?: string;
  responseCode?: string;
  
  totalAmount: number;
  totalPaid: number;
  failedAmount: number;
  
  timeline: TimelineEvent[];
  paymentHistory: PaymentHistoryItem[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const IntegratedBeneficiaryTimeline: React.FC = () => {
  const [searchParams] = useSearchParams();
  const beneficiaryId = searchParams.get('id');
  const navigate = useNavigate();
  
  const [beneficiary, setBeneficiary] = useState<IntegratedBeneficiaryWithTimeline | null>(null);
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
        `${API_BASE_URL}/integrated-beneficiaries/timeline`,
        {
          params: { id: beneficiaryId }
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
      'BATCH_UPLOAD': { icon: <Upload className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
      'PENNY_DROP': { icon: <DollarSign className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
      'STAGE_CHANGE': { icon: <TrendingUp className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600' },
      'PAYMENT': { icon: <DollarSign className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
      'VERIFICATION': { icon: <CheckCircle className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600' },
      'FAILURE': { icon: <XCircle className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
      'CORRECTION': { icon: <RefreshCw className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' }
    };
    return config[type] || config['BATCH_UPLOAD'];
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { style: string; label: string }> = {
      'SUCCESS': { style: 'bg-green-100 text-green-800 border-green-300', label: 'Success' },
      'FAILED': { style: 'bg-red-100 text-red-800 border-red-300', label: 'Failed' },
    };
    const { style, label } = config[status] || config['FAILED'];
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>{label}</span>;
  };

  const getPaymentModeBadge = (mode: string) => {
    if (mode === 'APBS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-300">
          <CreditCard className="w-3 h-3" />
          APBS Payment
        </span>
      );
    } else if (mode === 'BANK') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-300">
          <Building2 className="w-3 h-3" />
          Bank Transfer
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold border border-purple-300">
          <TrendingUp className="w-3 h-3" />
          IOB Payment
        </span>
      );
    }
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
    navigate('/IntegratedBeneficiaryList');
  };

  const handleExport = () => {
    console.log('Exporting integrated timeline...');
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
            Back to Beneficiaries
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
              <h1 className="text-3xl font-bold text-gray-900">🔄 Payment Timeline</h1>
              <p className="text-gray-600 mt-1">Complete payment history</p>
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
            {beneficiary.paymentMode === 'APBS' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white font-semibold">
                <CreditCard className="w-4 h-4" />
                APBS Payment System
              </span>
            )}
            {beneficiary.paymentMode === 'BANK' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white font-semibold">
                <Building2 className="w-4 h-4" />
                Bank Transfer System
              </span>
            )}
            {beneficiary.paymentMode === 'IOB' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white font-semibold">
                <RefreshCw className="w-4 h-4" />
                IOB Payment System
              </span>
            )}
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
                
                {beneficiary.accountHolderName && (
                  <div className="mt-2 bg-white/20 rounded px-3 py-2">
                    <p className="text-xs opacity-80">Verified Name</p>
                    <p className="font-semibold">{beneficiary.accountHolderName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5" />
                <h3 className="text-sm font-semibold opacity-90">Payment Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-blue-500/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs opacity-80 mb-1">
                    <span>Total Paid</span>
                  </div>
                  <p className="font-bold text-lg">
                    ₹{beneficiary.totalPaidSoFar.toFixed(2)}L
                  </p>
                  <p className="text-xs opacity-75">
                    of ₹{beneficiary.stageAmount.toFixed(2)}L
                  </p>
                </div>
                
                {/* Total Progress */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-bold">
                      ₹{beneficiary.totalPaid.toFixed(2)}L
                    </span>
                    <span className="text-sm opacity-80">
                      / ₹{beneficiary.totalAmount.toFixed(2)}L
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
                <h2 className="text-xl font-bold text-gray-900">Complete Timeline</h2>
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
                  return (
                    <div key={event.id} className="relative pl-20">
                      {/* Icon Circle */}
                      <div className={`absolute left-0 top-0 w-16 h-16 rounded-full ${color} flex items-center justify-center shadow-md border-4 border-white z-10`}>
                        {icon}
                      </div>
                      
                      {/* Event Content Card */}
                      <div className={`rounded-lg p-5 border-2 transition-all hover:shadow-md ${
                        event.paymentMode === 'APBS' 
                          ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                          : event.paymentMode === 'BANK'
                          ? 'bg-green-50 border-green-200 hover:border-green-300'
                          : 'bg-purple-50 border-purple-200 hover:border-purple-300'
                      }`}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              {getPaymentModeBadge(event.paymentMode)}
                              {getStatusBadge(event.status)}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{event.title}</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
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
                                <span className="font-semibold text-indigo-600">{event.stage}</span>
                              </div>
                            )}
                            {event.amount && (
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-bold text-green-600">
                                  ₹{event.amount.toFixed(2)}{event.type !== 'PENNY_DROP' ? 'L' : ''}
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
                        
                        {/* Details */}
                        {event.details && Object.keys(event.details).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Additional Details:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Object.entries(event.details).map(([key, value]) => {
                                if (!value || value === 'null') return null;
                                return (
                                  <div key={key} className="bg-white rounded px-3 py-2 border border-gray-200">
                                    <span className="text-xs text-gray-600 block mb-0.5 capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {String(value)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
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
                                {event.responseCode && (
                                  <p className="text-xs text-red-700 mt-1">
                                    Response Code: <span className="font-mono">{event.responseCode}</span>
                                  </p>
                                )}
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
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
                <p className="text-sm text-gray-600">All payment records</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {beneficiary.paymentHistory.map((payment) => (
                <div key={payment.recordId} className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-bold">
                          {payment.stageName}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          payment.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                        {getPaymentModeBadge(payment.paymentMode)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Uploaded Amount</p>
                          <p className="font-bold text-blue-700">₹{payment.uploadedAmount.toFixed(2)}L</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Paid Amount</p>
                          <p className="font-bold text-green-700">₹{payment.paidAmount.toFixed(2)}L</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Upload Date</p>
                          <p className="text-sm text-gray-900">{formatDate(payment.uploadDate)}</p>
                        </div>
                        {payment.paymentDate && (
                          <div>
                            <p className="text-xs text-gray-600">Payment Date</p>
                            <p className="text-sm text-gray-900">{formatDate(payment.paymentDate)}</p>
                          </div>
                        )}
                      </div>
                      {payment.rejectionReason && (
                        <div className="mt-3 p-2 bg-red-100 rounded border border-red-200">
                          <p className="text-xs text-red-700 font-medium">
                            <strong>Reason:</strong> {payment.rejectionReason}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            <strong>Code:</strong> {payment.responseCode}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {beneficiary.paymentHistory.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No payment records</p>
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
            <p className="text-3xl font-bold text-gray-900">₹{beneficiary.totalAmount.toFixed(2)}L</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Paid</h3>
            <p className="text-3xl font-bold text-green-600">₹{beneficiary.totalPaid.toFixed(2)}L</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Failed</h3>
            <p className="text-3xl font-bold text-red-600">₹{beneficiary.failedAmount.toFixed(2)}L</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedBeneficiaryTimeline;