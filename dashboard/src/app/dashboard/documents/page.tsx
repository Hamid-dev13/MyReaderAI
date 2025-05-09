import DocumentTable from '@/components/DocumentHistory/DocumentTable';
import { mockDocumentHistory } from '@/lib/data/mockData';

export default function Documents() {
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

            <DocumentTable documents={mockDocumentHistory} />
        </div>
    );
} 