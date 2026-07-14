import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const secret = process.env.ADMIN_SECRET_KEY

    if (!secret) {
      return NextResponse.json({ error: 'ADMIN_SECRET_KEY not configured' }, { status: 500 })
    }

    if (password !== secret) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
