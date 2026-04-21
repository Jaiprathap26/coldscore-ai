import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ColdScore.ai — Know if your cold email is good before you hit send',
  description:
    'Paste your cold email and get an AI-powered score across 6 dimensions in seconds. Includes rewrite suggestions, predicted open & reply rates, and shareable score cards.',
  openGraph: {
    title: 'ColdScore.ai',
    description: 'AI cold email scorer. Know your score before you send.',
    url: 'https://coldscoreai.com',
    siteName: 'ColdScore.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ColdScore.ai',
    description: 'AI cold email scorer — free, instant, no extension needed.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
