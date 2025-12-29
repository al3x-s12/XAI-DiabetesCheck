# Anforderungen
* Datensatz: "Diabetes Health Indicators Dataset" (CDC BRFSS, Kaggle)
* Features (Alter, BMI, Allgemeine Gesundheit (1-5), Bluthochdruck, Hoher Cholesterin, Körperliche Aktivität, Raucher, Obstkonsum, Gemüsekonsum, Starker Alkoholkonsum, Körperliche Gesundheitstage, Psychische Gesundheitstage, Geschlecht, Bildungsstand, Einkommen)

# Architektur
* Frontend (React)
* Backend (Flask oder FastAPI)
* ML-Modell: Scikit-learn (z. B. Random Forest, XGBoost) + SHAP für Erklärungen
* Kommunikation: REST-API zwischen Frontend und Backend

# Projektstruktur
```
projekt/
├── frontend/          # React-App
├── backend/           # Flask/FastAPI
├── ml/                # Modelltraining, SHAP-Logik
├── dokumentation/
└── README.md
```
# Phase 2
## Daten & ML-Modell
* z.B. Kaggle "Diabetes Health Indicators"
* Daten bereinigen, Features auswählen

## Basismodell trainieren
* Einfaches Modell (Logistic Regression oder Random Forest) erstellen
* Metriken prüfen (Accuracy, Precision, Recall, AUC)

## SHAP-Integration testen
* SHAP-Werte für Beispielvorhersagen berechnen
* Prüfen, ob die Erklärungen sinnvoll sind

# Phase 3
## Einfache API bauen
* Endpoint /predict mit POST (empfängt JSON mit Features)
* Modell laden und Vorhersage + SHAP-Werte zurückgeben

## Testen
* Sicherstellen, dass Daten korrekt verarbeitet werden

# Phase 4
## React-App
* Formular mit Eingabefeldern für alle Features
* Submit-Button, der Daten an Backend sendet

## Ergebnisanzeige
* Risiko in Prozent anzeigen
* SHAP-Werte als Liste darstellen

## Verbindung zum Backend
* Fetch oder Axios nutzen

# Phase 5
## Visuelle SHAP-Darstellung
* Mit Chart.js, Plotly oder Recharts Balkendiagramm für Top-Features

## What-If-Analyse
* Slider für Features, die bei Änderung neue Vorhersage auslösen

## Responsive Design
* CSS-Framework (Tailwind, Bootstrap) oder Media Queries

## Evaluation vorbereiten
* Usability-Test-Fragebogen entwerfen (5–10 Personen)

# Phase 6
## Usability-Test durchführen

## Feinschliff & Bugfixes

## Dokumentation schreiben
* Architekturbeschreibung
* Entscheidungen begründen
* Testergebnisse zusammenfassen
* Reflexion: Was lief gut, was nicht?