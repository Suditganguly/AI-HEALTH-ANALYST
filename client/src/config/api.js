// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
  PROCESS_DOCUMENT: `${API_BASE_URL}/api/process-document`,
  UPLOAD_AND_STRUCTURE: `${API_BASE_URL}/api/upload-and-structure`,
  USERS: `${API_BASE_URL}/api/users`,
  UPLOADED_FILES: `${API_BASE_URL}/api/uploaded-files`,
};

// API utility functions
export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData requests
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default API_BASE_URL;