// Interfaces communes pour l'application

export interface MissingInformation {
    id: string;
    field: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
}

export interface V3Status {
    completionPercentage: number;
    lastUpdated: string;
    totalFields: number;
    completedFields: number;
}

export interface Document {
    id: string;
    name: string;
    date: string;
    status: 'processed' | 'pending' | 'error';
    pdfUrl?: string;
} 