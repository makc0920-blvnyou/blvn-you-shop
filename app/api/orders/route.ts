import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

function buildFallbackOrder(body: any) {
  return {
    id: crypto.randomUUID(),
    customer_name: body.customerName,
    customer_phone: body.customerPhone,
    delivery_service: body.deliveryService,
    delivery_address: body.deliveryAddress,
    items: body.items,
    total_amount: body.totalAmount,
    status: 'new' as const,
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = getSupabase()

    if (!supabase) {
      const fallback = buildFallbackOrder(body)
      notifyTelegram(fallback)
      return NextResponse.json(fallback, { status: 201 })
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_name: body.customerName,
        customer_phone: body.customerPhone,
        delivery_service: body.deliveryService,
        delivery_address: body.deliveryAddress,
        delivery_details: body.deliveryDetails,
        items: body.items,
        total_amount: body.totalAmount,
        status: 'new',
        telegram_sent: false,
      })
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
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({
      error: error?.message || 'Failed to create order',
      hint: 'Убедитесь что таблица orders создана в Supabase и RLS отключен или добавлена политика на вставку.',
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json([])

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
