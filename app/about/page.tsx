'use client'

import { useState, useEffect } from 'react'

export default function AboutPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBlocks() {
      try {
        const response = await fetch('/api/blocks?page=about')
        const data = await response.json()
        console.log('About blocks:', data)
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
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>
  }

  return (
    <main>
      {blocks.map((block) => {
        const style = block.content_json?.style || {}
        const bgColor = style.background_gradient || style.background_color || '#fdf2f8'
        const textColor = style.text_color || '#1f2937'
        const accentColor = style.accent_color || '#ec4899'

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

        if (block.block_type === 'story') {
          return (
            <section key={block.id} className="py-16 md:py-24" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-bold mb-8 text-center">{block.title}</h2>
                {block.content && (
                  <div className="prose prose-lg max-w-none text-center leading-relaxed">
                    <p className="whitespace-pre-line">{block.content}</p>
                  </div>
                )}
              </div>
            </section>
          )
        }

        if (block.block_type === 'values') {
          const values = Array.isArray(block.content_json) ? block.content_json : []
          return (
            <section key={block.id} className="py-16 md:py-24" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-12 text-center">{block.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {values.map((item: any, i: number) => (
                    <div key={i} className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border-2 border-white/50 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="text-5xl mb-4">{item.icon}</div>
                      <h3 className="text-xl font-bold mb-3" style={{ color: textColor }}>{item.title}</h3>
                      <p className="text-base opacity-90 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        return null
      })}
    </main>
  )
}
