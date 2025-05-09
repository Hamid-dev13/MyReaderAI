import { PrismaClient } from '@prisma/client';

// Déclaration pour éviter l'instanciation multiple lors des hot reloads en développement
declare global {
    var prisma: PrismaClient | undefined;
}

// Création d'un singleton pour PrismaClient
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
} 