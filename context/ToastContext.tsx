'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Toast {
  id: number
  message: string
  emoji?: string
  type?: 'success' | 'info'
}

interface ToastContextType {
  showToast: (message: string, emoji?: string, type?: 'success' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, emoji?: string, type?: 'success' | 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, emoji, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-card shadow-soft-lg text-sm font-semibold ${
                toast.type === 'success'
                  ? 'bg-success/90 text-white'
                  : 'bg-surface text-text-primary'
              }`}
            >
              <span className="text-xl">{toast.emoji || '🐱'}</span>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
