/**
 * Sistema de Memória para IA - RAG (Retrieval Augmented Generation)
 * 
 * Este sistema permite que a IA aprenda com traduções anteriores,
 * encontrando documentos similares e usando como contexto.
 */

import { PrismaClient } from '@prisma/client'

export interface SimilarTranslation {
  id: string
  title: string | null
  originalText: string | null
  translatedText: string | null
  similarity: number
}

/**
 * Extrai palavras-chave e termos jurídicos de um texto
 */
export function extractKeywords(text: string): string[] {
  // Termos jurídicos comuns
  const legalTerms = [
    'súmula', 'jurisprudência', 'acórdão', 'decisão', 'sentença',
    'artigo', 'art.', 'inciso', 'parágrafo', 'alínea',
    'réu', 'autor', 'processo', 'ação', 'recurso',
    'indenização', 'danos', 'moral', 'material',
    'prescrição', 'decadência', 'coisa julgada',
    'stf', 'stj', 'tst', 'tse', 'tcu', 'trf', 'tj', 'trt'
  ]

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)

  // Encontrar termos jurídicos
  const foundTerms = legalTerms.filter(term => 
    text.toLowerCase().includes(term)
  )

  // Encontrar palavras mais frequentes (exceto stop words)
  const stopWords = new Set([
    'que', 'para', 'com', 'uma', 'por', 'dos', 'das', 'do', 'da',
    'em', 'de', 'a', 'o', 'e', 'é', 'ser', 'foi', 'são', 'tem',
    'não', 'mais', 'como', 'mas', 'ou', 'se', 'ao', 'as', 'os'
  ])

  const wordFreq: Record<string, number> = {}
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }
  })

  // Top 10 palavras mais frequentes
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)

  return [...new Set([...foundTerms, ...topWords])]
}

/**
 * Calcula similaridade entre dois textos usando palavras-chave
 */
export function calculateSimilarity(
  keywords1: string[],
  keywords2: string[],
  text1: string,
  text2: string
): number {
  // Similaridade por palavras-chave (50%)
  const set1 = new Set(keywords1.map(k => k.toLowerCase()))
  const set2 = new Set(keywords2.map(k => k.toLowerCase()))
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  const keywordSimilarity = union.size > 0 
    ? intersection.size / union.size 
    : 0

  // Similaridade por termos jurídicos específicos (30%)
  const legalTerms = ['súmula', 'jurisprudência', 'acórdão', 'art.', 'stf', 'stj']
  const text1Lower = text1.toLowerCase()
  const text2Lower = text2.toLowerCase()
  
  const commonLegalTerms = legalTerms.filter(term => 
    text1Lower.includes(term) && text2Lower.includes(term)
  ).length
  
  const legalSimilarity = legalTerms.length > 0
    ? commonLegalTerms / legalTerms.length
    : 0

  // Similaridade por tamanho (20%)
  const lengthDiff = Math.abs(text1.length - text2.length)
  const maxLength = Math.max(text1.length, text2.length)
  const lengthSimilarity = maxLength > 0
    ? 1 - (lengthDiff / maxLength)
    : 0

  // Peso combinado
  return (
    keywordSimilarity * 0.5 +
    legalSimilarity * 0.3 +
    Math.min(lengthSimilarity, 0.8) * 0.2
  )
}

/**
 * Busca traduções similares no banco de dados
 */
export async function findSimilarTranslations(
  prisma: PrismaClient,
  currentText: string,
  limit: number = 3
): Promise<SimilarTranslation[]> {
  const currentKeywords = extractKeywords(currentText)
  
  // Buscar traduções recentes e bem-sucedidas
  const recentTranslations = await prisma.translation.findMany({
    where: {
      translatedText: { not: null },
      originalText: { not: null },
      // Apenas traduções com conteúdo significativo
      textLength: { gte: 100 }
    },
    select: {
      id: true,
      title: true,
      originalText: true,
      translatedText: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50 // Limitar busca para performance
  })

  // Calcular similaridade para cada tradução
  const similarities: SimilarTranslation[] = recentTranslations
    .map(translation => {
      if (!translation.originalText) return null
      
      const translationKeywords = extractKeywords(translation.originalText)
      const similarity = calculateSimilarity(
        currentKeywords,
        translationKeywords,
        currentText,
        translation.originalText
      )

      return {
        id: translation.id,
        title: translation.title,
        originalText: translation.originalText,
        translatedText: translation.translatedText,
        similarity
      }
    })
    .filter((t): t is SimilarTranslation => t !== null && t.similarity > 0.2) // Threshold mínimo
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  return similarities
}

/**
 * Formata exemplos similares para usar no prompt
 */
export function formatSimilarExamples(
  similarTranslations: SimilarTranslation[]
): string {
  if (similarTranslations.length === 0) {
    return ''
  }

  let examples = '\n\n# EXEMPLOS DE TRADUÇÕES SIMILARES (USE COMO REFERÊNCIA):\n\n'
  
  similarTranslations.forEach((translation, index) => {
    if (translation.originalText && translation.translatedText) {
      // Pegar primeiras 500 caracteres de cada
      const original = translation.originalText.substring(0, 500)
      const translated = translation.translatedText.substring(0, 500)
      
      examples += `**EXEMPLO ${index + 1}** (Similaridade: ${(translation.similarity * 100).toFixed(0)}%)\n`
      if (translation.title) {
        examples += `Título: ${translation.title}\n`
      }
      examples += `\nTexto Original:\n${original}...\n\n`
      examples += `Tradução:\n${translated}...\n\n`
      examples += '---\n\n'
    }
  })

  examples += '\n**IMPORTANTE:** Use estes exemplos como referência de estilo e abordagem, mas NUNCA copie o conteúdo. Adapte o estilo e a forma de explicação para o texto atual.\n'

  return examples
}

