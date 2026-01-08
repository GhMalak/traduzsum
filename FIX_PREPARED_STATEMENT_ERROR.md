# 🔧 Fix: Erro "prepared statement already exists"

## ❌ Erro Original
```
Invalid `prisma.user.findUnique()` invocation: 
Error occurred during query execution: 
ConnectorError(ConnectorError { 
  user_facing_error: None, 
  kind: QueryError(PostgresError { 
    code: "42P05", 
    message: "prepared statement \"s2\" already exists", 
    severity: "ERROR"
  })
})
```

## 🔍 Causa do Problema

Este erro ocorre quando:
1. **Ambiente Serverless (Vercel)**: Cada função serverless pode reutilizar conexões do banco
2. **Prepared Statements**: O Prisma usa prepared statements que podem conflitar entre requisições
3. **Múltiplas Conexões**: Várias requisições simultâneas podem tentar criar o mesmo prepared statement

## ✅ Soluções Implementadas

### 1. **Configuração do Prisma Client** (`lib/db.ts`)
- ✅ Adicionado `connection_limit=1` para limitar conexões simultâneas
- ✅ Adicionado `pool_timeout=10` para evitar timeouts
- ✅ Garantido que o Prisma Client seja um singleton (já estava implementado)

### 2. **Tratamento de Erro Específico** (`lib/auth.ts`)
- ✅ Função `findUserByEmail` agora trata erros de prepared statement
- ✅ Função `saveResetToken` agora trata erros de prepared statement
- ✅ Reconexão automática quando detecta erro de prepared statement
- ✅ Retry automático após reconectar

## 🔧 Mudanças no Código

### `lib/db.ts`
```typescript
// Adiciona parâmetros de conexão à URL do banco
finalDatabaseUrl += '?connection_limit=1&pool_timeout=10'
```

### `lib/auth.ts`
```typescript
try {
  // Código normal
} catch (error: any) {
  if (error?.message?.includes('prepared statement') || error?.code === '42P05') {
    // Reconectar e tentar novamente
    await prisma.$disconnect()
    await prisma.$connect()
    // Retry...
  }
}
```

## 🧪 Como Testar

1. **Teste "Esqueci a Senha"**:
   - Acesse a página de recuperação de senha
   - Insira um email válido
   - Deve funcionar sem erro

2. **Teste Múltiplas Requisições**:
   - Faça várias requisições simultâneas
   - Todas devem funcionar sem conflitos

3. **Verificar Logs**:
   - Os logs do Vercel não devem mais mostrar erros de prepared statement
   - Se aparecer, deve reconectar automaticamente

## 📋 Verificações

- [x] `connection_limit=1` adicionado à URL do banco
- [x] `pool_timeout=10` adicionado à URL do banco
- [x] Tratamento de erro em `findUserByEmail`
- [x] Tratamento de erro em `saveResetToken`
- [x] Reconexão automática implementada
- [x] Retry automático após reconectar

## 🚀 Próximos Passos

Se o erro persistir, podemos:
1. Adicionar tratamento de erro em todas as funções que usam Prisma
2. Implementar um wrapper de retry mais robusto
3. Considerar usar connection pooling externo (PgBouncer)

## 💡 Notas Técnicas

- O erro `42P05` é específico do PostgreSQL
- Acontece mais em ambientes serverless devido à reutilização de conexões
- `connection_limit=1` força uma conexão por vez, evitando conflitos
- A reconexão resolve o problema na maioria dos casos

## 📚 Referências

- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [PostgreSQL Prepared Statements](https://www.postgresql.org/docs/current/sql-prepare.html)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

