// tracker.js
const fs = require('fs');
const axios = require('axios');

// Ensure logs directory exists
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');

// Setup 403 error tracking
function setup403Tracker() {
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 403) {
        const errorInfo = {
          time: new Date().toISOString(),
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          response: error.response?.data,
          headers: error.config?.headers
        };
        
        console.log('\x1b[31m🚫 403:\x1b[0m', errorInfo.url);
        console.log('   Response:', errorInfo.response);
        
        fs.appendFileSync('./logs/403.log', JSON.stringify(errorInfo) + '\n');
      }
      return Promise.reject(error);
    }
  );
  
  console.log('✅ 403 Error Tracker Active');
}

module.exports = { setup403Tracker };
