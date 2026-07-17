'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StylesPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/admin/seo')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  )
}
