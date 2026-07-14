'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-7xl mb-4">🛒</div>
          <h1 className="font-nunito font-bold text-3xl text-text-primary mb-2">
            Корзина пуста
          </h1>
          <p className="text-text-secondary mb-8">
            Но это легко исправить! Загляни в каталог 🐱
          </p>
          <Link href="/catalog">
            <Button size="lg">В каталог</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-nunito font-bold text-3xl text-text-primary mb-8">
          Корзина
        </h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-surface rounded-card shadow-soft p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-card overflow-hidden flex-shrink-0 bg-background">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <span className="text-2xl">🐱</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-nunito font-bold text-text-primary truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {formatPrice(item.price)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  -
                </button>
                <span className="font-nunito font-bold w-8 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  +
                </button>
              </div>
              <div className="text-right w-24">
                <p className="font-nunito font-bold text-primary">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-text-secondary hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>

        <div className="bg-surface rounded-card shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="font-nunito font-bold text-xl text-text-primary">Итого:</span>
            <span className="font-nunito font-bold text-2xl text-primary">
              {formatPrice(totalAmount)}
            </span>
          </div>
          <Link href="/checkout">
            <Button size="lg" fullWidth>
              Оформить заказ
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
