# Nutze ein schlankes Python-Image
FROM python:3.11-slim

WORKDIR /app

# System-Abhängigkeiten (falls nötig)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python-Abhängigkeiten installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Den Rest des Codes kopieren
COPY . .

# Flask braucht 0.0.0.0 um im Container erreichbar zu sein
ENV FLASK_HOST=0.0.0.0
ENV FLASK_PORT=5000
ENV FLASK_DEBUG=True

EXPOSE 5000

CMD ["python", "app.py"]