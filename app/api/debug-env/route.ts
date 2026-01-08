import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const allEnvVars = Object.keys(process.env).sort()
    
    // Filtrar variáveis que podem ser sensíveis (mostrar apenas primeiros caracteres)
    const filteredVars: Record<string, string> = {}
    
    allEnvVars.forEach(key => {
      const value = process.env[key] || ''
      // Para variáveis sensíveis, mostrar apenas primeiros caracteres
      if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASS') || key.includes('TOKEN')) {
        filteredVars[key] = value ? `${value.substring(0, 5)}...` : '(vazio)'
      } else {
        // Para outras variáveis, mostrar valor completo (mas limitado a 100 chars)
        filteredVars[key] = value.length > 100 ? value.substring(0, 100) + '...' : value
      }
    })
    
    return NextResponse.json({
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV || 'não definido',
        VERCEL_URL: process.env.VERCEL_URL || 'não definido',
      },
      groqKeys: {
        GROQ_API_KEY: !!process.env.GROQ_API_KEY,
        NEXT_PUBLIC_GROQ_API_KEY: !!process.env.NEXT_PUBLIC_GROQ_API_KEY,
        GROQ_KEY: !!process.env.GROQ_KEY,
      },
      allVariables: filteredVars,
      variablesStartingWithG: allEnvVars.filter(k => k.toUpperCase().startsWith('G')).slice(0, 20),
      totalVariables: allEnvVars.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
