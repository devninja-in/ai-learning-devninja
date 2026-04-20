import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevNinja AI Learning Platform',
  description: 'Interactive educational platform for AI and machine learning concepts',
  keywords: ['ai', 'education', 'nlp', 'machine-learning', 'interactive', 'learning'],
  authors: [{ name: 'DevNinja.in' }],
  openGraph: {
    title: 'DevNinja AI Learning Platform',
    description: 'Interactive educational platform for AI and machine learning concepts',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  )
}