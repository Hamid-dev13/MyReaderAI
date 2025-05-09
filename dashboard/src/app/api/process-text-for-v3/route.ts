import { NextRequest, NextResponse } from 'next/server';

// URL du backend Python
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        // Récupérer les données JSON de la requête
        const body = await request.json();
        const { text, current_data } = body;

        if (!text) {
            return NextResponse.json(
                { success: false, error: 'Aucun texte fourni' },
                { status: 400 }
            );
        }

        // Envoyer la requête au backend Python
        const response = await fetch(`${BACKEND_URL}/process-text-for-v3/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                current_data: current_data || {}
            }),
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
        console.error('Erreur lors du traitement du texte pour V3:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur du serveur lors du traitement du texte pour V3' },
            { status: 500 }
        );
    }
} 