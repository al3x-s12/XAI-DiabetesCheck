import React, { useState, useEffect } from 'react';
import { getFeatures } from '../services/api';
import { FEATURE_LABELS, FEATURE_DESCRIPTIONS } from '../utils/formatters';
import { FaInfoCircle } from 'react-icons/fa';

const FEATURE_META = {
  HighBP:           { min: 0, max: 1, defaultValue: 0 },
  HighChol:         { min: 0, max: 1, defaultValue: 0 },
  BMI:              { min: 12, max: 98, defaultValue: 28 },
  Smoker:           { min: 0, max: 1, defaultValue: 0 },
  Stroke:           { min: 0, max: 1, defaultValue: 0 },
  HeartDiseaseorAttack: { min: 0, max: 1, defaultValue: 0 },
  PhysActivity:     { min: 0, max: 1, defaultValue: 1 },
  Fruits:           { min: 0, max: 1, defaultValue: 1 },
  Veggies:          { min: 0, max: 1, defaultValue: 1 },
  HvyAlcoholConsump:{ min: 0, max: 1, defaultValue: 0 },
  GenHlth:          { min: 1, max: 5, defaultValue: 1 },
  MentHlth:         { min: 0, max: 30, defaultValue: 0 },
  PhysHlth:         { min: 0, max: 30, defaultValue: 0 },
  Age:              { min: 1, max: 13, defaultValue: 5 },
  Education:        { min: 1, max: 6, defaultValue: 3 },
  Income:           { min: 1, max: 8, defaultValue: 5 },
};

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

