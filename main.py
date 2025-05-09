from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import requests
from extract_placeholders import extract_placeholders_from_docx
from extract_placeholders_advanced import extract_placeholders_with_context, analyze_placeholder_types

app = FastAPI(title="RAEDIFICARE Template API")

# URL du webhook n8n
N8N_WEBHOOK_URL = "https://hamiddev13.app.n8n.cloud/webhook-test/raedificare-template"

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

@app.post("/analyze-template-advanced/")
async def analyze_template_advanced(file: UploadFile = File(...)):
    """
    Analyse avancée d'un template avec contexte des placeholders
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
        
        # Extraire les placeholders avec contexte
        placeholders = extract_placeholders_with_context(temp_file_path)
        
        # Vérifier s'il y a eu une erreur
        if "error" in placeholders:
            raise HTTPException(status_code=500, detail=placeholders["error"])
        
        # Analyser les types de placeholders
        placeholders_with_types = analyze_placeholder_types(placeholders)
        
        return placeholders_with_types
        
    finally:
        # Nettoyer le fichier temporaire
        temp_file.close()
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

# NOUVEL ENDPOINT POUR ENVOYER LES DONNÉES À N8N
@app.post("/send-to-n8n/")
async def send_to_n8n(file: UploadFile = File(...)):
    """
    Extrait les placeholders d'un template et les envoie à n8n
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
        
        # Extraire les placeholders avec contexte
        result = extract_placeholders_with_context(temp_file_path)
        
        # Vérifier s'il y a eu une erreur
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Analyser les types
        result = analyze_placeholder_types(result)
        
        # Préparer les données pour n8n
        placeholders_list = [ph["placeholder"] for ph in result["unique_placeholders"]]
        data_for_n8n = {
            "filename": file.filename,
            "total_found": result["total_found"],
            "unique_count": result["unique_count"],
            "placeholders": placeholders_list
        }
        
        # Envoyer à n8n
        try:
            n8n_response = requests.post(
                N8N_WEBHOOK_URL,
                json=data_for_n8n,
                headers={"Content-Type": "application/json"}
            )
            
            if n8n_response.status_code != 200:
                return {
                    "n8n_status": "error",
                    "status_code": n8n_response.status_code,
                    "error": f"Erreur n8n: {n8n_response.text}",
                    "placeholders_data": data_for_n8n
                }
                
            return {
                "n8n_status": "success",
                "status_code": n8n_response.status_code,
                "n8n_response": n8n_response.text,
                "placeholders_data": data_for_n8n
            }
            
        except Exception as e:
            return {
                "n8n_status": "error",
                "error": f"Erreur de connexion à n8n: {str(e)}",
                "placeholders_data": data_for_n8n
            }
        
    finally:
        # Nettoyer le fichier temporaire
        temp_file.close()
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

# Vous pouvez également ajouter un endpoint pour tester facilement la connexion à n8n
@app.post("/test-n8n-connection/")
async def test_n8n_connection():
    """
    Teste la connexion au webhook n8n avec des données de test
    """
    test_data = {
        "filename": "test_swagger.docx",
        "placeholders": ["test_placeholder_1", "test_placeholder_2", "test_placeholder_3"],
        "message": "Test depuis l'API Swagger"
    }
    
    try:
        n8n_response = requests.post(
            N8N_WEBHOOK_URL,
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        return {
            "n8n_status": "success" if n8n_response.status_code == 200 else "error",
            "status_code": n8n_response.status_code,
            "response": n8n_response.text
        }
        
    except Exception as e:
        return {
            "n8n_status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)