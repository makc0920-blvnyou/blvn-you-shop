export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const secretKey = process.env.ADMIN_SECRET_KEY
const secret = new TextEncoder().encode(secretKey)

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('blvn_auth')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false, role: null }, { status: 401 })
    }

    try {
      const { payload } = await jwtVerify(token, secret)
      return NextResponse.json({ authenticated: true, role: payload.role })
    } catch {
      const response = NextResponse.json({ authenticated: false, role: null }, { status: 401 })
      response.cookies.delete('blvn_auth')
      return response
    }
  } catch {
    return NextResponse.json({ authenticated: false, role: null }, { status: 500 })
  }
}
