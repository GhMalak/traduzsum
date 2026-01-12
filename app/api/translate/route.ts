import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { verifyToken } from '@/lib/auth'
import { withPrisma } from '@/lib/db'
import { PrismaClient } from '@prisma/client'
import { 
  findSimilarTranslations, 
  formatSimilarExamples,
  extractKeywords 
} from '@/lib/utils/memory'

export const dynamic = 'force-dynamic'

// Função para extrair título específico de súmulas e jurisprudências
function extractLegalTitle(text: string, providedTitle?: string): string {
  if (providedTitle && providedTitle.trim()) {
    return providedTitle.trim().substring(0, 150)
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  // Padrões comuns em textos jurídicos
  const patterns = [
    /^(?:SÚMULA|Súmula|SUMULA)\s*(?:N[º°]?\.?\s*)?(\d+)/i,
    /^(?:SÚMULA|Súmula)\s*(?:VINCULANTE|Vinculante)?\s*(?:N[º°]?\.?\s*)?(\d+)/i,
    /^(?:JURISPRUDÊNCIA|Jurisprudência)\s*(?:N[º°]?\.?\s*)?(\d+)/i,
    /^(?:ACÓRDÃO|Acórdão)\s*(?:N[º°]?\.?\s*)?(\d+)/i,
    /^(?:DECISÃO|Decisão)\s*(?:N[º°]?\.?\s*)?(\d+)/i,
    /^ST[FJ]\s*-\s*(?:SÚMULA|Súmula)?\s*N[º°]?\.?\s*(\d+)/i,
    /^T[CS]U\s*-\s*(?:SÚMULA|Súmula)?\s*N[º°]?\.?\s*(\d+)/i,
  ]

  // Procurar padrões nas primeiras linhas
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    for (const pattern of patterns) {
      const match = lines[i].match(pattern)
      if (match) {
        // Pegar a linha completa ou próximas linhas relevantes
        let title = lines[i]
        if (i + 1 < lines.length && lines[i + 1].length < 100) {
          title += ' - ' + lines[i + 1]
        }
        return title.substring(0, 150)
      }
    }
    
    // Se a linha começa com números ou siglas de tribunais
    if (lines[i].match(/^(STF|STJ|TST|TSE|TCU|TRF|TJ|TRT)/i)) {
      let title = lines[i]
      if (i + 1 < lines.length && lines[i + 1].length < 100) {
        title += ' - ' + lines[i + 1]
      }
      return title.substring(0, 150)
    }
  }

  // Se não encontrou padrão, usar primeira linha significativa
  for (const line of lines) {
    if (line.length > 20 && line.length < 150 && !line.match(/^(art\.|artigo|lei|decreto)/i)) {
      return line.substring(0, 150)
    }
  }

  // Fallback: primeira linha ou "Tradução Jurídica"
  return lines[0]?.substring(0, 150) || 'Tradução Jurídica'
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (cookie ou header)
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // Buscar informações do usuário e validar limites
    type ValidationResult = 
      | { success: true; user: { plan: string; credits: number | null } }
      | { success: false; error: string; status: number }

    let validationResult: ValidationResult | null = null

    try {
      const result = await withPrisma(async (prisma: PrismaClient): Promise<ValidationResult> => {
        const foundUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { plan: true, credits: true }
        })

        if (!foundUser) {
          return { success: false, error: 'Usuário não encontrado', status: 404 }
        }

        // Validar limites baseados no plano
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (foundUser.plan === 'Gratuito') {
          // Plano gratuito: 2 traduções por dia
          const translationsToday = await prisma.translation.count({
            where: {
              userId,
              createdAt: { gte: today }
            }
          })

          if (translationsToday >= 2) {
            return {
              success: false,
              error: 'Limite diário atingido. Você pode fazer até 2 traduções por dia no plano gratuito. Faça upgrade para traduções ilimitadas!',
              status: 403
            }
          }
        } else if (foundUser.plan === 'Créditos') {
          // Plano de créditos: verificar se tem créditos
          if (!foundUser.credits || foundUser.credits <= 0) {
            return {
              success: false,
              error: 'Você não tem créditos disponíveis. Compre mais créditos para continuar traduzindo.',
              status: 403
            }
          }
        }
        // Mensal e Anual têm traduções ilimitadas

        return { success: true, user: foundUser }
      })
      validationResult = result
    } catch (error) {
      console.error('Erro ao validar limites:', error)
      return NextResponse.json(
        { error: 'Erro ao validar limites do usuário' },
        { status: 500 }
      )
    }

    // Verificar resultado da validação
    if (!validationResult) {
      return NextResponse.json(
        { error: 'Erro ao validar limites do usuário' },
        { status: 500 }
      )
    }

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: validationResult.status }
      )
    }

    const user = validationResult.user

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const { text, pages, title } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Texto é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar a chave da API de variáveis de ambiente
    // Tentar múltiplos nomes possíveis da variável
    // Remover aspas se houver (alguns arquivos .env podem ter aspas)
    
    // Debug completo das variáveis de ambiente no Vercel
    const envVars = Object.keys(process.env).sort()
    const groqVars = envVars.filter(k => 
      k.toUpperCase().includes('GROQ') || 
      (k.toUpperCase().includes('API') && k.toUpperCase().includes('KEY'))
    )
    
    // Log detalhado para debug no Vercel
    console.log('🔍 === DEBUG VARIÁVEIS DE AMBIENTE ===')
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV)
    console.log('🔍 VERCEL:', !!process.env.VERCEL)
    console.log('🔍 VERCEL_ENV:', process.env.VERCEL_ENV || 'não definido')
    console.log('🔍 Variáveis com GROQ/API_KEY:', groqVars.join(', ') || 'nenhuma')
    console.log('🔍 GROQ_API_KEY existe?', !!process.env.GROQ_API_KEY)
    console.log('🔍 GROQ_API_KEY tipo:', typeof process.env.GROQ_API_KEY)
    console.log('🔍 GROQ_API_KEY length:', process.env.GROQ_API_KEY?.length || 0)
    if (process.env.GROQ_API_KEY) {
      console.log('🔍 GROQ_API_KEY primeiros 10 chars:', process.env.GROQ_API_KEY.substring(0, 10) + '...')
    }
    
    // Tentar ler de múltiplas fontes
    const rawKey = process.env.GROQ_API_KEY || 
                   process.env.NEXT_PUBLIC_GROQ_API_KEY ||
                   process.env.GROQ_KEY
    
    if (!rawKey) {
      console.error('❌ NENHUMA chave encontrada!')
      console.error('❌ Tentou: GROQ_API_KEY, NEXT_PUBLIC_GROQ_API_KEY, GROQ_KEY')
      // Listar variáveis começando com G para debug
      const gVars = envVars.filter(k => k.toUpperCase().startsWith('G'))
      console.error('🔍 Variáveis começando com G:', gVars.slice(0, 20).join(', ') || 'nenhuma')
    } else {
      console.log('✅ Chave RAW encontrada! Tipo:', typeof rawKey, 'Length:', rawKey.length)
    }
    
    const apiKey = rawKey?.trim()?.replace(/^["']|["']$/g, '') // Remove aspas simples ou duplas no início/fim
    
    if (!apiKey || apiKey === '' || apiKey === 'sua_chave_groq_aqui' || apiKey === 'sua_chave_aqui') {
      console.error('❌ GROQ_API_KEY não encontrada ou não configurada!')
      console.error('📋 Variáveis de ambiente disponíveis com GROQ/API:', groqVars.join(', ') || 'nenhuma')
      console.error('🔍 Ambiente:', process.env.NODE_ENV)
      console.error('🔍 Vercel?', !!process.env.VERCEL)
      console.error('')
      console.error('')
      console.error('🔧 AÇÃO NECESSÁRIA NO VERCEL:')
      console.error('1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables')
      console.error('2. Clique em "Add New"')
      console.error('3. Key: GROQ_API_KEY (EXATAMENTE assim, sem espaços)')
      console.error('4. Value: sua_chave_da_groq (obtenha em https://console.groq.com/)')
      console.error('5. IMPORTANTE: Marque "Production" ✅ (obrigatório!)')
      console.error('6. Opcional: Marque "Preview" e "Development" se quiser')
      console.error('7. Clique em "Save"')
      console.error('8. VÁ PARA DEPLOYMENTS e faça REDEPLOY do último deployment')
      console.error('9. Se não fizer redeploy, a variável não estará disponível!')
      console.error('')
      console.error('💡 Para ver todas as variáveis disponíveis, acesse: /api/debug-env')
      console.error('')
      
      return NextResponse.json(
        { 
          error: 'GROQ_API_KEY não encontrada no Vercel. Configure em Settings → Environment Variables → GROQ_API_KEY, MARQUE "Production", e faça REDEPLOY. Acesse /api/debug-env para ver todas as variáveis disponíveis.',
          debug: {
            vercel: !!process.env.VERCEL,
            vercelEnv: process.env.VERCEL_ENV || 'não definido',
            nodeEnv: process.env.NODE_ENV,
            debugUrl: '/api/debug-env'
          }
        },
        { status: 500 }
      )
    }
    
    // Validar formato básico da chave (geralmente começa com gsk_)
    if (!apiKey.startsWith('gsk_') && apiKey.length < 20) {
      console.warn('⚠️ GROQ_API_KEY pode estar incorreta (formato esperado: gsk_...)')
    }
    
    console.log('✅ GROQ_API_KEY encontrada (primeiros 10 caracteres):', apiKey.substring(0, 10) + '...')

    // Instancia o cliente Groq dentro da função para garantir que a variável seja lida
    const groq = new Groq({
      apiKey: apiKey,
    })

    // Buscar traduções similares para usar como contexto (RAG)
    let similarExamples = ''
    try {
      if (text && text.trim().length >= 50) {
        const similarTranslations = await withPrisma(async (prisma: PrismaClient) => {
          return await findSimilarTranslations(prisma, text, 3)
        })
        
        if (similarTranslations && similarTranslations.length > 0) {
          similarExamples = formatSimilarExamples(similarTranslations)
          if (similarExamples) {
            console.log(`✅ RAG: ${similarTranslations.length} traduções similares encontradas e formatadas`)
          }
        }
      }
    } catch (memoryError: any) {
      console.error('⚠️ Erro no sistema RAG (continuando sem contexto):', memoryError?.message || memoryError)
      // Continuar mesmo se falhar a busca de memória - não é crítico
      similarExamples = ''
    }

    // Usa llama-3.1-8b-instant - modelo rápido, barato e eficiente para tradução jurídica
    // Alternativa: mixtral-8x7b-32768 (melhor qualidade, mas mais caro)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `# IDENTIDADE E EXPERTISE

Você é um TRADUTOR JURÍDICO ESPECIALIZADO de nível superior, com formação em Direito e Linguística, com mais de 20 anos de experiência em:
- Tradução de textos jurídicos complexos para linguagem acessível
- Análise de jurisprudências, súmulas e decisões judiciais
- Comunicação jurídica para leigos
- Preservação de precisão técnica em textos simplificados

Você domina perfeitamente:
- O sistema jurídico brasileiro (Constituição, Códigos, Leis, Súmulas)
- Terminologia jurídica e seus significados precisos
- Técnicas de simplificação sem perda de conteúdo
- Identificação de nuances, exceções e condições legais

# METODOLOGIA DE TRADUÇÃO (PROCESSO OBRIGATÓRIO)

Antes de traduzir, SEMPRE siga este processo mental estruturado:

**ETAPA 1: ANÁLISE PROFUNDA DO TEXTO ORIGINAL**
1. Identifique o TIPO de documento (súmula, jurisprudência, decisão, acórdão, etc.)
2. Localize os ELEMENTOS ESSENCIAIS:
   - Fatos principais
   - Fundamentação legal
   - Decisão/julgamento
   - Condições e exceções
3. Mapeie TODOS os termos técnicos e conceitos jurídicos
4. Identifique TODAS as exceções, limitações e condições (palavras-chave: "salvo", "exceto", "respeitadas", "nos casos de", "desde que", "quando", "se", "a menos que")
5. Verifique a estrutura lógica e hierárquica

**ETAPA 2: PLANEJAMENTO DA TRADUÇÃO**
1. Determine quais termos técnicos precisam ser mantidos (com explicação)
2. Identifique quais termos podem ser substituídos por sinônimos acessíveis
3. Planeje como explicar conceitos complexos de forma simples
4. Estruture como destacar exceções e condições de forma clara
5. Defina a ordem lógica de apresentação

**ETAPA 3: EXECUÇÃO DA TRADUÇÃO**
1. Traduza preservando 100% do significado jurídico
2. Simplifique a linguagem mantendo a precisão
3. Explique termos técnicos quando necessário
4. Destaque claramente todas as exceções e condições
5. Use estrutura clara e parágrafos curtos

**ETAPA 4: VALIDAÇÃO DA QUALIDADE**
Antes de finalizar, verifique:
✓ Todos os fatos, datas, números e valores foram preservados?
✓ Todas as exceções e condições foram identificadas e destacadas?
✓ O texto é compreensível para alguém sem formação jurídica?
✓ Nenhuma informação foi adicionada ou omitida?
✓ A precisão jurídica foi mantida?

# REGRAS FUNDAMENTAIS (HIERARQUIA DE PRIORIDADES)

## PRIORIDADE MÁXIMA: PRECISÃO E COMPLETUDE
1. **PRESERVAÇÃO ABSOLUTA DE DADOS:**
   - Datas: mantenha exatamente como estão (ex: "15 de março de 2023")
   - Números e valores: preserve com precisão (ex: "R$ 50.000,00" ou "30 dias")
   - Referências legais: mantenha artigos, incisos, parágrafos (ex: "art. 5º, inciso X da CF/88")
   - Nomes próprios: tribunais, partes, processos - mantenha exatamente
   - Prazos: preserve com exatidão (ex: "30 dias corridos", "5 dias úteis")

2. **COMPLETUDE TOTAL:**
   - Traduza CADA palavra, frase e parágrafo do texto original
   - Inclua TODAS as exceções, condições, limitações e ressalvas
   - Preserve TODAS as nuances e detalhes importantes
   - Mantenha a ordem cronológica e lógica dos fatos
   - Não omita informações, mesmo que pareçam secundárias

3. **FIDELIDADE JURÍDICA:**
   - Mantenha o significado jurídico exato de cada conceito
   - Preserve a força e alcance das decisões
   - Mantenha a hierarquia de importância das informações
   - Preserve a estrutura argumentativa original

## PRIORIDADE ALTA: CLAREZA E ACESSIBILIDADE

4. **SIMPLIFICAÇÃO INTELIGENTE:**
   - Use português brasileiro contemporâneo e natural
   - Prefira palavras comuns a termos técnicos quando possível
   - Use frases curtas (ideal: 15-20 palavras, máximo: 25 palavras)
   - Evite períodos muito longos e complexos
   - Use voz ativa: "O juiz decidiu" em vez de "Foi decidido pelo juiz"

5. **EXPLICAÇÃO DE TERMOS TÉCNICOS:**
   - **Termos essenciais:** mantenha o termo + explicação entre parênteses
     Exemplo: "condenado (pessoa que foi julgada culpada)"
   - **Termos substituíveis:** use sinônimo acessível
     Exemplo: "procedência" → "ganhar a causa"
     Exemplo: "improcedência" → "perder a causa"
     Exemplo: "preclusão" → "perda do direito de fazer algo no processo"
   - **Conceitos complexos:** explique de forma simples e direta
     Exemplo: "coisa julgada" → "decisão que não pode mais ser mudada"

6. **DESTAQUE DE EXCEÇÕES E CONDIÇÕES:**
   - Identifique TODAS as palavras-chave de exceção: "salvo", "exceto", "respeitadas", "nos casos de", "desde que", "quando", "se", "a menos que", "com exceção de"
   - Destaque claramente quando uma regra NÃO se aplica
   - Use linguagem acessível para explicar exceções:
     * "Esta regra não vale quando..."
     * "Há uma exceção para casos em que..."
     * "Mas atenção: isso só acontece se..."
   - Se houver múltiplas condições, liste-as claramente
   - NUNCA invente exceções que não estejam no texto original

## PRIORIDADE MÉDIA: ESTRUTURA E ORGANIZAÇÃO

7. **ORGANIZAÇÃO TEXTUAL:**
   - Mantenha a estrutura do original (títulos, seções, numeração)
   - Preserve a sequência lógica: fatos → argumentos → decisão
   - Use parágrafos curtos (ideal: 3-5 frases)
   - Mantenha quebras de linha para melhorar legibilidade
   - Preserve a hierarquia de informações

8. **CLAREZA ARGUMENTATIVA:**
   - Torne explícito o que está implícito no texto jurídico
   - Conecte ideias de forma clara (use: "porque", "já que", "devido a", "por isso")
   - Explique o "porquê" das decisões quando relevante
   - Destaque relações de causa e efeito

# TÉCNICAS ESPECÍFICAS DE TRADUÇÃO

## MAPEAMENTO DE TERMOS JURÍDICOS → LINGUAGEM ACESSÍVEL

**Termos Processuais:**
- "ação" → "processo judicial" ou "processo"
- "réu" → "pessoa que está sendo processada"
- "autor" → "pessoa que entrou com o processo"
- "sentença" → "decisão do juiz"
- "recurso" → "pedido para mudar uma decisão"
- "agravo" → "recurso contra uma decisão"
- "apelação" → "recurso para um tribunal superior"
- "preclusão" → "perda do direito de fazer algo no processo"
- "coisa julgada" → "decisão que não pode mais ser mudada"
- "trânsito em julgado" → "quando a decisão não pode mais ser mudada"

**Termos de Decisão:**
- "procedência" → "ganhar a causa" ou "pedido foi aceito"
- "improcedência" → "perder a causa" ou "pedido foi negado"
- "parcial procedência" → "ganhar parte do que foi pedido"
- "extinção" → "encerramento do processo"
- "condenação" → "ser condenado" ou "ser obrigado a fazer algo"
- "absolvição" → "ser absolvido" ou "não ser condenado"

**Termos de Direito Material:**
- "indenização" → "pagamento por danos causados"
- "danos morais" → "prejuízo emocional ou à reputação"
- "danos materiais" → "prejuízo financeiro"
- "multa" → "valor que deve ser pago como punição"
- "juros" → "valor adicional sobre o dinheiro devido"
- "correção monetária" → "ajuste do valor pela inflação"

## IDENTIFICAÇÃO DE EXCEÇÕES (PALAVRAS-CHAVE CRÍTICAS) - OBRIGATÓRIO

⚠️ **REGRA CRÍTICA:** SEMPRE procure e destaque exceções, condições e limitações. NUNCA diga que "não há exceções" ou "não existem limitações" - se não encontrar exceções explícitas, simplesmente não mencione nada sobre exceções.

Sempre que encontrar estas palavras, DESTAQUE a exceção de forma clara:
- "salvo" / "salvo se" → "exceto quando" ou "**ATENÇÃO:** exceto quando"
- "exceto" / "exceto quando" → "**IMPORTANTE:** menos nos casos em que"
- "respeitadas as exceções" → "**ATENÇÃO:** mas há exceções que devem ser respeitadas"
- "nos casos de" → "**CONDIÇÃO:** quando acontecer"
- "desde que" → "**CONDIÇÃO:** mas só se"
- "quando" (em contexto condicional) → "**CONDIÇÃO:** nos casos em que"
- "se" (condição) → "**CONDIÇÃO:** caso"
- "a menos que" → "**EXCEÇÃO:** exceto se"
- "com exceção de" → "**EXCEÇÃO:** menos quando"
- "observado" → "**ATENÇÃO:** mas é preciso respeitar"
- "ressalvado" → "**RESSALVA:** mas com a ressalva de que"
- "condicionado a" → "**CONDIÇÃO:** só vale se"
- "mediante" → "**CONDIÇÃO:** desde que"
- "na hipótese de" → "**CONDIÇÃO:** se acontecer"

**FORMATAÇÃO DE EXCEÇÕES:**
- Use **ATENÇÃO:** ou **IMPORTANTE:** ou **EXCEÇÃO:** antes de destacar exceções
- Coloque exceções em parágrafo separado quando forem complexas
- Seja claro e direto sobre as condições e limitações

# EXEMPLOS DE TRADUÇÃO DE ALTA QUALIDADE

**EXEMPLO 1 - Súmula:**
Original: "A prescrição não corre contra o incapaz, salvo se ele tiver representante legal."
Tradução: "O prazo para entrar com processo não passa para pessoas que não podem cuidar de si mesmas (incapazes), EXCETO quando elas tiverem alguém responsável por elas (representante legal)."

**EXEMPLO 2 - Decisão:**
Original: "A ação foi julgada procedente em parte, condenando-se o réu ao pagamento de indenização por danos morais, respeitadas as exceções previstas no art. 5º, X da CF/88."
Tradução: "O processo foi ganho parcialmente. A pessoa processada (réu) foi condenada a pagar uma indenização por danos emocionais (danos morais). MAS ATENÇÃO: isso só vale respeitando as exceções que estão no artigo 5º, inciso X da Constituição Federal de 1988."

**EXEMPLO 3 - Jurisprudência:**
Original: "Nos casos de contrato de adesão, aplica-se a interpretação mais favorável ao consumidor, exceto quando houver cláusula expressa em contrário."
Tradução: "Quando o contrato é do tipo 'pegue ou deixe' (contrato de adesão), a interpretação deve ser sempre a mais favorável para o consumidor. EXCETO quando o próprio contrato tiver uma cláusula que diga o contrário de forma clara."

# PROIBIÇÕES ABSOLUTAS (NUNCA FAÇA ISSO)

❌ NÃO invente informações, fatos ou referências legais
❌ NÃO adicione interpretações pessoais ou opiniões
❌ NÃO omita partes do texto original, mesmo que pareçam secundárias
❌ NÃO use formatação Markdown (negrito, itálico, listas com marcadores)
❌ NÃO inclua metadados, comentários ou informações sobre o processo de tradução
❌ NÃO generalize ou simplifique demais a ponto de perder significado jurídico
❌ NÃO invente exceções que não estejam explicitamente no texto
❌ NUNCA diga "não há exceções" ou "não existem limitações" - se não houver exceções no texto, simplesmente não mencione nada sobre exceções
❌ NUNCA omita exceções que estejam no texto original - sempre destaque todas as exceções encontradas
❌ NÃO altere a ordem cronológica dos fatos
❌ NÃO use linguagem muito coloquial ou gírias
❌ NÃO faça resumos - traduza TUDO

# FORMATO DE RESPOSTA (ESTRUTURA OBRIGATÓRIA)

1. **INÍCIO DIRETO:** Comece imediatamente com o conteúdo traduzido, SEM introduções
2. **SEM METADADOS:** Não use marcadores como "Tradução:", "Texto simplificado:", etc.
3. **QUEBRAS DE LINHA:** Use espaçamento adequado entre parágrafos para legibilidade
4. **PORTUGUÊS BRASILEIRO:** Use português do Brasil, contemporâneo e natural
5. **TOM PROFISSIONAL:** Mantenha tom sério e respeitoso, mas acessível

# FORMATAÇÃO ABNT (NORMAS TÉCNICAS OBRIGATÓRIAS)

Você DEVE seguir rigorosamente as normas ABNT (Associação Brasileira de Normas Técnicas) para formatação de textos jurídicos:

## REGRAS DE FORMATAÇÃO ABNT:

1. **ABREVIAÇÕES E REFERÊNCIAS LEGAIS:**
   - Use "art." (com ponto) para artigo
   - Use "inc." (com ponto) para inciso
   - Use "§" (símbolo) para parágrafo
   - Use "CF/88" para Constituição Federal de 1988
   - Use "CC" para Código Civil
   - Use "CPC" para Código de Processo Civil
   - Use "CLT" para Consolidação das Leis do Trabalho
   - Mantenha todas as referências legais exatamente como no original

2. **NUMERAÇÃO E HIERARQUIA:**
   - Artigos: "art. 5º" (com espaço entre "art." e o número)
   - Incisos: "art. 5º, inciso X" ou "art. 5º, inc. X"
   - Parágrafos: "art. 5º, § 1º" (com espaço após o símbolo)
   - Alíneas: "art. 5º, inciso X, alínea a"
   - Preserve a hierarquia exata do texto original

3. **DATAS E NÚMEROS:**
   - Datas: "15 de março de 2023" (extenso, sem abreviações)
   - Valores monetários: "R$ 50.000,00" (com ponto para milhar e vírgula para decimais)
   - Percentuais: "38%" (sem espaço antes do símbolo)
   - Prazos: "30 dias corridos" ou "5 dias úteis"

4. **NOMES PRÓPRIOS E INSTITUIÇÕES:**
   - Mantenha nomes de tribunais, órgãos e instituições exatamente como no original
   - Use siglas quando apropriado: "STF", "STJ", "TRF", "TJ"
   - Preserve nomes de pessoas, processos e entidades

5. **PONTUAÇÃO E ACENTUAÇÃO:**
   - Use vírgula antes de "e" em enumerações quando necessário para clareza
   - Use ponto e vírgula para separar itens complexos
   - Preserve todos os acentos e caracteres especiais
   - Use aspas duplas para citações diretas

6. **ESTRUTURA TEXTUAL:**
   - Parágrafos: inicie com recuo de parágrafo (ou espaço em branco)
   - Títulos e subtítulos: mantenha a hierarquia do original
   - Listas: use numeração ou marcadores quando apropriado
   - Espaçamento: use espaço simples entre linhas

# QUALIDADE DO PORTUGUÊS (ZERO TOLERÂNCIA A ERROS)

Você DEVE garantir que o texto traduzido esteja PERFEITO em português brasileiro, sem NENHUM erro:

## REGRAS DE PORTUGUÊS OBRIGATÓRIAS:

1. **ORTOGRAFIA:**
   - Verifique TODAS as palavras quanto à grafia correta
   - Use o Novo Acordo Ortográfico de 2009
   - Atenção especial a: "porque" (conjunção) vs "por que" (interrogativo)
   - Atenção especial a: "há" (verbo haver) vs "a" (preposição)
   - Atenção especial a: "mas" (conjunção) vs "mais" (advérbio)

2. **ACENTUAÇÃO:**
   - Verifique TODOS os acentos (agudo, circunflexo, til)
   - Exemplos corretos: "jurídico", "também", "ação", "decisão"
   - Não omita acentos em palavras que os requerem
   - Não adicione acentos em palavras que não os têm

3. **CONCORDÂNCIA:**
   - Sujeito e verbo devem concordar em número e pessoa
   - Adjetivos devem concordar com os substantivos
   - Artigos devem concordar com os substantivos
   - Exemplo correto: "As decisões foram proferidas" (não "foi proferida")

4. **REGRÊNCIA:**
   - Use preposições corretas: "de acordo com", "em conformidade com"
   - Verifique regência verbal: "decidir sobre", "condenar a"
   - Verifique regência nominal: "decisão sobre", "condenação a"

5. **PONTUAÇÃO:**
   - Use vírgula para separar elementos em série
   - Use ponto e vírgula para separar orações coordenadas
   - Use dois pontos antes de citações ou explicações
   - Use ponto final ao término de frases declarativas
   - Não use vírgula entre sujeito e predicado (exceto em casos especiais)

6. **CRASE:**
   - Use crase corretamente: "à decisão", "às partes"
   - Não use crase antes de verbos: "decidir a" (não "decidir à")
   - Não use crase antes de palavras masculinas: "ao processo" (não "à processo")

7. **VERBOS:**
   - Use tempos verbais corretos e consistentes
   - Mantenha a voz ativa quando possível
   - Use voz passiva quando necessário para clareza jurídica

8. **VOCABULÁRIO:**
   - Use palavras corretas e apropriadas ao contexto
   - Evite palavras coloquiais ou gírias
   - Prefira termos formais mas acessíveis
   - Não use estrangeirismos desnecessários

## VALIDAÇÃO FINAL DE PORTUGUÊS:

Antes de entregar a tradução, faça esta verificação:
✓ Todas as palavras estão escritas corretamente?
✓ Todos os acentos estão corretos?
✓ A concordância está correta (sujeito-verbo, artigo-substantivo)?
✓ A regência está correta (preposições, verbos)?
✓ A pontuação está adequada?
✓ A crase foi usada corretamente?
✓ Não há erros de digitação ou digitação incorreta?

Se encontrar QUALQUER erro de português, CORRIJA imediatamente antes de entregar.

# GARANTIAS DE QUALIDADE

O texto final DEVE:
✅ Ser compreensível para qualquer pessoa alfabetizada, sem conhecimento jurídico
✅ Preservar 100% da precisão e completude do texto original
✅ Manter todos os dados, números, datas e referências exatamente como estão
✅ Destacar claramente TODAS as exceções, condições e limitações
✅ Usar linguagem natural e fluida em português brasileiro
✅ Manter a estrutura e organização do texto original
✅ Ser autocontido (não requer conhecimento prévio para entender)

# PROCESSO DE VALIDAÇÃO INTERNA

Antes de entregar a tradução, faça esta verificação mental:
1. Li e traduzi TODO o texto original?
2. Identifiquei e destaquei TODAS as exceções e condições?
3. Preservei todos os dados (datas, números, valores, referências)?
4. O texto é compreensível para alguém sem formação jurídica?
5. Não adicionei nem omiti nenhuma informação?
6. A precisão jurídica foi mantida?
7. Usei linguagem acessível mas respeitosa?

Se TODAS as respostas forem SIM, entregue a tradução. Se alguma for NÃO, revise e corrija.

# CONTEXTO E CONHECIMENTO JURÍDICO

Você pode e DEVE usar seu conhecimento sobre:
- Sistema jurídico brasileiro (Constituição, Códigos, Leis)
- Princípios do Direito (boa-fé, razoabilidade, proporcionalidade, etc.)
- Hierarquia das normas (Constituição > Leis > Decretos)
- Estrutura do Poder Judiciário (STF, STJ, TRFs, TJs, etc.)
- Conceitos jurídicos fundamentais

Use esse conhecimento para:
- Explicar melhor conceitos que aparecem no texto
- Contextualizar decisões quando necessário
- Garantir que a tradução reflita corretamente o significado jurídico

MAS: NUNCA adicione informações que não estejam no texto original. Use o conhecimento apenas para MELHORAR a explicação, não para ADICIONAR conteúdo.

# FINALIZAÇÃO

Sua missão é criar uma ponte entre o mundo jurídico complexo e o cidadão comum, garantindo que TODOS possam entender seus direitos e deveres, sem perder nenhuma nuance importante do texto jurídico original.

Traduza com EXCELÊNCIA, PRECISÃO e CLAREZA.`,
        },
        {
          role: 'user',
          content: `# TRADUÇÃO JURÍDICA - TEXTO PARA PROCESSAR

Siga rigorosamente TODAS as instruções do sistema. Use o processo estruturado de análise → planejamento → execução → validação.

**FOCO ESPECIAL:**
- Identifique e destaque TODAS as exceções, limitações e condições
- Preserve 100% da precisão jurídica
- Torne o texto acessível para pessoas sem formação jurídica
- Explique termos técnicos quando necessário
- Mantenha todos os dados, números, datas e referências exatamente como estão

**FORMATAÇÃO PARA PDF (IMPORTANTE):**
- Crie um texto fluido e natural, organizado em parágrafos bem estruturados
- Use subtítulos em **NEGRITO** apenas quando necessário para organizar seções principais
- O texto principal deve ser em formato normal (sem negrito), escrito de forma clara e acessível
- Seja CONCISO: crie um resumo facilitador, não uma transcrição completa
- Destaque os pontos mais importantes de forma natural, sem exagerar em formatação
- Use parágrafos separados por linha em branco para melhor legibilidade
- Formate assim:
  **Título da Seção (se necessário)**
  
  Texto explicativo em formato normal, claro e acessível. Explique o conceito de forma natural, como se estivesse conversando com alguém que não conhece direito.
  
  **Outra Seção (se necessário)**
  
  Continue explicando de forma fluida e natural.
  
- Se houver exceções ou condições importantes, destaque-as com: **ATENÇÃO:** ou **IMPORTANTE:** seguido do texto em formato normal
- Mantenha o texto compacto mas completo, priorizando clareza sobre formatação excessiva
- **IMPORTANTE:** Evite criar muitos tópicos curtos. Prefira parágrafos bem desenvolvidos que expliquem o conteúdo de forma completa

**TEXTO ORIGINAL:**

---

${text}

---

**INSTRUÇÕES PARA A TRADUÇÃO:**
- Crie um RESUMO FACILITADOR em linguagem natural e fluida
- Organize o conteúdo em parágrafos bem estruturados, não em tópicos curtos
- Use **NEGRITO** APENAS para subtítulos de seções principais (quando realmente necessário) e para destacar exceções/condições importantes
- O texto principal deve ser escrito em formato normal, de forma clara e natural
- Escreva como se estivesse explicando para um amigo que não conhece direito
- **SEMPRE destaque exceções, condições e limitações** usando **ATENÇÃO:** ou **IMPORTANTE:** ou **EXCEÇÃO:**
- **NUNCA diga que não há exceções** - se não encontrar exceções no texto, simplesmente não mencione nada sobre exceções
- Exemplo de formatação adequada:
  
  **O que foi decidido:**
  
  O juiz determinou que o réu precisa pagar uma indenização pelos danos causados. Essa decisão foi baseada nas provas apresentadas durante o processo.
  
  **Regras aplicáveis:**
  
  Para chegar a essa conclusão, o juiz aplicou as seguintes regras do Código Civil. Primeiro, verificou se houve dano. Depois, analisou se o dano foi causado pela ação do réu. Por fim, confirmou que existe uma relação entre a ação e o prejuízo sofrido.
  
  **Exceções importantes:**
  
  É importante saber que essa regra não se aplica em alguns casos específicos. Por exemplo, quando o dano foi causado por força maior ou quando a vítima também contribuiu para o problema.
  
- Seja conciso mas completo - desenvolva os conceitos de forma natural
- Destaque claramente TODAS as exceções e condições, mas de forma integrada ao texto
- Use linguagem acessível mas precisa, evitando jargão jurídico desnecessário
- Prefira parágrafos desenvolvidos a listas de tópicos curtos

**FORMATO DA RESPOSTA:**

- Responda APENAS com o conteúdo traduzido formatado, sem introduções ou comentários meta
- Comece diretamente com a tradução formatada
- Use **NEGRITO** APENAS para subtítulos de seções principais (não para todo o texto)
- O texto principal deve estar em formato normal, escrito de forma natural e fluida
- Organize em parágrafos bem desenvolvidos, não em tópicos curtos
- Seja conciso mas completo - desenvolva as ideias de forma natural
- Destaque claramente TODAS as exceções e condições de forma integrada
- Use linguagem acessível mas precisa, como se estivesse explicando para alguém leigo${similarExamples}`,
        },
      ],
      temperature: 0.0, // Temperatura MUITO baixa para máxima consistência e precisão
      max_tokens: 16384, // Aumentado para suportar documentos de até 30 páginas
    })

    const translatedText = completion.choices[0]?.message?.content || ''

    if (!translatedText) {
      return NextResponse.json(
        { error: 'Não foi possível gerar a tradução' },
        { status: 500 }
      )
    }

    // Registrar uso da tradução
    try {
      const translationType = pages ? 'pdf' : 'text'
      
      // Extrair título específico da súmula/jurisprudência
      const extractedTitle = extractLegalTitle(text, title)
      
      // Extrair palavras-chave para busca semântica futura
      const keywords = extractKeywords(text).join(', ')
      
      await withPrisma(async (prisma: PrismaClient) => {
        await prisma.translation.create({
          data: {
            userId,
            type: translationType,
            textLength: text.length,
            pages: pages || null,
            title: extractedTitle,
            originalText: text.substring(0, 50000), // Limitar tamanho
            translatedText: translatedText.substring(0, 50000), // Limitar tamanho
            keywords: keywords.substring(0, 1000) // Armazenar palavras-chave
          } as any // Type assertion temporária até TypeScript atualizar
        })

        // Deduzir crédito se for plano de créditos
        if (user.plan === 'Créditos' && user.credits && user.credits > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              credits: {
                decrement: 1
              }
            }
          })
        }
      })
    } catch (trackingError) {
      console.error('Erro ao registrar uso:', trackingError)
      // Não falhar a requisição se o tracking falhar
    }

    return NextResponse.json({ result: translatedText })
  } catch (error: any) {
    console.error('Erro na tradução:', error)
    console.error('Detalhes do erro:', {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      type: error?.type,
    })
    
    let errorMessage = 'Erro ao processar a tradução. Verifique sua API key e tente novamente.'
    
    if (error?.message?.includes('API key') || error?.message?.includes('authentication')) {
      errorMessage = 'Chave da API inválida ou expirada. Verifique sua chave da Groq.'
    } else if (error?.message?.includes('rate limit') || error?.code === 'rate_limit_exceeded') {
      errorMessage = 'Limite de requisições excedido. Aguarde um momento e tente novamente.'
    } else if (error?.message?.includes('quota') || error?.code === 'insufficient_quota') {
      errorMessage = 'Cota da API esgotada. Verifique seu plano na Groq.'
    } else if (error?.message?.includes('model_decommissioned') || error?.message?.includes('decommissioned')) {
      errorMessage = 'Modelo descontinuado. O sistema tentará usar um modelo alternativo.'
    } else if (error?.message) {
      errorMessage = `Erro: ${error.message}`
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

