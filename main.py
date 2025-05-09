from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import requests
from extract_placeholders import extract_placeholders_from_docx
from extract_placeholders_advanced import extract_placeholders_with_context, analyze_placeholder_types
# Remplacer PyPDF2 par pdfminer.six
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams
from typing import Dict, Any, Optional
from pydantic import BaseModel

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

# Fonction d'extraction de texte PDF améliorée avec pdfminer.six
def extract_text_from_pdf(file_path):
    """
    Extrait tout le texte d'un fichier PDF en utilisant pdfminer.six
    """
    try:
        if not os.path.exists(file_path):
            return {"error": "Le fichier n'existe pas"}
            
        # Utiliser pdfminer avec des paramètres optimisés pour une meilleure extraction
        laparams = LAParams(
            line_margin=0.5,
            word_margin=0.1,
            char_margin=2.0,
            all_texts=True
        )
        
        # Extraire tout le texte du PDF
        full_text = extract_text(
            file_path,
            laparams=laparams,
            codec='utf-8'
        )
        
        # Compter approximativement le nombre de pages (basé sur les sauts de page)
        page_breaks = full_text.count('\f') + 1
        
        return {
            "success": True,
            "total_pages": page_breaks,
            "text": full_text
        }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Erreur lors de l'extraction du texte: {str(e)}"
        }

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

# NOUVEL ENDPOINT POUR EXTRAIRE LE TEXTE D'UN PDF
@app.post("/extract-pdf-text/")
async def extract_pdf_text(file: UploadFile = File(...)):
    """
    Extrait tout le texte d'un fichier PDF uploadé
    """
    # Vérifier que c'est bien un fichier PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format PDF")
    
    # Sauvegarder temporairement le fichier uploadé
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temp_file_path = temp_file.name
    
    try:
        # Écrire le contenu du fichier uploadé dans le fichier temporaire
        content = await file.read()
        with open(temp_file_path, "wb") as f:
            f.write(content)
        
        # Extraire le texte du PDF avec pdfminer.six
        result = extract_text_from_pdf(temp_file_path)
        
        # Vérifier s'il y a eu une erreur
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
        
    finally:
        # Nettoyer le fichier temporaire
        temp_file.close()
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

# NOUVEL ENDPOINT POUR EXTRAIRE LES PLACEHOLDERS D'UN PDF
@app.post("/extract-pdf-placeholders/")
async def extract_pdf_placeholders(file: UploadFile = File(...)):
    """
    Extrait les placeholders ({{placeholder}}) d'un fichier PDF
    """
    # Vérifier que c'est bien un fichier PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format PDF")
    
    # Sauvegarder temporairement le fichier uploadé
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temp_file_path = temp_file.name
    
    try:
        # Écrire le contenu du fichier uploadé dans le fichier temporaire
        content = await file.read()
        with open(temp_file_path, "wb") as f:
            f.write(content)
        
        # Extraire le texte du PDF
        text_result = extract_text_from_pdf(temp_file_path)
        
        # Vérifier s'il y a eu une erreur
        if "error" in text_result:
            raise HTTPException(status_code=500, detail=text_result["error"])
        
        # Extraire les placeholders du texte
        import re
        pattern = r'\{\{([^{}]+)\}\}'
        matches = re.findall(pattern, text_result["text"])
        
        # Nettoyer et dédupliquer tout en préservant l'ordre
        clean_placeholders = [match.strip() for match in matches]
        unique_placeholders = []
        
        for ph in clean_placeholders:
            if ph not in unique_placeholders:
                unique_placeholders.append(ph)
        
        return {
            "filename": file.filename,
            "total_pages": text_result["total_pages"],
            "total_found": len(matches),
            "unique_count": len(unique_placeholders),
            "placeholders": unique_placeholders
        }
        
    finally:
        # Nettoyer le fichier temporaire
        temp_file.close()
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

# NOUVEL ENDPOINT POUR ENVOYER LE TEXTE PDF À N8N
@app.post("/send-pdf-text-to-n8n/")
async def send_pdf_text_to_n8n(file: UploadFile = File(...)):
    """
    Extrait le texte d'un PDF et l'envoie à n8n
    """
    # Vérifier que c'est bien un fichier PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format PDF")
    
    # Sauvegarder temporairement le fichier uploadé
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temp_file_path = temp_file.name
    
    try:
        # Écrire le contenu du fichier uploadé dans le fichier temporaire
        content = await file.read()
        with open(temp_file_path, "wb") as f:
            f.write(content)
        
        # Extraire le texte du PDF
        text_result = extract_text_from_pdf(temp_file_path)
        
        # Vérifier s'il y a eu une erreur
        if "error" in text_result:
            raise HTTPException(status_code=500, detail=text_result["error"])
        
        # Préparer les données pour n8n
        data_for_n8n = {
            "filename": file.filename,
            "file_type": "pdf",
            "total_pages": text_result.get("total_pages", 0),
            "extracted_text": text_result["text"]
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
                    "pdf_text_data": data_for_n8n
                }
                
            return {
                "n8n_status": "success",
                "status_code": n8n_response.status_code,
                "n8n_response": n8n_response.text,
                "pdf_text_data": data_for_n8n
            }
            
        except Exception as e:
            return {
                "n8n_status": "error",
                "error": f"Erreur de connexion à n8n: {str(e)}",
                "pdf_text_data": data_for_n8n
            }
        
    finally:
        # Nettoyer le fichier temporaire
        temp_file.close()
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

