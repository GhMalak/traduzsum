import { NextRequest, NextResponse } from 'next/server'
import { createUser, generateToken } from '@/lib/auth'
import { validateCPF } from '@/lib/cpf'

// Força renderização dinâmica (usa cookies)
export const dynamic = 'force-dynamic'

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

    // Verificar se o domínio do email é permitido
    const allowedDomains = [
      'gmail.com',
      'hotmail.com',
      'outlook.com',
      'yahoo.com',
      'yahoo.com.br',
      'live.com',
      'msn.com',
      'icloud.com',
      'me.com',
      'mac.com',
      'uol.com.br',
      'bol.com.br',
      'terra.com.br',
      'ig.com.br',
      'globo.com',
      'globo.com.br',
    ]

    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (!emailDomain || !allowedDomains.includes(emailDomain)) {
      return NextResponse.json(
        { error: 'Apenas emails de provedores conhecidos são aceitos (Gmail, Hotmail, Outlook, Yahoo, etc.)' },
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
      maxAge: 60 * 60 * 24 * 30, // 30 dias (login persistente)
      path: '/' // Disponível em todo o site
    })

    return response
  } catch (error: any) {
    console.error('Erro no registro:', error)
    console.error('Detalhes do erro:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    })
    
    // Verificar se é erro de conexão com banco
    let errorMessage = error.message || 'Erro ao criar conta'
    if (error?.message?.includes('DATABASE_URL') || error?.message?.includes('database')) {
      errorMessage = 'Erro de conexão com o banco de dados. Verifique a configuração do servidor.'
    } else if (error?.message?.includes('Email já está em uso')) {
      errorMessage = 'Este email já está cadastrado'
    } else if (error?.message?.includes('CPF já está em uso')) {
      errorMessage = 'Este CPF já está cadastrado'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}

