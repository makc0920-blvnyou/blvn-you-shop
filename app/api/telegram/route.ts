import { NextResponse } from 'next/server'

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

const getDeliveryMethodName = (method: string) => {
  const methods: Record<string, string> = {
    europochta: 'Европочта (3-5 дней)',
    cdek: 'СДЭК (3-7 дней)',
    belpochta: 'Белпочта (5-10 дней)',
    pickup: 'Самовывоз (Брест)',
    cdek_ru: 'СДЭК Россия (7-14 дней)',
    pochta_ru: 'Почта России (10-20 дней)',
  }
  return methods[method] || method
}

const getPaymentMethodName = (method: string) => {
  const methods: Record<string, string> = {
    erip: 'ЕРИП',
    card: 'Картой онлайн',
    transfer: 'Банковский перевод',
    cash: 'Наличные при получении',
  }
  return methods[method] || method
}

const getCountryName = (country: string) => {
  return country === 'belarus' ? '🇧🇾 Беларусь' : '🇷🇺 Россия'
}

function formatOrderMessage(order: any): string {
  const orderNumber = typeof order.id === 'string' ? order.id.slice(0, 8).toUpperCase() : Date.now().toString().slice(-6)
  const itemsList = order.items
    .map((item: any) => `  • ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} BYN`)
    .join('\n')

  return `
🛍️ <b>НОВЫЙ ЗАКАЗ #${orderNumber}</b>

👤 <b>Покупатель:</b> ${order.customer_name || order.customerName}
📞 <b>Телефон:</b> ${order.customer_phone || order.customerPhone}
📧 <b>Email:</b> ${order.customer_email || order.customerEmail || 'не указан'}

🌍 <b>Страна:</b> ${getCountryName(order.delivery_country || order.deliveryCountry)}
📦 <b>Доставка:</b> ${getDeliveryMethodName(order.delivery_method || order.deliveryMethod)}
${(order.delivery_method || order.deliveryMethod) !== 'pickup' ? `📍 <b>Адрес:</b> ${order.address}` : '🏪 <b>Самовывоз</b> (Брест)'}

💳 <b>Оплата:</b> ${getPaymentMethodName(order.payment_method || order.paymentMethod)}

🛍 <b>Товары:</b>
${itemsList}

💰 <b>Итого:</b> ${Number(order.total_amount || order.totalAmount).toFixed(2)} BYN
${(order.delivery_cost || order.deliveryCost) > 0 ? `(включая доставку ${Number(order.delivery_cost || order.deliveryCost).toFixed(2)} BYN)` : '⚠️ Доставка рассчитывается индивидуально'}

${order.notes ? `📝 <b>Комментарий:</b> ${order.notes}\n` : ''}
📅 <b>Дата:</b> ${new Date().toLocaleString('ru-BY')}
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
