import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, generateResetToken, saveResetToken } from '@/lib/auth'
import { sendResetPasswordEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const user = await findUserByEmail(email)

    // Sempre retornar sucesso para não revelar se o email existe
    if (user) {
      const resetToken = generateResetToken()
      saveResetToken(email, resetToken)

      try {
        // Envia email para o endereço pessoal do usuário que solicitou
        await sendResetPasswordEmail(email, resetToken)
        console.log(`Email de recuperação enviado para: ${email}`)
      } catch (emailError: any) {
        console.error('Erro ao enviar email de recuperação:', emailError)
        // Log detalhado para debug
        console.error('Configurações SMTP:', {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER ? 'Configurado' : 'Não configurado',
          pass: process.env.SMTP_PASS ? 'Configurado' : 'Não configurado',
        })
        // Não falha a requisição para não revelar se o email existe
        // Mas loga o erro para debug
      }
    }

    // Sempre retornar sucesso para não revelar se o email existe
    return NextResponse.json({
      success: true,
      message: 'Se o email existir, você receberá um link para redefinir sua senha'
    })
  } catch (error: any) {
    console.error('Erro ao processar recuperação:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

