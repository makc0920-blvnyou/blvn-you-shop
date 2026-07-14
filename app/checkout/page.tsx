'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { formatPrice, unformatPhone } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Stickers from '@/components/Stickers'
import { DeliveryService } from '@/types'

const deliveryOptions = [
  { value: 'evropochta' as DeliveryService, label: 'Европочта', icon: '📬', desc: 'Доставка до отделения' },
  { value: 'cdek' as DeliveryService, label: 'СДЭК', icon: '📦', desc: 'Доставка до пункта выдачи или двери' },
  { value: 'belpost' as DeliveryService, label: 'Белпочта', desc: 'Доставка почтой по адресу', icon: '✉️' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '+375 ',
    deliveryService: '' as DeliveryService | '',
    city: '',
    officeNumber: '',
    address: '',
    index: '',
    pickupPoint: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!form.deliveryService) errs.deliveryService = 'Выберите способ доставки'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs: Record<string, string> = {}
    if (!form.customerName.trim()) errs.customerName = 'Введите ФИО'
    if (unformatPhone(form.customerPhone).length < 12) errs.customerPhone = 'Введите корректный телефон'

    if (form.deliveryService === 'evropochta') {
      if (!form.city.trim()) errs.city = 'Укажите город'
      if (!form.officeNumber.trim()) errs.officeNumber = 'Укажите номер отделения'
    } else if (form.deliveryService === 'cdek') {
      if (!form.city.trim()) errs.city = 'Укажите город'
      if (!form.pickupPoint.trim() && !form.address.trim()) {
        errs.pickupPoint = 'Укажите адрес или пункт выдачи'
      }
    } else if (form.deliveryService === 'belpost') {
      if (!form.address.trim()) errs.address = 'Укажите полный адрес'
      if (!form.index.trim()) errs.index = 'Укажите индекс'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (!digits.startsWith('375')) {
      updateField('customerPhone', '+375 ')
      return
    }
    let formatted = '+375 ('
    if (digits.length > 3) formatted += digits.substring(3, 5)
    if (digits.length >= 5) formatted += ') '
    if (digits.length > 5) formatted += digits.substring(5, 8)
    if (digits.length >= 8) formatted += '-'
    if (digits.length > 8) formatted += digits.substring(8, 10)
    if (digits.length >= 10) formatted += '-'
    if (digits.length > 10) formatted += digits.substring(10, 12)
    updateField('customerPhone', formatted)
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    if (!agreedToPrivacy) {
      alert('Пожалуйста, дайте согласие на обработку персональных данных')
      return
    }
    setLoading(true)

    const deliveryAddress = form.deliveryService === 'evropochta'
      ? `г. ${form.city}, отделение ${form.officeNumber}`
      : form.deliveryService === 'cdek'
      ? `г. ${form.city}, ${form.pickupPoint || form.address}`
      : `${form.address}, ${form.index}`

    const orderData = {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      deliveryService: form.deliveryService,
      deliveryAddress,
      deliveryDetails: {
        city: form.city,
        officeNumber: form.officeNumber,
        address: form.address,
        index: form.index,
        pickupPoint: form.pickupPoint,
      },
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image_url,
      })),
      totalAmount,
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
      alert(err.message || 'Произошла ошибка при оформлении заказа. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  const getDeliveryFields = () => {
    switch (form.deliveryService) {
      case 'evropochta':
        return (
          <>
            <Input
              label="Город"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              error={errors.city}
              placeholder="Минск"
            />
            <Input
              label="Номер отделения"
              value={form.officeNumber}
              onChange={(e) => updateField('officeNumber', e.target.value)}
              error={errors.officeNumber}
              placeholder="123"
            />
          </>
        )
      case 'cdek':
        return (
          <>
            <Input
              label="Город"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              error={errors.city}
              placeholder="Минск"
            />
            <Input
              label="Адрес пункта выдачи или до двери"
              value={form.pickupPoint || form.address}
              onChange={(e) => updateField('pickupPoint', e.target.value)}
              error={errors.pickupPoint}
              placeholder="ул. Примерная, д. 10"
            />
          </>
        )
      case 'belpost':
        return (
          <>
            <Input
              label="Полный адрес"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              error={errors.address}
              placeholder="г. Минск, ул. Примерная, д. 10, кв. 5"
            />
            <Input
              label="Индекс"
              value={form.index}
              onChange={(e) => updateField('index', e.target.value)}
              error={errors.index}
              placeholder="220000"
            />
          </>
        )
      default:
        return null
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
                <h2 className="font-nunito font-bold text-xl mb-4">Выберите способ доставки</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {deliveryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateField('deliveryService', opt.value)}
                      className={`p-4 rounded-card border-2 text-left transition-all duration-300 ${
                        form.deliveryService === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 bg-surface hover:border-primary/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{opt.icon}</div>
                      <div className="font-nunito font-bold text-text-primary">{opt.label}</div>
                      <div className="text-sm text-text-secondary">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.deliveryService && (
                  <p className="text-red-500 text-sm mb-4">{errors.deliveryService}</p>
                )}
                <Button size="lg" fullWidth onClick={() => validateStep1() && setStep(2)}>
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
                    value={form.customerName}
                    onChange={(e) => updateField('customerName', e.target.value)}
                    error={errors.customerName}
                    placeholder="Иванов Иван Иванович"
                  />
                  <Input
                    label="Телефон"
                    value={form.customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    error={errors.customerPhone}
                    placeholder="+375 (29) 123-45-67"
                  />
                  {getDeliveryFields()}
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
                            src={(item as any).image_url || (item as any).image || '/images/kotik-1.jpg'}
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

                <div className="bg-surface rounded-card shadow-soft p-4 mb-6">
                  <h3 className="font-nunito font-bold text-sm mb-2">Данные доставки</h3>
                  <p className="text-sm text-text-secondary">
                    {form.customerName} | {form.customerPhone}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {deliveryOptions.find((o) => o.value === form.deliveryService)?.label}: { }
                    {form.deliveryService === 'evropochta'
                      ? `г. ${form.city}, отделение ${form.officeNumber}`
                      : form.deliveryService === 'cdek'
                      ? `г. ${form.city}, ${form.pickupPoint}`
                      : `${form.address}, ${form.index}`}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="font-nunito font-bold text-xl">Итого:</span>
                  <span className="font-nunito font-bold text-2xl text-primary">
                    {formatPrice(totalAmount)}
                  </span>
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
