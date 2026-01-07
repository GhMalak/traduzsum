import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById } from '@/lib/auth'

// Força renderização dinâmica
export const dynamic = 'force-dynamic'

// Lista de emails admin (em produção, isso deve vir de um banco de dados)
const ADMIN_EMAILS = [
  'admin@traduzsum.com.br',
  'gustavo.calasan@gmail.com',
  // Adicione mais emails admin aqui
]

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { isAdmin: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { isAdmin: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

    const user = await findUserById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { isAdmin: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase())

    return NextResponse.json({ isAdmin })
  } catch (error: any) {
    console.error('Erro ao verificar admin:', error)
    return NextResponse.json(
      { isAdmin: false, error: 'Erro ao verificar permissões' },
      { status: 500 }
    )
  }
}

