import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById, getAllUsers } from '@/lib/auth'
import { formatCPF } from '@/lib/cpf'

// Força renderização dinâmica
export const dynamic = 'force-dynamic'

// Lista de emails admin
const ADMIN_EMAILS = [
  'admin@traduzsum.com.br',
  'gustavo.calasan@gmail.com',
  // Adicione mais emails admin aqui
]

async function checkAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return false

  const decoded = verifyToken(token)
  if (!decoded) return false

  const user = await findUserById(decoded.userId)
  if (!user) return false

  return ADMIN_EMAILS.includes(user.email.toLowerCase())
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    const users = getAllUsers()

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: formatCPF(user.cpf),
        plan: user.plan,
        credits: user.credits,
        createdAt: user.createdAt.toISOString()
      }))
    })
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}

