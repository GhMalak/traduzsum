# 🔐 Configuração do Painel Administrativo

## 📋 Como Funciona

O sistema possui um painel administrativo completo para gerenciar usuários e planos.

## 🚀 Acessar o Painel Admin

1. Faça login com um email de administrador
2. Acesse: `/admin` ou clique no link "Admin" no menu (aparece apenas para admins)

## ⚙️ Configurar Email Admin

Para tornar um usuário administrador, edite o arquivo:

**`app/api/admin/check/route.ts`** e **`app/api/admin/users/route.ts`** e **`app/api/admin/update-plan/route.ts`**

Adicione o email do administrador na lista:

```typescript
const ADMIN_EMAILS = [
  'admin@traduzsum.com.br',
  'gustavo.calasan@gmail.com',  // Adicione seu email aqui
  // Adicione mais emails admin aqui
]
```

**⚠️ Importante:** Após adicionar o email, você precisa:
1. Criar uma conta com esse email (ou já ter uma conta)
2. Fazer login
3. Acessar `/admin`

## 📊 Funcionalidades do Painel Admin

### 1. **Estatísticas**
- Total de usuários
- Usuários por plano (Gratuito, Mensal, Anual, Créditos)

### 2. **Lista de Usuários**
- Ver todos os usuários cadastrados
- Informações: Nome, Email, CPF, Plano, Créditos, Data de cadastro

### 3. **Gerenciar Planos**
- Alterar plano de qualquer usuário
- Atribuir créditos para planos de créditos

## 🔒 Segurança

- Apenas emails listados em `ADMIN_EMAILS` podem acessar
- Verificação de autenticação em todas as rotas admin
- Redirecionamento automático se não for admin

## 📝 Exemplo de Uso

1. **Criar conta admin:**
   - Registre-se com o email que será admin
   - Adicione o email em `ADMIN_EMAILS`
   - Faça login

2. **Acessar painel:**
   - Vá para `/admin`
   - Veja estatísticas e lista de usuários

3. **Alterar plano de usuário:**
   - Na tabela, selecione o novo plano no dropdown
   - O plano é atualizado automaticamente

## 🎯 Rotas Admin

- `/admin` - Painel administrativo
- `/api/admin/check` - Verifica se usuário é admin
- `/api/admin/users` - Lista todos os usuários
- `/api/admin/update-plan` - Atualiza plano de usuário

## ⚠️ Nota Importante

Em produção, você deve:
1. Usar um banco de dados real (não array em memória)
2. Criar uma tabela de administradores
3. Implementar permissões mais granulares
4. Adicionar logs de ações administrativas

