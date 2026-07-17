'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/types'

export interface CartItem {
  id: string
  name: string
  price: number
  price_rub?: number
  image_url: string
  quantity: number
  stock_quantity?: number
  in_stock: boolean
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
  totalRub: number
  itemCount: number
  isOutOfStock: (productId: string) => boolean
  isMaxQuantity: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (product: Product) => {
    if (!product.in_stock) {
      return false
    }

    const availableQuantity = product.stock_quantity || 0

    setItems(prev => {
      const existing = prev.find(item => item.id === product.id)

      if (existing) {
        if (existing.quantity >= availableQuantity) {
          return prev
        }

        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, availableQuantity) }
            : item
        )
      }

      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        price_rub: product.price_rub,
        image_url: product.image_url,
        quantity: 1,
        stock_quantity: availableQuantity,
        in_stock: product.in_stock
      }]
    })

    return true
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems(prev => prev.map(item => {
      if (item.id === productId) {
        const availableQuantity = item.stock_quantity || 0

        if (quantity > availableQuantity) {
          return item
        }

        return { ...item, quantity }
      }
      return item
    }))
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalRub = items.reduce((sum, item) => sum + (item.price_rub || 0) * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const isOutOfStock = (productId: string) => {
    const item = items.find(i => i.id === productId)
    return item ? !item.in_stock : false
  }

  const isMaxQuantity = (productId: string) => {
    const item = items.find(i => i.id === productId)
    if (!item) return false

    const availableQuantity = item.stock_quantity || 0
    return item.quantity >= availableQuantity
  }

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      totalRub,
      itemCount,
      isOutOfStock,
      isMaxQuantity
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
