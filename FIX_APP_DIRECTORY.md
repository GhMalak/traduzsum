# 🔧 Corrigir Erro: ENOENT: no such file or directory, scandir 'D:\traduzjuris\app'

## ✅ Status

A pasta `app` **EXISTE** e tem conteúdo. O erro pode ser causado por:
- Cache corrompido do Next.js
- Processo Node bloqueando o acesso
- Permissões de arquivo

## 🔍 O que foi verificado

- ✅ Pasta `app` existe na raiz do projeto
- ✅ Pasta `app` tem conteúdo (22 arquivos encontrados)
- ✅ Cache do Next.js foi limpo
- ✅ Processos Node foram parados

## 🚀 Soluções Aplicadas

### 1. Limpar Cache
```bash
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

### 2. Parar Processos Node
```bash
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 3. Verificar Estrutura
A pasta `app` contém:
- `layout.tsx`
- `page.tsx`
- `globals.css`
- Pastas: `api`, `admin`, `dashboard`, `login`, `register`, etc.

## 🆘 Se o Problema Persistir

### Solução 1: Reinstalar Next.js
```bash
npm uninstall next
npm install next@^14.0.4
```

### Solução 2: Verificar Permissões
```bash
# Verificar se você tem permissão de leitura
Get-ChildItem app -Recurse | Select-Object FullName, Mode
```

### Solução 3: Reinstalar Dependências
```bash
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### Solução 4: Usar WSL ou Terminal Alternativo
Se estiver no Windows, tente usar:
- Git Bash
- WSL (Windows Subsystem for Linux)
- Terminal do VS Code

### Solução 5: Verificar Antivírus
Alguns antivírus podem bloquear o acesso a arquivos. Verifique se:
- O antivírus não está bloqueando o acesso à pasta `app`
- Adicione a pasta do projeto como exceção

## ✅ Teste Agora

```bash
npm run dev
```

O erro deve estar resolvido após limpar o cache e parar os processos.

---

**Se ainda der erro, tente as soluções acima na ordem! 🚀**

