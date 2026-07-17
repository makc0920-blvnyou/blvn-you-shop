import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await request.json()
    const stockQuantity = body.stock_quantity ?? 0
    const characteristics = body.characteristics

    const { data, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        price_rub: body.price_rub || Math.round(body.price * (body.exchangeRate || 28)),
        image_url: body.image_url,
        images: body.images || [],
        category: body.category,
        in_stock: stockQuantity > 0,
        stock_quantity: stockQuantity,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        meta_keywords: body.meta_keywords,
        slug: body.slug,
        image_alt: body.image_alt,
        og_title: body.og_title,
        og_description: body.og_description,
        og_image: body.og_image,
        canonical_url: body.canonical_url,
        focus_keyword: body.focus_keyword,
        characteristics,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Обновляем блок характеристик в site_blocks
    if (characteristics !== undefined) {
      await supabase
        .from('site_blocks')
        .update({
          content_json: characteristics,
          updated_at: new Date().toISOString()
        })
        .eq('page_id', `product_${params.id}`)
        .eq('block_type', 'product_characteristics')
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { data: product } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', params.id)
      .single()

    if (product?.image_url) {
      const fileName = product.image_url.split('/').pop()
      if (fileName) {
        await supabase.storage.from('products').remove([fileName])
      }
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Product delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
