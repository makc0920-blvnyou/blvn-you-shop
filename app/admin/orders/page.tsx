'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  delivery_country: string
  delivery_method: string
  payment_method: string
  address: string
  items: OrderItem[]
  delivery_cost: number
  total_amount: number
  notes?: string
  status: string
  is_archived?: boolean
  archived_at?: string
  created_at: string
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [archivedCount, setArchivedCount] = useState(0)
  const { showToast } = useToast()

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
        router.push('/admin/login?redirect=/admin/orders')
      }
    } catch {
      router.push('/admin/login?redirect=/admin/orders')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/admin/login')
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders${showArchived ? '?archived=true' : ''}`)
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchArchivedCount = async () => {
    try {
      const res = await fetch('/api/orders?archived=true')
      const data = await res.json()
      setArchivedCount(data.length)
    } catch (err) {
      console.error('Error fetching archived count:', err)
    }
  }

  useEffect(() => {
    if (isAuth) {
      fetchOrders()
      fetchArchivedCount()
    }
  }, [showArchived, isAuth])

  const handleArchiveOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    const action = order.is_archived ? 'unarchive' : 'archive'
    const confirmText = order.is_archived
      ? 'Разархивировать заказ?'
      : 'Архивировать заказ?'

    if (!confirm(confirmText)) return

    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, action })
      })

      if (res.ok) {
        showToast(
          order.is_archived ? 'Заказ разархивирован' : 'Заказ архивирован',
          ''
        )
        fetchOrders()
        fetchArchivedCount()
      } else {
        showToast('Ошибка', '')
      }
    } catch {
      showToast('Ошибка сети', '')
    }
  }

  if (authLoading || loading) {
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
            <h1 className="text-2xl font-bold text-gray-900">🛒 Управление заказами</h1>
            <p className="text-sm text-gray-500">Просмотр и обработка заказов клиентов</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/manager"
              className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition text-sm font-medium"
            >
              ← Назад в мастерскую
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Заказы</h1>
              {archivedCount > 0 && (
                <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                  🗄️ Архив: {archivedCount}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-lg transition ${
                showArchived
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showArchived ? '📋 Показать активные' : '🗄️ Показать архивные'}
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {showArchived ? 'Нет архивных заказов' : 'Нет активных заказов'}
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-xl shadow-sm border p-6 ${
                    order.is_archived ? 'border-gray-200 opacity-70' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{order.customer_name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status === 'pending' ? 'Ожидает' :
                           order.status === 'completed' ? 'Выполнен' : order.status}
                        </span>
                        {order.is_archived && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            В архиве
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        📞 {order.customer_phone}
                        {order.customer_email && ` · ✉️ ${order.customer_email}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blvn-pink">{formatPrice(order.total_amount)}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Доставка:</span>{' '}
                      <span className="font-medium">
                        {order.delivery_method === 'pickup' ? 'Самовывоз' :
                         order.delivery_method === 'courier' ? 'Курьер' :
                         order.delivery_method === 'mail' ? 'Почта' :
                         order.delivery_method}
                      </span>
                      <span className="text-gray-400 ml-2">
                        ({order.delivery_country === 'russia' ? 'РФ' :
                          order.delivery_country === 'belarus' ? 'РБ' :
                          order.delivery_country === 'kazakhstan' ? 'КЗ' :
                          order.delivery_country === 'other' ? 'Другое' : order.delivery_country})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Оплата:</span>{' '}
                      <span className="font-medium">
                        {order.payment_method === 'card' ? 'Карта РФ' :
                         order.payment_method === 'foreign_card' ? 'Карта др. страны' :
                         order.payment_method === 'sbp' ? 'СБП' :
                         order.payment_method === 'crypto' ? 'Крипта' :
                         order.payment_method}
                      </span>
                    </div>
                    {order.address && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Адрес:</span>{' '}
                        <span className="font-medium">{order.address}</span>
                      </div>
                    )}
                    {order.notes && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Комментарий:</span>{' '}
                        <span className="font-medium">{order.notes}</span>
                      </div>
                    )}
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="border-t pt-3 mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Товары в заказе:</p>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name} × {item.quantity}</span>
                            <span className="text-gray-600">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      {order.delivery_cost > 0 && (
                        <div className="flex justify-between text-sm border-t pt-1 mt-1">
                          <span>Доставка</span>
                          <span className="text-gray-600">{formatPrice(order.delivery_cost)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleArchiveOrder(order.id)}
                      className={`px-3 py-1 text-sm rounded transition ${
                        order.is_archived
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      }`}
                    >
                      {order.is_archived ? 'Разархивировать' : 'Архивировать'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
