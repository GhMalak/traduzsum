import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById, updateUserPlan } from '@/lib/auth'

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

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    const { userId, plan, credits } = await request.json()

    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'userId e plan são obrigatórios' },
        { status: 400 }
      )
    }

    const validPlans = ['Gratuito', 'Mensal', 'Anual', 'Créditos']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    updateUserPlan(userId, plan, credits)

    return NextResponse.json({
      success: true,
      message: 'Plano atualizado com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar plano:', error)
    console.error('Detalhes do erro:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    })
    
    // Verificar se é erro de conexão com banco
    let errorMessage = 'Erro ao atualizar plano'
    if (error?.message?.includes('DATABASE_URL') || error?.message?.includes('database')) {
      errorMessage = 'Erro de conexão com o banco de dados. Verifique a configuração do servidor.'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

