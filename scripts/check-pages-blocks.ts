const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const e = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')
e.split('\n').forEach((l: string) => {
  const [k, ...r] = l.split('=')
  if (k && r.length) process.env[k.trim()] = r.join('=').trim().replace(/^["']|["']$/g, '')
})

const sup = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function main() {
  const { data, error } = await sup
    .from('site_blocks')
    .select('id, block_type, page_id, is_visible, title, content, content_json')
    .in('page_id', ['catalog', 'delivery', 'contacts', 'about'])
    .order('page_id')
    .order('order_index')

  if (error) { console.log('ERR:', error.message); return }

  const grouped: Record<string, any[]> = {}
  for (const row of data) {
    if (!grouped[row.page_id]) grouped[row.page_id] = []
    grouped[row.page_id].push(row)
  }

  for (const [page, blocks] of Object.entries(grouped)) {
    console.log(`\n=== ${page} ===`)
    for (const b of blocks) {
      const cj = typeof b.content_json === 'string' ? '(string)' : JSON.stringify(b.content_json)
      console.log(`  ${b.block_type} | visible:${b.is_visible} | title:${b.title} | content_json:${cj.substring(0, 80)}`)
    }
  }
}

main()
