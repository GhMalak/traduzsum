import { prisma } from './db'

/**
 * Helper para executar operações Prisma com retry automático
 * quando detecta erro de prepared statement (42P05)
 * 
 * Em ambientes serverless, força desconexão e reconexão ANTES de cada operação
 * para evitar conflitos de prepared statements compartilhados entre requisições
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  
  // Em serverless, forçar desconexão e reconexão ANTES de cada operação
  // Isso garante que cada requisição tenha uma conexão limpa sem prepared statements antigos
  if (isServerless) {
    try {
      // Tentar desconectar se já estiver conectado (pode falhar se não estiver conectado - ok)
      try {
        await prisma.$disconnect()
      } catch {
        // Ignorar erro se não estiver conectado
      }
      
      // Aguardar um pouco para garantir que a conexão foi fechada completamente
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Conectar novamente para ter uma conexão limpa
      await prisma.$connect()
    } catch (reconnectError: any) {
      // Se falhar, continuar mesmo assim - pode já estar conectado
      // Isso é esperado e não é um erro crítico
      console.warn('⚠️ Aviso ao reconectar (ignorando):', reconnectError?.message || 'Erro desconhecido')
    }
  }
  
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
          // Desconectar completamente
          await prisma.$disconnect()
          // Aguardar para garantir que a conexão foi completamente fechada
          await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)))
          
          // Reconectar
          await prisma.$connect()
          
          // Aguardar um pouco após reconectar
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
