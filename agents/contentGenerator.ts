import { WRITER_PROMPT } from './consultant'

export async function generateProductDescription(
  productName: string,
  category: string,
  features: string[]
): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: WRITER_PROMPT },
        {
          role: 'user',
          content: `Создай описание для товара:
Название: ${productName}
Категория: ${category}
Особенности: ${features.join(', ')}

Напиши 2-3 предложения.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    }),
  })

  const data = await response.json()
  return data.choices[0].message.content
}
