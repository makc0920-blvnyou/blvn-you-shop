import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const secretKey = process.env.ADMIN_SECRET_KEY
const secret = new TextEncoder().encode(secretKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD
    const seoUsername = process.env.SEO_MANAGER_USERNAME
    const seoPassword = process.env.SEO_MANAGER_PASSWORD

    if (!adminUsername || !adminPassword || !seoUsername || !seoPassword) {
      return NextResponse.json({ error: 'Ошибка конфигурации сервера' }, { status: 500 })
    }

    if (username === adminUsername && password === adminPassword) {
      const token = await new SignJWT({ role: 'manager' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)

      const response = NextResponse.json({ success: true, role: 'manager' })
      response.cookies.set({
        name: 'blvn_auth',
        value: token,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 86400,
        path: '/'
      })
      return response
    }

    if (username === seoUsername && password === seoPassword) {
      const token = await new SignJWT({ role: 'content' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)

      const response = NextResponse.json({ success: true, role: 'content' })
      response.cookies.set({
        name: 'blvn_auth',
        value: token,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 86400,
        path: '/'
      })
      return response
    }

    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
