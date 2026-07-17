'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Product {
  id: string
  name: string
  description: string
  price: number
  price_rub?: number
  image_url: string
  category: string
  in_stock: boolean
  stock_quantity?: number
  created_at: string
}

const labelToValue: Record<string, string> = {
  'В кимоно': 'kimonos',
  'Самураи': 'samurai',
  'Ниндзя': 'ninja',
  'Особенные': 'special',
  'Аксессуары': 'accessories',
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([
    { value: 'kimonos', label: 'В кимоно' },
    { value: 'special', label: 'Особенные' },
    { value: 'accessories', label: 'Аксессуары' },
  ])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [uploadingAdditional, setUploadingAdditional] = useState(false)
  const [characteristics, setCharacteristics] = useState('{}')

  const [exchangeRate, setExchangeRate] = useState(28)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    price_rub: '',
    category: 'kimonos',
    in_stock: true,
    stock_quantity: 0,
    image_url: '',
  })

  const [isAuth, setIsAuth] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        if (data.role === 'manager') {
          setIsAuth(true)
        } else {
          router.push('/admin/seo')
        }
      } else {
        router.push('/admin/login?redirect=/admin/products')
      }
    } catch {
      router.push('/admin/login?redirect=/admin/products')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.href = '/admin/login'
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProducts(data)
    } catch {
      console.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
    fetchProducts()
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.exchange_rate_byn_to_rub) setExchangeRate(data.exchange_rate_byn_to_rub)
      })
      .catch(() => {})
    fetch('/api/blocks?page=catalog')
      .then((res) => res.json())
      .then((blocks) => {
        const filtersBlock = blocks.find((b: any) => b.block_type === 'filters')
        if (filtersBlock) {
          const raw = typeof filtersBlock.content_json === 'string'
            ? JSON.parse(filtersBlock.content_json)
            : (filtersBlock.content_json || {})
          const labels: string[] = raw.categories || []
          const mapped = labels
            .filter((l) => l !== 'Все' && labelToValue[l])
            .map((l) => ({ value: labelToValue[l], label: l }))
          if (mapped.length > 0) setCategories(mapped)
        }
      })
      .catch(() => {})
  }, [])

  const openNew = () => {
    setForm({ name: '', description: '', price: '', price_rub: '', category: categories[0]?.value || 'kimonos', in_stock: true, stock_quantity: 0, image_url: '' })
    setAdditionalImages([])
    setCharacteristics('{}')
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (p: any) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      price_rub: String(p.price_rub || Math.round(p.price * exchangeRate)),
      category: p.category,
      in_stock: p.in_stock,
      stock_quantity: p.stock_quantity ?? 0,
      image_url: p.image_url,
    })
    setAdditionalImages(p.images || [])
    if (p.characteristics) {
      if (typeof p.characteristics === 'object') {
        setCharacteristics(JSON.stringify(p.characteristics, null, 2))
      } else {
        setCharacteristics(p.characteristics)
      }
    } else {
      setCharacteristics('{}')
    }
    setEditingId(p.id)
    setShowForm(true)
  }

  const handlePriceBynChange = (value: string) => {
    const byn = parseFloat(value) || 0
    setForm({
      ...form,
      price: value,
      price_rub: String(Math.round(byn * exchangeRate)),
    })
  }

  const handlePriceRubChange = (value: string) => {
    setForm({ ...form, price_rub: value })
  }

  const handleSaveExchangeRate = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange_rate_byn_to_rub: exchangeRate }),
      })
      if (!res.ok) throw new Error()
      alert('Курс сохранен!')
    } catch {
      alert('Ошибка сохранения курса')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const { url } = await res.json()
      setForm((prev) => ({ ...prev, image_url: url }))
    } catch (err) {
      console.error(err)
      alert('Ошибка загрузки изображения')
    } finally {
      setUploading(false)
    }
  }

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploadingAdditional(true)

    try {
      const files = Array.from(e.target.files)

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase
          .storage
          .from('products')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase
          .storage
          .from('products')
          .getPublicUrl(fileName)

        setAdditionalImages(prev => [...prev, publicUrl])
      }

      alert('Фото загружены!')
    } catch (error) {
      alert('Ошибка загрузки фото')
    } finally {
      setUploadingAdditional(false)
    }
  }

  const removeAdditionalImage = async (index: number) => {
    const imageUrl = additionalImages[index]

    try {
      const urlParts = imageUrl.split('/products/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]

        const { error } = await supabase
          .storage
          .from('products')
          .remove([filePath])

        if (error) throw error
      }

      setAdditionalImages(prev => prev.filter((_, i) => i !== index))
      alert('Фото удалено')
    } catch (error) {
      alert('Ошибка удаления фото')
    }
  }

  const handleSaveProduct = async () => {
    try {
      let characteristicsObj = {}
      try {
        if (characteristics && characteristics.trim() !== '') {
          characteristicsObj = JSON.parse(characteristics)
        }
      } catch (e) {
        alert('Ошибка в формате JSON характеристик!')
        return
      }

      const productData: any = {
        id: editingId,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price.toString()),
        price_rub: parseFloat(form.price_rub.toString()) || Math.round(parseFloat(form.price.toString()) * exchangeRate),
        category: form.category,
        image_url: form.image_url,
        stock_quantity: form.stock_quantity,
        in_stock: form.stock_quantity > 0,
        characteristics: characteristicsObj,
        images: additionalImages
      }

      if (!editingId) {
        productData.slug = form.name
          .toLowerCase()
          .replace(/[^a-zа-я0-9\s-]/g, '')
          .replace(/\s+/g, '-') + '-' + Date.now()
      }

      const url = editingId
        ? `/api/products?id=${editingId}`
        : '/api/products'

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        alert(editingId ? 'Товар обновлён!' : 'Товар создан!')
        setShowForm(false)
        setEditingId(null)
        fetchProducts()
      } else {
        const data = await response.json()
        alert(data.error || 'Ошибка сохранения')
      }
    } catch (error) {
      alert('Ошибка сети')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      fetchProducts()
    } catch (err) {
      console.error(err)
      alert('Ошибка удаления')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blvn-purple"></div>
      </div>
    )
  }

  if (!isAuth) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="container-custom flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📦 Управление товарами</h1>
          </div>
          <div className="flex gap-3">
            <a href="/admin/manager" className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition text-sm font-medium">
              🏠 Мастерская
            </a>
            <a href="/admin/orders" className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition text-sm font-medium">
              🛒 Заказы
            </a>
            <a href="/admin/seo" className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition text-sm font-medium">
              🎨 SEO
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-nunito font-bold text-3xl text-text-primary">Управление товарами</h1>
            <p className="text-text-secondary">{products.length} товаров</p>
          </div>
          <Button onClick={openNew}>+ Добавить товар</Button>
        </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h2 className="font-semibold mb-3">💱 Курс валют</h2>
        <div className="flex gap-3 items-center flex-wrap">
          <label className="text-sm">1 BYN =</label>
          <input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Number(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <label className="text-sm">RUB</label>
          <Button onClick={handleSaveExchangeRate}>Сохранить курс</Button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Этот курс используется для автоматического расчета цен в RUB
        </p>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-card shadow-soft p-6 mb-8"
        >
          <h2 className="font-nunito font-bold text-xl mb-4">
            {editingId ? 'Редактировать товар' : 'Новый товар'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Название</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-card border-2 border-gray-200 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Цена в BYN *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => handlePriceBynChange(e.target.value)}
                className="w-full px-3 py-2 rounded-card border-2 border-gray-200 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Цена в RUB</label>
              <input
                type="number"
                value={form.price_rub}
                onChange={(e) => handlePriceRubChange(e.target.value)}
                className="w-full px-3 py-2 rounded-card border-2 border-yellow-200 focus:border-primary focus:outline-none bg-yellow-50"
              />
              <p className="text-xs text-text-secondary mt-1">Рассчитывается автоматически, можно изменить вручную</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-card border-2 border-gray-200 focus:border-primary focus:outline-none"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Характеристики (JSON)
              </label>
              <textarea
                value={characteristics}
                onChange={(e) => setCharacteristics(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blvn-pink/50 font-mono text-sm"
                placeholder='{"Материал": "Полимерная глина", "Размер": "5-7 см", "Вес": "20 г"}'
              />
              <p className="text-xs text-gray-500 mt-1">
                В формате JSON: {`{"Характеристика": "Значение"}`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Категория</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-card border-2 border-gray-200 focus:border-primary focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Изображение</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-button file:border-0 file:bg-primary file:text-white file:font-semibold file:text-sm hover:file:bg-primary-dark"
                />
                {uploading && <span className="text-sm text-text-secondary animate-pulse">Загрузка...</span>}
              </div>
              {form.image_url && (
                <div className="mt-2 flex items-center gap-2">
                  <Image src={form.image_url} alt="preview" width={48} height={48} className="w-12 h-12 object-cover rounded-card" />
                  <span className="text-xs text-text-secondary truncate flex-1">{form.image_url}</span>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Дополнительные фото</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAdditionalImageUpload}
                className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {uploadingAdditional && <p className="text-sm text-text-secondary animate-pulse mt-1">Загрузка...</p>}
              {additionalImages.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      <Image
                        src={img}
                        alt={`Additional ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Количество в наличии</label>
              <input
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(e) => {
                  const qty = parseInt(e.target.value) || 0
                  setForm({ ...form, stock_quantity: qty, in_stock: qty > 0 })
                }}
                className="w-full px-3 py-2 rounded-card border-2 border-gray-200 focus:border-primary focus:outline-none"
              />
              <p className="text-xs text-text-secondary mt-1">При 0 товар автоматически станет "Нет в наличии"</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveProduct}>Сохранить</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
          </div>
        </motion.div>
      )}

      <div className="bg-surface rounded-card shadow-soft overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-4 font-nunito font-bold text-sm text-text-secondary">Фото</th>
              <th className="text-left p-4 font-nunito font-bold text-sm text-text-secondary">Товар</th>
              <th className="text-left p-4 font-nunito font-bold text-sm text-text-secondary hidden sm:table-cell">Категория</th>
              <th className="text-left p-4 font-nunito font-bold text-sm text-text-secondary">Цена</th>
              <th className="text-left p-4 font-nunito font-bold text-sm text-text-secondary hidden md:table-cell">Статус</th>
              <th className="text-right p-4 font-nunito font-bold text-sm text-text-secondary">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-background/50">
                <td className="p-4">
                  {p.image_url ? (
                    <Image src={p.image_url} alt="" width={40} height={40} className="w-10 h-10 object-cover rounded-card" />
                  ) : (
                    <span className="text-2xl">🐱</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="font-nunito font-semibold text-sm">{p.name}</span>
                </td>
                <td className="p-4 hidden sm:table-cell text-sm text-text-secondary">
                  {categories.find((c) => c.value === p.category)?.label}
                </td>
                <td className="p-4">
                  <span className="font-nunito font-bold text-sm">{formatPrice(p.price)}</span>
                  {p.price_rub != null && p.price_rub > 0 && (
                    <span className="text-xs text-text-secondary block">~{p.price_rub} RUB</span>
                  )}
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block w-fit ${
                      p.in_stock ? 'bg-success/20 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {p.in_stock ? 'В наличии' : 'Нет'}
                    </span>
                    {p.in_stock && (
                      <span className="text-xs text-text-secondary">Осталось: {p.stock_quantity ?? '—'} шт.</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(p)} className="text-primary hover:text-primary-dark mr-3 text-sm font-semibold">
                    Ред.
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                    Удал.
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text-secondary">
                  Товаров пока нет. Нажмите "+ Добавить товар" чтобы создать первый.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  )
}
