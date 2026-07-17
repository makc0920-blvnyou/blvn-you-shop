import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('page')

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('page_styles')
      .select('*')
      .eq('page_id', pageId)
      .single()

    if (error) {
      return NextResponse.json({
        page_id: pageId,
        background_color: '#ffffff',
        background_gradient: null,
        text_color: '#1f2937',
        accent_color: '#ec4899',
        card_background: '#ffffff',
        border_color: '#e5e7eb'
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching page styles:', error)
    return NextResponse.json({ error: 'Failed to fetch styles' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { page_id, background_color, background_gradient, text_color, accent_color, card_background, border_color } = body

    if (!page_id) {
      return NextResponse.json({ error: 'Page ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('page_styles')
      .upsert({
        page_id,
        background_color: background_color || '#ffffff',
        background_gradient: background_gradient || null,
        text_color: text_color || '#1f2937',
        accent_color: accent_color || '#ec4899',
        card_background: card_background || '#ffffff',
        border_color: border_color || '#e5e7eb',
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error saving page styles:', error)
    return NextResponse.json({ error: 'Failed to save styles' }, { status: 500 })
  }
}
