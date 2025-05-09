// Service API pour communiquer avec le backend Python
// Utilisation directe du backend Python au lieu de passer par les API Routes
const BACKEND_URL = 'http://localhost:8000';
const API_BASE_URL = '/api'; // Garde cette constante pour les appels qui ne sont pas redirigés

/**
 * Interface pour les résultats d'extraction des placeholders
 */
export interface PlaceholderResult {
    total_found: number;
    unique_count: number;
    unique_placeholders: Array<{
        placeholder: string;
        count: number;
        context?: string;
        type?: string;
    }>;
    error?: string;
}

/**
 * Interface pour les résultats d'extraction de texte à partir d'un PDF
 */
export interface PdfTextExtractionResult {
    success: boolean;
    text?: string;
    error?: string;
}

/**
 * Interface pour les résultats de traitement V3
 */
export interface V3ProcessingResult {
    success: boolean;
    data?: Record<string, string>;
    error?: string;
}

/**
 * Service pour extraire les placeholders d'un fichier
 * @param file - Fichier à analyser
 * @returns Promise avec les résultats d'extraction
 */
export const extractPlaceholders = async (file: File): Promise<PlaceholderResult> => {
    // Vérifier si le fichier est au format DOCX
    if (!file.name.endsWith('.docx')) {
        return {
            total_found: 0,
            unique_count: 0,
            unique_placeholders: [],
            error: 'Le fichier doit être au format .docx'
        };
    }

    // Créer un FormData pour envoyer le fichier
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/extract-placeholders`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Erreur ${response.status}: ${response.statusText}`);
        }

        return result;
    } catch (error) {
        console.error('Erreur lors de l\'extraction des placeholders:', error);
        return {
            total_found: 0,
            unique_count: 0,
            unique_placeholders: [],
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        };
    }
};

/**
 * Service pour extraire le texte d'un fichier PDF
 * @param file - Fichier PDF à traiter
 * @returns Promise avec le texte extrait
 */
export const extractTextFromPdf = async (file: File): Promise<PdfTextExtractionResult> => {
    // Vérifier si le fichier est au format PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        return {
            success: false,
            error: 'Le fichier doit être au format PDF'
        };
    }

    // Créer un FormData pour envoyer le fichier
    const formData = new FormData();
    formData.append('file', file);

    try {
        console.log("Envoi du PDF pour extraction:", file.name, "taille:", file.size);

        // Appel direct au backend Python sans passer par l'API route
        const response = await fetch(`${BACKEND_URL}/extract-pdf-text/`, {
            method: 'POST',
            body: formData,
        });

        console.log("Réponse reçue, statut:", response.status);

        let responseData;
        try {
            responseData = await response.json();
            console.log("Données de réponse:", responseData);
        } catch (parseError) {
            console.error("Erreur lors du parsing JSON:", parseError);
            // Si la réponse n'est pas du JSON valide, essayons de récupérer le texte brut
            const textResponse = await response.text();
            console.log("Réponse texte brut:", textResponse.substring(0, 200) + "...");
            throw new Error(`Erreur lors du parsing JSON: ${textResponse.substring(0, 100)}`);
        }

        if (!response.ok) {
            console.error("Réponse serveur non OK:", response.status, response.statusText);
            throw new Error(responseData.error || `Erreur ${response.status}: ${response.statusText}`);
        }

        return {
            success: true,
            text: responseData.text
        };
    } catch (error) {
        console.error('Erreur complète lors de l\'extraction du texte:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        };
    }
};

/**
 * Service pour envoyer du texte extrait pour traitement V3
 * @param text - Texte extrait du PDF
 * @param currentData - Données actuelles du V3 (pour mise à jour partielle)
 * @returns Promise avec les données V3 mises à jour
 */
export const processTextForV3 = async (
    text: string,
    currentData?: Record<string, string>
): Promise<V3ProcessingResult> => {
    try {
        const response = await fetch(`${API_BASE_URL}/process-text-for-v3`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                current_data: currentData || {}
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Erreur ${response.status}: ${response.statusText}`);
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Erreur lors du traitement du texte pour V3:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        };
    }
};

/**
 * Service pour analyser un template de manière avancée
 * @param file - Fichier à analyser
 * @returns Promise avec les résultats d'analyse
 */
export const analyzeTemplateAdvanced = async (file: File): Promise<PlaceholderResult> => {
    if (!file.name.endsWith('.docx')) {
        return {
            total_found: 0,
            unique_count: 0,
            unique_placeholders: [],
            error: 'Le fichier doit être au format .docx'
        };
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/analyze-template-advanced`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Erreur ${response.status}: ${response.statusText}`);
        }

        return result;
    } catch (error) {
        console.error('Erreur lors de l\'analyse avancée du template:', error);
        return {
            total_found: 0,
            unique_count: 0,
            unique_placeholders: [],
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        };
    }
}; 