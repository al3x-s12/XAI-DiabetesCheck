import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Feature Information
export const getFeatures = async () => {
  try {
    const response = await api.get('/features');
    return response.data;
  } catch (error) {
    console.error('Error fetching features:', error);
    throw error;
  }
};

// Diabetes Prediction
export const predictDiabetes = async (featureData) => {
    try {
    const response = await api.post('/predict', featureData);
    return response.data;
  } catch (error) {
    console.error('Error predicting diabetes:', error);
    
    // Fehlermeldungen
    if (error.response) {
      throw new Error(`API Error: ${error.response.data.error || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('Backend not responding. Please make sure the server is running.');
    } else {
      throw new Error('Request error: ' + error.message);
    }
  }
};

// Backend Health Check
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get('http://localhost:5000/health');
    return response.data.status === 'healthy';
  } catch (error) {
    console.warn('Backend not available');
    return false;
  }
};

export default api;