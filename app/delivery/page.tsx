'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function safeParse(raw: any): any {
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  return raw || {}
}

export default function DeliveryPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/blocks?page=delivery')
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
        const bgColor = style.background_gradient || style.background_color || '#ffffff'
        const textColor = style.text_color || '#1f2937'
        const accentColor = style.accent_color || '#ec4899'

        if (block.block_type === 'hero') {
          return (
            <section key={block.id} className="relative py-24 md:py-40 overflow-hidden" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-pink-400 blur-3xl" />
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

        if (block.block_type === 'methods') {
          const methods = Array.isArray(raw) ? raw : []
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
                {methods.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {methods.map((method: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="group p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                      >
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{method.icon}</div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: textColor }}>{method.name}</h3>
                        {method.description && (
                          <p className="text-sm opacity-75 mb-4 leading-relaxed">{method.description}</p>
                        )}
                        <div className="pt-4 border-t" style={{ borderColor: `${textColor}15` }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-sm opacity-75">
                              <span className="text-base">⏱</span>
                              <span>{method.time}</span>
                            </div>
                            <div className="text-lg font-bold" style={{ color: accentColor }}>
                              {method.price}
                            </div>
                          </div>
                          {method.country && (
                            <div className="mt-2 text-xs opacity-60">{method.country}</div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center opacity-60">Способы доставки загружаются...</p>
                )}
              </div>
            </section>
          )
        }

        if (block.block_type === 'faq') {
          const faqs = Array.isArray(raw) ? raw : []
          return (
            <section key={block.id} className="py-20 md:py-28" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="container mx-auto px-4 max-w-3xl">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold mb-14 text-center"
                >
                  {block.title}
                </motion.h2>
                {faqs.length > 0 ? (
                  <div className="space-y-3">
                    {faqs.map((faq: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl overflow-hidden border" 
                        style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderColor: `${accentColor}15`, backdropFilter: 'blur(8px)' }}
                      >
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between p-5 text-left font-bold text-base transition-colors hover:opacity-80"
                          style={{ color: textColor }}
                        >
                          <span className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: accentColor }}>?</span>
                            {faq.question}
                          </span>
                          <motion.span
                            animate={{ rotate: openFaq === i ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-lg opacity-50"
                          >
                            ▼
                          </motion.span>
                        </button>
                        <motion.div
                          initial={false}
                          animate={{
                            height: openFaq === i ? 'auto' : 0,
                            opacity: openFaq === i ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-0 text-sm leading-relaxed opacity-75" style={{ color: textColor }}>
                            {faq.answer}
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center opacity-60">Частые вопросы загружаются...</p>
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
