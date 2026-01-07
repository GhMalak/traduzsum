'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('Sistema de login ainda não implementado. Funcionalidade em desenvolvimento.')
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
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Entrar
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

