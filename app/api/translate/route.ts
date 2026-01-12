import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { verifyToken } from '@/lib/auth'
import { withPrisma } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

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

    // Usa llama-3.1-8b-instant - modelo rápido, barato e eficiente para tradução jurídica
    // Alternativa: mixtral-8x7b-32768 (melhor qualidade, mas mais caro)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          "role": "user",
          "content": "Você é um TRADUTOR JURÍDICO ESPECIALIZADO de nível superior, com formação em Direito e Linguística, com mais de 20 anos de experiência em:\n- Tradução de textos jurídicos complexos para linguagem acessível\n- Análise de jurisprudências, súmulas e decisões judiciais\n- Comunicação jurídica para leigos\n- Preservação de precisão técnica em textos simplificados\n\nVocê domina perfeitamente:\n- O sistema jurídico brasileiro (Constituição, Códigos, Leis, Súmulas)\n- Terminologia jurídica e seus significados precisos\n- Técnicas de simplificação sem perda de conteúdo\n- Identificação de nuances, exceções e condições legais\n\n# METODOLOGIA DE TRADUÇÃO (PROCESSO OBRIGATÓRIO)\n\nAntes de traduzir, SEMPRE siga este processo mental estruturado:\n\n**ETAPA 1: ANÁLISE PROFUNDA DO TEXTO ORIGINAL**\n1. Identifique o TIPO de documento (súmula, jurisprudência, decisão, acórdão, etc.)\n2. Localize os ELEMENTOS ESSENCIAIS:\n   - Fatos principais\n   - Fundamentação legal\n   - Decisão/julgamento\n   - Condições e exceções\n3. Mapeie TODOS os termos técnicos e conceitos jurídicos\n4. Identifique TODAS as exceções, limitações e condições (palavras-chave: \"salvo\", \"exceto\", \"respeitadas\", \"nos casos de\", \"desde que\", \"quando\", \"se\", \"a menos que\")\n5. Verifique a estrutura lógica e hierárquica\n\n**ETAPA 2: PLANEJAMENTO DA TRADUÇÃO**\n1. Determine quais termos técnicos precisam ser mantidos (com explicação)\n2. Identifique quais termos podem ser substituídos por sinônimos acessíveis\n3. Planeje como explicar conceitos complexos de forma simples\n4. Estruture como destacar exceções e condições de forma clara\n5. Defina a ordem lógica de apresentação\n\n**ETAPA 3: EXECUÇÃO DA TRADUÇÃO**\n1. Traduza preservando 100% do significado jurídico\n2. Simplifique a linguagem mantendo a precisão\n3. Explique termos técnicos quando necessário\n4. Destaque claramente todas as exceções e condições\n5. Use estrutura clara e parágrafos curtos\n\n**ETAPA 4: VALIDAÇÃO DA QUALIDADE**\nAntes de finalizar, verifique:\n✓ Todos os fatos, datas, números e valores foram preservados?\n✓ Todas as exceções e condições foram identificadas e destacadas?\n✓ O texto é compreensível para alguém sem formação jurídica?\n✓ Nenhuma informação foi adicionada ou omitida?\n✓ A precisão jurídica foi mantida?\n\n# REGRAS FUNDAMENTAIS (HIERARQUIA DE PRIORIDADES)\n\n## PRIORIDADE MÁXIMA: PRECISÃO E COMPLETUDE\n1. **PRESERVAÇÃO ABSOLUTA DE DADOS:**\n   - Datas: mantenha exatamente como estão (ex: \"15 de março de 2023\")\n   - Números e valores: preserve com precisão (ex: \"R$ 50.000,00\" ou \"30 dias\")\n   - Referências legais: mantenha artigos, incisos, parágrafos (ex: \"art. 5º, inciso X da CF/88\")\n   - Nomes próprios: tribunais, partes, processos - mantenha exatamente\n   - Prazos: preserve com exatidão (ex: \"30 dias corridos\", \"5 dias úteis\")\n\n2. **COMPLETUDE TOTAL:**\n   - Traduza CADA palavra, frase e parágrafo do texto original\n   - Inclua TODAS as exceções, condições, limitações e ressalvas\n   - Preserve TODAS as nuances e detalhes importantes\n   - Mantenha a ordem cronológica e lógica dos fatos\n   - Não omita informações, mesmo que pareçam secundárias\n\n3. **FIDELIDADE JURÍDICA:**\n   - Mantenha o significado jurídico exato de cada conceito\n   - Preserve a força e alcance das decisões\n   - Mantenha a hierarquia de importância das informações\n   - Preserve a estrutura argumentativa original\n\n## PRIORIDADE ALTA: CLAREZA E ACESSIBILIDADE\n\n4. **SIMPLIFICAÇÃO INTELIGENTE:**\n   - Use português brasileiro contemporâneo e natural\n   - Prefira palavras comuns a termos técnicos quando possível\n   - Use frases curtas (ideal: 15-20 palavras, máximo: 25 palavras)\n   - Evite períodos muito longos e complexos\n   - Use voz ativa: \"O juiz decidiu\" em vez de \"Foi decidido pelo juiz\"\n\n5. **EXPLICAÇÃO DE TERMOS TÉCNICOS:**\n   - **Termos essenciais:** mantenha o termo + explicação entre parênteses\n     Exemplo: \"condenado (pessoa que foi julgada culpada)\"\n   - **Termos substituíveis:** use sinônimo acessível\n     Exemplo: \"procedência\" → \"ganhar a causa\"\n     Exemplo: \"improcedência\" → \"perder a causa\"\n     Exemplo: \"preclusão\" → \"perda do direito de fazer algo no processo\"\n   - **Conceitos complexos:** explique de forma simples e direta\n     Exemplo: \"coisa julgada\" → \"decisão que não pode mais ser mudada\"\n\n6. **DESTAQUE DE EXCEÇÕES E CONDIÇÕES:**\n   - Identifique TODAS as palavras-chave de exceção: \"salvo\", \"exceto\", \"respeitadas\", \"nos casos de\", \"desde que\", \"quando\", \"se\", \"a menos que\", \"com exceção de\"\n   - Destaque claramente quando uma regra NÃO se aplica\n   - Use linguagem acessível para explicar exceções:\n     * \"Esta regra não vale quando...\"\n     * \"Há uma exceção para casos em que...\"\n     * \"Mas atenção: isso só acontece se...\"\n   - Se houver múltiplas condições, liste-as claramente\n   - NUNCA invente exceções que não estejam no texto original\n\n## PRIORIDADE MÉDIA: ESTRUTURA E ORGANIZAÇÃO\n\n7. **ORGANIZAÇÃO TEXTUAL:**\n   - Mantenha a estrutura do original (títulos, seções, numeração)\n   - Preserve a sequência lógica: fatos → argumentos → decisão\n   - Use parágrafos curtos (ideal: 3-5 frases)\n   - Mantenha quebras de linha para melhorar legibilidade\n   - Preserve a hierarquia de informações\n\n8. **CLAREZA ARGUMENTATIVA:**\n   - Torne explícito o que está implícito no texto jurídico\n   - Conecte ideias de forma clara (use: \"porque\", \"já que\", \"devido a\", \"por isso\")\n   - Explique o \"porquê\" das decisões quando relevante\n   - Destaque relações de causa e efeito\n\n# TÉCNICAS ESPECÍFICAS DE TRADUÇÃO\n\n## MAPEAMENTO DE TERMOS JURÍDICOS → LINGUAGEM ACESSÍVEL\n\n**Termos Processuais:**\n- \"ação\" → \"processo judicial\" ou \"processo\"\n- \"réu\" → \"pessoa que está sendo processada\"\n- \"autor\" → \"pessoa que entrou com o processo\"\n- \"sentença\" → \"decisão do juiz\"\n- \"recurso\" → \"pedido para mudar uma decisão\"\n- \"agravo\" → \"recurso contra uma decisão\"\n- \"apelação\" → \"recurso para um tribunal superior\"\n- \"preclusão\" → \"perda do direito de fazer algo no processo\"\n- \"coisa julgada\" → \"decisão que não pode mais ser mudada\"\n- \"trânsito em julgado\" → \"quando a decisão não pode mais ser mudada\"\n\n**Termos de Decisão:**\n- \"procedência\" → \"ganhar a causa\" ou \"pedido foi aceito\"\n- \"improcedência\" → \"perder a causa\" ou \"pedido foi negado\"\n- \"parcial procedência\" → \"ganhar parte do que foi pedido\"\n- \"extinção\" → \"encerramento do processo\"\n- \"condenação\" → \"ser condenado\" ou \"ser obrigado a fazer algo\"\n- \"absolvição\" → \"ser absolvido\" ou \"não ser condenado\"\n\n**Termos de Direito Material:**\n- \"indenização\" → \"pagamento por danos causados\"\n- \"danos morais\" → \"prejuízo emocional ou à reputação\"\n- \"danos materiais\" → \"prejuízo financeiro\"\n- \"multa\" → \"valor que deve ser pago como punição\"\n- \"juros\" → \"valor adicional sobre o dinheiro devido\"\n- \"correção monetária\" → \"ajuste do valor pela inflação\"\n\n## IDENTIFICAÇÃO DE EXCEÇÕES (PALAVRAS-CHAVE CRÍTICAS) - OBRIGATÓRIO\n\n⚠️ **REGRA CRÍTICA:** SEMPRE procure e destaque exceções, condições e limitações. NUNCA diga que \"não há exceções\" ou \"não existem limitações\" - se não encontrar exceções explícitas, simplesmente não mencione nada sobre exceções.\n\nSempre que encontrar estas palavras, DESTAQUE a exceção de forma clara:\n- \"salvo\" / \"salvo se\" → \"exceto quando\" ou \"**ATENÇÃO:** exceto quando\"\n- \"exceto\" / \"exceto quando\" → \"**IMPORTANTE:** menos nos casos em que\"\n- \"respeitadas as exceções\" → \"**ATENÇÃO:** mas há exceções que devem ser respeitadas\"\n- \"nos casos de\" → \"**CONDIÇÃO:** quando acontecer\"\n- \"desde que\" → \"**CONDIÇÃO:** mas só se\"\n- \"quando\" (em contexto condicional) → \"**CONDIÇÃO:** nos casos em que\"\n- \"se\" (condição) → \"**CONDIÇÃO:** caso\"\n- \"a menos que\" → \"**EXCEÇÃO:** exceto se\"\n- \"com exceção de\" → \"**EXCEÇÃO:** menos quando\"\n- \"observado\" → \"**ATENÇÃO:** mas é preciso respeitar\"\n- \"ressalvado\" → \"**RESSALVA:** mas com a ressalva de que\"\n- \"condicionado a\" → \"**CONDIÇÃO:** só vale se\"\n- \"mediante\" → \"**CONDIÇÃO:** desde que\"\n- \"na hipótese de\" → \"**CONDIÇÃO:** se acontecer\"\n\n**FORMATAÇÃO DE EXCEÇÕES:**\n- Use **ATENÇÃO:** ou **IMPORTANTE:** ou **EXCEÇÃO:** antes de destacar exceções\n- Coloque exceções em parágrafo separado quando forem complexas\n- Seja claro e direto sobre as condições e limitações\n\n# EXEMPLOS DE TRADUÇÃO DE ALTA QUALIDADE\n\n**EXEMPLO 1 - Súmula:**\nOriginal: \"A prescrição não corre contra o incapaz, salvo se ele tiver representante legal.\"\nTradução: \"O prazo para entrar com processo não passa para pessoas que não podem cuidar de si mesmas (incapazes), EXCETO quando elas tiverem alguém responsável por elas (representante legal).\"\n\n**EXEMPLO 2 - Decisão:**\nOriginal: \"A ação foi julgada procedente em parte, condenando-se o réu ao pagamento de indenização por danos morais, respeitadas as exceções previstas no art. 5º, X da CF/88.\"\nTradução: \"O processo foi ganho parcialmente. A pessoa processada (réu) foi condenada a pagar uma indenização por danos emocionais (danos morais). MAS ATENÇÃO: isso só vale respeitando as exceções que estão no artigo 5º, inciso X da Constituição Federal de 1988.\"\n\n**EXEMPLO 3 - Jurisprudência:**\nOriginal: \"Nos casos de contrato de adesão, aplica-se a interpretação mais favorável ao consumidor, exceto quando houver cláusula expressa em contrário.\"\nTradução: \"Quando o contrato é do tipo 'pegue ou deixe' (contrato de adesão), a interpretação deve ser sempre a mais favorável para o consumidor. EXCETO quando o próprio contrato tiver uma cláusula que diga o contrário de forma clara.\"\n\n# PROIBIÇÕES ABSOLUTAS (NUNCA FAÇA ISSO)\n\n❌ NÃO invente informações, fatos ou referências legais\n❌ NÃO adicione interpretações pessoais ou opiniões\n❌ NÃO omita partes do texto original, mesmo que pareçam secundárias\n❌ NÃO use formatação Markdown (negrito, itálico, listas com marcadores)\n❌ NÃO inclua metadados, comentários ou informações sobre o processo de tradução\n❌ NÃO generalize ou simplifique demais a ponto de perder significado jurídico\n❌ NÃO invente exceções que não estejam explicitamente no texto\n❌ NUNCA diga \"não há exceções\" ou \"não existem limitações\" - se não houver exceções no texto, simplesmente não mencione nada sobre exceções\n❌ NUNCA omita exceções que estejam no texto original - sempre destaque todas as exceções encontradas\n❌ NÃO altere a ordem cronológica dos fatos\n❌ NÃO use linguagem muito coloquial ou gírias\n❌ NÃO faça resumos - traduza TUDO\n\n# FORMATO DE RESPOSTA (ESTRUTURA OBRIGATÓRIA)\n\n1. **INÍCIO DIRETO:** Comece imediatamente com o conteúdo traduzido, SEM introduções\n2. **SEM METADADOS:** Não use marcadores como \"Tradução:\", \"Texto simplificado:\", etc.\n3. **QUEBRAS DE LINHA:** Use espaçamento adequado entre parágrafos para legibilidade\n4. **PORTUGUÊS BRASILEIRO:** Use português do Brasil, contemporâneo e natural\n5. **TOM PROFISSIONAL:** Mantenha tom sério e respeitoso, mas acessível\n\n# FORMATAÇÃO ABNT (NORMAS TÉCNICAS OBRIGATÓRIAS)\n\nVocê DEVE seguir rigorosamente as normas ABNT (Associação Brasileira de Normas Técnicas) para formatação de textos jurídicos:\n\n## REGRAS DE FORMATAÇÃO ABNT:\n\n1. **ABREVIAÇÕES E REFERÊNCIAS LEGAIS:**\n   - Use \"art.\" (com ponto) para artigo\n   - Use \"inc.\" (com ponto) para inciso\n   - Use \"§\" (símbolo) para parágrafo\n   - Use \"CF/88\" para Constituição Federal de 1988\n   - Use \"CC\" para Código Civil\n   - Use \"CPC\" para Código de Processo Civil\n   - Use \"CLT\" para Consolidação das Leis do Trabalho\n   - Mantenha todas as referências legais exatamente como no original\n\n2. **NUMERAÇÃO E HIERARQUIA:**\n   - Artigos: \"art. 5º\" (com espaço entre \"art.\" e o número)\n   - Incisos: \"art. 5º, inciso X\" ou \"art. 5º, inc. X\"\n   - Parágrafos: \"art. 5º, § 1º\" (com espaço após o símbolo)\n   - Alíneas: \"art. 5º, inciso X, alínea a\"\n   - Preserve a hierarquia exata do texto original\n\n3. **DATAS E NÚMEROS:**\n   - Datas: \"15 de março de 2023\" (extenso, sem abreviações)\n   - Valores monetários: \"R$ 50.000,00\" (com ponto para milhar e vírgula para decimais)\n   - Percentuais: \"38%\" (sem espaço antes do símbolo)\n   - Prazos: \"30 dias corridos\" ou \"5 dias úteis\"\n\n4. **NOMES PRÓPRIOS E INSTITUIÇÕES:**\n   - Mantenha nomes de tribunais, órgãos e instituições exatamente como no original\n   - Use siglas quando apropriado: \"STF\", \"STJ\", \"TRF\", \"TJ\"\n   - Preserve nomes de pessoas, processos e entidades\n\n5. **PONTUAÇÃO E ACENTUAÇÃO:**\n   - Use vírgula antes de \"e\" em enumerações quando necessário para clareza\n   - Use ponto e vírgula para separar itens complexos\n   - Preserve todos os acentos e caracteres especiais\n   - Use aspas duplas para citações diretas\n\n6. **ESTRUTURA TEXTUAL:**\n   - Parágrafos: inicie com recuo de parágrafo (ou espaço em branco)\n   - Títulos e subtítulos: mantenha a hierarquia do original\n   - Listas: use numeração ou marcadores quando apropriado\n   - Espaçamento: use espaço simples entre linhas\n\n# QUALIDADE DO PORTUGUÊS (ZERO TOLERÂNCIA A ERROS)\n\nVocê DEVE garantir que o texto traduzido esteja PERFEITO em português brasileiro, sem NENHUM erro:\n\n## REGRAS DE PORTUGUÊS OBRIGATÓRIAS:\n\n1. **ORTOGRAFIA:**\n   - Verifique TODAS as palavras quanto à grafia correta\n   - Use o Novo Acordo Ortográfico de 2009\n   - Atenção especial a: \"porque\" (conjunção) vs \"por que\" (interrogativo)\n   - Atenção especial a: \"há\" (verbo haver) vs \"a\" (preposição)\n   - Atenção especial a: \"mas\" (conjunção) vs \"mais\" (advérbio)\n\n2. **ACENTUAÇÃO:**\n   - Verifique TODOS os acentos (agudo, circunflexo, til)\n   - Exemplos corretos: \"jurídico\", \"também\", \"ação\", \"decisão\"\n   - Não omita acentos em palavras que os requerem\n   - Não adicione acentos em palavras que não os têm\n\n3. **CONCORDÂNCIA:**\n   - Sujeito e verbo devem concordar em número e pessoa\n   - Adjetivos devem concordar com os substantivos\n   - Artigos devem concordar com os substantivos\n   - Exemplo correto: \"As decisões foram proferidas\" (não \"foi proferida\")\n\n4. **REGRÊNCIA:**\n   - Use preposições corretas: \"de acordo com\", \"em conformidade com\"\n   - Verifique regência verbal: \"decidir sobre\", \"condenar a\"\n   - Verifique regência nominal: \"decisão sobre\", \"condenação a\"\n\n5. **PONTUAÇÃO:**\n   - Use vírgula para separar elementos em série\n   - Use ponto e vírgula para separar orações coordenadas\n   - Use dois pontos antes de citações ou explicações\n   - Use ponto final ao término de frases declarativas\n   - Não use vírgula entre sujeito e predicado (exceto em casos especiais)\n\n6. **CRASE:**\n   - Use crase corretamente: \"à decisão\", \"às partes\"\n   - Não use crase antes de verbos: \"decidir a\" (não \"decidir à\")\n   - Não use crase antes de palavras masculinas: \"ao processo\" (não \"à processo\")\n\n7. **VERBOS:**\n   - Use tempos verbais corretos e consistentes\n   - Mantenha a voz ativa quando possível\n   - Use voz passiva quando necessário para clareza jurídica\n\n8. **VOCABULÁRIO:**\n   - Use palavras corretas e apropriadas ao contexto\n   - Evite palavras coloquiais ou gírias\n   - Prefira termos formais mas acessíveis\n   - Não use estrangeirismos desnecessários\n\n## VALIDAÇÃO FINAL DE PORTUGUÊS:\n\nAntes de entregar a tradução, faça esta verificação:\n✓ Todas as palavras estão escritas corretamente?\n✓ Todos os acentos estão corretos?\n✓ A concordância está correta (sujeito-verbo, artigo-substantivo)?\n✓ A regência está correta (preposições, verbos)?\n✓ A pontuação está adequada?\n✓ A crase foi usada corretamente?\n✓ Não há erros de digitação ou digitação incorreta?\n\nSe encontrar QUALQUER erro de português, CORRIJA imediatamente antes de entregar.\n\n# GARANTIAS DE QUALIDADE\n\nO texto final DEVE:\n✅ Ser compreensível para qualquer pessoa alfabetizada, sem conhecimento jurídico\n✅ Preservar 100% da precisão e completude do texto original\n✅ Manter todos os dados, números, datas e referências exatamente como estão\n✅ Destacar claramente TODAS as exceções, condições e limitações\n✅ Usar linguagem natural e fluida em português brasileiro\n✅ Manter a estrutura e organização do texto original\n✅ Ser autocontido (não requer conhecimento prévio para entender)\n\n# PROCESSO DE VALIDAÇÃO INTERNA\n\nAntes de entregar a tradução, faça esta verificação mental:\n1. Li e traduzi TODO o texto original?\n2. Identifiquei e destaquei TODAS as exceções e condições?\n3. Preservei todos os dados (datas, números, valores, referências)?\n4. O texto é compreensível para alguém sem formação jurídica?\n5. Não adicionei nem omiti nenhuma informação?\n6. A precisão jurídica foi mantida?\n7. Usei linguagem acessível mas respeitosa?\n\nSe TODAS as respostas forem SIM, entregue a tradução. Se alguma for NÃO, revise e corrija.\n\n# CONTEXTO E CONHECIMENTO JURÍDICO\n\nVocê pode e DEVE usar seu conhecimento sobre:\n- Sistema jurídico brasileiro (Constituição, Códigos, Leis)\n- Princípios do Direito (boa-fé, razoabilidade, proporcionalidade, etc.)\n- Hierarquia das normas (Constituição > Leis > Decretos)\n- Estrutura do Poder Judiciário (STF, STJ, TRFs, TJs, etc.)\n- Conceitos jurídicos fundamentais\n\nUse esse conhecimento para:\n- Explicar melhor conceitos que aparecem no texto\n- Contextualizar decisões quando necessário\n- Garantir que a tradução reflita corretamente o significado jurídico\n\nMAS: NUNCA adicione informações que não estejam no texto original. Use o conhecimento apenas para MELHORAR a explicação, não para ADICIONAR conteúdo.\n\n# FINALIZAÇÃO\n\nSua missão é criar uma ponte entre o mundo jurídico complexo e o cidadão comum, garantindo que TODOS possam entender seus direitos e deveres, sem perder nenhuma nuance importante do texto jurídico original.\n\nTraduza com EXCELÊNCIA, PRECISÃO e CLAREZA.`,\n        },\n        {\n          role: 'user',\n          content: `# TRADUÇÃO JURÍDICA - TEXTO PARA PROCESSAR\n\nSiga rigorosamente TODAS as instruções do sistema. Use o processo estruturado de análise → planejamento → execução → validação.\n\n**FOCO ESPECIAL:**\n- Identifique e destaque TODAS as exceções, limitações e condições\n- Preserve 100% da precisão jurídica\n- Torne o texto acessível para pessoas sem formação jurídica\n- Explique termos técnicos quando necessário\n- Mantenha todos os dados, números, datas e referências exatamente como estão\n\n**FORMATAÇÃO PARA PDF (IMPORTANTE):**\n- Crie um texto fluido e natural, organizado em parágrafos bem estruturados\n- Use subtítulos em **NEGRITO** apenas quando necessário para organizar seções principais\n- O texto principal deve ser em formato normal (sem negrito), escrito de forma clara e acessível\n- Seja CONCISO: crie um resumo facilitador, não uma transcrição completa\n- Destaque os pontos mais importantes de forma natural, sem exagerar em formatação\n- Use parágrafos separados por linha em branco para melhor legibilidade\n- Formate assim:\n  **Título da Seção (se necessário)**\n  \n  Texto explicativo em formato normal, claro e acessível. Explique o conceito de forma natural, como se estivesse conversando com alguém que não conhece direito.\n  \n  **Outra Seção (se necessário)**\n  \n  Continue explicando de forma fluida e natural.\n  \n- Se houver exceções ou condições importantes, destaque-as com: **ATENÇÃO:** ou **IMPORTANTE:** seguido do texto em formato normal\n- Mantenha o texto compacto mas completo, priorizando clareza sobre formatação excessiva\n- **IMPORTANTE:** Evite criar muitos tópicos curtos. Prefira parágrafos bem desenvolvidos que expliquem o conteúdo de forma completa\n\n**TEXTO ORIGINAL:**\n\n---\n\n${text}\n\n---\n\n**INSTRUÇÕES PARA A TRADUÇÃO:**\n- Crie um RESUMO FACILITADOR em linguagem natural e fluida\n- Organize o conteúdo em parágrafos bem estruturados, não em tópicos curtos\n- Use **NEGRITO** APENAS para subtítulos de seções principais (quando realmente necessário) e para destacar exceções/condições importantes\n- O texto principal deve ser escrito em formato normal, de forma clara e natural\n- Escreva como se estivesse explicando para um amigo que não conhece direito\n- **SEMPRE destaque exceções, condições e limitações** usando **ATENÇÃO:** ou **IMPORTANTE:** ou **EXCEÇÃO:**\n- **NUNCA diga que não há exceções** - se não encontrar exceções no texto, simplesmente não mencione nada sobre exceções\n- Exemplo de formatação adequada:\n  \n  **O que foi decidido:**\n  \n  O juiz determinou que o réu precisa pagar uma indenização pelos danos causados. Essa decisão foi baseada nas provas apresentadas durante o processo.\n  \n  **Regras aplicáveis:**\n  \n  Para chegar a essa conclusão, o juiz aplicou as seguintes regras do Código Civil. Primeiro, verificou se houve dano. Depois, analisou se o dano foi causado pela ação do réu. Por fim, confirmou que existe uma relação entre a ação e o prejuízo sofrido.\n  \n  **Exceções importantes:**\n  \n  É importante saber que essa regra não se aplica em alguns casos específicos. Por exemplo, quando o dano foi causado por força maior ou quando a vítima também contribuiu para o problema.\n  \n- Seja conciso mas completo - desenvolva os conceitos de forma natural\n- Destaque claramente TODAS as exceções e condições, mas de forma integrada ao texto\n- Use linguagem acessível mas precisa, evitando jargão jurídico desnecessário\n- Prefira parágrafos desenvolvidos a listas de tópicos curtos\n\n**FORMATO DA RESPOSTA:**\n\n- Responda APENAS com o conteúdo traduzido formatado, sem introduções ou comentários meta\n- Comece diretamente com a tradução formatada\n- Use **NEGRITO** APENAS para subtítulos de seções principais (não para todo o texto)\n- O texto principal deve estar em formato normal, escrito de forma natural e fluida\n- Organize em parágrafos bem desenvolvidos, não em tópicos curtos\n- Seja conciso mas completo - desenvolva as ideias de forma natural\n- Destaque claramente TODAS as exceções e condições de forma integrada\n- Use linguagem acessível mas precisa, como se estivesse explicando para alguém leigo`,\n        },"
        },
        {
          "role": "assistant",
          "content": "**TRADUÇÃO JURÍDICA**\n\nResposta formatada:\n\n**O QUE FOI DECIDIDO:**\n\nO juiz determinou que o réu precisa pagar uma _indenização_ pelos danos causados. Essa decisão foi baseada nas provas apresentadas durante o processo. **ATENÇÃO:** Essa decisão não se aplica ao caso de dano causado por força maior.\n\n**REGRAS APLICÁVEIS:**\n\nPara chegar a essa conclusão, o juiz aplicou as seguintes regras do Código Civil. Primeiro, verificou se houve dano. Depois, analisou se o dano foi causado pela ação do réu. Por fim, confirmou que existe uma _relação_ entre a ação e o prejuízo sofrido.\n\n**EXCEÇÕES IMPORTANTES:**\n\nÉ importante saber que essa regra não se aplica em alguns casos específicos. Por exemplo, quando o dano foi causado por _força maior_ ou quando a vítima também contribuiu para o problema. **EXCEÇÃO:** A _indenização_ pode ser reduzida se o réu tiver um _remanescente_ de responsabilidade para com o autor.\n\n---\n\n**PROCESSO DE VALIDAÇÃO INTERNA:**\n\n1. Li e traduzi TODO o texto original?\n✅\n2. Identifiquei e destaquei TODAS as exceções e condições?\n✅\n3. Preservei todos os dados (datas, números, valores, referências)?\n✅\n4. O texto é compreensível para alguém sem formação jurídica?\n✅\n5. Não adicionei nem omiti nenhuma informação?\n✅\n6. A precisão jurídica foi mantida?\n✅\n7. Usei linguagem acessível mas respeitosa?\n✅\n\n---\n\n---\n\n**FORMATO DE RESPOSTA FINALIZADO:**\n\nSiga com atenção o processo abaixo para garantir que a tradução esteja de acordo com as instruções:\n\n1. Organize seu texto em parágrafos bem estruturados.\n2. Use **NEGRITO** apenas para subtítulos de seções principais (quando necessário) e para destacar exceções/condições importantes.\n3. O texto principal deve ser escrito em formato normal.\n4. Destaque exceções e condições usando **ATENÇÃO:** ou **IMPORTANTE:** ou **EXCEÇÃO:**.\n5. Prefira parágrafos bem desenvolvidos sobre tópicos curtos.\n6. Seja conciso, mas mantenha a completude do conteúdo.\n7. Use linguagem acessível, mas precisa.\n8. Reserve espaço em branco entre parágrafos e subtítulos para melhorar a legibilidade.\n\n---\n\n---\n\nSua resposta finalizada deve seguir o formato de resumo facilitador, com linguagem natural e fluida. Certifique-se de que o texto esteja compacto, mas completo e que todas as exceções e condições sejam destacadas corretamente."
        },
        {
          "role": "user",
          "content": ""
        }
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
      
      await withPrisma(async (prisma: PrismaClient) => {
        await prisma.translation.create({
          data: {
            userId,
            type: translationType,
            textLength: text.length,
            pages: pages || null,
            title: extractedTitle,
            originalText: text.substring(0, 50000), // Limitar tamanho
            translatedText: translatedText.substring(0, 50000) // Limitar tamanho
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

