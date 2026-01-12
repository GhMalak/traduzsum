'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  cpf: string
  plan: 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos'
  credits?: number
  createdAt: string
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    gratuito: 0,
    mensal: 0,
    anual: 0,
    creditos: 0
  })
  const [adminTranslations, setAdminTranslations] = useState<any[]>([])
  const [loadingTranslations, setLoadingTranslations] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      checkAdmin()
      fetchUsers()
      fetchAdminTranslations()
    }
  }, [user, authLoading, router])

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text()
        if (text.trim()) {
          try {
            const data = JSON.parse(text)
            setIsAdmin(data.isAdmin || false)
            if (!data.isAdmin) {
              router.push('/')
            }
          } catch (parseError) {
            console.error('Erro ao parsear JSON:', parseError)
            router.push('/')
          }
        } else {
          router.push('/')
        }
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Erro ao verificar admin:', error)
      router.push('/')
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text()
          if (text.trim()) {
            try {
              const data = JSON.parse(text)
              setUsers(data.users || [])
              
              // Calcular estatísticas
              const stats = {
                total: data.users?.length || 0,
                gratuito: data.users?.filter((u: User) => u.plan === 'Gratuito').length || 0,
                mensal: data.users?.filter((u: User) => u.plan === 'Mensal').length || 0,
                anual: data.users?.filter((u: User) => u.plan === 'Anual').length || 0,
                creditos: data.users?.filter((u: User) => u.plan === 'Créditos').length || 0
              }
              setStats(stats)
            } catch (parseError) {
              console.error('Erro ao parsear JSON:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminTranslations = async () => {
    try {
      setLoadingTranslations(true)
      const response = await fetch('/api/admin/translations')
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text()
          if (text.trim()) {
            try {
              const data = JSON.parse(text)
              setAdminTranslations(data.translations || [])
            } catch (parseError) {
              console.error('Erro ao parsear JSON:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar traduções:', error)
    } finally {
      setLoadingTranslations(false)
    }
  }

  const updateUserPlan = async (userId: string, newPlan: 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos', credits?: number) => {
    try {
      const response = await fetch('/api/admin/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: newPlan, credits })
      })

      if (response.ok) {
        alert('Plano atualizado com sucesso!')
        fetchUsers()
      } else {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text()
          if (text.trim()) {
            try {
              const data = JSON.parse(text)
              alert(data.error || 'Erro ao atualizar plano')
            } catch (parseError) {
              alert('Erro ao processar resposta do servidor')
            }
          } else {
            alert('Resposta vazia do servidor')
          }
        } else {
          alert('Erro no servidor')
        }
      }
    } catch (error) {
      alert('Erro ao atualizar plano')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Traduz<span className="text-primary-600">Sum</span>
            <span className="ml-2 text-sm text-red-600 font-semibold">ADMIN</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-gray-600 hover:text-primary-600 font-medium">
              Voltar ao Site
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">
              Dashboard
            </Link>
            <span className="text-gray-600">Olá, {user?.name}</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie usuários, planos e estatísticas</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total de Usuários</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-400">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Gratuito</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.gratuito}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Mensal</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.mensal}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Anual</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.anual}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Créditos</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.creditos}</p>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Usuários Cadastrados</h2>
            <p className="text-gray-600 text-sm mt-1">Total: {users.length} usuários</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créditos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastrado em</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.cpf}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.plan === 'Gratuito' ? 'bg-gray-100 text-gray-800' :
                        user.plan === 'Mensal' ? 'bg-green-100 text-green-800' :
                        user.plan === 'Anual' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.credits || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        onChange={(e) => {
                          const newPlan = e.target.value as 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos'
                          const credits = newPlan === 'Créditos' ? 10 : undefined
                          updateUserPlan(user.id, newPlan, credits)
                          e.target.value = user.plan // Reset para não mudar visualmente até confirmar
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        defaultValue={user.plan}
                      >
                        <option value="Gratuito">Gratuito</option>
                        <option value="Mensal">Mensal</option>
                        <option value="Anual">Anual</option>
                        <option value="Créditos">Créditos</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Nenhum usuário cadastrado ainda.
            </div>
          )}
        </div>

        {/* Traduções (Sem Dados Pessoais) */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Todas as Traduções</h2>
            <p className="text-gray-600 text-sm mt-1">
              Total: {adminTranslations.length} traduções (sem dados pessoais - prontas para venda)
            </p>
            <p className="text-primary-600 text-sm mt-2 font-medium">
              💡 Selecione a tradução desejada e clique em "PDF" para baixar
            </p>
          </div>

          {loadingTranslations ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Páginas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminTranslations.map((translation) => (
                    <tr key={translation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {translation.title || 'Sem título'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          translation.type === 'pdf' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {translation.type === 'pdf' ? 'PDF' : 'Texto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {translation.textLength ? `${Math.round(translation.textLength / 1000)}k chars` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {translation.pages || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(translation.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              if (!translation.translatedText) {
                                alert('Esta tradução não possui conteúdo para download')
                                return
                              }
                              
                              try {
                                const response = await fetch('/api/admin/translations/download-pdf', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  credentials: 'include',
                                  body: JSON.stringify({ translationId: translation.id })
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
                              }
                            }}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold shadow-sm hover:shadow-md flex items-center gap-2"
                            disabled={!translation.translatedText}
                            title="Baixar esta tradução como PDF"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Baixar PDF
                          </button>
                          <button
                            onClick={() => {
                              if (!translation.translatedText) {
                                alert('Esta tradução não possui conteúdo para download')
                                return
                              }
                              const blob = new Blob([translation.translatedText], { type: 'text/plain' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `${translation.title || 'traducao'}_${translation.id}.txt`
                              document.body.appendChild(a)
                              a.click()
                              document.body.removeChild(a)
                              URL.revokeObjectURL(url)
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold shadow-sm hover:shadow-md"
                            disabled={!translation.translatedText}
                            title="Baixar esta tradução como TXT"
                          >
                            TXT
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loadingTranslations && adminTranslations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Nenhuma tradução encontrada ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