# NOUVEL ENDPOINT POUR ENVOYER LES PLACEHOLDERS D'UN PDF À N8N
@app.post("/send-pdf-placeholders-to-n8n/")
async def send_pdf_placeholders_to_n8n(file: UploadFile = File(...)):
    """
    Extrait les placeholders d'un PDF et les envoie à n8n
    """
    # Vérifier que c'est bien un fichier PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format PDF")
    
    # Sauvegarder temporairement le fichier uploadé
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temp_file_path = temp_file.name
    
    try:
        # Écrire le contenu du fichier uploadé dans le fichier temporaire
        content = await file.read()
        with open(temp_file_path, "wb") as f:
            f.write(content)
        
        # Extraire le texte du PDF
        text_result = extract_text_from_pdf(temp_file_path)
        
        # Vérifier s'il y a eu une erreur
        if "error" in text_result:
            raise HTTPException(status_code=500, detail=text_result["error"])
        
        # Extraire les placeholders du texte
        import re
        pattern = r'\{\{([^{}]+)\}\}'
        matches = re.findall(pattern, text_result["text"])
        
        # Nettoyer et dédupliquer tout en préservant l'ordre
        clean_placeholders = [match.strip() for match in matches]
        unique_placeholders = []
        
        for ph in clean_placeholders:
            if ph not in unique_placeholders:
                unique_placeholders.append(ph)
                
        # Préparer les données pour n8n
        data_for_n8n = {
            "filename": file.filename,
            "file_type": "pdf",
            "total_pages": text_result.get("total_pages", 0),
            "total_found": len(matches),
            "unique_count": len(unique_placeholders),
            "placeholders": unique_placeholders
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

# ENDPOINT POUR TESTER LA CONNEXION À N8N
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

# MODÈLE PYDANTIC POUR LA REQUÊTE DE TRAITEMENT V3
class ProcessTextForV3Request(BaseModel):
    text: str
    current_data: Optional[Dict[str, str]] = {}

# NOUVEL ENDPOINT POUR TRAITER LE TEXTE ET EXTRAIRE LES DONNÉES V3
@app.post("/process-text-for-v3/")
async def process_text_for_v3(request: ProcessTextForV3Request):
    """
    Traite le texte extrait d'un PDF pour en extraire des données structurées pour le document V3
    """
    try:
        text = request.text
        current_data = request.current_data or {}
        
        if not text:
            return {
                "success": False,
                "error": "Aucun texte fourni pour le traitement"
            }
        
        # Dictionnaire pour stocker les données extraites
        extracted_data = {}
        
        # Logique d'extraction simple pour les champs courants
        # Ces règles d'extraction peuvent être améliorées selon les besoins
        
        # Analyse des coordonnées du chantier
        if "Adresse" in text:
            # Recherche de l'adresse après le mot "Adresse"
            import re
            address_match = re.search(r'Adresse[:\s]*([^\n]+)', text)
            if address_match:
                extracted_data["adresse_chantier"] = address_match.group(1).strip()
        
        # Analyse du code postal
        postal_code_match = re.search(r'\b(\d{5})\b', text)
        if postal_code_match:
            extracted_data["code_postal"] = postal_code_match.group(1)
        
        # Analyse de la ville
        if "Ville" in text:
            city_match = re.search(r'Ville[:\s]*([^\n]+)', text)
            if city_match:
                extracted_data["ville"] = city_match.group(1).strip()
        
        # Analyse du maître d'ouvrage
        if "Maître d'ouvrage" in text or "Maitre d'ouvrage" in text:
            mo_match = re.search(r'Ma[îi]tre d\'ouvrage[:\s]*([^\n]+)', text)
            if mo_match:
                extracted_data["maitre_ouvrage"] = mo_match.group(1).strip()
        
        # Analyse de la référence du projet
        if "Référence" in text:
            ref_match = re.search(r'Référence[:\s]*([^\n]+)', text)
            if ref_match:
                extracted_data["reference_projet"] = ref_match.group(1).strip()
        
        # Analyse du type de bâtiment
        batiment_types = ["Immeuble", "Maison", "Bureau", "Entrepôt", "Usine", "Commercial"]
        for bt in batiment_types:
            if bt in text:
                extracted_data["type_batiment"] = bt
                break
        
        # Fusionner avec les données actuelles (les nouvelles données ont priorité)
        merged_data = {**current_data, **extracted_data}
        
        return {
            "success": True,
            "data": merged_data
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Erreur lors du traitement du texte pour V3: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)