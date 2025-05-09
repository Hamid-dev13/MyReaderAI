import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Récupérer tous les fichiers téléchargés
        const uploadedFiles = await prisma.uploadedFile.findMany();

        // Compter les fichiers par statut
        const processedCount = uploadedFiles.filter(file => file.status === 'processed').length;
        const pendingCount = uploadedFiles.filter(file => file.status === 'pending').length;
        const errorCount = uploadedFiles.filter(file => file.status === 'error').length;

        // Compter les documents V3 complétés (taux de complétion = 100%)
        const completedV3Count = await prisma.v3Document.count({
            where: {
                completionRate: 100
            }
        });

        // Compter le total de documents V3
        const totalV3Count = await prisma.v3Document.count();

        return NextResponse.json({
            success: true,
            data: {
                files: {
                    total: uploadedFiles.length,
                    processed: processedCount,
                    pending: pendingCount,
                    error: errorCount
                },
                v3Documents: {
                    total: totalV3Count,
                    completed: completedV3Count,
                    inProgress: totalV3Count - completedV3Count
                }
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la récupération des statistiques' },
            { status: 500 }
        );
    }
} 