const FeatureForm = ({onSubmit, isLoading, backendConnected}) => {
    const [features, setFeatures] = useState([]);
    const [featureInfo, setFeatureInfo] = useState({});
    const [formData, setFormData] = useState({});
    const [loadingFeatures, setLoadingFeatures] = useState(true);
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [ageYear, setAgeYear] = useState(40); // aktueller Alterswert in Jahren

    useEffect(() => {
        if (formData.Age !== undefined) {
        setAgeYear(classToAge(formData.Age));
        }
    }, [formData.Age]);

    const buildFallbackState = () => {
        const featureList = Object.keys(FEATURE_META);
        const info = {};
        const initial = {};

        featureList.forEach(feature => {
            const meta = FEATURE_META[feature];
            info[feature] = { min: meta.min, max: meta.max };
            initial[feature] = meta.defaultValue;
        });

        setFeatures(featureList);
        setFeatureInfo(info);
        setFormData(initial);
        setLoadingFeatures(false);
    };

    useEffect(() => {
        if(backendConnected) {
            loadFeatureInfo();
        } else {
            buildFallbackState();
        }
    }, [backendConnected]);

    const loadFeatureInfo = async () => {
        try {
            const response = await getFeatures();
            if (response.success) {
                // Backend liefert jetzt 'feature_info' dictionary mit min/max/median
                const backendInfo = response.data.feature_info || {};
                const backendFeatures = response.data.features || [];
                
                const featureList = backendFeatures.length > 0 ? backendFeatures : Object.keys(FEATURE_META);

                const combinedInfo = {};
                const initialValues = {};

                featureList.forEach(feature => {
                    if (backendInfo[feature]) {
                        // Backend hat vollständige info (min, max, median)
                        combinedInfo[feature] = {
                            min: backendInfo[feature].min,
                            max: backendInfo[feature].max,
                        }
                    } else if (FEATURE_META[feature]) {
                        // Feature existiert in unseren Meta-Daten → Fallback verwenden
                        combinedInfo[feature] = {
                        min: FEATURE_META[feature].min,
                        max: FEATURE_META[feature].max,
                        };
                        initialValues[feature] = FEATURE_META[feature].defaultValue;
                    } else {
                        // Unbekanntes Feature (sollte nicht vorkommen) – minimale Behelfsdaten
                        combinedInfo[feature] = { min: 0, max: 1 };
                    }

                    initialValues[feature] = FEATURE_META[feature]?.defaultValue ?? 0;
                });

                setFeatures(featureList);
                setFeatureInfo(combinedInfo);
                setFormData(initialValues);
                
            } else {
                buildFallbackState();
            }
        } catch (error) {
            console.error('Error loading features:', error);
            buildFallbackState();
        } finally {
            setLoadingFeatures(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

  const renderInput = (feature) => {

    if (feature === 'Age') {
      const handleAgeChange = (e) => {
        const years = parseInt(e.target.value, 10);
        setAgeYear(years);
        const newClass = ageToClass(years);
        setFormData(prev => ({ ...prev, [feature]: newClass }));
      };

      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={18}
            max={90}
            step={1}
            value={ageYear}
            onChange={handleAgeChange}
            style={{
              width: '192px',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '8px',
              appearance: 'none',
              cursor: 'pointer',
              accentColor: '#2563eb',
            }}
          />
          <span
            style={{
              marginLeft: '10px',
              fontFamily: 'monospace',
              fontWeight: '500',
              color: '#374151',
              minWidth: '40px',
            }}
          >
            {ageYear}
          </span>
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
      const currentValue = formData[feature] || 1;
      const displayText = educationLabels[currentValue] || currentValue;

      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            name={feature}
            min={1}
            max={6}
            step={1}
            value={currentValue}
            onChange={handleChange}
            style={{
              width: '192px',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '8px',
              appearance: 'none',
              cursor: 'pointer',
              accentColor: '#2563eb',
            }}
          />
          <span
            style={{
              marginLeft: '10px',
              fontFamily: 'monospace',
              fontWeight: '500',
              color: '#374151',
              minWidth: '120px',
            }}
          >
            {displayText}
          </span>
        </div>
      );
    }

    // Spezialbehandlung für Einkommen
    if (feature === 'Income') {
      const incomeLabels = {
        1: 'Weniger als 10.000$',
        2: '~10.000$',
        3: '~15.000$',
        4: '~20.000$',
        5: '~25.000$',
        6: '~35.000$',
        7: '~50.000$',
        8: 'Mehr als 75.000$'
      };
      const currentValue = formData[feature] || 1;
      const displayText = incomeLabels[currentValue] || currentValue;

      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            name={feature}
            min={1}
            max={8}
            step={1}
            value={currentValue}
            onChange={handleChange}
            style={{
              width: '192px',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '8px',
              appearance: 'none',
              cursor: 'pointer',
              accentColor: '#2563eb',
            }}
          />
          <span
            style={{
              marginLeft: '10px',
              fontFamily: 'monospace',
              fontWeight: '500',
              color: '#374151',
              minWidth: '140px',
            }}
          >
            {displayText}
          </span>
        </div>
      );
    }

        const info = featureInfo[feature] || { min: 0, max: 1 };
        const min = info.min;
        const max = info.max;
        const isBinary = (min === 0 && max === 1 && (max - min === 1));

        if (isBinary) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                <select
                    name={feature}
                    value={formData[feature] || 0}
                    onChange={handleChange}
                    style={{
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                    }}
                >
                    <option value={0}>Nein / Niedrig</option>
                    <option value={1}>Ja / Hoch</option>
                </select>
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                type="range"
                name={feature}
                min={min}
                max={max}
                step={feature === 'BMI' ? 0.1 : 1}
                value={formData[feature] || 0}
                onChange={handleChange}
                style={{
                    width: '192px',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '8px',
                    appearance: 'none',
                    cursor: 'pointer',
                    accentColor: '#2563eb',
                }}
                />
                <span
                style={{
                    marginLeft: '10px',
                    fontFamily: 'monospace',
                    fontWeight: '500',
                    color: '#374151',
                    minWidth: '40px',
                }}
                >
                {formData[feature]}
                </span>
            </div>
        );
    };

   if (loadingFeatures) {
    return (
      <div style={{ textAlign: 'center', padding: '16px' }}>
        Lade Formular...
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '600px',
          overflowY: 'auto',
          paddingRight: '8px',
          textAlign: 'left',
          // custom scrollbar (nicht Tailwind, deshalb hier manuell definiert)
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
        }}
        // Für Webkit-Browser (Chrome, Safari) zusätzlich via style? Geht nicht direkt, aber man kann ein globales CSS verwenden oder akzeptieren.
        // Wir lassen es erstmal so; der Benutzer kann bei Bedarf eine globale CSS-Datei anpassen.
      >
        {features.map(feature => (
          <div
            key={feature}
            style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid transparent',
              transition: 'background-color 0.2s, border-color 0.2s',
            }}
          >
            {/* Label mit Info-Icon und Tooltip */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '8px',
              }}
            >
              <span>
                {featureInfo[feature]?.label || FEATURE_LABELS[feature] || feature}
              </span>

              <div
                style={{ marginLeft: '5px', position: 'relative', display: 'flex', alignItems: 'center' }}
                onMouseEnter={() => setHoveredFeature(feature)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <FaInfoCircle style={{ color: '#94a3b8', cursor: 'help', fontSize: '12px' }} />
                {hoveredFeature === feature && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '100%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      marginLeft: '8px',
                      padding: '4px 8px',
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      fontSize: '14px',
                      borderRadius: '4px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      whiteSpace: 'nowrap',
                      zIndex: 20,
                    }}
                  >
                    {FEATURE_DESCRIPTIONS[feature] || 'Keine Beschreibung'}
                  </div>
                )}
              </div>
            </label>

            {/* Input-Bereich */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              {renderInput(feature)}
            </div>
            <br />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          padding: '12px 16px',
          borderRadius: '6px',
          fontWeight: '600',
          color: '#ffffff',
          marginTop: '16px',
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
          boxShadow: isLoading ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.1)',
          transition: 'background-color 0.2s, box-shadow 0.2s',
        }}
      >
        {isLoading ? 'Berechne...' : 'Risiko Analyse starten'}
      </button>
    </form>
  );
};

export default FeatureForm;