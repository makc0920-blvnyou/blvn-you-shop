const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

const required = [
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'SEO_MANAGER_USERNAME',
  'SEO_MANAGER_PASSWORD'
]

console.log('🔍 Проверка .env.local...\n')

let allGood = true

required.forEach(varName => {
  const regex = new RegExp(`${varName}=(.+)`)
  const match = envContent.match(regex)

  if (match && match[1].trim()) {
    console.log(`✅ ${varName} задана`)
  } else {
    console.log(`❌ ${varName} ОТСУТСТВУЕТ или пуста!`)
    allGood = false
  }
})

if (!allGood) {
  console.log('\n🔴 КРИТИЧЕСКАЯ ОШИБКА: Не все переменные заданы!')
  console.log('📄 Отредактируйте файл .env.local')
  process.exit(1)
} else {
  console.log('\n✅ Все переменные окружения корректны!')
}
