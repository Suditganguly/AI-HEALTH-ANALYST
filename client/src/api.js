import axios from 'axios';

// Determine the correct backend URL based on the environment
// For Vite, environment variables must be prefixed with VITE_
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies/session info
});

// You can also add interceptors for handling auth tokens
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // Or however you store your token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;