import { prisma } from './db'

/**
 * Executa uma operação Prisma com garantia de conexão limpa em serverless
 * Desconecta e reconecta antes de cada operação para evitar conflitos de prepared statements
 */
export async function safePrismaOperation<T>(
  operation: (client: typeof prisma) => Promise<T>
): Promise<T> {
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  
  // Em serverless, garantir conexão limpa antes de cada operação
  if (isServerless) {
    try {
      // Tentar desconectar se já estiver conectado
      try {
        await prisma.$disconnect()
      } catch {
        // Ignorar se não estiver conectado
      }
      
      // Aguardar um pouco para garantir que a conexão foi fechada
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Conectar novamente para ter uma conexão limpa
      await prisma.$connect()
    } catch (error: any) {
      // Se falhar ao reconectar, continuar mesmo assim (pode já estar conectado)
      console.warn('⚠️ Aviso ao preparar conexão (ignorando):', error?.message || 'Erro desconhecido')
    }
  }
  
  // Executar a operação
  try {
    return await operation(prisma)
  } catch (error: any) {
    // Verificar se é erro de prepared statement
    const isPreparedStatementError = 
      error?.message?.includes('prepared statement') ||
      error?.code === '42P05' ||
      error?.meta?.code === '42P05'
    
    // Se for erro de prepared statement, tentar reconectar e tentar novamente
    if (isPreparedStatementError && isServerless) {
      console.warn('⚠️ Erro de prepared statement detectado, reconectando...')
      
      try {
        await prisma.$disconnect()
        await new Promise(resolve => setTimeout(resolve, 200))
        await prisma.$connect()
        
        // Tentar novamente após reconectar
        return await operation(prisma)
      } catch (retryError: any) {
        console.error('❌ Erro ao reconectar:', retryError?.message || retryError)
        throw error // Relançar o erro original
      }
    }
    
    // Se não for erro de prepared statement, relançar
    throw error
  } finally {
    // Em serverless, desconectar após a operação para liberar recursos
    if (isServerless) {
      try {
        await prisma.$disconnect()
      } catch {
        // Ignorar erros ao desconectar
      }
    }
  }
}

