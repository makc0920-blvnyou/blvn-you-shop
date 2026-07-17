'use client'

import Head from 'next/head'

interface SeoHeadProps {
  title: string
  description?: string
  image?: string
  keywords?: string
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  type?: string
}

export default function SeoHead({
  title,
  description = 'blvn.you — Дофаминовые мелочи для души. Уникальные котики ручной работы из Беларуси.',
  image = '/og-image.jpg',
  keywords = '',
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  type = 'website'
}: SeoHeadProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blvn-you.netlify.app'
  const fullTitle = `${title} | blvn.you`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage || `${siteUrl}${image}`} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={ogTitle || fullTitle} />
      <meta property="twitter:description" content={ogDescription || description} />
      <meta property="twitter:image" content={ogImage || `${siteUrl}${image}`} />
    </Head>
  )
}
