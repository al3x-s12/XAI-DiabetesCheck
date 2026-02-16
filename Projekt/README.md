# Phase 1 (Projektplanung)
## Datenquelle
* Datensatz: "Diabetes Health Indicators Dataset" (BRFSS2015)  
Quelle: http://kaggle.com/datasets/alexteboul/diabetes-health-indicators-dataset

## Features 
* Alter
* BMI 
* Allgemeine Gesundheit (1-5)
* Bluthochdruck
* Hoher Cholesterin
* Körperliche Aktivität
* Raucher
* Obstkonsum
* Gemüsekonsum
* Starker Alkoholkonsum
* Körperliche Gesundheitstage
* Psychische Gesundheitstage
* Geschlecht
* Bildungsstand
* Einkommen

## Architektur
* Frontend (React)
* Backend (Flask Webframework) 
* ML-Modell: Scikit-learn (z. B. Random Forest, XGBoost) 
* Explainable: SHAP (Shapley-Wert) für Erklärungen/Auswertungen
* Kommunikation: FAST-API zwischen Frontend und Backend

## Projektstruktur
```
projekt/
├── frontend/          # React
├── backend/           # Flask/FAST-API
├── ml/                # Modelltraining Ergebnisse
├── dokumentation/
├── data/              # Diabetes-Daten
├── notebooks/         # Python 
└── README.md
```

# Phase 2 (Daten & ML-Modell)
## Daten & ML-Modell
* Kaggle "Diabetes Health Indicators"

## Training
### Explorative Datenanalyse (EDA)  
* Auswahl der wichtisten Features  
* Pandas & Numpy für die Verarbeitung 
* Matplotlib & Seaborn: Um Grafiken und Diagramme zu erstellen.
* Datensatz hat ungefähr 253.000 Einträge
* Bildung von Gruppen (Abhängigkeiten)
* Ergebnis: selected_features.json

### Model Training
* Scikit-learn für die KI-Logik
* joblib zum Speichern des Modells
* Train-Test (80:20)
* Random Forest (balanced) da nur 14% Erkrankt sind
* Recall (0.762) Das Modell erkennt ca. 76 % der tatsächlichen Diabetiker korrekt.
* Top 3 (GenHlth, HighBP, BMI)
* Ergebnis: random forest (pkl)

### SHAP-Analyse
* Wie viel trägt jeder Wert bei ?
* Nur für Teilmenge, da sehr Rechenintensiv
* Ergebnis: Balkendiagramm, shap_explainer.pkl

### Modell exportieren
* Feature-Beschreibungen (z.B. GenHlth)
* Features ins Verhältnis setzen
* Ergebnis: frontend_json.config

# Phase 3 (Backend-Entwicklung)
## API bauen
* Kommunikation zwischen Fronted und Backend (FAST-API)

## Testen
* Sicherstellen, dass Daten korrekt verarbeitet werden

# Phase 4 (Frontend-Entwicklung)
## React-App
* Formular mit Eingabefeldern für alle Features
* Button, der Daten an Backend sendet

## Ergebnisanzeige
* Risiko in Prozent anzeigen
* SHAP-Werte als Liste darstellen

# Phase 5 (Explainability-Visualisierung)
## Visuelle SHAP-Darstellung
* Mit Chart.js, Plotly oder Recharts Balkendiagramm für Top-Features

## What-If-Analyse
* Slider für Features, die bei Änderung neue Vorhersage auslösen

## Responsive Design
* CSS-Frameworks (Tailwind, Bootstrap) oder Media Queries

## Evaluation vorbereiten
* Usability-Test-Fragebogen entwerfen (5–10 Personen)

# Phase 6 (Evaluation & Tests)
## Usability-Test durchführen

## Bugfixes

# Phase 7 (Dokumentation)
## Dokumentation schreiben
* Architekturbeschreibung
* Entscheidungen begründen
* Testergebnisse zusammenfassen
* Reflexion: Was lief gut, was nicht?

## Fragen
* Jede API genau in der Doku beschreiben?
* Wie genau muss der Explainable Teil erklären?
* Anforderungen? (Grafiken für Benutzer)