import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Verificar se DATABASE_URL está disponível
  if (!process.env.DATABASE_URL) {
    // Durante o build, pode não ter DATABASE_URL, então retornamos um cliente "mock"
    // que só será usado se tentar fazer uma query (o que não deve acontecer durante o build)
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      // No Vercel durante o build, não temos DATABASE_URL ainda
      // Mas o Prisma Client precisa ser criado mesmo assim para o build passar
      // A conexão só acontecerá em runtime quando a variável estiver disponível
      return new PrismaClient({
        log: ['error'],
      })
    }
    throw new Error(
      'DATABASE_URL não encontrada. Verifique se a variável de ambiente está configurada.'
    )
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

