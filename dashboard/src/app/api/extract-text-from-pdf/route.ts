import { NextRequest, NextResponse } from 'next/server';

// URL du backend Python
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        // Récupérer le fichier de la requête
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('API route: Aucun fichier fourni');
            return NextResponse.json(
                { success: false, error: 'Aucun fichier fourni' },
                { status: 400 }
            );
        }

        console.log('API route: Fichier reçu', {
            nom: file.name,
            type: file.type,
            taille: file.size
        });

        // Créer un nouveau FormData pour transmettre au backend
        const backendFormData = new FormData();
        backendFormData.append('file', file);

        console.log(`API route: Envoi de la requête au backend Python: ${BACKEND_URL}/extract-pdf-text/`);

        // Envoyer la requête au backend Python avec le bon endpoint
        let response;
        try {
            response = await fetch(`${BACKEND_URL}/extract-pdf-text/`, {
                method: 'POST',
                body: backendFormData,
            });
            console.log('API route: Réponse du backend reçue', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
        } catch (fetchError) {
            console.error('API route: Erreur lors de la requête au backend:', fetchError);
            throw new Error(`Erreur de connexion au backend: ${fetchError instanceof Error ? fetchError.message : 'Erreur inconnue'}`);
        }

        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
                console.error('API route: Réponse d\'erreur du backend:', errorText);
            } catch (textError) {
                console.error('API route: Impossible de lire le texte de la réponse d\'erreur:', textError);
                errorText = 'Impossible de lire la réponse';
            }

            let errorDetail = '';
            try {
                const errorData = JSON.parse(errorText);
                errorDetail = errorData.detail || '';
            } catch (e) {
                errorDetail = errorText;
            }

            return NextResponse.json(
                { success: false, error: `Erreur du backend: ${errorDetail || response.statusText}` },
                { status: response.status }
            );
        }

        // Renvoyer les données du backend avec adaptation du format si nécessaire
        let data;
        try {
            data = await response.json();
            console.log('API route: Données du backend:', data);
        } catch (jsonError) {
            console.error('API route: Erreur lors du parsing JSON de la réponse:', jsonError);
            throw new Error('Erreur lors du parsing de la réponse du backend');
        }

        // Adapter le format si nécessaire pour maintenir la cohérence des API
        return NextResponse.json({
            success: data.success !== undefined ? data.success : true,
            text: data.text,
            error: data.error
        });
    } catch (error) {
        console.error('API route: Erreur globale lors de l\'extraction du texte PDF:', error);
        return NextResponse.json(
            { success: false, error: `Erreur du serveur lors de l'extraction du texte PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
            { status: 500 }
        );
    }
} 