import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nos Appartements à Paray le Monial',
  description: 'Appartements de standing à louer à Paray le Monial. Séjours courte durée, tout confort, idéalement situés au cœur de la Bourgogne.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
