import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'O arquivo deve ser um PDF' },
        { status: 400 }
      )
    }

    // Limitar tamanho do arquivo (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'O arquivo é muito grande. Tamanho máximo: 10MB' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const pdfData = await pdfParse(buffer)
    const text = pdfData.text
    const numPages = pdfData.numpages

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou ser uma imagem.' },
        { status: 400 }
      )
    }

    // Validar limite de 30 páginas para planos pagos
    if (numPages > 30) {
      return NextResponse.json(
        { error: `O PDF tem ${numPages} páginas. O limite máximo é de 30 páginas para planos pagos. Por favor, reduza o tamanho do arquivo ou divida em partes menores.` },
        { status: 400 }
      )
    }

    return NextResponse.json({ text, pages: numPages })
  } catch (error: any) {
    console.error('Erro ao processar PDF:', error)
    return NextResponse.json(
      { error: 'Erro ao processar o PDF. Por favor, tente novamente.' },
      { status: 500 }
    )
  }
}

