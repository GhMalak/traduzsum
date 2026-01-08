'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  cpf: string
  plan: 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos'
  credits?: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (userData: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há usuário logado ao carregar
    checkAuth()
    
    // Verificar novamente quando a página ganha foco (volta de outra aba)
    const handleFocus = () => {
      checkAuth()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        // Verificar se a resposta tem conteúdo antes de parsear JSON
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text()
          if (text.trim()) {
            try {
              const data = JSON.parse(text)
              if (data.user) {
                setUser(data.user)
              }
            } catch (parseError) {
              console.error('Erro ao parsear JSON:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

