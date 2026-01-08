# 🚨 URGENTE: Configurar DATABASE_URL no Vercel

## ❌ Erro Atual
```
❌ DATABASE_URL não encontrada no Vercel em runtime!
💡 Variáveis disponíveis: POSTGRES_DATABASE
```

## 🔍 Diagnóstico
O Vercel tem a variável `POSTGRES_DATABASE` configurada, mas **NÃO** tem `DATABASE_URL`. O Prisma precisa especificamente de `DATABASE_URL`.

## ✅ Solução: Adicionar DATABASE_URL

### Passo 1: Acessar Configurações do Vercel
1. Acesse: https://vercel.com
2. Selecione seu projeto (`traduzjuris`)
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)

### Passo 2: Adicionar Nova Variável

**Nome da variável:**
```
DATABASE_URL
```

**Valor (COPIE EXATAMENTE, sem aspas):**
```
postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres
```

**⚠️ IMPORTANTE:**
- ✅ **NÃO coloque entre aspas** (`"` ou `'`)
- ✅ **NÃO inclua espaços** antes ou depois
- ✅ **Copie exatamente** como mostrado acima
- ✅ **Marque para "Production"** ✅ (checkbox)
- ✅ **Marque para "Preview"** ✅ (checkbox) - opcional mas recomendado
- ✅ **NÃO marque apenas "Development"** (essa é para local)

### Passo 3: Salvar e Fazer Redeploy
1. Clique em **Save** (Salvar)
2. Vá em **Deployments** (Deployments)
3. Clique nos **3 pontos** (⋯) do deployment mais recente
4. Selecione **Redeploy** (Fazer novo deploy)
5. Aguarde o deploy finalizar (2-3 minutos)

### Passo 4: Verificar se Funcionou
1. Após o redeploy, tente criar uma conta novamente
2. Ou acesse: `https://seu-site.vercel.app/api/debug-env`
3. Você deve ver: `"hasDatabaseUrl": true`

## 📸 Passo a Passo Visual

### 1. Tela Inicial do Vercel
```
Dashboard → Seu Projeto → Settings
```

### 2. Aba Environment Variables
```
Settings → Environment Variables → Add New
```

### 3. Formulário
```
Key:    DATABASE_URL
Value:  postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres
        ☑ Production
        ☑ Preview
        ☐ Development
```

### 4. Salvar
```
[Save] ou [Salvar]
```

### 5. Redeploy
```
Deployments → ⋯ (3 pontos) → Redeploy
```

## 🔍 Como Verificar se Está Correto

### Opção 1: Endpoint de Debug
Acesse no navegador:
```
https://seu-site.vercel.app/api/debug-env
```

Você deve ver:
```json
{
  "hasDatabaseUrl": true,
  "databaseUrlPreview": "postgresql://postgres:G.henrique...",
  "nodeEnv": "production"
}
```

Se `hasDatabaseUrl` for `false`, a variável não está configurada corretamente!

### Opção 2: Testar Criar Conta
Tente criar uma nova conta no site. Se funcionar, está tudo OK!

### Opção 3: Verificar Logs do Vercel
1. Vá em **Deployments** → Selecione o deployment
2. Clique em **Functions** → Selecione `/api/auth/register`
3. Veja os logs - não deve mais aparecer o erro de `DATABASE_URL`

## ⚠️ Problemas Comuns

### Problema 1: "Variável existe mas não funciona"
**Causas possíveis:**
- ❌ Valor tem espaços extras
- ❌ Valor está entre aspas
- ❌ Não está marcada para "Production"
- ❌ Não fez redeploy após adicionar

**Solução:**
1. Remova a variável
2. Adicione novamente (sem aspas, sem espaços)
3. Marque para "Production" ✅
4. Faça redeploy

### Problema 2: "Ainda aparece o erro"
**Causas possíveis:**
- ❌ Variável foi adicionada mas não fez redeploy
- ❌ Variável está marcada apenas para "Development"
- ❌ URL do banco está incorreta

**Solução:**
1. Verifique se está marcada para "Production"
2. Faça um novo redeploy
3. Aguarde 2-3 minutos para finalizar

### Problema 3: "Não consigo encontrar Settings"
**Solução:**
1. Certifique-se de estar logado no Vercel
2. Clique no nome do projeto na lista
3. Vá em **Settings** no menu lateral esquerdo

## 📝 Checklist Final

Antes de reportar problema, verifique:

- [ ] `DATABASE_URL` está adicionada no Vercel?
- [ ] Valor está correto (copiado exatamente como mostrado)?
- [ ] Valor **NÃO** tem aspas?
- [ ] Valor **NÃO** tem espaços extras?
- [ ] Está marcada para **"Production"** ✅?
- [ ] Fez **redeploy** após adicionar?
- [ ] Aguardou o deploy finalizar (2-3 minutos)?
- [ ] Testou o endpoint `/api/debug-env`?
- [ ] `hasDatabaseUrl` está como `true`?

## 🚀 Após Configurar

Depois de seguir todos os passos:
1. Faça redeploy
2. Aguarde 2-3 minutos
3. Teste criar uma conta
4. Se funcionar, está tudo OK! ✅

## 💡 Dica Extra

Se você já tem `POSTGRES_DATABASE` configurada, você pode:
1. Copiar o valor dela
2. Adicionar como `DATABASE_URL` com o mesmo valor
3. Ou deletar `POSTGRES_DATABASE` e manter apenas `DATABASE_URL`

O importante é ter `DATABASE_URL` configurada, pois o Prisma espera esse nome específico.

## 📞 Precisa de Ajuda?

Se ainda não funcionar após seguir todos os passos:
1. Copie os logs do Vercel (especialmente os erros)
2. Acesse `/api/debug-env` e copie o resultado
3. Verifique se todas as checkboxes acima estão marcadas

