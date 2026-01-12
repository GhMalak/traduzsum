/**
 * Sistema de Memória para IA - RAG (Retrieval Augmented Generation)
 * 
 * Sistema robusto e de alta qualidade para encontrar documentos similares
 * e usar como contexto para melhorar traduções.
 */

import { PrismaClient } from '@prisma/client'

export interface SimilarTranslation {
  id: string
  title: string | null
  originalText: string
  translatedText: string
  similarity: number
}

/**
 * Valida se um texto é válido para processamento
 */
function isValidText(text: any): text is string {
  return typeof text === 'string' && text.trim().length >= 50
}

/**
 * Extrai palavras-chave e termos jurídicos de um texto de forma robusta
 */
export function extractKeywords(text: string): string[] {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return []
  }

  try {
    // Termos jurídicos comuns (prioridade alta)
    const legalTerms = [
      'súmula', 'sumula', 'jurisprudência', 'jurisprudencia', 
      'acórdão', 'acordao', 'decisão', 'decisao', 'sentença', 'sentenca',
      'artigo', 'art.', 'inciso', 'inc.', 'parágrafo', 'paragrafo', 'alínea', 'alinea',
      'réu', 'reu', 'autor', 'processo', 'ação', 'acao', 'recurso',
      'indenização', 'indenizacao', 'danos', 'moral', 'material',
      'prescrição', 'prescricao', 'decadência', 'decadencia', 'coisa julgada',
      'stf', 'stj', 'tst', 'tse', 'tcu', 'trf', 'tj', 'trt',
      'constituição', 'constituicao', 'código', 'codigo', 'lei',
      'cf/88', 'cc', 'cpc', 'clt', 'cp'
    ]

    const textLower = text.toLowerCase()
    const foundTerms: string[] = []
    
    // Encontrar termos jurídicos no texto
    for (const term of legalTerms) {
      if (textLower.includes(term)) {
        foundTerms.push(term)
      }
    }

    // Extrair palavras significativas (não stop words)
    const stopWords = new Set([
      'que', 'para', 'com', 'uma', 'por', 'dos', 'das', 'do', 'da',
      'em', 'de', 'a', 'o', 'e', 'é', 'ser', 'foi', 'são', 'tem',
      'não', 'nao', 'mais', 'como', 'mas', 'ou', 'se', 'ao', 'as', 'os',
      'este', 'esta', 'esse', 'essa', 'aquele', 'aquela',
      'sua', 'suas', 'seu', 'seus', 'nosso', 'nossa',
      'pela', 'pelo', 'pelas', 'pelos', 'entre', 'sobre', 'sob'
    ])

    // Tokenizar e contar frequência
    const words = textLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))

    const wordFreq: Record<string, number> = {}
    for (const word of words) {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    }

    // Top 15 palavras mais frequentes
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word)

    // Combinar e remover duplicatas
    const allKeywords = [...foundTerms, ...topWords]
    return Array.from(new Set(allKeywords))
  } catch (error) {
    console.error('Erro ao extrair palavras-chave:', error)
    return []
  }
}

/**
 * Calcula similaridade entre dois textos usando múltiplas métricas
 */
export function calculateSimilarity(
  keywords1: string[],
  keywords2: string[],
  text1: string,
  text2: string
): number {
  try {
    if (!text1 || !text2 || text1.length === 0 || text2.length === 0) {
      return 0
    }

    // Normalizar textos
    const text1Lower = text1.toLowerCase()
    const text2Lower = text2.toLowerCase()

    // 1. Similaridade por palavras-chave (40%)
    const set1 = new Set(keywords1.map(k => k.toLowerCase()))
    const set2 = new Set(keywords2.map(k => k.toLowerCase()))
    
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)))
    const union = new Set([...Array.from(set1), ...Array.from(set2)])
    
    const keywordSimilarity = union.size > 0 
      ? intersection.size / union.size 
      : 0

    // 2. Similaridade por termos jurídicos específicos (30%)
    const legalTerms = ['súmula', 'sumula', 'jurisprudência', 'jurisprudencia', 'acórdão', 'acordao', 'art.', 'stf', 'stj', 'tst', 'tse', 'tcu']
    let commonLegalTerms = 0
    for (const term of legalTerms) {
      if (text1Lower.includes(term) && text2Lower.includes(term)) {
        commonLegalTerms++
      }
    }
    
    const legalSimilarity = legalTerms.length > 0
      ? commonLegalTerms / legalTerms.length
      : 0

    // 3. Similaridade por n-grams (20%) - bigrams comuns
    const getBigrams = (text: string): Set<string> => {
      const bigrams = new Set<string>()
      const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2)
      for (let i = 0; i < words.length - 1; i++) {
        bigrams.add(`${words[i]} ${words[i + 1]}`)
      }
      return bigrams
    }

    const bigrams1 = getBigrams(text1)
    const bigrams2 = getBigrams(text2)
    const commonBigrams = Array.from(bigrams1).filter(b => bigrams2.has(b)).length
    const totalBigrams = bigrams1.size + bigrams2.size
    const ngramSimilarity = totalBigrams > 0
      ? (commonBigrams * 2) / totalBigrams
      : 0

    // 4. Similaridade por tamanho (10%) - documentos de tamanho similar são mais relevantes
    const lengthDiff = Math.abs(text1.length - text2.length)
    const maxLength = Math.max(text1.length, text2.length, 1)
    const lengthSimilarity = Math.max(0, 1 - (lengthDiff / maxLength) * 2) // Penalizar mais diferenças grandes

    // Peso combinado com normalização
    const totalSimilarity = (
      keywordSimilarity * 0.4 +
      legalSimilarity * 0.3 +
      Math.min(ngramSimilarity, 0.9) * 0.2 +
      Math.min(lengthSimilarity, 0.7) * 0.1
    )

    // Garantir que está entre 0 e 1
    return Math.max(0, Math.min(1, totalSimilarity))
  } catch (error) {
    console.error('Erro ao calcular similaridade:', error)
    return 0
  }
}

