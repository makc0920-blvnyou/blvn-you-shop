'use client'

import { useState } from 'react'

interface SocialLink {
  name: string
  url: string
  icon: string
}

interface FooterLink {
  title: string
  url: string
}

interface FooterEditorProps {
  block: any
  onSave: () => void
  onCancel?: () => void
}

export default function FooterEditor({ block, onSave, onCancel }: FooterEditorProps) {
  console.log('FooterEditor - block:', block)
  console.log('FooterEditor - content_json:', block?.content_json)

  const defaultSocials = [
    { name: 'Telegram', url: 'https://t.me/blvnyou', icon: 'telegram' },
    { name: 'Instagram', url: 'https://instagram.com/blvn.you', icon: 'instagram' }
  ]

  const defaultLinks = [
    { title: 'Политика конфиденциальности', url: '/privacy' },
    { title: 'Публичная оферта', url: '/offer' },
    { title: 'Возврат и обмен', url: '/returns' }
  ]

  const jsonData = block?.content_json || {}

  const [siteDescription, setSiteDescription] = useState(
    jsonData.site_description || 'Дофаминовые мелочи для души.\nУникальные котики ручной работы из Беларуси.'
  )

  const [footerMenu, setFooterMenu] = useState<any[]>(
    jsonData.footer_menu && jsonData.footer_menu.length > 0 ? jsonData.footer_menu : [
      { title: 'Главная', url: '/' },
      { title: 'Каталог', url: '/catalog' },
      { title: 'О нас', url: '/about' },
      { title: 'Доставка', url: '/delivery' },
      { title: 'Контакты', url: '/contacts' }
    ]
  )

  const [phone, setPhone] = useState(jsonData.phone || '+375 (29) 800-22-33')
  const [email, setEmail] = useState(jsonData.email || 'blvnyou@yandex.ru')
  const [address, setAddress] = useState(jsonData.address || '224000, г. Брест, пер. Дружный 4-й, д. 15')
  const [companyName, setCompanyName] = useState(jsonData.company_name || 'ИП Попова Екатерина Валентиновна')
  const [unp, setUnp] = useState(jsonData.unp || '291921539')
  const [socials, setSocials] = useState<any[]>(
    jsonData.social && jsonData.social.length > 0 ? jsonData.social : defaultSocials
  )
  const [links, setLinks] = useState<any[]>(
    jsonData.links && jsonData.links.length > 0 ? jsonData.links : defaultLinks
  )
  const [saving, setSaving] = useState(false)

  const addSocial = () => {
    setSocials([...socials, { name: '', url: '', icon: 'telegram' }])
  }

  const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
    const newSocials = [...socials]
    newSocials[index][field] = value
    setSocials(newSocials)
  }

  const removeSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index))
  }

  const addLink = () => {
    setLinks([...links, { title: '', url: '' }])
  }

  const updateLink = (index: number, field: keyof FooterLink, value: string) => {
    const newLinks = [...links]
    newLinks[index][field] = value
    setLinks(newLinks)
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const addFooterMenuItem = () => {
    setFooterMenu([...footerMenu, { title: '', url: '' }])
  }

  const updateFooterMenuItem = (index: number, field: string, value: string) => {
    const newMenu = [...footerMenu]
    newMenu[index][field] = value
    setFooterMenu(newMenu)
  }

  const removeFooterMenuItem = (index: number) => {
    setFooterMenu(footerMenu.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)

    const dataToSave = {
      id: block.id,
      content_json: {
        site_description: siteDescription,
        footer_menu: footerMenu,
        phone,
        email,
        address,
        company_name: companyName,
        unp,
        social: socials,
        links
      }
    }

    console.log('Saving footer with data:', dataToSave)

    try {
      const response = await fetch('/api/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      })

      if (response.ok) {
        console.log('✅ Footer saved successfully!')

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('footer-updated', {
            detail: dataToSave.content_json
          }))
        }

        onSave()

        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        const error = await response.json()
        console.error('❌ Error saving footer:', error)
      }
    } catch (error) {
      console.error('❌ Error saving footer:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-xl text-gray-900">Редактирование подвала сайта</h3>
          <p className="text-sm text-gray-500">Настройте все секции подвала</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span>🐱</span>
            <span>blvn.you — Описание</span>
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Текст описания (каждая строка с новой линии)
            </label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
              placeholder="Дофаминовые мелочи для души.&#10;Уникальные котики ручной работы из Беларуси."
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <span>📋</span>
              <span>Меню</span>
            </h4>
            <button
              onClick={addFooterMenuItem}
              className="px-3 py-1.5 text-sm bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90 transition flex items-center gap-1"
            >
              <span>+</span>
              <span>Добавить пункт</span>
            </button>
          </div>

          <div className="space-y-3">
            {footerMenu.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blvn-pink/50 transition">
                <div className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateFooterMenuItem(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                      placeholder="Название (например: Главная)"
                    />
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => updateFooterMenuItem(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                      placeholder="URL (например: /)"
                    />
                  </div>
                  <button
                    onClick={() => removeFooterMenuItem(index)}
                    className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition flex items-center justify-center"
                    title="Удалить пункт"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Контактная информация</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="+375 (29) 800-22-33"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="blvnyou@yandex.ru"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Адрес
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="224000, г. Брест, пер. Дружный 4-й, д. 15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название компании
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="ИП Попова Екатерина Валентиновна"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                УНП
              </label>
              <input
                type="text"
                value={unp}
                onChange={(e) => setUnp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="291921539"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Социальные сети
            </label>
            <button
              onClick={addSocial}
              className="px-3 py-1 text-sm bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90"
            >
              + Добавить
            </button>
          </div>

          <div className="space-y-3">
            {socials.map((social, index) => (
              <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={social.name}
                    onChange={(e) => updateSocial(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Название (Telegram)"
                  />
                  <input
                    type="text"
                    value={social.url}
                    onChange={(e) => updateSocial(index, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="URL (https://t.me/...)"
                  />
                  <select
                    value={social.icon}
                    onChange={(e) => updateSocial(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="instagram">Instagram</option>
                    <option value="vkontakte">ВКонтакте</option>
                  </select>
                </div>
                <button
                  onClick={() => removeSocial(index)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Ссылки в подвале
            </label>
            <button
              onClick={addLink}
              className="px-3 py-1 text-sm bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90"
            >
              + Добавить
            </button>
          </div>

          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => updateLink(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Название"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="URL (/privacy)"
                  />
                </div>
                <button
                  onClick={() => removeLink(index)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {saving ? 'Сохранение...' : '💾 Сохранить'}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Отмена
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
