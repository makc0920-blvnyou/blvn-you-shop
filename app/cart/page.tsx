'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, total, totalRub, itemCount } = useCart()
  const { showToast } = useToast()
  const [deliveryCountry, setDeliveryCountry] = useState('belarus')
  const [deliveryMethod, setDeliveryMethod] = useState('europochta')
  const [paymentMethod, setPaymentMethod] = useState('erip')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const getDeliveryCost = () => {
    if (deliveryCountry === 'russia') return 15
    const costs: Record<string, number> = {
      europochta: 4,
      cdek: 6,
      belpochta: 3,
      pickup: 0
    }
    return costs[deliveryMethod] || 4
  }

  const deliveryCost = getDeliveryCost()
  const finalTotal = total + deliveryCost
  const finalTotalRub = totalRub + (deliveryCountry === 'russia' ? 450 : deliveryCost * 28)

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      showToast('Корзина пуста!', '')
      return
    }

    if (customerName.trim().length < 3) {
      showToast('Введите имя (минимум 3 символа)', '')
      return
    }

    const phoneDigits = customerPhone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      showToast('Введите корректный номер телефона', '')
      return
    }

    if (!customerEmail.includes('@')) {
      showToast('Введите корректный email', '')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone,
        customer_email: customerEmail.trim(),
        delivery_country: deliveryCountry,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        address: address.trim(),
        notes: notes.trim(),
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        delivery_cost: deliveryCost,
        total_amount: finalTotal
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const order = await response.json()

        localStorage.setItem('lastOrder', JSON.stringify(order))

        clearCart()

        router.push('/order-success')
      } else {
        const data = await response.json()
        showToast(data.error || 'Ошибка оформления заказа', '')
      }
    } catch (error) {
      console.error('Order error:', error)
      showToast('Ошибка сети', '')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container-custom text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="font-nunito font-bold text-3xl text-text-primary mb-4">
            Корзина пуста
          </h1>
          <p className="text-text-secondary mb-8">
            Добавьте котиков из каталога
          </p>
          <a
            href="/catalog"
            className="inline-block px-8 py-3 bg-blvn-pink text-white rounded-xl font-semibold hover:bg-blvn-pink/90 transition"
          >
            Перейти в каталог
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container-custom">
        <h1 className="font-nunito font-bold text-3xl md:text-4xl text-text-primary mb-8">
          Корзина ({itemCount} {itemCount === 1 ? 'товар' : itemCount < 5 ? 'товара' : 'товаров'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border-2 border-pink-100"
              >
                <div className="flex gap-4 md:gap-6">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-nunito font-bold text-lg md:text-xl text-text-primary mb-2 line-clamp-2">
                      {item.name}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl md:text-2xl font-bold text-blvn-pink">
                        {item.price.toFixed(2)} BYN
                      </span>
                      {/* Показываем цену в рублях ТОЛЬКО если она > 0 */}
                      {item.price_rub && item.price_rub > 0 && (
                        <span className="text-sm text-text-secondary ml-2">
                          ~{item.price_rub} RUB
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold transition"
                      >
                        −
                      </button>

                      <span className="text-lg md:text-xl font-bold text-text-primary min-w-[40px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock_quantity || 0)}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blvn-pink/10 hover:bg-blvn-pink/20 flex items-center justify-center text-xl font-bold text-blvn-pink transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>

                      {item.quantity >= (item.stock_quantity || 0) && (
                        <span className="text-xs text-orange-600">
                          Максимум
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-right">
                      <span className="text-lg md:text-xl font-bold text-text-primary">
                        {(item.price * item.quantity).toFixed(2)} BYN
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                clearCart()
                showToast('Корзина очищена', '')
              }}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              🗑️ Очистить корзину
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-100 sticky top-4">
              <h2 className="font-nunito font-bold text-xl text-text-primary mb-6">
                Оформление заказа
              </h2>

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Страна доставки
                  </label>
                  <select
                    value={deliveryCountry}
                    onChange={(e) => {
                      setDeliveryCountry(e.target.value)
                      setCustomerPhone('')
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                  >
                    <option value="belarus">Беларусь</option>
                    <option value="russia">Россия</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Способ доставки
                  </label>
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                  >
                    {deliveryCountry === 'belarus' ? (
                      <>
                        <option value="europochta">Европочта</option>
                        <option value="cdek">СДЭК</option>
                        <option value="belpochta">Белпочта</option>
                        <option value="pickup">Самовывоз (Брест)</option>
                      </>
                    ) : (
                      <option value="cdek">СДЭК</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Способ оплаты
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                  >
                    <option value="erip">ЕРИП</option>
                    <option value="card">Банковская карта</option>
                    <option value="cash">Наличные при получении</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Имя и фамилия *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                    placeholder="Иванов Иван"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value)
                    }}
                    onBlur={() => {
                      const digits = customerPhone.replace(/\D/g, '')
                      if (digits.length < 10) {
                        showToast('Введите корректный номер телефона', '')
                      }
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                    placeholder={deliveryCountry === 'belarus' ? '+375 (29) 123-45-67' : '+7 (999) 123-45-67'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {deliveryCountry === 'belarus'
                      ? 'Для Беларуси: +375 (29) XXX-XX-XX'
                      : 'Для России: +7 (XXX) XXX-XX-XX'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                    placeholder="example@mail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Адрес доставки *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                    placeholder="Город, улица, дом, квартира"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Комментарий
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                    placeholder="Дополнительная информация"
                  />
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Товары:</span>
                    <span className="font-medium">{total.toFixed(2)} BYN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Доставка:</span>
                    <span className="font-medium">{deliveryCost.toFixed(2)} BYN</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Итого:</span>
                    <span className="text-blvn-pink">{finalTotal.toFixed(2)} BYN</span>
                  </div>
                  {totalRub > 0 && (
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>≈ {finalTotalRub} RUB</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="w-full py-4 px-6 bg-blvn-pink text-white rounded-xl font-semibold hover:bg-blvn-pink/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Оформление...' : 'Оформить заказ'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
