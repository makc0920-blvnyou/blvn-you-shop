'use client'

interface FeaturesBlockProps {
  block: {
    title?: string
    content?: string
    content_json?: Array<{
      icon?: string
      title?: string
      description?: string
    }>
    background_color?: string
    background_gradient?: string
    text_color?: string
    accent_color?: string
    card_background?: string
    border_color?: string
  }
}

export default function FeaturesBlock({ block }: FeaturesBlockProps) {
  if (!Array.isArray(block.content_json) || block.content_json.length === 0) return null

  const backgroundStyle = block.background_gradient || block.background_color || '#ffffff'
  const textColor = block.text_color || '#1f2937'

  return (
    <section
      className="py-24"
      style={{
        backgroundColor: backgroundStyle,
        color: textColor,
        transition: 'all 0.3s ease'
      }}
    >
      <div className="container-custom px-4">
        {block.title && (
          <h2 className="font-bold text-3xl md:text-4xl text-center mb-16">
            {block.title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {block.content_json.map((feature: any, index: number) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl"
              style={{
                backgroundColor: block.card_background || '#ffffff',
                borderColor: block.border_color || '#e5e7eb',
                borderWidth: 1,
                borderStyle: 'solid'
              }}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="opacity-80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
