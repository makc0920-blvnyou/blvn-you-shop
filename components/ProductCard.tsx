'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    price_rub?: number
    image_url: string
    images: string[]
    category: string
    in_stock: boolean
    stock_quantity: number
    slug: string
    created_at: string
  }
  index: number
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addItem } = useCart()
  const { showToast } = useToast()

  if (!product.slug) {
    console.error('Product slug is missing!', product)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.in_stock && product.stock_quantity > 0) {
      addItem(product)
      showToast('Товар добавлен в корзину!', '')
    }
  }

  return (
    <Link
      href={`/product/${product.slug || 'error-no-slug'}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-200 block"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />

        <button
          onClick={handleQuickAdd}
          disabled={!product.in_stock || product.stock_quantity === 0}
          className="absolute bottom-4 right-4 w-12 h-12 bg-blvn-pink text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blvn-pink/90 transition disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <div className="p-4 md:p-6">
        <h3 className="font-nunito font-bold text-lg md:text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blvn-pink transition">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl md:text-2xl font-bold text-blvn-pink">
            {product.price.toFixed(2)} BYN
          </span>
          {product.price_rub && product.price_rub > 0 && (
            <span className="text-sm text-gray-600">
              ~{product.price_rub} RUB
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {product.description}
        </p>

        <div className="text-center">
          <span className="inline-block px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium group-hover:bg-blvn-pink group-hover:text-white transition">
            Подробнее
          </span>
        </div>
      </div>
    </Link>
  )
}
