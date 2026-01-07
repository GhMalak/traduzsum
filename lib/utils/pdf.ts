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
  let yPosition = margin

  // Cores do site
  const primaryColor: [number, number, number] = [7, 89, 133] // #075985 (primary-800)
  const lightGray: [number, number, number] = [229, 231, 235] // gray-200

  // Logo e cabeçalho
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Título do site
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('TraduzSum', margin, 25)

  // Subtítulo
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Tradução Simplificada de Textos Jurídicos', margin, 32)

  yPosition = 50

  // Data e hora
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.text(`Gerado em: ${dateStr}`, pageWidth - margin, yPosition, { align: 'right' })
  yPosition += 15

  // Título do documento
  const footerSpace = 55 // Espaço reservado para o footer
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(title, maxWidth)
  titleLines.forEach((line: string) => {
    if (yPosition > pageHeight - footerSpace) {
      doc.addPage()
      yPosition = margin
    }
    doc.text(line, margin, yPosition)
    yPosition += 7
  })
  yPosition += 10

  // Texto traduzido
  const footerSpace = 55 // Espaço reservado para o footer
  if (yPosition > pageHeight - footerSpace) {
    doc.addPage()
    yPosition = margin
  }

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.roundedRect(margin, yPosition - 5, maxWidth, 8, 2, 2, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Tradução Simplificada:', margin + 2, yPosition)
  yPosition += 10

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const translatedLines = doc.splitTextToSize(translatedText, maxWidth - 4)
  translatedLines.forEach((line: string) => {
    if (yPosition > pageHeight - footerSpace) {
      doc.addPage()
      yPosition = margin
    }
    doc.text(line, margin + 2, yPosition)
    yPosition += 5
  })

  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages()
  const footerTop = pageHeight - 45
  const footerHeight = 45
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    
    // Fundo do rodapé
    doc.setFillColor(245, 247, 250)
    doc.rect(0, footerTop, pageWidth, footerHeight, 'F')
    
    // Linha superior do rodapé
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2])
    doc.line(0, footerTop, pageWidth, footerTop)
    
    // Lado esquerdo do rodapé
    let leftY = footerTop + 10
    
    // Logo/Título no rodapé
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('TraduzSum', margin, leftY)
    leftY += 6
    
    // Informações do usuário (segurança anti-pirataria)
    if (userName && userCPF) {
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text('Gerado por:', margin, leftY)
      leftY += 4
      doc.setFont('helvetica', 'normal')
      const userInfo = `${userName} | CPF: ${userCPF}`
      const userInfoLines = doc.splitTextToSize(userInfo, pageWidth / 2 - margin - 10)
      userInfoLines.forEach((line: string) => {
        doc.text(line, margin, leftY)
        leftY += 3.5
      })
      leftY += 2
    }
    
    // Informações de segurança
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'italic')
    const securityText = 'Documento confidencial. Uso exclusivo do destinatário.'
    doc.text(securityText, margin, leftY, { maxWidth: pageWidth / 2 - margin - 10 })
    
    // Lado direito do rodapé
    let rightY = footerTop + 10
    
    // Site
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('www.traduzsum.com.br', pageWidth - margin, rightY, { align: 'right' })
    rightY += 6
    
    // Data
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Gerado em ${dateStr}`, pageWidth - margin, rightY, { align: 'right' })
    rightY += 5
    
    // Número da página
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, rightY, { align: 'right' })
  }

  // Salvar PDF
  const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  doc.save(`${safeFileName}_${Date.now()}.pdf`)
}

