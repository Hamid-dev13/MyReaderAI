# Raedificare - Plateforme de gestion des documents V3

Ce projet est une plateforme de gestion pour Raedificare, une entreprise spécialisée dans le réemploi de matériaux de construction. La plateforme permet de générer et suivre des documents V3 à partir de diagnostics de chantiers.

## Structure du projet

- **`/backend`** - Backend Python FastAPI qui fournit des services d'extraction et d'analyse
- **`/dashboard`** - Frontend Next.js qui affiche le tableau de bord et les informations V3

## Démarrage rapide

### Backend (Python/FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Le serveur backend sera disponible sur http://localhost:8000

### Frontend (Next.js)

```bash
cd dashboard
npm install
npm run dev
```

Le dashboard sera disponible sur http://localhost:3000

## Fonctionnalités

- Téléchargement et analyse des fichiers PDF et DOCX
- Extraction des données structurées
- Génération automatique de documents V3
- Suivi de l'avancement des documents
- Tableau de bord avec statistiques et indicateurs 