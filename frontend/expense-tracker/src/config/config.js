const config = {
    development: {
      API_URL: "http://localhost:8000"
    },
    production: {
      API_URL: "https://expense-tracker-backend-nywf.onrender.com"
    }
  };
  
  // Auto-detect environment
  const getEnvironment = () => {
    // Check if we're in development (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'development';
    }
    // Otherwise we're in production
    return 'production';
  };
  
  const currentConfig = config[getEnvironment()];
  
  export const API_CONFIG = {
    BASE_URL: currentConfig.API_URL
  };
  
  export default API_CONFIG;