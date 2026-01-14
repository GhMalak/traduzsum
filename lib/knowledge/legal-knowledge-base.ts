/**
 * Base de Conhecimento Jurídico Brasileiro
 * 
 * Esta base contém súmulas, jurisprudências e princípios fundamentais
 * do direito brasileiro para melhorar o conhecimento da IA.
 */

export interface LegalKnowledge {
  id: string
  type: 'súmula' | 'jurisprudência' | 'princípio' | 'conceito'
  tribunal?: string
  number?: string
  title: string
  originalText: string
  translatedText: string
  keywords: string[]
  area: string // 'civil', 'trabalhista', 'tributário', 'penal', 'administrativo', 'constitucional'
  importance: 'alta' | 'média' | 'baixa'
}

/**
 * Base de conhecimento com súmulas e jurisprudências importantes
 * 
 * Esta base será usada pelo sistema RAG para fornecer contexto
 * relevante durante as traduções.
 */
export const legalKnowledgeBase: LegalKnowledge[] = [
  // ========== DIREITO CIVIL ==========
  {
    id: 'stf-sumula-001',
    type: 'súmula',
    tribunal: 'STF',
    number: '1',
    title: 'Prescrição e Incapazes',
    originalText: 'A prescrição não corre contra o incapaz, salvo se ele tiver representante legal.',
    translatedText: 'O prazo para entrar com processo não passa para pessoas que não podem cuidar de si mesmas (incapazes), EXCETO quando elas tiverem alguém responsável por elas (representante legal).',
    keywords: ['prescrição', 'incapaz', 'representante legal', 'prazo', 'processo'],
    area: 'civil',
    importance: 'alta'
  },
  {
    id: 'stf-sumula-002',
    type: 'súmula',
    tribunal: 'STF',
    number: '2',
    title: 'Coisa Julgada e Recurso',
    originalText: 'Não se aplica a coisa julgada quando a decisão for contrária à súmula ou jurisprudência dominante do respectivo tribunal, ou do Supremo Tribunal Federal, ou, ainda, se a decisão recorrida estiver em manifesta contrariedade a texto expresso de lei federal.',
    translatedText: 'A decisão que não pode mais ser mudada (coisa julgada) NÃO se aplica quando: (1) a decisão for contrária à súmula ou jurisprudência dominante do tribunal ou do STF; ou (2) a decisão estiver em clara contrariedade a uma lei federal expressa.',
    keywords: ['coisa julgada', 'súmula', 'jurisprudência', 'recurso', 'lei federal'],
    area: 'civil',
    importance: 'alta'
  },
  {
    id: 'stf-sumula-003',
    type: 'súmula',
    tribunal: 'STF',
    number: '3',
    title: 'Prescrição e Decadência',
    originalText: 'A prescrição e a decadência não correm contra o incapaz, salvo se ele tiver representante legal.',
    translatedText: 'Os prazos para entrar com processo (prescrição) e para exercer direitos (decadência) não passam para pessoas que não podem cuidar de si mesmas (incapazes), EXCETO quando elas tiverem alguém responsável por elas (representante legal).',
    keywords: ['prescrição', 'decadência', 'incapaz', 'representante legal'],
    area: 'civil',
    importance: 'alta'
  },

  // ========== DIREITO TRABALHISTA ==========
  {
    id: 'tst-sumula-001',
    type: 'súmula',
    tribunal: 'TST',
    number: '1',
    title: 'Contrato de Trabalho',
    originalText: 'A contratação de trabalhador por empresa interposta é ilegal, formando-se o vínculo diretamente com a tomadora dos serviços, salvo nos casos de trabalho temporário.',
    translatedText: 'É ilegal contratar trabalhador através de empresa intermediária. O vínculo de trabalho se forma diretamente com a empresa que realmente usa os serviços, EXCETO nos casos de trabalho temporário.',
    keywords: ['contrato de trabalho', 'empresa interposta', 'vínculo', 'trabalho temporário'],
    area: 'trabalhista',
    importance: 'alta'
  },
  {
    id: 'tst-sumula-002',
    type: 'súmula',
    tribunal: 'TST',
    number: '2',
    title: 'Hora Extra',
    originalText: 'O trabalho suplementar, executado com habitualidade, durante pelo menos 1 (um) ano, gera direito ao adicional de horas extras, ainda que não tenha sido previamente ajustado.',
    translatedText: 'Quando o trabalhador faz horas extras de forma habitual (regular) por pelo menos 1 ano, ele tem direito ao pagamento adicional de horas extras, mesmo que isso não tenha sido combinado antes.',
    keywords: ['hora extra', 'trabalho suplementar', 'adicional', 'habitualidade'],
    area: 'trabalhista',
    importance: 'alta'
  },

  // ========== DIREITO TRIBUTÁRIO ==========
  {
    id: 'stf-sumula-004',
    type: 'súmula',
    tribunal: 'STF',
    number: '4',
    title: 'Imposto e Taxa',
    originalText: 'Não se confunde com imposto a taxa de polícia, que é devida pela prestação de serviço público específico e divisível.',
    translatedText: 'A taxa de polícia NÃO é a mesma coisa que imposto. A taxa é devida quando há prestação de serviço público específico e divisível (que pode ser medido individualmente).',
    keywords: ['imposto', 'taxa', 'polícia', 'serviço público'],
    area: 'tributário',
    importance: 'média'
  },

  // ========== DIREITO CONSTITUCIONAL ==========
  {
    id: 'stf-sumula-005',
    type: 'súmula',
    tribunal: 'STF',
    number: '5',
    title: 'Lei Anterior e Direito Adquirido',
    originalText: 'A lei nova, que estabeleça disposições gerais ou especiais, não prejudica o direito adquirido, o ato jurídico perfeito e a coisa julgada.',
    translatedText: 'Uma lei nova não pode prejudicar: (1) direitos que já foram adquiridos; (2) atos jurídicos que já foram completados; e (3) decisões que não podem mais ser mudadas (coisa julgada).',
    keywords: ['lei nova', 'direito adquirido', 'ato jurídico perfeito', 'coisa julgada'],
    area: 'constitucional',
    importance: 'alta'
  },

  // ========== CONCEITOS FUNDAMENTAIS ==========
  {
    id: 'conceito-coisa-julgada',
    type: 'conceito',
    title: 'Coisa Julgada',
    originalText: 'Coisa julgada é a decisão judicial que não pode mais ser modificada por recurso, tornando-se definitiva e imutável.',
    translatedText: 'Coisa julgada é quando uma decisão judicial não pode mais ser mudada por recurso. Ela se torna definitiva e imutável.',
    keywords: ['coisa julgada', 'decisão judicial', 'recurso', 'definitiva'],
    area: 'civil',
    importance: 'alta'
  },
  {
    id: 'conceito-prescricao',
    type: 'conceito',
    title: 'Prescrição',
    originalText: 'Prescrição é a perda do direito de ação pelo decurso do tempo previsto em lei.',
    translatedText: 'Prescrição é quando você perde o direito de entrar com processo porque passou o prazo previsto em lei.',
    keywords: ['prescrição', 'prazo', 'direito de ação', 'decurso do tempo'],
    area: 'civil',
    importance: 'alta'
  },
  {
    id: 'conceito-decadencia',
    type: 'conceito',
    title: 'Decadência',
    originalText: 'Decadência é a perda do direito material pelo decurso do prazo legal, sem necessidade de ação judicial.',
    translatedText: 'Decadência é quando você perde um direito porque passou o prazo legal, sem precisar de processo judicial.',
    keywords: ['decadência', 'prazo', 'direito material'],
    area: 'civil',
    importance: 'alta'
  },
  {
    id: 'conceito-sumula',
    type: 'conceito',
    title: 'Súmula',
    originalText: 'Súmula é o resumo de uma jurisprudência dominante de um tribunal, que serve como orientação para decisões futuras.',
    translatedText: 'Súmula é um resumo da jurisprudência (conjunto de decisões) mais comum de um tribunal, que serve como orientação para decisões futuras.',
    keywords: ['súmula', 'jurisprudência', 'tribunal', 'decisão'],
    area: 'constitucional',
    importance: 'alta'
  },
  {
    id: 'conceito-jurisprudencia',
    type: 'conceito',
    title: 'Jurisprudência',
    originalText: 'Jurisprudência é o conjunto de decisões judiciais que estabelecem uma interpretação uniforme sobre determinado assunto jurídico.',
    translatedText: 'Jurisprudência é o conjunto de decisões judiciais que estabelecem uma interpretação uniforme (igual) sobre um assunto jurídico.',
    keywords: ['jurisprudência', 'decisões judiciais', 'interpretação', 'uniforme'],
    area: 'constitucional',
    importance: 'alta'
  }
]

