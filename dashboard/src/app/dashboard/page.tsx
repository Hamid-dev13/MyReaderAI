'use client';

import { useEffect, useState } from 'react';
import CompletionGauge from '@/components/GaugeCompletion/CompletionGauge';
import MissingInfoList from '@/components/MissingInfo/MissingInfoList';
import { MissingInformation, V3Status } from '@/lib/types/interfaceTypes';
import { V3Data, getMissingFields } from '@/lib/types/v3Types';
import { V3Client } from '@/services/apiClient';

export default function Dashboard() {
    const [v3Status, setV3Status] = useState<V3Status>({
        completionPercentage: 0,
        lastUpdated: new Date().toISOString(),
        totalFields: 0,
        completedFields: 0
    });
    const [missingInfo, setMissingInfo] = useState<MissingInformation[]>([]);
    const [documentCount, setDocumentCount] = useState({
        processed: 0,
        pending: 0,
        completed: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Charger les données V3 depuis l'API
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Récupérer le document V3 le plus récent
                const v3Response = await V3Client.getLatest();

                if (v3Response.success && v3Response.data) {
                    const v3Doc = v3Response.data;

                    // Mise à jour du statut V3
                    setV3Status({
                        completionPercentage: v3Doc.completionRate,
                        lastUpdated: v3Doc.updatedAt,
                        totalFields: Object.keys(v3Doc.data).length,
                        completedFields: Object.values(v3Doc.data).filter((v: any) => v !== "").length
                    });

                    // Conversion des champs manquants au format MissingInformation
                    const missingFields = getMissingFields(v3Doc.data).map((field, index) => ({
                        id: `m${index + 1}`,
                        field: field.field,
                        message: "Valeur non renseignée dans le document source",
                        severity: field.severity
                    }));

                    setMissingInfo(missingFields);
                }

                // Charger les statistiques
                const statsResponse = await V3Client.getStats();

                if (statsResponse.success && statsResponse.data) {
                    const stats = statsResponse.data;

                    setDocumentCount({
                        processed: stats.files.processed || 0,
                        pending: stats.files.pending || 0,
                        completed: stats.v3Documents.completed || 0
                    });
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord V3</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <CompletionGauge data={v3Status} />
                <MissingInfoList data={missingInfo} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Résumé de l'activité</h2>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-100 animate-pulse h-20 rounded-lg"></div>
                        <div className="bg-gray-100 animate-pulse h-20 rounded-lg"></div>
                        <div className="bg-gray-100 animate-pulse h-20 rounded-lg"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Documents traités</p>
                            <p className="text-2xl font-bold text-blue-700">{documentCount.processed}</p>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-sm text-yellow-600 font-medium">Documents en attente</p>
                            <p className="text-2xl font-bold text-yellow-700">{documentCount.pending}</p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600 font-medium">V3 complétés</p>
                            <p className="text-2xl font-bold text-green-700">{documentCount.completed}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 