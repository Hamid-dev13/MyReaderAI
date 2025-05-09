# Backend Raedificare

Ce backend FastAPI fournit des fonctionnalités d'extraction et de traitement pour le dashboard Raedificare.

## Fonctionnalités

- Extraction de placeholders depuis des fichiers DOCX
- Extraction de texte depuis des fichiers PDF
- Traitement des données pour générer des documents V3
- Analyse avancée des templates

## Installation

```bash
pip install -r requirements.txt
```

## Démarrer le serveur en développement

```bash
uvicorn main:app --reload
```

## Démarrer le serveur en production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Endpoints API

- `POST /extract-placeholders/` - Extrait les placeholders d'un fichier DOCX
- `POST /extract-pdf-text/` - Extrait le texte d'un fichier PDF
- `POST /process-text-for-v3/` - Traite le texte pour générer des données V3
- `POST /analyze-template-advanced/` - Analyse avancée d'un template DOCX 