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
    
    def __init__(self, model_dir: str = None):
        """
        Lädt das trainierte Modell und die Pipeline
        """
        try:
            # Standardpfad: Relativ zu dieser Datei
            if model_dir is None:
                if os.path.exists("/app/ml/model"):
                    model_dir = "/app/ml/model"
                else:
                    # 2. Versuch: Lokaler Pfad (Fallback)
                    current_dir = os.path.dirname(os.path.abspath(__file__))
                    project_root = os.path.dirname(current_dir)
                    model_dir = os.path.join(project_root, "ml", "model")

            print(f"Suche Modelle im Verzeichnis: {model_dir}")
            
            # Pfade definieren
            pipeline_path = os.path.join(model_dir, "final_model_pipeline.joblib")
            explainer_path = os.path.join(model_dir, "shap_explainer.pkl")
            config_path = os.path.join(model_dir, "frontend_config.json")
            
            print(f"Lade Modell-Komponenten aus: {model_dir}")

            # Komponenten extrahieren
            self.pipeline = joblib.load(pipeline_path)
            self.explainer = joblib.load(explainer_path)
            
            # Frontend Config laden
            with open(config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)

            self.features = self.config['features']
            self.feature_info = self.config['feature_info']

            print("Backend erfolgreich auf Pipeline-Modus umgestellt.")
    
        except Exception as e:
            print(f"Initialisierungsfehler: {e}")
            raise e

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
        Hauptvorhersage-Funktion
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
        """Berechnet Risiko und SHAP-Einflussfaktoren"""
        # DataFrame in korrekter Reihenfolge erstellen
        ordered_data = [input_data.get(f, self.feature_info[f]['default']) for f in self.features]
        df_input = pd.DataFrame([ordered_data], columns=self.features)
        
        # 1. Risiko-Wahrscheinlichkeit (Pipeline skaliert automatisch)
        risk_proba = self.pipeline.predict_proba(df_input)[0][1]
        
        # 2. SHAP Werte berechnen
        # Wir müssen die Daten für den Explainer manuell durch den Scaler der Pipeline schicken
        scaler = self.pipeline.named_steps['scaler']
        rf_model = self.pipeline.named_steps['clf']
        
        input_scaled = scaler.transform(df_input)
        shap_values = self.explainer.shap_values(input_scaled)
        
        # SHAP-Werte für Klasse 1 (Diabetes) extrahieren
        if isinstance(shap_values, list):
            shap_vals_class1 = shap_values[1][0]
        elif len(shap_values.shape) == 3:
            shap_vals_class1 = shap_values[0, :, 1]
        else:
            shap_vals_class1 = shap_values[0]

        # Feature Impacts aufbereiten
        impacts = []
        for i, feature in enumerate(self.features):
            impacts.append({
                'feature': feature,
                'label': self.feature_info[feature]['label'],
                'impact': float(shap_vals_class1[i]),
                'value': float(ordered_data[i])
            })
            
        # Sortieren nach Einfluss
        impacts_sorted = sorted(impacts, key=lambda x: x['impact'], reverse=True)
        
        return {
            'success': True,
            'risk_percent': round(float(risk_proba * 100), 1),
            'risk_level': 'Hoch' if risk_proba > 0.5 else 'Mittel' if risk_proba > 0.2 else 'Niedrig',
            'top_positive': impacts_sorted[:3],
            'top_negative': impacts_sorted[-3:],
            'all_impacts': impacts
        }
        
    def validate_input(self, input_data: Dict) -> Dict:
        """Validiert Eingabedaten"""
        errors = []
        validated_data = {}
        
        for feature in self.features:
            if feature in input_data:
                try:
                    val = float(input_data[feature])
                    f_min = self.feature_info[feature]['min']
                    f_max = self.feature_info[feature]['max']

                    if not (f_min <= val <= f_max):
                        errors.append(f"{self.feature_info[feature]['label']} außerhalb Bereich ({f_min}-{f_max})")
                    validated_data[feature] = val
                except ValueError:
                    errors.append(f"{feature} muss eine Zahl sein")
            else:
                validated_data[feature] = self.feature_info[feature]['default']
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'validated_data': validated_data
        }
    
# Singleton Instanz
try:
    diabetes_model = DiabetesModell()
    print("MODELL ERFOLGREICH GELADEN!")
except Exception as e:
    print(f"Fehlerdetails: {e}")
    diabetes_model = None