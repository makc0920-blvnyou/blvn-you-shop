'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Мяу! Привет! 🐱✨ Я помощник магазина blvn.you. Могу рассказать о доставке, уходе или помочь с заказом. Что тебя интересует?',
      suggestions: [
        "📦 Расскажите о доставке",
        "🛒 Как купить котика?",
      ],
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMessage: ChatMessage = { role: 'user', content: msg }
    setMessages((prev) => [...prev.map((m) => ({ ...m, suggestions: undefined })), userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply, suggestions: data.suggestions },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Мяу... что-то пошло не так. Попробуй еще раз позже! 🐱' },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Мяу... что-то пошло не так. Попробуй еще раз позже! 🐱' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 bg-surface rounded-card shadow-soft-lg overflow-hidden flex flex-col max-h-[520px]"
          >
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐱</span>
                <span className="font-nunito font-bold">Мяу-помощник</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-card text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-surface text-text-primary border border-gray-100 shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'assistant' && msg.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-1">
                      {msg.suggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(suggestion)}
                          disabled={loading}
                          className="text-xs bg-surface border border-primary/30 text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-gray-100 px-4 py-3 rounded-card shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-surface border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="Напиши свой вопрос..."
                disabled={loading}
                className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-card focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-card transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Открыть чат"
      >
        <span className="text-2xl">💬</span>
      </button>
    </div>
  )
}
