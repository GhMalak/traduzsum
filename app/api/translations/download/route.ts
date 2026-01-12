import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { withPrisma } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

    const { translationId } = await request.json()

    if (!translationId) {
      return NextResponse.json(
        { error: 'ID da tradução é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar tradução do usuário
    const userData = await withPrisma(async (prisma: PrismaClient) => {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { name: true, cpf: true }
      })
      
      const translation = await prisma.translation.findFirst({
        where: {
          id: translationId,
          userId: decoded.userId // Garantir que é do usuário
        },
        select: {
          id: true,
          title: true,
          translatedText: true,
          createdAt: true
        }
      })

      return { user, translation }
    })

    if (!userData.user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (!userData.translation || !userData.translation.translatedText) {
      return NextResponse.json(
        { error: 'Tradução não encontrada ou sem conteúdo' },
        { status: 404 }
      )
    }

    // Retornar dados para gerar PDF no cliente
    return NextResponse.json({
      success: true,
      title: userData.translation.title || 'Tradução Jurídica',
      translatedText: userData.translation.translatedText,
      fileName: `traducao_${userData.translation.id}`,
      userName: userData.user.name,
      userCPF: userData.user.cpf
    })
  } catch (error: any) {
    console.error('Erro ao preparar download PDF:', error)
    return NextResponse.json(
      { error: 'Erro ao preparar download' },
      { status: 500 }
    )
  }
}

