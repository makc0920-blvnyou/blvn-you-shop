'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ManagerDashboard() {
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        if (data.role === 'manager') {
          setIsAuth(true)
        } else {
          router.push('/admin/seo')
        }
      } else {
        router.push('/admin/login?redirect=/admin/manager')
      }
    } catch {
      router.push('/admin/login?redirect=/admin/manager')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blvn-pink"></div>
      </div>
    )
  }

  if (!isAuth) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="container-custom flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🧶 Мастерская blvn.you</h1>
            <p className="text-sm text-gray-500">Панель управления товарами и заказами</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            Выйти
          </button>
        </div>
      </header>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/admin/products"
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border-2 border-transparent hover:border-blvn-pink/50 group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧸</div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">Товары</h2>
            <p className="text-gray-600 text-sm">Добавление, редактирование, остатки и цены</p>
          </a>

          <a
            href="/admin/orders"
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border-2 border-transparent hover:border-blvn-pink/50 group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🛒</div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">Заказы</h2>
            <p className="text-gray-600 text-sm">Просмотр и управление заказами клиентов</p>
          </a>

          <a
            href="/admin/dashboard"
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border-2 border-transparent hover:border-purple-500/50 group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">Дашборд</h2>
            <p className="text-gray-600 text-sm">Статистика, выручка, популярные товары</p>
          </a>
        </div>
      </div>
    </div>
  )
}
