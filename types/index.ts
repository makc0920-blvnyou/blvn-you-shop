export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  images: string[]
  category: string
  in_stock: boolean
  created_at: string
}

export interface CartItem extends Product {
  quantity: number
}

export type DeliveryService = 'evropochta' | 'cdek' | 'belpost'

export interface DeliveryDetails {
  city?: string
  officeNumber?: string
  address?: string
  index?: string
  pickupPoint?: string
}

export interface OrderFormData {
  customerName: string
  customerPhone: string
  deliveryService: DeliveryService
  deliveryAddress: string
  deliveryDetails: DeliveryDetails
}

export interface Order extends OrderFormData {
  id: string
  created_at: string
  items: CartItem[]
  total_amount: number
  status: 'new' | 'confirmed' | 'shipped' | 'delivered'
  telegram_sent: boolean
}

export type AgentType = 'consultant' | 'writer' | 'codeReviewer'
