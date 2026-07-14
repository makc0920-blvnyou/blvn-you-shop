'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/utils'
import Button from './ui/Button'
import ProductGallery from './ProductGallery'

interface ProductCardProps {
  product: Product
  index: number
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [showGallery, setShowGallery] = useState(false)
  const imgUrl = product.image_url
  const inStock = product.in_stock
  const hasMultipleImages = product.images && product.images.length > 0

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="bg-surface rounded-card shadow-soft overflow-hidden group hover:shadow-soft-lg transition-all duration-300"
      >
        <div
          className="aspect-square bg-background flex items-center justify-center overflow-hidden relative cursor-pointer"
          onClick={() => setShowGallery(true)}
        >
          {imgUrl ? (
            <Image src={imgUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-6xl opacity-60">🐱</span>
            </div>
          )}
          {hasMultipleImages && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-text-secondary shadow-sm">
              📸 {product.images.length + 1} фото
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-nunito font-bold text-base text-text-primary mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-nunito font-bold text-lg text-primary">
              {formatPrice(product.price)}
            </span>
            <Button
              size="sm"
              onClick={() => {
                addItem(product)
                showToast('Котик добавлен в корзину!', '🐱')
              }}
              disabled={!inStock}
            >
              {inStock ? 'В корзину' : 'Нет в наличии'}
            </Button>
          </div>
        </div>
      </motion.div>

      {showGallery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowGallery(false)}
        >
          <div
            className="bg-surface rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-nunito font-bold text-xl text-text-primary">{product.name}</h3>
              <button
                onClick={() => setShowGallery(false)}
                className="w-8 h-8 rounded-full bg-background hover:bg-gray-200 flex items-center justify-center transition-colors text-text-secondary hover:text-text-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ProductGallery
              mainImage={product.image_url}
              additionalImages={product.images}
              productName={product.name}
            />

            <div className="mt-6 flex items-center gap-4">
              <span className="font-nunito font-bold text-2xl text-primary">
                {formatPrice(product.price)}
              </span>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  addItem(product)
                  showToast('Котик добавлен в корзину!', '🐱')
                  setShowGallery(false)
                }}
                disabled={!inStock}
              >
                {inStock ? 'Добавить в корзину' : 'Нет в наличии'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
