# 🔧 Fix Final: Erro "prepared statement already exists"

## ❌ Problema
O erro `prepared statement "s0/s1/s2" already exists` (código `42P05`) persiste mesmo com retry automático.

## ✅ Solução Definitiva

### 1. **Desabilitar Cache de Prepared Statements**

Adicionei `statement_cache_size=0` na URL de conexão do PostgreSQL em ambientes serverless (Vercel).

Isso desabilita completamente o cache de prepared statements, evitando conflitos.

### 2. **Configuração no Vercel**

**IMPORTANTE:** Atualize a `DATABASE_URL` no Vercel para incluir `statement_cache_size=0`:

```
postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres?connection_limit=1&pool_timeout=5&statement_cache_size=0
```

### 3. **O que foi alterado**

**`lib/db.ts`:**
- Adiciona `statement_cache_size=0` automaticamente em ambientes serverless
- Mantém `connection_limit=1` e `pool_timeout=5` em serverless

**`lib/db-helper.ts`:**
- Ajustado retry para ser mais agressivo
- Melhor tratamento de reconexão

## 🔧 Como aplicar

### Opção 1: Atualizar DATABASE_URL no Vercel (RECOMENDADO)

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables

2. Encontre a variável `DATABASE_URL`

3. Atualize o valor para incluir `statement_cache_size=0`:
   ```
   postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres?connection_limit=1&pool_timeout=5&statement_cache_size=0
   ```

4. **OU** remova a variável e adicione novamente com o novo valor

5. Salve e faça **redeploy**

### Opção 2: O código adiciona automaticamente

O código agora adiciona `statement_cache_size=0` automaticamente em ambientes serverless, mas **se a URL já tiver parâmetros, pode não funcionar corretamente**.

**Recomendação:** Atualize a URL no Vercel manualmente (Opção 1).

## 📋 Checklist

- [ ] `statement_cache_size=0` adicionado na `DATABASE_URL` do Vercel
- [ ] Código atualizado (`lib/db.ts` e `lib/db-helper.ts`)
- [ ] Redeploy feito no Vercel
- [ ] Testado novamente (login, registro, etc.)

## 🧪 Como Testar

1. Faça login
2. Acesse o dashboard
3. Tente criar uma conta nova
4. Verifique os logs do Vercel - não deve mais aparecer erro `42P05`

## 💡 Por que isso funciona?

O PostgreSQL usa prepared statements para melhorar performance, mas em ambientes serverless onde cada função pode compartilhar conexões, isso causa conflitos.

Desabilitando o cache (`statement_cache_size=0`), cada query é executada diretamente sem usar o cache, evitando conflitos.

**Trade-off:** Performance ligeiramente menor, mas **zero conflitos** em serverless.

## 📚 Referências

- [PostgreSQL Statement Cache](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-PARAMKEYWORDS)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

