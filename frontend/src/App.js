import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animated, useSpring } from '@react-spring/web';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './styles/App.css';
import i18n from './i18n/i18n.js';
import { useTranslation } from 'react-i18next';

// IMPORTANT: This URL must be updated to the public address of your deployed backend server.
const API_URL = "http://127.0.0.1:5000";

// Masterpiece component: Animated Number
const AnimatedNumber = ({ value }) => {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { mass: 1, tension: 200, friction: 20 },
  });
  return <animated.span>{number.to(n => n.toFixed(2))}</animated.span>;
};

// Masterpiece component: Historical Chart
const HistoricalChart = ({ data, lang }) => {
  const chartRef = useRef(null);
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return <p className="text-gray-400 text-center py-8">{t('noDataAvailable')}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} ref={chartRef}>
        <CartesianGrid strokeDasharray="5 5" stroke="#4B5563" strokeOpacity={0.5} />
        <XAxis dataKey="Date" stroke="#E5E7EB" />
        <YAxis stroke="#E5E7EB" label={{ value: t('waterLevel'), angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
        <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }} itemStyle={{ color: '#E5E7EB' }} labelStyle={{ color: '#9CA3AF' }} />
        <Line type="monotone" dataKey="Water_Level_m" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 8, strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Masterpiece component: Prediction Form
