'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [translationsToday, setTranslationsToday] = useState(0)
  const [translationsLimit, setTranslationsLimit] = useState(2)
  const [totalTranslations, setTotalTranslations] = useState(0)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loadingUsage, setLoadingUsage] = useState(true)
  const [userCredits, setUserCredits] = useState(0)
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [translations, setTranslations] = useState<any[]>([])
  const [loadingTranslations, setLoadingTranslations] = useState(true)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Buscar dados de uso
  useEffect(() => {
    if (user) {
      fetch('/api/usage')
          .then(res => res.json())
          .then(data => {
            if (data.error) {
              console.error('Erro ao buscar uso:', data.error)
            } else {
              setTranslationsToday(data.translationsToday || 0)
              setTranslationsLimit(data.dailyLimit || 2)
              setTotalTranslations(data.totalTranslations || 0)
              setUserCredits(data.credits || 0)
              if (data.subscriptionEnd) {
                setExpiresAt(data.subscriptionEnd)
              }
              if (data.cancelAtPeriodEnd !== undefined) {
                setCancelAtPeriodEnd(data.cancelAtPeriodEnd)
              }
            }
          })
          .catch(err => {
            console.error('Erro ao buscar estatísticas:', err)
          })
          .finally(() => {
            setLoadingUsage(false)
          })
    }
  }, [user])

  // Buscar traduções do usuário
  useEffect(() => {
    if (user) {
      fetch('/api/translations/list')
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('Erro ao buscar traduções:', data.error)
          } else {
            setTranslations(data.translations || [])
          }
        })
        .catch(err => {
          console.error('Erro ao buscar traduções:', err)
        })
        .finally(() => {
          setLoadingTranslations(false)
        })
    }
  }, [user])

  const handleDownloadAll = async () => {
    setDownloadingAll(true)
    try {
      const response = await fetch('/api/translations/download-all', {
        credentials: 'include'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao preparar download')
      }

      // Importar generatePDF dinamicamente
      const { generatePDF } = await import('@/lib/utils/pdf')
      
      generatePDF({
        title: data.title,
        translatedText: data.translatedText,
        fileName: data.fileName,
        userName: data.userName,
        userCPF: data.userCPF
      })
    } catch (error: any) {
      console.error('Erro ao baixar traduções:', error)
      alert(error.message || 'Erro ao baixar traduções. Tente novamente.')
    } finally {
      setDownloadingAll(false)
    }
  }

  const handleDownloadSingle = async (translationId: string) => {
    setDownloadingId(translationId)
    try {
      const response = await fetch('/api/translations/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ translationId })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao preparar download')
      }
      
      // Importar generatePDF dinamicamente
      const { generatePDF } = await import('@/lib/utils/pdf')
      
      generatePDF({
        title: data.title,
        translatedText: data.translatedText,
        fileName: data.fileName,
        userName: data.userName,
        userCPF: data.userCPF
      })
    } catch (error: any) {
      console.error('Erro ao baixar PDF:', error)
      alert(error.message || 'Erro ao baixar PDF. Tente novamente.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso até o final do período atual, mas não será mais cobrado.')) {
      return
    }

    setCanceling(true)
    try {
      const response = await fetch('/api/payment/cancel-subscription', {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cancelar assinatura')
      }

      // Atualizar estado local
      setCancelAtPeriodEnd(true)
      alert('Assinatura cancelada com sucesso! Você continuará tendo acesso até o final do período atual.')
      
      // Recarregar dados de uso
      const usageResponse = await fetch('/api/usage')
      const usageData = await usageResponse.json()
      if (usageData.subscriptionEnd) {
        setExpiresAt(usageData.subscriptionEnd)
      }
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error)
      alert(error.message || 'Erro ao cancelar assinatura. Tente novamente.')
    } finally {
      setCanceling(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
            Traduz<span className="text-primary-600">Sum</span>
          </Link>
          <div className="flex gap-3 items-center">
            <Link 
              href="/planos" 
              className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium rounded-lg hover:bg-gray-50 transition-all"
            >
              Planos
            </Link>
            {user && (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 text-primary-600 font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-gray-600 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all"
                >
                  Sair
                </button>
              </div>
            )}
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
              {loadingUsage ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Usadas</span>
                      <span>{translationsToday} / {translationsLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min((translationsToday / translationsLimit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.max(translationsLimit - translationsToday, 0)} traduções restantes hoje
                  </p>
                </>
              )}
            </div>
          )}

          {/* Créditos (Plano de Créditos) */}
          {user.plan === 'Créditos' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Seus Créditos</h2>
              {loadingUsage ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                </div>
              ) : (
                <>
                  <div className="text-4xl font-bold text-primary-600 mb-2">{userCredits}</div>
                  <p className="text-sm text-gray-600 mb-4">créditos disponíveis</p>
                  <Link
                    href="/planos"
                    className="block w-full text-center py-2 px-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                  >
                    Comprar Mais
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Assinatura (Mensal/Anual) */}
          {(user.plan === 'Mensal' || user.plan === 'Anual') && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sua Assinatura</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-lg font-semibold ${cancelAtPeriodEnd ? 'text-yellow-600' : 'text-green-600'}`}>
                  {cancelAtPeriodEnd ? 'Cancelamento Agendado' : 'Ativa'}
                </p>
              </div>
              {expiresAt && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Próxima cobrança</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(expiresAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              {cancelAtPeriodEnd ? (
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ Cancelamento agendado
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Sua assinatura será cancelada ao final do período atual. Você continuará tendo acesso até {expiresAt ? new Date(expiresAt).toLocaleDateString('pt-BR') : 'o final do período'}.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                  className="w-full py-2 px-4 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canceling ? 'Cancelando...' : 'Cancelar Assinatura'}
                </button>
              )}
            </div>
          )}

          {/* Estatísticas */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Estatísticas</h2>
            {loadingUsage ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total de traduções</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTranslations}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Membro desde</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Minhas Traduções */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Minhas Traduções</h2>
            {translations.length > 0 && (
              <button
                onClick={handleDownloadAll}
                disabled={downloadingAll}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {downloadingAll ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Baixar Todas ({translations.length})
                  </>
                )}
              </button>
            )}
          </div>
          
          {loadingTranslations ? (
            <div className="animate-pulse space-y-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ) : translations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Você ainda não fez nenhuma tradução</p>
              <Link href="/" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
                Fazer primeira tradução →
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {translations.map((translation) => (
                <div key={translation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {translation.title || 'Tradução Jurídica'}
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(translation.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {translation.type === 'pdf' ? 'PDF' : 'Texto'}
                        </span>
                        {translation.pages && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {translation.pages} páginas
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadSingle(translation.id)}
                      disabled={downloadingId === translation.id}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                      title="Baixar esta tradução como PDF"
                    >
                      {downloadingId === translation.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Baixando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Baixar PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      </div>
    </div>
  )
}

