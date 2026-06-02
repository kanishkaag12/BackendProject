import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Attempt to refresh the access token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

          // Save new tokens
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Update header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token is invalid/expired - force logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available - clear local state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Do not automatically redirect unless not already on login/register pages
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
