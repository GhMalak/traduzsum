# 🔧 Corrigir Erro: DATABASE_URL não encontrada

## ⚠️ Problema

Durante o build no Vercel, você pode receber o erro:

```
Invalid `prisma.user.findUnique()` invocation: 
error: Environment variable not found: DATABASE_URL
```

## ✅ Solução

### Opção 1: Configurar DATABASE_URL no Vercel (RECOMENDADO)

A **melhor solução** é configurar a variável `DATABASE_URL` no Vercel:

1. **Acesse o Dashboard da Vercel:**
   - Vá para: https://vercel.com/dashboard
   - Selecione seu projeto

2. **Vá em Settings → Environment Variables**

3. **Adicione a variável `DATABASE_URL`:**
   - **Name:** `DATABASE_URL`
   - **Value:** Sua connection string do Supabase
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development

4. **Como obter a DATABASE_URL do Supabase:**
   - Acesse: https://supabase.com/dashboard
   - Selecione seu projeto
   - Vá em **Settings** → **Database**
   - Na seção **"Connection string"**, selecione a aba **"URI"**
   - Copie a string e substitua `[PASSWORD]` pela senha real
   - **Formato:** `postgresql://postgres:senha@db.xxxxx.supabase.co:5432/postgres`

5. **Salve e faça Redeploy:**
   - Após adicionar a variável, vá em **Deployments**
   - Clique nos **três pontos** (⋯) no último deploy
   - Selecione **Redeploy**

### Opção 2: Build com URL Dummy (Temporário)

Se você não puder configurar a `DATABASE_URL` no Vercel agora, o build vai usar uma URL dummy durante o `prisma generate`, mas **você ainda precisa configurar a variável para o app funcionar em runtime**.

O código já está configurado para usar uma URL dummy durante o build, mas isso é apenas uma solução temporária. **Você DEVE configurar a `DATABASE_URL` no Vercel para o app funcionar corretamente.**

## 🔍 Verificação

Após configurar a `DATABASE_URL` no Vercel:

1. O build deve passar sem erros
2. O app deve conseguir se conectar ao banco de dados
3. As funcionalidades que usam o banco (login, registro, etc.) devem funcionar

## 🚨 Importante

- A `DATABASE_URL` é **OBRIGATÓRIA** para o app funcionar em produção
- Sem ela, o app não conseguirá se conectar ao banco de dados
- Configure a variável **ANTES** de fazer o deploy em produção

## 📝 Checklist

- [ ] `DATABASE_URL` configurada no Vercel
- [ ] URL está completa e válida (sem `[PASSWORD]`)
- [ ] Senha com caracteres especiais está com URL encoding
- [ ] Variável marcada para Production, Preview e Development
- [ ] Redeploy feito após adicionar a variável
- [ ] Build passou sem erros
- [ ] App consegue se conectar ao banco de dados

## 🎯 Resumo

1. **Vercel Dashboard** → Seu Projeto → **Settings** → **Environment Variables**
2. Adicione `DATABASE_URL` com a connection string do Supabase
3. **Salve** e faça **Redeploy**
4. O build deve funcionar! 🚀

