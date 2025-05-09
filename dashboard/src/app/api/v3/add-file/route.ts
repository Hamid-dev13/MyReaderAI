import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { v3DocumentId, fileName, fileType, fileSize, status } = body;

        if (!v3DocumentId || !fileName || !fileType || !fileSize) {
            return NextResponse.json(
                { success: false, error: 'Informations de fichier incomplètes' },
                { status: 400 }
            );
        }

        // Ajouter le fichier
        const uploadedFile = await prisma.uploadedFile.create({
            data: {
                fileName,
                fileType,
                fileSize,
                status: status || 'processed',
                v3DocumentId
            }
        });

        return NextResponse.json({
            success: true,
            data: uploadedFile
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du fichier:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de l\'ajout du fichier' },
            { status: 500 }
        );
    }
} 