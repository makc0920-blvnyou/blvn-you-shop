import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.ADMIN_SECRET_KEY || 'blvn-super-secret-key-2024-change-in-production'
const secret = new TextEncoder().encode(secretKey)

const protectedRoutes = [
  '/admin/manager',
  '/admin/content',
  '/admin/products',
  '/admin/orders',
  '/admin/settings',
  '/admin/seo'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const cookieName = 'blvn_auth'
  const cookie = request.cookies.get(cookieName)

  console.log('🔍 Middleware check:', {
    pathname,
    hasCookie: !!cookie,
    cookieValue: cookie?.value?.substring(0, 20) + '...'
  })

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !cookie) {
    console.log('❌ Нет cookie, редирект на login')
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (cookie && isProtectedRoute) {
    try {
      const { payload } = await jwtVerify(cookie.value, secret)

      console.log('✅ Cookie валидна, роль:', payload.role)

      if (pathname.startsWith('/admin/manager') && payload.role !== 'manager') {
        return NextResponse.redirect(new URL('/admin/content', request.url))
      }

      if (pathname.startsWith('/admin/orders') && payload.role !== 'manager') {
        return NextResponse.redirect(new URL('/admin/content', request.url))
      }

      if (pathname.startsWith('/admin/products') && payload.role !== 'manager') {
        return NextResponse.redirect(new URL('/admin/content', request.url))
      }

      if (pathname.startsWith('/admin/settings') && payload.role !== 'manager') {
        return NextResponse.redirect(new URL('/admin/content', request.url))
      }

      if (pathname.startsWith('/admin/seo') &&
          payload.role !== 'manager' &&
          payload.role !== 'content') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-role', payload.role as string)

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
    } catch (error) {
      console.error('❌ Cookie невалидна:', error)
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete(cookieName)
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
