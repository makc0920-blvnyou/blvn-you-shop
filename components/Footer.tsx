'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FooterData {
  site_description?: string
  footer_menu?: Array<{ title: string; url: string }>
  phone?: string
  email?: string
  address?: string
  company_name?: string
  unp?: string
  social?: Array<{ name: string; url: string; icon: string }>
  links?: Array<{ title: string; url: string }>
}

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFooter() {
      try {
        console.log('🔍 Fetching footer...')
        const response = await fetch('/api/blocks?page=footer')
        const data = await response.json()
        console.log('📦 Footer API response:', data)
        console.log('📦 Footer data length:', data?.length)

        if (data && data.length > 0) {
          console.log('📦 First block:', data[0])
          console.log('📦 content_json:', data[0].content_json)
          console.log('📦 content_json type:', typeof data[0].content_json)

          const footerJson = data[0].content_json

          const finalData: FooterData = {
            site_description: footerJson?.site_description || 'Дофаминовые мелочи для души.\nУникальные котики ручной работы из Беларуси.',
            footer_menu: footerJson?.footer_menu && footerJson.footer_menu.length > 0 ? footerJson.footer_menu : [
              { title: 'Главная', url: '/' },
              { title: 'Каталог', url: '/catalog' },
              { title: 'О нас', url: '/about' },
              { title: 'Доставка', url: '/delivery' },
              { title: 'Контакты', url: '/contacts' }
            ],
            phone: footerJson?.phone || '+375 (29) 800-22-33',
            email: footerJson?.email || 'blvnyou@yandex.ru',
            address: footerJson?.address || '224000, г. Брест, пер. Дружный 4-й, д. 15',
            company_name: footerJson?.company_name || 'ИП Попова Екатерина Валентиновна',
            unp: footerJson?.unp || '291921539',
            social: footerJson?.social && footerJson.social.length > 0 ? footerJson.social : [
              { name: 'Telegram', url: 'https://t.me/blvnyou', icon: 'telegram' },
              { name: 'Instagram', url: 'https://instagram.com/blvn.you', icon: 'instagram' }
            ],
            links: footerJson?.links && footerJson.links.length > 0 ? footerJson.links : [
              { title: 'Политика конфиденциальности', url: '/privacy' },
              { title: 'Публичная оферта', url: '/offer' },
              { title: 'Возврат и обмен', url: '/returns' }
            ]
          }

          console.log('✅ Final footer data:', finalData)
          console.log('✅ Phone:', finalData.phone)
          console.log('✅ Email:', finalData.email)
          console.log('✅ Socials:', finalData.social)

          setFooterData(finalData)
        } else {
          console.warn('⚠️ No footer data received')
        }

        setLoading(false)
      } catch (error) {
        console.error('❌ Error fetching footer:', error)
        setLoading(false)
      }
    }

    fetchFooter()

    const handleFooterUpdate = () => {
      console.log('🔄 Footer update event received, refetching...')
      fetchFooter()
    }

    window.addEventListener('footer-updated', handleFooterUpdate)

    return () => {
      window.removeEventListener('footer-updated', handleFooterUpdate)
    }
  }, [])

  console.log('🎨 Footer rendering with data:', footerData)

  if (loading) return null

  const defaultData: FooterData = {
    site_description: 'Дофаминовые мелочи для души.\nУникальные котики ручной работы из Беларуси.',
    footer_menu: [
      { title: 'Главная', url: '/' },
      { title: 'Каталог', url: '/catalog' },
      { title: 'О нас', url: '/about' },
      { title: 'Доставка', url: '/delivery' },
      { title: 'Контакты', url: '/contacts' }
    ],
    phone: '+375 (29) 800-22-33',
    email: 'blvnyou@yandex.ru',
    address: '224000, г. Брест, пер. Дружный 4-й, д. 15',
    company_name: 'ИП Попова Екатерина Валентиновна',
    unp: '291921539',
    social: [
      { name: 'Telegram', url: 'https://t.me/blvnyou', icon: 'telegram' },
      { name: 'Instagram', url: 'https://instagram.com/blvn.you', icon: 'instagram' }
    ],
    links: [
      { title: 'Политика конфиденциальности', url: '/privacy' },
      { title: 'Публичная оферта', url: '/offer' },
      { title: 'Возврат и обмен', url: '/returns' }
    ]
  }

  const data = { ...defaultData, ...footerData }

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 mt-20">
      <div className="container-custom px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐱</span>
              <span className="font-bold text-xl">blvn.you</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {data.site_description || 'Дофаминовые мелочи для души.\nУникальные котики ручной работы из Беларуси.'}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Меню</h3>
            <ul className="space-y-2 text-sm">
              {data.footer_menu && data.footer_menu.length > 0 ? (
                data.footer_menu.map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.url} className="text-gray-300 hover:text-white transition">
                      {item.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/" className="text-gray-300 hover:text-white transition">Главная</Link></li>
                  <li><Link href="/catalog" className="text-gray-300 hover:text-white transition">Каталог</Link></li>
                  <li><Link href="/about" className="text-gray-300 hover:text-white transition">О нас</Link></li>
                  <li><Link href="/delivery" className="text-gray-300 hover:text-white transition">Доставка</Link></li>
                  <li><Link href="/contacts" className="text-gray-300 hover:text-white transition">Контакты</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Информация</h3>
            <ul className="space-y-2 text-sm">
              {data.links?.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.url} className="text-gray-300 hover:text-white transition">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {data.phone && (
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <a href={`tel:${data.phone.replace(/\s/g, '')}`} className="hover:text-white transition">
                    {data.phone}
                    <span className="hidden">DEBUG_PHONE: {data.phone}</span>
                  </a>
                </li>
              )}
              {data.email && (
                <li className="flex items-center gap-2">
                  <span>✉️</span>
                  <a href={`mailto:${data.email}`} className="hover:text-white transition">
                    {data.email}
                  </a>
                </li>
              )}
              {data.address && (
                <li className="flex items-start gap-2">
                  <span></span>
                  <span>{data.address}</span>
                </li>
              )}
            </ul>

            {data.social && data.social.length > 0 && (
              <div className="flex gap-3 mt-4">
                {data.social.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blvn-pink transition"
                  >
                    {social.icon === 'telegram' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.093.034.305.019.471z"/>
                      </svg>
                    )}
                    {social.icon === 'instagram' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2025 blvn.you — {data.company_name}{data.unp && `, ${data.unp}`}</p>
          <p className="mt-2">Все права защищены. Изделия ручной работы не подлежат возврату.</p>
        </div>
      </div>
    </footer>
  )
}
