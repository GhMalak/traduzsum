'use client'

import { useState, useRef, useEffect } from 'react'
import { translateJurisprudence } from './api/translate'
import { generatePDF } from '@/lib/utils/pdf'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

type InputMode = 'text' | 'pdf'

const canUploadPDF = (plan: string | null): boolean => {
  return plan !== 'Gratuito' && plan !== null
}

export default function Home() {
  const { user, logout } = useAuth()
  const userPlan = user?.plan || 'Gratuito'
  const userName = user?.name || null
  const userCPF = user?.cpf || null
  const [isAdmin, setIsAdmin] = useState(false)
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Verificar se é admin
  useEffect(() => {
    if (user) {
      fetch('/api/admin/check')
        .then(async (res) => {
          if (res.ok) {
            const contentType = res.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              const text = await res.text()
              if (text.trim()) {
                try {
                  const data = JSON.parse(text)
                  return data
                } catch {
                  return { isAdmin: false }
                }
              }
            }
          }
          return { isAdmin: false }
        })
        .then(data => setIsAdmin(data?.isAdmin || false))
        .catch(() => setIsAdmin(false))
    }
  }, [user])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificar se o plano permite upload de PDF
    if (!canUploadPDF(userPlan)) {
      setError('Upload de PDF não está disponível no plano gratuito. Faça upgrade para usar esta funcionalidade!')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    if (file.type !== 'application/pdf') {
      setError('Por favor, selecione um arquivo PDF')
      return
    }

    setLoading(true)
    setError('')
    setResult('')
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      })

      // Verificar se a resposta é JSON válido antes de parsear
      const contentType = response.headers.get('content-type')
      let data
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text()
        if (text.trim()) {
          try {
            data = JSON.parse(text)
          } catch (parseError) {
            throw new Error('Resposta inválida do servidor')
          }
        } else {
          throw new Error('Resposta vazia do servidor')
        }
      } else {
        throw new Error('Resposta não é JSON válido')
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao processar PDF')
      }

      setText(data.text)
      setInputMode('text')
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o PDF. Por favor, tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim()) {
      setError('Por favor, cole um texto ou envie um PDF')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const translated = await translateJurisprudence(text)
      setResult(translated)
    } catch (err) {
      setError('Erro ao processar o texto. Por favor, tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setText('')
    setResult('')
    setError('')
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
            {user ? (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="px-3 py-2 text-red-600 hover:text-red-700 font-medium rounded-lg hover:bg-red-50 transition-all"
                  >
                    Admin
                  </Link>
                )}
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium rounded-lg hover:bg-gray-50 transition-all"
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
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link 
                  href="/login" 
                  className="px-5 py-2.5 text-primary-600 hover:text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-all border border-primary-200"
                >
                  Entrar
                </Link>
                <Link 
                  href="/register" 
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Criar conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12 mt-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Traduz<span className="text-primary-600">Sum</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforme jurisprudências e súmulas complexas em linguagem simples e fácil de entender
          </p>
        </header>

        {/* Main Content */}
        {!user ? (
          /* Welcome Message for Non-Logged Users */
          <div className="max-w-3xl mx-auto mt-12 mb-8">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-center text-white">
              <div className="mb-6">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Faça login para começar
              </h2>
              <p className="text-lg text-primary-100 mb-8">
                Crie sua conta gratuita ou faça login para traduzir textos jurídicos
              </p>
              <div className="flex gap-4 justify-center">
                <Link 
                  href="/register" 
                  className="px-8 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Criar conta gratuita
                </Link>
                <Link 
                  href="/login" 
                  className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-primary-600 transition-all"
                >
                  Já tenho conta
                </Link>
              </div>
            </div>
            
            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Tradução de Texto</h3>
                <p className="text-sm text-gray-600">Cole textos jurídicos e receba traduções simplificadas</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Upload de PDF</h3>
                <p className="text-sm text-gray-600">Envie PDFs e receba traduções completas (planos pagos)</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Download PDF</h3>
                <p className="text-sm text-gray-600">Baixe suas traduções em formato PDF</p>
              </div>
            </div>
          </div>
        ) : (
          /* Logged User Content */
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Envie seu texto jurídico
                  </h2>
                </div>
                {user && (
                  <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    Plano: <span className="font-semibold text-primary-600">{userPlan}</span>
                  </div>
                )}
              </div>

            {/* Mode Selector */}
            <div className="flex gap-2 mb-6 p-1.5 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setInputMode('text')
                  setError('')
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  inputMode === 'text'
                    ? 'bg-white text-primary-600 shadow-md scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Colar Texto
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!canUploadPDF(userPlan)) {
                    setError('Upload de PDF não está disponível no plano gratuito. Faça upgrade para usar esta funcionalidade!')
                    setInputMode('text')
                    return
                  }
                  setInputMode('pdf')
                  setError('')
                  fileInputRef.current?.click()
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  !canUploadPDF(userPlan)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    : inputMode === 'pdf'
                    ? 'bg-white text-primary-600 shadow-md scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                disabled={loading || !canUploadPDF(userPlan)}
                title={!canUploadPDF(userPlan) ? 'Disponível apenas em planos pagos' : ''}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Enviar PDF
                {!canUploadPDF(userPlan) && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PDF Upload */}
              {inputMode === 'pdf' && canUploadPDF(userPlan) && (
                <div className="mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <div
                    onClick={() => !loading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      loading
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                    }`}
                  >
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold text-primary-600">Clique para enviar</span> ou arraste um PDF aqui
                    </p>
                    <p className="text-sm text-gray-500">PDF até 10MB</p>
                    {fileName && (
                      <p className="mt-2 text-sm text-primary-600 font-medium">
                        ✓ {fileName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Text Input */}
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    inputMode === 'pdf'
                      ? 'O texto extraído do PDF aparecerá aqui...'
                      : 'Cole aqui a jurisprudência, súmula ou texto jurídico que deseja traduzir...'
                  }
                  className="w-full h-96 p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={loading || inputMode === 'pdf' || !user}
                />
                {!user && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center z-10">
                    <div className="text-center p-6">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-gray-600 font-medium mb-3">Faça login para usar esta funcionalidade</p>
                      <Link 
                        href="/login"
                        className="inline-block px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Fazer login
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !text.trim() || !user}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Traduzindo...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Traduzir</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpar
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
                {!canUploadPDF(userPlan) && error.includes('PDF') && (
                  <Link href="/planos" className="block mt-2 text-primary-600 hover:text-primary-700 font-medium underline">
                    Ver planos disponíveis →
                  </Link>
                )}
              </div>
            )}
            {userPlan === 'Gratuito' && (
              <div className="mt-4 relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-xl p-5 shadow-lg">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-5 rounded-full"></div>
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">Plano Gratuito Ativo</h3>
                      <p className="text-blue-100 text-sm mb-4">
                        Você está usando o plano gratuito. Apenas traduções de texto colado estão disponíveis.
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/planos" 
                    className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <span>Fazer Upgrade</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <p className="text-blue-100 text-xs mt-3">
                    ✨ Desbloqueie PDFs, downloads ilimitados e muito mais
                  </p>
                </div>
              </div>
            )}
          </div>

              {/* Output Section */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Tradução simplificada
              </h2>
            </div>
            <div className="h-96 overflow-y-auto p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Processando sua tradução...</p>
                  </div>
                </div>
              ) : result ? (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <svg className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>A tradução aparecerá aqui</p>
                  </div>
                </div>
              )}
            </div>
            {result && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result)
                    // Feedback visual (opcional)
                  }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </button>
                <button
                  onClick={() => {
                    generatePDF({
                      title: 'Tradução Jurídica Simplificada',
                      translatedText: result,
                      fileName: 'traducao',
                      userName: userName || undefined,
                      userCPF: userCPF || undefined
                    })
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Baixar PDF
                </button>
              </div>
            )}
              </div>
            </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>TraduzSum - Simplificando o direito para todos</p>
        </footer>
      </div>
    </div>
  )
}
