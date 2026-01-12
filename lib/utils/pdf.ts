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
  const footerSpace = 50
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

  // Processar texto linha por linha para identificar títulos
  const lines = translatedText.split('\n')
  const lineHeight = 5
  const titleSpacing = 2
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  for (const line of lines) {
    if (yPosition > pageHeight - footerSpace) {
      doc.addPage()
      yPosition = margin
    }
    
    const trimmed = line.trim()
    
    // Pular linhas vazias
    if (!trimmed) {
      yPosition += lineHeight / 2
      continue
    }
    
    // Remover marcadores markdown, mas preservar estrutura
    let cleanLine = trimmed.replace(/\*\*/g, '').trim()
    
    // Identificar se é um título:
    // - Texto em maiúsculas seguido de dois pontos (ex: "DEFINIÇÃO:", "CONTEÚDO:", "EXCEÇÕES:")
    // - Palavras curtas (até 30 caracteres) em maiúsculas terminando com :
    // - Também verificar se originalmente estava em negrito markdown
    const wasBoldInMarkdown = trimmed.startsWith('**') && trimmed.endsWith('**')
    const isTitle = (
      cleanLine.match(/^[A-ZÁÊÔÇ][A-ZÁÊÔÇ\s]+:$/) !== null || // TUDO MAIÚSCULO seguido de :
      (cleanLine.length <= 30 && cleanLine.endsWith(':') && /^[A-ZÁÊÔÇ]/.test(cleanLine)) || // Título curto em maiúscula terminando com :
      (wasBoldInMarkdown && cleanLine.endsWith(':')) // Estava em negrito e termina com :
    )
    
    if (isTitle) {
      // Título em AZUL e negrito - FORÇAR cor azul
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      // Usar azul (RGB: 59, 130, 246) - blue-500
      doc.setTextColor(59, 130, 246)
      
      const titleLines = doc.splitTextToSize(cleanLine, maxWidth)
      titleLines.forEach((titleLine: string) => {
        if (yPosition > pageHeight - footerSpace) {
          doc.addPage()
          yPosition = margin
          // Garantir cor azul ao criar nova página
          doc.setTextColor(59, 130, 246)
        }
        // FORÇAR cor azul em cada linha do título
        doc.setTextColor(59, 130, 246)
        doc.setFont('helvetica', 'bold')
        doc.text(titleLine, margin, yPosition)
        yPosition += lineHeight
      })
      
      yPosition += titleSpacing
      // Resetar para texto normal (preto)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
    } else {
      // Texto normal em PRETO
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
      
      yPosition += 2
    }
  }

  // Rodapé profissional e completo em todas as páginas
  const totalPages = doc.getNumberOfPages()
  const footerTop = pageHeight - 55
  const footerHeight = 55
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    
    // Fundo do rodapé elegante
    doc.setFillColor(250, 251, 252)
    doc.rect(0, footerTop, pageWidth, footerHeight, 'F')
    
    // Barra superior colorida do rodapé
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, footerTop, pageWidth, 4, 'F')
    
    // Linha divisória sutil
    doc.setDrawColor(primaryLight[0], primaryLight[1], primaryLight[2])
    doc.setLineWidth(0.3)
    doc.line(0, footerTop, pageWidth, footerTop)
    
    // Lado esquerdo do rodapé - Informações da empresa
    let leftY = footerTop + 12
    
    // Logo/Título no rodapé (maior e mais destacado)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('TraduzSum', margin, leftY)
    leftY += 7
    
    // Tagline profissional
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text('Simplificando o direito para todos', margin, leftY)
    leftY += 9
    
    // Informações do cliente (se disponível)
    if (userName && userCPF) {
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(`Cliente: ${userName}`, margin, leftY)
      leftY += 5
      doc.text(`CPF: ${userCPF}`, margin, leftY)
      leftY += 5
    }
    
    // Informações de contato
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('traduzsum.com.br', margin, leftY)
    
    // Lado direito do rodapé - Informações legais e técnicas
    let rightY = footerTop + 12
    
    // Aviso legal
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.text('Documento gerado automaticamente', pageWidth - margin, rightY, { align: 'right' })
    rightY += 5
    doc.text('Tradução simplificada para fins didáticos', pageWidth - margin, rightY, { align: 'right' })
    rightY += 5
    doc.text('Consulte sempre o texto original oficial', pageWidth - margin, rightY, { align: 'right' })
    rightY += 8
    
    // Data de geração
    const now = new Date()
    const genDate = now.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(6)
    doc.text(`Gerado em: ${genDate}`, pageWidth - margin, rightY, { align: 'right' })
    rightY += 5
    
    // Número do documento (se disponível)
    const docNumber = `DOC-${Date.now().toString().slice(-8)}`
    doc.text(`ID: ${docNumber}`, pageWidth - margin, rightY, { align: 'right' })
    
    // Número da página (centralizado na parte inferior, mais destacado)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    const pageText = `${i} / ${totalPages}`
    const pageTextWidth = doc.getTextWidth(pageText)
    doc.text(pageText, (pageWidth - pageTextWidth) / 2, pageHeight - 6)
    
    // Linha decorativa inferior
    doc.setDrawColor(primaryLight[0], primaryLight[1], primaryLight[2])
    doc.setLineWidth(0.5)
    doc.line(margin, pageHeight - 2, pageWidth - margin, pageHeight - 2)
  }

  // Salvar PDF
  const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  doc.save(`${safeFileName}_${Date.now()}.pdf`)
}

