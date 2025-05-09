export interface V3Data {
    nom_projet: string;
    date_projet: string;
    nom_MO: string;
    Adresse_MO: string;
    nom_mission: string;
    date_création: string;
    nom_mo: string;
    NOM_MOE_mandataire: string;
    Adresse_moe_mandataire: string;
    nature_opération: string;
    description_projet: string;
    nom_du_site: string;
    nom_bâtiments: string;
    adresse_maitre_ouvrage: string;
    nom_maitre_ouvrage: string;
    project_type: string;
    bâtiments_concernés: string;
    site_présentation: string;
    project_phase: string;
    site_part_concerned: string;
    nom_du_partenaire: string;
    diagnostics_type: string;
    date_diagnotsic: string;
    nombre_dechet: string;
    nombre_tonnes_rémploi: string;
    Ressources_PEMD: string;
    nom_de_société: string;
    rapport_type_num: string;
    indique_true: string;
    indique_false: string;
    rapport_type_true: string;
    rapport_type_false: string;
    nom_de_la_société: string;
    rapport_type_termites_true: string;
    rapport_type_termites_false: string;
    rapport_type_amiante_true: string;
    rapport_type_amiante_false: string;
    présence_amiante_true: string;
    présence_amiante_false: string;
    type_étanchéités_true: string;
    type_étanchéités_false: string;
    enrobés_de_parking_true: string;
    enrobés_de_parking_false: string;
    étanchéités_de_toiture: string;
    localisation_transformsteurs: string;
    date_inventaire: string;
    prénom_represente: string;
    nom_represente: string;
    fonction_represente: string;
    prénom_charge_diagnostic: string;
    fonction_charge_diagnositc: string;
    ressource_operation: string;
    prénom_structure: string;
    nom_structure: string;
    Nom_de_la_structure: string;
    sondage_déstructif_true: string;
    sondage_déstructif_false: string;
    site_occupé_true: string;
    presence_amiante_true: string;
    non_reception_true: string;
    description_de_l_opération: string;
    Nom_du_MOA: string;
    bâtiments_espaces: string;
    nom_de_l_opération: string;
    concours: string;
    cité_document_concerné: string;
    description_succincte_du_programme: string;
    nom_du_batiment: string;
    année_de_construction: string;
    Usage_actuel_ou_ancien_usage: string;
    déconstruction_rénovation_conservation: string;
    occupé_vide_en_travaux_en_désamiantage: string;
    Usage_actuel_true: string;
    batiment_state: string;
    Etat_des_bâtiments: string;
    Présence_d_amiante: string;
    Mise_en_œuvre: string;
    Année_construction_bâtiment: string;
    Charpente_bois_true: string;
    toiture_terrasse_béton_true: string;
    Châssis_aluminium_true: string;
    double_vitrage_true: string;
}

export interface V3Document {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    completionRate: number;
    data: V3Data;
}

// Type pour les fichiers téléchargés
export interface UploadedFile {
    id: string;
    createdAt: Date;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: 'processed' | 'pending' | 'error';
    v3DocumentId?: string;
}

// Fonction pour calculer le taux de complétion d'un document V3
export function calculateCompletionRate(data: V3Data): number {
    // Nombre total de champs dans le modèle V3
    const totalFields = Object.keys(data).length;

    // Nombre de champs remplis (non vides)
    const filledFields = Object.values(data).filter(value => value !== "").length;

    // Calcul du pourcentage
    return Math.round((filledFields / totalFields) * 100);
}

// Fonction pour obtenir les champs manquants
export function getMissingFields(data: V3Data): { field: string; severity: 'high' | 'medium' | 'low' }[] {
    const missingFields: { field: string; severity: 'high' | 'medium' | 'low' }[] = [];

    // Champs considérés comme haute priorité
    const highPriorityFields = [
        'nom_projet', 'nom_MO', 'date_création', 'nom_du_site', 'description_projet',
        'présence_amiante_true', 'présence_amiante_false'
    ];

    // Champs considérés comme priorité moyenne
    const mediumPriorityFields = [
        'date_projet', 'Adresse_MO', 'nom_mission', 'NOM_MOE_mandataire',
        'Adresse_moe_mandataire', 'nature_opération', 'nom_bâtiments'
    ];

    // Parcourir tous les champs et vérifier s'ils sont vides
    Object.entries(data).forEach(([key, value]) => {
        if (value === "") {
            let severity: 'high' | 'medium' | 'low';

            if (highPriorityFields.includes(key)) {
                severity = 'high';
            } else if (mediumPriorityFields.includes(key)) {
                severity = 'medium';
            } else {
                severity = 'low';
            }

            missingFields.push({
                field: key.replace(/_/g, ' '),
                severity
            });
        }
    });

    return missingFields;
} 