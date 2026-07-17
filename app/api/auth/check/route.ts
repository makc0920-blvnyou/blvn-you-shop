import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const secretKey = process.env.ADMIN_SECRET_KEY || 'blvn-super-secret-key-2024-change-in-production'
const secret = new TextEncoder().encode(secretKey)

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('blvn_auth')?.value

    console.log('🔍 /api/auth/check: token найден?', !!token)

    if (!token) {
      return NextResponse.json({ authenticated: false, role: null }, { status: 401 })
    }

    try {
      const { payload } = await jwtVerify(token, secret)

      console.log('✅ Токен валиден, роль:', payload.role)
      return NextResponse.json({
        authenticated: true,
        role: payload.role
      })
    } catch {
      console.error('❌ Токен невалиден')
      const response = NextResponse.json({ authenticated: false, role: null }, { status: 401 })
      response.cookies.delete('blvn_auth')
      return response
    }
  } catch (error) {
    console.error('❌ Критическая ошибка в /api/auth/check:', error)
    return NextResponse.json({ authenticated: false, role: null }, { status: 500 })
  }
}
