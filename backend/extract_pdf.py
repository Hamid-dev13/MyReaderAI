# Utilisation de PyPDF2
import PyPDF2
import os

def extract_text_from_pdf(file_path):
    """
    Extrait tout le texte d'un fichier PDF
    """
    try:
        if not os.path.exists(file_path):
            return {"error": "Le fichier n'existe pas"}
            
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            
            # Nombre total de pages
            num_pages = len(reader.pages)
            
            # Extraction du texte complet
            full_text = ""
            
            for i in range(num_pages):
                page = reader.pages[i]
                full_text += page.extract_text() + "\n\n"
            
            return {
                "success": True,
                "total_pages": num_pages,
                "text": full_text
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Erreur lors de l'extraction du texte: {str(e)}"
        }