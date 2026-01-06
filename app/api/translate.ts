export async function translateJurisprudence(text: string): Promise<string> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao traduzir')
  }

  const data = await response.json()
  return data.result
}

