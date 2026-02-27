import json
from datetime import datetime
from typing import Dict, Any

def log_prediction(input_data: Dict, result: Dict) -> None:
    """
    Loggt eine Vorhersage (ohne personenbezogene Daten)
    
    Wichtig: DSGVO-konform, keine personenbezogenen Daten speichern!
    """
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'risk_percent': result.get('risk_percent'),
        'risk_category': result.get('risk_category'),
        'feature_count': len(input_data),
        # Keine Feature-Werte speichern!
    }

    # In Praxis: In Log-Datei oder Monitoring-System schreiben
    print(f"[PREDICTION LOG] {json.dumps(log_entry)}")

def format_shap_for_frontend(shap_values: Dict) -> Dict:
    """
    Formatiert SHAP-Werte für das Frontend
    
    Returns:
        {
            'features': [
                {'name': 'HighBP', 'value': 0.123, 'impact': 'positive'},
                ...
            ],
            'top_increasing': [...],
            'top_decreasing': [...]
        }
    """
    features = []

    for feature, value in shap_values.items():
        impact = 'positive' if value > 0 else 'negative' if value < 0 else 'neutral'

        features.append({
            'name': feature,
            'value': round(value, 4),
            'impact': impact,
            'abs_value': round(abs(value), 4)
        })

    # Sortieren nach absoluten Wert
    features.sort(key=lambda x: x['abs_value'], reverse=True)

    # Top 5 für positive und negative
    top_increasing = [f for f in features if f['impact'] == 'positive'][:5]
    top_decreasing = [f for f in features if f['impact'] == 'negative'][:5]

    return {
        'features': features,
        'top_increasing': top_increasing,
        'top_decreasing': top_decreasing
    }

def generate_explanation_text(result: Dict) -> str:
    """Generiert einen erklärenden Text für die Vorhersage"""
    risk = result.get('risk_percent', 0)
    category = result.get('risk_category', 'Unbekannt')

    explanations = []
    explanations.append(f"Basierend auf Ihren Angaben besteht ein {category.lower()}es Risiko für Diabetes ({risk}%).")


    # Positive Einflüsse
    top_pos = result.get('explanations', {}).get('top_positive', [])
    if top_pos:
        drivers = [item['label'] for item in top_pos]
        explanations.append(f"Die stärksten Risikofaktoren sind: {', '.join(drivers)}.")
    
    # Negative Einflüsse
    top_neg = result.get('explanations', {}).get('top_negative', [])
    if top_neg:
        protectors = [item['label'] for item in top_neg]
        explanations.append(f"Positiv wirken sich aus: {', '.join(protectors)}.")

    return " ".join(explanations)