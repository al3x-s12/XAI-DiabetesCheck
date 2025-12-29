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
    features.sort(kex=lambda x: x['abs_value'], reverse=True)

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
    risk = result['risk_percent']
    category = result['rist_category']

    explanations = []

    # Positive Einflüsse
    if result.get('top_positive'):
        pos_features = [item['features'] for item in result['top_positive']]
        if pos_features:
            explanations.append(f"Das Risiko wird erhöht durch: {', '.join(pos_features[:2])}")

    # Negative Einflüsse
    if result.get('top_negative'):
        neg_features = [item['feature'] for item in result['top_negative']]
        if neg_features:
            explanations.append(f"Das Risiko wird gesenkt durch: {', '.join(neg_features[:2])}")

    # Bais-Erklärung
    base_text = f"Ihr Diabetes-Risiko liegt bei {risk}% ({category}es Risiko)."

    if explanations:
        return f"{base_text} {' '.join(explanations)}"
    else:
        return base_text