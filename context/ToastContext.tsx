'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Toast {
  id: number
  message: string
  icon: string
  type?: 'success' | 'info' | 'error'
}

interface ToastContextType {
  showToast: (message: string, icon?: string, type?: 'success' | 'info' | 'error') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, icon?: string, type?: 'success' | 'info' | 'error') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, icon: icon || '🐱', type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed top-24 right-4 z-[99999] space-y-3 max-w-sm w-full pointer-events-none px-4 md:px-0"
        style={{ top: '100px' }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              bg-white rounded-xl shadow-2xl p-4
              transform transition-all duration-300
              flex items-start gap-3
              border-l-4 ${
                toast.type === 'error'
                  ? 'border-red-500'
                  : toast.type === 'success'
                  ? 'border-green-500'
                  : 'border-blvn-pink'
              }
              animate-slide-in-bottom
            `}
          >
            <span className="text-2xl flex-shrink-0">{toast.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium text-sm md:text-base break-words">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
