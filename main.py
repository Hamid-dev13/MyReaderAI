# Créer un fichier main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
from extract_placeholders import extract_placeholders_from_docx

app = FastAPI(title="RAEDIFICARE Template API")

# Ajouter CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pour le développement, à restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API RAEDIFICARE Template"}

@app.post("/extract-placeholders/")
async def extract_placeholders(file: UploadFile = File(...)):
    """
    Extrait tous les placeholders d'un fichier template docx uploadé
    """
    # Vérifier que c'est bien un fichier docx
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format .docx")
    
    # Sauvegarder temporairement le fichier uploadé
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
    temp_file_path = temp_file.name
    
    try:
        # Écrire le contenu du fichier uploadé dans le fichier temporaire
        content = await file.read()
        with open(temp_file_path, "wb") as f:
            f.write(content)
        
        # Extraire les placeholders
        result = extract_placeholders_from_docx(temp_file_path)
        
        # Vérifier s'il y a eu une erreur
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
        
    finally:
        # Nettoyer le fichier temporaire
        temp_file.close()
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

@app.post("/analyze-template/")
async def analyze_template(file: UploadFile = File(...)):
    """
    Analyse complète d'un template: placeholders et structure
    """
    # Vérifier que c'est bien un fichier docx
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format .docx")
    
    # Sauvegarder temporairement le fichier uploadé
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
    temp_file_path = temp_file.name
    
    try:
        # Écrire le contenu du fichier uploadé dans le fichier temporaire
        content = await file.read()
        with open(temp_file_path, "wb") as f:
            f.write(content)
        
        # Extraire les placeholders
        placeholders = extract_placeholders_from_docx(temp_file_path)
        
        # Vérifier s'il y a eu une erreur
        if "error" in placeholders:
            raise HTTPException(status_code=500, detail=placeholders["error"])
        
        # Ajouter plus d'analyses ici si nécessaire
        # Par exemple, structure du document, sections, etc.
        
        return {
            "filename": file.filename,
            "placeholders": placeholders,
            # Ajouter d'autres informations d'analyse ici
        }
        
    finally:
        # Nettoyer le fichier temporaire
        temp_file.close()
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
