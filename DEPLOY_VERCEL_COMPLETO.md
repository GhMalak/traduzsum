# 🚀 Deploy Completo no Vercel - TraduzSum

Guia passo a passo para fazer deploy do projeto no Vercel com todas as configurações necessárias.

---

## ✅ Pré-requisitos

- ✅ Projeto funcionando localmente
- ✅ Conta GitHub criada
- ✅ Conta Vercel criada (ou criar agora)
- ✅ Projeto Supabase configurado
- ✅ Connection string do Supabase

---

## 📋 Passo 1: Preparar o Código no GitHub

### 1.1. Verificar se está no Git

```bash
git status
```

Se não estiver inicializado:
```bash
git init
git add .
git commit -m "Initial commit - TraduzSum pronto para deploy"
```

### 1.2. Criar Repositório no GitHub (se ainda não criou)

1. Acesse [https://github.com](https://github.com)
2. Clique no botão **"+"** → **"New repository"**
3. Preencha:
   - **Name**: `traduzsum` (ou o nome que preferir)
   - **Description**: "TraduzSum - Tradução de textos jurídicos"
   - Escolha **Público** ou **Privado**
   - **NÃO** marque "Add a README"
4. Clique em **"Create repository"**

### 1.3. Conectar e Enviar o Código

```bash
# Adicionar remote (substitua SEU_USUARIO pelo seu usuário)
git remote add origin https://github.com/SEU_USUARIO/traduzsum.git
git branch -M main
git push -u origin main
```

---

## 📋 Passo 2: Criar Tabelas no Supabase (IMPORTANTE!)

**⚠️ FAÇA ISSO ANTES DO DEPLOY!**

### 2.1. Acessar o SQL Editor do Supabase

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto **"supabase-indigo-village"**
3. Clique em **SQL Editor** → **"New query"**

### 2.2. Executar o SQL

1. Abra o arquivo `supabase_schema.sql` do projeto
2. **Copie TODO o conteúdo**
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou Ctrl+Enter)
5. ✅ As tabelas `User` e `ResetToken` serão criadas!

---

## 📋 Passo 3: Criar Conta na Vercel (se ainda não tem)

1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize a Vercel a acessar seu GitHub

---

## 📋 Passo 4: Importar Projeto no Vercel

### 4.1. Importar Repositório

1. Na dashboard da Vercel, clique em **"Add New..."**
2. Clique em **"Project"**
3. Você verá seus repositórios do GitHub
4. Clique em **"Import"** ao lado do repositório `traduzsum`

### 4.2. Configurar o Projeto

Na tela de configuração:
- **Project Name**: Deixe como está ou mude para `traduzsum`
- **Framework Preset**: Deve estar como "Next.js" (detecta automaticamente)
- **Root Directory**: Deixe como `./` (padrão)
- **Build Command**: Deixe como está (`npm run build`)
- **Output Directory**: Deixe como está (`.next`)

---

## 📋 Passo 5: Adicionar Variáveis de Ambiente (MUITO IMPORTANTE!)

**⚠️ NÃO clique em Deploy ainda! Adicione todas as variáveis primeiro!**

### 5.1. Acessar Environment Variables

Na tela de configuração do projeto, role para baixo até **"Environment Variables"**

### 5.2. Adicionar Variáveis (uma por uma)

Clique em **"Add"** e adicione cada variável:

#### 1. DATABASE_URL (OBRIGATÓRIA)
- **Key**: `DATABASE_URL`
- **Value**: `postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 2. GROQ_API_KEY (OBRIGATÓRIA)
- **Key**: `GROQ_API_KEY`
- **Value**: Sua chave da Groq (obtenha em [https://console.groq.com/](https://console.groq.com/))
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 3. JWT_SECRET (OBRIGATÓRIA)
- **Key**: `JWT_SECRET`
- **Value**: Gere uma chave segura:
  ```bash
  openssl rand -base64 32
  ```
  Ou use uma string aleatória longa
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 4. SMTP_HOST (para emails de recuperação de senha)
- **Key**: `SMTP_HOST`
- **Value**: `smtp.gmail.com`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 5. SMTP_PORT
- **Key**: `SMTP_PORT`
- **Value**: `587`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 6. SMTP_USER
- **Key**: `SMTP_USER`
- **Value**: Seu email do Gmail (ex: `gustavo.calasan@gmail.com`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 7. SMTP_PASS (OBRIGATÓRIA se quiser emails)
- **Key**: `SMTP_PASS`
- **Value**: Senha de app do Gmail
  - **Como gerar**: Acesse [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
  - Gere uma senha de app e use ela aqui
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 8. NEXT_PUBLIC_SITE_URL (OBRIGATÓRIA)
- **Key**: `NEXT_PUBLIC_SITE_URL`
- **Value**: **Deixe vazio por enquanto** - preencheremos depois com a URL do Vercel
  - Exemplo: `https://traduzsum.vercel.app` (mas você ainda não sabe qual será)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 9. Variáveis do Supabase (OPCIONAL, mas recomendado)
