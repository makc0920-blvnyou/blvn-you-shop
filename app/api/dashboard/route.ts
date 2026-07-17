import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const { data: ordersToday } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', today.toISOString())
      .is('is_archived', false)

    const { data: ordersWeek } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', weekAgo.toISOString())
      .is('is_archived', false)

    const { data: ordersMonth } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', monthAgo.toISOString())
      .is('is_archived', false)

    const revenueToday = ordersToday?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    const revenueWeek = ordersWeek?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    const revenueMonth = ordersMonth?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    const popularProducts: Array<{ name: string; count: number }> = []

    const { data: lowStockData } = await supabase
      .from('products')
      .select('name, stock_quantity')
      .lte('stock_quantity', 3)
      .order('stock_quantity', { ascending: true })
      .limit(5)

    return NextResponse.json({
      ordersToday: ordersToday?.length || 0,
      ordersWeek: ordersWeek?.length || 0,
      ordersMonth: ordersMonth?.length || 0,
      revenueToday,
      revenueWeek,
      revenueMonth,
      popularProducts: popularProducts.slice(0, 5),
      lowStockProducts: lowStockData?.map(p => ({
        name: p.name,
        stock: p.stock_quantity
      })) || []
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({
      ordersToday: 0,
      ordersWeek: 0,
      ordersMonth: 0,
      revenueToday: 0,
      revenueWeek: 0,
      revenueMonth: 0,
      popularProducts: [],
      lowStockProducts: []
    })
  }
}
