import React from 'react';
import { getRiskCategory } from '../utils/formatters';
import { FaChartLine, FaInfoCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const ResultDisplay = ({ result }) => {
  if (!result) return null;

  const { risk_percent, risk_category, message, explanations } = result;
  const categoryInfo = getRiskCategory(risk_percent);
  const topPositive = explanations?.top_positive || [];
  const topNegative = explanations?.top_negative || [];

  const formatValue = (val) => (typeof val === 'number' ? val.toFixed(0) : val);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        padding: '24px',
        borderTop: '4px solid #22c55e', // green-500
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Ergebnis der Analyse</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f3f4f6', // gray-100
            padding: '4px 12px',
            borderRadius: '9999px',
          }}
        >
          <FaChartLine style={{ color: '#3b82f6' }} />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>KI-Modell v1.0</span>
        </div>
      </div>

      {/* Hauptbereich: 2 Spalten (auf kleinen Bildschirmen 1 Spalte) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
        }}
      >
        {/* Linke Spalte: Risiko-Meter */}
        <div
          style={{
            padding: '24px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            backgroundColor: categoryInfo.bgColor,   // z.B. '#f0fdf4' für grün
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Geschätztes Diabetes-Risiko
          </h3>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '160px',
              height: '160px',
              margin: '16px 0',
            }}
          >
            {/* SVG-Kreis (Hintergrund + Fortschritt) */}
            <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 36 36">
              {/* grauer Hintergrundkreis */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              {/* farbiger Fortschrittsbogen */}
              <path
                strokeDasharray={`${risk_percent}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={categoryInfo.strokeColor}   // Hex-Farbe, z.B. '#16a34a'
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* Prozentangabe in der Mitte */}
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: categoryInfo.color }}>
                {risk_percent}%
              </span>
            </div>
          </div>

          {/* Kategorie-Badge */}
          <div
            style={{
              padding: '4px 16px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
              color: categoryInfo.color,
            }}
          >
            Kategorie: {risk_category}
          </div>
        </div>

        {/* Rechte Spalte: Faktoren */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Risikotreiber */}
          <div
            style={{
              backgroundColor: '#fef2f2', // red-50
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #fee2e2', // red-100
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <FaArrowUp style={{ color: '#ef4444', marginRight: '8px' }} />
              <h4 style={{ fontWeight: '600', color: '#b91c1c' }}>Haupt-Risikofaktoren</h4>
            </div>
            {topPositive.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {topPositive.map((item, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ color: '#374151' }}>{item.label || item.feature}</span>
                    <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{formatValue(item.value)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
                Keine signifikanten Risikofaktoren gefunden.
              </p>
            )}
          </div>

          {/* Schutzfaktoren */}
          <div
            style={{
              backgroundColor: '#f0fdf4', // green-50
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #dcfce7', // green-100
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <FaArrowDown style={{ color: '#22c55e', marginRight: '8px' }} />
              <h4 style={{ fontWeight: '600', color: '#15803d' }}>Schützende Faktoren</h4>
            </div>
            {topNegative.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {topNegative.map((item, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ color: '#374151' }}>{item.label || item.feature}</span>
                    <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{formatValue(item.value)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
                Keine starken Schutzfaktoren identifiziert.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;