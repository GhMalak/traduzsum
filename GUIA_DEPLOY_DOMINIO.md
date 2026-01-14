# Guia de Deploy e Configuração de Domínio

## 📋 Visão Geral

O registro.br é um **registrador de domínios**, não um serviço de hospedagem. Para hospedar seu site Next.js, você precisa:

1. **Fazer deploy no Vercel** (recomendado para Next.js)
2. **Configurar o DNS no registro.br** para apontar para o Vercel

---

## 🚀 Passo 1: Deploy no Vercel

### 1.1. Criar conta no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub, GitLab ou email

### 1.2. Conectar seu repositório
1. No dashboard do Vercel, clique em **"Add New Project"**
2. Conecte seu repositório GitHub/GitLab
3. Selecione o repositório `traduzjuris`

### 1.3. Configurar variáveis de ambiente
No Vercel, vá em **Settings > Environment Variables** e adicione todas as variáveis que você usa:

```
DATABASE_URL=...
JWT_SECRET=...
NEXT_PUBLIC_BASE_URL=...
NEXT_PUBLIC_SITE_URL=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
GROQ_API_KEY=...
EMAIL_HOST=...
EMAIL_PORT=...
EMAIL_USER=...
EMAIL_PASS=...
EMAIL_FROM=...
```

### 1.4. Fazer o deploy
1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Seu site estará disponível em: `https://seu-projeto.vercel.app`

---

## 🌐 Passo 2: Configurar Domínio no registro.br

### 2.1. Adicionar domínio no Vercel
1. No dashboard do Vercel, vá em **Settings > Domains**
2. Clique em **"Add Domain"**
3. Digite seu domínio (ex: `traduzsum.com.br`)
4. O Vercel mostrará as configurações de DNS necessárias

### 2.2. Configurar DNS no registro.br

#### Opção A: Usar DNS do Vercel (Recomendado)
1. Acesse [registro.br](https://registro.br)
2. Faça login na sua conta
3. Vá em **"Meus Domínios"** > Selecione seu domínio
4. Clique em **"Alterar DNS"**
5. Adicione os nameservers do Vercel:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
6. Salve as alterações
7. Aguarde a propagação (pode levar até 48 horas, geralmente 1-2 horas)

#### Opção B: Manter DNS no registro.br e adicionar registros
1. No registro.br, vá em **"Meus Domínios"** > Selecione seu domínio
2. Clique em **"Gerenciar DNS"**
3. Adicione os seguintes registros (os valores serão fornecidos pelo Vercel):

   **Para domínio principal (ex: traduzsum.com.br):**
   - Tipo: `A`
   - Nome: `@` ou deixe em branco
   - Valor: IP fornecido pelo Vercel (geralmente `76.76.21.21`)

   **Para www (ex: www.traduzsum.com.br):**
   - Tipo: `CNAME`
   - Nome: `www`
   - Valor: `cname.vercel-dns.com`

4. Salve as alterações

### 2.3. Verificar configuração no Vercel
1. Volte ao Vercel
2. Em **Settings > Domains**, verifique se o domínio aparece como **"Valid Configuration"**
3. Se aparecer algum erro, verifique os registros DNS

---

## 🔒 Passo 3: Configurar HTTPS (SSL)

O Vercel fornece **certificado SSL gratuito automaticamente** para todos os domínios conectados. Não é necessário fazer nada adicional - o HTTPS será ativado automaticamente após a propagação do DNS.

---

## ⚙️ Passo 4: Atualizar variáveis de ambiente

Após configurar o domínio, atualize as variáveis de ambiente no Vercel:

```
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com.br
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com.br
```

---

## 🧪 Passo 5: Testar

1. Aguarde a propagação do DNS (verifique com: [whatsmydns.net](https://www.whatsmydns.net))
2. Acesse seu domínio no navegador
3. Verifique se o site carrega corretamente
4. Teste as funcionalidades principais

---

## 📝 Notas Importantes

### Sobre o registro.br
- O registro.br **não oferece hospedagem** adequada para aplicações Next.js
- Eles oferecem apenas redirecionamento e DNS básico
- A melhor prática é usar o DNS do registro.br para apontar para o Vercel

### Sobre o Vercel
- **Plano gratuito**: Inclui 100GB de bandwidth/mês
- **Deploy automático**: Cada push no GitHub faz deploy automático
- **SSL gratuito**: Certificados Let's Encrypt automáticos
- **Região**: Seu `vercel.json` já está configurado para `gru1` (São Paulo)

### Alternativas ao Vercel
Se preferir outras opções:
- **Netlify**: Similar ao Vercel, também gratuito
- **AWS Amplify**: Para quem já usa AWS
- **Railway**: Boa opção com banco de dados incluído
- **Render**: Alternativa moderna

---

## 🆘 Troubleshooting

### Domínio não está funcionando
1. Verifique se os DNS estão corretos no registro.br
2. Aguarde até 48 horas para propagação completa
3. Use [whatsmydns.net](https://www.whatsmydns.net) para verificar propagação

### Erro de SSL
- O Vercel ativa SSL automaticamente após DNS propagar
- Aguarde algumas horas após configurar o DNS

### Site não carrega
1. Verifique se o deploy no Vercel foi bem-sucedido
2. Verifique os logs no Vercel
3. Confirme que todas as variáveis de ambiente estão configuradas

---

## 📞 Próximos Passos

Após configurar o domínio:
1. ✅ Teste todas as funcionalidades
2. ✅ Configure monitoramento (opcional)
3. ✅ Configure backup do banco de dados
4. ✅ Configure analytics (Google Analytics, etc.)

