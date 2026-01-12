import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { withPrisma } from '@/lib/db'
import { PrismaClient } from '@prisma/client'
import { generatePDF } from '@/lib/utils/pdf'

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

    // Verificar se é admin
    const isAdmin = await withPrisma(async (prisma: PrismaClient) => {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { email: true }
      })
      return user?.email === process.env.ADMIN_EMAIL
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { translationId } = await request.json()

    if (!translationId) {
      return NextResponse.json(
        { error: 'ID da tradução é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar tradução (sem dados pessoais)
    const translation = await withPrisma(async (prisma: PrismaClient) => {
      return await prisma.translation.findUnique({
        where: { id: translationId },
        select: {
          id: true,
          title: true,
          translatedText: true,
          createdAt: true
        }
      })
    })

    if (!translation || !translation.translatedText) {
      return NextResponse.json(
        { error: 'Tradução não encontrada ou sem conteúdo' },
        { status: 404 }
      )
    }

    // Retornar dados para gerar PDF no cliente (sem dados pessoais)
    return NextResponse.json({
      success: true,
      title: translation.title || 'Tradução Jurídica',
      translatedText: translation.translatedText,
      fileName: `traducao_${translation.id}`,
      // Não incluir userName e userCPF para admin
      userName: undefined,
      userCPF: undefined
    })
  } catch (error: any) {
    console.error('Erro ao preparar download PDF admin:', error)
    return NextResponse.json(
      { error: 'Erro ao preparar download' },
      { status: 500 }
    )
  }
}

