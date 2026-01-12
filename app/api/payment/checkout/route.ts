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
    // Verificar autenticação (cookie ou header)
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

    const { plan, priceId } = await request.json()

    if (!plan || !priceId) {
      return NextResponse.json(
        { error: 'Plano e priceId são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar planos
    const validPlans = ['Mensal', 'Anual', 'Créditos']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Buscar ou criar customer no Stripe
    let customerId: string | null = null
    const userEmail = decoded.email

    await withPrisma(async (prisma: PrismaClient) => {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { email: true, subscriptions: { where: { stripeCustomerId: { not: null } }, take: 1 } }
      })

      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      // Se já tem customer ID, usar
      if (user.subscriptions[0]?.stripeCustomerId) {
        customerId = user.subscriptions[0].stripeCustomerId
      } else {
        // Criar novo customer no Stripe
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: decoded.userId
          }
        })
        customerId = customer.id
      }
    })

    if (!customerId) {
      return NextResponse.json(
        { error: 'Erro ao criar/obter cliente' },
        { status: 500 }
      )
    }

    // Criar sessão de checkout
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: plan === 'Créditos' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      success_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/planos?canceled=true`,
      metadata: {
        userId: decoded.userId,
        plan: plan
      }
    }

    if (plan === 'Créditos') {
      // Compra única de créditos
      sessionParams.line_items = [
        {
          price: priceId,
          quantity: 1
        }
      ]
    } else {
      // Assinatura mensal ou anual
      sessionParams.line_items = [
        {
          price: priceId,
          quantity: 1
        }
      ]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Salvar payment pendente
    await withPrisma(async (prisma: PrismaClient) => {
      await prisma.payment.create({
        data: {
          userId: decoded.userId,
          type: plan === 'Créditos' ? 'credits' : 'subscription',
          amount: 0, // Será atualizado no webhook
          status: 'pending',
          stripeCheckoutId: session.id,
          plan: plan === 'Créditos' ? null : plan,
          credits: plan === 'Créditos' ? 10 : null
        }
      })
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Erro ao criar checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar sessão de pagamento' },
      { status: 500 }
    )
  }
}

