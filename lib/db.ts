import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Durante o build, pode não ter DATABASE_URL disponível
  // Usamos uma URL dummy para permitir que o Prisma Client seja criado
  // A conexão real só acontecerá em runtime quando a variável estiver disponível
  let databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'DATABASE_URL não encontrada. Verifique se a variável de ambiente está configurada no arquivo .env.local'
      )
    }
    // Durante o build no Vercel, use uma URL dummy
    // Isso permite que o Prisma Client seja gerado sem tentar se conectar
    databaseUrl = 'postgresql://dummy:dummy@dummy:5432/dummy'
    console.warn('⚠️ DATABASE_URL não encontrada durante o build. Usando URL dummy. Configure a variável no Vercel para produção.')
  }

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

