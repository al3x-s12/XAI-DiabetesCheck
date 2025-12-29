import joblib
import pandas as pd
import numpy as np
import json
import os
import warnings
from typing import Dict, Any

# Warnungen unterdrücken
warnings.filterwarnings('ignore', category=UserWarning)

class DiabetesModell:
    """Lädt das ML-Modell und stellt Vorhersage-Funktionen bereit"""
    
    def __init__(self, model_path: str = None):
        """
        Lädt das trainierte Modell und die Pipeline
        """
        try:
            # Standardpfad: Relativ zu dieser Datei
            if model_path is None:
                current_dir = os.path.dirname(os.path.abspath(__file__))  # backend/
                project_root = os.path.dirname(current_dir)  # Projekt/
                model_path = os.path.join(project_root, "ml", "model", "final_pipeline.joblib")
            
            print(f"Loading model from: {model_path}")
            
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Pipeline laden (ohne predict_function, die wir neu implementieren)
            pipeline_data = joblib.load(model_path)
            print("Model loaded successfully")
            
            # Komponenten extrahieren
            self.pipeline = joblib.load(model_path)
            self.model = self.pipeline['model']
            self.explainer = self.pipeline['explainer']
            self.features = self.pipeline['features']
            self.feature_info = self.pipeline.get('feature_descriptions', {})
            self.feature_ranges = self.pipeline.get('feature_ranges', {})
            
            print(f"✓ Model: {type(self.model).__name__}")
            print(f"✓ Features: {len(self.features)}")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Current working directory:", os.getcwd())
            raise
        
    def get_feature_info(self) -> Dict:
        """Gibt Informationen zu allen Features zurück"""
        try:
            # Verwende direkte Attribute-Zugriffe mit Fallbacks
            features = self.features if hasattr(self, 'features') else []
            feature_info = self.feature_info if hasattr(self, 'feature_info') else {}
            feature_ranges = self.feature_ranges if hasattr(self, 'feature_ranges') else {}
            
            return {
                'features': features,
                'feature_info': feature_info,
                'feature_ranges': feature_ranges
            }
        except Exception as e:
            print(f"Error in get_feature_info: {e}")
            # Fallback auf leere Strukturen
            return {
                'features': [],
                'feature_info': {},
                'feature_ranges': {}
            }
    
    def _prepare_features(self, input_features: Dict[str, float]) -> pd.DataFrame:
        """Bereitet Features für das Modell vor"""
        features_list = []
        for feature in self.features:
            if feature in input_features:
                val = input_features[feature]
                # Zu Float konvertieren
                if isinstance(val, (list, np.ndarray)):
                    features_list.append(float(val[0]))
                elif isinstance(val, (int, float, np.number)):
                    features_list.append(float(val))
                else:
                    features_list.append(float(self.feature_ranges.get(feature, {}).get('median', 0)))
            else:
                # Default: Median
                features_list.append(float(self.feature_ranges.get(feature, {}).get('median', 0)))
        
        return pd.DataFrame([features_list], columns=self.features)
    
    def _compute_shap_values(self, features_df: pd.DataFrame) -> Dict[str, float]:
        """Berechnet SHAP-Werte für eine Vorhersage"""
        shap_values_single = self.explainer.shap_values(features_df)
        
        # SHAP-Werte extrahieren
        if isinstance(shap_values_single, list) and len(shap_values_single) == 2:
            shap_vals = shap_values_single[1][0]  # Klasse Diabetes
        elif isinstance(shap_values_single, np.ndarray):
            if len(shap_values_single.shape) == 3:
                shap_vals = shap_values_single[0, :, 1]  # (1, n_features, 2)
            else:
                shap_vals = shap_values_single[0]
        else:
            shap_vals = shap_values_single[0]
        
        # Base value entfernen falls vorhanden
        if len(shap_vals) == len(self.features) + 1:
            shap_vals = shap_vals[:-1]
        
        # In Dictionary umwandeln
        shap_dict = {}
        for i, feature in enumerate(self.features):
            if i < len(shap_vals):
                val = shap_vals[i]
                if isinstance(val, (np.ndarray, list)):
                    shap_dict[feature] = float(val[0])
                else:
                    shap_dict[feature] = float(val)
            else:
                shap_dict[feature] = 0.0
        
        return shap_dict

    def predict_diabetes_risk(self, input_features: Dict[str, float]) -> Dict[str, Any]:
        """
        Hauptvorhersage-Funktion (ersetzt die Notebook-Funktion)
        """
        try:
            # Features vorbereiten
            features_df = self._prepare_features(input_features)
            
            # Vorhersage machen
            risk_probability = self.model.predict_proba(features_df)[0][1]
            
            # SHAP-Werte berechnen
            shap_dict = self._compute_shap_values(features_df)
            
            # Top Features ermitteln
            sorted_features = sorted(shap_dict.items(), key=lambda x: x[1], reverse=True)
            top_positive = sorted_features[:3]
            top_negative = sorted_features[-3:]
            
            return {
                'success': True,
                'risk_percent': round(float(risk_probability * 100), 1),
                'shap_values': shap_dict,
                'top_positive': [{'feature': f, 'impact': round(v, 4)} for f, v in top_positive],
                'top_negative': [{'feature': f, 'impact': round(v, 4)} for f, v in top_negative]
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def predict(self, input_data: Dict[str, float]) -> Dict[str, Any]:
        """API-kompatible Predict-Funktion"""
        result = self.predict_diabetes_risk(input_data)
        
        if not result['success']:
            return {
                'success': False,
                'error': result.get('error', 'Prediction failed'),
                'risk_percent': None,
                'shap_values': {}
            }
        
        return {
            'success': True,
            'risk_percent': result['risk_percent'],
            'shap_values': result['shap_values'],
            'top_positive': result['top_positive'],
            'top_negative': result['top_negative'],
            'features_used': self.features,
            'message': f"Diabetes-Risiko: {result['risk_percent']}%"
        }
        
    def validate_input(self, input_data: Dict) -> Dict:
        """Validiert Eingabedaten"""
        errors = []
        validated_data = {}
        
        for feature in self.features:
            if feature in input_data:
                try:
                    value = float(input_data[feature])
                    # Prüfe gegen Range
                    if feature in self.feature_ranges:
                        min_val = self.feature_ranges[feature]['min']
                        max_val = self.feature_ranges[feature]['max']
                        if value < min_val or value > max_val:
                            errors.append(f"{feature}: Wert {value} außerhalb [{min_val}, {max_val}]")
                    validated_data[feature] = value
                except ValueError:
                    errors.append(f"{feature}: Ungültiger Wert")
            else:
                errors.append(f"{feature}: Fehlender Wert")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'validated_data': validated_data
        }
    
# Singleton Instanz
try:
    diabetes_model = DiabetesModell()
    print("DiabetesModel erfolgreich initialisiert")
except Exception as e:
    print(f"Fehler bei DiabetesModel Initialisierung: {e}")
    diabetes_model = None