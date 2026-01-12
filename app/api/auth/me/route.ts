import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById } from '@/lib/auth'
import { formatCPF } from '@/lib/cpf'

// Força renderização dinâmica (usa cookies)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const user = await findUserById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: formatCPF(user.cpf),
        plan: user.plan,
        credits: user.credits,
        createdAt: user.createdAt.toISOString()
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error)
    console.error('Detalhes do erro:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    })
    
    // Verificar se é erro de conexão com banco
    let errorMessage = 'Erro ao buscar dados do usuário'
    if (error?.message?.includes('DATABASE_URL') || error?.message?.includes('database')) {
      errorMessage = 'Erro de conexão com o banco de dados. Verifique a configuração do servidor.'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

