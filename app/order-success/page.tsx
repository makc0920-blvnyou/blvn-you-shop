'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderSuccessPage() {
  const router = useRouter()
  const [orderInfo, setOrderInfo] = useState<any>(null)

  useEffect(() => {
    const order = localStorage.getItem('lastOrder')
    if (order) {
      setOrderInfo(JSON.parse(order))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 py-12">
      <div className="container-custom max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-nunito font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            Заказ оформлен!
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Спасибо за покупку! Мы свяжемся с вами в ближайшее время.
          </p>

          {orderInfo && (
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-8 text-left">
              <h2 className="font-bold text-xl text-gray-900 mb-4">Детали заказа</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Номер заказа:</span>
                  <span className="font-semibold text-gray-900">#{orderInfo.id?.slice(0, 8)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Имя:</span>
                  <span className="font-semibold text-gray-900">{orderInfo.customer_name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Телефон:</span>
                  <span className="font-semibold text-gray-900">{orderInfo.customer_phone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-900">{orderInfo.customer_email}</span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Итого:</span>
                    <span className="text-blvn-pink">{orderInfo.total_amount} BYN</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-lg text-gray-900 mb-3">Что будет дальше?</h3>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blvn-pink font-bold">1.</span>
                <span>Мы свяжемся с вами для подтверждения заказа в течение 24 часов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blvn-pink font-bold">2.</span>
                <span>Отправим товар в течение 1-3 рабочих дней</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blvn-pink font-bold">3.</span>
                <span>Пришлем трек-номер для отслеживания посылки</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/catalog"
              className="flex-1 px-6 py-4 bg-blvn-pink text-white rounded-xl font-semibold hover:bg-blvn-pink/90 transition"
            >
              Продолжить покупки
            </a>
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
