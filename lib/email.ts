import nodemailer from 'nodemailer'

// Configuração do email (ajustar conforme seu provedor)
const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Configurações de SMTP não encontradas. Verifique as variáveis SMTP_USER e SMTP_PASS no .env')
  }

  // Remover aspas se houver (alguns arquivos .env podem ter aspas)
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com')?.trim()?.replace(/^["']|["']$/g, '')
  const smtpPort = parseInt((process.env.SMTP_PORT || '587')?.trim()?.replace(/^["']|["']$/g, '') || '587')
  const smtpUser = process.env.SMTP_USER?.trim()?.replace(/^["']|["']$/g, '') || ''
  const smtpPass = process.env.SMTP_PASS?.trim()?.replace(/^["']|["']$/g, '') || ''

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })
}

export async function sendResetPasswordEmail(email: string, resetToken: string): Promise<void> {
  // Validação: email deve ser fornecido
  if (!email || !email.includes('@')) {
    throw new Error('Email inválido fornecido')
  }

  // Remover aspas se houver (alguns arquivos .env podem ter aspas)
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    ?.trim()?.replace(/^["']|["']$/g, '') // Remove aspas simples ou duplas no início/fim
  const resetUrl = `${siteUrl}/reset-password?token=${resetToken}`
  
  const transporter = getTransporter()
  // Obter SMTP_USER novamente para usar no from
  const smtpUser = process.env.SMTP_USER?.trim()?.replace(/^["']|["']$/g, '') || ''
  
  const mailOptions = {
    from: `"TraduzSum" <${smtpUser}>`,
    to: email, // Email pessoal do usuário que solicitou a recuperação
    subject: 'Recuperação de Senha - TraduzSum',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #075985; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TraduzSum</h1>
            <p>Recuperação de Senha</p>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no TraduzSum.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            <p>Ou copie e cole o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; color: #0ea5e9;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este link é válido por apenas <strong>1 hora</strong></li>
                <li>Se você não solicitou esta recuperação, ignore este email</li>
                <li>Nunca compartilhe este link com ninguém</li>
              </ul>
            </div>
            <p>Se você não solicitou esta recuperação de senha, pode ignorar este email com segurança.</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>TraduzSum - Simplificando o direito para todos</p>
            <p>© ${new Date().getFullYear()} TraduzSum. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Recuperação de Senha - TraduzSum
      
      Olá,
      
      Recebemos uma solicitação para redefinir a senha da sua conta.
      
      Clique no link abaixo para criar uma nova senha:
      ${resetUrl}
      
      Este link é válido por apenas 1 hora.
      
      Se você não solicitou esta recuperação, ignore este email.
      
      TraduzSum
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email de recuperação enviado com sucesso para:', email)
    console.log('Message ID:', info.messageId)
  } catch (error: any) {
    console.error('Erro ao enviar email de recuperação:', error)
    console.error('Detalhes:', {
      email,
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
      errorCode: error.code,
      errorMessage: error.message
    })
    
    // Mensagens de erro mais específicas
    if (error.code === 'EAUTH') {
      throw new Error('Erro de autenticação SMTP. Verifique SMTP_USER e SMTP_PASS')
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Erro de conexão SMTP. Verifique SMTP_HOST e SMTP_PORT')
    } else {
      throw new Error(`Erro ao enviar email: ${error.message}`)
    }
  }
}

