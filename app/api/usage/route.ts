import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { withPrisma } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Tentar obter token do cookie ou do header Authorization
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

    const userId = decoded.userId

    // Buscar estatísticas de uso do usuário
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stats = await withPrisma(async (prisma: PrismaClient) => {
      // Traduções hoje
      const translationsToday = await prisma.translation.count({
        where: {
          userId,
          createdAt: {
            gte: today
          }
        }
      })

      // Total de traduções
      const totalTranslations = await prisma.translation.count({
        where: { userId }
      })

      // Traduções de texto hoje
      const textTranslationsToday = await prisma.translation.count({
        where: {
          userId,
          type: 'text',
          createdAt: {
            gte: today
          }
        }
      })

      // Traduções de PDF hoje
      const pdfTranslationsToday = await prisma.translation.count({
        where: {
          userId,
          type: 'pdf',
          createdAt: {
            gte: today
          }
        }
      })

      // Buscar informações do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          plan: true,
          credits: true,
          createdAt: true,
          subscriptions: {
            where: {
              status: 'active'
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            select: {
              currentPeriodEnd: true
            }
          }
        }
      })

      return { translationsToday, totalTranslations, textTranslationsToday, pdfTranslationsToday, user }
    })

    const { translationsToday, totalTranslations, textTranslationsToday, pdfTranslationsToday, user } = stats

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Limites baseados no plano
    let dailyLimit = 2 // Gratuito
    if (user.plan === 'Mensal' || user.plan === 'Anual') {
      dailyLimit = Infinity
    } else if (user.plan === 'Créditos') {
      dailyLimit = user.credits || 0
    }

    return NextResponse.json({
      translationsToday,
      totalTranslations,
      textTranslationsToday,
      pdfTranslationsToday,
      dailyLimit,
      plan: user.plan,
      credits: user.credits || 0,
      memberSince: user.createdAt,
      subscriptionEnd: user.subscriptions[0]?.currentPeriodEnd || null
    })
  } catch (error) {
    console.error('Erro ao buscar uso:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas de uso' },
      { status: 500 }
    )
  }
}

