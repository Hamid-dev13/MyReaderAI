import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCompletionRate } from '@/lib/types/v3Types';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, data } = body;

        if (!id || !data) {
            return NextResponse.json(
                { success: false, error: 'ID et données requis' },
                { status: 400 }
            );
        }

        const completionRate = calculateCompletionRate(data);

        // Mise à jour du document
        const updatedDocument = await prisma.v3Document.update({
            where: { id },
            data: {
                completionRate,
                data: JSON.stringify(data)
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...updatedDocument,
                data: JSON.parse(updatedDocument.data)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du document V3:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la mise à jour du document V3' },
            { status: 500 }
        );
    }
} 