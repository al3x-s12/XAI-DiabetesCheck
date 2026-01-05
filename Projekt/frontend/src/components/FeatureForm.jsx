import React, { useState, useEffect } from 'react';
import { getFeatures } from '../services/api';
import { FEATURE_LABELS, FEATURE_DESCRIPTIONS } from '../utils/formatters';
import { FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const FeatureForm = ({onSubmit, isLoading, backendConnected}) => {
    const [features, setFeatures] = useState([]);
    const [featureRanges, setFeatureRanges] = useState({});
    const [formData, setFormData] = useState({});
    const [loadingFeatures, setLoadingFeatures] = useState(true);

    useEffect(() => {
        loadFeatureInfo();
    }, []);

    const loadFeatureInfo = async () => {
        try {
        const response = await getFeatures();
        if (response.success) {
            const featureList = response.data.features || [];
            setFeatures(featureList);
            setFeatureRanges(response.data.feature_ranges || {});
            
            // Initialwerte setzen (Mediane)
            const initialValues = {};
            featureList.forEach(feature => {
            const ranges = response.data.feature_ranges?.[feature];
            initialValues[feature] = ranges?.median || 0;
            });
            setFormData(initialValues);
        }
        } catch (error) {
        console.error('Error loading features:', error);
        // Fallback für Demo
        const defaultFeatures = [
            'HighBP', 'HighChol', 'BMI', 'Smoker', 'Stroke',
            'HeartDiseaseorAttack', 'PhysActivity', 'Fruits', 'Veggies',
            'HvyAlcoholConsump', 'GenHlth', 'MentHlth', 'PhysHlth',
            'Age', 'Education', 'Income'
        ];
        setFeatures(defaultFeatures);
        
        const defaultValues = {};
        defaultFeatures.forEach(feat => {
            defaultValues[feat] = feat === 'BMI' ? 25 : 0;
        });
        setFormData(defaultValues);
        } finally {
        setLoadingFeatures(false);
        }
  };

  const handleInputChange = (feature, value) => {
    setFormData(prev => ({
        ...prev,
        [feature]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getInputType = (feature) => {
    if(feature == 'BMI') return 'range';
    if(['HighBP', 'HighChol', 'Smoker', 'Stroke', 'HeartDiseaseorAttack', 'PhysActivity', 'Fruits', 'Veggies', 'HvyAlcoholConsump'].includes(feature)){
        return 'select';
    }
    return 'number';
  };

  const renderInput = (feature) => {
    const value = formData[feature] || 0;
    const ranges = featureRanges[feature] || { min: 0, max: 1, median: 0 };
    const type = getInputType(feature);

    if(type === 'select'){
        return(
            <select
                value={value}
                onChange={(e) => handleInputChange(feature, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value={0}>Nein</option>
                <option value={1}>Ja</option>
            </select>
        );
    }

    if (type === 'range'){
        return (
            <div className="space-y-2">
                <input
                    type="range"
                    min={ranges.min || 10}
                    max={ranges.max || 50}
                    step="0.5"
                    value={value}
                    onChange={(e) => handleInputChange(feature, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Min: {ranges.min || 10}</span>
                    <span className="font-bold">Aktuell: {value}</span>
                    <span>Max: {ranges.max || 50}</span>
                </div>
            </div>
      );
    }

    return (
      <input
        type="number"
        min={ranges.min}
        max={ranges.max}
        step="1"
        value={value}
        onChange={(e) => handleInputChange(feature, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    );
  };

  if (loadingFeatures){
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Diabetes-Risikofaktoren</h2>
        <p className="text-gray-600">
          Bitte geben Sie Ihre Gesundheitsdaten ein. Das System berechnet Ihr individuelles Diabetes-Risiko.
        </p>
        
        {!backendConnected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
            <FaExclamationTriangle className="text-yellow-500 mr-2" />
            <span className="text-yellow-700">
              Backend nicht verbunden. Verwende Demo-Modus mit vordefinierten Werten.
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={feature} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center justify-between">
                  <span>{FEATURE_LABELS[feature] || feature}</span>
                  <FaInfoCircle 
                    className="text-gray-400 text-sm cursor-help" 
                    title={FEATURE_DESCRIPTIONS[feature] || ''}
                  />
                </div>
              </label>
              {renderInput(feature)}
              <p className="text-xs text-gray-500">
                {FEATURE_DESCRIPTIONS[feature] || 'Wert eingeben'}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-diabetes-blue hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Berechne Risiko...
              </span>
            ) : 'Diabetes-Risiko berechnen'}
          </button>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Ihre Daten werden lokal verarbeitet und nicht gespeichert (DSGVO-konform).</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FeatureForm;