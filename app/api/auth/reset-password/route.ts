import { NextRequest, NextResponse } from 'next/server'
import { validateResetToken, updateUserPassword, deleteResetToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const email = await validateResetToken(token)

    if (!email) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    await updateUserPassword(email, password)
    await deleteResetToken(token)

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao redefinir senha' },
      { status: 500 }
    )
  }
}

