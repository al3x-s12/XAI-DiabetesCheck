import pytest
import sys
import os

# Dem Systempfad das backend-Verzeichnis hinzufügen
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.insert(0, backend_dir)

from app import create_app
import json


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Testet den Health Check Endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_features_enpoint(client):
    """Testet den Features Endpoint"""
    response = client.get('/api/features')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True
    assert 'features' in data['data']

def test_predict_enpoint_valid(client):
    """Testet die Vorhersage mit gültigen Daten"""
    # Minimales Test-Set
    test_data = {
        'HighBP': 0,
        'HighChol': 0,
        'BMI': 25.0,
        'Smoker': 0,
        'Stroke': 0,
        'HeartDiseaseorAttack': 0,
        'PhysActivity': 1,
        'Fruits': 1,
        'Veggies': 1,
        'HvyAlcoholConsump': 0,
        'GenHlth': 2,
        'MentHlth': 0,
        'PhysHlth': 0,
        'Age': 5,
        'Education': 4,
        'Income': 6
    }

    response = client.post('/api/predict',
                           json=test_data,
                           content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True
    assert 'risk_percent' in data['prediction']
    assert 0 <= data['prediction']['risk_percent'] <= 100

def test_predict_endpoint_invalid_json(client):
    """Testet mit ungültigem JSON"""
    response = client.post('/api/predict',
                           data = "invalid json",
                           content_type='application/json')
    assert response.status_code == 400

def test_predict_endpoint_missing_data(client):
    """Testet mit fehlenden Daten"""
    response = client.post('/api/predict',
                           json={'HighBP': 1},
                           content_type='application/json')
    
    # Sollte einen 400 Fehler geben, weil Daten fehlen
    assert response.status_code == 400  # Geändert von 200 auf 400
    data = json.loads(response.data)
    assert data['success'] == False
    assert 'validation_errors' in data  # Es sollten Validierungsfehler zurückgegeben werden


if __name__ == '__main__':
    'Manuelle Tests ausführen'
    pytest.main(['-v', __file__])