import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const secretKey = process.env.ADMIN_SECRET_KEY || 'blvn-super-secret-key-2024-change-in-production'
const secret = new TextEncoder().encode(secretKey)

export async function POST(request: NextRequest) {
  console.log('\n====== ПОПЫТКА ВХОДА ======')

  try {
    const body = await request.json()
    const { username, password } = body

    console.log('📥 Получены данные:')
    console.log('   Username:', username, `(${username.length} символов)`)
    console.log('   Password:', password, `(${password.length} символов)`)

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD
    const seoUsername = process.env.SEO_MANAGER_USERNAME
    const seoPassword = process.env.SEO_MANAGER_PASSWORD

    console.log('\n📋 Переменные из .env.local:')
    console.log('   ADMIN_USERNAME:', adminUsername || '❌ НЕ ЗАДАНА')
    console.log('   ADMIN_PASSWORD:', adminPassword ? `*** задана (${adminPassword.length} символов) ***` : '❌ НЕ ЗАДАНА')
    console.log('   SEO_MANAGER_USERNAME:', seoUsername || '❌ НЕ ЗАДАНА')
    console.log('   SEO_MANAGER_PASSWORD:', seoPassword ? `*** задана (${seoPassword.length} символов) ***` : '❌ НЕ ЗАДАНА')

    if (!adminUsername || !adminPassword || !seoUsername || !seoPassword) {
      console.log('\n🔴 КРИТИЧЕСКАЯ ОШИБКА: Переменные окружения не заданы!')
      return NextResponse.json(
        {
          error: 'Ошибка конфигурации сервера',
          message: 'Отсутствуют переменные в .env.local'
        },
        { status: 500 }
      )
    }

    console.log('\n📊 СРАВНЕНИЕ:')
    console.log('   Username совпадение (manager):', username === adminUsername ? '✓' : '✗')
    console.log('   Password совпадение (manager):', password === adminPassword ? '✓' : '✗')
    console.log('   Username совпадение (content):', username === seoUsername ? '✓' : '✗')
    console.log('   Password совпадение (content):', password === seoPassword ? '✓' : '✗')
    console.log('   Ожидаемый пароль (manager):', adminPassword, `(${adminPassword.length} символов)`)
    console.log('   Ожидаемый пароль (content):', seoPassword, `(${seoPassword.length} символов)`)

    if (username === adminUsername && password === adminPassword) {
      console.log('\n✅ УСПЕХ: Вход как MANAGER')
      console.log('   Username:', adminUsername)
      console.log('   Пароль совпал:', password === adminPassword)

      const token = await new SignJWT({ role: 'manager' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)

      const response = NextResponse.json({
        success: true,
        role: 'manager',
        message: 'Успешный вход как manager'
      })

      response.cookies.set({
        name: 'blvn_auth',
        value: token,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 86400,
        path: '/'
      })

      console.log('   Cookie установлен')
      console.log('=========================\n')

      return response
    }

    if (username === seoUsername && password === seoPassword) {
      console.log('\n✅ УСПЕХ: Вход как CONTENT')
      console.log('   Username:', seoUsername)
      console.log('   Пароль совпал:', password === seoPassword)

      const token = await new SignJWT({ role: 'content' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)

      const response = NextResponse.json({
        success: true,
        role: 'content',
        message: 'Успешный вход как content'
      })

      response.cookies.set({
        name: 'blvn_auth',
        value: token,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 86400,
        path: '/'
      })

      console.log('   Cookie установлен')
      console.log('=========================\n')

      return response
    }

    console.log('\n❌ НЕВЕРНЫЙ ЛОГИН ИЛИ ПАРОЛЬ')
    console.log('   Предоставлено:')
    console.log('   - Username:', username, `(${username.length} символов)`)
    console.log('   - Password:', password, `(${password.length} символов)`)
    console.log('   Ожидалось для manager:')
    console.log('   - Username:', adminUsername)
    console.log('   - Password:', adminPassword, `(${adminPassword.length} символов)`)
    console.log('   Ожидалось для content:')
    console.log('   - Username:', seoUsername)
    console.log('   - Password:', seoPassword, `(${seoPassword.length} символов)`)
    console.log('=========================\n')

    return NextResponse.json(
      { error: 'Неверный логин или пароль' },
      { status: 401 }
    )

  } catch (error) {
    console.error('\n🔴 КРИТИЧЕСКАЯ ОШИБКА:', error)
    console.log('=========================\n')
    return NextResponse.json(
      { error: 'Ошибка сервера: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
