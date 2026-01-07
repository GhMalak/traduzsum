# 🚀 Instruções para Push

## ✅ Limpeza Concluída

Todos os segredos foram removidos do histórico do Git:
- ✅ `.env.exemple` removido
- ✅ `URGENT_SECURITY.md` removido  
- ✅ `REMOVE_SECRETS.md` removido
- ✅ `SECURITY_CHECK.md` removido
- ✅ `CONFIG_EMAIL.md` removido
- ✅ Segredos substituídos por `REDACTED` no histórico

## 📤 Fazer Force Push

Execute o comando abaixo para enviar o histórico limpo:

```bash
git push origin --force --all
```

⚠️ **IMPORTANTE**: 
- Isso reescreve o histórico remoto
- Certifique-se de que ninguém mais está trabalhando no repositório
- Ou avise todos os colaboradores para fazerem um novo clone

## 🔐 Ações de Segurança Necessárias

### 1. **Revogar Chaves Expostas** (URGENTE!)

Mesmo após remover do Git, as chaves podem ter sido comprometidas:

1. **GROQ_API_KEY**: `[CHAVE_REMOVIDA]`
   - Acesse: https://console.groq.com/keys
   - **REVOQUE IMEDIATAMENTE**
   - Gere uma nova chave

2. **SMTP_PASS (Gmail)**: `[SENHA_REMOVIDA]`
   - Acesse: https://myaccount.google.com/apppasswords
   - **REVOQUE IMEDIATAMENTE**
   - Gere uma nova senha de app

### 2. **Atualizar Variáveis de Ambiente**

Após revogar e gerar novas chaves:

1. **Vercel**:
   - Settings → Environment Variables
   - Atualize `GROQ_API_KEY` (nova chave)
   - Atualize `SMTP_PASS` (nova senha de app)
   - Atualize `JWT_SECRET` (novo secret)

2. **Local (.env.local)**:
   - Atualize com as novas chaves

## ✅ Checklist Final

- [ ] Fazer force push do histórico limpo
- [ ] Revogar GROQ_API_KEY exposta
- [ ] Revogar SMTP_PASS exposta
- [ ] Gerar novas chaves
- [ ] Atualizar variáveis na Vercel
- [ ] Atualizar `.env.local` local
- [ ] Verificar que o site funciona com as novas chaves

## 🎯 Próximos Passos

1. Execute: `git push origin --force --all`
2. Revogue as chaves expostas
3. Gere novas chaves
4. Atualize as variáveis de ambiente
5. Teste o site

