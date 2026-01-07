# 🚀 Adicionar DATABASE_URL no Vercel - Passo a Passo Rápido

## ✅ Sua Connection String

```
postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres
```

---

## 📋 Passos para Adicionar no Vercel

### 1. Acesse o Vercel Dashboard
1. Vá para [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Faça login
3. Selecione seu projeto **traduzsum** (ou o nome do seu projeto)

### 2. Vá em Settings → Environment Variables
1. No menu do projeto, clique em **Settings**
2. No menu lateral, clique em **Environment Variables**
3. Clique em **"Add New"** (canto superior direito)

### 3. Adicione a DATABASE_URL
1. **Key**: Digite `DATABASE_URL`
2. **Value**: Cole exatamente esta string:
   ```
   postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres
   ```
3. **Environments**: Marque TODAS as opções:
   - ✅ **Production**
   - ✅ **Preview**  
   - ✅ **Development**
4. Clique em **"Save"**

### 4. Verificar
- ✅ A variável `DATABASE_URL` deve aparecer na lista
- ✅ O valor será mascarado (mostra apenas `********`)

---

## 📋 Adicionar Outras Variáveis Obrigatórias

Você também precisa adicionar estas variáveis no Vercel:

### 1. GROQ_API_KEY
- **Key**: `GROQ_API_KEY`
- **Value**: Sua chave da Groq
- **Environments**: Production, Preview, Development

### 2. JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: Uma string aleatória (gere com: `openssl rand -base64 32`)
- **Environments**: Production, Preview, Development

### 3. SMTP (para emails)
- **Key**: `SMTP_HOST` → **Value**: `smtp.gmail.com`
- **Key**: `SMTP_PORT` → **Value**: `587`
- **Key**: `SMTP_USER` → **Value**: Seu email do Gmail
- **Key**: `SMTP_PASS` → **Value**: Senha de app do Gmail
- **Environments**: Production, Preview, Development

### 4. NEXT_PUBLIC_SITE_URL
- **Key**: `NEXT_PUBLIC_SITE_URL`
- **Value**: URL do seu site no Vercel (ex: `https://traduzsum.vercel.app`)
- **Environments**: Production, Preview, Development

---

## 📋 Criar as Tabelas no Supabase (IMPORTANTE!)

Antes de fazer deploy, você PRECISA criar as tabelas no Supabase:

### Passo 1: Acessar o SQL Editor
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione o projeto **supabase-indigo-village**
3. Clique em **SQL Editor**
4. Clique em **"New query"**

### Passo 2: Executar o SQL
1. Abra o arquivo `supabase_schema.sql` do projeto
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou Ctrl+Enter)
5. ✅ Pronto! As tabelas serão criadas

---

## 📋 Fazer Redeploy no Vercel

Após adicionar todas as variáveis:

1. No Vercel, vá em **Deployments**
2. Encontre o último deploy
3. Clique nos três pontos (⋯) ao lado
4. Selecione **"Redeploy"**
5. Aguarde o deploy terminar (2-3 minutos)

---

## ✅ Testar

1. Acesse sua URL no Vercel (ex: `traduzsum.vercel.app`)
2. Tente criar uma conta nova
3. Se funcionar, está tudo OK! ✅

---

## 🆘 Problemas Comuns

### Erro: "Environment variable not found: DATABASE_URL"
- ✅ Verifique se a variável foi salva no Vercel
- ✅ Certifique-se de que marcou **Production, Preview e Development**
- ✅ Faça um redeploy após adicionar

### Erro: "The introspected database was empty"
- ✅ Execute o SQL no Supabase SQL Editor primeiro (veja acima)

### Erro: "Authentication failed"
- ✅ Verifique se a senha na connection string está correta
- ✅ Verifique se não há espaços extras na variável no Vercel

---

**Pronto! Agora é só seguir os passos acima! 🚀**

