import { NextRequest, NextResponse } from 'next/server'

// Força renderização dinâmica (usa cookies)
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth-token')
  return response
}

