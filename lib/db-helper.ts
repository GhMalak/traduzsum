import { prisma } from './db'

/**
 * Helper para executar operações Prisma com retry automático
 * quando detecta erro de prepared statement (42P05)
 * 
 * NOTA: Se o erro persistir mesmo com retry, pode ser necessário
 * desabilitar prepared statements na URL: ?statement_cache_size=0
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 1 // Reduzido para 1 porque vamos confiar no statement_cache_size=0
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Verificar se é erro de prepared statement
      const isPreparedStatementError = 
        error?.message?.includes('prepared statement') ||
        error?.code === '42P05' ||
        error?.meta?.code === '42P05'
      
      if (isPreparedStatementError && attempt < maxRetries) {
        console.warn(`⚠️ Erro de prepared statement detectado (tentativa ${attempt + 1}/${maxRetries + 1}), reconectando...`)
        
        try {
          // Desconectar completamente e aguardar
          await prisma.$disconnect()
          // Aguardar mais tempo para garantir que a conexão foi completamente fechada
          await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)))
          
          // Reconectar
          await prisma.$connect()
          
          // Aguardar um pouco mais após reconectar
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (reconnectError: any) {
          console.error('❌ Erro ao reconectar:', reconnectError?.message || reconnectError)
          // Continuar tentando mesmo se a reconexão falhar
        }
        
        // Tentar novamente
        continue
      }
      
      // Se não for erro de prepared statement ou esgotou tentativas, relançar
      throw error
    }
  }
  
  // Se chegou aqui, esgotou todas as tentativas
  throw lastError
}

