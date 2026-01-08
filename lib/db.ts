import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Usar DATABASE_URL do ambiente, se não tiver, usar dummy (permitir build passar)
  // Em runtime no Vercel, a variável estará disponível
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy:5432/dummy'
  
  // Em desenvolvimento, exigir DATABASE_URL real
  if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL não encontrada. Verifique se a variável de ambiente está configurada no arquivo .env.local'
    )
  }

  // Se não tiver DATABASE_URL real, logar aviso (mas não quebrar)
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ DATABASE_URL não encontrada. Usando URL dummy para build. Configure a variável no Vercel.')
  }

  // Criar Prisma Client - em runtime no Vercel, usará a DATABASE_URL real das env vars
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

