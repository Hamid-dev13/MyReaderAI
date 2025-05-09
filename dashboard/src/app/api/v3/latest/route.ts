import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const document = await prisma.v3Document.findFirst({
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                uploadedFiles: true
            }
        });

        if (!document) {
            return NextResponse.json({ success: false, error: 'Aucun document V3 trouvé' }, { status: 404 });
        }

        // Parse les données JSON stockées dans la base de données
        return NextResponse.json({
            success: true,
            data: {
                ...document,
                data: JSON.parse(document.data)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du document V3:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la récupération du document V3' },
            { status: 500 }
        );
    }
} 