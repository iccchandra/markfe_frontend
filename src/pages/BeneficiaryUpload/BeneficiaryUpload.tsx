// Example React Component for Excel Upload with Progress Tracking
// File: BeneficiaryUpload.tsx

import React, { useState, useEffect } from 'react';

interface UploadProgress {
  type: 'progress' | 'complete' | 'error';
  totalRows?: number;
  processedRows?: number;
  successfulRows?: number;
  failedRows?: number;
  currentBatch?: number;
  totalBatches?: number;
  percentage?: number;
  errors?: Array<{ row: number; error: string }>;
  duration?: number;
  message?: string;
  error?: string;
}

export const BeneficiaryUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setProgress(null);
    }
  };

  const uploadWithProgress = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Start the upload
      const response = await fetch(
        'http://localhost:3000/accountpay-beneficiaries/upload-excel-async',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      const uploadSessionId = data.sessionId;
      setSessionId(uploadSessionId);

      // Connect to SSE endpoint for progress updates
      const eventSource = new EventSource(
        `http://localhost:3000/accountpay-beneficiaries/upload-progress/${uploadSessionId}`
      );

      eventSource.onmessage = (event) => {
        const progressData: UploadProgress = JSON.parse(event.data);
        setProgress(progressData);

        if (progressData.type === 'complete') {
          setUploading(false);
          eventSource.close();
        } else if (progressData.type === 'error') {
          setUploading(false);
          eventSource.close();
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        setUploading(false);
        eventSource.close();
      };

    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setProgress({
        type: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  };

  const uploadWithoutProgress = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        'http://localhost:3000/accountpay-beneficiaries/upload-excel',
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();
      setProgress({
        type: 'complete',
        ...result,
      });
      setUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setProgress({
        type: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Beneficiary Data</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Excel File
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={uploading}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={uploadWithProgress}
            disabled={!file || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload with Progress Tracking'}
          </button>

          <button
            onClick={uploadWithoutProgress}
            disabled={!file || uploading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Quick Upload
          </button>
        </div>

        {progress && (
          <div className="mt-6">
            {progress.type === 'progress' && (
              <div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      Processing batch {progress.currentBatch} of {progress.totalBatches}
                    </span>
                    <span className="font-semibold">{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-gray-600">Processed</p>
                    <p className="text-xl font-semibold">{progress.processedRows}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-gray-600">Success</p>
                    <p className="text-xl font-semibold text-green-600">
                      {progress.successfulRows}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-gray-600">Failed</p>
                    <p className="text-xl font-semibold text-red-600">
                      {progress.failedRows}
                    </p>
                  </div>
                </div>

                {progress.errors && progress.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 rounded">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                      Recent Errors:
                    </p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {progress.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx}>
                          Row {error.row}: {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {progress.type === 'complete' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Upload Complete!
                </h3>
                <p className="text-sm text-green-700 mb-3">{progress.message}</p>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Total Rows</p>
                    <p className="font-semibold">{progress.totalRows}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Success</p>
                    <p className="font-semibold text-green-600">
                      {progress.successfulRows}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Failed</p>
                    <p className="font-semibold text-red-600">
                      {progress.failedRows}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold">
                      {progress.duration ? (progress.duration / 1000).toFixed(2) : 0}s
                    </p>
                  </div>
                </div>
                {progress.errors && progress.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                      Errors ({progress.errors.length}):
                    </p>
                    <div className="max-h-40 overflow-y-auto">
                      <ul className="text-xs text-red-700 space-y-1">
                        {progress.errors.map((error, idx) => (
                          <li key={idx}>
                            Row {error.row}: {error.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {progress.type === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Upload Failed
                </h3>
                <p className="text-sm text-red-700">{progress.error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Tips:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use "Upload with Progress Tracking" for large files (100k+ rows)</li>
          <li>• Use "Quick Upload" for smaller files (under 50k rows)</li>
          <li>• The system processes data in batches of 1,000 rows</li>
          <li>• Maximum file size: 400,000 rows</li>
          <li>• Ensure Excel columns match the required format</li>
        </ul>
      </div>
    </div>
  );
};

export default BeneficiaryUpload;