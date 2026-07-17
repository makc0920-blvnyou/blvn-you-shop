'use client'

import { useState, useEffect } from 'react'
import { SiteBlock } from '@/types'

export default function OfferPage() {
  const [blocks, setBlocks] = useState<SiteBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBlocks() {
      try {
        const response = await fetch('/api/blocks?page=offer')
        const data = await response.json()
        setBlocks(data)
        setLoading(false)
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }
    fetchBlocks()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-pink-50/50">
      {sortedBlocks.map(block => {
        if (!block.is_visible) return null

        if (block.block_type === 'hero') {
          return (
            <section key={block.id} className="relative py-16 md:py-24 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 overflow-hidden">
              <div className="absolute top-10 right-10 w-20 h-20 md:w-32 md:h-32 bg-pink-200/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 md:w-40 md:h-40 bg-purple-200/30 rounded-full blur-3xl"></div>

              <div className="container-custom relative z-10 text-center px-4">
                <h1 className="font-nunito font-bold text-3xl md:text-5xl lg:text-6xl text-gray-900 mb-4 md:mb-6 leading-tight">
                  {block.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-700 font-medium">
                  {block.content_json?.subtitle}
                </p>
              </div>
            </section>
          )
        }

        if (block.block_type === 'text_content') {
          return (
            <section key={block.id} className="py-12 md:py-20 bg-white">
              <div className="container-custom max-w-4xl mx-auto px-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-lg">
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {block.content}
                  </div>
                </div>
              </div>
            </section>
          )
        }

        return null
      })}
    </div>
  )
}
