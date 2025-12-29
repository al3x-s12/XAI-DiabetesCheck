#!/usr/bin/env python
"""
Erstellt eine neue Pipeline direkt aus den gespeicherten ML-Dateien
"""
import joblib
import pandas as pd
import numpy as np
import json
import os
import shap

def rebuild_pipeline_from_source():
    """Baut eine neue Pipeline aus den gespeicherten ML-Dateien"""
    
    # Pfade
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    ml_model_dir = os.path.join(project_root, "ml", "model")
    
    print("Rebuilding pipeline from source files...")
    
    # 1. Modell laden
    model_path = os.path.join(ml_model_dir, "random_forest_diabetes.pkl")
    print(f"Loading model from: {model_path}")
    model = joblib.load(model_path)
    
    # 2. SHAP Explainer laden
    explainer_path = os.path.join(ml_model_dir, "shap_explainer.pkl")
    print(f"Loading SHAP explainer from: {explainer_path}")
    explainer = joblib.load(explainer_path)
    
    # 3. Features laden
    features_path = os.path.join(ml_model_dir, "selected_features.json")
    print(f"Loading features from: {features_path}")
    with open(features_path, 'r') as f:
        features = json.load(f)
    
    # 4. Frontend Config für Feature-Info laden
    config_path = os.path.join(ml_model_dir, "frontend_config.json")
    print(f"Loading config from: {config_path}")
    with open(config_path, 'r', encoding='utf-8') as f:
        frontend_config = json.load(f)
    
    # 5. Originaldaten für Ranges laden
    data_path = os.path.join(project_root, "data", "diabetes_binary_health_indicators_BRFSS2015.csv")
    print(f"Loading data for ranges from: {data_path}")
    df = pd.read_csv(data_path)
    
    # 6. Feature Ranges berechnen
    feature_ranges = {}
    for feature in features:
        feature_ranges[feature] = {
            'min': float(df[feature].min()),
            'max': float(df[feature].max()),
            'median': float(df[feature].median()),
            'mean': float(df[feature].mean()),
            'std': float(df[feature].std())
        }
    
    # 7. Feature Descriptions (aus der alten Pipeline oder neu erstellen)
    feature_descriptions = {
        'HighBP': 'Bluthochdruck (0=Nein, 1=Ja)',
        'HighChol': 'Hoher Cholesterin (0=Nein, 1=Ja)',
        'BMI': 'Body Mass Index',
        'Smoker': 'Raucher (0=Nein, 1=Ja)',
        'Stroke': 'Schlaganfall in Vergangenheit (0=Nein, 1=Ja)',
        'HeartDiseaseorAttack': 'Herzerkrankung (0=Nein, 1=Ja)',
        'PhysActivity': 'Körperliche Aktivität (0=Nein, 1=Ja)',
        'Fruits': 'Obstkonsum (0=Nein, 1=Ja)',
        'Veggies': 'Gemüsekonsum (0=Nein, 1=Ja)',
        'HvyAlcoholConsump': 'Starker Alkoholkonsum (0=Nein, 1=Ja)',
        'GenHlth': 'Allgemeine Gesundheit (1=Exzellent, 5=Schlecht)',
        'MentHlth': 'Psychische Gesundheitstage (0-30 Tage)',
        'PhysHlth': 'Körperliche Gesundheitstage (0-30 Tage)',
        'Age': 'Altersgruppe (1=18-24, 13=80+)',
        'Education': 'Bildungsstand (1=Kein Abschluss, 6=College)',
        'Income': 'Einkommen (1=<10k$, 8=>75k$)'
    }
    
    # 8. Neue Pipeline erstellen (OHNE problematische Funktionen)
    new_pipeline = {
        'model': model,
        'explainer': explainer,
        'features': features,
        'feature_descriptions': feature_descriptions,
        'feature_ranges': feature_ranges,
        'model_info': {
            'type': type(model).__name__,
            'n_features': len(features),
            'timestamp': pd.Timestamp.now().isoformat()
        }
    }
    
    # 9. Speichern
    output_path = os.path.join(ml_model_dir, "final_pipeline_fixed.joblib")
    joblib.dump(new_pipeline, output_path, compress=3)
    print(f"\nSaved fixed pipeline to: {output_path}")
    
    # 10. Auch als Standard speichern (überschreibt die alte)
    standard_path = os.path.join(ml_model_dir, "final_pipeline.joblib")
    joblib.dump(new_pipeline, standard_path, compress=3)
    print(f"Also saved as standard pipeline: {standard_path}")
    
    # 11. Neue Config für Frontend speichern
    new_frontend_config = {
        'features': features,
        'default_values': {feature: feature_ranges[feature]['median'] for feature in features},
        'feature_info': feature_descriptions,
        'feature_ranges': feature_ranges
    }
    
    config_output_path = os.path.join(ml_model_dir, "frontend_config_fixed.json")
    with open(config_output_path, 'w', encoding='utf-8') as f:
        json.dump(new_frontend_config, f, indent=2, ensure_ascii=False)
    
    print(f"Saved fixed frontend config: {config_output_path}")
    
    return new_pipeline


def test_new_pipeline():
    """Testet die neue Pipeline"""
    print("\nTesting new pipeline...")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    pipeline_path = os.path.join(project_root, "ml", "model", "final_pipeline_fixed.joblib")
    
    pipeline = joblib.load(pipeline_path)
    
    print(f"Model type: {type(pipeline['model']).__name__}")
    print(f"Number of features: {len(pipeline['features'])}")
    print(f"Features: {pipeline['features'][:5]}...")
    print(f"Feature descriptions: {len(pipeline['feature_descriptions'])}")
    print(f"Feature ranges: {len(pipeline['feature_ranges'])}")
    
    # Teste ein paar Beispielwerte
    print("\nSample feature ranges:")
    for feature in list(pipeline['features'])[:3]:
        ranges = pipeline['feature_ranges'][feature]
        print(f"  {feature}: min={ranges['min']}, max={ranges['max']}, median={ranges['median']}")
    
    return pipeline


if __name__ == "__main__":
    print("=" * 60)
    print("Rebuilding ML Pipeline")
    print("=" * 60)
    
    # Pipeline neu erstellen
    pipeline = rebuild_pipeline_from_source()
    
    # Testen
    test_new_pipeline()
    
    print("\n" + "=" * 60)
    print("Pipeline successfully rebuilt!")
    print("=" * 60)