import { BatchDetailsResponse, BatchListResponse } from '../pages/CGGbatch/types/batch.types';
import axios from 'axios';

// ✅ UPDATED: Using validation-analysis endpoint (not risk-analysis)
const API_BASE_URL = 'https://kotak-risk-analysis.alliantprojects.com/api/v1/validation-analysis';

export const batchService = {
  // Get list of all batches
  async getBatches(page = 1, limit = 20, status?: string): Promise<BatchListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }
    
    const response = await axios.get(`${API_BASE_URL}/batches?${params}`);
    return response.data;
  },

  // Get single batch details
  async getBatchDetails(batchId: string, page = 1, limit = 50): Promise<BatchDetailsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await axios.get(`${API_BASE_URL}/batches/${batchId}?${params}`);
    return response.data;
  },

  // Upload new batch file
  async uploadBatch(file: File, batchId?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (batchId) {
      formData.append('batchId', batchId);
    }
    
    const response = await axios.post(`${API_BASE_URL}/process-txt-batch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Download file
  downloadFile(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};