'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'

export default function Header() {
  const { totalItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src="/images/logo-flowers.jpg"
              alt="blvn.you"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="32px"
            />
          </div>
          <span className="font-nunito font-bold text-xl text-text-primary">
            blvn<span className="text-primary">.you</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="font-nunito font-semibold text-text-secondary hover:text-blvn-pink transition-colors"
          >
            Главная
          </Link>
          <Link
            href="/catalog"
            className="font-nunito font-semibold text-text-secondary hover:text-blvn-pink transition-colors"
          >
            Каталог
          </Link>
          <Link
            href="/about"
            className="font-nunito font-semibold text-text-secondary hover:text-blvn-pink transition-colors"
          >
            О нас
          </Link>
          <Link
            href="/cart"
            className="relative font-nunito font-semibold text-text-secondary hover:text-blvn-pink transition-colors group"
          >
            <span className="text-2xl hover:scale-110 transition-transform duration-200 block">
              🛒
            </span>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-3 bg-blvn-pink text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-soft"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              <Link href="/" onClick={() => setMenuOpen(false)} className="block font-nunito font-semibold text-text-secondary">
                Главная
              </Link>
              <Link href="/catalog" onClick={() => setMenuOpen(false)} className="block font-nunito font-semibold text-text-secondary">
                Каталог
              </Link>
              <Link href="/about" onClick={() => setMenuOpen(false)} className="block font-nunito font-semibold text-text-secondary">
                О нас
              </Link>
              <Link href="/cart" onClick={() => setMenuOpen(false)} className="block font-nunito font-semibold text-text-secondary">
                Корзина {totalItems > 0 && `(${totalItems})`}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
