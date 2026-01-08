export async function translateJurisprudence(text: string): Promise<string> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Resposta inválida do servidor')
  }

  const responseText = await response.text()
  if (!responseText.trim()) {
    throw new Error('Resposta vazia do servidor')
  }

  let data
  try {
    data = JSON.parse(responseText)
  } catch (parseError) {
    throw new Error('Erro ao processar resposta do servidor')
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao traduzir')
  }

  return data.result
}

