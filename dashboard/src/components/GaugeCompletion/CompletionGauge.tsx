'use client';

import { V3Status } from '@/lib/types/interfaceTypes';

interface CompletionGaugeProps {
    data: V3Status;
}

export default function CompletionGauge({ data }: CompletionGaugeProps) {
    const { completionPercentage, lastUpdated, totalFields, completedFields } = data;

    // Fonction pour déterminer la couleur de la jauge en fonction du pourcentage
    const getGaugeColor = (percentage: number) => {
        if (percentage < 30) return 'bg-red-500';
        if (percentage < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    // Formater la date de dernière mise à jour
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">État de complétion du V3</h2>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="relative w-36 h-36 mx-auto md:mx-0">
                    {/* Cercle de fond */}
                    <div className="absolute inset-0 rounded-full bg-gray-200"></div>

                    {/* Cercle de progression */}
                    <div
                        className={`absolute inset-0 rounded-full ${getGaugeColor(completionPercentage)}`}
                        style={{
                            clipPath: `polygon(50% 50%, 50% 0%, ${completionPercentage <= 25
                                ? `${50 + 50 * Math.sin(completionPercentage / 25 * Math.PI / 2)}% ${50 - 50 * Math.cos(completionPercentage / 25 * Math.PI / 2)}%`
                                : completionPercentage <= 50
                                    ? `100% 0%, 100% ${50 - 50 * Math.cos((completionPercentage - 25) / 25 * Math.PI / 2)}%`
                                    : completionPercentage <= 75
                                        ? `100% 0%, 100% 100%, ${50 + 50 * Math.cos((completionPercentage - 50) / 25 * Math.PI / 2)}% 100%`
                                        : `100% 0%, 100% 100%, 0% 100%, 0% ${50 + 50 * Math.sin((completionPercentage - 75) / 25 * Math.PI / 2)}%`
                                })`
                        }}
                    ></div>

                    {/* Cercle intérieur blanc */}
                    <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                        <span className="text-2xl font-bold">{completionPercentage}%</span>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">Champs complétés</p>
                            <p className="text-lg font-semibold">{completedFields} / {totalFields}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">Dernière mise à jour</p>
                            <p className="text-lg font-semibold">{formatDate(lastUpdated)}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="h-2 bg-gray-200 rounded-full w-full">
                            <div
                                className={`h-full rounded-full ${getGaugeColor(completionPercentage)}`}
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 