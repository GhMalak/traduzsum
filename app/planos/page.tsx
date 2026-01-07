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
              className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                plan.popular ? 'ring-4 ring-primary-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                {plan.annualPrice && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{plan.annualPrice}</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">{plan.annualSavings}</p>
                  </div>
                )}
                <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
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
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.buttonStyle}`}
                onClick={() => {
                  alert('Sistema de pagamento em desenvolvimento. Em breve você poderá assinar!')
                }}
              >
                {plan.buttonText}
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

