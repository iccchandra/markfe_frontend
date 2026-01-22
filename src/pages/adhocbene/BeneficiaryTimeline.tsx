// BeneficiaryTimeline.tsx - SIMPLIFIED VERSION

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Building
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'BATCH_UPLOAD' | 'PENNY_DROP' | 'STAGE_CHANGE' | 'PAYMENT' | 'VERIFICATION' | 'FAILURE' | 'CORRECTION';
  title: string;
  description: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'WARNING';
  stage?: string;
  amount?: number;
  responseCode?: string;
  rejectionReason?: string;
  details?: Record<string, any>;
}

interface BeneficiaryWithTimeline {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  bankName: string;
  currentStage: string;
  stageAmount: number;
  pennyDropStatus: string;
  accountHolderName?: string;
  totalPaidSoFar: number;
  lastPaymentDate?: string;
  failureCount: number;
  correctionCount: number;
  timeline: TimelineEvent[];
}

export const RecoBeneficiaryTimeline: React.FC = () => {
  const { beneficiaryId } = useParams<{ beneficiaryId: string }>();
  const navigate = useNavigate();
  
  const [beneficiary, setBeneficiary] = useState<BeneficiaryWithTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (beneficiaryId) {
      fetchBeneficiaryTimeline();
    }
  }, [beneficiaryId]);

  const fetchBeneficiaryTimeline = async () => {
    try {
      setLoading(true);
      setError(null);

      
      const response = await axios.get(`${API_BASE_URL}/adhoc-beneficiaries/timeline/beneficiaryId=${beneficiaryId}`);
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
      'PENDING': { style: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Pending' },
      'WARNING': { style: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Warning' }
    };
    const { style, label } = config[status] || config['PENDING'];
    return <span className={`px-2 py-1 rounded text-xs font-semibold border ${style}`}>{label}</span>;
  };

  const handleBackNavigation = () => {
    navigate('/beneficiaries');
  };

  const handleExport = () => {
    console.log('Exporting timeline...');
    // Implement export functionality
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

  const totalAmount = 5; // 5L total
  const progressPercentage = (beneficiary.totalPaidSoFar / totalAmount) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
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
              <h1 className="text-3xl font-bold text-gray-900">Beneficiary Timeline</h1>
              <p className="text-gray-600 mt-1">Complete payment history and audit trail</p>
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
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Personal Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5" />
                <h3 className="text-sm font-semibold opacity-90">Beneficiary Details</h3>
              </div>
              <div className="space-y-2">
                <p className="font-mono text-xs opacity-80">{beneficiary.beneficiaryId}</p>
                <p className="font-bold text-xl">{beneficiary.name}</p>
                <p className="text-sm opacity-90">Aadhaar: {beneficiary.aadhaarNumber}</p>
              </div>
            </div>

            {/* Column 2: Bank Info */}
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

            {/* Column 3: Payment Progress */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5" />
                <h3 className="text-sm font-semibold opacity-90">Payment Progress</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-3xl font-bold">
                      ₹{(beneficiary.totalPaidSoFar).toFixed(2)}L
                    </span>
                    <span className="text-sm opacity-80">/ ₹5.00L</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2.5">
                    <div 
                      className="bg-white h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs opacity-80 mt-1">{progressPercentage.toFixed(1)}% Complete</p>
                </div>
                
                {/* Stage Badge */}
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <p className="text-xs opacity-80 mb-1">Current Stage</p>
                  <p className="font-bold text-lg">{beneficiary.currentStage}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-6 pt-6 border-t border-white/20 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">
                Penny Drop: <strong>{beneficiary.pennyDropStatus}</strong>
              </span>
            </div>
            {beneficiary.failureCount > 0 && (
              <div className="flex items-center gap-2 bg-red-500/30 px-3 py-1 rounded-full">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-semibold">{beneficiary.failureCount} Failure(s)</span>
              </div>
            )}
            {beneficiary.correctionCount > 0 && (
              <div className="flex items-center gap-2 bg-yellow-500/30 px-3 py-1 rounded-full">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-semibold">{beneficiary.correctionCount} Correction(s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Complete Timeline</h2>
              <p className="text-sm text-gray-600">Chronological history of all events</p>
            </div>
          </div>
          
          <div className="relative">
            {/* Timeline Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Timeline Events */}
            <div className="space-y-6">
              {beneficiary.timeline.map((event, index) => {
                const { icon, color } = getEventIcon(event.type);
                return (
                  <div key={event.id} className="relative pl-20">
                    {/* Icon Circle */}
                    <div className={`absolute left-0 top-0 w-16 h-16 rounded-full ${color} flex items-center justify-center shadow-md border-4 border-white z-10`}>
                      {icon}
                    </div>
                    
                    {/* Event Content Card */}
                    <div className={`bg-gray-50 rounded-lg p-5 border-2 transition-all hover:shadow-md ${
                      event.status === 'SUCCESS' ? 'border-green-200 hover:border-green-300' :
                      event.status === 'FAILED' ? 'border-red-200 hover:border-red-300' :
                      event.status === 'PENDING' ? 'border-orange-200 hover:border-orange-300' :
                      'border-yellow-200 hover:border-yellow-300'
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="text-xs text-gray-500 font-medium">
                            {new Date(event.date).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(event.date).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Metadata Row */}
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
                            <span className="font-bold text-green-600">₹{(event.amount / 100000).toFixed(2)}L</span>
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
                      
                      {/* Additional Details */}
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Additional Information:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(event.details).map(([key, value]) => {
                              if (!value || value === 'null' || value === 'undefined') return null;
                              return (
                                <div key={key} className="bg-white rounded px-3 py-2 border border-gray-200">
                                  <span className="text-xs text-gray-600 block mb-0.5">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Rejection Reason for Failures */}
                      {event.status === 'FAILED' && event.rejectionReason && (
                        <div className="mt-4 pt-4 border-t border-red-200 bg-red-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-900">{event.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Timeline Events */}
            {beneficiary.timeline.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No timeline events found</p>
                <p className="text-gray-400 text-sm mt-1">Timeline will appear as events occur</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Events</h3>
            <p className="text-4xl font-bold text-indigo-600">{beneficiary.timeline.length}</p>
            <p className="text-xs text-gray-600 mt-1">Audit trail entries</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Payments</h3>
            <p className="text-4xl font-bold text-green-600">
              {beneficiary.timeline.filter(e => e.type === 'PAYMENT' && e.status === 'SUCCESS').length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Successful payments</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Failures</h3>
            <p className="text-4xl font-bold text-red-600">{beneficiary.failureCount}</p>
            <p className="text-xs text-gray-600 mt-1">Payment failures</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Last Updated</h3>
            <p className="text-lg font-bold text-gray-900">
              {beneficiary.lastPaymentDate 
                ? new Date(beneficiary.lastPaymentDate).toLocaleDateString('en-IN')
                : 'N/A'}
            </p>
            <p className="text-xs text-gray-600 mt-1">Most recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoBeneficiaryTimeline;