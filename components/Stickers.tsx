'use client'

import Image from 'next/image'

interface StickersProps {
  page: 'checkout' | 'cart' | 'catalog'
}

export default function Stickers({ page }: StickersProps) {
  if (page === 'checkout') {
    return (
      <div className="hidden lg:block fixed bottom-8 right-8 z-30 animate-float">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-soft-lg ring-2 ring-white/50">
          <Image
            src="/images/kotik-rozovyi-s-fonarikami.jpg"
            alt=""
            fill
            className="object-cover object-center"
            sizes="80px"
          />
        </div>
      </div>
    )
  }

  if (page === 'catalog') {
    return (
      <div className="absolute -top-6 right-8 w-36 h-36 rounded-2xl overflow-hidden shadow-xl rotate-6 hidden sm:block">
        <Image
          src="/images/kotik-zelenyi-na-ulitse.jpg"
          alt=""
          fill
          className="object-cover object-center"
          sizes="144px"
        />
      </div>
    )
  }

  return null
}
