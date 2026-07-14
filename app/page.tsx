'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/ProductCard'
import Button from '@/components/ui/Button'
import SakuraEffect from '@/components/SakuraEffect'
import { Product } from '@/types'

const features = [
  { icon: '🧶', title: 'Ручная работа', desc: 'Каждый котик создан с любовью в единственном экземпляре' },
  { icon: '✨', title: 'Уникальный дизайн', desc: 'Авторские образы, которых больше нигде не найдешь' },
  { icon: '📦', title: 'Быстрая доставка', desc: 'Отправляем Европочтой, СДЭК и Белпочтой за 3-7 дней' },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data || []))
      .catch(() => {})
  }, [])

  return (
    <div className="relative">
      <SakuraEffect />

      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 animate-hero-zoom">
          <Image
            src="/images/kotiki-s-sakuroi.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
            quality={85}
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(250,247,255,0.85)] via-[rgba(250,247,255,0.70)] to-[rgba(250,247,255,0.95)]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-6xl mx-auto px-4 text-center w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <h1 className="font-nunito font-extrabold text-4xl md:text-6xl lg:text-7xl text-blvn-pink mb-4 tracking-wider">
              BLVN.YOU
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-text-secondary mb-10"
          >
            Дофаминовые мелочи для души 🐱
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/catalog">
              <Button size="lg">Смотреть каталог</Button>
            </Link>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      <section className="relative max-w-6xl mx-auto px-4 py-16">
        <div className="absolute -top-20 right-0 w-64 h-64 opacity-[0.03] pointer-events-none">
          <Image src="/images/logo-flowers.jpg" alt="" fill className="object-contain" sizes="256px" />
        </div>

        <div className="absolute top-10 left-0 w-32 h-32 blur-2xl opacity-30 bg-blvn-sakura rounded-full pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-40 h-40 blur-3xl opacity-20 bg-blvn-lavender rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-nunito font-bold text-3xl text-text-primary mb-2">
            Популярные товары
          </h2>
          <p className="text-text-secondary">Котики, которые уже покорили сердца</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/catalog">
            <Button variant="outline" size="lg">
              Смотреть все →
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-nunito font-bold text-3xl text-center mb-12"
          >
            Почему выбирают нас?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="font-nunito font-bold text-xl text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
