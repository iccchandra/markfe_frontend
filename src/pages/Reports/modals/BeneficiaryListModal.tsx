// src/pages/Reports/modals/BeneficiaryListModal.tsx

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useFailedBeneficiaries } from '../../../hooks/useApbsFailureReport';

type PaymentStage = 'BL' | 'RL' | 'RC' | 'COMPLETED';

interface BeneficiaryListModalProps {
  startDate: string;
  endDate: string;
  stage?: string; // ✅ Changed to string to accept empty string
  onClose: () => void;
}

export const BeneficiaryListModal: React.FC<BeneficiaryListModalProps> = ({
  startDate,
  endDate,
  stage,
  onClose,
}) => {
  const [page, setPage] = useState(1);
  const limit = 20;

  // ✅ Properly convert stage to valid type
  const validStage: PaymentStage | undefined = 
    stage && stage !== '' ? (stage as PaymentStage) : undefined;

  const { data, loading } = useFailedBeneficiaries({
    startDate,
    endDate,
    stage: validStage,
    page,
    limit,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Failed Beneficiaries
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : data?.beneficiaries && data.beneficiaries.length > 0 ? (
            <div className="space-y-3">
              {data.beneficiaries.map((beneficiary) => (
                <div
                  key={beneficiary.beneficiaryId}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {beneficiary.name}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {beneficiary.stage}
                        </span>
                        {beneficiary.wasResolved ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Beneficiary ID:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {beneficiary.beneficiaryId}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Response Code:</span>
                          <span className="ml-2 font-mono font-medium text-gray-900">
                            {beneficiary.responseCode}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Failure Date:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(beneficiary.failureDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Attempts:</span>
                          <span className="ml-2 font-semibold text-orange-600">
                            {beneficiary.attemptCount}
                          </span>
                        </div>
                      </div>

                      {beneficiary.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-sm text-red-800">
                          {beneficiary.rejectionReason}
                        </div>
                      )}

                      {beneficiary.wasResolved && beneficiary.resolutionDate && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-sm text-green-800">
                          Resolved on {new Date(beneficiary.resolutionDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No failed beneficiaries found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your date range or filters
              </p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {data.pagination.page} of {data.pagination.totalPages} 
              ({data.pagination.total} total beneficiaries)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.pagination.totalPages}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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