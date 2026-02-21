import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatShapForChart } from '../utils/formatters';
import { FaChartBar } from 'react-icons/fa';

const ShapVisualization = ({ shapValues }) => {
  const chartData = useMemo(() => formatShapForChart(shapValues), [shapValues]);
  console.log('shapValues (roh):', shapValues);
  console.log('chartData (formatiert):', chartData);

  if (!shapValues || chartData.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <FaChartBar style={{ color: '#3b82f6', marginRight: '8px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
            Feature-Einfluss (SHAP)
          </h3>
        </div>
        <p style={{ color: '#4b5563', textAlign: 'center', padding: '32px 0' }}>
          Keine SHAP-Daten verfügbar. Bitte erst eine Vorhersage durchführen.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '24px',
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <FaChartBar style={{ color: '#3b82f6', marginRight: '8px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
            Einfluss der Faktoren - SHAP (SHapley Additive exPlanations)
          </h3>
        </div>
        <p style={{ color: '#4b5563' }}>
          Diese Grafik zeigt, welche Faktoren am stärksten zu Ihrer Risikobewertung beitragen.
          Positive Werte (rote Balken) erhöhen, negative Werte (grüne Balken) senken das Diabetes-Risiko.
        </p>
      </div>

      <div style={{ width: '100%', height: '600px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              stroke="#6b7280"
              tickFormatter={(value) => value.toFixed(3)}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#000000"
              width={150}
              tick={{ fontSize: 12, fontWeight: 'bold' }}
              interval={0}
              tickMargin={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="shapValue"
              name="SHAP-Wert"
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.shapValue > 0 ? '#ef4444' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const textColor = value > 0 ? '#ef4444' : '#10b981';
      return (
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <p style={{ fontWeight: 'bold' }}>{label}</p>
        <p style={{ fontWeight: '600', color: textColor }}>
          Einfluss: {value.toFixed(4)}
        </p>
        <p style={{ fontSize: '14px', color: '#4b5563' }}>
          {value > 0 ? 'Erhöht Risiko' : 'Senkt Risiko'}
        </p>
      </div>
    );
    }
    return null;
  };

export default ShapVisualization;