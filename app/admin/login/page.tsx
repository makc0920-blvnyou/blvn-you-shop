'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        setError('Неверный пароль')
        return
      }

      router.push('/admin/products')
    } catch {
      setError('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-card shadow-soft p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <span className="text-4xl">🔐</span>
          <h1 className="font-nunito font-bold text-2xl text-text-primary mt-2">
            Вход в админ-панель
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите секретный пароль"
          />
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <Button type="submit" fullWidth loading={loading}>
            Войти
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
