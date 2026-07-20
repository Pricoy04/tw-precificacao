import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TW Consultoria — Plataforma',
  description: 'Plataforma interna de gestão da TW Consultoria Empresarial',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
