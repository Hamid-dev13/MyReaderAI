'use client';

import { MissingInformation } from '@/lib/types/interfaceTypes';

interface MissingInfoListProps {
    data: MissingInformation[];
}

export default function MissingInfoList({ data }: MissingInfoListProps) {
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 