import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

/**
 * A visually stunning and professional-grade chart component.
 * It displays historical groundwater data with a modern dark theme,
 * smooth lines, and intelligent handling for when no data is available.
 *
 * @param {object} props
 * @param {Array<object>} props.data The historical data array to be plotted.
 */
const HistoricalChart = ({ data }) => {
  const { t } = useTranslation();

  // Handle the case where there is no data to display.
  // We return a beautifully styled message instead of a blank space.
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 rounded-xl bg-gray-900 bg-opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xl font-bold text-gray-300">
          No historical data available.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Please select another city or check the data source.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {/* Adds a dark, subtle grid for better readability */}
        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" strokeOpacity={0.4} />

        {/* X-Axis for dates, with a cleaner look */}
        <XAxis
          dataKey="Date"
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
        />

        {/* Y-Axis for water level, with a clear label */}
        <YAxis
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
          label={{
            value: 'Water Level (m)',
            angle: -90,
            position: 'insideLeft',
            fill: '#9CA3AF',
            style: { textAnchor: 'middle' },
          }}
        />

        {/* Customized tooltip for a polished look */}
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #4B5563',
            borderRadius: '8px',
            color: '#E5E7EB',
          }}
          labelStyle={{ color: '#9CA3AF' }}
          itemStyle={{ color: '#E5E7EB' }}
        />

        {/* The main line, with a smooth curve and a vibrant gradient */}
        <defs>
          <linearGradient id="colorWater" x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#22C55E" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="Water_Level_m"
          stroke="url(#colorWater)"
          strokeWidth={3}
          dot={false}
          name="Water Level"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoricalChart;
