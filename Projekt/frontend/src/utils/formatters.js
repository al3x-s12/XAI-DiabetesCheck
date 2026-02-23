// Feature Labels für deutsche Anzeige
export const FEATURE_LABELS = {
  'HighBP': 'Bluthochdruck',
  'HighChol': 'Hoher Cholesterinwert',
  'BMI': 'Body-Mass-Index',
  'Smoker': 'Raucher',
  'Stroke': 'Schlaganfall',
  'HeartDiseaseorAttack': 'Herzprobleme',
  'PhysActivity': 'Körperliche Aktivität',
  'Fruits': 'Obstkonsum',
  'Veggies': 'Gemüsekonsum',
  'HvyAlcoholConsump': 'Hoher Alkoholkonsum',
  'GenHlth': 'Gesundheitszustand',
  'MentHlth': 'Tage schlechter mentaler Gesundheit',
  'PhysHlth': 'Tage schlechter physischer Gesundheit',
  'Age': 'Alter',
  'Education': 'Bildungsabschluss',
  'Income': 'Jährliches Einkommen'
};

// Feature Descriptions
export const FEATURE_DESCRIPTIONS = {
  'HighBP': 'Wurde jemals festegestellt?',
  'HighChol': 'Wurde jemals festgestellt?',
  'BMI': 'Wie hoch ist Ihr BMI?',
  'Smoker': 'Jemals mehr als 100 Zigaretten?',
  'Stroke': 'Hatten Sie jemals einen Schlaganfall?',
  'HeartDiseaseorAttack': 'Herzerkrankung oder Herzinfarkt',
  'PhysActivity': 'Machen Sie Sport?',
  'Fruits': 'Essen Sie täglich Obst?',
  'Veggies': 'Essen Sie täglich Gemüse?',
  'HvyAlcoholConsump': 'Mehr als 10 Getränke pro Woche?',
  'GenHlth': '1=Ausgezeichnet, 5=Schlecht',
  'MentHlth': '0-30 der letzten Tage',
  'PhysHlth': '0-30 der letzten Tage',
  'Age': 'Wie alt sind Sie?',
  'Education': 'Wie hoch ist Ihr Bildungsabschluss?',
  'Income': 'Wie hoch ist Ihr jährliches Einkommen?'
};

// Formatierung von Werten
export const formatFeatureValue = (feature, value) => {
  if (feature === 'BMI') {
    return parseFloat(value).toFixed(1);
  }
  return Math.round(value);
};

// Risiko-Kategorie mit Farbe
export const getRiskCategory = (percentage) => {
  if (percentage < 15) {
    return {
      text: 'Niedrig',
      color: '#16a34a',       // green-600 für Text
      bgColor: '#f0fdf4',     // green-50 für Hintergrund
      strokeColor: '#16a34a', // green-600 für den Kreisbogen
    };
  }
  if (percentage < 35) {
    return {
      text: 'Mittel',
      color: '#ca8a04',       // yellow-600
      bgColor: '#fefce8',     // yellow-50
      strokeColor: '#ca8a04',
    };
  }
  return {
    text: 'Hoch',
    color: '#dc2626',         // red-600
    bgColor: '#fef2f2',       // red-50
    strokeColor: '#dc2626',
  };
};

// SHAP-Werte für Visualisierung formatieren
export const formatShapForChart = (allImpacts) => {
  if (!allImpacts || !Array.isArray(allImpacts)) return [];

  return allImpacts.map(item => ({
    name: item.label || item.feature, // Deutsches Label bevorzugen
    shapValue: item.impact,       // Der Wert für den Balken
    featureValue: item.value,         // Der eingegebene Wert (für Tooltip)
    fill: item.impact > 0 ? '#ef4444' : '#22c55e' // Rot für Risiko, Grün für Schutz
  }));
};
