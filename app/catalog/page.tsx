'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

function safeParse(raw: any): any {
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  return raw || {}
}

export default function CatalogPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [blocksRes, productsRes] = await Promise.all([
        fetch('/api/blocks?page=catalog'),
        fetch('/api/products')
      ])
      setBlocks(await blocksRes.json())
      setProducts(await productsRes.json())
      setLoading(false)
    }
    fetchData()
  }, [])

  const categories = (() => {
    const filtersBlock = blocks.find(b => b.block_type === 'filters')
    if (!filtersBlock) return []
    const raw = safeParse(filtersBlock.content_json)
    return raw.categories || []
  })()

  const categoryMap: Record<string, string> = {
    'В кимоно': 'kimonos',
    'Самураи': 'samurai',
    'Ниндзя': 'ninja',
    'Особенные': 'special',
    'Аксессуары': 'accessories'
  }

  const filteredProducts = selectedCategory === 'Все'
    ? products
    : products.filter(p => p.category === categoryMap[selectedCategory])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" /></div>
  }

  return (
    <main>
      {blocks.map((block) => {
        const raw = safeParse(block.content_json)
        const style = raw.style || {}
        const bgColor = style.background_gradient || style.background_color || '#ffffff'
        const textColor = style.text_color || '#1f2937'
        const accentColor = style.accent_color || '#ec4899'

        if (block.block_type === 'hero') {
          return (
            <section key={block.id} className="relative py-24 md:py-40 overflow-hidden" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-pink-400 blur-3xl" />
                <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-purple-400 blur-3xl" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="container mx-auto px-4 text-center relative z-10"
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">{block.title}</h1>
                {raw.subtitle && (
                  <p className="text-xl md:text-2xl opacity-85 max-w-3xl mx-auto leading-relaxed">{raw.subtitle}</p>
                )}
              </motion.div>
            </section>
          )
        }

        if (block.block_type === 'filters') {
          return (
            <section key={block.id} className="sticky top-16 z-10 py-6 border-b backdrop-blur-xl" style={{ backgroundColor: bgColor + 'e6', color: textColor, borderColor: `${accentColor}20` }}>
              <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  {categories.map((cat: string, i: number) => (
                    <motion.button
                      key={cat}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2.5 rounded-full border-2 text-sm md:text-base font-medium transition-all duration-300 ${
                        selectedCategory === cat
                          ? 'text-white shadow-lg scale-105'
                          : 'hover:-translate-y-0.5 shadow-sm'
                      }`}
                      style={{
                        backgroundColor: selectedCategory === cat ? accentColor : 'transparent',
                        borderColor: selectedCategory === cat ? accentColor : `${textColor}30`,
                        color: selectedCategory === cat ? '#ffffff' : textColor
                      }}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        if (block.block_type === 'products_grid') {
          return (
            <section key={block.id} className="py-16 md:py-24" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="container mx-auto px-4">
                {block.title && (
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold mb-12 text-center"
                  >
                    {block.title}
                  </motion.h2>
                )}

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {filteredProducts.map((product: any, i: number) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                      >
                        <Link href={`/product/${product.slug || product.id}`} className="block group h-full">
                          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden h-full flex flex-col">
                            <div className="aspect-square overflow-hidden bg-gray-100">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                                  <span className="text-6xl">🐱</span>
                                </div>
                              )}
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                              <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-sm opacity-70 mb-4 line-clamp-2 flex-1">
                                  {product.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: `${textColor}15` }}>
                                <div className="text-2xl font-bold" style={{ color: accentColor }}>
                                  {product.price} BYN
                                </div>
                                {product.in_stock > 0 ? (
                                  <div className="text-xs px-3 py-1.5 rounded-full font-medium bg-green-50 text-green-700 border border-green-200">
                                    В наличии
                                  </div>
                                ) : (
                                  <div className="text-xs px-3 py-1.5 rounded-full font-medium bg-red-50 text-red-700 border border-red-200">
                                    Нет в наличии
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="text-6xl mb-4 opacity-50">🔍</div>
                    <p className="text-xl opacity-60">В этой категории пока нет товаров</p>
                  </motion.div>
                )}
              </div>
            </section>
          )
        }

        return null
      })}
    </main>
  )
}
