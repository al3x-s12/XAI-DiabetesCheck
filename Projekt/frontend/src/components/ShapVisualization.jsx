import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatShapForChart } from '../utils/formatters';
import { FaChartBar } from 'react-icons/fa';

const ShapVisualization = ({ shapValues }) => {
  const chartData = useMemo(() => formatShapForChart(shapValues), [shapValues]);

  if (!shapValues || chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <FaChartBar className="text-blue-500 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">Feature-Einfluss (SHAP)</h3>
        </div>
        <p className="text-gray-600 text-center py-8">
          Keine SHAP-Daten verfügbar. Bitte erst eine Vorhersage durchführen.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <FaChartBar className="text-blue-500 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">Feature-Einfluss (SHAP)</h3>
        </div>
        <p className="text-gray-600">
          Diese Grafik zeigt, welche Faktoren am stärksten zu Ihrer Risikobewertung beitragen.
          Positive Werte erhöhen, negative Werte senken das Diabetes-Risiko.
        </p>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              stroke="#6b7280"
              tickFormatter={(value) => value.toFixed(3)}
            />
            <YAxis 
              type="category" 
              dataKey="feature" 
              stroke="#6b7280"
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="value" 
              name="SHAP-Wert (Einfluss auf Risiko)"
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value > 0 ? '#ef4444' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="font-bold text-red-600">Rote Balken</div>
          <p className="text-sm text-gray-600">Erhöhen Diabetes-Risiko</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="font-bold text-green-600">Grüne Balken</div>
          <p className="text-sm text-gray-600">Senken Diabetes-Risiko</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="font-bold text-blue-600">Länge = Einfluss</div>
          <p className="text-sm text-gray-600">Längere Balken = stärkerer Einfluss</p>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-bold">{label}</p>
          <p className={`font-semibold ${payload[0].value > 0 ? 'text-red-600' : 'text-green-600'}`}>
            Einfluss: {payload[0].value.toFixed(4)}
          </p>
          <p className="text-sm text-gray-600">
            {payload[0].value > 0 ? 'Erhöht Risiko' : 'Senkt Risiko'}
          </p>
        </div>
      );
    }
    return null;
  };

export default ShapVisualization;