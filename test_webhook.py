import requests

# URL du webhook que vous avez obtenue dans n8n
webhook_url = "https://hamiddev13.app.n8n.cloud/webhook-test/raedificare-template"

# Données de test simples
test_data = {
    "filename": "test_document.docx",
    "placeholders": ["test_placeholder_1", "test_placeholder_2", "test_placeholder_3"],
    "message": "Ceci est un test de connexion entre Python et n8n"
}

# Envoyer la requête POST
try:
    print(f"Envoi de données de test au webhook: {webhook_url}")
    response = requests.post(
        webhook_url,
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    
    # Afficher les résultats
    print(f"Statut de la réponse: {response.status_code}")
    print(f"Contenu de la réponse: {response.text}")
    
    if response.status_code == 200:
        print("✅ Connexion réussie ! Le webhook a bien reçu les données.")
    else:
        print("❌ Problème avec la connexion. Vérifiez l'URL du webhook et les logs n8n.")
        
except Exception as e:
    print(f"❌ Erreur lors de la connexion: {str(e)}")
