const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

async function checkServer() {
  try {
    const response = await fetch(BASE_URL, { method: 'HEAD', timeout: 3000 })
    return response.ok || response.status === 500
  } catch {
    return false
  }
}

async function runTests() {
  console.log(`${colors.bold}🐱 Тестирование сайта blvn.you${colors.reset}`)
  console.log(`Цель: ${BASE_URL}\n`)

  console.log(`${colors.blue}🔄 Проверка запуска сервера...${colors.reset}`)
  const isServerRunning = await checkServer()

  if (!isServerRunning) {
    console.log(`\n${colors.yellow}⚠️  ВНИМАНИЕ: Сервер не отвечает!${colors.reset}`)
    console.log(`${colors.yellow}   Пожалуйста, запустите 'npm run dev' в другом окне терминала,${colors.reset}`)
    console.log(`${colors.yellow}   а затем снова выполните 'npm test'.${colors.reset}\n`)
    process.exit(1)
  }
  console.log(`${colors.green}✅ Сервер работает! Начинаем проверку...${colors.reset}\n`)

  let passed = 0
  let failed = 0
  let productsLoaded = false

  console.log(`${colors.bold}📄 1. Доступность страниц:${colors.reset}`)
  const pages = [
    { path: '/', name: 'Главная' },
    { path: '/catalog', name: 'Каталог' },
    { path: '/cart', name: 'Корзина' },
  ]

  for (const page of pages) {
    try {
      const res = await fetch(`${BASE_URL}${page.path}`)
      if (res.ok) {
        console.log(`  ${colors.green}✅${colors.reset} ${page.name}`)
        passed++
      } else {
        console.log(`  ${colors.red}❌${colors.reset} ${page.name} (Статус: ${res.status})`)
        failed++
      }
    } catch {
      console.log(`  ${colors.red}❌${colors.reset} ${page.name} (Ошибка сети)`)
      failed++
    }
  }

  console.log(`\n${colors.bold}🔌 2. API Endpoints:${colors.reset}`)
  try {
    const res = await fetch(`${BASE_URL}/api/products`)
    if (res.ok) {
      const data = await res.json()
      productsLoaded = true
      console.log(`  ${colors.green}✅${colors.reset} Товары загружены (${data.length} шт.)`)
      passed++
    } else {
      console.log(`  ${colors.red}❌${colors.reset} API товаров (Статус: ${res.status})`)
      failed++
    }
  } catch {
    console.log(`  ${colors.red}❌${colors.reset} API товаров (Ошибка сети)`)
    failed++
  }

  console.log(`\n${colors.bold}🤖 3. Чат-бот:${colors.reset}`)
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Привет' }] }),
    })
    if (res.ok) {
      console.log(`  ${colors.green}✅${colors.reset} Чат-бот отвечает`)
      passed++
    } else {
      console.log(`  ${colors.red}❌${colors.reset} Чат-бот (Статус: ${res.status})`)
      failed++
    }
  } catch {
    console.log(`  ${colors.red}❌${colors.reset} Чат-бот (Ошибка сети)`)
    failed++
  }

  console.log(`\n${colors.bold}🗄️ 4. База данных (Supabase):${colors.reset}`)
  if (productsLoaded) {
    console.log(`  ${colors.green}✅${colors.reset} Подключение к БД работает (товары загружены)`)
    passed++
  } else {
    console.log(`  ${colors.red}❌${colors.reset} Не удалось загрузить товары — проверьте Supabase`)
    failed++
  }

  console.log(`\n${colors.bold}${'='.repeat(40)}`)
  console.log(`${colors.bold}📊 ИТОГОВЫЙ ОТЧЁТ${colors.reset}`)
  console.log(`${'='.repeat(40)}${colors.reset}`)

  if (failed === 0) {
    console.log(`\n${colors.green}🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! Сайт работает отлично! 🐱${colors.reset}\n`)
  } else {
    console.log(`\n${colors.red}⚠️ Найдено ошибок: ${failed}. Проверьте терминал сервера (npm run dev) на наличие красных строк.${colors.reset}\n`)
  }

  process.exit(failed > 0 ? 1 : 0)
}

runTests()
