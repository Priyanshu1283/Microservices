import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  // Base URL is handled by Vite Proxy in development
  // In production, this should point to your API Gateway or Load Balancer
  baseURL: '/api', 
  withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Response interceptor for handling global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout or redirect to login could be triggered here
      // Alternatively, we handle it in the Zustand store/components
      console.error('Unauthorized access. Please login.');
    }
    return Promise.reject(error);
  }
);

export default api;