/**
 * Busca traduções similares no banco de dados de forma robusta
 */
export async function findSimilarTranslations(
  prisma: PrismaClient,
  currentText: string,
  limit: number = 3
): Promise<SimilarTranslation[]> {
  try {
    if (!currentText || typeof currentText !== 'string' || currentText.trim().length < 50) {
      console.warn('Texto muito curto para busca de similaridade')
      return []
    }

    if (limit < 1 || limit > 10) {
      limit = 3 // Limite padrão seguro
    }

    const currentKeywords = extractKeywords(currentText)
    
    if (currentKeywords.length === 0) {
      console.warn('Nenhuma palavra-chave extraída do texto')
      return []
    }

    // Buscar traduções recentes e bem-sucedidas
    const recentTranslations = await prisma.translation.findMany({
      where: {
        textLength: { gte: 50 } // Mínimo de 50 caracteres
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Buscar mais para ter melhor seleção
    }) as any[]
    
    if (!recentTranslations || recentTranslations.length === 0) {
      return []
    }

    // Filtrar apenas traduções com conteúdo completo e válido
    const validTranslations = recentTranslations.filter(
      (t: any) => 
        t && 
        t.originalText && 
        typeof t.originalText === 'string' &&
        t.originalText.trim().length >= 50 &&
        t.translatedText && 
        typeof t.translatedText === 'string' &&
        t.translatedText.trim().length >= 50
    )

    if (validTranslations.length === 0) {
      return []
    }

    // Calcular similaridade para cada tradução
    const similarities: SimilarTranslation[] = []
    
    for (const translation of validTranslations) {
      try {
        // Validações adicionais
        if (!translation.originalText || !translation.translatedText) {
          continue
        }

        const translationKeywords = extractKeywords(translation.originalText)
        
        if (translationKeywords.length === 0) {
          continue // Pular se não conseguir extrair palavras-chave
        }

        const similarity = calculateSimilarity(
          currentKeywords,
          translationKeywords,
          currentText,
          translation.originalText
        )

        // Validar que similarity é um número válido
        if (typeof similarity !== 'number' || isNaN(similarity) || !isFinite(similarity)) {
          continue
        }

        // Threshold mínimo de 0.15 (15% de similaridade)
        if (similarity >= 0.15 && similarity <= 1.0) {
          similarities.push({
            id: String(translation.id || ''),
            title: translation.title && typeof translation.title === 'string' 
              ? String(translation.title).substring(0, 200) 
              : null,
            originalText: String(translation.originalText),
            translatedText: String(translation.translatedText),
            similarity: Math.max(0, Math.min(1, Math.round(similarity * 1000) / 1000))
          })
        }
      } catch (error) {
        console.error('Erro ao processar tradução individual:', error)
        continue // Continuar com próxima tradução
      }
    }
    
    // Ordenar por similaridade (maior primeiro) e limitar
    similarities.sort((a, b) => b.similarity - a.similarity)
    
    const result = similarities.slice(0, limit)
    
    if (result.length > 0) {
      console.log(`✅ Encontradas ${result.length} traduções similares (similaridade: ${result.map(r => r.similarity.toFixed(2)).join(', ')})`)
    }
    
    return result
  } catch (error) {
    console.error('Erro ao buscar traduções similares:', error)
    return [] // Retornar array vazio em caso de erro
  }
}

/**
 * Formata exemplos similares para usar no prompt de forma segura
 */
export function formatSimilarExamples(
  similarTranslations: SimilarTranslation[]
): string {
  try {
    if (!similarTranslations || similarTranslations.length === 0) {
      return ''
    }

    let examples = '\n\n# EXEMPLOS DE TRADUÇÕES SIMILARES (USE COMO REFERÊNCIA):\n\n'
    
    for (let index = 0; index < similarTranslations.length; index++) {
      const translation = similarTranslations[index]
      
      if (!translation || !translation.originalText || !translation.translatedText) {
        continue // Pular traduções inválidas
      }

      try {
        // Pegar primeiras 400 caracteres de cada (limite seguro)
        const original = translation.originalText.substring(0, 400).trim()
        const translated = translation.translatedText.substring(0, 400).trim()
        
        if (original.length < 50 || translated.length < 50) {
          continue // Pular se muito curto
        }

        examples += `**EXEMPLO ${index + 1}** (Similaridade: ${(translation.similarity * 100).toFixed(0)}%)\n`
        
        if (translation.title) {
          examples += `Título: ${translation.title.substring(0, 100)}\n`
        }
        
        examples += `\nTexto Original:\n${original}${original.length === 400 ? '...' : ''}\n\n`
        examples += `Tradução:\n${translated}${translated.length === 400 ? '...' : ''}\n\n`
        examples += '---\n\n'
      } catch (error) {
        console.error(`Erro ao formatar exemplo ${index + 1}:`, error)
        continue // Continuar com próximo exemplo
      }
    }

    if (examples === '\n\n# EXEMPLOS DE TRADUÇÕES SIMILARES (USE COMO REFERÊNCIA):\n\n') {
      return '' // Retornar vazio se não conseguiu formatar nenhum exemplo
    }

    examples += '\n**IMPORTANTE:** Use estes exemplos como referência de estilo e abordagem, mas NUNCA copie o conteúdo. Adapte o estilo e a forma de explicação para o texto atual.\n'

    return examples
  } catch (error) {
    console.error('Erro ao formatar exemplos similares:', error)
    return '' // Retornar vazio em caso de erro
  }
}
