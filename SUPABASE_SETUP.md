# 🚀 Configuração do Supabase

## 📋 Passos para Configurar

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Preencha:
   - **Name**: `traduzsum` (ou outro nome)
   - **Database Password**: Crie uma senha forte (anote ela!)
   - **Region**: Escolha a mais próxima (ex: `South America (São Paulo)`)
5. Clique em **"Create new project"**
6. Aguarde alguns minutos para o projeto ser criado

### 2. Obter Connection String

1. No painel do Supabase, vá em **Settings** → **Database**
2. Role até a seção **"Connection string"**
3. Selecione **"URI"** (não "Session mode" ou "Transaction")
4. Copie a string que aparece (algo como):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha que você criou no passo 1

### 3. Configurar Variável de Ambiente

1. No seu projeto local, abra o arquivo `.env.local`
2. Adicione ou atualize a linha `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.xxxxx.supabase.co:5432/postgres
   ```
3. Substitua `SUA_SENHA_AQUI` pela senha real do banco

### 4. Executar Migrações

Execute os comandos abaixo para criar as tabelas no Supabase:

```bash
# Gerar o Prisma Client
npx prisma generate

# Executar as migrações
npx prisma migrate deploy
```

Ou, se for a primeira vez:

```bash
# Criar e aplicar as migrações
npx prisma migrate dev --name init
```

### 5. Verificar Conexão

Para verificar se está funcionando:

```bash
# Abrir o Prisma Studio (interface visual do banco)
npx prisma studio
```

Isso abrirá uma interface web em `http://localhost:5555` onde você pode ver e editar os dados.

## 🔐 Segurança

### Variáveis de Ambiente na Vercel

Quando fizer deploy na Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione `DATABASE_URL` com a connection string do Supabase
3. **NUNCA** commite a connection string no Git!

### Connection Pooling (Opcional, Recomendado)

Para melhor performance em produção, use a connection string com pooling:

1. No Supabase, vá em **Settings** → **Database**
2. Use a connection string com **"Session mode"** ou **"Transaction mode"**
3. Ela terá um formato diferente (com `pooler.supabase.com`)

## 📊 Estrutura do Banco

O Prisma criará automaticamente as seguintes tabelas:

- **User**: Usuários do sistema
- **ResetToken**: Tokens de recuperação de senha

## ✅ Checklist

- [ ] Projeto criado no Supabase
- [ ] Connection string copiada
- [ ] `DATABASE_URL` configurada no `.env.local`
- [ ] Migrações executadas (`npx prisma migrate deploy`)
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Teste local funcionando
- [ ] `DATABASE_URL` configurada na Vercel (para produção)

## 🆘 Problemas Comuns

### Erro: "password authentication failed"
- Verifique se a senha na connection string está correta
- Certifique-se de substituir `[YOUR-PASSWORD]` pela senha real

### Erro: "connection timeout"
- Verifique se o IP está permitido no Supabase
- No Supabase, vá em **Settings** → **Database** → **Connection pooling**
- Verifique as configurações de firewall

### Erro: "relation does not exist"
- Execute as migrações: `npx prisma migrate deploy`
- Ou: `npx prisma migrate dev`

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase)
- [Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)

