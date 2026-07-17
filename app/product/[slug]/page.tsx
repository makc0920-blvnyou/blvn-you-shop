'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const { addItem, updateQuantity, items } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [blocks, setBlocks] = useState<any[]>([])
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, blocksRes] = await Promise.all([
          fetch(`/api/products?slug=${slug}`),
          fetch(`/api/blocks?page=product`)
        ])
        const productData = (await productRes.json())[0]
        setProduct(productData)
        setBlocks(await blocksRes.json())

        if (productData?.category) {
          const relRes = await fetch(`/api/products?category=${productData.category}&limit=4`)
          const relData = await relRes.json()
          setRelated(relData.filter((p: any) => p.id !== productData.id).slice(0, 4))
        }
        setLoading(false)
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😿</div>
          <h1 className="text-2xl font-bold mb-4">Котик не найден</h1>
          <Link href="/catalog" className="text-pink-500 hover:underline">← Вернуться в каталог</Link>
        </div>
      </div>
    )
  }

  const images = product.images?.length ? product.images : product.image_url ? [product.image_url] : []
  const characteristicsBlock = blocks.find((b: any) => b.block_type === 'product_characteristics')
  const chars = characteristicsBlock?.content_json || product.characteristics || {}
  const maxStock = product.stock_quantity || product.in_stock || 0

  const handleAddToCart = () => {
    if (!product.in_stock) return
    const existing = items.find(i => i.id === product.id)
    if (existing) {
      updateQuantity(product.id, Math.min(existing.quantity + quantity, maxStock))
      return
    }
    addItem(product)
    setTimeout(() => updateQuantity(product.id, quantity), 0)
  }

  return (
    <main className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <Link href="/catalog" className="inline-flex items-center gap-1 text-pink-500 hover:text-pink-600 mb-6 transition-colors">
          ← Назад в каталог
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* 1. Галерея */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 mb-4 shadow-lg">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">🐱</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImage === i ? 'border-pink-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Информация */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-pink-500">{product.price} BYN</span>
              {product.old_price && (
                <span className="text-lg text-gray-400 line-through">{product.old_price} BYN</span>
              )}
            </div>

            <div className="mb-6">
              {product.in_stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  В наличии: {product.stock_quantity || product.in_stock} шт.
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-medium border border-red-200">✗ Нет в наличии</span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Селектор количества + кнопка */}
            <div className="flex items-stretch gap-4 mb-6">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="w-12 h-12 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">−</button>
                <span className="w-14 h-12 flex items-center justify-center font-semibold text-lg border-x-2 border-gray-200">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} disabled={quantity >= maxStock} className="w-12 h-12 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={!product.in_stock} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                Добавить в корзину
              </button>
            </div>

            {/* Доставка */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 mb-6">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">🚚 Доставка и оплата</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><span>📦</span> По Беларуси — от 4 BYN</div>
                <div className="flex items-center gap-2"><span>🌍</span> В Россию — от 15 BYN</div>
                <div className="flex items-center gap-2"><span>⏱️</span> Срок: 3-10 дней</div>
                <div className="flex items-center gap-2"><span>🏪</span> Самовывоз: Брест</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Описание и Характеристики */}
        <div className="max-w-4xl mx-auto mt-12 md:mt-20 space-y-10">
          {product.description && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                <span className="w-1 h-7 bg-pink-500 rounded-full inline-block" />
                Описание
              </h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
              <span className="w-1 h-7 bg-pink-500 rounded-full inline-block" />
              Характеристики
            </h2>
            {Object.keys(chars).length > 0 ? (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                {Object.entries(chars).map(([key, value], i) => (
                  <div key={key} className={`flex px-6 py-3.5 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <span className="w-1/2 text-gray-500 text-sm">{key}</span>
                    <span className="w-1/2 text-gray-800 text-sm font-medium">{value as string}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-gray-400 text-sm">Характеристики пока не добавлены</p>
              </div>
            )}
          </section>
        </div>

        {/* 4. Похожие товары */}
        {related.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="text-2xl font-bold mb-8 text-gray-900 text-center">Похожие товары</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
              {related.map((item: any) => (
                <Link key={item.id} href={`/product/${item.slug || item.id}`} className="group block">
                  <div className="rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 mb-3 aspect-square shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🐱</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 group-hover:text-pink-500 transition-colors line-clamp-1">{item.name}</h3>
                  <p className="text-pink-500 font-bold text-sm mt-0.5">{item.price} BYN</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
