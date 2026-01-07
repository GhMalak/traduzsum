# 🔧 Configurar Variáveis de Ambiente na Vercel

## ⚠️ Problema Atual

As variáveis de ambiente SMTP não estão configuradas na Vercel, por isso o email de recuperação não está funcionando.

## 📋 Passo a Passo

### 1. Acesse o Dashboard da Vercel

1. Vá para: https://vercel.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **TraduzSum** (ou o nome do seu projeto)

### 2. Acesse as Configurações

1. Clique em **Settings** (Configurações) no menu superior
2. No menu lateral, clique em **Environment Variables** (Variáveis de Ambiente)

### 3. Adicione as Variáveis

Adicione **cada uma** das seguintes variáveis:

#### ✅ Variáveis Obrigatórias para Email:

```
SMTP_HOST
```
- **Valor:** `smtp.gmail.com` (ou seu provedor de email)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

```
SMTP_PORT
```
- **Valor:** `  `
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

```
SMTP_USER
```
- **Valor:** Seu email completo (ex: `seu-email@gmail.com`)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

```
SMTP_PASS
```
- **Valor:** Sua senha de app do Gmail (veja como gerar abaixo)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### ✅ Variável Obrigatória para Banco de Dados:

```
DATABASE_URL
```
- **Valor:** URL de conexão do seu banco de dados PostgreSQL (Supabase)
- **Formato:** `postgresql://usuario:senha@host:porta/database?sslmode=require`
- **Exemplo Supabase:** `postgresql://postgres.xxxxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **⚠️ CRÍTICO:** Esta variável é obrigatória para o build funcionar!

#### ✅ Outras Variáveis Importantes:

```
NEXT_PUBLIC_SITE_URL
```
- **Valor:** URL do seu site na Vercel (ex: `https://traduzsum.vercel.app`)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

```
JWT_SECRET
```
- **Valor:** Uma string aleatória e segura (ex: `sua-chave-super-secreta-123456`)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

```
GROQ_API_KEY
```
- **Valor:** Sua chave da API Groq
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### 4. Como Obter a DATABASE_URL do Supabase

Se você está usando Supabase como banco de dados:

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Database**
4. Role até a seção **"Connection string"**
5. Selecione a aba **"URI"** (não "Session mode" ou "Transaction")
6. Copie a string que aparece (formato: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
7. **IMPORTANTE**: Substitua `[PASSWORD]` pela senha real do seu banco de dados
8. Se sua senha tem caracteres especiais, faça URL encoding:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `&` → `%26`
   - `+` → `%2B`
   - `=` → `%3D`
   - `?` → `%3F`
   - `/` → `%2F`
   - ` ` (espaço) → `%20`
9. Cole a URL completa no campo `DATABASE_URL` na Vercel

**Exemplo:**
```
postgresql://postgres:MinhaSenh@123@db.xxxxx.supabase.co:5432/postgres
```

**⚠️ IMPORTANTE:** 
- Não use colchetes `[]` na senha
- Se a senha tem caracteres especiais, faça URL encoding
- A URL deve estar completa e válida

### 5. Como Gerar Senha de App do Gmail

Se você está usando Gmail:

1. Acesse: https://myaccount.google.com/apppasswords
2. Faça login na sua conta Google
3. Selecione:
   - **App:** Email
   - **Device:** Outro (nome personalizado)
   - **Nome:** Digite "TraduzSum"
4. Clique em **Gerar**
5. Copie a senha de 16 caracteres (sem espaços)
6. Cole essa senha no campo `SMTP_PASS` na Vercel

**⚠️ Importante:** Use a **senha de app**, não a senha normal da sua conta Google!

### 6. Salvar e Fazer Redeploy

1. Após adicionar todas as variáveis, clique em **Save** (Salvar)
2. Vá para a aba **Deployments**
3. Clique nos **três pontos** (⋯) no último deploy
4. Selecione **Redeploy**
5. Aguarde o deploy terminar

### 7. Verificar se Funcionou

1. Após o redeploy, teste a recuperação de senha
2. Verifique os logs na Vercel:
   - Vá em **Deployments** → Selecione o deploy
   - Clique em **View Function Logs**
   - Procure por: `✅ Email de recuperação enviado com sucesso`

## 🔍 Verificação Rápida

Após configurar, os logs devem mostrar:

```
✅ Email de recuperação enviado com sucesso para: [email]
📧 Configurações SMTP verificadas: {
  host: 'smtp.gmail.com',
  port: '587',
  user: 'seu-email@gmail.com',
  pass: 'Configurado',
  siteUrl: 'https://seu-site.vercel.app'
}
```

## 🚨 Problemas Comuns

### "NÃO CONFIGURADO" ainda aparece

- ✅ Verifique se você salvou as variáveis
- ✅ Verifique se selecionou os ambientes corretos (Production, Preview, Development)
- ✅ Faça um **Redeploy** após adicionar as variáveis

### Email não chega

- ✅ Verifique a pasta de **SPAM**
- ✅ Verifique se o email está correto no banco de dados
- ✅ Verifique se a senha de app está correta (Gmail)

### Erro de autenticação (EAUTH)

- ✅ Use **senha de app** do Gmail, não a senha normal
- ✅ Verifique se não há espaços extras nas variáveis
- ✅ Verifique se `SMTP_USER` e `SMTP_PASS` estão corretos

## 📝 Checklist

Antes de testar, verifique:

- [ ] `DATABASE_URL` configurado (⚠️ OBRIGATÓRIO para build)
- [ ] `SMTP_HOST` configurado
- [ ] `SMTP_PORT` configurado
- [ ] `SMTP_USER` configurado (email completo)
- [ ] `SMTP_PASS` configurado (senha de app)
- [ ] `NEXT_PUBLIC_SITE_URL` configurado
- [ ] `JWT_SECRET` configurado
- [ ] `GROQ_API_KEY` configurado
- [ ] Todas as variáveis marcadas para Production
- [ ] Redeploy feito após adicionar variáveis

## 🎯 Resumo

1. **Vercel Dashboard** → Seu Projeto → **Settings** → **Environment Variables**
2. Adicione todas as variáveis listadas acima
3. Use **senha de app** do Gmail (não a senha normal)
4. **Salve** e faça **Redeploy**
5. Teste a recuperação de senha

Após seguir esses passos, o email de recuperação deve funcionar! 🚀

