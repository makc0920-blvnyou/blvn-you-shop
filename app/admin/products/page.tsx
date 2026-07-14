'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  in_stock: boolean
  created_at: string
}

const categories = [
  { value: 'kimonos', label: 'В кимоно' },
  { value: 'special', label: 'Особенные' },
  { value: 'accessories', label: 'Аксессуары' },
]

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [uploadingAdditional, setUploadingAdditional] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'kimonos',
    in_stock: true,
    image_url: '',
  })

  const checkAuth = async () => {
    const res = await fetch('/api/admin/check')
    if (!res.ok) router.push('/admin/login')
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
  }, [])

  const openNew = () => {
    setForm({ name: '', description: '', price: '', category: 'kimonos', in_stock: true, image_url: '' })
    setAdditionalImages([])
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (p: any) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      in_stock: p.in_stock,
      image_url: p.image_url,
    })
    setAdditionalImages(p.images || [])
    setEditingId(p.id)
    setShowForm(true)
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

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingAdditional(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) throw new Error('Upload failed')

        const { url } = await res.json()
        urls.push(url)
      }
      setAdditionalImages((prev) => [...prev, ...urls])
    } catch (err) {
      console.error(err)
      alert('Ошибка загрузки дополнительных изображений')
    } finally {
      setUploadingAdditional(false)
    }
  }

  const removeAdditionalImage = (idx: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Введите название')
    if (!form.price || isNaN(Number(form.price))) return alert('Введите корректную цену')

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        in_stock: form.in_stock,
        image_url: form.image_url,
        images: additionalImages,
      }

      const res = editingId
        ? await fetch(`/api/products/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) throw new Error('Save failed')

      setShowForm(false)
      setEditingId(null)
      fetchProducts()
    } catch (err) {
      console.error(err)
      alert('Ошибка сохранения')
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-text-secondary">Загрузка товаров...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-nunito font-bold text-3xl text-text-primary">Управление товарами</h1>
          <p className="text-text-secondary">{products.length} товаров</p>
        </div>
        <Button onClick={openNew}>+ Добавить товар</Button>
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
              <label className="block text-sm font-semibold mb-1">Цена (BYN)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 rounded-card border-2 border-gray-200 focus:border-primary focus:outline-none"
              />
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
                  <img src={form.image_url} alt="preview" className="w-12 h-12 object-cover rounded-card" />
                  <span className="text-xs text-text-secondary truncate flex-1">{form.image_url}</span>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Дополнительные фото (можно несколько)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAdditionalImagesUpload}
                className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-text-secondary mt-1">Загрузите 2-5 дополнительных фото товара</p>
              {uploadingAdditional && <p className="text-sm text-text-secondary animate-pulse mt-1">Загрузка...</p>}
              {additionalImages.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img src={img} alt={`Additional ${idx}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeAdditionalImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inStock"
                checked={form.in_stock}
                onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                className="accent-primary w-4 h-4"
              />
              <label htmlFor="inStock" className="text-sm font-semibold">В наличии</label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving}>Сохранить</Button>
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
                    <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded-card" />
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
                <td className="p-4 font-nunito font-bold text-sm">{formatPrice(p.price)}</td>
                <td className="p-4 hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    p.in_stock ? 'bg-success/20 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {p.in_stock ? 'В наличии' : 'Нет'}
                  </span>
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
  )
}
