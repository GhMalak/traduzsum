# 🔒 Corrigir Alertas do GitGuardian

## ⚠️ Problema

O GitGuardian detectou possíveis segredos (API keys, senhas, tokens) no seu repositório Git.

## 🚨 Ação Imediata Necessária

### 1. **Revogar Chaves Expostas**

Se alguma chave real foi commitada, **REVOQUE IMEDIATAMENTE**:

- **GROQ_API_KEY**: Acesse https://console.groq.com/ e revogue a chave
- **SMTP_PASS**: Altere a senha de app do Gmail
- **JWT_SECRET**: Gere um novo secret

### 2. **Verificar o que foi Exposto**

Execute no terminal:

```bash
# Ver histórico de commits com possíveis segredos
git log --all --full-history --source --all -S "gsk_" -- "*.md"
git log --all --full-history --source --all -S "GROQ_API_KEY" -- "*.md"
```

### 3. **Remover do Histórico do Git**

Se encontrou segredos no histórico, use o `git-filter-repo` ou `BFG Repo-Cleaner`:

#### Opção A: Usar git-filter-repo (Recomendado)

```bash
# Instalar git-filter-repo
pip install git-filter-repo

# Remover chave específica do histórico
git filter-repo --replace-text <(echo "gsk_SUA_CHAVE_EXPOSTA==>gsk_REDACTED")
```

#### Opção B: Usar BFG Repo-Cleaner

```bash
# Baixar BFG: https://rtyley.github.io/bfg-repo-cleaner/
# Substituir segredos
java -jar bfg.jar --replace-text secrets.txt

# Limpar repositório
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 4. **Forçar Push (CUIDADO!)**

⚠️ **ATENÇÃO**: Isso reescreve o histórico. Avise colaboradores!

```bash
git push origin --force --all
git push origin --force --tags
```

## ✅ Prevenção Futura

### 1. **Verificar .gitignore**

Certifique-se de que o `.gitignore` inclui:

```
# local env files
.env*.local
.env
.env.production
.env.development

# database
*.db
*.db-journal

# secrets
secrets.txt
*.key
*.pem
```

### 2. **Criar .env.example**

Crie um arquivo `.env.example` com placeholders:

```env
# API Keys
GROQ_API_KEY=your_groq_api_key_here

# JWT
JWT_SECRET=your_jwt_secret_here

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Database
DATABASE_URL=file:./dev.db

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. **Usar GitGuardian CLI Localmente**

```bash
# Instalar
pip install ggshield

# Verificar antes de commitar
ggshield scan path .

# Verificar commit antes de fazer push
ggshield scan commit HEAD
```

### 4. **Configurar Pre-commit Hook**

Crie `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Verificar segredos antes de commitar
ggshield scan pre-commit
```

## 📋 Checklist de Segurança

- [ ] Revogar todas as chaves expostas
- [ ] Remover segredos do histórico do Git
- [ ] Verificar `.gitignore` está correto
- [ ] Criar `.env.example` (sem valores reais)
- [ ] Instalar GitGuardian CLI
- [ ] Configurar pre-commit hook
- [ ] Forçar push do histórico limpo
- [ ] Gerar novas chaves para produção

## 🎯 Boas Práticas

1. **NUNCA** commite arquivos `.env`
2. **SEMPRE** use `.env.example` para documentação
3. **SEMPRE** use variáveis de ambiente na Vercel
4. **SEMPRE** revogue chaves expostas imediatamente
5. **SEMPRE** use GitGuardian antes de fazer push

## 🔍 Verificar Arquivos Atuais

Execute para verificar se há segredos nos arquivos atuais:

```bash
# Verificar arquivos markdown
grep -r "gsk_" *.md
grep -r "sk-proj-" *.md

# Verificar se há .env commitado
git ls-files | grep "\.env"
```

## 📞 Suporte

Se precisar de ajuda:
- GitGuardian Docs: https://docs.gitguardian.com/
- GitHub Security: https://docs.github.com/en/code-security

