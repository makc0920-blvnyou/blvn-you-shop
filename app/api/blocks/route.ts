import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('page') || 'home'

    console.log('Fetching blocks for page:', pageId)

    const { data, error } = await supabase
      .from('site_blocks')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_visible', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching blocks:', error)
      return NextResponse.json([], { status: 200 })
    }

    console.log('Fetched blocks:', data)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating block:', body)

    const { data, error } = await supabase
      .from('site_blocks')
      .insert({
        block_type: body.block_type,
        title: body.title || null,
        content: body.content || null,
        content_json: body.content_json || null,
        image_url: body.image_url || null,
        order_index: body.order_index || 0,
        is_visible: body.is_visible !== false,
        page_id: body.page_id || 'home'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating block:', error)
      throw error
    }

    console.log('Block created:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/blocks:', error)
    return NextResponse.json(
      { error: 'Failed to create block', details: error },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    console.log('🔧 Updating block:', id)
    console.log('📦 Raw data:', updateData)

    if (!id) {
      return NextResponse.json({ error: 'Block ID is required' }, { status: 400 })
    }

    // 1. БЕЗОПАСНАЯ обработка content_json
    let finalContentJson: any = {}
    
    if (updateData.content_json !== undefined && updateData.content_json !== null) {
      if (typeof updateData.content_json === 'string') {
        // Если это строка, пробуем распарсить
        if (updateData.content_json.trim() === '') {
          // Пустая строка -> пустой объект
          finalContentJson = {}
        } else {
          try {
            finalContentJson = JSON.parse(updateData.content_json)
          } catch (e) {
            console.warn('⚠️ Не удалось распарсить JSON строку, используем пустой объект')
            console.log('Invalid JSON string:', updateData.content_json)
            finalContentJson = {}
          }
        }
      } else if (typeof updateData.content_json === 'object') {
        // Если это уже объект, используем как есть
        finalContentJson = updateData.content_json
      } else {
        // Любой другой случай -> пустой объект
        finalContentJson = {}
      }
    }

    // 2. Гарантируем что style существует
    if (!finalContentJson.style || typeof finalContentJson.style !== 'object') {
      finalContentJson.style = {}
    }

    console.log('✅ Final content_json:', finalContentJson)

    // 3. Подготавливаем данные для обновления
    const updatePayload: any = {
      updated_at: new Date().toISOString()
    }

    // Добавляем только существующие поля
    if (updateData.block_type) updatePayload.block_type = updateData.block_type
    if (updateData.title !== undefined) updatePayload.title = updateData.title
    if (updateData.content !== undefined) updatePayload.content = updateData.content
    updatePayload.content_json = finalContentJson
    if (updateData.image_url !== undefined) updatePayload.image_url = updateData.image_url
    if (updateData.order_index !== undefined) updatePayload.order_index = updateData.order_index
    if (updateData.page_id) updatePayload.page_id = updateData.page_id
    if (updateData.is_visible !== undefined) updatePayload.is_visible = updateData.is_visible

    console.log(' Updating with payload:', updatePayload)

    // 4. Обновляем в базе
    const { data, error } = await supabase
      .from('site_blocks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Block updated successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error in PUT /api/blocks:', error)
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Block ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('site_blocks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting block:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/blocks:', error)
    return NextResponse.json(
      { error: 'Failed to delete block', details: error },
      { status: 500 }
    )
  }
}
