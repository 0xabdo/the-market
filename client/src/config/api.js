// Centralized API Configuration
// All sensitive data should come from environment variables only

const API_CONFIG = {
  // Development
  development: {
    baseURL: 'http://localhost:5000'
  },
  
  // Production - Update these for your live domain
  production: {
    baseURL: 'https://yourdomain.com' // Change this to your actual domain
  },
  
  // Staging (optional)
  staging: {
    baseURL: 'https://staging.yourdomain.com' // Change this to your staging domain
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  // Check environment variables first
  if (process.env.REACT_APP_NODE_ENV) {
    return process.env.REACT_APP_NODE_ENV;
  }
  
  // Fallback to NODE_ENV
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  
  // Default to development
  return 'development';
};

// Get API configuration for current environment
const getApiConfig = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env] || API_CONFIG.development;
};

// Export configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || getApiConfig().baseURL;

// API Key must come from environment variables only - no fallback for security
export const API_KEY = process.env.REACT_APP_API_KEY;

// Validate that API key is provided
if (!API_KEY) {
  console.error('❌ REACT_APP_API_KEY is required in environment variables');
  console.error('Please add REACT_APP_API_KEY to your .env file');
}

// Export for easy access
const apiConfig = {
  baseURL: API_BASE_URL,
  apiKey: API_KEY,
  environment: getCurrentEnvironment(),
  isConfigured: !!API_KEY // Check if API key is properly configured
};

export default apiConfig;
