'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function safeParse(raw: any): any {
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  return raw || {}
}

export default function AboutPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blocks?page=about')
      .then(r => r.json())
      .then(data => { setBlocks(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" /></div>
  }

  return (
    <main>
      {blocks.map((block) => {
        const raw = safeParse(block.content_json)
        const style = raw.style || {}
        const bgColor = style.background_gradient || style.background_color || '#fdf2f8'
        const textColor = style.text_color || '#1f2937'
        const accentColor = style.accent_color || '#ec4899'

        if (block.block_type === 'hero') {
          return (
            <section key={block.id} className="relative py-24 md:py-40 overflow-hidden" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-pink-400 blur-3xl" />
                <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-purple-400 blur-3xl" />
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

        if (block.block_type === 'story') {
          return (
            <section key={block.id} className="py-20 md:py-28" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{block.title}</h2>
                  {block.content && (
                    <div className="relative">
                      <div className="absolute -left-4 top-0 w-1 h-full rounded-full" style={{ backgroundColor: accentColor }} />
                      <p className="text-lg md:text-xl leading-relaxed opacity-85 whitespace-pre-line pl-6">{block.content}</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </section>
          )
        }

        if (block.block_type === 'values') {
          const values = Array.isArray(raw) ? raw : []
          return (
            <section key={block.id} className="py-20 md:py-28" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="container mx-auto px-4">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold mb-14 text-center"
                >
                  {block.title}
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {values.map((item: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="group p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center"
                      style={{ borderColor: 'rgba(255,255,255,0.5)' }}
                    >
                      <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                      <h3 className="text-xl font-bold mb-3" style={{ color: textColor }}>{item.title}</h3>
                      <p className="text-base opacity-75 leading-relaxed">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        return (
          <section key={block.id} className="py-12" style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold">{block.title}</h2>
              {block.content && <p className="mt-2 opacity-75">{block.content}</p>}
            </div>
          </section>
        )
      })}
    </main>
  )
}