/**
 * Busca conhecimento relevante na base de dados
 * baseado em palavras-chave e área do direito
 */
export function findRelevantKnowledge(
  text: string,
  keywords: string[],
  limit: number = 3
): LegalKnowledge[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  const textLower = text.toLowerCase()
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()))

  // Calcular relevância de cada item
  const scored: Array<{ knowledge: LegalKnowledge; score: number }> = []

  for (const knowledge of legalKnowledgeBase) {
    let score = 0

    // Pontuar por palavras-chave em comum
    for (const keyword of knowledge.keywords) {
      if (keywordSet.has(keyword.toLowerCase())) {
        score += 2
      }
      if (textLower.includes(keyword.toLowerCase())) {
        score += 1
      }
    }

    // Pontuar por importância
    if (knowledge.importance === 'alta') {
      score += 3
    } else if (knowledge.importance === 'média') {
      score += 1
    }

    // Pontuar por tipo (súmulas e conceitos são mais relevantes)
    if (knowledge.type === 'súmula' || knowledge.type === 'conceito') {
      score += 2
    }

    // Pontuar se o texto original contém termos do conhecimento
    const knowledgeTextLower = knowledge.originalText.toLowerCase()
    for (const keyword of knowledge.keywords) {
      if (knowledgeTextLower.includes(keyword.toLowerCase()) && textLower.includes(keyword.toLowerCase())) {
        score += 1
      }
    }

    if (score > 0) {
      scored.push({ knowledge, score })
    }
  }

  // Ordenar por score e retornar os mais relevantes
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(item => item.knowledge)
}

