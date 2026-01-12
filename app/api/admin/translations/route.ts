import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { withPrisma } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

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

    // Buscar todas as traduções SEM dados pessoais
    const translations = await withPrisma(async (prisma: PrismaClient) => {
      return await prisma.translation.findMany({
        select: {
          id: true,
          title: true,
          type: true,
          textLength: true,
          pages: true,
          originalText: true,
          translatedText: true,
          createdAt: true
          // NÃO incluir userId, user (dados pessoais)
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    })

    return NextResponse.json({ 
      translations,
      total: translations.length
    })
  } catch (error: any) {
    console.error('Erro ao buscar traduções admin:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar traduções' },
      { status: 500 }
    )
  }
}

