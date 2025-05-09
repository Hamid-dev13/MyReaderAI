'use client';

import { MissingInformation } from '@/lib/data/mockData';

interface MissingInfoListProps {
    data: MissingInformation[];
}

export default function MissingInfoList({ data }: MissingInfoListProps) {
    // Fonction pour obtenir la couleur en fonction de la sévérité
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Fonction pour traduire le niveau de sévérité
    const getSeverityLabel = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'Élevée';
            case 'medium':
                return 'Moyenne';
            case 'low':
                return 'Faible';
            default:
                return 'Inconnue';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Informations manquantes</h2>
                <span className="bg-gray-100 text-gray-700 text-sm py-1 px-2 rounded-full">
                    {data.length} éléments
                </span>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Aucune information manquante
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {data.map((item) => (
                        <div key={item.id} className="py-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-gray-900">{item.field}</h3>
                                    <p className="text-gray-600 mt-1">{item.message}</p>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                                    {getSeverityLabel(item.severity)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 