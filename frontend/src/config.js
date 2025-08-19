// frontend/src/config.js

// Use environment variable if available, otherwise fallback to Render URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://seismic-data-cataloging-3.onrender.com";

export default API_BASE_URL;
