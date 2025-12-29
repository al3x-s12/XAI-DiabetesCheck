from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from ml_model import diabetes_model

# Blueprint erstellen - DIESE ZEILE MUSS ZUERST KOMMEN!
api_bp = Blueprint('api', __name__)


@api_bp.route('/features', methods=['GET'])
def get_features():
    """Gibt Informationen zu allen verfügbaren Features zurück"""
    try:
        if diabetes_model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded',
                'data': None
            }), 500
        
        # Direkter Zugriff auf die Attribute
        feature_info = {
            'features': diabetes_model.features,
            'feature_info': diabetes_model.feature_info,
            'feature_ranges': diabetes_model.feature_ranges
        }
        
        return jsonify({
            'success': True,
            'data': feature_info,
            'message': f"{len(feature_info['features'])} features available"
        })
    
    except Exception as e:
        import traceback
        error_details = f"{str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        print(f"Error in /api/features: {error_details}")
        
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e),
            'data': None
        }), 500


@api_bp.route('/predict', methods=['POST'])
def predict():
    """
    Macht eine Diabetes-Risiko Vorhersage
    
    Erwartet JSON im Format:
    {
        "HighBP": 1,
        "HighChol": 0,
        "BMI": 25.5,
        ...
    }
    """
    try:
        # JSON Daten validieren
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        if diabetes_model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded',
                'risk_percent': None
            }), 500
        
        # Eingabe validieren
        validation = diabetes_model.validate_input(data)
        
        if not validation['valid']:
            return jsonify({
                'success': False,
                'error': 'Invalid input data',
                'validation_errors': validation['errors'],
                'expected_features': diabetes_model.features
            }), 400
        
        # Vorhersage machen
        result = diabetes_model.predict(validation['validated_data'])
        
        if not result['success']:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Prediction failed'),
                'risk_percent': None
            }), 500
        
        # Erfolgreiche Antwort
        response = {
            'success': True,
            'prediction': {
                'risk_percent': result['risk_percent'],
                'risk_category': get_risk_category(result['risk_percent']),
                'message': result['message']
            },
            'explanations': {
                'top_positive': result['top_positive'],
                'top_negative': result['top_negative']
            },
            'shap_values': result['shap_values'],
            'features_used': result['features_used']
        }
        
        return jsonify(response)
    
    except BadRequest as e:
        # Spezieller Handler für JSON-Parsing-Fehler
        return jsonify({
            'success': False,
            'error': f'Invalid JSON: {str(e)}'
        }), 400
    
    except Exception as e:
        import traceback
        print(f"Error in /api/predict: {str(e)}\n{traceback.format_exc()}")
        
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}',
            'risk_percent': None
        }), 500


@api_bp.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Macht mehrere Vorhersagen auf einmal
    (Für spätere Erweiterung)
    """
    return jsonify({
        'success': False,
        'error': 'Batch prediction not implemented yet',
        'message': 'Use /api/predict for single predictions'
    }), 501


def get_risk_category(risk_percent: float) -> str:
    """Bestimmt die Risikokategorie basierend auf Prozent"""
    if risk_percent < 20:
        return "Niedrig"
    elif risk_percent < 50:
        return "Mittel"
    elif risk_percent < 75:
        return "Erhöht"
    else:
        return "Hoch"