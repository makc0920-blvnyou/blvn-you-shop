'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface MenuItem {
  title: string
  url: string
}

interface HeaderEditorProps {
  block: any
  onSave: () => void
  onCancel?: () => void
}

export default function HeaderEditor({ block, onSave, onCancel }: HeaderEditorProps) {
  const defaultMenu = [
    { title: 'Главная', url: '/' },
    { title: 'Каталог', url: '/catalog' },
    { title: 'О нас', url: '/about' },
    { title: 'Доставка', url: '/delivery' },
    { title: 'Контакты', url: '/contacts' }
  ]

  const [logoUrl, setLogoUrl] = useState(block.content_json?.logo_url || '/logo.png')
  const [menuItems, setMenuItems] = useState<MenuItem[]>(
    block.content_json?.menu && block.content_json.menu.length > 0
      ? block.content_json.menu
      : defaultMenu
  )
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]

      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase
        .storage
        .from('products')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase
        .storage
        .from('products')
        .getPublicUrl(fileName)

      setLogoUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Ошибка загрузки логотипа!')
    } finally {
      setUploading(false)
    }
  }

  const addMenuItem = () => {
    setMenuItems([...menuItems, { title: '', url: '' }])
  }

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const newItems = [...menuItems]
    newItems[index][field] = value
    setMenuItems(newItems)
  }

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await fetch('/api/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: block.id,
          content_json: {
            logo_url: logoUrl,
            menu: menuItems
          }
        })
      })

      if (response.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Error saving header:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blvn-pink/10 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-blvn-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-xl text-gray-900">Редактирование шапки сайта</h3>
          <p className="text-sm text-gray-500">Настройте логотип и меню навигации</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🖼️ Логотип сайта
          </label>

          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-2">
              Загрузить новый логотип:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blvn-pink/50 disabled:opacity-50"
              />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 border-2 border-blvn-pink border-t-transparent rounded-full animate-spin"></div>
                  <span>Загрузка...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Поддерживаемые форматы: PNG, JPG, JPEG (макс. 5MB)
            </p>
          </div>

          {logoUrl && (
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <p className="text-xs text-gray-600 mb-2">Текущий логотип:</p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-pink-200">
                  {logoUrl.includes('http') ? (
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blvn-pink/20 rounded-full flex items-center justify-center text-2xl">
                      🐱
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 truncate">{logoUrl.split('/').pop()}</p>
                </div>
                <button
                  onClick={() => setLogoUrl('')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              📋 Пункты меню
            </label>
            <button
              onClick={addMenuItem}
              className="px-3 py-1.5 text-sm bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90 transition flex items-center gap-1"
            >
              <span>+</span>
              <span>Добавить</span>
            </button>
          </div>

          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-blvn-pink/50 transition">
                <div className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateMenuItem(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                      placeholder="Название (например: Главная)"
                    />
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => updateMenuItem(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blvn-pink/50"
                      placeholder="URL (например: /)"
                    />
                  </div>
                  <button
                    onClick={() => removeMenuItem(index)}
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

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-6 py-2.5 bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {saving ? 'Сохранение...' : 'Сохранить'}
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
