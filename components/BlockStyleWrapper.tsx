'use client'

interface BlockStyleWrapperProps {
  styles: {
    background_color?: string
    background_gradient?: string | null
    text_color?: string
    accent_color?: string
    card_background?: string
    border_color?: string
  }
  children: React.ReactNode
  className?: string
}

export default function BlockStyleWrapper({
  styles,
  children,
  className = ''
}: BlockStyleWrapperProps) {
  const backgroundStyle = styles.background_gradient || styles.background_color || '#ffffff'

  return (
    <div
      className={className}
      style={{
        backgroundColor: backgroundStyle,
        color: styles.text_color || '#1f2937',
        transition: 'all 0.3s ease'
      }}
    >
      <style jsx>{`
        div {
          --block-accent: ${styles.accent_color || '#ec4899'};
          --block-card-bg: ${styles.card_background || '#ffffff'};
          --block-border: ${styles.border_color || '#e5e7eb'};
        }

        div button {
          transition: all 0.2s ease;
        }

        div button:hover {
          transform: translateY(-1px);
        }

        div a {
          color: var(--block-accent);
        }
      `}</style>
      {children}
    </div>
  )
}
