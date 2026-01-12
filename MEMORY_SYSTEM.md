# Sistema de Memória para IA - RAG (Retrieval Augmented Generation)

## 📚 Visão Geral

O sistema de memória permite que a IA aprenda com traduções anteriores, encontrando documentos similares e usando como contexto para melhorar a qualidade das traduções futuras.

## 🎯 Como Funciona

### 1. **Extração de Palavras-chave**
Quando um documento é traduzido, o sistema:
- Extrai termos jurídicos específicos (súmula, jurisprudência, art., STF, etc.)
- Identifica as palavras mais frequentes (exceto stop words)
- Armazena essas palavras-chave no banco de dados

### 2. **Busca de Documentos Similares**
Antes de traduzir um novo documento, o sistema:
- Extrai palavras-chave do texto atual
- Busca traduções anteriores com palavras-chave similares
- Calcula similaridade usando:
  - **50%** - Similaridade por palavras-chave
  - **30%** - Similaridade por termos jurídicos específicos
  - **20%** - Similaridade por tamanho do texto

### 3. **Uso como Contexto**
Os documentos similares encontrados são:
- Formatados como exemplos
- Incluídos no prompt da IA
- Usados como referência de estilo e abordagem

## 🔧 Componentes Técnicos

### Arquivos Principais

1. **`lib/utils/memory.ts`**
   - `extractKeywords()` - Extrai palavras-chave de um texto
   - `calculateSimilarity()` - Calcula similaridade entre textos
   - `findSimilarTranslations()` - Busca traduções similares no banco
   - `formatSimilarExamples()` - Formata exemplos para o prompt

2. **Schema do Banco de Dados**
   - Campo `keywords` - Armazena palavras-chave extraídas
   - Campo `qualityScore` - Para futuras melhorias com feedback

3. **Integração na API**
   - Busca automática antes de cada tradução
   - Inclusão de exemplos no prompt
   - Armazenamento de palavras-chave após tradução

## 📊 Benefícios

1. **Consistência**: A IA mantém estilo consistente com traduções anteriores
2. **Aprendizado**: Melhora com o tempo conforme mais documentos são traduzidos
3. **Contexto**: Usa conhecimento de documentos similares já traduzidos
4. **Qualidade**: Traduções mais precisas baseadas em exemplos reais

## 🚀 Melhorias Futuras

1. **Embeddings Vetoriais**: Usar embeddings reais (OpenAI, Cohere) para busca mais precisa
2. **Sistema de Feedback**: Permitir usuários avaliarem traduções para melhorar qualidade
3. **Fine-tuning**: Treinar modelo específico com traduções bem-sucedidas
4. **Cache Inteligente**: Armazenar traduções frequentes para resposta mais rápida
5. **Análise de Padrões**: Identificar padrões comuns em tipos específicos de documentos

## 📝 Exemplo de Uso

```typescript
// O sistema automaticamente:
// 1. Busca traduções similares
const similar = await findSimilarTranslations(prisma, textoAtual, 3)

// 2. Formata como exemplos
const examples = formatSimilarExamples(similar)

// 3. Inclui no prompt da IA
// A IA usa esses exemplos como referência
```

## ⚙️ Configuração

O sistema funciona automaticamente, mas você pode ajustar:

- **Número de exemplos**: Padrão é 3 (altere em `findSimilarTranslations`)
- **Threshold de similaridade**: Padrão é 0.2 (20% de similaridade mínima)
- **Limite de busca**: Padrão é 50 traduções recentes

## 🔍 Monitoramento

O sistema registra no console:
- Quantidade de traduções similares encontradas
- Erros na busca de memória (não interrompe a tradução)

