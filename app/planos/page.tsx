'use client'

import Link from 'next/link'

export default function PlanosPage() {
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
      popular: true,
      annualPrice: 'R$ 149,00/ano (R$ 12,40/mês)',
      annualSavings: 'Economize 38%'
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
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Traduz<span className="text-primary-600">Sum</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/planos" className="text-primary-600 font-medium">
              Planos
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-primary-600 font-medium">
              Entrar
            </Link>
            <Link href="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">
              Criar conta
            </Link>
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

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
z              className={`bg-white rounded-2xl shadow-xl p-8 relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
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
                  {plan.annualPrice && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700 font-medium">{plan.annualPrice}</p>
                      <p className="text-xs text-green-600 font-bold mt-1 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {plan.annualSavings}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm font-medium">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => {
                  const isNegative = feature.includes('❌') || feature.includes('Sem')
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
                className={`w-full py-3.5 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${plan.buttonStyle}`}
                onClick={() => {
                  alert('Sistema de pagamento em desenvolvimento. Em breve você poderá assinar!')
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  {plan.buttonText}
                  {plan.popular && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-yellow-800 font-semibold mb-2">⚠️ Sistema de Pagamento em Desenvolvimento</p>
            <p className="text-yellow-700 text-sm">
              O sistema de pagamento e assinaturas está sendo desenvolvido. Atualmente, todos os planos são exibidos apenas para visualização.
              Em breve você poderá assinar e fazer pagamentos diretamente pelo site.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  )
}

