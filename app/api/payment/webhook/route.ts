import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { withPrisma } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Assinatura não fornecida' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Erro ao verificar webhook:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    // Processar eventos relevantes
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          // Assinatura criada
          const subscriptionId = session.subscription as string
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
          const customerId = session.customer as string
          const userId = session.metadata?.userId

          if (!userId) {
            console.error('userId não encontrado no metadata da sessão')
            break
          }

          await withPrisma(async (prisma: PrismaClient) => {
            // Atualizar ou criar assinatura
            await prisma.subscription.upsert({
              where: {
                stripeSubscriptionId: subscriptionId
              },
              update: {
                status: 'active',
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end
              },
              create: {
                userId: userId,
                plan: session.metadata?.plan || 'Mensal',
                status: 'active',
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end
              }
            })

            // Atualizar plano do usuário
            await prisma.user.update({
              where: { id: userId },
              data: {
                plan: session.metadata?.plan || 'Mensal'
              }
            })

            // Atualizar payment
            if (session.id) {
              await prisma.payment.updateMany({
                where: {
                  stripeCheckoutId: session.id
                },
                data: {
                  status: 'completed',
                  stripePaymentId: subscription.latest_invoice as string || null,
                  amount: (session.amount_total || 0) / 100 // Converter de centavos para reais
                }
              })
            }
          })
        } else if (session.mode === 'payment') {
          // Compra única (créditos)
          const userId = session.metadata?.userId
          const plan = session.metadata?.plan

          if (!userId) {
            console.error('userId não encontrado no metadata da sessão')
            break
          }

          await withPrisma(async (prisma: PrismaClient) => {
            // Adicionar créditos
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { credits: true }
            })

            await prisma.user.update({
              where: { id: userId },
              data: {
                credits: {
                  increment: 10 // 10 créditos por compra
                }
              }
            })

            // Atualizar payment
            if (session.id) {
              await prisma.payment.updateMany({
                where: {
                  stripeCheckoutId: session.id
                },
                data: {
                  status: 'completed',
                  stripePaymentId: session.payment_intent as string || null,
                  amount: (session.amount_total || 0) / 100,
                  credits: 10
                }
              })
            }
          })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await withPrisma(async (prisma: PrismaClient) => {
          const sub = await prisma.subscription.findUnique({
            where: {
              stripeSubscriptionId: subscription.id
            }
          })

          if (sub) {
            if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
              await prisma.subscription.update({
                where: { id: sub.id },
                data: {
                  status: 'canceled',
                  cancelAtPeriodEnd: true
                }
              })

              // Reverter plano para Gratuito após período
              if (subscription.status === 'canceled') {
                await prisma.user.update({
                  where: { id: sub.userId },
                  data: {
                    plan: 'Gratuito'
                  }
                })
              }
            } else {
              await prisma.subscription.update({
                where: { id: sub.id },
                data: {
                  status: subscription.status === 'active' ? 'active' : 'expired',
                  currentPeriodStart: new Date(subscription.current_period_start * 1000),
                  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                  cancelAtPeriodEnd: subscription.cancel_at_period_end
                }
              })
            }
          }
        })
        break
      }

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}

