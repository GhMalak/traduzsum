'use client'

import { useState, useRef } from 'react'
import { translateJurisprudence } from './api/translate'

type InputMode = 'text' | 'pdf'

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Por favor, selecione um arquivo PDF')
      return
    }

    setLoading(true)
    setError('')
    setResult('')
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar PDF')
      }

      setText(data.text)
      setInputMode('text')
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o PDF. Por favor, tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim()) {
      setError('Por favor, cole um texto ou envie um PDF')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const translated = await translateJurisprudence(text)
      setResult(translated)
    } catch (err) {
      setError('Erro ao processar o texto. Por favor, tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setText('')
    setResult('')
    setError('')
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Traduz<span className="text-primary-600">Sum</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforme jurisprudências e súmulas complexas em linguagem simples e fácil de entender
          </p>
        </header>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Envie seu texto jurídico
            </h2>

            {/* Mode Selector */}
            <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setInputMode('text')
                  setError('')
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  inputMode === 'text'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                disabled={loading}
              >
                Colar Texto
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('pdf')
                  setError('')
                  fileInputRef.current?.click()
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  inputMode === 'pdf'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                disabled={loading}
              >
                Enviar PDF
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PDF Upload */}
              {inputMode === 'pdf' && (
                <div className="mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <div
                    onClick={() => !loading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      loading
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                    }`}
                  >
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold text-primary-600">Clique para enviar</span> ou arraste um PDF aqui
                    </p>
                    <p className="text-sm text-gray-500">PDF até 10MB</p>
                    {fileName && (
                      <p className="mt-2 text-sm text-primary-600 font-medium">
                        ✓ {fileName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Text Input */}
              <div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    inputMode === 'pdf'
                      ? 'O texto extraído do PDF aparecerá aqui...'
                      : 'Cole aqui a jurisprudência, súmula ou texto jurídico que deseja traduzir...'
                  }
                  className="w-full h-96 p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none text-gray-700 placeholder-gray-400"
                  disabled={loading || inputMode === 'pdf'}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !text.trim()}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Traduzindo...
                    </span>
                  ) : (
                    'Traduzir'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Limpar
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Tradução simplificada
            </h2>
            <div className="h-96 overflow-y-auto p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Processando sua tradução...</p>
                  </div>
                </div>
              ) : result ? (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <svg className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>A tradução aparecerá aqui</p>
                  </div>
                </div>
              )}
            </div>
            {result && (
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Copiar tradução
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>TraduzSum - Simplificando o direito para todos</p>
        </footer>
      </div>
    </div>
  )
}
