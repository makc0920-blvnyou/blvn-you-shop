import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AIChatWidget from '@/components/AIChatWidget'
import FloatingSocialButtons from '@/components/FloatingSocialButtons'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'blvn.you — Дофаминовые мелочи для души',
  description: 'Уникальные брелоки-котики ручной работы в кимоно',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="font-nunito">
        <CartProvider>
          <ToastProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <FloatingSocialButtons />
            <AIChatWidget />
            <CookieBanner />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  )
}
