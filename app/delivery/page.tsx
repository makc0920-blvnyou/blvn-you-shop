'use client'

import { useState, useEffect } from 'react'

export default function DeliveryPage() {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBlocks() {
      try {
        const response = await fetch('/api/blocks?page=delivery')
        const data = await response.json()
        console.log(' Delivery blocks:', data)
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
      {blocks.map((block: any) => {
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

        // METHODS - Способы доставки
        if (block.block_type === 'methods') {
          let methods = []
          if (Array.isArray(block.content_json)) {
            methods = block.content_json
          } else if (typeof block.content_json === 'string') {
            try {
              methods = JSON.parse(block.content_json)
            } catch (e) {
              console.error('Error parsing methods:', e)
            }
          }
          
          console.log(' Methods data:', methods)

          return (
            <section key={block.id} className="py-16 md:py-24" style={{ backgroundColor: bgColor || '#fdf2f8', color: textColor }}>
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: textColor }}>{block.title}</h2>
                
                {methods.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {methods.map((method: any, i: number) => (
                      <div key={i} className="p-6 rounded-2xl bg-white/70 backdrop-blur-md border-2 border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="text-4xl mb-3">{method.icon || ''}</div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: textColor }}>{method.name}</h3>
                        <p className="text-sm opacity-80 mb-3">{method.description}</p>
                        <div className="pt-3 border-t border-gray-200 space-y-1">
                          <div className="text-sm flex items-center gap-2">
                            <span>⏱️</span>
                            <span>{method.time}</span>
                          </div>
                          <div className="text-sm font-semibold" style={{ color: accentColor }}>
                             {method.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Данные о способах доставки загружаются...</p>
                )}
              </div>
            </section>
          )
        }

        // FAQ - Частые вопросы
        if (block.block_type === 'faq') {
          let faqs = []
          if (Array.isArray(block.content_json)) {
            faqs = block.content_json
          } else if (typeof block.content_json === 'string') {
            try {
              faqs = JSON.parse(block.content_json)
            } catch (e) {
              console.error('Error parsing FAQs:', e)
            }
          }
          
          console.log(' FAQs data:', faqs)

          return (
            <section key={block.id} className="py-16 md:py-24" style={{ backgroundColor: bgColor || '#ffffff', color: textColor }}>
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: textColor }}>{block.title}</h2>
                
                {faqs.length > 0 ? (
                  <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq: any, i: number) => (
                      <div key={i} className="p-6 rounded-xl bg-white/70 backdrop-blur-md border-2 border-white/50 shadow-lg">
                        <h3 className="font-bold text-lg mb-3 flex items-start gap-2" style={{ color: accentColor }}>
                          <span>❓</span>
                          {faq.question}
                        </h3>
                        <p className="text-sm opacity-90 leading-relaxed pl-8">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Частые вопросы загружаются...</p>
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
