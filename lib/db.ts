import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Verificar se estamos em build time (prisma generate) ou runtime
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV)

  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'DATABASE_URL não encontrada. Verifique se a variável de ambiente está configurada no arquivo .env.local'
      )
    }
    
    // Em runtime no Vercel, SEMPRE exigir DATABASE_URL real
    if (process.env.VERCEL && !isBuildTime) {
      console.error('❌ DATABASE_URL não encontrada no Vercel em runtime!')
      console.error('📋 Configure em: Settings → Environment Variables → DATABASE_URL')
      console.error('💡 Valores disponíveis:', Object.keys(process.env).filter(k => k.includes('DATABASE')).join(', '))
      throw new Error(
        'DATABASE_URL não encontrada no Vercel. Configure a variável em Settings → Environment Variables, marque para Production e faça redeploy.'
      )
    }
    
    // Durante build, usar dummy para não quebrar
    if (isBuildTime) {
      console.warn('⚠️ DATABASE_URL não encontrada durante build. Usando URL dummy para prisma generate.')
      return new PrismaClient({
        datasources: {
          db: {
            url: 'postgresql://dummy:dummy@dummy:5432/dummy',
          },
        },
      })
    }
  }

  // Em runtime, sempre usar DATABASE_URL real
  if (!process.env.DATABASE_URL && !isBuildTime) {
    throw new Error('DATABASE_URL é obrigatória em runtime')
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL!,
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

