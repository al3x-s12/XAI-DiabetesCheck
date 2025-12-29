import joblib
import pandas as pd
import numpy as np
import json
import os
from typing import Dict, Any, Optional

class DiabetesModell:
    """Lädt das ML-Modell und stellt Vorhersage-Funktionen bereit"""
    
    def __init__(self, model_path: str = "../ml/model/final_pipeline.joblib"):
        """
        Lädt das trainierte Modell und die Pipeline
        
        Args:
            model_path: Pfad zur gespeicherten Pipeline
        """

        try:
            # Pfad relativ zum Backend anpassen
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            full_path = os.path.join(base_dir, model_path)

            print("Loading model from: {full_path}")
            self.pipeline = joblib.load(full_path)
            print("Model loaded successfully")

            # Komponenten extrahieren
            self.model = self.pipeline['model']
            self.explainer = self.pipeline['explainer']
            self.features = self.pipeline['features']
            self.predict_function = self.pipeline['predict_function']
            self.feature_info = self.pipeline.get('feature_descriptions', {})

            print(f"Model: {type(self.model).__name__}")
            print(f"Features: {len(self.features)}")

        except Exception as e:
            print(f"Error loading model: {e}")
            raise
        
    def get_feature_info(self) -> Dict:
        """Gibt Informationen zu allen Features zurück"""
        return{
            'features': self.features,
            'feature_info': self.feature_info,
            'feature_ranges': self.pipeline.get('feature_ranges', {})
        }
    
    def prefict(self, input_data: Dict[str, float]) -> Dict[str, Any]:
        """
        Macht eine Vorhersage basierend auf Eingabedaten
        
        Args:
            input_data: Dictionary mit Feature-Werten
            
        Returns:
            Dictionary mit Vorhersage und Erklärungen
        """

        try:
            # Validierung: Alle benötigten Features vorhanden?
            for feature in self.features:
                if feature not in input_data:
                    # Verwende Median als Default
                    input_data[feature] = self.pipeline['feature_ranges'][feature]['median']

            # Vorhersage machen
            result = self.predict_function(input_data)

            if not result['success']:
                return {
                    'success': False,
                    'error': result['error'],
                    'risk_percent': None,
                    'shap_values': {}
                }
            
            # Erfolgreiches Ergebnis zurückgeben
            return {
                'success': True,
                'risk_percent': result['risk_percent'],
                'shap_values': result['shap_values'],
                'top_positive': result['top_positive'],
                'top_negative': result['top_negative'],
                'features_used': self.features,
                'message': f"Diabetes-Risiko: {result['risk_percent']}%"
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'risk_percent': None,
                'shap_values': {}
            }
        
    def valid_input(self, input_data: Dict) -> Dict:
        """
        Validiert die Eingabedaten
        
        Returns:
            Dictionary mit Validierungsstatus und ggf. Fehlern
        """
        
        errors = []
        validated_data = {}

        for feature in self.features:
            if feature in input_data:
                try:
                    value = float(input_data[feature])
                    # Prüfe gegen bekannte Range
                    if feature in self.pipeline.get('feature_ranges', {}):
                        min_val = self.pipeline['feature_ranges'][feature]['min']
                        max_val = self.pipeline['feature_ranges'][feature]['max']
                        
                        if value < min_val or value > max_val:
                            errors.append(f"{feature}: Wert {value} außerhalb des erwarteten Bereichs [{min_val}, {max_val}]")
                            validated_data[feature] = value
                
                except ValueError:
                    errors.append(f"{feature}: Ungültiger Wert '{input_data[feature]}'")

            else:
                errors.append(f"{feature}: Fehlender Wert")

        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'validated_data': validated_data
        }
    
# Singleton Instanz
diabetes_model = DiabetesModell()