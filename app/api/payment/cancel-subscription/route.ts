import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyToken } from '@/lib/auth'
import { withPrisma } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
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

    // Buscar assinatura ativa do usuário
    let subscriptionId: string | null = null

    await withPrisma(async (prisma: PrismaClient) => {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: decoded.userId,
          status: 'active',
          stripeSubscriptionId: { not: null }
        },
        select: {
          stripeSubscriptionId: true
        }
      })

      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error('Nenhuma assinatura ativa encontrada')
      }

      subscriptionId = subscription.stripeSubscriptionId
    })

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 404 }
      )
    }

    // Cancelar assinatura no Stripe (cancelar no final do período)
    const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })

    // Atualizar no banco de dados
    await withPrisma(async (prisma: PrismaClient) => {
      await prisma.subscription.updateMany({
        where: {
          stripeSubscriptionId: subscriptionId
        },
        data: {
          cancelAtPeriodEnd: true
        }
      })
    })

    // Obter data de término do período
    const periodEnd = (stripeSubscription as any).current_period_end
      ? new Date((stripeSubscription as any).current_period_end * 1000)
      : null

    return NextResponse.json({
      success: true,
      message: 'Assinatura será cancelada ao final do período atual',
      cancelAtPeriodEnd: true,
      periodEnd: periodEnd?.toISOString() || null
    })
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao cancelar assinatura' },
      { status: 500 }
    )
  }
}

