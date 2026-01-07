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
        credits: user.credits
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do usuário' },
      { status: 500 }
    )
  }
}

