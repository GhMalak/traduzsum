'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [translationsToday, setTranslationsToday] = useState(1)
  const [translationsLimit, setTranslationsLimit] = useState(2)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const planInfo = {
    Gratuito: {
      name: 'Gratuito',
      features: ['2 traduções por dia', 'Apenas texto'],
      color: 'gray'
    },
    Mensal: {
      name: 'Plano Mensal',
      features: ['Traduções ilimitadas', 'Texto e PDF', 'Download PDF'],
      color: 'primary'
    },
    Anual: {
      name: 'Plano Anual',
      features: ['Traduções ilimitadas', 'Texto e PDF', 'Download PDF'],
      color: 'primary'
    },
    Créditos: {
      name: 'Plano de Créditos',
      features: ['10 créditos disponíveis', 'Sem validade'],
      color: 'blue'
    }
  }

  const currentPlan = planInfo[user.plan]
  const userCredits = user.credits || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Traduz<span className="text-primary-600">Sum</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/planos" className="text-gray-600 hover:text-primary-600 font-medium">
              Planos
            </Link>
            <Link href="/dashboard" className="text-primary-600 font-medium">
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-primary-600 font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo, {user.name}!</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Plano Atual */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Seu Plano</h2>
            <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold mb-4 bg-${currentPlan.color}-600`}>
              {currentPlan.name}
            </div>
            <ul className="space-y-2 mb-6">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/planos"
              className="block w-full text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Alterar Plano
            </Link>
          </div>

          {/* Uso Diário (Gratuito) */}
          {user.plan === 'Gratuito' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Traduções Hoje</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Usadas</span>
                  <span>{translationsToday} / {translationsLimit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all"
                    style={{ width: `${(translationsToday / translationsLimit) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {translationsLimit - translationsToday} traduções restantes hoje
              </p>
            </div>
          )}

          {/* Créditos (Plano de Créditos) */}
          {user.plan === 'Créditos' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Seus Créditos</h2>
              <div className="text-4xl font-bold text-primary-600 mb-2">{userCredits}</div>
              <p className="text-sm text-gray-600 mb-4">créditos disponíveis</p>
              <Link
                href="/planos"
                className="block w-full text-center py-2 px-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
              >
                Comprar Mais
              </Link>
            </div>
          )}

          {/* Assinatura (Mensal/Anual) */}
          {(user.plan === 'Mensal' || user.plan === 'Anual') && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sua Assinatura</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-green-600">Ativa</p>
              </div>
              {expiresAt && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Próxima cobrança</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(expiresAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              <button className="w-full py-2 px-4 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                Cancelar Assinatura
              </button>
            </div>
          )}

          {/* Estatísticas */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Estatísticas</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total de traduções</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Membro desde</p>
                <p className="text-lg font-semibold text-gray-900">Jan 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="font-medium text-gray-900">Nova Tradução</p>
            </Link>
            <Link
              href="/planos"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium text-gray-900">Ver Planos</p>
            </Link>
            <button
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="font-medium text-gray-900">Meu Perfil</p>
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Nota:</strong> O sistema de gerenciamento de planos e estatísticas está em desenvolvimento.
          </p>
        </div>
      </div>
    </div>
  )
}

