'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product, SiteSeoSettings } from '@/types'
import { useToast } from '@/context/ToastContext'
import HeaderEditor from './header-editor'
import FooterEditor from './footer-editor'
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableBlockProps {
  block: any
  onEdit: (block: any) => void
  onDelete: (id: string) => void
  onPreview?: (block: any) => void
}

function SortableBlock({ block, onEdit, onDelete, onPreview }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50 cursor-move"
      {...attributes}
      {...listeners}
    >
      <td className="px-4 py-3 text-center text-gray-400">⋮</td>
      <td className="px-4 py-3 text-sm font-mono">{block.order_index}</td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
          {block.block_type}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium">{block.title || 'Без заголовка'}</div>
        <div className="text-xs text-gray-500 line-clamp-1">{block.content}</div>
      </td>
      <td className="px-4 py-3 text-center">
        {block.is_visible ? (
          <span className="text-green-600">✓</span>
        ) : (
          <span className="text-red-600">✗</span>
        )}
      </td>
      <td className="px-4 py-3 text-right space-x-2">
        <button
          onClick={() => onPreview?.(block)}
          className="px-3 py-1 text-sm bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition"
        >
          👁️ Preview
        </button>
        <button
          onClick={() => onEdit(block)}
          className="px-3 py-1 text-sm bg-blvn-pink/10 text-blvn-pink rounded hover:bg-blvn-pink/20 transition"
        >
          Редактировать
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
        >
          Удалить
        </button>
      </td>
    </tr>
  )
}

