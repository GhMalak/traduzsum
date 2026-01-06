# 🚀 Guia de Deploy - TraduzSum

## Hospedagem Recomendada: Vercel (100% Gratuito)

A **Vercel** é a melhor opção porque:
- ✅ **100% Gratuito** para projetos pessoais
- ✅ Criada pela mesma empresa do Next.js
- ✅ Deploy automático via Git
- ✅ HTTPS automático
- ✅ CDN global (sites rápidos no mundo todo)
- ✅ Suporte a variáveis de ambiente
- ✅ Domínio personalizado gratuito

---

## 📋 Passo a Passo Completo

### **PASSO 1: Preparar o Código no GitHub**

#### 1.1. Inicializar Git (se ainda não fez)

Abra o terminal na pasta do projeto e execute:

```bash
git init
git add .
git commit -m "Initial commit - TraduzSum"
```

#### 1.2. Criar Repositório no GitHub

1. Acesse [https://github.com](https://github.com)
2. Clique no botão **"+"** no canto superior direito
3. Clique em **"New repository"**
4. Preencha:
   - **Repository name**: `traduzsum` (ou o nome que preferir)
   - **Description**: "TraduzSum - Tradução de textos jurídicos"
   - Escolha **Público** ou **Privado** (ambos funcionam)
   - **NÃO** marque "Add a README file"
   - **NÃO** marque "Add .gitignore"
   - **NÃO** marque "Choose a license"
5. Clique em **"Create repository"**

#### 1.3. Conectar e Enviar o Código

No terminal, execute (substitua `SEU_USUARIO` pelo seu usuário do GitHub):

```bash
git remote add origin https://github.com/SEU_USUARIO/traduzsum.git
git branch -M main
git push -u origin main
```

Você precisará fazer login no GitHub quando solicitado.

---

### **PASSO 2: Deploy na Vercel**

#### 2.1. Criar Conta na Vercel

1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em **"Sign Up"** ou **"Login"**
3. Escolha **"Continue with GitHub"** (é a opção mais fácil)
4. Autorize a Vercel a acessar seu GitHub quando solicitado

#### 2.2. Importar o Projeto

1. Na dashboard da Vercel, clique em **"Add New..."**
2. Clique em **"Project"**
3. Você verá seus repositórios do GitHub
4. Clique em **"Import"** ao lado do repositório `traduzsum`

#### 2.3. Configurar o Projeto

Na tela de configuração:

1. **Project Name**: Deixe como está ou mude para `traduzsum`
2. **Framework Preset**: Deve estar como "Next.js" (já detecta automaticamente)
3. **Root Directory**: Deixe como `./` (padrão)
4. **Build Command**: Deixe como está (`npm run build`)
5. **Output Directory**: Deixe como está (`.next`)

#### 2.4. ⚠️ IMPORTANTE: Adicionar Variável de Ambiente

**ANTES de clicar em Deploy**, você DEVE adicionar a chave da API:

1. Na seção **"Environment Variables"**, clique em **"Add"**
2. Preencha:
   - **Name**: `GROQ_API_KEY`
   - **Value**: `sua_chave_groq_aqui` (use a chave que você tem no arquivo .env.local)
3. Clique em **"Add"** novamente
4. Certifique-se de que a variável aparece na lista

#### 2.5. Fazer o Deploy

1. Clique no botão **"Deploy"** (canto inferior direito)
2. Aguarde o processo (leva cerca de 2-3 minutos)
3. Você verá o progresso em tempo real

#### 2.6. Pronto! 🎉

Quando terminar, você verá:
- ✅ Uma mensagem de sucesso
- 🌐 Uma URL como: `traduzsum.vercel.app`
- Clique na URL para acessar seu site!

---

## 🔄 Como Fazer Atualizações

Sempre que você fizer alterações no código:

```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

A Vercel detecta automaticamente e faz um novo deploy em poucos minutos!

---

## 🌐 Adicionar Domínio Personalizado (Opcional)

Se você quiser usar um domínio próprio (ex: `traduzsum.com.br`):

1. Na Vercel, vá em **Settings** > **Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `traduzsum.com.br`)
4. Siga as instruções para configurar o DNS no seu provedor de domínio
5. Aguarde a verificação (pode levar algumas horas)

---

## 💰 Custos

### Plano Gratuito (Hobby)
- ✅ **100GB** de bandwidth por mês
- ✅ Deploys ilimitados
- ✅ Domínios personalizados gratuitos
- ✅ HTTPS automático
- ✅ CDN global
- ✅ **Perfeito para começar!**

### Plano Pro ($20/mês)
Apenas se você precisar de:
- Mais bandwidth (1TB)
- Funções avançadas
- Suporte prioritário

**Para a maioria dos casos, o plano gratuito é suficiente!**

---

## 🆘 Resolução de Problemas

### Erro: "Environment variable not found"
**Solução:**
- Verifique se adicionou `GROQ_API_KEY` nas variáveis de ambiente
- Certifique-se de que o nome está exatamente: `GROQ_API_KEY` (maiúsculas)
- Reinicie o deploy após adicionar a variável

### Erro no Build
**Solução:**
1. Clique em "View Function Logs" na Vercel
2. Veja qual é o erro específico
3. Verifique se todas as dependências estão no `package.json`
4. Teste localmente com `npm run build`

### Site não carrega
**Solução:**
- Verifique os logs na Vercel
- Certifique-se de que a variável `GROQ_API_KEY` está configurada
- Tente fazer um novo deploy

### PDF não funciona
**Solução:**
- Verifique se o tamanho do PDF está dentro do limite (10MB)
- Veja os logs do servidor na Vercel

---

## 📞 Suporte e Documentação

- **Documentação Vercel**: https://vercel.com/docs
- **Suporte Vercel**: https://vercel.com/support
- **Status da Vercel**: https://vercel-status.com

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Código está no GitHub
- [ ] Variável `GROQ_API_KEY` adicionada na Vercel
- [ ] Deploy concluído com sucesso
- [ ] Site está acessível pela URL
- [ ] Teste de tradução funcionando
- [ ] Teste de upload de PDF funcionando

---

**Pronto! Seu TraduzSum está no ar! 🚀**
