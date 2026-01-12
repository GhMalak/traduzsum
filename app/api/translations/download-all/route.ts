import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { withPrisma } from '@/lib/db'
import { PrismaClient } from '@prisma/client'
import { generatePDF } from '@/lib/utils/pdf'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Buscar usuário para obter nome e CPF
    const userData = await withPrisma(async (prisma: PrismaClient) => {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { name: true, cpf: true }
      })
      
      const translations = await prisma.translation.findMany({
        where: {
          userId: decoded.userId,
          translatedText: { not: null }
        },
        select: {
          title: true,
          translatedText: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return { user, translations }
    })

    if (!userData.user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (!userData.translations || userData.translations.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma tradução encontrada para download' },
        { status: 404 }
      )
    }

    // Criar texto combinado com todas as traduções
    const allTranslationsText = userData.translations
      .map((t, index) => {
        const date = new Date(t.createdAt).toLocaleDateString('pt-BR')
        return `\n\n${'='.repeat(80)}\n\nDOCUMENTO ${index + 1} de ${userData.translations.length}\nTítulo: ${t.title || 'Sem título'}\nData: ${date}\n${'='.repeat(80)}\n\n${t.translatedText || ''}`
      })
      .join('\n\n')

    const title = `Todas as Traduções - ${userData.user.name}`
    
    // Gerar PDF no cliente (retornar dados para o frontend gerar)
    return NextResponse.json({
      success: true,
      title: title,
      translatedText: allTranslationsText,
      fileName: `todas_traducao_${Date.now()}`,
      userName: userData.user.name,
      userCPF: userData.user.cpf,
      count: userData.translations.length
    })
  } catch (error: any) {
    console.error('Erro ao preparar download:', error)
    return NextResponse.json(
      { error: 'Erro ao preparar download' },
      { status: 500 }
    )
  }
}

