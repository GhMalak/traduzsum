'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
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
        throw new Error(data?.error || 'Erro ao fazer login')
      }

      // Atualizar contexto de autenticação
      if (data.user) {
        login(data.user)
      }

      // Redirecionar para dashboard ou home
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.')
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
            <h2 className="text-2xl font-semibold text-gray-800">Entrar</h2>
            <p className="text-gray-600 mt-2">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Esqueceu sua senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Criar conta
              </Link>
            </p>
            <Link href="/" className="mt-4 block text-primary-600 hover:text-primary-700 text-sm">
              ← Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
