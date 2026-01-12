# Configuração do Stripe para Pagamentos

## 📋 Pré-requisitos

1. Conta no Stripe (https://stripe.com)
2. Acesso ao Stripe Dashboard

## 🔧 Passos de Configuração

### 1. Obter Chaves da API

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Developers** → **API keys**
3. Copie as chaves:
   - **Publishable key** (começa com `pk_`)
   - **Secret key** (começa com `sk_`)

### 2. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env.local` (local) e no Vercel (produção):

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_... em produção (Backend - obrigatória)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_... em produção (Frontend - opcional)
STRIPE_WEBHOOK_SECRET=whsec_... # Obtido após criar webhook (Backend - obrigatória)
NEXT_PUBLIC_STRIPE_PRICE_MENSAL=price_...
NEXT_PUBLIC_STRIPE_PRICE_ANUAL=price_...
NEXT_PUBLIC_STRIPE_PRICE_CREDITOS=price_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # Em produção, use sua URL
```

### 3. Criar Produtos e Preços no Stripe

#### 3.1. Plano Mensal (R$ 19,90/mês)

1. No Stripe Dashboard, vá em **Products** → **Add product**
2. Configure:
   - **Name**: Plano Mensal TraduzSum
   - **Description**: Traduções ilimitadas, PDF, download
   - **Pricing model**: Recurring
   - **Price**: R$ 19,90
   - **Billing period**: Monthly
3. Clique em **Save product**
4. Copie o **Price ID** (começa com `price_`)
5. Adicione no `.env.local`: `NEXT_PUBLIC_STRIPE_PRICE_MENSAL=price_...`

#### 3.2. Plano Anual (R$ 149,00/ano)

1. Crie novo produto: **Plano Anual TraduzSum**
2. Configure:
   - **Price**: R$ 149,00
   - **Billing period**: Yearly
3. Copie o **Price ID**
4. Adicione no `.env.local`: `NEXT_PUBLIC_STRIPE_PRICE_ANUAL=price_...`

#### 3.3. Créditos (R$ 29,90 - compra única)

1. Crie novo produto: **10 Créditos TraduzSum**
2. Configure:
   - **Pricing model**: One time
   - **Price**: R$ 29,90
3. Copie o **Price ID**
4. Adicione no `.env.local`: `NEXT_PUBLIC_STRIPE_PRICE_CREDITOS=price_...`

### 4. Configurar Webhook

#### 4.1. Local (usando Stripe CLI)

1. Instale o [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Execute:
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```
3. Copie o `whsec_...` que aparece
4. Adicione no `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

#### 4.2. Produção (Vercel)

1. No Stripe Dashboard, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.vercel.app/api/payment/webhook`
   - **Events to send**: Selecione:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Clique em **Add endpoint**
5. Copie o **Signing secret** (começa com `whsec_`)
6. Adicione no Vercel: **Settings** → **Environment Variables** → `STRIPE_WEBHOOK_SECRET`

### 5. Executar Migration do Banco de Dados

Execute a migration para criar as tabelas necessárias:

```bash
npx prisma migrate dev --name add_tracking_and_payments
```

Ou, se estiver usando PostgreSQL direto:

```sql
-- Execute o SQL gerado pela migration
-- O Prisma irá gerar o SQL automaticamente
```

### 6. Testar em Modo de Teste

1. Use cartões de teste do Stripe:
   - **Sucesso**: `4242 4242 4242 4242`
   - **Declinado**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`
2. Use qualquer data de expiração futura e CVC
3. Teste os diferentes planos

### 7. Ativar Modo de Produção

Quando estiver pronto:

1. Alterne para **Live mode** no Stripe Dashboard
2. Use as chaves de produção:
   - `sk_live_...` (em vez de `sk_test_...`)
   - `pk_live_...` (em vez de `pk_test_...`)
3. Crie novos produtos e preços em modo Live
4. Configure webhook com URL de produção
5. Atualize as variáveis no Vercel

## 🔍 Troubleshooting

### Webhook não está sendo chamado

- Verifique se a URL do webhook está correta
- Confirme que o `STRIPE_WEBHOOK_SECRET` está configurado
- Veja logs do webhook no Stripe Dashboard

### Pagamento processado mas plano não atualizado

- Verifique os logs do servidor
- Confirme que o webhook está recebendo os eventos
- Verifique se a migration foi executada

### Erro "Invalid API Key"

- Verifique se `STRIPE_SECRET_KEY` está configurada corretamente
- Confirme que está usando a chave correta (test vs live)
- Verifique se não há espaços extras na chave

## 📚 Recursos

- [Documentação do Stripe](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

