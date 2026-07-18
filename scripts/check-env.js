// scripts/check-env.js

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'ADMIN_SECRET_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'NEXT_PUBLIC_SITE_URL'
  // Добавь сюда любые другие критически важные переменные, если нужно
];

console.log('🔍 Проверка переменных окружения для Netlify...');

const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Отсутствуют обязательные переменные окружения:');
  missing.forEach((key) => console.error(`  - ${key}`));
  console.error('\n⚠️ Пожалуйста, добавь их в панель управления Netlify:');
  console.error('Site configuration → Environment variables');
  process.exit(1); // Останавливаем сборку с ошибкой
}

console.log('✅ Все обязательные переменные окружения найдены!');
