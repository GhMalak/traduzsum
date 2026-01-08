import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Função interna para criar Prisma Client (função privada)
function _createPrismaClient(): PrismaClient {
  // Remover aspas se houver (alguns arquivos .env podem ter aspas)
  const databaseUrl = (
    process.env.DATABASE_URL || 
    process.env.POSTGRES_URL || 
    process.env.POSTGRES_DATABASE
  )?.trim()?.replace(/^["']|["']$/g, '') // Remove aspas simples ou duplas no início/fim

  if (!databaseUrl) {
    const availableDbVars = Object.keys(process.env).filter(k => 
      k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('DB')
    ).join(', ') || 'nenhuma'
    
    console.error('❌ DATABASE_URL não encontrada!')
    console.error('📋 Configure em:')
    
    if (process.env.NODE_ENV === 'development') {
      console.error('   Local: Adicione DATABASE_URL no arquivo .env.local')
    }
    
    if (process.env.VERCEL) {
      console.error('   Vercel: Settings → Environment Variables → DATABASE_URL')
      console.error('   💡 Variáveis disponíveis:', availableDbVars)
    }
    
    throw new Error(
      'DATABASE_URL é obrigatória. Configure a variável de ambiente com a URL do banco de dados PostgreSQL.'
    )
  }

  // Em serverless, desabilitar prepared statements para evitar conflitos
  // Isso é necessário porque prepared statements são compartilhados entre conexões no PostgreSQL
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  let finalDatabaseUrl = databaseUrl
  
  // Adicionar parâmetros de conexão
  const separator = finalDatabaseUrl.includes('?') ? '&' : '?'
  
  // Em serverless, adicionar parâmetros para compatibilidade com poolers (Supabase)
  // pgbouncer=true desabilita prepared statements no Prisma, evitando erro "prepared statement already exists"
  // Isso é necessário porque poolers de conexão em modo transação não suportam prepared statements compartilhados
  if (isServerless) {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    // CRÍTICO: pgbouncer=true desabilita prepared statements no Prisma (recomendado pela Supabase)
    // Isso resolve o erro "prepared statement already exists" com poolers como Supabase/PgBouncer
    finalDatabaseUrl += `${separator}application_name=req-${uniqueId}&connection_limit=1&pool_timeout=5&pgbouncer=true`
  } else {
    finalDatabaseUrl += `${separator}connection_limit=5&pool_timeout=10`
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: finalDatabaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Em serverless, SEMPRE criar nova instância do Prisma Client
// Em desenvolvimento, usar singleton para melhor performance
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

// Função EXPORTADA para obter Prisma Client
// Em serverless, sempre retorna uma NOVA instância e DESCONECTA após uso
// Em desenvolvimento, retorna singleton
export function getPrismaClient(): PrismaClient {
  if (isServerless) {
    // Em serverless, SEMPRE criar nova instância para evitar prepared statements compartilhados
    // Isso garante que cada requisição tenha sua própria conexão sem prepared statements antigos
    return _createPrismaClient()
  }
  
  // Em desenvolvimento, usar singleton para melhor performance
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = _createPrismaClient()
  }
  
  return globalForPrisma.prisma
}

// Função helper para executar operações Prisma com desconexão automática em serverless
export async function withPrisma<T>(
  operation: (client: PrismaClient) => Promise<T>
): Promise<T> {
  const client = getPrismaClient()
  
  try {
    const result = await operation(client)
    
    // Em serverless, desconectar após cada operação para liberar conexão
    if (isServerless) {
      try {
        await client.$disconnect()
      } catch (error) {
        // Ignorar erros ao desconectar
      }
    }
    
    return result
  } catch (error) {
    // Em caso de erro, também desconectar
    if (isServerless) {
      try {
        await client.$disconnect()
      } catch {
        // Ignorar erros ao desconectar
      }
    }
    throw error
  }
}

// Exportar instância (será nova em serverless, singleton em dev)
export const prisma = getPrismaClient()