export default function SEOManagerPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isAuth, setIsAuth] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authRole, setAuthRole] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState('products')
  const [pages, setPages] = useState<any[]>([])
  const [allPages, setAllPages] = useState<any[]>([])
  const [editingPage, setEditingPage] = useState<any>(null)
  const [blocks, setBlocks] = useState<any[]>([])
  const [editingBlock, setEditingBlock] = useState<any>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedPageForBlocks, setSelectedPageForBlocks] = useState('home')
  const [productBlocksTab, setProductBlocksTab] = useState<'list' | 'blocks'>('list')
  const [selectedProductForBlocks, setSelectedProductForBlocks] = useState<any>(null)
  const [productBlocks, setProductBlocks] = useState<any[]>([])
  const [editingProductBlock, setEditingProductBlock] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewBlock, setPreviewBlock] = useState<any>(null)
  const [previewChanges, setPreviewChanges] = useState<any>(null)
  const [showStyleEditor, setShowStyleEditor] = useState(false)
  const [blockStyles, setBlockStyles] = useState({
    background_color: '#ffffff',
    background_gradient: '',
    text_color: '#1f2937',
    accent_color: '#ec4899',
    card_background: '#ffffff',
    border_color: '#e5e7eb'
  })

  const loadBlockStyles = (block: any) => {
    const existingStyles = block?.content_json?.style || {}
    setBlockStyles({
      background_color: existingStyles.background_color || '#ffffff',
      background_gradient: existingStyles.background_gradient || '',
      text_color: existingStyles.text_color || '#1f2937',
      accent_color: existingStyles.accent_color || '#ec4899',
      card_background: existingStyles.card_background || '#ffffff',
      border_color: existingStyles.border_color || '#e5e7eb'
    })
  }

  const getPageName = (pageId: string) => {
    const names: Record<string, string> = {
      home: 'Главная',
      catalog: 'Каталог',
      about: 'О нас',
      delivery: 'Доставка',
      contacts: 'Контакты',
      products: 'Товары',
      header: 'Шапка сайта',
      footer: 'Подвал сайта'
    }
    return names[pageId] || pageId
  }

  const pageList = [
    { id: 'home', name: 'Главная', icon: '🏠' },
    { id: 'catalog', name: 'Каталог', icon: '📦' },
    { id: 'about', name: 'О нас', icon: 'ℹ️' },
    { id: 'delivery', name: 'Доставка', icon: '📦' },
    { id: 'contacts', name: 'Контакты', icon: '📞' },
    { id: 'privacy', name: 'Политика', icon: '🔒' },
    { id: 'offer', name: 'Оферта', icon: '📄' },
    { id: 'returns', name: 'Возврат', icon: '↩️' },
  ]

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    console.log('Drag ended:', { active: active.id, over: over?.id })

    if (!over) return

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)

      console.log('Moving from index', oldIndex, 'to', newIndex)

      const newBlocks = arrayMove(blocks, oldIndex, newIndex)

      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        order_index: index
      }))

      console.log('Updated blocks order:', updatedBlocks.map(b => ({ id: b.id, order: b.order_index })))

      setBlocks(updatedBlocks)

      try {
        const savePromises = updatedBlocks.map(block =>
          fetch('/api/blocks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: block.id,
              order_index: block.order_index
            })
          })
        )

        const results = await Promise.all(savePromises)
        const allSuccess = results.every(r => r.ok)

        if (allSuccess) {
          console.log('✅ Порядок блоков сохранён в базе')
          alert('✅ Порядок блоков обновлён!')
        } else {
          console.error('❌ Ошибка при сохранении порядка')
        }
      } catch (error) {
        console.error('Error saving order:', error)
      }
    }
  }

  const [siteSettings, setSiteSettings] = useState<any>({
    site_name: 'blvn.you',
    default_og_title: '',
    default_og_description: '',
    default_og_image: '',
    google_verification_code: '',
    yandex_verification_code: '',
    sitemap_xml: '',
    robots_txt: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        if (data.role === 'content' || data.role === 'manager') {
          setIsAuth(true)
          setAuthRole(data.role)
        } else {
          router.push('/admin/login?redirect=/admin/seo')
        }
      } else {
        router.push('/admin/login?redirect=/admin/seo')
      }
    } catch {
      router.push('/admin/login?redirect=/admin/seo')
    } finally {
      setAuthLoading(false)
      fetchProducts()
      fetchBlocks('home')
      fetchSiteSettings()
    }
  }

  useEffect(() => {
    if (activeTab === 'pages') {
      fetchPages()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'blocks') {
      fetchBlocks(selectedPageForBlocks)
    }
  }, [selectedPageForBlocks, activeTab])

  useEffect(() => {
    if (editingBlock) {
      loadBlockStyles(editingBlock)
      setShowStyleEditor(false)
    }
  }, [editingBlock?.id])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchPages = async () => {
    try {
      const productsResponse = await fetch('/api/products')
      const productsData = await productsResponse.json()

      const productPages = productsData.map((product: any) => ({
        id: product.id,
        slug: `product/${product.slug}`,
        title: product.name,
        content: product.description,
        meta_title: product.meta_title,
        meta_description: product.meta_description,
        meta_image: product.image_url,
        is_product: true,
        product_data: product
      }))

      setAllPages(productPages)
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
  }

  const fetchBlocks = async (pageId: string = selectedPageForBlocks) => {
    try {
      const response = await fetch(`/api/blocks?page=${pageId}`)
      const data = await response.json()
      setBlocks(data)
    } catch (error) {
      console.error('Error fetching blocks:', error)
    }
  }

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/site-settings')
      const data = await response.json()
      if (data && Object.keys(data).length > 0) {
        setSiteSettings(data)
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
    }
  }

  const fetchProductBlocks = async (productId: string) => {
    try {
      const response = await fetch(`/api/blocks?page=product_${productId}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching product blocks:', error)
      return []
    }
  }

  const handleSaveProductBlock = async () => {
    if (!editingProductBlock || !selectedProductForBlocks) return

    try {
      const blockData = {
        ...editingProductBlock,
        page_id: `product_${selectedProductForBlocks.id}`
      }

      const response = await fetch('/api/blocks', {
        method: editingProductBlock.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData)
      })

      if (response.ok) {
        showToast('Блок сохранён!', '')
        setEditingProductBlock(null)

        const blocksResponse = await fetch(`/api/blocks?page=product_${selectedProductForBlocks.id}`)
        const data = await blocksResponse.json()
        setProductBlocks(data)
      } else {
        const data = await response.json()
        showToast(data.error || 'Ошибка сохранения', '')
      }
    } catch (error) {
      showToast('Ошибка сети', '')
    }
  }

  const handleDeleteProductBlock = async (blockId: string) => {
    if (!confirm('Удалить блок?')) return

    try {
      const response = await fetch('/api/blocks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blockId })
      })

      if (response.ok) {
        showToast('Блок удалён!', '')
        if (selectedProductForBlocks) {
          const blocksResponse = await fetch(`/api/blocks?page=product_${selectedProductForBlocks.id}`)
          const data = await blocksResponse.json()
          setProductBlocks(data)
        }
      } else {
        showToast('Ошибка удаления', '')
      }
    } catch (error) {
      showToast('Ошибка сети', '')
    }
  }

  const handleSaveProductSEO = async () => {
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/products?id=${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_title: editingProduct.meta_title || null,
          meta_description: editingProduct.meta_description || null,
          slug: editingProduct.slug
        })
      })

      if (response.ok) {
        showToast('SEO настройки товара сохранены!', '')
        setEditingProduct(null)
        fetchProducts()
      } else {
        const data = await response.json()
        showToast(data.error || 'Ошибка сохранения', '')
      }
    } catch (error) {
      showToast('Ошибка сети', '')
    }
  }

  const handleSavePage = async () => {
    if (!editingPage) return

    try {
      if (editingPage.is_product) {
        const response = await fetch(`/api/products?id=${editingPage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meta_title: editingPage.meta_title,
            meta_description: editingPage.meta_description,
            slug: editingPage.slug.replace('product/', '')
          })
        })

        if (response.ok) {
          showToast('SEO настройки товара сохранены!', '')
          setEditingPage(null)
          fetchPages()
        } else {
          const data = await response.json()
          showToast(data.error || 'Ошибка сохранения', '')
        }
      } else {
        const response = await fetch('/api/pages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingPage)
        })

        const data = await response.json()

        if (response.ok) {
          showToast('Страница сохранена!', '')
          setEditingPage(null)
          fetchPages()
        } else {
          showToast(data.error || 'Ошибка сохранения', '')
        }
      }
    } catch (error) {
      showToast('Ошибка сети', '')
    }
  }

  const handleSaveSiteSettings = async () => {
    console.log('💰 Saving site settings:', siteSettings)

    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      })

      const data = await response.json()
      console.log('Response:', response.status, data)

      if (response.ok) {
        alert('✅ Настройки сайта сохранены!')
      } else {
        alert('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'))
        console.error('Save error:', data)
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('❌ Ошибка сети: ' + error)
    }
  }

  const handleSaveBlock = async () => {
    try {
      const payload = {
        id: editingBlock.id,
        block_type: editingBlock.block_type,
        title: editingBlock.title,
        content: editingBlock.content,
        content_json: {
          ...editingBlock.content_json,
          style: blockStyles
        },
        order_index: editingBlock.order_index,
        page_id: editingBlock.page_id,
        is_visible: editingBlock.is_visible
      };

      console.log('💾 Сохраняем блок:', payload);

      const response = await fetch('/api/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);
      const result = await response.json();
      console.log('✅ Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save');
      }

      alert('✅ Блок сохранен!');
      fetchBlocks();
      setEditingBlock(null);
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('❌ Ошибка: ' + error.message);
    }
  }

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('Удалить этот блок?')) return

    try {
      const response = await fetch('/api/blocks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        alert('✅ Блок удалён!')
        fetchBlocks()
      } else {
        alert('❌ Ошибка удаления')
      }
    } catch (error) {
      alert('❌ Ошибка сети')
    }
  }

  const handlePreview = (block: any) => {
    setPreviewBlock(block)
    setPreviewChanges({ ...block })
    setShowPreview(true)
  }

  const handleApplyPreview = async () => {
    if (!previewChanges) return

    console.log('Applying preview changes:', previewChanges)

    try {
      let contentJson = previewChanges.content_json
      if (typeof contentJson === 'string') {
        contentJson = JSON.parse(contentJson)
      }

      const response = await fetch('/api/blocks', {
        method: previewChanges.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...previewChanges,
          content_json: contentJson
        })
      })

      const data = await response.json()
      console.log('Response:', response.status, data)

      if (response.ok) {
        alert('✅ Блок сохранён!')
        setShowPreview(false)
        setPreviewBlock(null)
        setPreviewChanges(null)
        fetchBlocks()
      } else {
        alert('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'))
      }
    } catch (error: any) {
      console.error('Save error:', error)
      alert('❌ Ошибка сохранения (проверьте формат JSON): ' + error.message)
    }
  }

  const handleCancelPreview = () => {
    setShowPreview(false)
    setPreviewBlock(null)
    setPreviewChanges(null)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/admin/login')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!isAuth) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SEO Панель</h1>
            <p className="text-sm text-gray-500">{authRole === 'manager' ? 'Администратор' : 'SEO Менеджер'}</p>
          </div>
          <div className="flex gap-3">
            <a href="/" target="_blank" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">🌐 Сайт</a>
            <button onClick={handleLogout} className="px-4 py-2 text-sm text-red-600 hover:text-red-800">Выйти</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 border-b">
          <button onClick={() => { setActiveTab('products'); fetchProducts(); }} className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'text-blvn-pink border-b-2 border-blvn-pink' : 'text-gray-500 hover:text-gray-700'}`}>
            🛍️ Товары ({products.length})
          </button>
          <button onClick={() => setActiveTab('pages')} className={`px-4 py-2 font-medium ${activeTab === 'pages' ? 'text-blvn-pink border-b-2 border-blvn-pink' : 'text-gray-500 hover:text-gray-700'}`}>
            📄 Страницы
          </button>
          <button onClick={() => setActiveTab('blocks')} className={`px-4 py-2 font-medium ${activeTab === 'blocks' ? 'text-blvn-pink border-b-2 border-blvn-pink' : 'text-gray-500 hover:text-gray-700'}`}>
            🧩 Блоки сайта
          </button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-blvn-pink border-b-2 border-blvn-pink' : 'text-gray-500 hover:text-gray-700'}`}>
            ⚙️ Настройки сайта
          </button>
          <button onClick={() => setActiveTab('styles')} className={`px-4 py-2 font-medium ${activeTab === 'styles' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-700'}`}>
            🎨 Стили
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            {productBlocksTab === 'blocks' && selectedProductForBlocks ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Блоки товара: {selectedProductForBlocks.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      URL: /product/{selectedProductForBlocks.slug}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedProductForBlocks(null)
                        setProductBlocksTab('list')
                        setEditingProductBlock(null)
                        setProductBlocks([])
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      ← Назад к товарам
                    </button>
                    <button
                      onClick={() => setEditingProductBlock({
                        block_type: 'product_description',
                        title: '',
                        content: '',
                        content_json: {},
                        order_index: productBlocks.length + 1,
                        is_visible: true
                      })}
                      className="px-4 py-2 bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90"
                    >
                      + Добавить блок
                    </button>
                  </div>
                </div>

                {editingProductBlock ? (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">
                      {editingProductBlock.id ? 'Редактирование блока' : 'Добавление блока'}
                    </h3>

                    <div className="space-y-4 max-w-2xl">
                      <div>
                        <label className="block text-sm font-medium mb-1">Тип блока</label>
                        <select
                          value={editingProductBlock.block_type}
                          onChange={(e) => setEditingProductBlock({...editingProductBlock, block_type: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="product_description">Описание</option>
                          <option value="product_characteristics">Характеристики</option>
                          <option value="product_reviews">Отзывы</option>
                          <option value="custom">Произвольный</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Заголовок</label>
                        <input
                          type="text"
                          value={editingProductBlock.title}
                          onChange={(e) => setEditingProductBlock({...editingProductBlock, title: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Например: Характеристики"
                        />
                      </div>

                      {editingProductBlock.block_type === 'product_characteristics' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Характеристики (JSON формат)
                          </label>
                          <textarea
                            value={typeof editingProductBlock.content_json === 'object'
                              ? JSON.stringify(editingProductBlock.content_json, null, 2)
                              : editingProductBlock.content_json || ''}
                            onChange={(e) => {
                              try {
                                const json = JSON.parse(e.target.value)
                                setEditingProductBlock({...editingProductBlock, content_json: json})
                              } catch {
                                setEditingProductBlock({...editingProductBlock, content_json: e.target.value})
                              }
                            }}
                            rows={8}
                            className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                            placeholder='{"Материал": "Полимерная глина", "Размер": "5-7 см", "Вес": "20 г"}'
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            В формате JSON: {`{"Характеристика": "Значение"}`}
                          </p>
                        </div>
                      )}

                      {editingProductBlock.block_type === 'product_reviews' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Отзывы (JSON массив)
                          </label>
                          <textarea
                            value={typeof editingProductBlock.content_json === 'object' && Array.isArray(editingProductBlock.content_json)
                              ? JSON.stringify(editingProductBlock.content_json, null, 2)
                              : editingProductBlock.content_json || ''}
                            onChange={(e) => {
                              try {
                                const json = JSON.parse(e.target.value)
                                setEditingProductBlock({...editingProductBlock, content_json: json})
                              } catch {
                                setEditingProductBlock({...editingProductBlock, content_json: e.target.value})
                              }
                            }}
                            rows={10}
                            className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                            placeholder='[{"author": "Иван", "text": "Отличный товар!", "rating": 5}]'
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Пример: {`[{"author": "Имя", "text": "Текст отзыва", "rating": 5}]`}
                          </p>
                        </div>
                      )}

                      {(editingProductBlock.block_type === 'product_description' || editingProductBlock.block_type === 'custom') && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Основной текст</label>
                          <textarea
                            value={editingProductBlock.content || ''}
                            onChange={(e) => setEditingProductBlock({...editingProductBlock, content: e.target.value})}
                            rows={6}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Содержимое блока..."
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-1">Порядок отображения</label>
                        <input
                          type="number"
                          value={editingProductBlock.order_index}
                          onChange={(e) => setEditingProductBlock({...editingProductBlock, order_index: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border rounded-lg"
                          min="1"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="block_is_visible"
                          checked={editingProductBlock.is_visible}
                          onChange={(e) => setEditingProductBlock({...editingProductBlock, is_visible: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <label htmlFor="block_is_visible" className="text-sm font-medium">
                          Блок виден на сайте
                        </label>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleSaveProductBlock}
                          className="px-6 py-2 bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90"
                        >
                          💾 Сохранить
                        </button>
                        <button
                          onClick={() => setEditingProductBlock(null)}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {productBlocks.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <p className="text-4xl mb-2">📦</p>
                        <p>У этого товара пока нет блоков</p>
                        <p className="text-sm mt-2">Нажми &quot;+ Добавить блок&quot; чтобы создать</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Порядок</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Тип</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Заголовок</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Видимость</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {productBlocks.map((block: any) => (
                            <tr key={block.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{block.order_index}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                                  {block.block_type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">{block.title}</td>
                              <td className="px-4 py-3 text-center">
                                {block.is_visible ? (
                                  <span className="text-green-600">✓</span>
                                ) : (
                                  <span className="text-gray-400">✗</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right space-x-2">
                                <button
                                  onClick={() => setEditingProductBlock(block)}
                                  className="px-3 py-1 text-sm bg-blvn-pink/10 text-blvn-pink rounded hover:bg-blvn-pink/20"
                                >
                                  Редактировать
                                </button>
                                <button
                                  onClick={() => handleDeleteProductBlock(block.id)}
                                  className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                                >
                                  Удалить
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ) : editingProduct ? (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">
                  Редактирование SEO: {editingProduct.name}
                </h2>

                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      URL (slug) *
                    </label>
                    <input
                      type="text"
                      value={editingProduct.slug || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        slug: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="kotik-v-izumrudnom-kimono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Страница: /product/{editingProduct.slug || '...'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Meta Title (заголовок в Google)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.meta_title || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        meta_title: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder={`Купить ${editingProduct.name} | blvn.you`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Оптимально: 50-60 символов (сейчас: {(editingProduct.meta_title || '').length})
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Meta Description (описание в Google)
                    </label>
                    <textarea
                      value={editingProduct.meta_description || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        meta_description: e.target.value
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Описание товара для поисковиков..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Оптимально: 150-160 символов (сейчас: {(editingProduct.meta_description || '').length})
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProductSEO}
                      className="px-6 py-2 bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90"
                    >
                      💾 Сохранить SEO
                    </button>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Фото</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Название</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">URL</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Meta Title</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.price} BYN</div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            /product/{product.slug || 'не задан'}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600 max-w-xs truncate">
                            {product.meta_title || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={async () => {
                              setSelectedProductForBlocks(product)
                              setProductBlocksTab('blocks')
                              const res = await fetch(`/api/blocks?page=product_${product.id}`)
                              const data = await res.json()
                              setProductBlocks(data)
                            }}
                            className="px-3 py-1 text-sm bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                          >
                            🧩 Блоки
                          </button>
                          <button
                            onClick={() => setEditingProduct({
                              id: product.id,
                              name: product.name,
                              slug: product.slug || '',
                              meta_title: product.meta_title || '',
                              meta_description: product.meta_description || ''
                            } as any)}
                            className="px-3 py-1 text-sm bg-blvn-pink/10 text-blvn-pink rounded hover:bg-blvn-pink/20"
                          >
                            SEO
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pages' && (
          <div>
            {editingPage ? (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">
                  Редактирование: {editingPage.title}
                  {editingPage.is_product && <span className="text-sm text-blvn-pink ml-2">(Товар)</span>}
                </h2>

                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      /{editingPage.slug}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Заголовок (H1)</label>
                    <input
                      type="text"
                      value={editingPage.title || ''}
                      onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={editingPage.is_product}
                    />
                    {editingPage.is_product && (
                      <p className="text-xs text-gray-500 mt-1">Название товара редактируется в разделе &quot;Товары&quot;</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={editingPage.meta_title || ''}
                      onChange={(e) => setEditingPage({...editingPage, meta_title: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <textarea
                      value={editingPage.meta_description || ''}
                      onChange={(e) => setEditingPage({...editingPage, meta_description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSavePage}
                      className="px-6 py-2 bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90"
                    >
                      💾 Сохранить
                    </button>
                    <button
                      onClick={() => setEditingPage(null)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Страница</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">URL</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Meta Title</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allPages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{page.title}</div>
                          {page.is_product && (
                            <span className="text-xs text-blvn-pink">🛍️ Товар</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            /{page.slug}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {page.meta_title || 'Не задан'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setEditingPage(page)}
                            className="px-3 py-1 text-sm bg-blvn-pink/10 text-blvn-pink rounded hover:bg-blvn-pink/20"
                          >
                            Редактировать
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'blocks' && (
          <div>
            {editingBlock ? (
              selectedPageForBlocks === 'header' && editingBlock.block_type === 'header' ? (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Редактирование шапки сайта</h3>
                  <HeaderEditor
                    block={editingBlock}
                    onSave={() => {
                      setEditingBlock(null)
                      fetchBlocks()
                    }}
                    onCancel={() => setEditingBlock(null)}
                  />
                </div>
              ) : selectedPageForBlocks === 'footer' && editingBlock.block_type === 'footer' ? (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Редактирование подвала сайта</h3>
                  <FooterEditor
                    block={editingBlock}
                    onSave={() => {
                      setEditingBlock(null)
                      fetchBlocks()
                    }}
                    onCancel={() => setEditingBlock(null)}
                  />
                </div>
              ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">
                  {editingBlock.id ? 'Редактирование блока' : 'Новый блок'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Тип блока</label>
                    <select
                      value={editingBlock.block_type}
                      onChange={(e) => setEditingBlock({...editingBlock, block_type: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="hero">Hero (Главный баннер)</option>
                      <option value="features">Features (Преимущества)</option>
                      <option value="footer">Footer (Подвал)</option>
                      <option value="text">Text (Простой текст)</option>
                      <option value="image">Image (Изображение)</option>
                      <option value="cta">CTA (Призыв к действию)</option>
                      <option value="custom">Custom (Произвольный)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Порядок отображения</label>
                    <input
                      type="number"
                      value={editingBlock.order_index}
                      onChange={(e) => setEditingBlock({...editingBlock, order_index: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Меньшее число = выше на странице</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Заголовок блока</label>
                    <input
                      type="text"
                      value={editingBlock.title || ''}
                      onChange={(e) => setEditingBlock({...editingBlock, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Основной текст</label>
                    <textarea
                      value={editingBlock.content || ''}
                      onChange={(e) => setEditingBlock({...editingBlock, content: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Дополнительные данные (JSON)
                    </label>
                    <textarea
                      value={typeof editingBlock.content_json === 'string' ? editingBlock.content_json : JSON.stringify(editingBlock.content_json, null, 2)}
                      onChange={(e) => setEditingBlock({...editingBlock, content_json: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                      placeholder='{"key": "value"}'
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Используйте для сложных блоков (например, массив преимуществ или ссылки футера). Должен быть валидный JSON.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">URL изображения (если нужно)</label>
                    <input
                      type="text"
                      value={editingBlock.image_url || ''}
                      onChange={(e) => setEditingBlock({...editingBlock, image_url: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_visible"
                      checked={editingBlock.is_visible}
                      onChange={(e) => setEditingBlock({...editingBlock, is_visible: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_visible" className="text-sm font-medium">Блок виден на сайте</label>
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">🎨 Стили блока</h3>
                    <button
                      type="button"
                      onClick={() => setShowStyleEditor(!showStyleEditor)}
                      className="text-sm text-blvn-pink hover:text-blvn-pink/80"
                    >
                      {showStyleEditor ? 'Скрыть' : 'Показать'} настройки
                    </button>
                  </div>

                  {showStyleEditor && (
                    <div className="space-y-4 bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Готовые пресеты
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setBlockStyles({
                              background_color: '#ffffff',
                              background_gradient: '',
                              text_color: '#1f2937',
                              accent_color: '#ec4899',
                              card_background: '#ffffff',
                              border_color: '#e5e7eb'
                            })}
                            className="p-2 bg-white rounded-lg border-2 border-transparent hover:border-pink-500 text-left text-sm"
                          >
                            <span>Светлый</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setBlockStyles({
                              background_color: '#1f2937',
                              background_gradient: '',
                              text_color: '#f9fafb',
                              accent_color: '#ec4899',
                              card_background: '#374151',
                              border_color: '#4b5563'
                            })}
                            className="p-2 bg-gray-800 text-white rounded-lg border-2 border-transparent hover:border-pink-500 text-left text-sm"
                          >
                            <span>Тёмный</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setBlockStyles({
                              background_color: '#fdf2f8',
                              background_gradient: '',
                              text_color: '#1f2937',
                              accent_color: '#ec4899',
                              card_background: '#ffffff',
                              border_color: '#e5e7eb'
                            })}
                            className="p-2 bg-pink-100 rounded-lg border-2 border-transparent hover:border-pink-500 text-left text-sm"
                          >
                            <span>Розовый</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Фон блока
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={blockStyles.background_color}
                              onChange={(e) => setBlockStyles({...blockStyles, background_color: e.target.value})}
                              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={blockStyles.background_color}
                              onChange={(e) => setBlockStyles({...blockStyles, background_color: e.target.value})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Цвет текста
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={blockStyles.text_color}
                              onChange={(e) => setBlockStyles({...blockStyles, text_color: e.target.value})}
                              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={blockStyles.text_color}
                              onChange={(e) => setBlockStyles({...blockStyles, text_color: e.target.value})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="#1f2937"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Акцентный цвет
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={blockStyles.accent_color}
                              onChange={(e) => setBlockStyles({...blockStyles, accent_color: e.target.value})}
                              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={blockStyles.accent_color}
                              onChange={(e) => setBlockStyles({...blockStyles, accent_color: e.target.value})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="#ec4899"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Градиент (CSS)
                          </label>
                          <input
                            type="text"
                            value={blockStyles.background_gradient}
                            onChange={(e) => setBlockStyles({...blockStyles, background_gradient: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          />
                        </div>
                      </div>

                      <div
                        className="p-4 rounded-lg border-2"
                        style={{
                          backgroundColor: blockStyles.background_gradient || blockStyles.background_color,
                          color: blockStyles.text_color,
                          borderColor: blockStyles.border_color
                        }}
                      >
                        <p className="font-medium mb-2">Предпросмотр блока</p>
                        <p className="text-sm mb-3">Так будет выглядеть ваш блок</p>
                        <button
                          className="px-4 py-2 rounded text-white text-sm"
                          style={{ backgroundColor: blockStyles.accent_color }}
                        >
                          Кнопка
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveBlock}
                    className="px-6 py-2 bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90"
                  >
                    💾 Сохранить блок
                  </button>
                  <button
                    onClick={() => setEditingBlock(null)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )
          ) : (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Выберите страницу для редактирования:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedPageForBlocks('home')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedPageForBlocks === 'home'
                          ? 'bg-blvn-pink text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🏠 Главная
                    </button>
                    <button
                      onClick={() => setSelectedPageForBlocks('catalog')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedPageForBlocks === 'catalog'
                          ? 'bg-blvn-pink text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📦 Каталог
                    </button>
                    <button
                      onClick={() => setSelectedPageForBlocks('about')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedPageForBlocks === 'about'
                          ? 'bg-blvn-pink text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ℹ️ О нас
                    </button>
                    <button
                      onClick={() => setSelectedPageForBlocks('delivery')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedPageForBlocks === 'delivery'
                          ? 'bg-blvn-pink text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🚚 Доставка
                    </button>
                    <button
                      onClick={() => setSelectedPageForBlocks('contacts')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedPageForBlocks === 'contacts'
                          ? 'bg-blvn-pink text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📞 Контакты
                    </button>
                    <button
                      onClick={() => setSelectedPageForBlocks('products')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedPageForBlocks === 'products'
                          ? 'bg-blvn-pink text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🛍️ Товары
                    </button>
                    <button
                      onClick={() => setSelectedPageForBlocks('header')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedPageForBlocks === 'header'
                          ? 'bg-blvn-pink text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🔝 Шапка
                    </button>
                    <button
                      onClick={() => setSelectedPageForBlocks('footer')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedPageForBlocks === 'footer'
                          ? 'bg-blvn-pink text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🔻 Подвал
                    </button>
                  </div>
                </div>

                {selectedPageForBlocks === 'products' && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      <strong>ℹ️ Шаблоны блоков для товаров:</strong>
                      Эти блоки будут отображаться на ВСЕХ страницах товаров.
                      Например: описание, характеристики, отзывы, похожие товары.
                    </p>
                  </div>
                )}

                {(selectedPageForBlocks === 'header' || selectedPageForBlocks === 'footer') && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      <strong>ℹ️ {selectedPageForBlocks === 'header' ? 'Шапка' : 'Подвал'} сайта:</strong>
                      Изменения применятся на ВСЕХ страницах сайта автоматически.
                      Редактируйте меню, контакты, логотип и социальные сети.
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {selectedPageForBlocks === 'products'
                      ? 'Блоки для ВСЕХ товаров (шаблон)'
                      : `Блоки страницы: ${getPageName(selectedPageForBlocks)}`}
                  </h2>
                  <button
                    onClick={() => setEditingBlock({
                      block_type: 'text',
                      title: '',
                      content: '',
                      content_json: {},
                      order_index: blocks.length,
                      is_visible: true,
                      page_id: selectedPageForBlocks
                    })}
                    className="px-4 py-2 bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90"
                  >
                    + Добавить блок
                  </button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={(event) => setActiveId(event.active.id as string)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">⋮</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Порядок</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Тип</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Заголовок</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Видимость</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <SortableContext
                          items={blocks.map(b => b.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {blocks.map((block) => (
                            <SortableBlock
                              key={block.id}
                              block={block}
                              onEdit={setEditingBlock}
                              onDelete={handleDeleteBlock}
                              onPreview={handlePreview}
                            />
                          ))}
                        </SortableContext>
                      </tbody>
                    </table>
                  </div>
                </DndContext>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">🌐 Глобальные SEO-настройки сайта</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название сайта</label>
                <input type="text" value={siteSettings.site_name} onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default OG Title</label>
                <input type="text" value={siteSettings.default_og_title || ''} onChange={(e) => setSiteSettings({ ...siteSettings, default_og_title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default OG Description</label>
                <textarea value={siteSettings.default_og_description || ''} onChange={(e) => setSiteSettings({ ...siteSettings, default_og_description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">🔍 Верификация для поисковиков</h3>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Google Search Console</label>
                <input type="text" value={siteSettings.google_verification_code || ''} onChange={(e) => setSiteSettings({ ...siteSettings, google_verification_code: e.target.value })} placeholder="google-site-verification=..." className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yandex Webmaster</label>
                <input type="text" value={siteSettings.yandex_verification_code || ''} onChange={(e) => setSiteSettings({ ...siteSettings, yandex_verification_code: e.target.value })} placeholder="yandex-verification=..." className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">📄 robots.txt</h3>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Содержимое robots.txt</label>
                <textarea value={siteSettings.robots_txt || ''} onChange={(e) => setSiteSettings({ ...siteSettings, robots_txt: e.target.value })} rows={6} className="w-full px-3 py-2 border rounded-lg font-mono text-sm" />
              </div>
            </div>
            <button onClick={handleSaveSiteSettings} className="mt-6 px-6 py-2 bg-blvn-pink text-white rounded-lg hover:bg-blvn-pink/90">💾 Сохранить настройки</button>
          </div>
        )}

        {activeTab === 'styles' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">🎨 Стили страниц</h2>
            <p className="text-gray-600 mb-4">Выберите страницу для редактирования стилей</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['home', 'catalog', 'about', 'delivery', 'contacts'].map(page => (
                <a
                  key={page}
                  href={`/admin/seo/styles?page=${page}`}
                  className="p-4 border rounded-lg hover:border-purple-500 transition"
                >
                  <h3 className="font-bold mb-1">
                    {page === 'home' && '🏠 Главная'}
                    {page === 'catalog' && '📦 Каталог'}
                    {page === 'about' && 'ℹ️ О нас'}
                    {page === 'delivery' && '🚚 Доставка'}
                    {page === 'contacts' && '📞 Контакты'}
                  </h3>
                  <p className="text-sm text-gray-600">Настроить цвета и фон</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {showPreview && previewChanges && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={handleCancelPreview}
          >
            <div
              className="bg-white rounded-3xl p-6 max-w-6xl w-full my-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-nunito font-bold text-2xl text-text-primary">
                    👁️ Live Preview
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Редактируйте блок слева — изменения сразу отображаются справа
                  </p>
                </div>
                <button
                  onClick={handleCancelPreview}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg mb-3">📝 Редактирование</h4>

                  <div>
                    <label className="block text-sm font-medium mb-1">Тип блока</label>
                    <select
                      value={previewChanges.block_type}
                      onChange={(e) => setPreviewChanges({...previewChanges, block_type: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="hero">Hero (Главный баннер)</option>
                      <option value="features">Features (Преимущества)</option>
                      <option value="footer">Footer (Подвал)</option>
                      <option value="catalog">Catalog (Каталог)</option>
                      <option value="text">Text (Простой текст)</option>
                      <option value="cta">CTA (Призыв к действию)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Заголовок</label>
                    <input
                      type="text"
                      value={previewChanges.title || ''}
                      onChange={(e) => setPreviewChanges({...previewChanges, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Введите заголовок"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Основной текст</label>
                    <textarea
                      value={previewChanges.content || ''}
                      onChange={(e) => setPreviewChanges({...previewChanges, content: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Введите текст"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Дополнительные данные (JSON)
                    </label>
                    <textarea
                      value={typeof previewChanges.content_json === 'string' ? previewChanges.content_json : JSON.stringify(previewChanges.content_json || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const json = JSON.parse(e.target.value)
                          setPreviewChanges({...previewChanges, content_json: json})
                        } catch {
                          setPreviewChanges({...previewChanges, content_json: e.target.value})
                        }
                      }}
                      rows={8}
                      className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                      placeholder='{"key": "value"}'
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Валидный JSON для сложных блоков
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="preview_is_visible"
                      checked={previewChanges.is_visible}
                      onChange={(e) => setPreviewChanges({...previewChanges, is_visible: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label htmlFor="preview_is_visible" className="text-sm font-medium">Блок виден на сайте</label>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-3">📱 Как это выглядит на сайте</h4>

                  <div className="bg-gray-50 rounded-xl p-6 overflow-auto max-h-[70vh] border-2 border-gray-200">
                    {previewChanges.block_type === 'hero' && (
                      <div className="py-12 bg-gradient-to-br from-pink-100 to-purple-100 text-center rounded-lg">
                        <h1 className="font-bold text-3xl md:text-4xl mb-4 text-gray-900">
                          {previewChanges.title || 'Заголовок'}
                        </h1>
                        <p className="text-lg mb-6 text-gray-700">{previewChanges.content}</p>
                        {previewChanges.content_json && (
                          <>
                            <p className="mb-6 text-gray-600">{previewChanges.content_json.subtitle}</p>
                            <button className="px-8 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600">
                              {previewChanges.content_json.button_text || 'Кнопка'}
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {previewChanges.block_type === 'features' && (
                      <div className="py-8">
                        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
                          {previewChanges.title || 'Заголовок'}
                        </h2>
                        {previewChanges.content_json && Array.isArray(previewChanges.content_json) && (
                          <div className="grid grid-cols-3 gap-6">
                            {previewChanges.content_json.map((feature: any, idx: number) => (
                              <div key={idx} className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <div className="text-4xl mb-2">{feature.icon}</div>
                                <h3 className="font-bold mb-1 text-gray-900">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {previewChanges.block_type === 'footer' && previewChanges.content_json && (
                      <div className="bg-gray-900 text-white py-8 -mx-6 rounded-lg">
                        <div className="grid grid-cols-3 gap-6 px-6">
                          <div>
                            <h3 className="font-bold text-lg mb-2">blvn.you</h3>
                            <p className="text-gray-400 text-sm">Дофаминовые мелочи для души ✨</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Информация</h4>
                            <ul className="text-sm text-gray-400 space-y-1">
                              {previewChanges.content_json.links?.map((link: any, idx: number) => (
                                <li key={idx}>{link.title}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-sm text-gray-400">
                            <p>{previewChanges.content_json.company_name}</p>
                            <p>УНП: {previewChanges.content_json.unp}</p>
                            <p>{previewChanges.content_json.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewChanges.block_type === 'catalog' && (
                      <div className="py-8">
                        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
                          {previewChanges.title || 'Наши котики'}
                        </h2>
                        <div className="text-center text-gray-500 py-12 bg-white rounded-lg">
                          <p>📦 Здесь будет сетка товаров</p>
                          <p className="text-sm mt-2">(6 карточек товаров)</p>
                        </div>
                      </div>
                    )}

                    {previewChanges.block_type === 'text' && (
                      <div className="py-8 bg-white rounded-lg">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                          {previewChanges.title || 'Заголовок'}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                          {previewChanges.content || 'Текст блока...'}
                        </p>
                      </div>
                    )}

                    {previewChanges.block_type === 'cta' && (
                      <div className="py-12 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">
                          {previewChanges.title || 'Призыв к действию'}
                        </h2>
                        <p className="text-lg mb-6">{previewChanges.content}</p>
                        <button className="px-8 py-3 bg-white text-pink-500 rounded-xl font-semibold">
                          {previewChanges.content_json?.button_text || 'Нажать'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={handleApplyPreview}
                  className="flex-1 py-3 bg-blvn-pink text-white rounded-xl hover:bg-blvn-pink/90 font-semibold transition"
                >
                  💾 Сохранить изменения
                </button>
                <button
                  onClick={handleCancelPreview}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
