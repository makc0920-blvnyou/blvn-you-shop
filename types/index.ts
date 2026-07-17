export interface Product {
  id: string
  name: string
  description: string
  price: number
  price_rub?: number
  image_url: string
  images: string[]
  category: string
  in_stock: boolean
  stock_quantity?: number
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  slug?: string
  image_alt?: string
  og_title?: string
  og_description?: string
  og_image?: string
  canonical_url?: string
  focus_keyword?: string
  schema_markup?: any
  updated_at?: string
  created_at: string
}

export interface CartItem extends Product {
  quantity: number
}

export type DeliveryMethod = 'europochta' | 'cdek' | 'belpochta' | 'pickup' | 'cdek_ru' | 'pochta_ru'

export type PaymentMethod = 'erip' | 'card' | 'transfer' | 'cash'

export interface OrderFormData {
  customerName: string
  customerPhone: string
  deliveryCountry: 'belarus' | 'russia'
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  address: string
  deliveryCost: number
}

export interface Order extends OrderFormData {
  id: string
  created_at: string
  items: CartItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  customerEmail?: string
  telegram_sent?: boolean
}

export interface PageContent {
  id: string
  title: string
  content: string
  meta_title?: string
  meta_description?: string
  og_title?: string
  og_description?: string
  og_image?: string
  robots_meta?: string
  custom_head?: string
  updated_at?: string
}

export interface SiteSeoSettings {
  id: string
  site_name: string
  default_og_title?: string
  default_og_description?: string
  default_og_image?: string
  google_verification_code?: string
  yandex_verification_code?: string
  sitemap_xml?: string
  robots_txt?: string
  updated_at?: string
}

export interface SiteSettings {
  id: string
  exchange_rate_byn_to_rub: number
  updated_at?: string
}

export type AgentType = 'consultant' | 'writer' | 'codeReviewer'

export interface SiteBlock {
  id: string
  block_type: 'hero' | 'features' | 'footer' | 'catalog' | 'story' | 'values' | 'methods' | 'faq' | 'contact_info' | 'text_content' | 'filters' | 'products_grid' | 'custom' | 'text' | 'image' | 'cta'
  title?: string
  content?: string
  content_json?: any
  image_url?: string
  order_index: number
  is_visible: boolean
  page_id: string
  created_at?: string
  updated_at?: string
}
