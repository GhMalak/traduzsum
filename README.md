# 🏛️ TraduzSum

> **Plataforma inteligente para tradução e simplificação de textos jurídicos brasileiros**

Uma aplicação web moderna que utiliza Inteligência Artificial para transformar jurisprudências, súmulas e decisões judiciais complexas em linguagem simples e acessível, democratizando o acesso ao conhecimento jurídico.

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.19-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-20.1-635BFF?logo=stripe)](https://stripe.com/)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Features Técnicas](#-features-técnicas)
- [Deploy](#-deploy)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **TraduzSum** é uma plataforma SaaS desenvolvida para facilitar o entendimento de textos jurídicos complexos. Utilizando modelos de linguagem avançados (LLM) e técnicas de RAG (Retrieval Augmented Generation), o sistema traduz automaticamente jurisprudências, súmulas e decisões judiciais para uma linguagem clara e acessível, mantendo a precisão jurídica.

### Problema Resolvido

Muitas pessoas têm dificuldade em entender textos jurídicos devido à linguagem técnica e complexa. O TraduzSum resolve isso oferecendo traduções simplificadas que preservam o significado jurídico original, tornando o direito mais acessível para todos.

---

## ✨ Funcionalidades

### 🔐 Autenticação e Usuários
- Sistema completo de autenticação (registro, login, recuperação de senha)
- Perfis de usuário com dashboard personalizado
- Gestão de assinaturas e cancelamentos
- Sistema de créditos para uso pontual

### 📄 Tradução de Textos
- **Tradução de texto colado**: Cole qualquer texto jurídico e receba a tradução simplificada
- **Upload de PDFs**: Envie PDFs de até 30 páginas para tradução automática
- **Extração inteligente**: Identificação automática de títulos, súmulas e jurisprudências
- **Download em PDF**: Baixe suas traduções em PDF formatado profissionalmente

### 🤖 Inteligência Artificial
- **Modelo LLM**: Utiliza Llama 3.1 8B Instant via Groq API
- **Sistema RAG**: Memória inteligente baseada em traduções anteriores
- **Base de Conhecimento**: Integração com súmulas e jurisprudências importantes
- **Tradução Contextual**: Melhora contínua baseada em exemplos similares

### 💳 Pagamentos
- Integração completa com Stripe
- Planos mensais, anuais e sistema de créditos
- Webhooks para sincronização de assinaturas
- Gestão automática de limites e permissões

### 📊 Dashboard e Analytics
- Histórico completo de traduções
- Estatísticas de uso
- Download individual ou em lote
- Painel administrativo para gestão de conteúdo

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router
- **[React 18](https://reactjs.org/)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[jsPDF](https://github.com/parallax/jsPDF)** - Geração de PDFs no cliente

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - API RESTful
- **[Prisma ORM](https://www.prisma.io/)** - ORM para banco de dados
- **[SQLite](https://www.sqlite.org/)** - Banco de dados (desenvolvimento)
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados (produção)

### Inteligência Artificial
- **[Groq API](https://groq.com/)** - Infraestrutura de LLM
- **[Llama 3.1 8B Instant](https://llama.meta.com/)** - Modelo de linguagem
- **Sistema RAG Customizado** - Retrieval Augmented Generation

### Pagamentos e Integrações
- **[Stripe](https://stripe.com/)** - Processamento de pagamentos
- **[Nodemailer](https://nodemailer.com/)** - Envio de emails
- **[JWT](https://jwt.io/)** - Autenticação via tokens
- **[bcrypt](https://www.npmjs.com/package/bcryptjs)** - Hash de senhas

### Utilitários
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** - Extração de texto de PDFs
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - Geração de tokens JWT

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Páginas    │  │  Componentes │  │   Contextos  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │ Translate│  │ Payment  │  │  Admin   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Prisma     │  │   Groq API    │  │    Stripe    │
│   (Database) │  │     (LLM)     │  │  (Payments)  │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Fluxo de Tradução

1. **Entrada**: Usuário envia texto ou PDF
2. **Validação**: Sistema valida plano, limites e créditos
3. **RAG**: Busca traduções similares na base de conhecimento
4. **IA**: Processa texto com contexto jurídico relevante
5. **Armazenamento**: Salva tradução com palavras-chave para RAG
6. **Resposta**: Retorna tradução simplificada formatada

---

## 📦 Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** ou **yarn**
- **Conta Groq** (para API key)
- **Conta Stripe** (para pagamentos - opcional para desenvolvimento)

---

## 📖 Uso

### Tradução de Texto

1. Faça login na plataforma
2. Cole o texto jurídico no campo de entrada
3. Clique em **"Traduzir"**
4. Aguarde o processamento (alguns segundos)
5. Visualize a tradução simplificada
6. Baixe em PDF ou copie o texto

### Upload de PDF

1. Selecione o plano adequado (Mensal, Anual ou Créditos)
2. Clique na aba **"Enviar PDF"**
3. Arraste ou selecione um arquivo PDF (até 30 páginas)
4. O texto será extraído automaticamente
5. Clique em **"Traduzir"**
6. Baixe o resultado em PDF formatado

---

## 🎨 Features Técnicas

### Sistema RAG (Retrieval Augmented Generation)
- Busca semântica de traduções similares
- Extração inteligente de palavras-chave jurídicas
- Cálculo de similaridade multi-métrica
- Base de conhecimento com súmulas importantes

### Geração de PDFs
- Layout profissional com identidade visual
- Destaque automático de exceções e condições
- Formatação ABNT
- Informações do usuário e metadados

### Autenticação Segura
- JWT tokens com expiração
- Hash de senhas com bcrypt
- Recuperação de senha via email
- Validação de domínios de email

### Integração Stripe
- Checkout sessions
- Webhooks para sincronização
- Gestão de assinaturas
- Cancelamento agendado

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um Fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Seu Nome**

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)
- Email: seu.email@exemplo.com

---

## 🙏 Agradecimentos

- [Groq](https://groq.com/) pela infraestrutura de LLM
- [Next.js](https://nextjs.org/) pela excelente framework
- [Prisma](https://www.prisma.io/) pelo ORM poderoso
- [Stripe](https://stripe.com/) pela solução de pagamentos

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela! ⭐**

</div>
