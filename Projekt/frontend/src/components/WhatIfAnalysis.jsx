import React, { useMemo, useState, useEffect } from 'react';
import { FaLightbulb, FaUndo, FaArrowRight } from 'react-icons/fa';
import { predictDiabetes } from '../services/api';
import { FEATURE_META } from '../utils/constants';

const ageToClass = (age) => {
  if (age < 25) return 1;
  if (age < 30) return 2;
  if (age < 35) return 3;
  if (age < 40) return 4;
  if (age < 45) return 5;
  if (age < 50) return 6;
  if (age < 55) return 7;
  if (age < 60) return 8;
  if (age < 65) return 9;
  if (age < 70) return 10;
  if (age < 75) return 11;
  if (age < 80) return 12;
  return 13;
};

const classToAge = (cls) => {
  switch (cls) {
    case 1: return 18;
    case 2: return 25;
    case 3: return 30;
    case 4: return 35;
    case 5: return 40;
    case 6: return 45;
    case 7: return 50;
    case 8: return 55;
    case 9: return 60;
    case 10: return 65;
    case 11: return 70;
    case 12: return 75;
    case 13: return 80;
    default: return 40;
  }
};


const WhatIfAnalysis = ({ currentData, onNewPrediction, result }) => {
  const [whatIfData, setWhatIfData] = useState({ ...currentData });
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ageYear, setAgeYear] = useState(() =>
    currentData?.Age ? classToAge(currentData.Age) : 40
  );

  useEffect(() => {
    if (currentData?.Age !== undefined) {
      setAgeYear(classToAge(currentData.Age));
    }
  }, [currentData?.Age]);

  const baseRisk = currentData?._lastResult?.risk_percent || 0;

  console.log('🔍 WhatIfAnalysis - result:', result);
  console.log('🔍 WhatIfAnalysis - all_impacts:', result?.all_impacts);

  const topFeatures = useMemo(() => {
    if (result?.all_impacts?.length) {
      return result.all_impacts
        .filter(item => item.impact > 0)
        .sort((a, b) => b.impact - a.impact)
        .slice(0, 3)
        .map(item => item.feature);
    }
    if (result?.explanations?.top_positive?.length) {
      return result.explanations.top_positive.slice(0, 3).map(e => e.feature);
    }
    return ['BMI', 'PhysActivity', 'Fruits'];
  }, [result]);

  const handleWhatIfChange = (feature, value) => {
    setWhatIfData(prev => ({
      ...prev,
      [feature]: parseFloat(value) || 0
    }));
  };

  const handleAgeChange = (years) => {
    setAgeYear(years);
    const newClass = ageToClass(years);
    setWhatIfData(prev => ({ ...prev, Age: newClass }));
  };

  const runWhatIfAnalysis = async () => {
    setIsLoading(true);
    try {
      // Daten bereinigen (_lastResult entfernen bevor wir senden)
      const { _lastResult, ...dataToSend } = whatIfData;
      
      const response = await predictDiabetes(dataToSend);
      if (response.success) {
        setWhatIfResult(response); // Speichere das flache Response-Objekt
        if (onNewPrediction) onNewPrediction(response);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToCurrent = () => {
    setWhatIfData({ ...currentData });
    setWhatIfResult(null);
    if (currentData?.Age) {
      setAgeYear(classToAge(currentData.Age));
    }
  };

  // Wähle 3 interessante Features zum Spielen (Hardcoded oder dynamisch)
  const demoFeatures = ['BMI', 'PhysActivity', 'Fruits'];

  return (
    <div
      style={{
        background: 'linear-gradient(to right, #eff6ff, #eef2ff)', // from-blue-50 to-indigo-50
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '24px',
        border: '1px solid #dbeafe', // blue-100
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <FaLightbulb style={{ color: '#eab308', fontSize: '20px', marginRight: '8px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
          Was-wäre-wenn Analyse
        </h3>
      </div>

      <p
        style={{
          fontSize: '14px',
          color: '#4b5563',
          marginBottom: '24px',
        }}
      >
        Simulieren Sie Veränderungen: Wie würde sich das Risiko ändern, wenn der Patient abnimmt oder sich mehr bewegt?
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {topFeatures.map(feature => {

          if (feature === 'Age') {
            return (
              <div
                key={feature}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '4px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#6b7280',
                    marginBottom: '4px',
                  }}
                >
                  Alter (Jahre)
                </label>
                <input
                  type="range"
                  min={18}
                  max={90}
                  step={1}
                  value={ageYear}
                  onChange={(e) => handleAgeChange(parseInt(e.target.value, 10))}
                  style={{
                    height: '8px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '8px',
                    appearance: 'none',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                />
                <div
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#000000',
                    marginTop: '5px',
                    marginBottom: '5px',
                  }}
                >
                  {ageYear}
                </div>
              </div>
            );
          }

          // Spezialbehandlung für Bildungsabschluss
          if (feature === 'Education') {
            const educationLabels = {
              1: 'Kein Abschluss',
              2: 'Grundschule',
              3: 'Schulabschluss',
              4: 'Abitur',
              5: 'Student/in',
              6: 'Akademiker/in'
            };
            const currentValue = whatIfData[feature] || 1;
            const displayText = educationLabels[currentValue] || currentValue;

            return (
              <div
                key={feature}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '4px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#6b7280',
                    marginBottom: '4px',
                  }}
                >
                  Bildungsabschluss
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={currentValue}
                  onChange={(e) => handleWhatIfChange(feature, e.target.value)}
                  style={{
                    height: '8px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '8px',
                    appearance: 'none',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                />
                <div
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#000000',
                    marginTop: '5px',
                    marginBottom: '5px',
                  }}
                >
                  {displayText}
                </div>
              </div>
            );
          }

          const meta = FEATURE_META[feature] || { min: 0, max: 1, step: 1 };
          return (
            <div
              key={feature}
              style={{
                backgroundColor: '#ffffff',
                padding: '12px',
                borderRadius: '4px',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#6b7280',
                  marginBottom: '4px',
                }}
              >
                {feature}
              </label>
              <input
                type="range"
                min={meta.min}
                max={meta.max}
                step={meta.step}
                value={whatIfData[feature] || 0}
                onChange={(e) => handleWhatIfChange(feature, e.target.value)}
                style={{
                  height: '8px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px',
                  appearance: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
              />
              <div
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#000000',
                  marginTop: '5px',
                  marginBottom: '5px',
                }}
              >
                {whatIfData[feature]}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
        <button
          onClick={runWhatIfAnalysis}
          disabled={isLoading}
          style={{
            flex: 1,
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isLoading ? 'Berechne...' : 'Simulation starten'}
        </button>
        <button
          onClick={resetToCurrent}
          style={{
            padding: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            color: '#4b5563',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FaUndo />
        </button>
      </div>

      {whatIfResult && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Neues Risiko:</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {whatIfResult.risk_percent}%
          </p>
        </div>
      )}
    </div>
  );
};

export default WhatIfAnalysis;