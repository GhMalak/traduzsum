import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Verificar se DATABASE_URL está disponível
  // Se não estiver, lançar erro apenas em desenvolvimento
  // Em produção no Vercel, a variável deve estar configurada
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'DATABASE_URL não encontrada. Verifique se a variável de ambiente está configurada no arquivo .env.local'
      )
    }
    // Em produção, se não tiver DATABASE_URL, o Prisma vai falhar ao tentar conectar
    // Mas permitimos que o cliente seja criado para não quebrar o build
    console.warn('⚠️ DATABASE_URL não encontrada. Configure a variável no Vercel.')
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

