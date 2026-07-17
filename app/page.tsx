'use client'

import { useState, useEffect } from 'react'
import HeroBlock from '@/components/blocks/HeroBlock'
import CatalogBlock from '@/components/blocks/CatalogBlock'
import FeaturesBlock from '@/components/blocks/FeaturesBlock'

export default function HomePage() {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBlocks() {
      const response = await fetch('/api/blocks?page=home')
      const data = await response.json()
      setBlocks(data)
      setLoading(false)
    }
    fetchBlocks()
  }, [])

  if (loading) return <div>Загрузка...</div>

  return (
    <main>
      {blocks.map((block: any) => {
        if (block.block_type === 'hero') return <HeroBlock key={block.id} block={block} />
        if (block.block_type === 'catalog') return <CatalogBlock key={block.id} block={block} />
        if (block.block_type === 'features') return <FeaturesBlock key={block.id} block={block} />
        return null
      })}
    </main>
  )
}
