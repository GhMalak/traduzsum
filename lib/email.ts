import nodemailer from 'nodemailer'

// Configuração do email (ajustar conforme seu provedor)
const getTransporter = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Configurações de SMTP não encontradas. Verifique as variáveis SMTP_USER e SMTP_PASS no .env')
  }

  // Remover aspas se houver (alguns arquivos .env podem ter aspas)
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com')?.trim()?.replace(/^["']|["']$/g, '')
  const smtpPort = parseInt((process.env.SMTP_PORT || '587')?.trim()?.replace(/^["']|["']$/g, '') || '587')
  const smtpUser = process.env.SMTP_USER?.trim()?.replace(/^["']|["']$/g, '') || ''
  const smtpPass = process.env.SMTP_PASS?.trim()?.replace(/^["']|["']$/g, '') || ''

  // Configuração específica para Gmail
  const isGmail = smtpHost.includes('gmail.com')
  
  const transporterConfig: any = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true para 465, false para outras portas
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  }

  // Configurações adicionais para Gmail
  if (isGmail) {
    transporterConfig.service = 'gmail'
    // Gmail requer TLS
    transporterConfig.requireTLS = true
    transporterConfig.tls = {
      rejectUnauthorized: false // Aceitar certificados auto-assinados se necessário
    }
    // Configurações adicionais para melhor compatibilidade
    transporterConfig.connectionTimeout = 10000 // 10 segundos
    transporterConfig.greetingTimeout = 10000
  }

  const transporter = nodemailer.createTransport(transporterConfig)
  
  // Verificar conexão (opcional, mas ajuda a identificar problemas cedo)
  // Comentado para não bloquear se houver problema temporário de rede
  // try {
  //   await transporter.verify()
  //   console.log('✅ Servidor SMTP verificado com sucesso')
  // } catch (verifyError: any) {
  //   console.error('⚠️ Erro ao verificar servidor SMTP:', verifyError.message)
  //   // Continuar mesmo assim - pode funcionar na hora de enviar
  // }
  
  return transporter
}

export async function sendResetPasswordEmail(email: string, resetToken: string): Promise<void> {
  // Validação: email deve ser fornecido
  if (!email || !email.includes('@')) {
    throw new Error('Email inválido fornecido')
  }

  // Remover aspas se houver (alguns arquivos .env podem ter aspas)
  // Tentar NEXT_PUBLIC_SITE_URL primeiro, depois NEXT_PUBLIC_BASE_URL, depois localhost
  let siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
    ?.trim()?.replace(/^["']|["']$/g, '') // Remove aspas simples ou duplas no início/fim
    ?.replace(/\/$/, '') // Remove barra final se houver
  
  // Se não começar com http, adicionar https
  if (siteUrl && !siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
    siteUrl = `https://${siteUrl}`
  }
  
  if (!siteUrl) {
    throw new Error('URL do site não configurada. Configure NEXT_PUBLIC_SITE_URL ou NEXT_PUBLIC_BASE_URL')
  }
  
  const resetUrl = `${siteUrl}/reset-password?token=${resetToken}`
  
  let transporter
  try {
    transporter = await getTransporter()
  } catch (transporterError: any) {
    console.error('❌ Erro ao criar transporter SMTP:', transporterError)
    throw new Error(`Erro na configuração SMTP: ${transporterError.message}`)
  }
  
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
      const isGmail = process.env.SMTP_HOST?.includes('gmail.com')
      let errorMsg = '❌ Erro de autenticação SMTP (535). '
      
      if (isGmail) {
        errorMsg += '\n\n📋 INSTRUÇÕES PARA CORRIGIR:\n\n'
        errorMsg += '1. Ative a autenticação de dois fatores:\n'
        errorMsg += '   → https://myaccount.google.com/security\n\n'
        errorMsg += '2. Gere uma App Password (senha de app):\n'
        errorMsg += '   → https://myaccount.google.com/apppasswords\n'
        errorMsg += '   → Selecione "Email" e "Outro (nome personalizado)"\n'
        errorMsg += '   → Digite "TraduzSum" e clique em "Gerar"\n'
        errorMsg += '   → COPIE a senha de 16 caracteres (SEM espaços)\n\n'
        errorMsg += '3. Configure na Vercel:\n'
        errorMsg += '   → Settings → Environment Variables\n'
        errorMsg += '   → SMTP_PASS = [cole a App Password SEM espaços]\n\n'
        errorMsg += '4. Faça REDEPLOY do projeto\n\n'
        errorMsg += '⚠️ IMPORTANTE: Use a App Password, NÃO a senha normal do Gmail!'
      } else {
        errorMsg += 'Verifique se SMTP_USER e SMTP_PASS estão corretos.'
      }
      
      throw new Error(errorMsg)
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Erro de conexão SMTP. Verifique SMTP_HOST e SMTP_PORT')
    } else {
      throw new Error(`Erro ao enviar email: ${error.message}`)
    }
  }
}

