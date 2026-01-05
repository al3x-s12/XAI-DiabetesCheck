import React, { useState } from 'react';
import { FaLightbulb, FaExchangeAlt, FaUndo } from 'react-icons/fa';
import { predictDiabetes } from '../services/api';

const WhatIfAnalysis = ({ currentData, onNewPrediction, features }) => {
  const [whatIfData, setWhatIfData] = useState({ ...currentData });
  const [isLoading, setIsLoading] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState(null);

  const handleWhatIfChange = (feature, value) => {
    setWhatIfData(prev => ({
      ...prev,
      [feature]: parseFloat(value) || 0
    }));
  };

  const runWhatIfAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await predictDiabetes(whatIfData);
      if (response.success) {
        setWhatIfResult(response);
        if (onNewPrediction) {
          onNewPrediction(response);
        }
      }
    } catch (error) {
      console.error('Error in what-if analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToCurrent = () => {
    setWhatIfData({ ...currentData });
    setWhatIfResult(null);
  };

  if (!features || features.length === 0) return null;

  // Wähle nur ein paar wichtige Features für What-If
  const importantFeatures = ['HighBP', 'HighChol', 'BMI', 'PhysActivity', 'Age'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <FaLightbulb className="text-yellow-500 mr-3 text-2xl" />
        <div>
          <h3 className="text-xl font-bold text-gray-800">What-If Analyse</h3>
          <p className="text-gray-600">
            Ändern Sie Werte virtuell und sehen Sie, wie sich Ihr Risiko verändert
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {importantFeatures.map(feature => (
            feature in currentData && (
              <div key={feature} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {feature === 'HighBP' ? 'Bluthochdruck' : 
                   feature === 'HighChol' ? 'Cholesterin' : 
                   feature === 'BMI' ? 'BMI' : 
                   feature === 'PhysActivity' ? 'Aktivität' : 'Alter'}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={feature === 'BMI' ? 15 : 0}
                    max={feature === 'BMI' ? 45 : 
                          feature === 'Age' ? 13 : 1}
                    step={feature === 'BMI' ? 0.5 : 1}
                    value={whatIfData[feature] || 0}
                    onChange={(e) => handleWhatIfChange(feature, e.target.value)}
                    className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-bold min-w-[40px] text-center">
                    {feature === 'BMI' ? parseFloat(whatIfData[feature] || 0).toFixed(1) : whatIfData[feature] || 0}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Aktuell: {currentData[feature]}</span>
                  {whatIfData[feature] !== currentData[feature] && (
                    <span className="font-bold text-blue-600">
                      {whatIfData[feature] > currentData[feature] ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={runWhatIfAnalysis}
          disabled={isLoading}
          className={`flex-1 py-3 px-4 rounded-md font-semibold text-white transition-colors flex items-center justify-center ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Berechne...
            </>
          ) : (
            <>
              <FaExchangeAlt className="mr-2" />
              Neu berechnen mit geänderten Werten
            </>
          )}
        </button>

        <button
          onClick={resetToCurrent}
          className="py-3 px-6 rounded-md font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <FaUndo className="mr-2" />
          Zurücksetzen
        </button>
      </div>

      {whatIfResult && whatIfResult.prediction && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-800">Neues Ergebnis:</h4>
              <p className="text-lg font-bold text-blue-600">
                Risiko: {whatIfResult.prediction.risk_percent}% 
                <span className="ml-2 text-sm font-normal">
                  ({whatIfResult.prediction.risk_category})
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {whatIfResult.prediction.risk_percent > (currentData._lastResult?.risk_percent || 0) 
                  ? 'Risiko erhöht' 
                  : 'Risiko gesenkt'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfAnalysis;