// scripts/check-env.js
const fs = require('fs')
const path = require('path')

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'ADMIN_SECRET_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'NEXT_PUBLIC_SITE_URL'
]

// Try loading .env.local for local dev (Netlify injects vars natively)
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach((l) => {
    const [k, ...r] = l.split('=')
    if (k && r.length && !process.env[k.trim()]) {
      process.env[k.trim()] = r.join('=').trim().replace(/^["']|["']$/g, '')
    }
  })
}

console.log('🔍 Проверка переменных окружения...')

const missing = requiredEnvVars.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error('❌ Отсутствуют обязательные переменные окружения:')
  missing.forEach((key) => console.error(`  - ${key}`))
  console.error('\n⚠️ Добавь их в .env.local (локально) или в панель Netlify:')
  console.error('Site configuration → Environment variables')
  process.exit(1)
}

console.log('✅ Все обязательные переменные окружения найдены!')
