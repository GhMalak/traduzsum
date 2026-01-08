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
  const margin = 15
  const maxWidth = pageWidth - 2 * margin
  const footerSpace = 40 // Espaço reservado para o footer (reduzido)
  let yPosition = margin

  // Cores do site
  const primaryColor: [number, number, number] = [7, 89, 133] // #075985 (primary-800)
  const primaryLight: [number, number, number] = [14, 165, 233] // #0ea5e9 (primary-500)
  const lightGray: [number, number, number] = [229, 231, 235] // gray-200
  const accentColor: [number, number, number] = [59, 130, 246] // blue-500

  // Cabeçalho clean e profissional
  const headerHeight = 35
  
  // Fundo branco limpo
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageWidth, headerHeight, 'F')
  
  // Linha divisória sutil na parte inferior
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2])
  doc.setLineWidth(0.5)
  doc.line(0, headerHeight, pageWidth, headerHeight)
  
  // Centralizar logo no header
  yPosition = headerHeight / 2

  // Logo/Título da empresa (centralizado)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  
  // Calcular largura total da logo para centralizar
  const logoText = 'TraduzSum'
  const logoWidth = doc.getTextWidth(logoText)
  const logoX = (pageWidth - logoWidth) / 2
  
  // Parte "Traduz"
  const traducWidth = doc.getTextWidth('Traduz')
  doc.text('Traduz', logoX, yPosition - 2)
  
  // Parte "Sum" em cor diferente para destaque sutil
  doc.setTextColor(primaryLight[0], primaryLight[1], primaryLight[2])
  doc.text('Sum', logoX + traducWidth + 1, yPosition - 2)
  
  // Subtítulo elegante (centralizado)
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const subtitle = 'Tradução Simplificada de Textos Jurídicos'
  const subtitleWidth = doc.getTextWidth(subtitle)
  const subtitleX = (pageWidth - subtitleWidth) / 2
  doc.text(subtitle, subtitleX, yPosition + 5)

  // Data e hora (lado direito, discreto)
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.setTextColor(150, 150, 150)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(dateStr, pageWidth - margin, headerHeight - 5, { align: 'right' })

  yPosition = headerHeight + 12

  // Título do documento (compacto)
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(title, maxWidth)
  titleLines.forEach((line: string) => {
    if (yPosition > pageHeight - footerSpace) {
      doc.addPage()
      yPosition = margin
    }
    doc.text(line, margin, yPosition)
    yPosition += 6
  })
  yPosition += 8

  // Texto traduzido com formatação inteligente
  if (yPosition > pageHeight - footerSpace) {
    doc.addPage()
    yPosition = margin
  }

  // Processar texto para identificar tópicos principais e aplicar formatação
  const processText = (text: string): Array<{ text: string; isBold: boolean; isTitle: boolean }> => {
    const lines = text.split('\n').filter(line => line.trim())
    const processed: Array<{ text: string; isBold: boolean; isTitle: boolean }> = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Identificar títulos/tópicos principais (linhas em negrito que terminam com :)
      const isBoldLine = trimmed.startsWith('**') && trimmed.endsWith('**')
      const hasTitlePattern = trimmed.match(/^\*\*[A-ZÁÊÔÇ][^.!?]*:\*\*$/) !== null || 
                              (trimmed.startsWith('**') && trimmed.includes(':') && trimmed.endsWith('**'))
      
      // Identificar se é um título (termina com : dentro do negrito)
      const isTitleLine = hasTitlePattern || (isBoldLine && trimmed.includes(':'))
      
      // Remover marcadores markdown se houver
      let cleanText = trimmed.replace(/^\*\*|\*\*$/g, '').trim()
      
      // Se o texto não estiver em negrito no markdown, mas deveria estar (segundo as instruções)
      // Considerar tudo em negrito exceto títulos que serão azuis
      const shouldBeBold = !trimmed.startsWith('**') || trimmed.startsWith('**')
      
      processed.push({
        text: cleanText || trimmed,
        isBold: shouldBeBold, // Tudo em negrito por padrão
        isTitle: isTitleLine
      })
    }
    
    return processed
  }

  const processedText = processText(translatedText)
  const lineHeight = 4.5
  const titleSpacing = 2
  const paragraphSpacing = 3

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9.5)
  
  for (const item of processedText) {
    if (yPosition > pageHeight - footerSpace) {
      doc.addPage()
      yPosition = margin
    }
    
    // Aplicar formatação baseada no tipo de linha
    if (item.isTitle) {
      // Tópico principal/título - AZUL e negrito
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      // Usar azul para títulos (accentColor que já está definido como blue-500)
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
      
      const titleLines = doc.splitTextToSize(item.text, maxWidth)
      titleLines.forEach((line: string) => {
        if (yPosition > pageHeight - footerSpace) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += lineHeight
      })
      
      yPosition += titleSpacing
      doc.setFontSize(9.5)
    } else {
      // Resto do texto - NEGRITO (preto)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      
      const boldLines = doc.splitTextToSize(item.text, maxWidth)
      boldLines.forEach((line: string) => {
        if (yPosition > pageHeight - footerSpace) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += lineHeight
      })
      
      yPosition += paragraphSpacing
    }
  }

  // Rodapé em todas as páginas (compacto)
  const totalPages = doc.getNumberOfPages()
  const footerTop = pageHeight - 35
  const footerHeight = 35
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    
    // Fundo do rodapé
    doc.setFillColor(245, 247, 250)
    doc.rect(0, footerTop, pageWidth, footerHeight, 'F')
    
    // Linha superior do rodapé
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2])
    doc.line(0, footerTop, pageWidth, footerTop)
    
    // Lado esquerdo do rodapé (compacto)
    let leftY = footerTop + 8
    
    // Logo/Título no rodapé
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('TraduzSum', margin, leftY)
    leftY += 5
    
    // Informações do usuário (compacto)
    if (userName && userCPF) {
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      // Mostrar CPF completo para identificação e rastreabilidade
      const userInfo = `${userName} | CPF: ${userCPF}`
      doc.text(userInfo, margin, leftY, { maxWidth: pageWidth / 2 - margin - 5 })
    }
    
    // Lado direito do rodapé (compacto)
    let rightY = footerTop + 8
    
    // Número da página
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, rightY, { align: 'right' })
    rightY += 5
    
    // Site
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('traduzsum.com.br', pageWidth - margin, rightY, { align: 'right' })
  }

  // Salvar PDF
  const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  doc.save(`${safeFileName}_${Date.now()}.pdf`)
}

