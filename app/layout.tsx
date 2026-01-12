import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TraduzSum - Traduza Jurisprudências e Súmulas',
  description: 'Transforme textos jurídicos complexos em linguagem simples e fácil de entender',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'TraduzSum - Simplificando o direito para todos',
    description: 'Transforme textos jurídicos complexos em linguagem simples e fácil de entender',
    url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://traduzsum.vercel.app',
    siteName: 'TraduzSum',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'TraduzSum - Simplificando o direito para todos',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TraduzSum - Simplificando o direito para todos',
    description: 'Transforme textos jurídicos complexos em linguagem simples e fácil de entender',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

