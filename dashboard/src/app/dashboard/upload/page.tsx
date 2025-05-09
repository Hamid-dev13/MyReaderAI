'use client';

import { useState, useEffect } from 'react';
import FileDropzone from '@/components/FileUpload/FileDropzone';
import Notification from '@/components/Layout/Notification';
import { PlaceholderResult } from '@/services/externalApiService';
import { V3Client } from '@/services/apiClient';
import { V3Data, calculateCompletionRate, getMissingFields } from '@/lib/types/v3Types';
import { MissingInformation } from '@/lib/types/interfaceTypes';

export default function UploadPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PlaceholderResult | null>(null);
    const [v3Data, setV3Data] = useState<V3Data | null>(null);
    const [completionRate, setCompletionRate] = useState<number>(0);
    const [missingFields, setMissingFields] = useState<MissingInformation[]>([]);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        details?: string;
        isVisible: boolean;
    }>({
        type: 'info',
        message: '',
        details: '',
        isVisible: false
    });

    // Charger les données V3 initiales
    useEffect(() => {
        const loadV3Data = async () => {
            try {
                const response = await V3Client.getLatest();
                if (response.success && response.data) {
                    const v3Document = response.data;
                    setV3Data(v3Document.data);
                    setCompletionRate(v3Document.completionRate);

                    // Convertir les champs manquants en format MissingInformation
                    const missing = getMissingFields(v3Document.data).map((field, index) => ({
                        id: `m${index + 1}`,
                        field: field.field,
                        message: 'Valeur non renseignée',
                        severity: field.severity
                    }));

                    setMissingFields(missing);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données V3:', error);
            }
        };

        loadV3Data();
    }, []);

    const handleUploadSuccess = (data: any) => {
        // Si c'est un résultat d'extraction de placeholders
        if (data.unique_placeholders) {
            setResult(data);
        }

        // Si c'est un succès de traitement V3
        if (data.v3Document) {
            setV3Data(data.v3Document.data);
            setCompletionRate(data.v3Document.completionRate);

            // Mettre à jour les champs manquants
            const missing = getMissingFields(data.v3Document.data).map((field, index) => ({
                id: `m${index + 1}`,
                field: field.field,
                message: 'Valeur non renseignée',
                severity: field.severity
            }));

            setMissingFields(missing);
        }

        setNotification({
            type: 'success',
            message: 'Document traité avec succès!',
            details: data.message || `${data.total_found || 0} placeholders trouvés, ${data.unique_count || 0} uniques.`,
            isVisible: true
        });
    };

    const handleV3DataUpdated = (newData: V3Data) => {
        setV3Data(newData);
        const rate = calculateCompletionRate(newData);
        setCompletionRate(rate);

        // Mettre à jour les champs manquants
        const missing = getMissingFields(newData).map((field, index) => ({
            id: `m${index + 1}`,
            field: field.field,
            message: 'Valeur non renseignée',
            severity: field.severity
        }));

        setMissingFields(missing);
    };

    const handleUploadError = (errorMessage: string) => {
        setNotification({
            type: 'error',
            message: 'Erreur',
            details: errorMessage,
            isVisible: true
        });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Upload des documents</h1>
                <p className="mt-2 text-gray-600">
                    Téléchargez vos documents PDF pour extraction du texte ou DOCX pour extraction des placeholders
                </p>
            </div>

            <Notification
                type={notification.type}
                message={notification.message}
                details={notification.details}
                isVisible={notification.isVisible}
                onClose={closeNotification}
                autoHideDuration={6000}
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Téléchargement de fichiers</h2>

                        <FileDropzone
                            onUploadSuccess={handleUploadSuccess}
                            onUploadError={handleUploadError}
                            onV3DataUpdated={handleV3DataUpdated}
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                            acceptedFileTypes="both"
                        />
                    </div>

                    {result && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Résultats d'extraction</h2>

                            <div className="flex justify-between items-center mb-3 bg-blue-50 p-3 rounded-md">
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Total placeholders</p>
                                    <p className="text-xl font-bold text-blue-800">{result.total_found}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Uniques</p>
                                    <p className="text-xl font-bold text-blue-800">{result.unique_count}</p>
                                </div>
                            </div>

                            <h3 className="text-sm font-medium text-gray-700 mb-2 mt-4">Détails des placeholders</h3>

                            <div className="overflow-auto max-h-96">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Placeholder
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Occurrences
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {result.unique_placeholders.map((item, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-gray-900">
                                                    {item.placeholder}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                                                    {item.count}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">État du document V3</h2>

                        {v3Data ? (
                            <div>
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">Complétion</span>
                                        <span className="text-sm font-medium text-gray-600">{completionRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${completionRate < 30 ? 'bg-red-500' :
                                                completionRate < 70 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${completionRate}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <h3 className="text-sm font-medium text-gray-700 mb-2">Informations manquantes</h3>

                                <div className="overflow-auto max-h-96">
                                    {missingFields.length === 0 ? (
                                        <div className="text-center text-green-600 py-4">
                                            Tous les champs sont remplis !
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {missingFields.slice(0, 10).map((item) => (
                                                <div key={item.id} className="py-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 text-sm">{item.field}</h4>
                                                            <p className="text-gray-600 text-xs mt-0.5">{item.message}</p>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.severity === 'high'
                                                            ? 'bg-red-100 text-red-800'
                                                            : item.severity === 'medium'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {item.severity === 'high' ? 'Élevée' : item.severity === 'medium' ? 'Moyenne' : 'Faible'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {missingFields.length > 10 && (
                                                <div className="py-2 text-center text-gray-500 text-sm">
                                                    ... et {missingFields.length - 10} autres champs manquants
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <p>Aucun document V3 disponible</p>
                                <p className="text-sm mt-2">Téléchargez un PDF pour commencer</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 