# 📝 Configurar .env.local com Supabase

Este guia mostra como configurar o arquivo `.env.local` com todas as variáveis necessárias, incluindo as configurações do Supabase.

---

## 📋 Passo 1: Criar o Arquivo .env.local

1. Na pasta raiz do projeto (`d:\traduzjuris`), crie um arquivo chamado `.env.local`
2. Se já existir, abra e adicione/substitua as variáveis abaixo

---

## 📋 Passo 2: Copiar o Conteúdo Abaixo

Copie TODO o conteúdo abaixo e cole no arquivo `.env.local`:

```env
# =====================================================
# DATABASE - Supabase PostgreSQL
# =====================================================
# Use POSTGRES_URL_NON_POOLING para Prisma (conexão direta)
DATABASE_URL="postgres://postgres.klcbufexiyjlbavpojxc:H3gtNwShAmccFIkB@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# =====================================================
# SUPABASE - Configurações do Supabase
# =====================================================
NEXT_PUBLIC_SUPABASE_URL="https://klcbufexiyjlbavpojxc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2J1ZmV4aXlqbGJhdnBvanhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MjQyMjksImV4cCI6MjA4MzQwMDIyOX0.-YkbphXaeF_JBN9vTJ-5zPvi9T2FMxS2m2JWCMV8Drk"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_V1D9PQt4r132-YbS_G7tkg_vmbvEdcJ"
SUPABASE_URL="https://klcbufexiyjlbavpojxc.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2J1ZmV4aXlqbGJhdnBvanhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MjQyMjksImV4cCI6MjA4MzQwMDIyOX0.-YkbphXaeF_JBN9vTJ-5zPvi9T2FMxS2m2JWCMV8Drk"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2J1ZmV4aXlqbGJhdnBvanhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyNDIyOSwiZXhwIjoyMDgzNDAwMjI5fQ.zdLP6lFc6zi0euiXviCFh0A23m8vFayqiqi7FF_Yk6w"
SUPABASE_JWT_SECRET="wMb8Mt4cPuxYgQkAjsm7T2pM2KM4DJOsXi8bpGgH0KWWpk2fMM/Z/W4p05EOETZBP1ZnIVszwIN9Krwo7E2sug=="

# =====================================================
# GROQ API - Para tradução de textos
# =====================================================
# Obtenha sua chave em: https://console.groq.com/
GROQ_API_KEY="sua_chave_groq_aqui"

# =====================================================
# JWT - Autenticação
# =====================================================
# Gere uma string aleatória segura para produção
# Use: openssl rand -base64 32
JWT_SECRET="seu-secret-super-seguro-mude-em-producao"

# =====================================================
# SMTP - Configuração de Email
# =====================================================
# Para Gmail, use uma senha de app:
# 1. Acesse: https://myaccount.google.com/apppasswords
# 2. Gere uma senha de app
# 3. Use essa senha em SMTP_PASS (não sua senha normal)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu_email@gmail.com"
SMTP_PASS="sua_senha_de_app_aqui"

# =====================================================
# SITE URL - URL base do site
# =====================================================
# Para desenvolvimento local
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
# Para produção (substitua pela sua URL do Vercel)
# NEXT_PUBLIC_SITE_URL="https://seu-projeto.vercel.app"
```

---

## 📋 Passo 3: Preencher as Variáveis Faltantes

### 3.1. GROQ_API_KEY
1. Acesse [https://console.groq.com/](https://console.groq.com/)
2. Crie uma conta ou faça login
3. Vá para a seção de API Keys
4. Crie uma nova chave de API
5. Copie e substitua `"sua_chave_groq_aqui"` pela chave real

### 3.2. JWT_SECRET
Para produção, gere uma chave segura:
```bash
# No terminal:
openssl rand -base64 32
```
Substitua `"seu-secret-super-seguro-mude-em-producao"` pela chave gerada.

### 3.3. SMTP (Email)
Para usar Gmail:
1. Acesse [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Gere uma senha de app (não use sua senha normal do Gmail)
3. Substitua:
   - `SMTP_USER` pelo seu email do Gmail
   - `SMTP_PASS` pela senha de app gerada

### 3.4. NEXT_PUBLIC_SITE_URL
- Para desenvolvimento: deixe como `http://localhost:3000`
- Para produção: substitua pela URL do seu site no Vercel (ex: `https://traduzsum.vercel.app`)

---

## ✅ Verificar se Está Funcionando

### 1. Reiniciar o Servidor
Após criar/editar o `.env.local`:
```bash
# Pare o servidor (Ctrl+C) e reinicie:
npm run dev
```

### 2. Testar a Conexão com o Banco
```bash
# Aplicar o schema do Prisma ao banco:
npx prisma db push
```

Se funcionar, você verá:
```
✔ Generated Prisma Client
✔ Database synchronized successfully
```

### 3. Testar a Aplicação
1. Abra [http://localhost:3000](http://localhost:3000)
2. Tente criar uma conta nova
3. Se funcionar, a conexão com o banco está OK! ✅

---

## 🔒 Segurança

### ⚠️ IMPORTANTE:
- **NUNCA** commite o arquivo `.env.local` no Git
- O arquivo já está no `.gitignore` (não será commitado)
- **NUNCA** compartilhe suas chaves de API ou senhas
- Para produção no Vercel, adicione as variáveis em Settings → Environment Variables

---

## 📋 Variáveis que Precisam ser Adicionadas no Vercel

Quando fizer deploy no Vercel, adicione estas variáveis em **Settings → Environment Variables**:

### Obrigatórias:
- `DATABASE_URL` - A mesma URL do `.env.local`
- `GROQ_API_KEY` - Sua chave da Groq
- `JWT_SECRET` - A mesma chave do `.env.local`
- `SMTP_HOST` - smtp.gmail.com
- `SMTP_PORT` - 587
- `SMTP_USER` - Seu email
- `SMTP_PASS` - Sua senha de app
- `NEXT_PUBLIC_SITE_URL` - URL do seu site no Vercel

### Opcionais (Supabase):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- As outras variáveis do Supabase (se quiser usar o Supabase Client no futuro)

---

## 🆘 Solução de Problemas

### Erro: "DATABASE_URL não encontrada"
- ✅ Verifique se o arquivo `.env.local` está na raiz do projeto
- ✅ Verifique se não há espaços antes ou depois do `=`
- ✅ Verifique se as aspas estão corretas

### Erro: "GROQ_API_KEY não encontrada"
- ✅ Verifique se adicionou sua chave real (não deixe "sua_chave_groq_aqui")
- ✅ Reinicie o servidor após adicionar

### Erro de conexão com o banco
- ✅ Verifique se a `DATABASE_URL` está correta
- ✅ Verifique se as tabelas foram criadas no Supabase (veja `CRIAR_TABELAS_SUPABASE.md`)
- ✅ Execute `npx prisma db push` para sincronizar o schema

---

## ✨ Pronto!

Agora seu `.env.local` está configurado com todas as variáveis necessárias!

Avise se precisar de ajuda com alguma configuração específica.

