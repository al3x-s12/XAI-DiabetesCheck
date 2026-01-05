import React from 'react';
import { getRiskCategory } from '../utils/formatters';
import { FaChartLine, FaInfoCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const ResultDisplay = ({ result, shapValues }) => {
  if (!result) return null;

  const { risk_percent, risk_category, message } = result.prediction || {};
  const riskInfo = getRiskCategory(risk_percent);
  const topPositive = result.explanations?.top_positive || [];
  const topNegative = result.explanations?.top_negative || [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ergebnis</h2>
        <div className="flex items-center space-x-2">
          <FaChartLine className="text-blue-500" />
          <span className="text-sm font-medium text-gray-600">AI-Analyse</span>
        </div>
      </div>

      {/* Risiko-Anzeige */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Ihr Diabetes-Risiko</h3>
            <p className="text-gray-600">{message}</p>
          </div>
          <div className={`mt-2 md:mt-0 px-4 py-2 rounded-full ${riskInfo.bg} ${riskInfo.color} font-bold`}>
            {riskInfo.text}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Niedrig</span>
            <span>Hoch</span>
          </div>
          <div className="h-6 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white border-2 border-gray-800 relative"
              style={{ width: `${Math.min(risk_percent, 100)}%` }}
            >
              <div className="absolute right-0 top-full mt-1 text-sm font-bold">
                {risk_percent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Erklärungen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Einflüsse */}
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FaArrowUp className="text-red-500 mr-2" />
            <h4 className="font-semibold text-red-700">Erhöht das Risiko</h4>
          </div>
          {topPositive.length > 0 ? (
            <ul className="space-y-2">
              {topPositive.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.feature}</span>
                  <span className="font-bold text-red-600">+{item.impact.toFixed(4)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">Keine starken Risikofaktoren identifiziert</p>
          )}
        </div>

        {/* Negative Einflüsse */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FaArrowDown className="text-green-500 mr-2" />
            <h4 className="font-semibold text-green-700">Senkt das Risiko</h4>
          </div>
          {topNegative.length > 0 ? (
            <ul className="space-y-2">
              {topNegative.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.feature}</span>
                  <span className="font-bold text-green-600">{item.impact.toFixed(4)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">Keine starken Schutzfaktoren identifiziert</p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Hinweis:</strong> Diese Analyse basiert auf einem KI-Modell und statistischen Daten. 
              Sie dient nur zu Informationszwecken und ersetzt keine ärztliche Diagnose. 
              Bei gesundheitlichen Bedenken konsultieren Sie bitte medizinisches Fachpersonal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;