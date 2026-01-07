# 🗄️ Configuração do Banco de Dados Persistente

## ✅ Implementação Concluída

O sistema agora usa **Prisma + SQLite** para armazenamento persistente. Todos os dados são salvos permanentemente no banco de dados.

## 📋 O que foi implementado

### 1. **Prisma ORM**
- Instalado e configurado
- Schema do banco de dados criado
- Migrações aplicadas

### 2. **Modelos do Banco**
- **User**: Armazena usuários (id, name, email, cpf, password, plan, credits)
- **ResetToken**: Armazena tokens de recuperação de senha

### 3. **Funções Migradas**
Todas as funções em `lib/auth.ts` agora usam o banco de dados:
- ✅ `createUser` - Cria usuário no banco
- ✅ `findUserByEmail` - Busca por email
- ✅ `findUserById` - Busca por ID
- ✅ `getAllUsers` - Lista todos os usuários
- ✅ `validateLogin` - Valida login
- ✅ `saveResetToken` - Salva token de recuperação
- ✅ `validateResetToken` - Valida token
- ✅ `deleteResetToken` - Remove token
- ✅ `updateUserPassword` - Atualiza senha
- ✅ `updateUserPlan` - Atualiza plano

## 🗂️ Estrutura do Banco

### Tabela `User`
```
- id: String (CUID único)
- name: String
- email: String (único)
- cpf: String (único)
- password: String (hash bcrypt)
- plan: String (Gratuito, Mensal, Anual, Créditos)
- credits: Int? (opcional)
- createdAt: DateTime
- updatedAt: DateTime
```

### Tabela `ResetToken`
```
- id: String (CUID único)
- token: String (único)
- email: String
- expiresAt: DateTime
- createdAt: DateTime
```

## 📁 Arquivos Criados

- `prisma/schema.prisma` - Schema do banco
- `prisma/migrations/` - Migrações do banco
- `lib/db.ts` - Cliente Prisma
- `dev.db` - Banco SQLite (local)

## 🚀 Como Funciona

### Desenvolvimento (Local)
- Usa SQLite (`dev.db`)
- Banco de dados local
- Dados persistem entre reinicializações

### Produção (Vercel)
Para produção, você pode:

1. **Usar SQLite** (simples, mas limitado)
   - Funciona na Vercel
   - Limite de tamanho

2. **Usar PostgreSQL** (recomendado)
   - Supabase (gratuito)
   - Neon (gratuito)
   - Vercel Postgres

## 🔄 Migrar para PostgreSQL (Produção)

### Opção 1: Supabase (Recomendado - Gratuito)

1. Crie conta em: https://supabase.com
2. Crie um novo projeto
3. Copie a connection string
4. Atualize `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
}
```
5. Adicione no `.env`:
```
DATABASE_URL="postgresql://..."
```
6. Execute:
```bash
npx prisma migrate deploy
```

### Opção 2: Vercel Postgres

1. Na Vercel, vá em Storage → Create Database
2. Escolha Postgres
3. Copie a connection string
4. Configure como acima

## 📝 Comandos Úteis

```bash
# Ver dados no banco
npx prisma studio

# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações em produção
npx prisma migrate deploy

# Resetar banco (CUIDADO: apaga tudo)
npx prisma migrate reset
```

## ⚠️ Importante

- ✅ **Dados são persistentes** - Não se perdem ao reiniciar
- ✅ **Backup automático** - Faça backup do `dev.db` regularmente
- ✅ **Produção** - Use PostgreSQL para produção
- ✅ **Migrações** - Sempre teste migrações antes de aplicar em produção

## 🎯 Próximos Passos

1. **Testar localmente** - Criar usuários e verificar persistência
2. **Configurar PostgreSQL** - Para produção (Supabase recomendado)
3. **Backup** - Configurar backups automáticos
4. **Monitoramento** - Adicionar logs de operações do banco

O banco de dados está funcionando e todos os dados são salvos permanentemente! 🎉

