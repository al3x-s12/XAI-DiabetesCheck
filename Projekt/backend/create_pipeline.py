#!/usr/bin/env python
import joblib
import pandas as pd
import os

def create_safe_pipeline():
    """Erstellt eine sichere Pipeline ohne Funktionen"""
    
    # Pfade
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    
    # Alte Pipeline laden
    old_path = os.path.join(project_root, "ml", "model", "final_pipeline.joblib")
    print(f"Loading old pipeline from: {old_path}")
    
    old_data = joblib.load(old_path)
    
    # Neue Pipeline erstellen (ohne Funktionen)
    new_pipeline = {
        'model': old_data['model'],
        'explainer': old_data['explainer'],
        'features': old_data['features'],
        'feature_descriptions': old_data.get('feature_descriptions', {}),
        'feature_ranges': old_data.get('feature_ranges', {}),
        # Keine predict_function mehr!
    }
    
    # Speichern
    new_path = os.path.join(project_root, "ml", "model", "final_pipeline_safe.joblib")
    joblib.dump(new_pipeline, new_path)
    print(f"Saved safe pipeline to: {new_path}")
    
    # Auch als standard benennen
    standard_path = os.path.join(project_root, "ml", "model", "final_pipeline.joblib")
    joblib.dump(new_pipeline, standard_path)
    print(f"Also saved as standard pipeline: {standard_path}")
    
    return new_pipeline

if __name__ == "__main__":
    create_safe_pipeline()