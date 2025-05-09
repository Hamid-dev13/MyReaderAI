import { NextRequest, NextResponse } from 'next/server';

// URL du backend Python
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        // Récupérer le fichier de la requête
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'Aucun fichier fourni' },
                { status: 400 }
            );
        }

        // Créer un nouveau FormData pour transmettre au backend
        const backendFormData = new FormData();
        backendFormData.append('file', file);

        // Envoyer la requête au backend Python
        const response = await fetch(`${BACKEND_URL}/extract-text-from-pdf/`, {
            method: 'POST',
            body: backendFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
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

        // Renvoyer les données du backend
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erreur lors de l\'extraction du texte PDF:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur du serveur lors de l\'extraction du texte PDF' },
            { status: 500 }
        );
    }
} 