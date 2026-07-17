'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Stickers from '@/components/Stickers'

const deliveryMethods = {
  belarus: [
    { value: 'europochta', label: 'Европочта', desc: '3-5 дней, от 5 BYN' },
    { value: 'cdek', label: 'СДЭК', desc: '3-7 дней, от 7 BYN' },
    { value: 'belpochta', label: 'Белпочта', desc: '5-10 дней, от 4 BYN' },
    { value: 'pickup', label: 'Самовывоз (Брест)', desc: 'Бесплатно, по договоренности' },
  ],
  russia: [
    { value: 'cdek_ru', label: 'СДЭК (Россия)', desc: '7-14 дней, стоимость индивидуально' },
  ],
}

const paymentMethods = [
  { value: 'erip', label: 'Оплата через ЕРИП', desc: 'Для клиентов из Беларуси' },
  { value: 'card', label: 'Оплата картой', desc: 'Visa, Mastercard, Белкарт' },
  { value: 'transfer', label: 'Банковский перевод', desc: 'Для клиентов из России и Беларуси' },
  { value: 'cash', label: 'Наличные при получении', desc: 'Только для самовывоза' },
]

const getDeliveryCost = (method: string) => {
  if (method === 'pickup') return 0
  if (method === 'europochta') return 5
  if (method === 'cdek') return 7
  if (method === 'belpochta') return 4
  return 0
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total: totalAmount, clearCart } = useCart()
  const { showToast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('+375')
  const [deliveryCountry, setDeliveryCountry] = useState('belarus')
  const [deliveryMethod, setDeliveryMethod] = useState('europochta')
  const [paymentMethod, setPaymentMethod] = useState('erip')
  const [address, setAddress] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)

  const deliveryCost = getDeliveryCost(deliveryMethod)
  const finalTotal = totalAmount + deliveryCost

  const formatBelarusPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('375')) {
      let formatted = '+375 ('
      if (digits.length > 3) formatted += digits.substring(3, 5)
      if (digits.length >= 5) formatted += ') '
      if (digits.length > 5) formatted += digits.substring(5, 8)
      if (digits.length >= 8) formatted += '-'
      if (digits.length > 8) formatted += digits.substring(8, 10)
      if (digits.length >= 10) formatted += '-'
      if (digits.length > 10) formatted += digits.substring(10, 12)
      return formatted
    }
    return phone
  }

  const formatRussianPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('7')) {
      let formatted = '+7 ('
      if (digits.length > 1) formatted += digits.substring(1, 4)
      if (digits.length >= 4) formatted += ') '
      if (digits.length > 4) formatted += digits.substring(4, 7)
      if (digits.length >= 7) formatted += '-'
      if (digits.length > 7) formatted += digits.substring(7, 9)
      if (digits.length >= 9) formatted += '-'
      if (digits.length > 9) formatted += digits.substring(9, 11)
      return formatted
    }
    return phone
  }

  const formatPhone = (value: string, country: string) => {
    const clean = value.replace(/[^\d+]/g, '')
    if (country === 'russia') {
      if (clean.startsWith('+375')) {
        const digits = clean.replace('+375', '7')
        return formatRussianPhone(digits)
      }
      if (!clean.startsWith('+7')) return '+7'
      return formatRussianPhone(clean)
    } else {
      if (clean.startsWith('+7')) {
        const digits = clean.replace('+7', '375')
        return formatBelarusPhone(digits)
      }
      if (!clean.startsWith('+375')) return '+375'
      return formatBelarusPhone(clean)
    }
  }

  const validatePhone = (phone: string, country: string) => {
    const digits = phone.replace(/\D/g, '')
    if (country === 'russia') {
      return digits.length === 11 && digits.startsWith('7')
    }
    return digits.length === 12 && digits.startsWith('375')
  }

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!deliveryMethod) errs.deliveryMethod = 'Выберите способ доставки'
    if (!paymentMethod) errs.paymentMethod = 'Выберите способ оплаты'
    if (deliveryMethod !== 'pickup' && !address.trim()) errs.address = 'Укажите адрес доставки'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs: Record<string, string> = {}
    if (!customerName.trim()) errs.customerName = 'Введите ФИО'
    if (!validatePhone(customerPhone, deliveryCountry)) errs.customerPhone = 'Введите корректный номер телефона'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    if (!agreedToPrivacy) {
      showToast('Пожалуйста, дайте согласие на обработку персональных данных', '')
      return
    }
    setLoading(true)

    const orderData = {
      customerName,
      customerPhone,
      deliveryCountry,
      deliveryMethod,
      paymentMethod,
      address: deliveryMethod === 'pickup' ? '' : address,
      deliveryCost,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        price_rub: item.price_rub,
        quantity: item.quantity,
        image: item.image_url,
      })),
      totalAmount: finalTotal,
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const order = await res.json()

      if (!res.ok) {
        throw new Error(order.hint || order.error || 'Ошибка при создании заказа')
      }

      clearCart()
      router.push(`/thanks?id=${order.id}`)
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Произошла ошибка при оформлении заказа. Попробуйте еще раз.', '')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h1 className="font-nunito font-bold text-3xl text-text-primary mb-2">Корзина пуста</h1>
        <p className="text-text-secondary mb-8">Добавьте товары в корзину перед оформлением</p>
        <Button onClick={() => router.push('/catalog')}>В каталог</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFE4EC] to-[#FFF0F5]">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full">
          <h1 className="font-nunito font-bold text-3xl text-text-primary mb-8">Оформление заказа</h1>

          <div className="flex items-center justify-center gap-4 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-text-secondary'
                  }`}
                >
                  {s}
                </div>
                <span className={`text-sm hidden sm:inline ${step >= s ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                  {s === 1 ? 'Доставка' : s === 2 ? 'Данные' : 'Подтверждение'}
                </span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Страна доставки *
                    </label>
                    <select
                      value={deliveryCountry}
                      onChange={(e) => {
                        const newCountry = e.target.value
                        setDeliveryCountry(newCountry)
                        setDeliveryMethod(newCountry === 'belarus' ? 'europochta' : 'cdek_ru')
                        setCustomerPhone(newCountry === 'belarus' ? '+375' : '+7')
                        setAddress('')
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50 bg-white"
                    >
                      <option value="belarus">🇧🇾 Беларусь</option>
                      <option value="russia">🇷🇺 Россия</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Способ доставки *
                    </label>
                    <div className="space-y-2">
                      {deliveryMethods[deliveryCountry as keyof typeof deliveryMethods].map((method) => (
                        <label
                          key={method.value}
                          className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                            deliveryMethod === method.value
                              ? 'border-blvn-pink bg-blvn-pink/5'
                              : 'border-gray-200 hover:border-blvn-pink'
                          }`}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            value={method.value}
                            checked={deliveryMethod === method.value}
                            onChange={(e) => setDeliveryMethod(e.target.value)}
                            className="mr-3 accent-blvn-pink"
                          />
                          <div>
                            <div className="font-semibold">{method.label}</div>
                            <div className="text-sm text-gray-600">{method.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {deliveryMethod !== 'pickup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес доставки *
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={deliveryCountry === 'belarus' ? 'Город, улица, дом, квартира' : 'Город, индекс, улица, дом'}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>
                  )}

                  {deliveryMethod === 'pickup' && (
                    <div className="p-4 bg-blvn-pink/10 rounded-xl border border-blvn-pink/30">
                      <p className="text-sm text-gray-700">
                        🏪 Самовывоз возможен по предварительной договоренности в Бресте.
                        После оформления заказа мы свяжемся с вами для уточнения времени и места встречи.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Способ оплаты *
                    </label>
                    <div className="space-y-2">
                      {paymentMethods.map((method) => {
                        if (method.value === 'cash' && deliveryMethod !== 'pickup') return null
                        return (
                          <label
                            key={method.value}
                            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                              paymentMethod === method.value
                                ? 'border-blvn-pink bg-blvn-pink/5'
                                : 'border-gray-200 hover:border-blvn-pink'
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={method.value}
                              checked={paymentMethod === method.value}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="mr-3 accent-blvn-pink"
                            />
                            <div>
                              <div className="font-semibold">{method.label}</div>
                              <div className="text-sm text-gray-600">{method.desc}</div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-700">
                      💡 После оформления заказа мы пришлем вам реквизиты для оплаты.
                      Заказ будет отправлен после подтверждения оплаты.
                    </p>
                  </div>
                </div>

                {errors.deliveryMethod && <p className="text-red-500 text-sm mt-4">{errors.deliveryMethod}</p>}

                <Button size="lg" fullWidth className="mt-6" onClick={() => validateStep1() && setStep(2)}>
                  Далее
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="font-nunito font-bold text-xl mb-4">Ваши данные</h2>
                <div className="space-y-4 mb-6">
                  <Input
                    label="ФИО"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    error={errors.customerName}
                    placeholder="Иванов Иван Иванович"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(formatPhone(e.target.value, deliveryCountry))}
                      placeholder={deliveryCountry === 'belarus' ? '+375 (29) 123-45-67' : '+7 (999) 123-45-67'}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blvn-pink/50 ${
                        customerPhone && !validatePhone(customerPhone, deliveryCountry)
                          ? 'border-red-500'
                          : 'border-gray-200'
                      }`}
                    />
                    {errors.customerPhone && (
                      <p className="text-sm text-red-500 mt-1">{errors.customerPhone}</p>
                    )}
                    {customerPhone && !validatePhone(customerPhone, deliveryCountry) && !errors.customerPhone && (
                      <p className="text-sm text-red-500 mt-1">
                        {deliveryCountry === 'belarus'
                          ? 'Введите белорусский номер: +375 (XX) XXX-XX-XX'
                          : 'Введите российский номер: +7 (XXX) XXX-XX-XX'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Назад
                  </Button>
                  <Button size="lg" fullWidth onClick={() => validateStep2() && setStep(3)}>
                    Далее
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="font-nunito font-bold text-xl mb-4">Подтверждение заказа</h2>

                <div className="bg-surface rounded-card shadow-soft p-4 mb-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image_url || '/images/kotik-1.jpg'}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className="font-nunito font-bold text-sm">{item.name}</p>
                          <p className="text-xs text-text-secondary">x{item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-nunito font-bold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-surface rounded-card shadow-soft p-4 mb-6 space-y-2">
                  <h3 className="font-nunito font-bold text-sm mb-2">Данные доставки</h3>
                  <p className="text-sm text-text-secondary">{customerName} | {customerPhone}</p>
                  <p className="text-sm text-text-secondary">
                    {deliveryCountry === 'belarus' ? '🇧🇾' : '🇷🇺'} {deliveryCountry === 'belarus' ? 'Беларусь' : 'Россия'}
                  </p>
                  <p className="text-sm text-text-secondary">
                    📦 {deliveryMethods[deliveryCountry as keyof typeof deliveryMethods].find((m) => m.value === deliveryMethod)?.label}
                  </p>
                  {deliveryMethod !== 'pickup' && address && (
                    <p className="text-sm text-text-secondary">📍 {address}</p>
                  )}
                  {deliveryMethod === 'pickup' && (
                    <p className="text-sm text-text-secondary">🏪 Самовывоз (Брест)</p>
                  )}
                  <p className="text-sm text-text-secondary">
                    💳 {paymentMethods.find((m) => m.value === paymentMethod)?.label}
                  </p>
                </div>

                <div className="bg-surface rounded-card shadow-soft p-4 mb-6 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Товары:</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Доставка:</span>
                    <span>{deliveryMethod === 'pickup' ? 'Бесплатно' : `от ${formatPrice(deliveryCost)}`}</span>
                  </div>
                  <div className="flex justify-between font-nunito font-bold text-lg border-t pt-2 mt-2">
                    <span>Итого:</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-sm text-text-secondary cursor-pointer mt-4 mb-4">
                  <input
                    type="checkbox"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="mt-1 accent-primary w-4 h-4"
                  />
                  <span>
                    Я даю согласие на обработку моих персональных данных в соответствии с{' '}
                    <a href="/privacy" target="_blank" className="text-primary underline hover:text-primary-dark">
                      Политикой конфиденциальности
                    </a>
                  </span>
                </label>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Назад
                  </Button>
                  <Button size="lg" fullWidth loading={loading} onClick={handleSubmit}>
                    Подтвердить заказ
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden lg:flex flex-col items-center sticky top-24 w-72 flex-shrink-0">
          <Stickers page="checkout" />
          <div className="relative w-72 h-96 rounded-card overflow-hidden shadow-xl mt-4">
            <Image
              src="/images/kotik-rozovyi-s-fonarikami.jpg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="288px"
              quality={85}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
