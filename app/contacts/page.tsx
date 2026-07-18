'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function safeParse(raw: any): any {
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  return raw || {}
}

const socialIcons: Record<string, string> = {
  telegram: '✈️',
  instagram: '📷',
  tiktok: '🎵',
  vk: '💬',
  whatsapp: '💬',
  viber: '📞'
}

export default function ContactsPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blocks?page=contacts')
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
                <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-pink-400 blur-3xl" />
                <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-purple-400 blur-3xl" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="container mx-auto px-4 text-center relative z-10"
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">{block.title}</h1>
                {block.content && (
                  <p className="text-xl md:text-2xl opacity-85 max-w-3xl mx-auto">{block.content}</p>
                )}
                {raw.subtitle && (
                  <p className="text-lg opacity-70 mt-4 max-w-2xl mx-auto">{raw.subtitle}</p>
                )}
              </motion.div>
            </section>
          )
        }

        if (block.block_type === 'contact_info') {
          const info = raw
          const contactItems = [
            { key: 'phone', icon: '📞', label: 'Телефон', value: info.phone, href: `tel:${info.phone}` },
            { key: 'email', icon: '📧', label: 'Email', value: info.email, href: `mailto:${info.email}` },
            { key: 'address', icon: '📍', label: 'Адрес', value: info.address, href: null },
          ].filter(item => item.value)

          return (
            <section key={block.id} className="py-20 md:py-28" style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="container mx-auto px-4">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold mb-4 text-center"
                >
                  {block.title}
                </motion.h2>
                {info.subtitle && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-lg opacity-70 mb-14 max-w-2xl mx-auto"
                  >
                    {info.subtitle}
                  </motion.p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                  {contactItems.map((item, i) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="group p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center"
                    >
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                      <h3 className="font-bold text-lg mb-2" style={{ color: textColor }}>{item.label}</h3>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-lg font-medium hover:underline transition-colors break-all"
                          style={{ color: accentColor }}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-base opacity-85" style={{ color: textColor }}>{item.value}</p>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                  {info.work_hours && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border text-center"
                      style={{ borderColor: `${accentColor}20` }}
                    >
                      <div className="text-2xl mb-2">🕐</div>
                      <h3 className="font-bold mb-1" style={{ color: textColor }}>Режим работы</h3>
                      <p className="text-sm opacity-70" style={{ color: textColor }}>{info.work_hours}</p>
                    </motion.div>
                  )}

                  {info.social && info.social.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center pt-4"
                    >
                      <h3 className="text-xl font-bold mb-6" style={{ color: textColor }}>Мы в социальных сетях</h3>
                      <div className="flex justify-center gap-4 flex-wrap">
                        {info.social.map((s: any, i: number) => (
                          <motion.a
                            key={i}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-shadow hover:shadow-xl"
                            style={{ backgroundColor: accentColor, color: '#ffffff' }}
                            title={s.name}
                          >
                            {socialIcons[s.icon?.toLowerCase()] || '🔗'}
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {info.note && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-10 text-sm opacity-60 max-w-xl mx-auto italic"
                    style={{ color: textColor }}
                  >
                    {info.note}
                  </motion.p>
                )}
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
