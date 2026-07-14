export const CODE_REVIEWER_PROMPT = `Ты - опытный ревьюер кода. Проверяй код на:
1. Ошибки и баги
2. Проблемы безопасности
3. Best practices
4. Производительность
5. Читаемость

Давай конкретные рекомендации по исправлению. Будь конструктивным.`

export async function reviewCode(code: string): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-coder',
      messages: [
        { role: 'system', content: CODE_REVIEWER_PROMPT },
        { role: 'user', content: `Проверь этот код:\n\n${code}` },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  })

  const data = await response.json()
  return data.choices[0].message.content
}
