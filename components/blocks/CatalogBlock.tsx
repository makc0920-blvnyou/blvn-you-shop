'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'

interface CatalogBlockProps {
  block: {
    title?: string
    content?: string
    products?: any[]
    background_color?: string
    background_gradient?: string
    text_color?: string
    accent_color?: string
    card_background?: string
    border_color?: string
  }
}

export default function CatalogBlock({ block }: CatalogBlockProps) {
  const [products, setProducts] = useState<any[]>(block.products || [])

  useEffect(() => {
    if (!block.products || block.products.length === 0) {
      fetch('/api/products')
        .then(r => r.json())
        .then(data => setProducts(data.slice(0, 6)))
        .catch(console.error)
    }
  }, [block.products])

  const backgroundStyle = block.background_gradient || block.background_color || '#ffffff'
  const textColor = block.text_color || '#1f2937'
  const accentColor = block.accent_color || '#ec4899'

  return (
    <section
      className="py-16"
      style={{
        backgroundColor: backgroundStyle,
        color: textColor,
        transition: 'all 0.3s ease'
      }}
    >
      <div className="container-custom">
        {block.title && (
          <h2 className="font-bold text-3xl text-center mb-12">
            {block.title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} index={0} />
          ))}
        </div>

        <div className="text-center">
          <a
            href="/catalog"
            className="inline-block px-8 py-3 border-2 rounded-xl font-semibold transition"
            style={{
              borderColor: accentColor,
              color: accentColor
            }}
          >
            Смотреть все →
          </a>
        </div>
      </div>
    </section>
  )
}
