/**
 * PRISMA CLIENT SINGLETON
 * =======================
 * File ini mengexport instance Prisma Client yang digunakan di seluruh aplikasi
 * 
 * WHY SINGLETON?
 * - Next.js Hot Reload di development bisa create multiple Prisma instances
 * - Multiple instances = too many database connections
 * - Solution: Store Prisma Client di global object untuk reuse
 * 
 * LOGGING:
 * - Development: Log queries, errors, dan warnings untuk debugging
 * - Production: Hanya log errors untuk performa
 * 
 * Usage: import { prisma } from '@/lib/prisma'
 */

import { PrismaClient } from '@prisma/client'

// === GLOBAL TYPE DEFINITION ===
// Extend globalThis untuk support Prisma Client caching
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// === PRISMA CLIENT INSTANCE ===
// Singleton pattern: Reuse existing instance atau create new
export const prisma =
  globalForPrisma.prisma ??  // Jika sudah ada di global, pakai yang ada
  new PrismaClient({
    // Logging configuration berdasarkan environment
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']  // Development: verbose logging
        : ['error']                    // Production: error only
  })

// === CACHE INSTANCE IN GLOBAL ===
// Simpan instance di global object (hanya di non-production)
// Ini memastikan Hot Reload tidak create multiple connections
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}