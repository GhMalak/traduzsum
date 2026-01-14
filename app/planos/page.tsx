'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function PlanosPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [priceIds, setPriceIds] = useState<{
    mensal: string | null
    anual: string | null
    creditos: string | null
  } | null>(null)

  // Buscar Price IDs do Stripe
  useEffect(() => {
    fetch('/api/payment/prices')
      .then(res => res.json())
      .then(data => setPriceIds(data))
      .catch(err => console.error('Erro ao buscar preços:', err))
  }, [])

  const handlePlanClick = async (planName: string) => {
    if (!user) {
      router.push('/login?redirect=/planos')
      return
    }

    if (planName === 'Gratuito') {
      return
    }

    setLoadingPlan(planName)
    setError('')

    try {
      // Aguardar carregamento dos price IDs
      if (!priceIds) {
        const pricesRes = await fetch('/api/payment/prices')
        const prices = await pricesRes.json()
        setPriceIds(prices)
      }

      const currentPriceIds = priceIds || await fetch('/api/payment/prices').then(r => r.json())
      
      let priceId: string | null = null
      if (planName === 'Mensal') {
        priceId = currentPriceIds.mensal
      } else if (planName === 'Anual') {
        priceId = currentPriceIds.anual
      } else if (planName === 'Créditos') {
        priceId = currentPriceIds.creditos
      }
      
      if (!priceId) {
        setError(`Configuração de pagamento para ${planName} ainda não está completa. Verifique as variáveis de ambiente NEXT_PUBLIC_STRIPE_PRICE_*.`)
        setLoadingPlan(null)
        return
      }

      // Buscar token do cookie
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planName,
          priceId: priceId
        }),
        credentials: 'include' // Incluir cookies
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento')
      }

      // Redirecionar para o checkout do Stripe
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error('Erro ao iniciar checkout:', err)
      setError(err.message || 'Erro ao processar pagamento. Tente novamente.')
      setLoadingPlan(null)
    }
  }

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '',
      description: 'Perfeito para experimentar',
      features: [
        '2 traduções simples por dia',
        'Apenas texto colado',
        '❌ Sem upload de PDF',
        'Sem download em PDF',
        'Suporte por email'
      ],
      buttonText: 'Começar agora',
      buttonStyle: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
      popular: false
    },
    {
      name: 'Mensal',
      price: 'R$ 19,90',
      period: '/mês',
      description: 'Ideal para uso regular',
      features: [
        'Traduções ilimitadas',
        'Texto e PDF (até 30 páginas)',
        'Download em PDF',
        'Prioridade no processamento',
        'Suporte prioritário',
        'Sem limites diários'
      ],
      buttonText: 'Assinar agora',
      buttonStyle: 'bg-primary-600 text-white hover:bg-primary-700',
      popular: false
    },
    {
      name: 'Anual',
      price: 'R$ 149,00',
      period: '/ano',
      description: 'Melhor custo-benefício',
      features: [
        'Traduções ilimitadas',
        'Texto e PDF (até 30 páginas)',
        'Download em PDF',
        'Prioridade no processamento',
        'Suporte prioritário',
        'Sem limites diários',
        'Economia de 38%'
      ],
      buttonText: 'Assinar agora',
      buttonStyle: 'bg-primary-600 text-white hover:bg-primary-700',
      popular: true,
      monthlyEquivalent: 'R$ 12,40/mês',
      savings: 'Economize 38%'
    },
    {
      name: 'Créditos',
      price: 'R$ 29,90',
      period: '',
      description: '10 créditos sem validade',
      features: [
        '10 créditos por compra',
        'Sem validade',
        'Texto e PDF (até 30 páginas)',
        'Download em PDF',
        'Use quando precisar',
        '1 crédito = 1 tradução'
      ],
      buttonText: 'Comprar créditos',
      buttonStyle: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Traduz<span className="text-primary-600">Sum</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/planos" className="text-primary-600 font-medium">
              Planos
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">
                  Dashboard
                </Link>
                <span className="text-gray-600">Olá, {user.name.split(' ')[0]}</span>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-primary-600 font-medium"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-primary-600 font-medium">
                  Entrar
                </Link>
                <Link href="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Planos flexíveis para atender suas necessidades. Sistema de pagamento em desenvolvimento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-xl p-8 relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col ${
                plan.popular 
                  ? 'ring-4 ring-primary-500 scale-105 border-2 border-primary-500' 
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${
                  plan.popular 
                    ? 'bg-primary-100 text-primary-700' 
                    : plan.name === 'Gratuito'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-xl text-gray-600">{plan.period}</span>
                    )}
                  </div>
                  {plan.monthlyEquivalent && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700 font-medium">{plan.monthlyEquivalent}</p>
                      <p className="text-xs text-green-600 font-bold mt-1 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {plan.savings}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm font-medium">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => {
                  // "Sem limites diários" e "Sem validade" são features positivas, não negativas
                  const isNegative = feature.includes('❌') || (feature.includes('Sem') && !feature.includes('Sem limites diários') && !feature.includes('Sem validade'))
                  return (
                    <li key={featureIndex} className={`flex items-start p-2 rounded-lg transition-colors ${
                      isNegative ? 'bg-gray-50' : 'hover:bg-blue-50'
                    }`}>
                      {isNegative ? (
                        <svg
                          className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      <span className={`text-sm ${isNegative ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                        {feature.replace('❌', '').trim()}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <button
                className={`w-full py-3.5 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-auto ${plan.buttonStyle}`}
                onClick={() => handlePlanClick(plan.name)}
                disabled={loadingPlan === plan.name || plan.name === 'Gratuito'}
              >
                <span className="flex items-center justify-center gap-2">
                  {loadingPlan === plan.name ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </>
                  ) : (
                    <>
                      {plan.buttonText}
                      {plan.popular && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                    </>
                  )}
                </span>
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  )
}

