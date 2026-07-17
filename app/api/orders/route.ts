import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

function getField(body: any, ...keys: string[]) {
  for (const key of keys) {
    if (body[key] !== undefined) return body[key]
  }
  return undefined
}

function buildFallbackOrder(body: any) {
  return {
    id: crypto.randomUUID(),
    customer_name: getField(body, 'customer_name', 'customerName'),
    customer_phone: getField(body, 'customer_phone', 'customerPhone'),
    customer_email: getField(body, 'customer_email', 'customerEmail'),
    delivery_country: getField(body, 'delivery_country', 'deliveryCountry'),
    delivery_method: getField(body, 'delivery_method', 'deliveryMethod'),
    payment_method: getField(body, 'payment_method', 'paymentMethod'),
    address: getField(body, 'address'),
    items: getField(body, 'items'),
    delivery_cost: getField(body, 'delivery_cost', 'deliveryCost') || 0,
    total_amount: getField(body, 'total_amount', 'totalAmount'),
    notes: getField(body, 'notes'),
    status: 'pending' as const,
    created_at: new Date().toISOString(),
  }
}

function notifyTelegram(order: any) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  fetch(`${siteUrl}/api/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  }).catch((err) => console.error('Telegram notification failed:', err))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showArchived = searchParams.get('archived') === 'true'

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json([])

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!showArchived) {
      query = query.eq('is_archived', false)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const customerName = getField(body, 'customer_name', 'customerName')
    const customerPhone = getField(body, 'customer_phone', 'customerPhone')
    const customerEmail = getField(body, 'customer_email', 'customerEmail')
    const deliveryCountry = getField(body, 'delivery_country', 'deliveryCountry')
    const deliveryMethod = getField(body, 'delivery_method', 'deliveryMethod')
    const paymentMethod = getField(body, 'payment_method', 'paymentMethod')
    const deliveryCost = getField(body, 'delivery_cost', 'deliveryCost') || 0
    const totalAmount = getField(body, 'total_amount', 'totalAmount')

    if (!customerName || !customerPhone || !customerEmail || !deliveryCountry || !deliveryMethod || !paymentMethod) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 })
    }

    if (deliveryMethod !== 'pickup' && !body.address) {
      return NextResponse.json({ error: 'Укажите адрес доставки' }, { status: 400 })
    }

    const supabase = getSupabase()

    const notes = getField(body, 'notes', 'comment')
    const orderPayload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      delivery_country: deliveryCountry,
      delivery_method: deliveryMethod,
      payment_method: paymentMethod,
      address: deliveryMethod === 'pickup' ? '' : body.address,
      items: body.items,
      delivery_cost: deliveryCost,
      total_amount: totalAmount,
      notes,
      status: 'pending',
    }

    if (!supabase) {
      const fallback = buildFallbackOrder(body)
      notifyTelegram(fallback)
      return NextResponse.json(fallback, { status: 201 })
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single()

    if (error) {
      if (error.code === '42501') {
        const fallback = buildFallbackOrder(body)
        notifyTelegram(fallback)
        return NextResponse.json(fallback, { status: 201 })
      }
      throw error
    }

    notifyTelegram(data)

    const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
    const chatIds = process.env.TELEGRAM_CHAT_ID?.split(',').map((id: string) => id.trim()) || []

    for (const item of body.items || []) {
      const { data: productData } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', item.id)
        .single()

      if (productData) {
        const newQty = Math.max(0, (productData.stock_quantity || 0) - item.quantity)

        await supabase
          .from('products')
          .update({ stock_quantity: newQty, in_stock: newQty > 0 })
          .eq('id', item.id)

        if (newQty <= 3 && newQty > 0) {
          for (const chatId of chatIds) {
            fetch(`${TELEGRAM_API}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: `⚠️ <b>Заканчивается товар!</b>\n\n📦 ${productData.name}\nОсталось: ${newQty} шт.\n\nПополните запас!`,
                parse_mode: 'HTML',
              }),
            }).catch(() => {})
          }
        } else if (newQty === 0) {
          for (const chatId of chatIds) {
            fetch(`${TELEGRAM_API}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: `🚨 <b>Товар закончился!</b>\n\n📦 ${productData.name}\n\nСрочно пополните запас!`,
                parse_mode: 'HTML',
              }),
            }).catch(() => {})
          }
        }
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({
      error: error?.message || 'Failed to create order',
      hint: 'Убедитесь что таблица orders создана в Supabase и RLS отключен или добавлена политика на вставку.',
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    if (action === 'archive') {
      const { data, error } = await supabase
        .from('orders')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log(`✅ Заказ ${id} архивирован`)
      return NextResponse.json(data)
    }

    if (action === 'unarchive') {
      const { data, error } = await supabase
        .from('orders')
        .update({
          is_archived: false,
          archived_at: null
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log(`✅ Заказ ${id} разархивирован`)
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
