# TraduzSum

Uma aplicação web moderna que traduz jurisprudências e súmulas complexas para uma linguagem simples e fácil de entender, utilizando inteligência artificial.

## 🚀 Funcionalidades

- Interface simples e intuitiva
- Tradução de textos jurídicos complexos para linguagem acessível
- **Suporte para upload de PDFs** - Envie arquivos PDF diretamente
- **Colar texto** - Cole textos jurídicos diretamente
- Design moderno e responsivo
- Suporte para jurisprudências, súmulas e decisões judiciais

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Groq API** - Processamento de linguagem natural (Llama 3.1 70B)
- **pdf-parse** - Extração de texto de PDFs

## 📦 Instalação

1. Clone o repositório ou navegue até o diretório do projeto

2. Instale as dependências:
```bash
npm install
```

3. Configure a variável de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto
   - Adicione sua chave da API Groq:
```
GROQ_API_KEY=sua_chave_aqui
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

5. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🔑 Obter API Key da Groq

1. Acesse [https://console.groq.com/](https://console.groq.com/)
2. Crie uma conta ou faça login
3. Vá para a seção de API Keys
4. Crie uma nova chave de API
5. Copie a chave e adicione no arquivo `.env.local`

**Modelo utilizado:** `llama-3.1-70b-versatile` - Melhor modelo para tarefas complexas como tradução jurídica

## 📝 Como Usar

### Opção 1: Enviar PDF
1. Clique na aba "Enviar PDF"
2. Selecione ou arraste um arquivo PDF (máximo 10MB)
3. O texto será extraído automaticamente
4. Clique em "Traduzir"
5. Veja a tradução simplificada no painel à direita

### Opção 2: Colar Texto
1. Clique na aba "Colar Texto"
2. Cole o texto jurídico (jurisprudência, súmula ou decisão) no campo de entrada
3. Clique em "Traduzir"
4. Aguarde o processamento pela IA
5. Veja a tradução simplificada no painel à direita
6. Use o botão "Copiar tradução" para copiar o resultado

## 🏗️ Build para Produção

```bash
npm run build
npm start
```

## 🚀 Deploy (Hospedagem)

### Recomendado: Vercel (Gratuito)

A **Vercel** é a melhor opção para hospedar aplicações Next.js:
- ✅ **100% Gratuito** para projetos pessoais
- ✅ Deploy automático via GitHub
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Suporte a variáveis de ambiente

#### Passos Rápidos:

1. **Crie um repositório no GitHub** e faça push do código
2. **Acesse [vercel.com](https://vercel.com)** e faça login com GitHub
3. **Importe seu repositório**
4. **Adicione a variável de ambiente:**
   - Nome: `GROQ_API_KEY`
   - Valor: sua chave da Groq
5. **Clique em Deploy** - Pronto! 🎉

📖 **Guia completo:** Veja o arquivo [DEPLOY.md](./DEPLOY.md) para instruções detalhadas.

### Alternativas:

- **Netlify** - Também gratuito, boa alternativa
- **Railway** - Barato ($5/mês), muito fácil
- **Render** - Plano gratuito disponível

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
