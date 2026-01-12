import jsPDF from 'jspdf'

export interface PDFOptions {
  title: string
  translatedText: string
  fileName?: string
  userName?: string
  userCPF?: string
}

export function generatePDF({ title, translatedText, fileName = 'traducao', userName, userCPF }: PDFOptions) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - 2 * margin
  const footerSpace = 30 // Reduzido para dar mais espaço ao conteúdo
  let yPosition = margin

  // Paleta de cores profissional
  const primaryColor: [number, number, number] = [7, 89, 133] // #075985 (primary-800)
  const primaryLight: [number, number, number] = [14, 165, 233] // #0ea5e9 (primary-500)
  const accentColor: [number, number, number] = [59, 130, 246] // blue-500
  const lightGray: [number, number, number] = [229, 231, 235] // gray-200
  const darkGray: [number, number, number] = [75, 85, 99] // gray-600
  const successColor: [number, number, number] = [34, 197, 94] // green-500

  // Cabeçalho profissional com identidade visual
  const headerHeight = 50
  
  // Fundo do cabeçalho com gradiente sutil
  doc.setFillColor(245, 247, 250)
  doc.rect(0, 0, pageWidth, headerHeight, 'F')
  
  // Barra superior colorida
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, 8, 'F')
  
  // Linha divisória elegante
  doc.setDrawColor(primaryLight[0], primaryLight[1], primaryLight[2])
  doc.setLineWidth(1)
  doc.line(0, headerHeight, pageWidth, headerHeight)
  
  // Logo e identidade visual
  yPosition = 20

  // Logo/Título da empresa (lado esquerdo, maior e mais destacado)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  
  // Parte "Traduz"
  const traducWidth = doc.getTextWidth('Traduz')
  doc.text('Traduz', margin, yPosition)
  
  // Parte "Sum" em cor diferente para destaque
  doc.setTextColor(primaryLight[0], primaryLight[1], primaryLight[2])
  doc.text('Sum', margin + traducWidth + 2, yPosition)
  
  // Subtítulo elegante
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  const subtitle = 'Tradução Simplificada de Textos Jurídicos'
  doc.text(subtitle, margin, yPosition + 6)

  // Informações do documento (lado direito)
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  // Data e hora
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Gerado em: ${dateStr} às ${timeStr}`, pageWidth - margin, yPosition - 2, { align: 'right' })
  
  // Número do documento
  const docNumber = `DOC-${Date.now().toString().slice(-8)}`
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.text(`Documento: ${docNumber}`, pageWidth - margin, yPosition + 4, { align: 'right' })
  
  // Site
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('traduzsum.com.br', pageWidth - margin, yPosition + 8, { align: 'right' })

  yPosition = headerHeight + 15

  // Título do documento com destaque
  // Caixa de destaque para o título
  const titleBoxHeight = 12
  const titleStartY = yPosition
  
  // Fundo sutil para o título
  doc.setFillColor(240, 245, 250)
  doc.rect(margin - 2, titleStartY - 8, maxWidth + 4, titleBoxHeight, 'F')
  
  // Borda esquerda colorida
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(margin - 2, titleStartY - 8, 3, titleBoxHeight, 'F')
  
  // Linha inferior sutil
  doc.setDrawColor(primaryLight[0], primaryLight[1], primaryLight[2])
  doc.setLineWidth(0.5)
  doc.line(margin - 2, titleStartY + titleBoxHeight - 8, pageWidth - margin + 2, titleStartY + titleBoxHeight - 8)
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(title, maxWidth - 5)
  titleLines.forEach((line: string, index: number) => {
    if (yPosition > pageHeight - footerSpace) {
      doc.addPage()
      yPosition = margin
    }
    doc.text(line, margin + 5, yPosition - (titleLines.length - 1) * 6)
    yPosition += 6
  })
  yPosition += 12

  // Texto traduzido - renderização com títulos em azul
  if (yPosition > pageHeight - footerSpace) {
    doc.addPage()
    yPosition = margin
  }

  // Processar texto linha por linha para identificar títulos e exceções
  const lines = translatedText.split('\n')
  const lineHeight = 5.5 // Aumentado para melhor legibilidade
  const titleSpacing = 3
  const paragraphSpacing = 3
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  for (const line of lines) {
    if (yPosition > pageHeight - footerSpace) {
      doc.addPage()
      yPosition = margin
    }
    
    const trimmed = line.trim()
    
    // Pular linhas vazias (mas manter espaçamento)
    if (!trimmed) {
      yPosition += lineHeight / 2
      continue
    }
    
    // Preservar negrito markdown para identificar títulos e exceções
    const hasBold = trimmed.includes('**')
    let cleanLine = trimmed.replace(/\*\*/g, '').trim()
    
    // Identificar se é um título ou exceção:
    // - Texto em maiúsculas seguido de dois pontos
    // - Palavras curtas (até 40 caracteres) terminando com :
    // - Contém palavras-chave: ATENÇÃO, IMPORTANTE, EXCEÇÃO, CONDIÇÃO, RESSALVA
    const wasBoldInMarkdown = trimmed.startsWith('**') && trimmed.endsWith('**')
    const isException = /^(ATENÇÃO|IMPORTANTE|EXCEÇÃO|CONDIÇÃO|RESSALVA):/i.test(cleanLine)
    const isTitle = (
      cleanLine.match(/^[A-ZÁÊÔÇ][A-ZÁÊÔÇ\s]+:$/) !== null ||
      (cleanLine.length <= 40 && cleanLine.endsWith(':') && /^[A-ZÁÊÔÇ]/.test(cleanLine)) ||
      (wasBoldInMarkdown && cleanLine.endsWith(':'))
    )
    
    if (isException) {
      // Exceções em DESTAQUE: vermelho escuro e negrito
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(185, 28, 28) // Vermelho escuro para destaque
      
      const exceptionLines = doc.splitTextToSize(cleanLine, maxWidth)
      exceptionLines.forEach((exceptionLine: string) => {
        if (yPosition > pageHeight - footerSpace) {
          doc.addPage()
          yPosition = margin
          doc.setTextColor(185, 28, 28)
        }
        doc.text(exceptionLine, margin, yPosition)
        yPosition += lineHeight
      })
      
      yPosition += 2
      // Resetar para texto normal
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
    } else if (isTitle) {
      // Título em AZUL e negrito
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(59, 130, 246) // Azul
      
      const titleLines = doc.splitTextToSize(cleanLine, maxWidth)
      titleLines.forEach((titleLine: string) => {
        if (yPosition > pageHeight - footerSpace) {
          doc.addPage()
          yPosition = margin
          doc.setTextColor(59, 130, 246)
        }
        doc.text(titleLine, margin, yPosition)
        yPosition += lineHeight
      })
      
      yPosition += titleSpacing
      // Resetar para texto normal
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
    } else {
      // Texto normal em PRETO - formatação limpa
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      
      const textLines = doc.splitTextToSize(cleanLine, maxWidth)
      textLines.forEach((textLine: string) => {
        if (yPosition > pageHeight - footerSpace) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(textLine, margin, yPosition)
        yPosition += lineHeight
      })
      
      yPosition += paragraphSpacing
    }
  }

  // Rodapé compacto e elegante em todas as páginas
  const totalPages = doc.getNumberOfPages()
  const footerTop = pageHeight - 25 // Reduzido de 55 para 25
  const footerHeight = 25
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    
    // Barra superior colorida do rodapé (mais fina)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, footerTop, pageWidth, 2, 'F')
    
    // Linha divisória sutil
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2])
    doc.setLineWidth(0.3)
    doc.line(margin, footerTop, pageWidth - margin, footerTop)
    
    // Lado esquerdo do rodapé - Logo e site
    let leftY = footerTop + 6
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('TraduzSum', margin, leftY)
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text('traduzsum.com.br', margin + 35, leftY)
    
    // Informações do cliente (se disponível, compacto)
    if (userName && userCPF) {
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(5.5)
      doc.text(`${userName} | CPF: ${userCPF}`, margin, leftY + 4, { maxWidth: pageWidth / 2 - margin })
    }
    
    // Lado direito do rodapé - Data e página
    let rightY = footerTop + 6
    
    const now = new Date()
    const genDate = now.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text(`Gerado em: ${genDate}`, pageWidth - margin, rightY, { align: 'right' })
    
    // Número da página (centralizado na parte inferior)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const pageText = `${i} / ${totalPages}`
    const pageTextWidth = doc.getTextWidth(pageText)
    doc.text(pageText, (pageWidth - pageTextWidth) / 2, pageHeight - 4)
  }

  // Salvar PDF
  const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  doc.save(`${safeFileName}_${Date.now()}.pdf`)
}

