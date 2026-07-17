'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardData {
  ordersToday: number
  ordersWeek: number
  ordersMonth: number
  revenueToday: number
  revenueWeek: number
  revenueMonth: number
  popularProducts: Array<{ name: string; count: number }>
  lowStockProducts: Array<{ name: string; stock: number }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData>({
    ordersToday: 0,
    ordersWeek: 0,
    ordersMonth: 0,
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    popularProducts: [],
    lowStockProducts: []
  })

  useEffect(() => {
    checkAuth()
    fetchDashboardData()
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
        router.push('/admin/login?redirect=/admin/dashboard')
      }
    } catch {
      router.push('/admin/login?redirect=/admin/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const jsonData = await response.json()
      setData(jsonData)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
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
            <h1 className="text-2xl font-bold text-gray-900">📊 Дашборд</h1>
            <p className="text-sm text-gray-500">Статистика и метрики магазина</p>
          </div>
          <div className="flex gap-3">
            <a href="/admin/manager" className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition text-sm font-medium">
              ← Назад
            </a>
            <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🛒 Заказы</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">За сегодня</div>
              <div className="text-3xl font-bold text-gray-900">{data.ordersToday}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
              <div className="text-sm text-gray-600 mb-1">За неделю</div>
              <div className="text-3xl font-bold text-gray-900">{data.ordersWeek}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">За месяц</div>
              <div className="text-3xl font-bold text-gray-900">{data.ordersMonth}</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Выручка</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
              <div className="text-sm text-gray-600 mb-1">За сегодня</div>
              <div className="text-3xl font-bold text-blue-600">{data.revenueToday} BYN</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
              <div className="text-sm text-gray-600 mb-1">За неделю</div>
              <div className="text-3xl font-bold text-purple-600">{data.revenueWeek} BYN</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
              <div className="text-sm text-gray-600 mb-1">За месяц</div>
              <div className="text-3xl font-bold text-green-600">{data.revenueMonth} BYN</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Популярные товары</h2>
            {data.popularProducts.length > 0 ? (
              <div className="space-y-3">
                {data.popularProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{product.name}</span>
                    <span className="px-3 py-1 bg-blvn-pink text-white rounded-full text-sm">
                      {product.count} шт.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Нет данных о продажах</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚠️ Низкий остаток</h2>
            {data.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {data.lowStockProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="font-medium text-gray-900">{product.name}</span>
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                      {product.stock} шт.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-green-600 text-center py-8">✅ Все товары в наличии</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
