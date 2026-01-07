# 🚀 Conectar Supabase no Site (Produção) - Guia Rápido

Este guia mostra como conectar seu banco de dados Supabase diretamente no Vercel (produção), sem usar local.

---

## ✅ Pré-requisitos

- ✅ Projeto Supabase criado ("supabase-indigo-village")
- ✅ Conta Vercel criada
- ✅ Projeto já deployado no Vercel (ou pronto para deploy)

---

## 📋 Passo 1: Obter a Connection String do Supabase

### 1.1. Acessar o Supabase Dashboard
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login
3. Selecione o projeto **"supabase-indigo-village"**

### 1.2. Obter a Connection String
1. No menu lateral, clique em **Settings** (⚙️)
2. Clique em **Database**
3. Role para baixo até encontrar **"Connection string"**
4. Selecione a aba **"URI"**
5. Copie a string completa (exemplo):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
   ```
6. ⚠️ **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha real do banco
   - Se não souber, clique em **"Reset database password"** e defina uma nova

### 1.3. String Correta para Prisma
Use a conexão **"Non-pooling"** ou **"Direct connection"** (não o pooler):
```
postgresql://postgres.xxxxx:SUA_SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

---

## 📋 Passo 2: Criar as Tabelas no Supabase

### Opção A: Via SQL Editor (Mais Rápido) ⭐ RECOMENDADO

1. No Supabase Dashboard, clique em **SQL Editor**
2. Clique em **"New query"**
3. Abra o arquivo `supabase_schema.sql` do projeto
4. Copie TODO o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **"Run"** (ou Ctrl+Enter)
7. ✅ As tabelas `User` e `ResetToken` serão criadas!

### Opção B: Via Prisma (Se preferir)

1. Configure o `.env.local` temporariamente com a DATABASE_URL do Supabase:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:SUA_SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
   ```
2. Execute:
   ```bash
   npx prisma db push
   ```

---

## 📋 Passo 3: Adicionar DATABASE_URL no Vercel

### 3.1. Acessar o Dashboard do Vercel
1. Vá para [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Faça login
3. Selecione seu projeto **traduzsum** (ou o nome do seu projeto)

### 3.2. Adicionar a Variável DATABASE_URL
1. No menu do projeto, clique em **Settings**
2. No menu lateral, clique em **Environment Variables**
3. Clique em **"Add New"** (canto superior direito)

### 3.3. Preencher os Dados
1. **Key**: Digite `DATABASE_URL`
2. **Value**: Cole a connection string completa do Supabase:
   ```
   postgresql://postgres.xxxxx:SUA_SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```
   ⚠️ **Substitua `xxxxx` pelo ID do seu projeto e `SUA_SENHA` pela senha real**

3. **Environments**: Marque TODAS as opções:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**

4. Clique em **"Save"**

### 3.4. Verificar
- ✅ A variável `DATABASE_URL` deve aparecer na lista
- ✅ O valor será mascarado (mostra apenas `********`)

---

## 📋 Passo 4: Adicionar Outras Variáveis Necessárias

### Variáveis Obrigatórias:

