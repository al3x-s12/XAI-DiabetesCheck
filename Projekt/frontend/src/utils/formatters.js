// Feature Labels für deutsche Anzeige
export const FEATURE_LABELS = {
  'HighBP': 'Bluthochdruck',
  'HighChol': 'Hoher Cholesterin',
  'BMI': 'Body Mass Index (BMI)',
  'Smoker': 'Raucher',
  'Stroke': 'Schlaganfall in Vergangenheit',
  'HeartDiseaseorAttack': 'Herzerkrankung',
  'PhysActivity': 'Körperliche Aktivität',
  'Fruits': 'Obstkonsum',
  'Veggies': 'Gemüsekonsum',
  'HvyAlcoholConsump': 'Starker Alkoholkonsum',
  'GenHlth': 'Allgemeine Gesundheit',
  'MentHlth': 'Psychische Gesundheit (Tage/Monat)',
  'PhysHlth': 'Körperliche Gesundheit (Tage/Monat)',
  'Age': 'Altersgruppe',
  'Education': 'Bildungsstand',
  'Income': 'Einkommen'
};

// Feature Descriptions
export const FEATURE_DESCRIPTIONS = {
  'HighBP': '0 = Nein, 1 = Ja',
  'HighChol': '0 = Nein, 1 = Ja',
  'BMI': 'Kontinuierlich (z.B. 22.5)',
  'Smoker': '0 = Nein, 1 = Ja',
  'Stroke': '0 = Nein, 1 = Ja',
  'HeartDiseaseorAttack': '0 = Nein, 1 = Ja',
  'PhysActivity': '0 = Nein, 1 = Ja',
  'Fruits': '0 = Nein, 1 = Ja',
  'Veggies': '0 = Nein, 1 = Ja',
  'HvyAlcoholConsump': '0 = Nein, 1 = Ja',
  'GenHlth': '1 = Exzellent, 5 = Schlecht',
  'MentHlth': '0-30 Tage schlechter psychischer Gesundheit',
  'PhysHlth': '0-30 Tage schlechter körperlicher Gesundheit',
  'Age': '1 = 18-24, 13 = 80+',
  'Education': '1 = Kein Abschluss, 6 = College',
  'Income': '1 = <10k$, 8 = >75k$'
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
  if (percentage < 20) return { text: 'Niedrig', color: 'text-green-600', bg: 'bg-green-100' };
  if (percentage < 50) return { text: 'Mittel', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  if (percentage < 75) return { text: 'Erhöht', color: 'text-orange-600', bg: 'bg-orange-100' };
  return { text: 'Hoch', color: 'text-red-600', bg: 'bg-red-100' };
};

// SHAP-Werte für Visualisierung formatieren
export const formatShapForChart = (shapValues) => {
  if (!shapValues) return [];
  
  return Object.entries(shapValues)
    .map(([feature, value]) => ({
      feature: FEATURE_LABELS[feature] || feature,
      originalFeature: feature,
      value: parseFloat(value),
      absValue: Math.abs(parseFloat(value)),
      impact: value > 0 ? 'positive' : 'negative'
    }))
    .sort((a, b) => b.absValue - a.absValue)
    .slice(0, 10); // Top 10 Features
};
