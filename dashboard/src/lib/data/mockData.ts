export interface Document {
    id: string;
    name: string;
    date: string;
    status: 'processed' | 'pending' | 'error';
    pdfUrl?: string;
}

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

// Données simulées pour le document V3
export const mockV3Status: V3Status = {
    completionPercentage: 68,
    lastUpdated: "2024-08-12T14:30:00Z",
    totalFields: 50,
    completedFields: 34
};

// Données simulées pour les informations manquantes
export const mockMissingInfo: MissingInformation[] = [
    {
        id: "m1",
        field: "Quantité de matériaux",
        message: "Valeur non renseignée dans le document source",
        severity: "high"
    },
    {
        id: "m2",
        field: "Dimensions",
        message: "Format incorrect, attendu: 00x00x00",
        severity: "medium"
    },
    {
        id: "m3",
        field: "Photos",
        message: "Au moins une photo de l'élément est requise",
        severity: "high"
    },
    {
        id: "m4",
        field: "État de conservation",
        message: "Champ non complété",
        severity: "medium"
    },
    {
        id: "m5",
        field: "Date de disponibilité",
        message: "Format de date invalide",
        severity: "low"
    }
];

// Données simulées pour l'historique des documents
export const mockDocumentHistory: Document[] = [
    {
        id: "doc1",
        name: "Diagnostic_Batiment_A_Etage3.pdf",
        date: "2024-08-10T09:15:00Z",
        status: "processed",
        pdfUrl: "/documents/diagnostic_a_e3.pdf"
    },
    {
        id: "doc2",
        name: "Photos_Elements_Sanitaires.pdf",
        date: "2024-08-08T11:30:00Z",
        status: "processed",
        pdfUrl: "/documents/photos_sanitaires.pdf"
    },
    {
        id: "doc3",
        name: "Inventaire_Fenetre_Batiment_B.pdf",
        date: "2024-08-07T14:45:00Z",
        status: "error",
        pdfUrl: "/documents/inventaire_fenetres.pdf"
    },
    {
        id: "doc4",
        name: "Rapport_Structure_Batiment_C.pdf",
        date: "2024-08-05T10:00:00Z",
        status: "processed",
        pdfUrl: "/documents/rapport_structure.pdf"
    },
    {
        id: "doc5",
        name: "Plan_démolition.pdf",
        date: "2024-08-01T16:20:00Z",
        status: "pending"
    }
]; 