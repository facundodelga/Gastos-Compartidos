import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/components/query-provider';
// @ts-ignore: allow importing global CSS without a dedicated type declaration
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Gastos Compartidos - Administrador de Gastos en Grupo',
  description: 'Gestiona gastos compartidos entre grupos de personas con conversión de monedas automática',
  generator: 'Gastos Compartidos',
  icons: {
    icon: [
        {
          url: ' https://cdn-icons-png.freepik.com/512/8312/8312969.png ',
          type: 'image/svg+xml',
        }
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
