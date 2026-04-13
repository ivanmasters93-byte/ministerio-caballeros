import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ministerio de Caballeros',
  description: 'Sistema de gestión ministerial',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
