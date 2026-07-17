import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .order('id')

    if (error) {
      console.error('Error fetching pages:', error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      title,
      content,
      meta_title,
      meta_description,
      og_title,
      og_description,
      og_image,
      robots_meta,
      custom_head
    } = body

    console.log('Updating page:', id, body)

    const { data: existing } = await supabase
      .from('page_content')
      .select('id')
      .eq('id', id)
      .single()

    let data
    let error

    if (existing) {
      const result = await supabase
        .from('page_content')
        .update({
          title,
          content,
          meta_title: meta_title || null,
          meta_description: meta_description || null,
          og_title: og_title || null,
          og_description: og_description || null,
          og_image: og_image || null,
          robots_meta: robots_meta || 'index, follow',
          custom_head: custom_head || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      data = result.data
      error = result.error
    } else {
      const result = await supabase
        .from('page_content')
        .insert({
          id,
          title,
          content,
          meta_title: meta_title || null,
          meta_description: meta_description || null,
          og_title: og_title || null,
          og_description: og_description || null,
          og_image: og_image || null,
          robots_meta: robots_meta || 'index, follow',
          custom_head: custom_head || null,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Error saving page:', error)
      throw error
    }

    console.log('Page saved successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/pages:', error)
    return NextResponse.json(
      { error: 'Failed to save page', details: error },
      { status: 500 }
    )
  }
}
