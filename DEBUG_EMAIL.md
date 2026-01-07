# 🔍 Debug de Email de Recuperação de Senha

## Como verificar se o email está sendo enviado

### 1. Verificar logs na Vercel

1. Acesse o **Dashboard da Vercel**
2. Vá em **Deployments** → Selecione o último deploy
3. Clique em **View Function Logs**
4. Procure por mensagens como:
   - `✅ Email de recuperação enviado com sucesso para: [email]`
   - `❌ Erro ao enviar email de recuperação:`
   - `📧 Configurações SMTP verificadas:`

### 2. Verificar variáveis de ambiente

Na Vercel, vá em **Settings** → **Environment Variables** e verifique se todas estão configuradas:

```
✅ SMTP_HOST=smtp.gmail.com (ou seu provedor)
✅ SMTP_PORT=587
✅ SMTP_USER=seu-email@gmail.com
✅ SMTP_PASS=sua-senha-app
✅ NEXT_PUBLIC_SITE_URL=https://seu-site.vercel.app
✅ JWT_SECRET=seu-secret-super-seguro
```

### 3. Problemas comuns

#### Gmail - "Less secure app access" desabilitado

**Solução:** Use uma **Senha de App** do Google:

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "App" → "Email" → "Outro (nome personalizado)"
3. Digite "TraduzSum"
4. Copie a senha gerada (16 caracteres)
5. Use essa senha no `SMTP_PASS`

#### Email não chega na caixa de entrada

- Verifique a **pasta de SPAM/Lixo Eletrônico**
- Verifique se o email está correto no banco de dados
- Verifique os logs da Vercel para erros

#### Erro "EAUTH" (Autenticação)

- Verifique se `SMTP_USER` e `SMTP_PASS` estão corretos
- Para Gmail, use senha de app, não a senha normal
- Verifique se não há espaços extras nas variáveis

#### Erro "ECONNECTION" (Conexão)

- Verifique se `SMTP_HOST` está correto
- Verifique se `SMTP_PORT` está correto (587 para TLS, 465 para SSL)
- Alguns provedores bloqueiam conexões SMTP (use SendGrid ou Mailgun)

### 4. Testar localmente

Para testar localmente, adicione no `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
NEXT_PUBLIC_SITE_URL=http://localhost:3000
JWT_SECRET=seu-secret-local
```

Depois, reinicie o servidor:
```bash
npm run dev
```

### 5. Verificar se o token está sendo gerado

O sistema sempre retorna sucesso (por segurança), mas você pode verificar nos logs se:
- O token foi gerado
- O email foi enviado
- Houve algum erro

### 6. Provedores recomendados

Se o Gmail não funcionar, considere:

- **SendGrid** (gratuito até 100 emails/dia)
- **Mailgun** (gratuito até 5.000 emails/mês)
- **Amazon SES** (muito barato)

### 7. Logs detalhados

O sistema agora mostra logs detalhados:
- ✅ Sucesso: Email enviado
- ❌ Erro: Detalhes do erro
- 📧 Configurações: Status das variáveis (sem expor senhas)

Verifique os logs na Vercel para identificar o problema específico.

