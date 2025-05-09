import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCompletionRate } from '@/lib/types/v3Types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const initialData = body.data || getEmptyV3Data();

        const completionRate = calculateCompletionRate(initialData);

        const newDocument = await prisma.v3Document.create({
            data: {
                completionRate,
                data: JSON.stringify(initialData)
            }
        });

        // Récupérer le document créé avec ses relations
        const document = await prisma.v3Document.findUnique({
            where: { id: newDocument.id },
            include: {
                uploadedFiles: true
            }
        });

        if (!document) {
            return NextResponse.json(
                { success: false, error: 'Erreur lors de la création du document V3' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                ...document,
                data: JSON.parse(document.data)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la création du document V3:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la création du document V3' },
            { status: 500 }
        );
    }
}

// Fonction pour obtenir un document V3 vide
function getEmptyV3Data() {
    return {
        nom_projet: "",
        date_projet: "",
        nom_MO: "",
        Adresse_MO: "",
        nom_mission: "",
        date_création: "",
        nom_mo: "",
        NOM_MOE_mandataire: "",
        Adresse_moe_mandataire: "",
        nature_opération: "",
        description_projet: "",
        nom_du_site: "",
        nom_bâtiments: "",
        adresse_maitre_ouvrage: "",
        nom_maitre_ouvrage: "",
        project_type: "",
        bâtiments_concernés: "",
        site_présentation: "",
        project_phase: "",
        site_part_concerned: "",
        nom_du_partenaire: "",
        diagnostics_type: "",
        date_diagnotsic: "",
        nombre_dechet: "",
        nombre_tonnes_rémploi: "",
        Ressources_PEMD: "",
        nom_de_société: "",
        rapport_type_num: "",
        indique_true: "",
        indique_false: "",
        rapport_type_true: "",
        rapport_type_false: "",
        nom_de_la_société: "",
        rapport_type_termites_true: "",
        rapport_type_termites_false: "",
        rapport_type_amiante_true: "",
        rapport_type_amiante_false: "",
        présence_amiante_true: "",
        présence_amiante_false: "",
        type_étanchéités_true: "",
        type_étanchéités_false: "",
        enrobés_de_parking_true: "",
        enrobés_de_parking_false: "",
        étanchéités_de_toiture: "",
        localisation_transformsteurs: "",
        date_inventaire: "",
        prénom_represente: "",
        nom_represente: "",
        fonction_represente: "",
        prénom_charge_diagnostic: "",
        fonction_charge_diagnositc: "",
        ressource_operation: "",
        prénom_structure: "",
        nom_structure: "",
        Nom_de_la_structure: "",
        sondage_déstructif_true: "",
        sondage_déstructif_false: "",
        site_occupé_true: "",
        presence_amiante_true: "",
        non_reception_true: "",
        description_de_l_opération: "",
        Nom_du_MOA: "",
        bâtiments_espaces: "",
        nom_de_l_opération: "",
        concours: "",
        cité_document_concerné: "",
        description_succincte_du_programme: "",
        nom_du_batiment: "",
        année_de_construction: "",
        Usage_actuel_ou_ancien_usage: "",
        déconstruction_rénovation_conservation: "",
        occupé_vide_en_travaux_en_désamiantage: "",
        Usage_actuel_true: "",
        batiment_state: "",
        Etat_des_bâtiments: "",
        Présence_d_amiante: "",
        Mise_en_œuvre: "",
        Année_construction_bâtiment: "",
        Charpente_bois_true: "",
        toiture_terrasse_béton_true: "",
        Châssis_aluminium_true: "",
        double_vitrage_true: ""
    };
} 