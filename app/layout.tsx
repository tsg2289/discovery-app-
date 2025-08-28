import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Discovery App - Legal Discovery Document Generator',
  description: 'Generate professional discovery documents for litigation cases with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-discovery-light-blue to-discovery-turquoise">
          {children}
        </div>
      </body>
    </html>
  )
}
