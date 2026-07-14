import { NextResponse } from 'next/server'

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

function formatOrderMessage(order: any): string {
  const itemsList = order.items
    .map((item: any) => `• ${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} BYN`)
    .join('\n')

  return `
🎉 НОВЫЙ ЗАКАЗ #${order.id.slice(0, 8).toUpperCase()}

👤 Клиент: ${order.customer_name}
📞 Телефон: ${order.customer_phone}
📦 Доставка: ${order.delivery_service}
📍 Адрес: ${order.delivery_address}

🛍 Товары:
${itemsList}

💰 Итого: ${Number(order.total_amount).toFixed(2)} BYN
  `.trim()
}

export async function POST(request: Request) {
  try {
    const chatIds = process.env.TELEGRAM_CHAT_ID?.split(',').map((id) => id.trim()) || []

    if (!process.env.TELEGRAM_BOT_TOKEN || chatIds.length === 0) {
      console.warn('Telegram credentials not configured')
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 200 })
    }

    const { order } = await request.json()
    const message = formatOrderMessage(order)

    for (const chatId of chatIds) {
      if (!chatId) continue

      try {
        const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        })

        if (!res.ok) {
          const errorData = await res.text()
          console.error(`Telegram API error for ID ${chatId}:`, errorData)
        }
      } catch (error) {
        console.error(`Ошибка отправки в Telegram для ID ${chatId}:`, error)
      }
    }

    return NextResponse.json({ sent: true })
  } catch (error) {
    console.error('Telegram send error:', error)
    return NextResponse.json({ error: 'Failed to send telegram message' }, { status: 500 })
  }
}
