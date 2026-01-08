# 🔍 Diagnóstico: Erro no Servidor - Banco de Dados

## ❌ Erro Atual
"Erro no servidor. Verifique se o banco de dados está configurado."

## 🔧 O que foi corrigido

### 1. **Tratamento de Erro Melhorado**
Todas as APIs agora:
- ✅ Sempre retornam JSON válido (nunca HTML de erro)
- ✅ Detectam erros de conexão com banco de dados
- ✅ Mostram mensagens de erro claras e específicas

### 2. **APIs Atualizadas**
- `app/api/auth/register/route.ts` - Registro
- `app/api/auth/login/route.ts` - Login
- `app/api/auth/me/route.ts` - Dados do usuário
- `app/api/auth/forgot-password/route.ts` - Recuperação de senha
- `app/api/auth/reset-password/route.ts` - Reset de senha
- `app/api/admin/users/route.ts` - Lista de usuários
- `app/api/admin/check/route.ts` - Verificação admin
- `app/api/admin/update-plan/route.ts` - Atualizar plano
- `app/api/process-pdf/route.ts` - Processar PDF

## 🚨 Problema Principal

O erro acontece porque a **`DATABASE_URL` não está configurada no Vercel** ou está configurada incorretamente.

## ✅ Solução: Configurar DATABASE_URL no Vercel

### Passo 1: Acessar Configurações do Vercel
1. Acesse https://vercel.com
2. Selecione seu projeto `traduzjuris`
3. Vá em **Settings** → **Environment Variables**

### Passo 2: Adicionar DATABASE_URL

**Nome da variável:**
```
DATABASE_URL
```

**Valor:**
```
postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres
```

**⚠️ IMPORTANTE:**
- ✅ **NÃO coloque entre aspas** o valor
- ✅ **NÃO inclua espaços** antes ou depois
- ✅ **Marque para "Production"** (checkbox)
- ✅ **Marque para "Preview"** (checkbox) - opcional mas recomendado
- ✅ **Marque para "Development"** (checkbox) - opcional

### Passo 3: Verificar Outras Variáveis
Certifique-se de que **TODAS** estas variáveis estão configuradas:

```
DATABASE_URL=postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres
JWT_SECRET=seu-jwt-secret-aqui
GROQ_API_KEY=sua-groq-api-key-aqui
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app-aqui
NEXT_PUBLIC_SITE_URL=https://seu-site.vercel.app
```

### Passo 4: Fazer Redeploy
1. Após adicionar/atualizar variáveis, vá em **Deployments**
2. Clique nos **3 pontos** (⋯) do deployment mais recente
3. Selecione **Redeploy**
4. Ou faça um novo commit e push (isso vai triggerar um novo deploy automaticamente)

## 🔍 Como Verificar se Está Funcionando

### 1. Verificar Logs do Vercel
1. Acesse **Deployments** → Selecione o deployment mais recente
2. Clique em **Functions** → Selecione uma função API (ex: `/api/auth/me`)
3. Veja os logs para verificar se há erros

### 2. Testar Endpoint de Debug
Acesse no navegador (ou use curl):
```
https://seu-site.vercel.app/api/debug-env
```

Você deve ver algo como:
```json
{
  "hasDatabaseUrl": true,
  "databaseUrlPreview": "postgresql://postgres:G.henrique...",
  "nodeEnv": "production",
  "vercelEnv": "production"
}
```

Se `hasDatabaseUrl` for `false`, a variável não está configurada!

### 3. Testar API de Registro
Tente criar uma conta nova. Se funcionar, o banco está configurado corretamente.

## 🐛 Problemas Comuns

### Problema 1: "DATABASE_URL não encontrada"
**Causa:** Variável não configurada no Vercel
**Solução:** Adicione a variável em Settings → Environment Variables

### Problema 2: "Can't reach database server"
**Causa:** 
- URL do banco está incorreta
- Banco de dados está offline
- Credenciais estão erradas

**Solução:**
1. Verifique a URL no Supabase
2. Confirme que o banco está ativo
3. Verifique se a senha está correta (URL encoded se necessário)

### Problema 3: "Authentication failed"
**Causa:** Credenciais incorretas
**Solução:** Verifique usuário e senha na conexão string

### Problema 4: Variável aparece mas não funciona
**Causa:** 
- Não está marcada para "Production"
- Valor tem espaços extras ou aspas
- Precisa fazer redeploy após adicionar

**Solução:**
1. Remova a variável
2. Adicione novamente (sem aspas, sem espaços)
3. Marque para "Production"
4. Faça redeploy

## 📝 Checklist Final

Antes de reportar o problema, verifique:

- [ ] `DATABASE_URL` está configurada no Vercel?
- [ ] Está marcada para "Production"?
- [ ] Valor não tem aspas ou espaços extras?
- [ ] Fez redeploy após adicionar/atualizar?
- [ ] O endpoint `/api/debug-env` mostra `hasDatabaseUrl: true`?
- [ ] O banco de dados Supabase está ativo?
- [ ] As tabelas foram criadas no Supabase? (User, ResetToken)

## 💡 Dica

Se ainda não funcionar após seguir todos os passos:
1. Copie os logs do Vercel (especialmente os erros)
2. Verifique o endpoint `/api/debug-env`
3. Tente fazer um novo commit e push para triggerar um novo build

## 🔐 Segurança

**NUNCA** compartilhe sua `DATABASE_URL` publicamente! Ela contém:
- Usuário do banco
- Senha do banco
- Host do banco

Se suspeitar que foi exposta, altere a senha no Supabase imediatamente.

