'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        const redirect = searchParams.get('redirect')
        if (data.role === 'manager') {
          router.push(redirect || '/admin/products')
        } else if (data.role === 'content') {
          router.push(redirect || '/admin/seo')
        }
      }
    } catch (err) {
      // Не авторизован
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔑 Attempting login with:', { username })

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      })

      const data = await res.json()
      console.log('📥 Login response:', data)

      if (res.ok) {
        const redirect = searchParams.get('redirect')
        if (data.role === 'manager') {
          console.log('✅ Redirecting to /admin/products')
          router.push(redirect || '/admin/products')
        } else {
          console.log('✅ Redirecting to /admin/seo')
          router.push(redirect || '/admin/seo')
        }
      } else {
        setError(data.error || 'Неверный логин или пароль')
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      setError('Ошибка сети. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-2 border-pink-200">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🐱</div>
          <h1 className="text-2xl font-bold text-gray-900">Вход в панель</h1>
          <p className="text-sm text-gray-500 mt-1">blvn.you admin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="manager или content"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50 focus:border-transparent"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50 focus:border-transparent"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blvn-pink text-white rounded-xl hover:bg-blvn-pink/90 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Вход...' : '🔐 Войти'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">🔐 Доступ к панели</p>
          <p className="text-xs text-gray-500">Войдите используя учётные данные, предоставленные администратором.</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
