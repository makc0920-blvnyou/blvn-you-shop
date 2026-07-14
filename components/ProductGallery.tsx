'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  mainImage: string
  additionalImages?: string[]
  productName: string
}

export default function ProductGallery({ mainImage, additionalImages = [], productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(mainImage)
  const allImages = [mainImage, ...additionalImages].filter(Boolean)

  if (allImages.length <= 1) {
    return (
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border-2 border-gray-100">
        <Image src={mainImage} alt={productName} fill className="object-cover" priority />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border-2 border-gray-100 group cursor-pointer">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
          {allImages.indexOf(selectedImage) + 1} / {allImages.length}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              selectedImage === img
                ? 'border-primary ring-2 ring-primary/30 scale-105'
                : 'border-gray-200 hover:border-primary/50 opacity-70 hover:opacity-100'
            }`}
          >
            <Image src={img} alt={`${productName} ${idx + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
