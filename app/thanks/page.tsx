'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

function ThanksContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="font-nunito font-bold text-3xl md:text-4xl text-text-primary mb-4">
          Спасибо за заказ!
        </h1>
        <p className="text-lg text-text-secondary mb-6">
          Мы получили ваш заказ и скоро свяжемся с вами для подтверждения.
        </p>
        {orderId && (
          <div className="bg-surface rounded-card shadow-soft p-6 mb-8 inline-block">
            <p className="text-sm text-text-secondary mb-1">Номер заказа</p>
            <p className="font-nunito font-bold text-2xl text-primary">
              #{orderId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/catalog">
            <Button size="lg">Продолжить покупки</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">
              На главную
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function ThanksPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="font-nunito font-bold text-3xl text-text-primary mb-4">Загрузка...</h1>
      </div>
    }>
      <ThanksContent />
    </Suspense>
  )
}
