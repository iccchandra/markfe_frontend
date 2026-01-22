// BeneficiaryTimeline.tsx - Supports both batch-scoped and global views

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  RefreshCw
} from 'lucide-react';
import { Beneficiary, TimelineEvent, TimelineEventType, TimelineEventStatus, PennyDropStatus, BeneficiaryStage, RejectionStatus } from '../../types';

export const BeneficiaryTimeline: React.FC = () => {
  const { batchId, beneficiaryId } = useParams<{ batchId: string; beneficiaryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine context
  const isBatchContext = !!batchId;
  const isGlobalContext = !batchId && location.pathname.startsWith('/beneficiaries');
  
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeneficiaryTimeline();
  }, [batchId, beneficiaryId]);

  const fetchBeneficiaryTimeline = async () => {
    try {
      setLoading(true);
      
      // In production:
      // if (isBatchContext) {
      //   const response = await fetch(`/api/batches/${batchId}/beneficiaries/${beneficiaryId}`);
      // } else {
      //   const response = await fetch(`/api/beneficiaries/${beneficiaryId}`);
      // }
      
      const mockBeneficiary: Beneficiary = {
          id: beneficiaryId!,
          beneficiaryId: 'BEN000001',
          name: 'Ramesh Kumar Singh',
          aadhaarNumber: '6297****0065',
          accountNumber: '052110118493',
          ifscCode: 'IPOST0000001',
          bankName: 'India Post Payments Bank',
          phoneNumber: '9876543210',
          address: 'H.No 12-34, Village Rampur, Mandal Serilingampally',
          village: 'Rampur',
          mandal: 'Serilingampally',
          district: 'Hyderabad',
          currentStage: BeneficiaryStage.RL,
          stageAmount: 100000,
          pennyDropStatus: PennyDropStatus.VERIFIED,
          pennyDropDate: '2025-01-15',
          accountHolderName: 'RAMESH KUMAR SINGH',
          pennyDropError: null,
          totalPaidSoFar: 100000,
          lastPaymentDate: '2025-01-20',
          failureCount: 0,
          correctionCount: 0,
          timeline: [
              {
                  id: 't1',
                  date: '2025-01-15T10:30:00Z',
                  type: 'BATCH_UPLOAD',
                  batchId: batchId || 'BATCH20250115001',
                  title: 'Uploaded to System',
                  description: 'Beneficiary data uploaded in batch',
                  status: 'SUCCESS',
                  details: { uploadedBy: 'admin@indiramma.gov', recordCount: 450000 }
              },
              {
                  id: 't2',
                  date: '2025-01-15T11:45:00Z',
                  type: 'PENNY_DROP',
                  batchId: batchId || 'BATCH20250115001',
                  title: 'Penny Drop Verification',
                  description: 'Account verified successfully. Name matched with bank records.',
                  status: 'SUCCESS',
                  details: { accountHolderName: 'RAMESH KUMAR SINGH', matchScore: 100 }
              },
              {
                  id: 't3',
                  date: '2025-01-16T09:00:00Z',
                  type: 'STAGE_CHANGE',
                  stage: 'BL',
                  batchId: batchId || 'BATCH20250115001',
                  title: 'Moved to BL Stage',
                  description: 'Work Stage 1 (BL) initiated - Initial validation',
                  status: 'SUCCESS'
              },
              {
                  id: 't4',
                  date: '2025-01-18T14:30:00Z',
                  type: 'PAYMENT',
                  stage: 'BL',
                  batchId: batchId || 'BATCH20250115001',
                  title: 'Payment Processed - BL Stage',
                  description: 'Payment of ₹1,00,000 processed successfully',
                  status: 'SUCCESS',
                  amount: 100000,
                  details: { transactionId: 'TXN001234567', bankReference: 'NPCI987654321' }
              },
              {
                  id: 't5',
                  date: '2025-01-20T10:15:00Z',
                  type: 'VERIFICATION',
                  stage: 'BL',
                  batchId: batchId || 'BATCH20250115001',
                  title: 'Payment Verified',
                  description: 'Bank confirmed payment credit to beneficiary account',
                  status: 'SUCCESS',
                  details: { verifiedBy: 'Bank Reconciliation System' }
              },
              {
                  id: 't6',
                  date: '2025-01-22T11:00:00Z',
                  type: 'STAGE_CHANGE',
                  stage: 'RL',
                  batchId: batchId || 'BATCH20250115001',
                  title: 'Moved to RL Stage',
                  description: 'Work Stage 2 (RL) initiated - Work release',
                  status: 'SUCCESS'
              }
          ],
          aadhaar: '',
          bankAccount: '',
          amount: 0,
          housingPhase: 'G4',
          stagePayments: [],
          rejectionStatus: RejectionStatus.PENDING,
          retryCount: 0,
          batchId: batchId || 'BATCH20250115001',
          createdAt: '',
          updatedAt: ''
      };

      setBeneficiary(mockBeneficiary);
    } catch (error) {
      console.error('Failed to fetch beneficiary timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: TimelineEventType): { icon: React.ReactNode; color: string } => {
    const config: Record<TimelineEventType, { icon: React.ReactNode; color: string }> = {
      'BATCH_UPLOAD': { icon: <Upload className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
      'PENNY_DROP': { icon: <DollarSign className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
      'STAGE_CHANGE': { icon: <TrendingUp className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600' },
      'PAYMENT': { icon: <DollarSign className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
      'VERIFICATION': { icon: <CheckCircle className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600' },
      'FAILURE': { icon: <XCircle className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
      'CORRECTION': { icon: <RefreshCw className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' }
    };
    return config[type];
  };

  const getStatusBadge = (status: TimelineEventStatus) => {
    const config: Record<TimelineEventStatus, { style: string; label: string }> = {
      'SUCCESS': { style: 'bg-green-100 text-green-800 border-green-300', label: 'Success' },
      'FAILED': { style: 'bg-red-100 text-red-800 border-red-300', label: 'Failed' },
      'PENDING': { style: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Pending' },
      'WARNING': { style: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Warning' }
    };
    const { style, label } = config[status];
    return <span className={`px-2 py-1 rounded text-xs font-semibold border ${style}`}>{label}</span>;
  };

  // Context-aware back navigation
  const handleBackNavigation = () => {
    if (isBatchContext) {
      // Go back to batch beneficiary list
      navigate(`/batches/${batchId}/beneficiaries`);
    } else {
      // Go back to global beneficiary list
      navigate('/beneficiaries');
    }
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

  if (!beneficiary) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Beneficiary not found</p>
          <button
            onClick={handleBackNavigation}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

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
              <p className="text-gray-600 mt-1">
                {isBatchContext ? (
                  <>Complete audit trail for Batch: {beneficiary.batchId}</>
                ) : (
                  <>Complete audit trail and payment history</>
                )}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export Timeline
          </button>
        </div>

        {/* Beneficiary Summary Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-sm border-2 border-indigo-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Beneficiary Details</h3>
              <div className="space-y-1">
                <p className="font-mono text-xs text-indigo-600 font-semibold">{beneficiary.beneficiaryId}</p>
                <p className="font-bold text-lg text-gray-900">{beneficiary.name}</p>
                <p className="text-sm text-gray-600">Aadhaar: {beneficiary.aadhaarNumber}</p>
                <p className="text-sm text-gray-600">Phone: {beneficiary.phoneNumber}</p>
                <p className="text-sm text-gray-600">{beneficiary.village}, {beneficiary.district}</p>
                {isGlobalContext && (
                  <p className="text-sm text-blue-600 font-semibold mt-2">Batch: {beneficiary.batchId}</p>
                )}
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Bank Details</h3>
              <div className="space-y-1">
                <p className="font-mono text-sm font-semibold text-gray-900">{beneficiary.accountNumber}</p>
                <p className="text-sm text-gray-600">IFSC: {beneficiary.ifscCode}</p>
                <p className="text-sm text-gray-600">{beneficiary.bankName}</p>
                {beneficiary.accountHolderName && (
                  <div className="mt-2">
                    <p className="text-sm text-green-700 font-medium">✓ {beneficiary.accountHolderName}</p>
                    <p className="text-xs text-green-600">Account Verified</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Status */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Status</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-600">Work Stage:</span>
                  <div className="mt-1">
                    {(() => {
                      const stageConfig = {
                        'BL': { style: 'bg-blue-100 text-blue-800', label: 'BL Stage' },
                        'RL': { style: 'bg-yellow-100 text-yellow-800', label: 'RL Stage' },
                        'RC': { style: 'bg-purple-100 text-purple-800', label: 'RC Stage' },
                        'COMPLETED': { style: 'bg-green-100 text-green-800', label: 'Completed' }
                      };
                      const { style, label } = stageConfig[beneficiary.currentStage];
                      return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>{label}</span>;
                    })()}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Total Paid:</span>
                  <p className="text-2xl font-bold text-green-600">₹{(beneficiary.totalPaidSoFar / 100000).toFixed(0)}L</p>
                  <p className="text-xs text-gray-600">out of ₹5L total</p>
                </div>
                {beneficiary.failureCount > 0 && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-semibold">{beneficiary.failureCount} Failure(s)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Complete Timeline & Audit Trail
          </h2>
          
          <div className="relative">
            {/* Timeline Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Timeline Events */}
            <div className="space-y-8">
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
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="text-xs text-gray-500 font-medium">
                            {new Date(event.date).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Batch:</span>
                          <span className="font-mono font-semibold text-indigo-600">{event.batchId}</span>
                        </div>
                        {event.stage && (
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Stage:</span>
                            <span className="font-semibold text-gray-900">{event.stage}</span>
                          </div>
                        )}
                        {event.amount && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-bold text-green-600">₹{(event.amount / 100000).toFixed(0)}L</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Additional Details */}
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Additional Information:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(event.details).map(([key, value]) => (
                              <div key={key} className="bg-white rounded px-3 py-2 border border-gray-200">
                                <span className="text-xs text-gray-600 block mb-0.5">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                </span>
                                <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Events</h3>
            <p className="text-4xl font-bold text-indigo-600">{beneficiary.timeline.length}</p>
            <p className="text-xs text-gray-600 mt-1">Audit trail entries</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Events</h3>
            <p className="text-4xl font-bold text-green-600">
              {beneficiary.timeline.filter(e => e.type === 'PAYMENT').length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Successful payments</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Failure Count</h3>
            <p className="text-4xl font-bold text-red-600">{beneficiary.failureCount}</p>
            <p className="text-xs text-gray-600 mt-1">Issues encountered</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryTimeline;