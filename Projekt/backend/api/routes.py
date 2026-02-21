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
                'error': 'Model not loaded'
            }), 500
        
        return jsonify({
            'success': True,
            'data': {
                'features': diabetes_model.features,
                'feature_info': diabetes_model.feature_info
            },
            'message': f"{len(diabetes_model.features)} features available"
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api_bp.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # 1. Validierung
        validation = diabetes_model.validate_input(data)
        if not validation['valid']:
            return jsonify({'success': False, 'errors': validation['errors']}), 400
        
        # 2. Vorhersage
        result = diabetes_model.predict(validation['validated_data'])

        # 3. Response-Mapping
        response = {
            'success': True,
            'risk_percent': result['risk_percent'],
            'risk_category': result['risk_level'], # Mapped von 'risk_level'
            'explanations': {
                'top_positive': result['top_positive'],
                'top_negative': result['top_negative']
            },
            'all_impacts': result['all_impacts'],
            'message': f"Diabetes-Risiko: {result['risk_percent']}% ({result['risk_level']})"
        }

        return jsonify(response)
    
    except BadRequest as e:
        return jsonify({'success': False, 'error': 'Invalid JSON format'}), 400

    except Exception as e:
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

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