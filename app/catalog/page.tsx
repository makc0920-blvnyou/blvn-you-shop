'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import Stickers from '@/components/Stickers'
import { Product } from '@/types'

const categories = [
  { value: 'all', label: 'Все' },
  { value: 'kimonos', label: 'В кимоно' },
  { value: 'special', label: 'Особенные' },
  { value: 'accessories', label: 'Аксессуары' },
]

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5ED] to-background">
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        <div className="relative">
          <Stickers page="catalog" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-nunito font-bold text-3xl md:text-4xl text-text-primary mb-2">
              Каталог котиков
            </h1>
            <p className="text-text-secondary">Выбери своего уникального котика</p>
          </motion.div>
        </div>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2 rounded-button font-nunito font-semibold text-sm transition-all duration-300 ${
                activeCategory === cat.value
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-surface text-text-secondary hover:text-primary hover:bg-primary/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-text-secondary">Загружаем котиков...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😿</div>
            <p className="text-text-secondary text-lg">В этой категории пока нет котиков</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
