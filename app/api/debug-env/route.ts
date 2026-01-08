import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasDatabaseUrl = !!process.env.DATABASE_URL
  const databaseUrlPreview = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.substring(0, 40) + '...' 
    : 'NÃO ENCONTRADA'
  
  const allEnvKeys = Object.keys(process.env).filter(k => 
    k.includes('DATABASE') || 
    k.includes('GROQ') || 
    k.includes('JWT') ||
    k.includes('SMTP') ||
    k.includes('SUPABASE')
  )

  return NextResponse.json({
    hasDatabaseUrl,
    databaseUrlPreview,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL ? 'yes' : 'no',
    envKeysFound: allEnvKeys,
    timestamp: new Date().toISOString(),
  }, { 
    headers: {
      'Cache-Control': 'no-store',
    }
  })
}

