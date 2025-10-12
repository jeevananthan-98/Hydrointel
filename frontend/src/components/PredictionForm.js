import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

/**
 * A master-level prediction form component.
 * It features a clean, professional UI with smooth animations and
 * intelligent handling for user input and server responses.
 */
const PredictionForm = ({ API_URL }) => {
  // State to hold the form data, matching the ML model's required features.
  const [formData, setFormData] = useState({
    Lat: '19.0760',
    Long: '72.8777',
    Rainfall_mm: '120.5',
    Temperature_C: '25.0',
    pH: '7.2',
    Dissolved_Oxygen_mg_L: '6.8',
  });

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handles changes to the form fields, ensuring they match the model's inputs.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handles form submission, sending data to the backend.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPrediction(null);
    setIsSubmitting(true);

    if (API_URL.includes("YOUR-API-URL-HERE")) {
      setError("Please update the API_URL with your backend server's address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/predict`, { features: formData });
      if (response.status === 200) {
        setPrediction(response.data.prediction);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      setError("Failed to get a prediction. Please check your network and server connection.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card md:col-span-1 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4 text-green-300">Real-Time Prediction</h2>
      <p className="text-gray-400 mb-4">
        Enter the current environmental data to get a real-time groundwater level prediction.
      </p>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="form-group">
              <label htmlFor={key} className="block text-sm font-medium text-gray-400 mb-1">
                {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </label>
              <input
                type="number"
                id={key}
                name={key}
                step="any"
                value={value}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 bg-opacity-50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="btn-predict w-full transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Predicting...' : 'Get Prediction'}
        </button>
      </form>

      {/* Animated prediction result display */}
      {prediction !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 p-6 bg-blue-800 bg-opacity-50 rounded-xl text-center font-bold text-3xl"
        >
          <p className="text-blue-300 text-lg">Predicted Water Level</p>
          <p className="mt-2 text-white">{prediction.toFixed(2)} m</p>
        </motion.div>
      )}

      {/* Animated error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 p-4 bg-red-800 bg-opacity-50 rounded-xl text-center text-red-300 font-bold"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default PredictionForm;