const PredictionForm = ({ API_URL, onPrediction, predictionError, lang, selectedCity }) => {
  const [isPredicting, setIsPredicting] = useState(false);
  const { t } = useTranslation();

  const handlePredictByCity = async (e) => {
    e.preventDefault();
    setIsPredicting(true);
    onPrediction(null, null); // Clear previous prediction and error

    if (API_URL.includes("YOUR-API-URL-HERE")) {
      onPrediction(null, t('urlError'));
      setIsPredicting(false);
      return;
    }

    try {
      // New endpoint call for predicting by city
      const response = await axios.get(`${API_URL}/predict_by_city?city=${selectedCity.toLowerCase()}`);
      onPrediction(response.data.prediction, null);
    } catch (err) {
      onPrediction(null, t('predictionError'));
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card flex flex-col items-center"
    >
      <h2 className="text-3xl font-bold mb-4 text-green-300">{t('predictionTitle')}</h2>
      <p className="text-gray-400 mb-4 text-center">{t('predictionByCityDescription')}</p>
      
      <form onSubmit={handlePredictByCity} className="w-full space-y-4">
        <button
          type="submit"
          disabled={isPredicting}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-full hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPredicting ? t('predicting') : `${t('getPredictionFor')} ${t(selectedCity.toLowerCase())}`}
        </button>
      </form>
      
      <AnimatePresence>
        {predictionError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center text-red-400"
          >
            {predictionError}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


// Masterpiece component: Search Bar
const SearchBar = ({ API_URL, setSearchResults, lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleSearch = async () => {
    setError('');
    setIsSearching(true);
    setSearchResults([]);

    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }

    if (API_URL.includes("YOUR-API-URL-HERE")) {
      setError(t('urlErrorSearch'));
      setIsSearching(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/search?q=${searchTerm}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError(t('searchError'));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError('');
  };

  return (
    <div className="w-full flex justify-center mt-8 mb-4">
      <div className="relative w-full max-w-xl">
        <motion.input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full bg-gray-800 bg-opacity-50 text-white rounded-full py-4 pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-400"
          initial={{ scale: 1, boxShadow: '0 0px 0px rgba(0,0,0,0)' }}
          whileFocus={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
        />
        <motion.button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 hover:bg-blue-700"
          whileTap={{ scale: 0.9 }}
          aria-label="Search"
        >
          {isSearching ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>
        <AnimatePresence>
          {searchTerm && !isSearching && (
            <motion.button
              onClick={handleClear}
              className="absolute right-14 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white transition-colors duration-300 focus:outline-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-red-400 mt-2 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};


// Main App component that integrates all the others
function App() {
  const allCities = ["Mumbai", "Delhi", "Kolkata", "Chennai", "Bangalore"];
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('insights');
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(allCities[0]);
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [modelPlotUrl, setModelPlotUrl] = useState('');
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handlePredictionCallback = (predictedValue, error) => {
    setPrediction(predictedValue);
    setPredictionError(error);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/historical_data?city=${selectedCity.toLowerCase()}`);
        const formattedData = response.data.map(d => ({
          ...d,
          Date: new Date(d.Date).toLocaleDateString()
        }));
        setHistoricalData(formattedData);
      } catch (e) {
        console.error("Historical data fetch failed:", e);
      }
    };
    fetchData();
  }, [selectedCity]);

  useEffect(() => {
    const fetchPlot = async () => {
      try {
        const response = await axios.get(`${API_URL}/model_performance`, { responseType: 'blob' });
        setModelPlotUrl(URL.createObjectURL(response.data));
      } catch (e) {
        console.error("Failed to load model performance plot:", e);
      }
    };
    fetchPlot();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{t('appTitle')}</h1>
        <div className="language-selector">
          <label htmlFor="language-select">{t('selectLanguage')}:</label>
          <select id="language-select" onChange={handleLanguageChange} value={i18n.language}>
            <option value="en">English</option>
            <option value="ml">മലയാളം</option>
          </select>
        </div>
      </header>
      <main>
        <SearchBar API_URL={API_URL} setSearchResults={setSearchResults} />
        {searchResults.length > 0 && (
          <motion.div className="search-results-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2>{t('searchResults')}</h2>
            <ul className="search-results-list">
              {searchResults.map((result, index) => (
                <li key={index} className="search-result-item">
                  <strong>{result.State_Name}, {result.District_Name}</strong>: {t('station')}: {result.Station_Name}, {t('latitude')}: {result.Latitude}, {t('longitude')}: {result.Longitude}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>{t('dataInsights')}</button>
          <button className={`tab-btn ${activeTab === 'prediction' ? 'active' : ''}`} onClick={() => setActiveTab('prediction')}>{t('getPrediction')}</button>
        </div>
        <AnimatePresence mode="wait">
          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="content-card">
              <h2 className="text-2xl font-bold mb-4 text-blue-300">{t('historicalTrendsTitle')}</h2>
              <div className="mb-4">
                <label htmlFor="city-select" className="block text-sm font-medium text-gray-400 mb-2">{t('selectCity')}</label>
                <select
                  id="city-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-gray-800 bg-opacity-50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                >
                  {allCities.map(city => (<option key={city} value={city.toLowerCase()}>{t(city.toLowerCase())}</option>))}
                </select>
              </div>
              <HistoricalChart data={historicalData} />
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-green-300">{t('modelPerformanceTitle')}</h2>
                <p className="text-gray-400 mb-4">{t('modelPerformanceDescription')}</p>
                {modelPlotUrl ? (
                  <img src={modelPlotUrl} alt={t('modelPerformancePlotAlt')} className="w-full h-auto rounded-xl shadow-lg border-2 border-gray-700" />
                ) : (
                  <p className="text-gray-400 text-center py-8">{t('modelPlotUnavailable')}</p>
                )}
              </div>
            </motion.div>
          )}
          {activeTab === 'prediction' && (
            <motion.div key="prediction" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="content-card">
              <PredictionForm API_URL={API_URL} onPrediction={handlePredictionCallback} predictionError={predictionError} selectedCity={selectedCity}/>
              {prediction !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 p-6 bg-blue-800 bg-opacity-50 rounded-xl text-center font-bold text-3xl"
                >
                  <p className="text-blue-300 text-lg">{t('predictedWaterLevel')}</p>
                  <p className="mt-2"><AnimatedNumber value={prediction} /> m</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <footer>
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
}

export default App;
