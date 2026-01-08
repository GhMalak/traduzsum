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
    
    // Em runtime no Vercel, SEMPRE exigir DATABASE_URL real
    // Mas não quebrar a aplicação - deixar o erro ser capturado pelas rotas API
    if (process.env.VERCEL && !isBuildTime) {
      console.error('❌ DATABASE_URL não encontrada no Vercel em runtime!')
      console.error('📋 Configure em: Settings → Environment Variables → DATABASE_URL')
      console.error('💡 Variáveis disponíveis:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DB')).join(', ') || 'nenhuma')
      // Não throw aqui - deixar as APIs capturarem o erro
    }
    
    // Se não é build e não é Vercel, também exigir
    if (!isBuildTime && !process.env.VERCEL) {
      throw new Error('DATABASE_URL é obrigatória em runtime')
    }
    
    // Se chegou aqui, está em runtime no Vercel sem DATABASE_URL
    // Usar dummy para não quebrar, mas as APIs vão falhar com erro tratável
    console.error('⚠️ Usando URL dummy em runtime (DATABASE_URL não configurada). As APIs vão falhar.')
    return new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://dummy:dummy@dummy:5432/dummy',
        },
      },
    })
  }

  // DATABASE_URL existe - usar normalmente
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

