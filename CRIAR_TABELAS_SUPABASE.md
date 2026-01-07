# 🗄️ Criar Tabelas no Supabase - TraduzSum

Este guia mostra como criar as tabelas necessárias no Supabase usando SQL.

---

## 📋 Passo 1: Acessar o SQL Editor do Supabase

### 1.1. Acesse o Dashboard do Supabase
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login com sua conta
3. Selecione seu projeto

### 1.2. Abrir o SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **"New query"** para criar uma nova query

---

## 📋 Passo 2: Executar o Script SQL

### 2.1. Copiar o Script
1. Abra o arquivo `supabase_schema.sql` na pasta raiz do projeto
2. **Copie todo o conteúdo** do arquivo (Ctrl+A, Ctrl+C)

### 2.2. Colar e Executar no Supabase
1. No SQL Editor do Supabase, **cole o script** (Ctrl+V)
2. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
3. Aguarde alguns segundos...

### 2.3. Verificar se Funcionou
Você deve ver:
- ✅ Mensagem de sucesso: "Success. No rows returned"
- ✅ Ou mensagens de "CREATE TABLE", "CREATE INDEX", etc.

---

## 📋 Passo 3: Verificar as Tabelas Criadas

### 3.1. Verificar no Table Editor
1. No menu lateral, clique em **Table Editor**
2. Você deve ver duas tabelas:
   - ✅ **User** - Tabela de usuários
   - ✅ **ResetToken** - Tabela de tokens de recuperação

### 3.2. Verificar as Colunas
Clique em cada tabela para ver as colunas:

**Tabela User:**
- `id` (TEXT, Primary Key)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `cpf` (TEXT, UNIQUE, NOT NULL)
- `password` (TEXT, NOT NULL)
- `plan` (TEXT, DEFAULT 'Gratuito')
- `credits` (INTEGER, nullable)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Tabela ResetToken:**
- `id` (TEXT, Primary Key)
- `token` (TEXT, UNIQUE, NOT NULL)
- `email` (TEXT, NOT NULL)
- `expiresAt` (TIMESTAMP, NOT NULL)
- `createdAt` (TIMESTAMP)

---

## 📋 Passo 4: Sincronizar com Prisma (Opcional)

Se você quiser garantir que o Prisma está sincronizado com o banco:

```bash
# No terminal, na pasta do projeto
cd d:\traduzjuris

# Verificar se o schema está sincronizado
npx prisma db pull

# Isso atualizará o schema.prisma se houver diferenças
```

---

## ✅ O Que Foi Criado?

### Tabelas
1. ✅ **User** - Armazena dados dos usuários (nome, email, CPF, senha, plano, créditos)
2. ✅ **ResetToken** - Armazena tokens temporários para recuperação de senha

### Índices
- ✅ Índice em `User.email` (para buscas rápidas por email)
- ✅ Índice em `User.cpf` (para buscas rápidas por CPF)
- ✅ Índice em `ResetToken.token` (para validação rápida de tokens)
- ✅ Índice em `ResetToken.email` (para buscas por email)

### Triggers
- ✅ Trigger que atualiza automaticamente `updatedAt` na tabela `User` sempre que um registro for atualizado

---

## 🔧 Solução de Problemas

### Erro: "relation already exists"
- ✅ As tabelas já existem no banco
- ✅ Isso é normal se você já executou o script antes
- ✅ O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar novamente

### Erro: "syntax error"
- ✅ Verifique se copiou todo o script
- ✅ Certifique-se de que não há caracteres especiais corrompidos
- ✅ Tente executar o script por partes

### As tabelas não aparecem no Table Editor
- ✅ Recarregue a página do Supabase
- ✅ Verifique se você está no projeto correto
- ✅ Verifique os logs do SQL Editor para erros

---

## 🎯 Próximos Passos

Após criar as tabelas:

1. ✅ **Testar a conexão** - Tente criar uma conta nova na aplicação
2. ✅ **Verificar os dados** - Veja se os dados aparecem no Table Editor do Supabase
3. ✅ **Testar recuperação de senha** - Tente usar a funcionalidade de recuperação

---

## 📚 Arquivo SQL

O script SQL completo está no arquivo `supabase_schema.sql` na raiz do projeto.

Se preferir, você também pode executar comandos SQL individuais no SQL Editor do Supabase.

