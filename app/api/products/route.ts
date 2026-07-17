import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  let query = supabase
    .from('products')
    .select('*')

  if (slug) {
    query = query.eq('slug', slug)
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  if (!body.id) {
    body.id = crypto.randomUUID()
  }
  
  const { data: product, error } = await supabase
    .from('products')
    .insert(body)
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Автоматически создаём блоки для товара
  const { error: blocksError } = await supabase
    .from('site_blocks')
    .insert([
      {
        block_type: 'product_description',
        title: 'Описание',
        content: body.description || '',
        content_json: {},
        order_index: 1,
        page_id: `product_${product.id}`,
        is_visible: true
      },
      {
        block_type: 'product_characteristics',
        title: 'Характеристики',
        content: null,
        content_json: body.characteristics || {},
        order_index: 2,
        page_id: `product_${product.id}`,
        is_visible: true
      }
    ])

  if (blocksError) {
    console.error('Error creating product blocks:', blocksError)
  }

  return NextResponse.json(product)
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()

  delete body.id

  const { data, error } = await supabase
    .from('products')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