/**
 * Formata conhecimento relevante para incluir no prompt
 */
export function formatKnowledgeForPrompt(knowledgeList: LegalKnowledge[]): string {
  if (!knowledgeList || knowledgeList.length === 0) {
    return ''
  }

  let formatted = '\n\n# CONHECIMENTO JURÍDICO RELEVANTE (USE COMO REFERÊNCIA):\n\n'

  for (let i = 0; i < knowledgeList.length; i++) {
    const knowledge = knowledgeList[i]
    
    formatted += `**${knowledge.type.toUpperCase()}`
    if (knowledge.tribunal) {
      formatted += ` - ${knowledge.tribunal}`
    }
    if (knowledge.number) {
      formatted += ` Nº ${knowledge.number}`
    }
    formatted += `**\n`
    
    if (knowledge.title) {
      formatted += `Título: ${knowledge.title}\n`
    }
    
    formatted += `\nTexto Original:\n${knowledge.originalText}\n\n`
    formatted += `Tradução de Referência:\n${knowledge.translatedText}\n\n`
    formatted += '---\n\n'
  }

  formatted += '\n**IMPORTANTE:** Use este conhecimento como referência para garantir precisão e consistência na tradução. Adapte o estilo e a abordagem para o texto atual.\n'

  return formatted
}

