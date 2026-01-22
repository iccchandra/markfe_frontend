// src/pages/Reports/components/BeneficiaryDetailsDrawer.tsx

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  Building,
  Hash,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { apbsFailureReportApi } from '../../services/apbs-failure-report.api';

interface BeneficiaryDetailsDrawerProps {
  beneficiaryId: string;
  onClose: () => void;
}

export const BeneficiaryDetailsDrawer: React.FC<BeneficiaryDetailsDrawerProps> = ({
  beneficiaryId,
  onClose,
}) => {
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // This would be a new API endpoint to get single beneficiary details
        // For now, we'll use the list endpoint with a filter
        const response = await apbsFailureReportApi.getFailedBeneficiaries({
          startDate: '2024-01-01',
          endDate: new Date().toISOString().split('T')[0],
          page: 1,
          limit: 1,
        });
        
        // In a real scenario, you'd have a dedicated endpoint
        const found = response.beneficiaries.find(
          (b) => b.beneficiaryId === beneficiaryId
        );
        setBeneficiary(found);
      } catch (error) {
        console.error('Error fetching beneficiary details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [beneficiaryId]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Beneficiary Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : beneficiary ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${beneficiary.wasResolved ? 'bg-green-100' : 'bg-red-100'}`}>
                    {beneficiary.wasResolved ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {beneficiary.wasResolved ? 'Resolved' : 'Pending Resolution'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {beneficiary.attemptCount} attempt{beneficiary.attemptCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {beneficiary.stage}
                </span>
              </div>

              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Basic Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900 text-right">
                      {beneficiary.name}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600">Beneficiary ID:</span>
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {beneficiary.beneficiaryId}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600">Stage:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {beneficiary.stage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Failure Details */}
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Failure Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-red-700">Response Code:</span>
                    <span className="text-sm font-mono font-bold text-red-900">
                      {beneficiary.responseCode}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-red-700">First Failure:</span>
                    <span className="text-sm font-medium text-red-900">
                      {new Date(beneficiary.failureDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-red-700">Last Attempt:</span>
                    <span className="text-sm font-medium text-red-900">
                      {new Date(beneficiary.lastAttemptDate).toLocaleString()}
                    </span>
                  </div>
                  {beneficiary.rejectionReason && (
                    <div className="pt-2 border-t border-red-200">
                      <span className="text-sm text-red-700 block mb-1">Rejection Reason:</span>
                      <p className="text-sm text-red-900 bg-white p-2 rounded border border-red-200">
                        {beneficiary.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Details */}
              {beneficiary.wasResolved && beneficiary.resolutionDate && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Resolution Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-green-700">Resolved On:</span>
                      <span className="text-sm font-medium text-green-900">
                        {new Date(beneficiary.resolutionDate).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-green-700">Days to Resolution:</span>
                      <span className="text-sm font-medium text-green-900">
                        {Math.ceil(
                          (new Date(beneficiary.resolutionDate).getTime() -
                            new Date(beneficiary.failureDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Attempt History */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Attempt Summary
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">
                      {beneficiary.attemptCount}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Total Attempts</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border border-gray-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.ceil(
                        (new Date(beneficiary.lastAttemptDate).getTime() -
                          new Date(beneficiary.failureDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Days Active</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Beneficiary not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};