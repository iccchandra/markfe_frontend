// ============================================
// api/apiClient.ts — Axios instance with JWT interceptors
// ============================================
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9090';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('markfed_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('markfed_refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem('markfed_access_token', data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed — force logout
        localStorage.removeItem('markfed_access_token');
        localStorage.removeItem('markfed_refresh_token');
        localStorage.removeItem('markfed_user');
        window.location.href = (process.env.PUBLIC_URL || '') + '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