#### 1. GROQ_API_KEY
- **Key**: `GROQ_API_KEY`
- **Value**: Sua chave da Groq (obtenha em [https://console.groq.com/](https://console.groq.com/))
- **Environments**: Production, Preview, Development

#### 2. JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: Uma string aleatória segura (gere com: `openssl rand -base64 32`)
- **Environments**: Production, Preview, Development

#### 3. SMTP (para emails de recuperação de senha)
- **Key**: `SMTP_HOST` → **Value**: `smtp.gmail.com`
- **Key**: `SMTP_PORT` → **Value**: `587`
- **Key**: `SMTP_USER` → **Value**: Seu email do Gmail
- **Key**: `SMTP_PASS` → **Value**: Senha de app do Gmail ([gerar aqui](https://myaccount.google.com/apppasswords))
- **Environments**: Production, Preview, Development

#### 4. NEXT_PUBLIC_SITE_URL
- **Key**: `NEXT_PUBLIC_SITE_URL`
- **Value**: URL do seu site no Vercel (ex: `https://traduzsum.vercel.app`)
- **Environments**: Production, Preview, Development

---

## 📋 Passo 5: Fazer Redeploy no Vercel

### 5.1. Trigger Manual
1. No Vercel, vá para **Deployments**
2. Encontre o último deploy
3. Clique nos três pontos (⋯) ao lado
4. Selecione **"Redeploy"**
5. Aguarde o deploy terminar (2-3 minutos)

### 5.2. Ou Faça Push no Git
```bash
git add .
git commit -m "Configurar Supabase em produção"
git push
```

A Vercel fará deploy automático após o push.

---

## ✅ Verificar se Está Funcionando

### Teste 1: Verificar Logs do Vercel
1. No Vercel, vá em **Deployments**
2. Clique no último deploy
3. Clique na aba **"Functions"** ou **"Build Logs"**
4. Procure por erros relacionados a `DATABASE_URL` ou `Prisma`

### Teste 2: Testar a Aplicação
1. Acesse sua URL no Vercel (ex: `traduzsum.vercel.app`)
2. Tente criar uma conta nova
3. Se funcionar, o banco está conectado! ✅

### Teste 3: Verificar no Supabase
1. No Supabase Dashboard, vá em **Table Editor**
2. Verifique se as tabelas `User` e `ResetToken` existem
3. Após criar uma conta no site, verifique se aparece na tabela `User`

---

## 🔧 Solução de Problemas

### Erro: "Environment variable not found: DATABASE_URL"
**Solução:**
- ✅ Verifique se a variável foi adicionada no Vercel
- ✅ Certifique-se de que marcou **Production, Preview e Development**
- ✅ Faça um redeploy após adicionar a variável

### Erro: "Authentication failed against database server"
**Solução:**
- ✅ Verifique se a senha na connection string está correta
- ✅ Verifique se substituiu `[YOUR-PASSWORD]` pela senha real
- ✅ Tente redefinir a senha do banco no Supabase e atualizar no Vercel

### Erro: "The introspected database was empty"
**Solução:**
- ✅ Execute o SQL no Supabase SQL Editor (veja Passo 2 - Opção A)
- ✅ Ou execute `npx prisma db push` localmente com a DATABASE_URL do Supabase

### As tabelas não aparecem no Supabase
**Solução:**
- ✅ Verifique se executou o SQL corretamente no SQL Editor
- ✅ Recarregue a página do Supabase
- ✅ Verifique se está no projeto correto ("supabase-indigo-village")

---

## 📋 Checklist Final

Antes de considerar tudo pronto:

- [ ] DATABASE_URL adicionada no Vercel
- [ ] GROQ_API_KEY adicionada no Vercel
- [ ] JWT_SECRET adicionada no Vercel
- [ ] SMTP configurado no Vercel (se quiser emails)
- [ ] NEXT_PUBLIC_SITE_URL adicionada no Vercel
- [ ] Tabelas criadas no Supabase (User e ResetToken)
- [ ] Redeploy feito no Vercel
- [ ] Teste de criação de conta funcionando
- [ ] Dados aparecendo na tabela User do Supabase

---

## 🎯 Próximos Passos

Após conectar o Supabase em produção:

1. ✅ Teste criar uma conta nova no site
2. ✅ Teste fazer login
3. ✅ Teste recuperação de senha (se configurou SMTP)
4. ✅ Verifique os dados no Supabase (Table Editor)

---

## 📚 Arquivos Relacionados

- `supabase_schema.sql` - SQL para criar as tabelas
- `CRIAR_TABELAS_SUPABASE.md` - Guia detalhado de criação de tabelas
- `CONFIG_SUPABASE_VERCEL.md` - Guia completo de configuração

---

**Pronto! Seu banco Supabase está conectado em produção! 🚀**

