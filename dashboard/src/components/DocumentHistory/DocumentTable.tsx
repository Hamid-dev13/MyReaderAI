'use client';

import { Document } from '@/lib/types/interfaceTypes';
import Link from 'next/link';

interface DocumentTableProps {
    documents: Document[];
}

export default function DocumentTable({ documents }: DocumentTableProps) {
    // Fonction pour formater la date
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

    // Fonction pour obtenir la couleur et le libellé du statut
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'processed':
                return {
                    color: 'bg-green-100 text-green-800',
                    label: 'Traité'
                };
            case 'pending':
                return {
                    color: 'bg-yellow-100 text-yellow-800',
                    label: 'En attente'
                };
            case 'error':
                return {
                    color: 'bg-red-100 text-red-800',
                    label: 'Erreur'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800',
                    label: 'Inconnu'
                };
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Historique des documents</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Document
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documents.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    Aucun document disponible
                                </td>
                            </tr>
                        ) : (
                            documents.map((doc) => {
                                const { color, label } = getStatusInfo(doc.status);

                                return (
                                    <tr key={doc.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-md">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDate(doc.date)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
                                                {label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {doc.pdfUrl ? (
                                                <Link href={doc.pdfUrl} className="text-blue-600 hover:text-blue-900 mr-4">
                                                    Voir
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400 mr-4">Voir</span>
                                            )}
                                            <button className="text-indigo-600 hover:text-indigo-900">
                                                Détails
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 