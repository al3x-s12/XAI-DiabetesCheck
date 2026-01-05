import React, { useState, useEffect } from 'react';
import FeatureForm from './components/FeatureForm';
import ResultDisplay from './components/ResultDisplay';
import ShapVisualization from './components/ShapVisualization';
import WhatIfAnalysis from './components/WhatIfAnalysis';
import Header from './components/Header';
import Footer from './components/Footer';
import { predictDiabetes, checkBackendHealth } from './services/api';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import './App.css';

function App(){
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);

  // Backend-Verbindung prüfen
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkBackendHealth();
      setBackendConnected(connected);
    };
    checkConnection();
  }, []);

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    setFormData({ ...data, _lastResult: result?.prediction });
    
    try {
      const response = await predictDiabetes(data);
      if (response.success) {
        setResult(response);
      } else {
        console.error('Prediction failed:', response.error);
        // Fallback: Demo-Ergebnis
        setResult(getDemoResult(data));
      }
    } catch (error) {
      console.error('API Error:', error);
      // Fallback zu Demo-Modus
      setBackendConnected(false);
      setResult(getDemoResult(data));
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
    setResult(newResult);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {!backendConnected && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-yellow-500 mr-3 text-xl" />
              <div>
                <h3 className="font-bold text-yellow-700">Demo-Modus aktiv</h3>
                <p className="text-yellow-600">
                  Backend nicht erreichbar. Zeige Demo-Daten. Starte das Backend mit: 
                  <code className="ml-2 bg-yellow-100 px-2 py-1 rounded text-sm">python app.py</code>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Linke Spalte: Formular */}
          <div className="lg:col-span-2">
            <FeatureForm 
              onSubmit={handleFormSubmit} 
              isLoading={isLoading}
              backendConnected={backendConnected}
            />
            
            {isLoading && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-8 text-center">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">KI-Analyse läuft...</p>
                <p className="text-gray-500 text-sm mt-2">
                  Das Modell berechnet Ihr individuelles Risiko und analysiert alle Einflussfaktoren.
                </p>
              </div>
            )}
          </div>

          {/* Rechte Spalte: What-If Analyse */}
          <div className="lg:col-span-1">
            {formData && !isLoading && (
              <WhatIfAnalysis 
                currentData={formData}
                onNewPrediction={handleNewWhatIfPrediction}
                features={result?.features_used}
              />
            )}
          </div>
        </div>

        {/* Ergebnisse */}
        {result && !isLoading && (
          <div className="mt-8 space-y-8">
            <ResultDisplay result={result} shapValues={result.shap_values} />
            
            <ShapVisualization shapValues={result.shap_values} />
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Über diese Analyse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🤖 KI-Modell</h4>
                  <p className="text-gray-600">
                    Verwendet Random Forest mit SHAP für erklärbare KI. 
                    Trainiert auf CDC-Daten mit 250.000+ Einträgen.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">📊 SHAP-Erklärungen</h4>
                  <p className="text-gray-600">
                    SHAP (SHapley Additive exPlanations) zeigt, welche Faktoren 
                    wie stark zur Risikobewertung beitragen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;