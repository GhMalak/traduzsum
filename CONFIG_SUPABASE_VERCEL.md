# 🔗 Configurar Supabase Diretamente no Vercel

Este guia mostra como integrar o Supabase (PostgreSQL) diretamente no Vercel usando variáveis de ambiente.

---

## 📋 Passo 1: Obter a Connection String do Supabase

### 1.1. Acesse o Dashboard do Supabase
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login com sua conta
3. Selecione seu projeto (ou crie um novo se necessário)

### 1.2. Obter a Connection String
1. No menu lateral, clique em **Settings** (⚙️)
2. Clique em **Database**
3. Role para baixo até encontrar a seção **"Connection string"**
4. Selecione a aba **"URI"**
5. Você verá algo como:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. Clique em **"Copy"** para copiar a string completa
   - ⚠️ **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela sua senha real do banco de dados
   - Se não souber a senha, você pode redefini-la na mesma página

### 1.3. Formatar a Connection String Corretamente
A connection string deve estar neste formato:
```
postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres
```

**⚠️ Se sua senha contém caracteres especiais**, você precisa fazer URL encoding:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- Espaço → `%20` ou `+`
- Outros caracteres especiais também precisam ser codificados

**Exemplo:**
- Senha original: `G.henrique00222`
- Connection string: `postgresql://postgres:G.henrique00222@db.shldavczsuspdebckcnz.supabase.co:5432/postgres`

---

## 📋 Passo 2: Adicionar DATABASE_URL no Vercel

### 2.1. Acesse o Dashboard do Vercel
1. Vá para [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Faça login
3. Selecione seu projeto **traduzsum** (ou o nome do seu projeto)

### 2.2. Adicionar a Variável de Ambiente
1. No menu do projeto, clique em **Settings**
2. No menu lateral, clique em **Environment Variables**
3. Clique no botão **"Add New"** (canto superior direito)

### 2.3. Preencher os Dados
1. **Key**: Digite `DATABASE_URL`
2. **Value**: Cole a connection string completa do Supabase:
   ```
   postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres
   ```
3. **Environments**: Marque TODAS as opções:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
4. Clique em **"Save"**

### 2.4. Verificar
- A variável `DATABASE_URL` deve aparecer na lista
- O valor será mascarado por segurança (mostra apenas `********`)

---

## 📋 Passo 3: Aplicar as Migrações do Banco

### 3.1. Localmente (no seu computador)
Certifique-se de que o banco está sincronizado:

```bash
# Navegue até a pasta do projeto
cd d:\traduzjuris

# Aplique o schema ao banco do Supabase
npx prisma db push
```

Isso criará as tabelas `User` e `ResetToken` no Supabase.

### 3.2. Ou use Migrations (Recomendado para produção)
```bash
# Criar uma migration
npx prisma migrate dev --name init

# Aplicar migrations na produção (via Supabase ou Vercel)
npx prisma migrate deploy
```

---

## 📋 Passo 4: Fazer Redeploy no Vercel

### 4.1. Trigger Manual do Deploy
1. No Vercel, vá para a aba **Deployments**
2. Encontre o último deploy
3. Clique nos três pontos (⋯) ao lado
4. Selecione **"Redeploy"**
5. Aguarde o deploy terminar (2-3 minutos)

### 4.2. Ou Faça Push no Git
```bash
git add .
git commit -m "Configurar Supabase"
git push
```

A Vercel fará deploy automático após o push.

---

## ✅ Verificar se Está Funcionando

### Teste 1: Verificar Logs do Vercel
1. No Vercel, vá em **Deployments**
2. Clique no último deploy
3. Clique na aba **"Functions"**
4. Procure por erros relacionados a `DATABASE_URL` ou `Prisma`

### Teste 2: Testar a Aplicação
1. Acesse sua URL no Vercel (ex: `traduzsum.vercel.app`)
2. Tente criar uma conta nova
3. Se funcionar, o banco está conectado corretamente! ✅

---

## 🔧 Solução de Problemas

### Erro: "Environment variable not found: DATABASE_URL"
- ✅ Verifique se a variável foi adicionada corretamente no Vercel
- ✅ Certifique-se de que marcou **Production, Preview e Development**
- ✅ Faça um redeploy após adicionar a variável

### Erro: "Authentication failed against database server"
- ✅ Verifique se a senha na connection string está correta
- ✅ Verifique se fez URL encoding dos caracteres especiais na senha
- ✅ Tente redefinir a senha do banco no Supabase e atualizar no Vercel

### Erro: "The introspected database was empty"
- ✅ Execute `npx prisma db push` localmente com a `DATABASE_URL` do Supabase
- ✅ Ou execute `npx prisma migrate deploy` no Supabase

### Erro: "Connection pool timeout"
- ✅ Verifique se o Supabase está ativo (não em pausa)
- ✅ Verifique os limites do plano do Supabase (free tier tem limitações)

---

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Prisma + Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Variáveis de Ambiente no Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✨ Próximos Passos

Após configurar o Supabase:
1. ✅ Teste criar uma conta nova
2. ✅ Teste fazer login
3. ✅ Teste recuperação de senha
4. ✅ Verifique se os dados estão sendo salvos no Supabase (Dashboard → Table Editor)

