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

    const translations = await withPrisma(async (prisma: PrismaClient) => {
      return await prisma.translation.findMany({
        where: {
          userId: decoded.userId
        },
        select: {
          id: true,
          title: true,
          type: true,
          textLength: true,
          pages: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    })

    return NextResponse.json({ translations })
  } catch (error: any) {
    console.error('Erro ao listar traduções:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar traduções' },
      { status: 500 }
    )
  }
}

