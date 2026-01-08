# ✅ Verificar DATABASE_URL no Vercel - Guia Definitivo

## 🎯 Problema Atual

O erro mostra que está tentando usar a URL dummy (`dummy:5432`), o que significa que a `DATABASE_URL` **NÃO está sendo encontrada** no Vercel em runtime.

---

## ✅ Solução: Verificar Passo a Passo

### Passo 1: Verificar se a Variável Existe

1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Procure por `DATABASE_URL` na lista

**Se NÃO aparecer** → Vá para Passo 2  
**Se APARECER** → Vá para Passo 3

---

### Passo 2: Adicionar DATABASE_URL

1. Clique em **"Add New"**
2. Preencha exatamente:
   - **Key**: `DATABASE_URL`
   - **Value**: 
     ```
     postgresql://postgres:G.henrique00222@db.klcbufexiyjlbavpojxc.supabase.co:5432/postgres
     ```
     ⚠️ **SEM aspas, SEM `=`, SEM espaços!**
   - **Environments**: Marque **TODAS**:
     - ✅ **Production** ← **MUITO IMPORTANTE!**
     - ✅ **Preview**
     - ✅ **Development**
3. Clique em **"Save"**

---

### Passo 3: Verificar Configuração

1. Clique em **"Edit"** ao lado de `DATABASE_URL`
2. Verifique:
   - ✅ Key: `DATABASE_URL` (exatamente assim, maiúsculas)
   - ✅ Value: A connection string completa (sem aspas)
   - ✅ **Production está marcado** ← **CRÍTICO!**
   - ✅ Preview está marcado
   - ✅ Development está marcado
3. Se algo estiver errado, corrija e salve

---

### Passo 4: Fazer Redeploy (OBRIGATÓRIO!)

**⚠️ VARIÁVEIS SÓ FICAM DISPONÍVEIS APÓS REDEPLOY!**

**Opção A: Via Dashboard**
1. **Deployments** → Último deploy → ⋯ → **Redeploy**
2. Aguarde terminar (2-3 minutos)

**Opção B: Via Git**
```bash
git add .
git commit -m "Fix: DATABASE_URL configuration"
git push
```

---

### Passo 5: Verificar se Funcionou

#### Usar Endpoint de Debug:

Após o redeploy, acesse:
```
https://seu-site.vercel.app/api/debug-env
```

Deve mostrar:
```json
{
  "hasDatabaseUrl": true,
  "databaseUrlPreview": "postgresql://postgres:G.henrique00222..."
}
```

Se mostrar `hasDatabaseUrl: false`, a variável ainda não está sendo lida!

---

## 🔍 Erros Comuns

### ❌ Variável não marcada para Production
**Sintoma**: Build passa, mas em runtime não funciona  
**Solução**: Marque ✅ **Production** ao adicionar a variável

### ❌ Valor com aspas ou espaços
**Sintoma**: Erro de conexão ou "not found"  
**Solução**: Remova aspas e espaços extras do valor

### ❌ Nome da variável errado
**Sintoma**: Erro "not found"  
**Solução**: Deve ser exatamente `DATABASE_URL` (maiúsculas, underscore)

### ❌ Não fez redeploy
**Sintoma**: Variável adicionada mas não funciona  
**Solução**: **SEMPRE faça redeploy após adicionar/modificar variáveis!**

---

## 🆘 Se Ainda Não Funcionar

### 1. Verificar Logs do Vercel

1. **Deployments** → Último deploy
2. **Functions** → **View Function Logs**
3. Procure por mensagens de erro
4. Procure por `DATABASE_URL` nos logs

### 2. Testar Endpoint de Debug

Acesse: `https://seu-site.vercel.app/api/debug-env`

Se `hasDatabaseUrl: false`, significa que:
- A variável não foi adicionada corretamente
- Ou não está marcada para Production
- Ou não foi feito redeploy

### 3. Remover e Adicionar Novamente

1. **Delete** a variável `DATABASE_URL`
2. **Adicione novamente** seguindo o Passo 2
3. **Faça redeploy**

---

## ✅ Checklist Final

- [ ] Variável `DATABASE_URL` existe no Vercel
- [ ] Nome exato: `DATABASE_URL` (maiúsculas)
- [ ] Valor correto (sem aspas, sem igual, sem espaços)
- [ ] ✅ **Marcada para Production** ← **O MAIS IMPORTANTE!**
- [ ] ✅ Marcada para Preview
- [ ] ✅ Marcada para Development
- [ ] Redeploy feito após adicionar/modificar
- [ ] Aguardou deploy terminar completamente
- [ ] Testou endpoint `/api/debug-env`
- [ ] `hasDatabaseUrl: true` no debug
- [ ] Testou criar conta no site

---

## 💡 Lembre-se

**O erro mais comum é não marcar para Production!**

Se a variável não estiver marcada para **Production**, ela não estará disponível no site em produção, mesmo que você tenha adicionado!

**Depois de adicionar/modificar, SEMPRE faça redeploy!**

---

**Siga esses passos cuidadosamente e funcionará! 🚀**

