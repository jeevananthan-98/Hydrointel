import axios from 'axios';

// IMPORTANT: Update this URL to the public address of your deployed backend server.
// For local testing, keep it as 'http://localhost:5000'.
const API_URL = 'http://localhost:5000';

/**
 * Handles all API calls for the groundwater management application.
 * This centralization ensures a clean, maintainable codebase.
 */
export const getPrediction = (features) => {
    // Sends a POST request to the prediction endpoint with the provided features.
    return axios.post(`${API_URL}/predict`, { features });
};

export const getHistoricalData = (city) => {
    // Sends a GET request to the historical data endpoint for a specific city.
    return axios.get(`${API_URL}/historical_data`, { params: { city } });
};

export const getModelPerformancePlot = () => {
    // Fetches the model performance plot as a Blob.
    return axios.get(`${API_URL}/model_performance`, { responseType: 'blob' });
};
