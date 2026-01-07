# 🚀 Adicionar DATABASE_URL no Vercel - Guia Rápido

## 📋 Sua Connection String

Use esta connection string no Vercel:

```
postgresql://postgres:G.henrique00222@db.shldavczsuspdebckcnz.supabase.co:5432/postgres
```

## ✅ Passo a Passo

### 1. Acesse o Vercel Dashboard

1. Vá para: **https://vercel.com/dashboard**
2. Faça login na sua conta
3. Selecione o projeto **TraduzSum** (ou o nome do seu projeto)

### 2. Vá em Settings → Environment Variables

1. No menu superior, clique em **Settings** (Configurações)
2. No menu lateral esquerdo, clique em **Environment Variables** (Variáveis de Ambiente)

### 3. Adicione a Variável DATABASE_URL

1. Clique no botão **"Add New"** ou **"Add"**
2. Preencha os campos:
   - **Key (Nome):** `DATABASE_URL`
   - **Value (Valor):** Cole a connection string completa:
     ```
     postgresql://postgres:G.henrique00222@db.shldavczsuspdebckcnz.supabase.co:5432/postgres
     ```
   - **Environments (Ambientes):** Marque TODOS:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
3. Clique em **"Save"** (Salvar)

### 4. Faça Redeploy

1. Vá para a aba **Deployments** (no menu superior)
2. Encontre o último deploy
3. Clique nos **três pontos** (⋯) ao lado do deploy
4. Selecione **Redeploy**
5. Aguarde o deploy terminar

## ✅ Verificação

Após o redeploy:

1. O build deve passar sem erros
2. O app deve conseguir se conectar ao banco de dados
3. As funcionalidades (login, registro, etc.) devem funcionar

## 🚨 Se Ainda Der Erro

Se após adicionar a variável ainda der erro, verifique:

1. **A variável está salva?**
   - Volte em Settings → Environment Variables
   - Verifique se `DATABASE_URL` aparece na lista

2. **Os ambientes estão marcados?**
   - Clique em `DATABASE_URL` para editar
   - Certifique-se de que Production, Preview e Development estão marcados

3. **Fez o Redeploy?**
   - É necessário fazer redeploy após adicionar variáveis
   - As variáveis só ficam disponíveis em novos deploys

4. **A connection string está correta?**
   - Verifique se não há espaços extras
   - Verifique se a senha está correta
   - A connection string deve começar com `postgresql://`

## 📝 Checklist Rápido

- [ ] Acessei o Vercel Dashboard
- [ ] Fui em Settings → Environment Variables
- [ ] Adicionei `DATABASE_URL` com a connection string completa
- [ ] Marquei Production, Preview e Development
- [ ] Salvei a variável
- [ ] Fiz Redeploy
- [ ] Build passou sem erros

## 🎯 Pronto!

Após seguir esses passos, o erro deve desaparecer e o app deve funcionar corretamente! 🚀

