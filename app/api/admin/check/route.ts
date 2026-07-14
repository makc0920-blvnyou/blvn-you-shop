import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/admin_token=([^;]+)/)
  const secret = process.env.ADMIN_SECRET_KEY

  if (!match || match[1] !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
