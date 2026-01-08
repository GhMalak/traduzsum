'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
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
            throw new Error('Resposta inválida do servidor. Verifique se o banco de dados está configurado.')
          }
        } else {
          throw new Error('Resposta vazia do servidor. Verifique se o banco de dados está configurado.')
        }
      } else {
        throw new Error('Erro no servidor. Verifique se o banco de dados está configurado.')
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao processar solicitação')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Traduz<span className="text-primary-600">Sum</span>
            </h1>
            <h2 className="text-2xl font-semibold text-gray-800">Recuperar Senha</h2>
            <p className="text-gray-600 mt-2">Digite seu email para receber o link de recuperação</p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-semibold">Email enviado com sucesso!</p>
                    <p className="text-sm mt-2">
                      Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
                      Verifique sua caixa de entrada (e spam).
                    </p>
                    <p className="text-sm mt-2">
                      O link é válido por <strong>1 hora</strong>.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href="/login"
                className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Voltar para login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email cadastrado
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none disabled:opacity-50"
                  placeholder="seu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-primary-600 hover:text-primary-700 text-sm">
              ← Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

