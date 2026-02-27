import pytest
import sys
import os
import json

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.insert(0, backend_dir)

from app import create_app

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

def test_features_endpoint(client):
    """Testet den Features Endpoint"""
    response = client.get('/api/features')
    assert response.status_code == 200
    data = json.loads(response.data)

    assert data['success'] == True
    assert 'features' in data['data']
    assert 'feature_info' in data['data']
    assert len(data['data']['features']) > 0

def test_predict_enpoint_valid(client):
    """Testet die Vorhersage mit vollständigen Daten"""
    test_data = {
        'HighBP': 1,
        'HighChol': 1,
        'BMI': 30.0,
        'Smoker': 1,
        'Stroke': 0,
        'HeartDiseaseorAttack': 0,
        'PhysActivity': 0,
        'Fruits': 0,
        'Veggies': 1,
        'HvyAlcoholConsump': 0,
        'GenHlth': 3,
        'MentHlth': 5,
        'PhysHlth': 2,
        'Age': 9,
        'Education': 4,
        'Income': 5
    }

    response = client.post('/api/predict',
                           json=test_data,
                           content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)

    assert data['success'] == True
    assert 'risk_percent' in data
    assert 'risk_category' in data
    assert 'explanations' in data

    assert isinstance(data['risk_percent'], float)
    assert data['risk_category'] in ['Niedrig', 'Mittel', 'Hoch']
    assert len(data['explanations']['top_positive']) >= 0

def test_predict_endpoint_partial_data(client):
    partial_data = {
        'BMI': 40.0,
        'Age': 10
        # Rest fehlt = Median
    }

    response = client.post('/api/predict',
                           json=partial_data,
                           content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True
    assert data['risk_percent'] > 0

def test_predict_endpoint_invalid_values(client):
    invalid_data = {
        'BMI': 200.0,   # Zu hoch (unrealistisch)
        'Age': 25       # Range ist meist 1-13 (Kategorien)
    }

    response = client.post('/api/predict',
                           json=invalid_data,
                           content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['success'] == False
    assert 'errors' in data
    assert len(data['errors']) > 0

def test_predict_endpoint_invalid_json(client):
    """Testet mit ungültigem JSON"""
    response = client.post('/api/predict',
                           data = "das ist kein json",
                           content_type='application/json')
    assert response.status_code == 400

def test_predict_endpoint_missing_data(client):
    """Testet mit fehlenden Daten"""
    response = client.post('/api/predict',
                           json={'HighBP': 1},
                           content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True


if __name__ == '__main__':
    'Manuelle Tests ausführen'
    pytest.main(['-v', __file__])