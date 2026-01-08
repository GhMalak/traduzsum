# 🔧 Corrigir Erro: UNKNOWN: unknown error, read

Este erro geralmente ocorre quando o Next.js não consegue ler arquivos corrompidos ou bloqueados.

## 🔍 Soluções (tente nesta ordem)

### Solução 1: Limpar Cache do Next.js
```bash
# Remover pasta .next
rm -rf .next

# Ou no PowerShell:
Remove-Item -Recurse -Force .next
```

### Solução 2: Limpar Cache do Node e Reinstalar
```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules
npm install

# Ou no PowerShell:
Remove-Item -Recurse -Force node_modules
npm install
```

### Solução 3: Regenerar Prisma Client
```bash
npx prisma generate
```

### Solução 4: Verificar Arquivos Corrompidos
O erro pode ser causado por:
- Arquivo bloqueado por outro processo
- Permissões de arquivo incorretas
- Arquivo corrompido

Verifique se há processos do Node.js rodando:
```bash
# Windows PowerShell
Get-Process node | Stop-Process -Force

# Depois tente rodar novamente
npm run dev
```

### Solução 5: Reinstalar Dependências Completamente
```bash
# 1. Remover tudo
rm -rf node_modules .next package-lock.json

# 2. Limpar cache
npm cache clean --force

# 3. Reinstalar
npm install

# 4. Gerar Prisma Client
npx prisma generate

# 5. Tentar rodar
npm run dev
```

### Solução 6: Verificar Variáveis de Ambiente
Certifique-se de que o `.env.local` está correto:
```bash
# Verificar se DATABASE_URL está configurada
cat .env.local | grep DATABASE_URL
```

### Solução 7: Verificar Espaço em Disco
O erro pode ocorrer se não houver espaço suficiente:
```bash
# Verificar espaço em disco (Windows)
Get-PSDrive C | Select-Object Used,Free
```

## 🆘 Se Nada Funcionar

1. Feche todos os processos do Node.js/Next.js
2. Reinicie o computador
3. Após reiniciar, tente novamente as soluções acima

## ✅ Verificação Final

Após seguir os passos, tente:
```bash
npm run dev
```

Se o erro persistir, pode ser necessário:
- Verificar logs detalhados: `npm run dev -- --debug`
- Verificar se há erros de sintaxe nos arquivos
- Verificar se todos os arquivos necessários existem

