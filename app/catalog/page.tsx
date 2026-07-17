'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
      
      const blocksData = await blocksRes.json()
      const productsData = await productsRes.json()
      
      console.log('📦 Catalog blocks:', blocksData)
      console.log('🛍️ Products:', productsData)
      
      setBlocks(blocksData)
      setProducts(productsData)
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredProducts = selectedCategory === 'Все' 
    ? products 
    : products.filter(p => {
        const categoryMap: Record<string, string> = {
          'В кимоно': 'kimonos',
          'Самураи': 'samurai',
          'Ниндзя': 'ninja',
          'Особенные': 'special',
          'Аксессуары': 'accessories'
        }
        return p.category === categoryMap[selectedCategory]
      })

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>
  }

  return (
    <main>
      {blocks.map((block) => {
        const style = block.content_json?.style || {}
        const bgColor = style.background_gradient || style.background_color || '#ffffff'
        const textColor = style.text_color || '#1f2937'
        const accentColor = style.accent_color || '#ec4899'

        // HERO
        if (block.block_type === 'hero') {
          return (
            <section key={block.id} className="py-20 md:py-32 text-center" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{block.title}</h1>
                {block.content_json?.subtitle && (
                  <p className="text-xl opacity-90 max-w-2xl mx-auto">{block.content_json.subtitle}</p>
                )}
              </div>
            </section>
          )
        }

        // FILTERS - Фильтры категорий
        if (block.block_type === 'filters') {
          const categories = block.content_json?.categories || []
          
          return (
            <section key={block.id} className="py-8 sticky top-16 z-10 bg-white/80 backdrop-blur-md" style={{ backgroundColor: bgColor }}>
              <div className="container mx-auto px-4">
                {block.title && <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: textColor }}>{block.title}</h2>}
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((cat: string, i: number) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-3 rounded-full border-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium ${
                        selectedCategory === cat 
                          ? 'bg-pink-500 text-white border-pink-500' 
                          : 'bg-white border-gray-300 hover:border-pink-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        // PRODUCTS_GRID - Сетка товаров
        if (block.block_type === 'products_grid') {
          return (
            <section key={block.id} className="py-16 md:py-24" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="container mx-auto px-4">
                {block.title && <h2 className="text-3xl font-bold mb-12 text-center">{block.title}</h2>}
                
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product: any) => (
                      <Link 
                        key={product.id} 
                        href={`/product/${product.slug || product.id}`}
                        className="block group"
                      >
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl border-2 border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden h-full">
                          {product.image_url ? (
                            <div className="aspect-square overflow-hidden bg-gray-100">
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                              <span className="text-6xl">🐱</span>
                            </div>
                          )}
                          
                          <div className="p-6">
                            <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>
                              {product.name}
                            </h3>
                            {product.description && (
                              <p className="text-sm opacity-80 mb-4 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold" style={{ color: accentColor }}>
                                {product.price} BYN
                              </div>
                              {product.in_stock > 0 ? (
                                <div className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">
                                  ✓ В наличии
                                </div>
                              ) : (
                                <div className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700">
                                  ✗ Нет
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-xl opacity-70">Товары не найдены</p>
                  </div>
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
