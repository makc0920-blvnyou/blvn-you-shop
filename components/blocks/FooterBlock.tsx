'use client'

import BlockStyleWrapper from '@/components/BlockStyleWrapper'

interface FooterBlockProps {
  block: {
    title?: string
    content?: string
    content_json?: {
      links?: Array<{ title?: string; url?: string }>
      company_name?: string
      unp?: string
      address?: string
      phone?: string
      email?: string
      work_hours?: string
    }
    background_color?: string
    background_gradient?: string
    text_color?: string
    accent_color?: string
    card_background?: string
    border_color?: string
  }
}

export default function FooterBlock({ block }: FooterBlockProps) {
  if (!block.content_json) return null

  const blockStyles = {
    background_color: block.background_color,
    background_gradient: block.background_gradient,
    text_color: block.text_color,
    accent_color: block.accent_color,
    card_background: block.card_background,
    border_color: block.border_color
  }

  return (
    <BlockStyleWrapper styles={blockStyles} className="py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">blvn.you</h3>
            <p className="opacity-70">Дофаминовые мелочи для души ✨</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Информация</h4>
            <ul className="space-y-2">
              {block.content_json.links?.map((link: any, index: number) => (
                <li key={index}>
                  <a href={link.url} className="opacity-70 hover:opacity-100 transition">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Реквизиты ИП</h4>
            <div className="text-sm opacity-70 space-y-1">
              <p>{block.content_json.company_name}</p>
              <p>УНП: {block.content_json.unp}</p>
              <p>Юр. адрес: {block.content_json.address}</p>
              <p>{block.content_json.phone} | {block.content_json.email}</p>
              <p>Режим работы: {block.content_json.work_hours}</p>
            </div>
          </div>
        </div>
      </div>
    </BlockStyleWrapper>
  )
}
