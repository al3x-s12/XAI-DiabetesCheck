import React, { useState, useEffect } from 'react';
import FeatureForm from './components/FeatureForm';
import ResultDisplay from './components/ResultDisplay';
import ShapVisualization from './components/ShapVisualization';
import WhatIfAnalysis from './components/WhatIfAnalysis';
import Header from './components/Header';
import Footer from './components/Footer';
import { predictDiabetes, checkBackendHealth } from './services/api';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

function App(){
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);

  // Backend-Verbindung prüfen
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await checkBackendHealth();
        setBackendConnected(connected);
      } catch(e){
        setBackendConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    setFormData({ ...data, _lastResult: result });
    
    try {
      const response = await predictDiabetes(data);
      if (response.success) {
        setResult(response);
      } else {
        console.error('Prediction failed:', response.error);
        alert('Fehler bei der Vorhersage:' + response.error);
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('Verbindungsfehler zum Server.')
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoResult = (data) => {
    // Einfache Demo-Berechnung basierend auf einigen Features
    let baseRisk = 20;
    if (data.HighBP === 1) baseRisk += 15;
    if (data.HighChol === 1) baseRisk += 10;
    if (data.BMI > 30) baseRisk += 20;
    if (data.BMI > 25) baseRisk += 10;
    if (data.PhysActivity === 0) baseRisk += 5;
    if (data.Age > 8) baseRisk += 15;
    
    const risk = Math.min(baseRisk + Math.random() * 10, 95);
    
    return {
      success: true,
      prediction: {
        risk_percent: Math.round(risk * 10) / 10,
        risk_category: risk < 20 ? 'Niedrig' : risk < 50 ? 'Mittel' : risk < 75 ? 'Erhöht' : 'Hoch',
        message: `Demo: Diabetes-Risiko: ${Math.round(risk * 10) / 10}%`
      },
      explanations: {
        top_positive: [
          { feature: 'HighBP', impact: data.HighBP === 1 ? 0.15 : 0 },
          { feature: 'BMI', impact: data.BMI > 25 ? 0.12 : 0.02 },
          { feature: 'Age', impact: data.Age > 5 ? 0.08 : 0 }
        ],
        top_negative: [
          { feature: 'PhysActivity', impact: data.PhysActivity === 1 ? -0.05 : 0 },
          { feature: 'Fruits', impact: data.Fruits === 1 ? -0.03 : 0 },
          { feature: 'Veggies', impact: data.Veggies === 1 ? -0.03 : 0 }
        ]
      },
      shap_values: {
        HighBP: data.HighBP === 1 ? 0.15 : 0,
        HighChol: data.HighChol === 1 ? 0.10 : 0,
        BMI: (data.BMI - 25) * 0.005,
        PhysActivity: data.PhysActivity === 1 ? -0.05 : 0,
        Age: (data.Age - 5) * 0.01
      }
    };
  };

  const handleNewWhatIfPrediction = (newResult) => {
    console.log("Neue What-If Berechnung:", newResult);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb', // gray-50
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        color: '#1f2937', // gray-800
      }}
    >
      <Header />

      <main
        style={{
          flex: '1 0 auto',
          width: '100%', 
          margin: '0 auto',
          padding: '32px 16px', // py-8 px-4
        }}
      >
        {!backendConnected && (
          <div
            style={{
              backgroundColor: '#fee2e2', // red-100
              borderLeft: '4px solid #ef4444', // red-500
              color: '#b91c1c', // red-700
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '4px',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}
            role="alert"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaExclamationTriangle style={{ marginRight: '12px', fontSize: '20px' }} />
              <div>
                <p style={{ fontWeight: 'bold' }}>Keine Verbindung zum Backend</p>
                <p style={{ fontSize: '14px' }}>
                  Bitte stellen Sie sicher, dass der Python-Server läuft (Port 5000).
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', // immer zwei Spalten nebeneinander
            gap: '32px',
          }}
        >
          {/* Linke Spalte: Formular */}
          <div style={{maxWidth: '600px'}}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                padding: '24px',
                borderTop: '4px solid #3b82f6', // blue-500
              }}
            >
              <br />
              <br />
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    backgroundColor: '#dbeafe', // blue-100
                    color: '#2563eb', // blue-600
                    borderRadius: '9999px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '14px',
                  }}
                ></span>
                Bitte geben Sie Ihre Daten ein
              </h2>
              <br />
              <FeatureForm
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                backendConnected={backendConnected}
              />
            </div>
          </div>

          {/* Rechte Spalte: Analyse & Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Willkommens-Platzhalter */}
            {!result && !isLoading && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  padding: '40px',
                  textAlign: 'center',
                  border: '2px dashed #e5e7eb',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#eff6ff', // blue-50
                    padding: '16px',
                    borderRadius: '9999px',
                    marginBottom: '16px',
                  }}
                >
                  <FaSpinner style={{ fontSize: '36px', color: '#93c5fd' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#4b5563' }}>
                  Bereit zur Analyse
                </h3>
                <p
                  style={{
                    color: '#6b7280',
                    maxWidth: '28rem',
                    marginTop: '8px',
                  }}
                >
                  Geben Sie die Patientendaten links ein, um eine KI-gestützte Risikobewertung zu erhalten.
                </p>
              </div>
            )}

            {/* Lade-Animation */}
            {isLoading && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  padding: '48px',
                  textAlign: 'center',
                  height: '256px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FaSpinner style={{ fontSize: '48px', color: '#2563eb', marginBottom: '16px' }} />
                <p style={{ fontSize: '18px', fontWeight: '500', color: '#4b5563' }}>
                  Analysiere Risikofaktoren...
                </p>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
                  Berechne SHAP-Werte und Konfidenz
                </p>
              </div>
            )}

            {/* Ergebnis-Anzeige */}
            {result && !isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <ResultDisplay result={result} />
                <ShapVisualization shapValues={result.all_impacts} />
                <WhatIfAnalysis
                  currentData={formData}
                  result={result}
                  onNewPrediction={handleNewWhatIfPrediction}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;