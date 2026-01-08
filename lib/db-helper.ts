import { prisma } from './db'

/**
 * Helper para executar operações Prisma com retry automático
 * quando detecta erro de prepared statement (42P05)
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2
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
          // Desconectar e reconectar
          await prisma.$disconnect()
          // Aguardar um pouco antes de reconectar
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
          await prisma.$connect()
        } catch (reconnectError) {
          console.error('❌ Erro ao reconectar:', reconnectError)
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

