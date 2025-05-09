import CompletionGauge from '@/components/GaugeCompletion/CompletionGauge';
import MissingInfoList from '@/components/MissingInfo/MissingInfoList';
import { mockV3Status, mockMissingInfo } from '@/lib/data/mockData';

export default function Dashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord V3</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <CompletionGauge data={mockV3Status} />
                <MissingInfoList data={mockMissingInfo} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Résumé de l'activité</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Documents traités</p>
                        <p className="text-2xl font-bold text-blue-700">23</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-600 font-medium">Documents en attente</p>
                        <p className="text-2xl font-bold text-yellow-700">5</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">V3 complétés</p>
                        <p className="text-2xl font-bold text-green-700">18</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 