- **Key**: `NEXT_PUBLIC_SUPABASE_URL` → **Value**: `https://klcbufexiyjlbavpojxc.supabase.co`
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2J1ZmV4aXlqbGJhdnBvanhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MjQyMjksImV4cCI6MjA4MzQwMDIyOX0.-YkbphXaeF_JBN9vTJ-5zPvi9T2FMxS2m2JWCMV8Drk`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 5.3. Verificar Todas as Variáveis

Antes de fazer deploy, verifique se todas aparecem na lista:
- ✅ DATABASE_URL
- ✅ GROQ_API_KEY
- ✅ JWT_SECRET
- ✅ SMTP_HOST
- ✅ SMTP_PORT
- ✅ SMTP_USER
- ✅ SMTP_PASS
- ✅ NEXT_PUBLIC_SITE_URL (deixe vazio por enquanto)

---

## 📋 Passo 6: Fazer o Deploy

### 6.1. Deploy Inicial

1. Após adicionar todas as variáveis, clique em **"Deploy"**
2. Aguarde o processo (leva 2-3 minutos)
3. Você verá o progresso em tempo real

### 6.2. Se o Deploy Falhar

**Erro comum**: `DATABASE_URL not found`
- ✅ Verifique se adicionou a variável corretamente
- ✅ Certifique-se de que marcou **Production, Preview e Development**

**Erro comum**: `Build failed`
- ✅ Clique em **"View Function Logs"** para ver o erro específico
- ✅ Verifique os logs na aba **"Build Logs"**

---

## 📋 Passo 7: Atualizar NEXT_PUBLIC_SITE_URL

### 7.1. Obter a URL do Site

Após o deploy ser concluído:
1. Você verá uma URL como: `traduzsum.vercel.app` ou `traduzsum-xxxxx.vercel.app`
2. Copie essa URL completa (incluindo `https://`)

### 7.2. Atualizar a Variável

1. No Vercel, vá em **Settings** → **Environment Variables**
2. Encontre `NEXT_PUBLIC_SITE_URL`
3. Clique em **"Edit"**
4. Atualize o valor para: `https://sua-url.vercel.app`
5. Salve

### 7.3. Fazer Redeploy

1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deploy
3. Selecione **"Redeploy"**
4. Aguarde terminar

---

## ✅ Passo 8: Testar o Site

### 8.1. Testar Funcionalidades Básicas

1. Acesse sua URL no Vercel (ex: `https://traduzsum.vercel.app`)
2. Teste criar uma conta nova
3. Teste fazer login
4. Teste traduzir um texto
5. Teste recuperar senha (se configurou SMTP)

### 8.2. Verificar Dados no Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Table Editor**
4. Verifique se os dados aparecem nas tabelas `User` e `ResetToken`

---

## 🔧 Solução de Problemas

### Erro: "Environment variable not found: DATABASE_URL"
**Solução:**
- ✅ Verifique se adicionou a variável no Vercel
- ✅ Certifique-se de que marcou **Production, Preview e Development**
- ✅ Faça um redeploy após adicionar

### Erro: "Authentication failed against database server"
**Solução:**
- ✅ Verifique se a senha na `DATABASE_URL` está correta
- ✅ Verifique se o Supabase está ativo (não pausado)

### Erro: "The introspected database was empty"
**Solução:**
- ✅ Execute o SQL no Supabase SQL Editor (veja Passo 2)
- ✅ Certifique-se de que as tabelas foram criadas

### Site não carrega ou dá erro 500
**Solução:**
- ✅ Verifique os logs no Vercel (Deployments → Functions)
- ✅ Verifique se todas as variáveis foram adicionadas
- ✅ Verifique se o `GROQ_API_KEY` está correto

### Emails de recuperação não chegam
**Solução:**
- ✅ Verifique se `SMTP_USER` e `SMTP_PASS` estão corretos
- ✅ Use uma senha de app do Gmail (não a senha normal)
- ✅ Verifique os logs do Vercel para erros de SMTP

---

## 📋 Checklist Final

Antes de considerar o deploy completo:

- [ ] Código está no GitHub
- [ ] Tabelas criadas no Supabase
- [ ] Projeto importado no Vercel
- [ ] Todas as variáveis de ambiente adicionadas
- [ ] Deploy concluído com sucesso
- [ ] `NEXT_PUBLIC_SITE_URL` atualizada com a URL real
- [ ] Redeploy feito após atualizar `NEXT_PUBLIC_SITE_URL`
- [ ] Site está acessível pela URL
- [ ] Teste de criação de conta funcionando
- [ ] Teste de login funcionando
- [ ] Teste de tradução funcionando
- [ ] Dados aparecendo no Supabase

---

## 🎉 Pronto!

Seu TraduzSum está no ar! 🚀

**URL do seu site**: `https://traduzsum.vercel.app` (ou a URL que o Vercel gerou)

---

## 📚 Arquivos Relacionados

- `CONFIG_SUPABASE_VERCEL.md` - Configuração detalhada do Supabase
- `CRIAR_TABELAS_SUPABASE.md` - Guia de criação de tabelas
- `CONFIG_VERCEL_ENV.md` - Guia completo de variáveis de ambiente
- `supabase_schema.sql` - SQL para criar as tabelas

---

**Boa sorte com o deploy! 🚀**

