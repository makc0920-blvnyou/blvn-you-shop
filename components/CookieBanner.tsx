'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './ui/Button'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted')
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-gray-200 shadow-soft-lg"
        >
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-text-secondary flex-1">
              Мы используем файлы cookie для улучшения работы сайта. Продолжая использовать сайт, 
              вы соглашаетесь с нашей{' '}
              <a href="/privacy" target="_blank" className="text-primary underline hover:text-primary-dark">
                Политикой конфиденциальности
              </a>.
            </p>
            <Button size="sm" onClick={accept}>
              Принять
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
