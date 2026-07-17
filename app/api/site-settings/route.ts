import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_seo_settings')
      .select('*')
      .eq('id', 'global')
      .single()

    if (error) {
      console.error('Error fetching site settings:', error)
      return NextResponse.json({}, { status: 200 })
    }

    return NextResponse.json(data || {})
  } catch (error) {
    console.error('Error in GET /api/site-settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Updating site settings:', body)

    const { data, error } = await supabase
      .from('site_seo_settings')
      .upsert({
        id: 'global',
        site_name: body.site_name || 'blvn.you',
        default_og_title: body.default_og_title || '',
        default_og_description: body.default_og_description || '',
        default_og_image: body.default_og_image || '',
        google_verification_code: body.google_verification_code || '',
        yandex_verification_code: body.yandex_verification_code || '',
        sitemap_xml: body.sitemap_xml || '',
        robots_txt: body.robots_txt || '',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving site settings:', error)
      throw error
    }

    console.log('Site settings saved:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/site-settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings', details: error },
      { status: 500 }
    )
  }
}
