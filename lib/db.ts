import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Verificar se estamos em build time (prisma generate) ou runtime
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV)

  // Tentar encontrar DATABASE_URL ou variável alternativa
  let databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_DATABASE

  if (!databaseUrl) {
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
    if (process.env.VERCEL && !isBuildTime) {
      const availableDbVars = Object.keys(process.env).filter(k => 
        k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('DB')
      ).join(', ') || 'nenhuma'
      
      console.error('❌ DATABASE_URL não encontrada no Vercel em runtime!')
      console.error('📋 Configure em: Settings → Environment Variables → DATABASE_URL')
      console.error('💡 Variáveis disponíveis:', availableDbVars)
      console.error('')
      console.error('🔧 AÇÃO NECESSÁRIA:')
      console.error('1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables')
      console.error('2. Adicione a variável: DATABASE_URL')
      console.error('3. Valor: postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres')
      console.error('4. Marque para "Production" ✅')
      console.error('5. Faça redeploy')
      console.error('')
      
      // Não throw aqui - deixar as APIs capturarem o erro com mensagem JSON válida
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
  // Adicionar parâmetros para evitar problemas com prepared statements no PostgreSQL
  // Isso é necessário em ambientes serverless como Vercel
  let finalDatabaseUrl = databaseUrl!
  
  // Em ambientes serverless (Vercel), limitar conexões para evitar conflitos
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  
  // Adicionar parâmetros de conexão para evitar problemas com prepared statements
  // Se já tem parâmetros, adicionar aos existentes; se não, criar
  const params: string[] = []
  
  if (!finalDatabaseUrl.includes('?')) {
    // Não tem parâmetros, construir do zero
    params.push(`connection_limit=${isServerless ? '1' : '5'}`)
    params.push(`pool_timeout=${isServerless ? '5' : '10'}`)
    finalDatabaseUrl += '?' + params.join('&')
  } else {
    // Já tem parâmetros, adicionar apenas os que não existem
    if (!finalDatabaseUrl.includes('connection_limit=')) {
      params.push(`connection_limit=${isServerless ? '1' : '5'}`)
    }
    if (!finalDatabaseUrl.includes('pool_timeout=')) {
      params.push(`pool_timeout=${isServerless ? '5' : '10'}`)
    }
    if (params.length > 0) {
      finalDatabaseUrl += '&' + params.join('&')
    }
  }
  
  const client = new PrismaClient({
    datasources: {
      db: {
        url: finalDatabaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  
  return client
}

// Em serverless (Vercel), criar nova instância para cada requisição
// para evitar conflitos de prepared statements compartilhados
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

export const prisma = isServerless
  ? createPrismaClient() // Nova instância em cada requisição serverless
  : (globalForPrisma.prisma ?? createPrismaClient()) // Singleton em desenvolvimento

if (process.env.NODE_ENV !== 'production' && !isServerless) {
  globalForPrisma.prisma = prisma
}

