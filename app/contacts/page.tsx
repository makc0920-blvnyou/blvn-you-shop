'use client'

import { useState, useEffect } from 'react'

export default function ContactsPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBlocks() {
      try {
        const response = await fetch('/api/blocks?page=contacts')
        const data = await response.json()
        console.log('Contacts blocks:', data)
        console.log('Hero style:', data[0]?.content_json?.style)
        console.log('Contact_info style:', data[1]?.content_json?.style)
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <main>
      {blocks.map((block) => {
        const blockStyle = block.content_json?.style || {}

        const defaultStyles = {
          hero: {
            background_color: '#1f2937',
            text_color: '#f9fafb',
            accent_color: '#ec4899'
          },
          contact_info: {
            background_color: '#ffffff',
            text_color: '#1f2937',
            accent_color: '#ec4899'
          }
        }

        const defaults = defaultStyles[block.block_type as keyof typeof defaultStyles] || defaultStyles.hero

        const bgColor = blockStyle.background_gradient || blockStyle.background_color || defaults.background_color
        const textColor = blockStyle.text_color || defaults.text_color
        const accentColor = blockStyle.accent_color || defaults.accent_color

        console.log(`Block ${block.block_type}: bg=${bgColor}, text=${textColor}`)

        if (block.block_type === 'hero') {
          return (
            <section
              key={block.id}
              className="py-20 md:py-32 text-center transition-all duration-300"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                backgroundImage: blockStyle.background_gradient || undefined
              }}
            >
              <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {block.title || 'Контакты'}
                </h1>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  {block.content || 'Мы всегда рады помочь!'}
                </p>
                {block.content_json?.subtitle && (
                  <p className="text-lg opacity-75 mt-4">
                    {block.content_json.subtitle}
                  </p>
                )}
              </div>
            </section>
          )
        }

        if (block.block_type === 'contact_info') {
          const info = block.content_json || {}

          return (
            <section
              key={block.id}
              className="py-16 md:py-24 transition-all duration-300"
              style={{
                backgroundColor: bgColor,
                color: textColor
              }}
            >
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-4 text-center" style={{ color: textColor }}>
                  {block.title || 'Наши контакты'}
                </h2>

                {info.subtitle && (
                  <p className="text-center text-lg mb-12 opacity-80" style={{ color: textColor }}>
                    {info.subtitle}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {info.phone && (
                    <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border-2 border-white/50 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="text-4xl mb-4">📞</div>
                      <h3 className="font-bold text-lg mb-2" style={{ color: textColor }}>Телефон</h3>
                      <a
                        href={`tel:${info.phone}`}
                        className="text-xl font-medium hover:underline transition-colors"
                        style={{ color: accentColor }}
                      >
                        {info.phone}
                      </a>
                    </div>
                  )}

                  {info.email && (
                    <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border-2 border-white/50 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="text-4xl mb-4">📧</div>
                      <h3 className="font-bold text-lg mb-2" style={{ color: textColor }}>Email</h3>
                      <a
                        href={`mailto:${info.email}`}
                        className="text-lg font-medium hover:underline transition-colors break-all"
                        style={{ color: accentColor }}
                      >
                        {info.email}
                      </a>
                    </div>
                  )}

                  {info.address && (
                    <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border-2 border-white/50 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 md:col-span-2 lg:col-span-1">
                      <div className="text-4xl mb-4">📍</div>
                      <h3 className="font-bold text-lg mb-2" style={{ color: textColor }}>Адрес</h3>
                      <p className="text-base opacity-90" style={{ color: textColor }}>
                        {info.address}
                      </p>
                    </div>
                  )}
                </div>

                {info.work_hours && (
                  <div className="mt-12 text-center">
                    <div className="inline-block p-6 rounded-xl bg-white/50 backdrop-blur-sm border-2 border-white/30">
                      <div className="text-2xl mb-2">🕐</div>
                      <h3 className="font-bold mb-1" style={{ color: textColor }}>Режим работы</h3>
                      <p className="text-sm opacity-80" style={{ color: textColor }}>
                        {info.work_hours}
                      </p>
                    </div>
                  </div>
                )}

                {info.social && info.social.length > 0 && (
                  <div className="mt-12 text-center">
                    <h3 className="text-xl font-bold mb-6" style={{ color: textColor }}>Мы в социальных сетях</h3>
                    <div className="flex justify-center gap-4 flex-wrap">
                      {info.social.map((s: any, i: number) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform shadow-lg"
                          style={{
                            backgroundColor: accentColor,
                            color: '#ffffff'
                          }}
                          title={s.name}
                        >
                          {s.icon === 'telegram' ? '✈️' : s.icon === 'instagram' ? '📷' : '🔗'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {info.note && (
                  <p className="text-center mt-8 text-sm opacity-70" style={{ color: textColor }}>
                    {info.note}
                  </p>
                )}
              </div>
            </section>
          )
        }

        return (
          <section key={block.id} className="py-12" style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="container mx-auto px-4 text-center">
              <h2>{block.title}</h2>
              <p>{block.content}</p>
            </div>
          </section>
        )
      })}
    </main>
  )
}
