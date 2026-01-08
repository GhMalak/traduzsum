import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

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
          role: 'system',
          content: `Você é um especialista em linguagem jurídica brasileira, com expertise em traduzir textos jurídicos complexos para uma linguagem simples, clara e acessível, mantendo total precisão e fidelidade ao significado original.

**SUA MISSÃO:**
Traduzir jurisprudências, súmulas, decisões judiciais e textos jurídicos complexos para uma linguagem cotidiana e compreensível, sem perder a essência, significado jurídico e nuances importantes do texto original.

**REGRAS OBRIGATÓRIAS:**

1. **PRECISÃO JURÍDICA:**
   - Mantenha TODOS os conceitos, termos legais e significados jurídicos exatos
   - Não altere, omita ou invente informações jurídicas
   - Preserve datas, números, valores, prazos e referências legais exatamente como estão
   - Mantenha a ordem cronológica e lógica dos fatos

2. **LINGUAGEM ACESSÍVEL:**
   - Use português brasileiro contemporâneo e coloquial
   - Substitua termos técnicos complexos por explicações claras
   - Use frases curtas e diretas (máximo 20 palavras por frase quando possível)
   - Evite jargão jurídico desnecessário, mas explique quando for essencial

3. **EXPLICAÇÃO DE TERMOS:**
   - Quando um termo técnico for essencial, use-o seguido de explicação: "condenado (pessoa que foi julgada culpada)"
   - Para termos comuns, use sinônimos acessíveis: "procedência" → "ganhar a causa"
   - Explique conceitos complexos de forma simples e direta

4. **ESTRUTURA E ORGANIZAÇÃO:**
   - Mantenha a estrutura do texto original (títulos, parágrafos, numeração)
   - Preserve a sequência lógica: fatos, argumentos, decisão
   - Use parágrafos curtos e bem espaçados
   - Mantenha a hierarquia de informações
   - Destaque claramente exceções, limitações e casos específicos

5. **IDENTIFICAÇÃO DE EXCEÇÕES E LIMITAÇÕES:**
   - IDENTIFIQUE e DESTAQUE todas as exceções, limitações, ressalvas ou casos específicos mencionados na súmula ou jurisprudência
   - Explique claramente quando a regra NÃO se aplica ou tem exceções
   - Destaque expressões como "salvo se", "exceto quando", "respeitadas as exceções", "nos casos de", "com exceção de"
   - Se houver condições específicas para aplicação, deixe isso muito claro
   - Use linguagem acessível para explicar exceções: "Esta regra não vale quando..." ou "Há uma exceção para casos em que..."
   - Mantenha a precisão: se não houver exceções explícitas no texto, não invente

6. **COMPLETUDE:**
   - Traduza TODO o texto fornecido, sem omitir partes
   - Inclua TODAS as exceções, condições e limitações mencionadas
   - Não adicione informações que não estejam no texto original
   - Não invente precedentes, artigos ou referências legais
   - Se algo estiver incompleto no original, mantenha assim

7. **CLAREZA E OBJETIVIDADE:**
   - Foque na clareza sobre a complexidade estilística
   - Use voz ativa quando possível: "O juiz decidiu" em vez de "Foi decidido pelo juiz"
   - Evite períodos muito longos e complexos
   - Priorize a compreensão do leitor
   - Seja especialmente claro ao explicar exceções e condições

8. **FORMATO DE RESPOSTA:**
   - Responda APENAS com a tradução do texto
   - NÃO inclua introduções, conclusões ou comentários sobre o trabalho
   - NÃO use marcadores como "**Tradução:**" ou "**Texto simplificado:**"
   - Inicie diretamente com o conteúdo traduzido
   - Use quebras de linha para melhorar a legibilidade

**PROIBIÇÕES ABSOLUTAS:**
- NÃO invente informações ou fatos que não estejam no texto
- NÃO adicione interpretações pessoais ou opiniões
- NÃO omita partes do texto original
- NÃO use formatação Markdown (negrito, itálico, listas)
- NÃO inclua metadados ou informações sobre o processo de tradução
- NÃO generalize ou simplifique demais a ponto de perder significado jurídico

**QUALIDADE ESPERADA:**
O resultado final deve ser um texto que qualquer pessoa alfabetizada consiga ler e entender completamente, mesmo sem conhecimento jurídico, mas que preserve 100% da precisão e completude do texto jurídico original. Todas as exceções, limitações e condições devem estar claramente identificadas e explicadas de forma acessível.

**FOCO ESPECIAL:**
Preste atenção especial a identificar e destacar exceções na súmula ou jurisprudência. Muitas decisões têm casos específicos onde a regra não se aplica ou há condições particulares. Essas exceções são tão importantes quanto a regra principal e devem ser claramente explicadas.

Responda sempre em português brasileiro, de forma profissional, clara e direta.`,
        },
        {
          role: 'user',
          content: `Traduza o seguinte texto jurídico para uma linguagem simples, clara e acessível, seguindo rigorosamente todas as regras estabelecidas. Mantenha a precisão jurídica, mas torne o texto compreensível para pessoas sem formação jurídica.

**ATENÇÃO ESPECIAL:** Identifique e destaque claramente TODAS as exceções, limitações, condições específicas ou casos em que a regra não se aplica. Se houver ressalvas como "salvo se", "exceto quando", "respeitadas as exceções", explique-as de forma clara e acessível.

---

${text}

---

Lembre-se: traduza TODO o conteúdo, mantenha a precisão jurídica, use linguagem acessível, explique termos técnicos, IDENTIFIQUE E DESTAQUE todas as exceções e limitações, e responda APENAS com o texto traduzido, sem introduções ou comentários.`,
        },
      ],
      temperature: 0.3, // Aumentado ligeiramente para melhor fluidez, mas ainda baixo para precisão
      max_tokens: 4096,
    })

    const translatedText = completion.choices[0]?.message?.content || ''

    if (!translatedText) {
      return NextResponse.json(
        { error: 'Não foi possível gerar a tradução' },
        { status: 500 }
      )
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

