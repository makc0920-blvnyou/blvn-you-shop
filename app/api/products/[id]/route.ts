import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        image_url: body.image_url,
        images: body.images || [],
        category: body.category,
        in_stock: body.in_stock ?? true,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
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
