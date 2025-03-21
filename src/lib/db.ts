// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// console.log('🔥 Prisma Client Initialized:', prisma) // ✅ Debug log
export const db = prisma

// console.log('Prisma Client Initialized', db)

// reasonwi_digital_directory
