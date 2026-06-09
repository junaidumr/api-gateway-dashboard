import axios from 'axios';
import { getToken, clearAuth } from '../utils/auth';

const api = axios.create({
  baseURL: '/admin',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getRequestsByEndpoint: () => api.get('/analytics/requests-by-endpoint'),
  getDailyTraffic: () => api.get('/analytics/daily-traffic'),
  getTopUsers: () => api.get('/analytics/top-users'),
  getStatusDistribution: () => api.get('/analytics/status-distribution'),
};

export const apiKeyAPI = {
  getAll: () => api.get('/api-keys'),
  getStats: () => api.get('/api-keys/stats'),
  generate: (userId) => api.post('/api-keys', { userId }),
  revoke: (id) => api.patch(`/api-keys/${id}/revoke`),
};

export const logsAPI = {
  getLogs: (params) => api.get('/logs', { params }),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
};

export default api;
