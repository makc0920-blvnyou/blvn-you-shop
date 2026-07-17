'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface HeaderData {
  logo_url?: string
  menu?: Array<{ title: string; url: string }>
}

export default function Header() {
  const [headerData, setHeaderData] = useState<HeaderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHeader() {
      try {
        console.log('Fetching header...')
        const response = await fetch('/api/blocks?page=header')
        const data = await response.json()
        console.log('Header API response:', data)

        if (data && data.length > 0 && data[0].content_json) {
          const headerJson = data[0].content_json
          console.log('Header JSON:', headerJson)
          console.log('Logo URL:', headerJson.logo_url)

          setHeaderData({
            logo_url: headerJson.logo_url || '/logo.png',
            menu: headerJson.menu && headerJson.menu.length > 0 ? headerJson.menu : [
              { title: 'Главная', url: '/' },
              { title: 'Каталог', url: '/catalog' },
              { title: 'О нас', url: '/about' },
              { title: 'Доставка', url: '/delivery' },
              { title: 'Контакты', url: '/contacts' }
            ]
          })
        }

        setLoading(false)
      } catch (error) {
        console.error('Error fetching header:', error)
        setLoading(false)
      }
    }

    fetchHeader()
  }, [])

  const defaultData: HeaderData = {
    logo_url: '/logo.png',
    menu: [
      { title: 'Главная', url: '/' },
      { title: 'Каталог', url: '/catalog' },
      { title: 'О нас', url: '/about' },
      { title: 'Доставка', url: '/delivery' },
      { title: 'Контакты', url: '/contacts' }
    ]
  }

  const data = { ...defaultData, ...headerData }

  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="container-custom px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
      <div className="container-custom px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {data.logo_url && data.logo_url !== '/logo.png' ? (
              <div className="relative w-10 h-10">
                <Image
                  src={data.logo_url}
                  alt="blvn.you"
                  fill
                  className="object-cover rounded-full"
                  unoptimized={data.logo_url.startsWith('http')}
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                🐱
              </div>
            )}
            <span className="font-bold text-xl text-blvn-purple">blvn.you</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {data.menu?.map((item, idx) => (
              <Link
                key={idx}
                href={item.url}
                className="text-gray-600 hover:text-blvn-pink transition font-medium"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <Link href="/cart" className="relative">
            <svg className="w-6 h-6 text-gray-600 hover:text-blvn-pink transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  )
}
