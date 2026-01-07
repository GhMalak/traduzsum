import { NextRequest, NextResponse } from 'next/server'
import { createUser, generateToken } from '@/lib/auth'
import { validateCPF } from '@/lib/cpf'

export async function POST(request: NextRequest) {
  try {
    const { name, email, cpf, password } = await request.json()

    if (!name || !email || !cpf || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (!validateCPF(cpf)) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const user = await createUser(name, email, cpf, password)
    const token = generateToken(user.id, user.email)

    // Criar cookie de autenticação
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        plan: user.plan
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })

    return response
  } catch (error: any) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar conta' },
      { status: 400 }
    )
  }
}

