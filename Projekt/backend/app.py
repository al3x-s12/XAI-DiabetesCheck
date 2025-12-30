from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from api.routes import api_bp

# Environment Variablen laden
load_dotenv()

def create_app():
    """Erstellt und konfiguriert die Flask-App"""
    app = Flask(__name__)

    # CORS für Frontend-Zugriff
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Konfiguration
    app.config['JSON_SORT_KEYS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 #16MB limit

    # API Blueprint registrieren
    app.register_blueprint(api_bp, url_prefix='/api')

    # Error Handler
    @app.errorhandler(404)
    def not_fount(error):
        return jsonify({
            'success': False,
            'error': 'Endpoint not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
    
    # Health Check Endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Diabetes Risk Prediction API',
            'version': '1.0.0'
        })
    
    @app.route('/')
    def index():
        return jsonify({
            'service': 'Diabetes Risk Prediction API',
            'version': '1.0.0',
            'endpoints': {
                '/api/predict': 'POST - Vorhersage machen',
                '/api/features': 'GET - Feature Informationen',
                '/health': 'GET - Health Check'
            }
        })
    
    return app

if __name__ == '__main__':
    app = create_app()

    # Server starten
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

    print(f"Starting Diabetes Risk Prediction API on http://{host}:{port}")
    print(f"API Documentation available at http://{host}:{port}/")

    app.run(host=host, port=port, debug=debug)