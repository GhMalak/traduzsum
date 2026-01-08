import { NextRequest, NextResponse } from 'next/server'
import { validateLogin, generateToken } from '@/lib/auth'

// Força renderização dinâmica (usa cookies)
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await validateLogin(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const token = generateToken(user.id, user.email)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        plan: user.plan,
        credits: user.credits
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias (login persistente)
      path: '/' // Disponível em todo o site
    })

    return response
  } catch (error: any) {
    console.error('Erro no login:', error)
    console.error('Detalhes do erro:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    })
    
    // Verificar se é erro de conexão com banco
    let errorMessage = 'Erro ao fazer login'
    if (error?.message?.includes('DATABASE_URL') || error?.message?.includes('database')) {
      errorMessage = 'Erro de conexão com o banco de dados. Verifique a configuração do servidor.'
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

