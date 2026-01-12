import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Price IDs do Stripe - Configure estas variáveis de ambiente
export async function GET() {
  return NextResponse.json({
    mensal: process.env.NEXT_PUBLIC_STRIPE_PRICE_MENSAL || null,
    anual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANUAL || null,
    creditos: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITOS || null
  })
}

