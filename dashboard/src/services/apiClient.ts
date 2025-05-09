import { V3Data, V3Document } from "@/lib/types/v3Types";

// Client API pour communiquer avec les API Routes

// Interface générique pour les réponses API
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Interface pour les statistiques
interface V3Stats {
    files: {
        processed: number;
        pending: number;
        error: number;
    };
    v3Documents: {
        total: number;
        completed: number;
        inProgress: number;
    };
}

// Client V3
export const V3Client = {
    // Récupérer le document V3 le plus récent
    getLatest: async (): Promise<ApiResponse<V3Document>> => {
        try {
            const response = await fetch('/api/v3/latest');
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération du document V3:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    },

    // Créer un nouveau document V3
    create: async (data?: V3Data): Promise<ApiResponse<V3Document>> => {
        try {
            const response = await fetch('/api/v3/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data })
            });
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la création du document V3:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    },

    // Mettre à jour un document V3
    update: async (id: string, data: V3Data): Promise<ApiResponse<V3Document>> => {
        try {
            const response = await fetch('/api/v3/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, data })
            });
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du document V3:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    },

    // Ajouter un fichier à un document V3
    addFile: async (
        v3DocumentId: string,
        fileInfo: {
            fileName: string;
            fileType: string;
            fileSize: number;
            status?: 'processed' | 'pending' | 'error';
        }
    ): Promise<ApiResponse<V3Document>> => {
        try {
            const response = await fetch('/api/v3/add-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    v3DocumentId,
                    ...fileInfo
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de l\'ajout du fichier:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    },

    // Obtenir les statistiques
    getStats: async (): Promise<ApiResponse<V3Stats>> => {
        try {
            const response = await fetch('/api/v3/stats');
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }
}; 