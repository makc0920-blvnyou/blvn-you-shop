'use client'

interface HeroBlockProps {
  block: {
    title?: string
    content?: string
    content_json?: {
      subtitle?: string
      button_text?: string
      button_link?: string
    }
    background_color?: string
    background_gradient?: string
    text_color?: string
    accent_color?: string
    card_background?: string
    border_color?: string
  }
}

export default function HeroBlock({ block }: HeroBlockProps) {
  const backgroundStyle = block.background_gradient || block.background_color || '#fdf2f8'
  const textColor = block.text_color || '#1f2937'
  const accentColor = block.accent_color || '#ec4899'

  console.log('HeroBlock styles:', {
    background: backgroundStyle,
    text: textColor,
    accent: accentColor
  })

  return (
    <section
      className="py-16 md:py-24"
      style={{
        backgroundColor: backgroundStyle,
        color: textColor,
        transition: 'all 0.3s ease'
      }}
    >
      <div className="container-custom px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {block.title}
          </h1>
          {block.content && (
            <p className="text-lg md:text-xl mb-8 opacity-90">
              {block.content}
            </p>
          )}
          {block.content_json?.subtitle && (
            <p className="text-base md:text-lg mb-8 opacity-80">
              {block.content_json.subtitle}
            </p>
          )}
          {block.content_json?.button_text && (
            <a
              href={block.content_json.button_link || '/catalog'}
              className="inline-block px-8 py-3 rounded-lg font-medium text-white transition hover:scale-105 shadow-lg"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 4px 6px -1px ${accentColor}40`
              }}
            >
              {block.content_json.button_text}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
