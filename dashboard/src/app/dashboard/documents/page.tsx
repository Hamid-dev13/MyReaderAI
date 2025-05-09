'use client';

import { useEffect, useState } from 'react';
import DocumentTable from '@/components/DocumentHistory/DocumentTable';
import { Document } from '@/lib/types/interfaceTypes';
import { V3Client } from '@/services/apiClient';

export default function Documents() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDocuments = async () => {
            setIsLoading(true);
            try {
                // Récupérer les statistiques qui contiennent les fichiers
                const statsResponse = await V3Client.getStats();

                if (statsResponse.success && statsResponse.data) {
                    // Récupérer le document V3 le plus récent pour obtenir les fichiers
                    const v3Response = await V3Client.getLatest();

                    if (v3Response.success && v3Response.data && v3Response.data.uploadedFiles) {
                        const fileDocuments: Document[] = v3Response.data.uploadedFiles.map((file: any) => ({
                            id: file.id,
                            name: file.fileName,
                            date: file.createdAt,
                            status: file.status,
                            // Pas d'URL de PDF pour l'instant, à implémenter si nécessaire
                        }));

                        setDocuments(fileDocuments);
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement des documents:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDocuments();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Documents</h1>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un document
                </button>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
                    </div>
                </div>
            ) : (
                <DocumentTable documents={documents} />
            )}
        </div>
    );
} 