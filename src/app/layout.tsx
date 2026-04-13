import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GEDEONES - Centro de Mando',
  description: 'Plataforma de gestion para el Ministerio de Caballeros GEDEONES',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  )
}
