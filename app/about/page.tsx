'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/kotiki-s-sakuroi.jpg"
          alt="Котики blvn.you"
          fill
          className="object-cover object-center"
          priority
          quality={85}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4 max-w-2xl"
        >
          <h1 className="font-nunito font-extrabold text-4xl md:text-5xl text-blvn-pink mb-4">
            О нас
          </h1>
          <p className="text-lg text-text-secondary">
            История бренда, который создаёт дофаминовые мелочи для души
          </p>
        </motion.div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8 text-text-secondary leading-relaxed"
        >
          <div>
            <h2 className="font-nunito font-bold text-2xl text-text-primary mb-4">
              Как всё началось
            </h2>
            <p>
              blvn.you родился из любви к японской эстетике и котикам. Всё началось с маленькой 
              мастерской, где создавались первые брелоки. Каждый котик в кимоно 
              — это маленькое произведение искусства, в которое вложена душа.
            </p>
          </div>

          <div>
            <h2 className="font-nunito font-bold text-2xl text-text-primary mb-4">
              Наша философия
            </h2>
            <p>
              Мы верим, что в каждой мелочи может быть магия. Наши брелоки — это не просто аксессуары, 
              это маленькие талисманы, которые дарят улыбку и тепло. Каждый котик уникален, как и его 
              будущий владелец.
            </p>
          </div>

          <div>
            <h2 className="font-nunito font-bold text-2xl text-text-primary mb-4">
              Ручная работа
            </h2>
            <p>
              Каждый брелок создаётся вручную. Мы уделяем внимание каждой детали: от рисунка на кимоно до выражения мордочки. 
              Именно поэтому каждый котик получается особенным.
            </p>
          </div>

          <div className="pt-8 text-center">
            <p className="text-lg mb-6">
              Готовы найти своего котика? 🐱
            </p>
            <Link href="/catalog">
              <Button size="lg">Смотреть каталог</Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
